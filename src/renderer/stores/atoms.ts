import { atom, SetStateAction } from 'jotai'
import { Session, Toast, Settings, CopilotDetail, Message, SettingWindowTab } from '../../shared/types'
import { selectAtom, atomWithStorage } from 'jotai/utils'
import { focusAtom } from 'jotai-optics'
import * as defaults from '../../shared/defaults'
import storage, { StorageKey } from '../storage'
import platform from '../packages/platform'

const _settingsAtom = atomWithStorage<Settings>(StorageKey.Settings, defaults.settings(), storage)
export const settingsAtom = atom(
    (get) => {
        const settings = get(_settingsAtom)
        return Object.assign({}, defaults.settings(), settings)
    },
    (get, set, update: SetStateAction<Settings>) => {
        const settings = get(_settingsAtom)
        let newSettings = typeof update === 'function' ? update(settings) : update
        if (newSettings.proxy !== settings.proxy) {
            platform.ensureProxyConfig({ proxy: newSettings.proxy })
        }
        set(_settingsAtom, newSettings)
    }
)

export const languageAtom = focusAtom(settingsAtom, (optic) => optic.prop('language'))
export const showWordCountAtom = focusAtom(settingsAtom, (optic) => optic.prop('showWordCount'))
export const showTokenCountAtom = focusAtom(settingsAtom, (optic) => optic.prop('showTokenCount'))
export const showTokenUsedAtom = focusAtom(settingsAtom, (optic) => optic.prop('showTokenUsed'))
export const showModelNameAtom = focusAtom(settingsAtom, (optic) => optic.prop('showModelName'))
export const showMessageTimestampAtom = focusAtom(settingsAtom, (optic) => optic.prop('showMessageTimestamp'))
export const themeAtom = focusAtom(settingsAtom, (optic) => optic.prop('theme'))
export const fontSizeAtom = focusAtom(settingsAtom, (optic) => optic.prop('fontSize'))
export const spellCheckAtom = focusAtom(settingsAtom, (optic) => optic.prop('spellCheck'))
export const allowReportingAndTrackingAtom = focusAtom(settingsAtom, (optic) => optic.prop('allowReportingAndTracking'))
export const enableMarkdownRenderingAtom = focusAtom(settingsAtom, (optic) => optic.prop('enableMarkdownRendering'))
export const autoGenerateTitleAtom = focusAtom(settingsAtom, (optic) => optic.prop('autoGenerateTitle'))
// search config
export const switchSearchAtom = focusAtom(settingsAtom, (optic) => optic.prop('searchSwitch'))
export const licenseDetailAtom = focusAtom(settingsAtom, (optic) => optic.prop('licenseDetail'))

// myCopilots
export const myCopilotsAtom = atomWithStorage<CopilotDetail[]>(StorageKey.MyCopilots, [], storage)

// sessions

const _sessionsAtom = atomWithStorage<Session[]>(StorageKey.ChatSessions, [], storage)
export const sessionsAtom = atom(
    (get) => {
        let sessions = get(_sessionsAtom)
        if (sessions.length === 0) {
            sessions = defaults.sessions()
        }
        return sessions
    },
    (get, set, update: SetStateAction<Session[]>) => {
        const sessions = get(_sessionsAtom)
        let newSessions = typeof update === 'function' ? update(sessions) : update
        if (newSessions.length === 0) {
            newSessions = defaults.sessions()
        }
        set(_sessionsAtom, newSessions)
    }
)
export const sortedSessionsAtom = atom((get) => {
    return sortSessions(get(sessionsAtom))
})

export function sortSessions(sessions: Session[]): Session[] {
    return [...sessions].reverse().sort((a, b) => {
        // 先比较是否置顶
        if (a.isPinned === b.isPinned) {
            return 0 // 如果都相同，保持原顺序
        }
        return a.isPinned ? -1 : 1 // 置顶的会话排在前面
    })
}

const _currentSessionIdCachedAtom = atomWithStorage<string | null>('_currentSessionIdCachedAtom', null)
export const currentSessionIdAtom = atom(
    (get) => {
        const idCached = get(_currentSessionIdCachedAtom)
        const sessions = get(sortedSessionsAtom)
        if (idCached && sessions.some((session) => session.id === idCached)) {
            return idCached
        }
        return sessions[0].id
    },
    (_get, set, update: string) => {
        set(_currentSessionIdCachedAtom, update)
    }
)

export const currentSessionAtom = atom((get) => {
    const id = get(currentSessionIdAtom)
    const sessions = get(sessionsAtom)
    let current = sessions.find((session) => session.id === id)
    if (!current) {
        return sessions[sessions.length - 1] // fallback to the last session
    }
    return current
})

export const currentSessionNameAtom = selectAtom(currentSessionAtom, (s) => s.name)
export const currsentSessionPicUrlAtom = selectAtom(currentSessionAtom, (s) => s.picUrl)

export const currentMessageListAtom = atom(
    (get) => {
        const session = get(currentSessionAtom)
        return session.messages
    },
    (get, set, newMessages: Message[]) => {
        const sessions = get(sessionsAtom)
        const currentSession = get(currentSessionAtom)
        currentSession.messages = newMessages
        const updatedSession = { ...currentSession, messages: newMessages } // 创建一个新的会话对象
        const newSessions = sessions.map((i) => {
            if (i.id === currentSession.id) {
                return updatedSession // 使用更新后的会话对象
            } else {
                return i
            }
        })
        set(sessionsAtom, newSessions)
    }
)

// toasts

export const toastsAtom = atom<Toast[]>([])

// theme

export const activeThemeAtom = atom<'light' | 'dark'>('light')

export const configVersionAtom = atomWithStorage<number>(StorageKey.ConfigVersion, 0, storage)

export const messageListRefAtom = atom<null | React.MutableRefObject<HTMLDivElement | null>>(null)

export const openSettingDialogAtom = atom<SettingWindowTab | null>(null)
export const sessionCleanDialogAtom = atom<Session | null>(null)
export const chatConfigDialogAtom = atom<Session | null>(null)
