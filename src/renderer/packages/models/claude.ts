import Base, { onResultChange } from './base'
import { Message, ModelSettings } from '../../../shared/types'
import { ApiError, NetworkError, BaseError } from './errors'
import Anthropic from '@anthropic-ai/sdk'
import { performSearch, browse } from '../tools/index'
import * as atoms from '../../stores/atoms'
import { getDefaultStore } from 'jotai'
import * as defaults from '../../../shared/defaults'
import * as settingActions from '@/stores/settingActions'

export const claudeModelConfigs = {
    'claude-3-opus-20240229': { maxTokens: 4096 },
    'claude-3-sonnet-20240229': { maxTokens: 4096 },
    'claude-3-haiku-20240307': { maxTokens: 4096 },
    'claude-3-5-haiku-latest': { maxTokens: 8192 },
    'claude-3-5-sonnet-latest': { maxTokens: 8192 },
} as const

export type Model = keyof typeof claudeModelConfigs
export const models = Object.keys(claudeModelConfigs).sort() as Model[]

export default class Claude extends Base {
    private client: Anthropic
    private model: string
    private temperature: number
    private maxTokens: number
    private defaultPrompt: string
    private tool_list: Anthropic.Tool[] = []
    private toolCallCount: number = 0 // 新增计数器
    private maxToolCallCounts: number = 3 // 设置最大调用次数
    constructor(settings: ModelSettings) {
        super()
        this.client = new Anthropic({
            apiKey: settings.claudeApiKey,
            dangerouslyAllowBrowser: true,
            baseURL: settings.claudeApiHost || 'https://api.anthropic.com',
        })
        this.model = settings.claudeModel
        this.temperature = settings.temperature
        this.maxTokens = claudeModelConfigs[settings.claudeModel as Model].maxTokens
        const store = getDefaultStore()
        this.defaultPrompt = store.get(atoms.settingsAtom).defaultPrompt || defaults.getDefaultPrompt()
        const searchTag = settingActions.getSearchSwitch()
        if (searchTag) {
            this.tool_list = [
                {
                    name: 'search',
                    description: 'Search the internet for current information.',
                    input_schema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'The search query',
                            },
                            category:{
                                type: 'string',
                                enum: [ // Added enum to specify allowed values
                                    'company',
                                    'research paper',
                                    'news article',
                                    'linkedin profile',
                                    'github',
                                    'tweet',
                                    'movie',
                                    'song',
                                    'personal site',
                                    'pdf',
                                    'financial report'
                                ],
                                description:'A data category to focus on, with higher comprehensivity and data cleanliness.'
                            },
                            includeDomains:{
                                type:'array',
                                items:{
                                    type:'string'
                                },
                                description:'List of domains to include in the search. If specified, results will only come from these domains.'
                            },
                            excludeDomains:{
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                description:'List of domains to exclude in the search. If specified, results will not include any from these domains.'
                            },
                        },
                        required: ['query'],
                    },
                },
                {
                    name: 'browse',
                    description: 'Browse the website page by URL links. You also can use the tool to view the detail of search results',
                    input_schema: {
                        type: 'object',
                        properties: {
                            urls: {
                                type: 'array',
                                description: 'The array of urls that you want to browse',
                            },
                            includeHtmlTags: {
                                type: 'boolean',
                                description: 'Whether return HTML tags',
                            },
                        },
                        required: ['urls'],
                    },
                },
            ]
        }
    }

    async createMessage(model: string, messages: Message[] | object[], system: string, tools?: Anthropic.Tool[]) {
        return await this.client.messages.create({
            model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            messages: (messages as Message[]).map(({ content, role }) => ({
                content,
                role: role === 'system' ? 'user' : role,
            })),
            system,
            stream: true,
            tools,
        })
    }

    async callChatCompletion(
        messages: Message[] | Anthropic.Message[],
        signal?: AbortSignal,
        onResultChange?: onResultChange
    ): Promise<any> {
        let result = ''
        try {
            if ( this.toolCallCount> this.maxToolCallCounts){
                throw Error('exceed the maxmiunm tool calls')
            }
            // remap system prompt
            if (messages[0].role == 'system') {
                const system = messages[0].content
                this.defaultPrompt = system
                messages.shift()
            }
            let pendingToolCalls: {
                toolCall: any
                input: string
            }[] = []
            let currentToolCall
            let currentInput = ''
            const stream = await this.createMessage(this.model, messages, this.defaultPrompt, this.tool_list)

            for await (const messageStreamEvent of stream) {
                switch (messageStreamEvent.type) {
                    case 'content_block_delta':
                        if (messageStreamEvent.delta.type === 'text_delta') {
                            result += messageStreamEvent.delta.text
                            onResultChange?.(result)
                        } else if (messageStreamEvent.delta.type === 'input_json_delta') {
                            if (currentToolCall) {
                                currentInput += messageStreamEvent.delta.partial_json
                            }
                        }
                        break
                    case 'content_block_start':
                        if (messageStreamEvent.content_block.type === 'tool_use') {
                            currentToolCall = messageStreamEvent.content_block
                            currentInput = ''
                        }
                        break
                    case 'content_block_stop':
                        if (currentToolCall && currentInput) {
                            pendingToolCalls.push({
                                toolCall: currentToolCall,
                                input: currentInput,
                            })
                            currentToolCall = null
                            currentInput = ''
                        }
                        break
                    case 'message_stop':
                        console.log(pendingToolCalls)
                        if (pendingToolCalls.length > 0) {
                            let tool_results: any = { role: 'user', content: [] }
                            let tool_calling: any = { role: 'assistant', content: [] }
                            for (const { toolCall, input } of pendingToolCalls) {
                                try {
                                    const inputObj = JSON.parse(input)
                                    const { name, id } = toolCall
                                    console.log('Tool input:', inputObj)
                                    this.toolCallCount+=1
                                    let toolResult = ''
                                    switch (name) {
                                        case 'search':
                                            toolResult = await performSearch(1, inputObj)
                                            break
                                        case 'browse':
                                            toolResult = await browse(inputObj.urls, inputObj)
                                            break
                                        default:
                                            console.log('Unsupported tool:', name)
                                            continue
                                    }
                                    tool_results.content.push({
                                        type: 'tool_result',
                                        tool_use_id: id,
                                        content: JSON.stringify(toolResult),
                                    })
                                    tool_calling.content.push({
                                        type: 'tool_use',
                                        id,
                                        name,
                                        input: inputObj,
                                    })

                                    break
                                } catch (error) {
                                    console.error('Error processing tool input:', error)
                                    throw error
                                }
                            } // 清理当前工具调用的状态
                            pendingToolCalls = []
                            // 更新消息数组
                            messages = [
                                ...messages.map(({ role, content }) => ({ role, content })),
                                tool_calling,
                                tool_results,
                                {
                                    role: 'user',
                                    content: `You are an AI assistant tasked with answering user queries based on tool results. 
                                        Your goal is to provide informative answers with proper citations and references. 

When formulating your response, follow these guidelines:
1. Use information from the search results to answer the query.
2. Include in-text citations for each piece of information you use. Citations should be in the format [1], [2], etc.
3. Provide a "References" section at the end of your answer, listing all the sources you cited.
4. Use Markdown format.

Here's an example of how your response should be formatted:

<example_response>
The Earth orbits around the Sun in an elliptical path [1](https://example.com). This orbit takes approximately 365.25 days to complete, which is why we have leap years every four years [2](https://example.com).

**References**:
[Source 1][1](https://example.com)
[Source 2][2](https://example.com)
</example_response>

Lastly, don't forget to adjust the answer's language to match the user's query language.
Now, please answer the user query using the tool results and formatting your response as instructed`,
                                },
                            ]
                            // 递归调用以继续对话
                            return await this.callChatCompletion(messages, signal, onResultChange)
                        }
                }
            }

            return result
        } catch (err) {
            if (err instanceof Anthropic.APIError) {
                throw new ApiError(err.message)
            } else {
                throw err
            }
        }
    }
}
