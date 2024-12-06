import { getDefaultStore } from 'jotai'
import * as atoms from '../../stores/atoms'

export const performSearch = async (engine: number = 1, input: InputObj) => {
    //
    switch (engine) {
        case 1:
            return exaSearch(input)
        case 2:
            return googleSearch(input)
    }
}

const googleSearch = async (input: InputObj): Promise<string> => {
    const store = getDefaultStore()
    const settings = store.get(atoms.settingsAtom)
    const { googleCx, googleAPIKey } = settings
    const { query, num } = input
    console.log(input)
    try {
        const params = {
            key: googleAPIKey,
            cx: googleCx,
            q: encodeURIComponent(query),
            num: num ?? '5',
        }
        const url = `https://www.googleapis.com/customsearch/v1?${new URLSearchParams(params).toString()}`
        const response = await fetch(url)
        const data = await response.json()
        return data.items
    } catch (error) {
        throw new Error(String(error))
    }
}
const exaSearch = async (input: InputObj) => {
    const store = getDefaultStore()
    const settings = store.get(atoms.settingsAtom)
    const { exaAPIKey } = settings
    const { query, num } = input
    console.log(input)
    const options = {
        method: 'POST',
        headers: { 'x-api-key': exaAPIKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: query,
            type: 'keyword', // available parameters: auto, neural, keyword
            numResults: num ?? 5,
            // useAutoprompt: false,
            // category: "company",
            // includeDomains: ["example.com"], // 包含的域名
            // excludeDomains: ["excludedomain.com"], // 排除的域名
            // startCrawlDate: "2023-01-01T00:00:00.000Z", // 开始爬取日期
            // endCrawlDate: "2023-12-31T00:00:00.000Z", // 结束爬取日期
            // includeText: ["keyword"], // 包含的文本
            // excludeText: ["excluded_keyword"], // 排除的文本
        }),
    }
    const response = await fetch('https://api.exa.ai/search', options)
    const data = await response.json()
    return data
}
interface InputObj {
    query: string
    num?: string // 返回的结果数量，默认为 5
    useAutoprompt?: boolean // 是否使用自动提示
    type?: string // The Type of search, 'keyword', 'neural', or 'auto' (decides between keyword and neural). Default neural.
    category?: string // 分类，Available options: company, research paper, news, linkedin profile, github, tweet, movie, song, personal site, pdf, financial report
    // 其他可能的参数
    includeDomains?: string[] // 包含的域名
    excludeDomains?: string[] // 排除的域名
    startCrawlDate?: string // 开始爬取日期
    endCrawlDate?: string // 结束爬取日期
    includeText?: string[] // 包含的文本
    excludeText?: string[] // 排除的文本
}
