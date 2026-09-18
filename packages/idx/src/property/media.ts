/** Public, normalized listing media. Never interpret provider HTML or private/raw fields. */
export interface PropertyMediaPlayer {
    key: string
    kind: 'video' | 'tour'
    provider: 'youtube' | 'vimeo' | 'matterport' | 'video'
    url: string
    sourceUrl: string
}

export function mediaUrl(value: unknown): URL | null {
    if (typeof value !== 'string' || !value.trim()) return null
    try {
        const url = new URL(value.trim().startsWith('//') ? `https:${value.trim()}` : value.trim())
        return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url : null
    } catch { return null }
}

export function propertyMediaPlayer(value: unknown): PropertyMediaPlayer | null {
    const source = mediaUrl(value)
    if (!source) return null
    const host = source.hostname.toLowerCase()
    const path = source.pathname.split('/').filter(Boolean)
    let id: string | null = null
    let provider: PropertyMediaPlayer['provider']
    let url: URL
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be', 'www.youtu.be'].includes(host)) {
        id = host.endsWith('youtu.be') ? path[0] : path[0] === 'watch' ? source.searchParams.get('v') : ['embed', 'shorts', 'live', 'v'].includes(path[0]) ? path[1] : null
        if (!id || !/^[\w-]{11}$/.test(id)) return null
        provider = 'youtube'
        url = new URL(`https://www.youtube-nocookie.com/embed/${id}`)
        url.searchParams.set('rel', '0')
    } else if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
        const match = source.pathname.match(/^\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:\/([a-zA-Z0-9]+))?\/?$/)
        if (!match) return null
        id = match[1]
        provider = 'vimeo'
        url = new URL(`https://player.vimeo.com/video/${id}`)
        const hash = source.searchParams.get('h') || match[2]
        if (hash && /^[a-zA-Z0-9]+$/.test(hash)) url.searchParams.set('h', hash)
    } else if (['my.matterport.com', 'matterport.com', 'www.matterport.com'].includes(host) && path[0] === 'show') {
        id = source.searchParams.get('m')
        if (!id || !/^[a-zA-Z0-9]+$/.test(id)) return null
        provider = 'matterport'
        url = new URL(`https://my.matterport.com/show/?m=${id}`)
        // Preserve MLS branding/privacy and tour positioning options; do not autoplay.
        for (const key of ['mls', 'brand', 'title', 'qs', 'ts', 'sr', 'ss', 'f', 'dh', 'hl', 'lang']) {
            if (source.searchParams.has(key)) url.searchParams.set(key, source.searchParams.get(key)!)
        }
    } else if (/\.(mp4|webm|ogv)$/i.test(source.pathname)) {
        provider = 'video'
        id = source.origin + source.pathname
        url = source
    } else return null
    return {key: `${provider}:${id}`, kind: provider === 'matterport' ? 'tour' : 'video', provider, url: url.href, sourceUrl: source.href}
}

export function collectPropertyMedia(property: Record<string, unknown>, hidden: string[] = []): {
    players: PropertyMediaPlayer[], links: string[]
} {
    const players: PropertyMediaPlayer[] = []
    const links: string[] = []
    const seen = new Set<string>()
    const add = (value: unknown, fallback: boolean): void => {
        const url = mediaUrl(value)
        if (!url) return
        const player = propertyMediaPlayer(url.href)
        if (player) {
            if (!seen.has(player.key)) players.push(player)
            seen.add(player.key)
        } else if (fallback && !links.includes(url.href)) links.push(url.href)
    }
    // Preserve the established preference for unbranded tours.
    const tourField = ['VirtualTourURLUnbranded', 'VirtualTourURLBranded'].find(field => !hidden.includes(field) && mediaUrl(property[field]))
    if (tourField) add(property[tourField], true)
    for (const field of ['Media', 'Images']) {
        if (hidden.includes(field) || !Array.isArray(property[field])) continue
        for (const item of property[field] as Record<string, unknown>[]) {
            if (!item || typeof item !== 'object') continue
            const permissions = Array.isArray(item.Permission) ? item.Permission : [item.Permission]
            if (permissions.some(value => typeof value === 'string' && /private|office only|firm only|agent only/i.test(value))) continue
            const category = String(item.MediaCategory || item.MediaClassification || '').toLowerCase()
            if (category && !/video|tour/.test(category)) continue
            add(item.MediaURL, /video|tour/.test(category))
        }
    }
    return {players, links}
}
