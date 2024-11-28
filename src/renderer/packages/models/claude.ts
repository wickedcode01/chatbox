import Base, { onResultChange } from './base'
import { Message, ModelSettings } from '../../../shared/types'
import { ApiError, NetworkError, BaseError } from './errors'
import Anthropic from '@anthropic-ai/sdk'
import { performSearch } from '../tools/search'
import * as atoms from '../../stores/atoms'
import { getDefaultStore } from 'jotai'
import * as defaults from '../../../shared/defaults'
import * as settingActions from '@/stores/settingActions'

export const claudeModelConfigs = {
    'claude-3-opus-20240229': { maxTokens: 4096 },
    'claude-3-sonnet-20240229': { maxTokens: 4096 },
    'claude-3-haiku-20240307': { maxTokens: 4096 },
    'claude-3-5-haiku-latest': { maxTokens: 4096 },
} as const

export type Model = keyof typeof claudeModelConfigs
export const models = Object.keys(claudeModelConfigs).sort() as Model[]

export default class Claude extends Base {
    private client: Anthropic
    private model: string
    private temperature: number
    private maxTokens: number
    private defaultPrompt: string

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
    }

    createMessage(model: string, max_tokens: number, messages: Message[] | object[], system: string, tools?: Tool[]) {
        return this.client.messages.stream({
            model,
            max_tokens,
            messages: (messages as Message[]).map(({ content, role }) => ({
                content,
                role: role === 'system' ? 'user' : role,
            })),
            system,
            tools,
        })
    }

    async callChatCompletion(
        messages: Message[],
        signal?: AbortSignal,
        onResultChange?: onResultChange
    ): Promise<string> {
        let result = ''
        let search_query: string[] = []
        let tool_list: Tool[] = []
        const searchTag = settingActions.getSearchSwitch()
        if (searchTag) {
            tool_list.push({
                name: 'search',
                description: 'Search the internet for current information.',
                input_schema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'The search query',
                        },
                    },
                    required: ['query'],
                },
            })
        }
        return new Promise((reslove, reject) => {
            const stream = this.createMessage(this.model, this.maxTokens, messages, this.defaultPrompt, tool_list)

            // stream.on('streamEvent', MessageStreamEvent => {})
            stream
                .on('text', (text: string) => {
                    result += text
                    onResultChange?.(result)
                })
                .on('contentBlock', (content: Record<string, any>) => {
                    const { type } = content
                    if (type == 'tool_use') {
                        const { name, input } = content
                        switch (name) {
                            case 'search':
                                search_query.push(input)

                                break
                            default:
                        }
                    }
                })
                .on('end', async () => {
                    if (searchTag && search_query.length > 0) {
                        const results = await Promise.all(
                            search_query.map(async (query) => [...(await performSearch(query))])
                        ).catch((err) => {
                            reject(err)
                        })

                        // Re-run with search results
                        const searchStream = await this.createMessage(
                            this.model,
                            this.maxTokens,
                            [
                                ...messages,
                                {
                                    role: 'user',
                                    content:
                                        "You are an AI assistant tasked with answering user questions based on provided search results. Use the search results to create an accurate and concise answer. Include in-text citations for references, linking directly to the sources. Adjust the answer's language to match the user's query language." +
                                        'Output Format Example:' +
                                        'Answer based on search results, with in-text citations like [1](https://example.com). \n' +
                                        '--- \n ### References \n' +
                                        '1. ** [Title 1](https://example.com)**: Brief explanation or key points from the source. \n 2. ** [Title 2](https://example.com)**: Brief explanation or key points from the source. \n' +
                                        `Here is search result: ${JSON.stringify(results)}`,
                                },
                            ],
                            this.defaultPrompt
                        )

                        searchStream
                            .on('text', (text: string) => {
                                result += text
                                onResultChange?.(result)
                                reslove(result)
                            })
                            .on('error', (err) => reject(err))
                    } else {
                        reslove(result)
                    }
                })
                .on('error', (err) => {
                    if (err instanceof Anthropic.APIError) {
                        reject(new ApiError(err.message))
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

type Tool = {
    name: string
    description: string
    input_schema: {
        type: string
        properties: object
        required: ['query']
    }
}
