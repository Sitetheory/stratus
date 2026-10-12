// Opt in per host page: older Sitetheory releases retain their legacy writer.
export function nativeEditorImagesEnabled(): boolean {
    return (window as Window & {sitetheoryNativeImagePlaceholder?: boolean}).sitetheoryNativeImagePlaceholder === true
}

// Keep saved HTML self-contained. No runtime metadata lookup is required to show
// an image, and arbitrary URLs never acquire invented media-library variants.
export function createNativeEditorImage(media: {[key: string]: any}, source: string): HTMLImageElement {
    const image = document.createElement('img')
    const dimensions = String(media.dimensions || '').match(/^([1-9][0-9]*),([1-9][0-9]*)$/)
    const extension = String(media.extension || '').toLowerCase()
    const prefix = typeof media.prefix === 'string' ? media.prefix : ''
    const library = prefix && !media.service && !/^(blob:|data:)/i.test(source) &&
        ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(extension)
    if (dimensions) {
        image.setAttribute('width', dimensions[1])
        image.setAttribute('height', dimensions[2])
        image.style.aspectRatio = `${dimensions[1]} / ${dimensions[2]}`
        image.style.maxWidth = '100%'
        image.style.height = 'auto'
    }
    if (library) {
        const base = /^(https?:)?\/\//.test(prefix) ? prefix : '//' + prefix
        const query = source.includes('?') ? '?' + source.split('?').slice(1).join('?').split('#')[0] : ''
        const cache = media.timeEdit ? '?cachebusting=' + media.timeEdit : query
        source = base + '.' + extension + cache
        if (dimensions && !/[\s,?#]/.test(base)) {
            const width = Number(dimensions[1])
            const candidates = Object.entries({xs: 200, s: 400, m: 600, l: 800, xl: 1200, hq: 1600})
                .filter(([, size]) => size <= width)
                .map(([suffix, size]) => `${base}-${suffix}.${extension}${cache} ${size}w`)
            if (width > 1600) candidates.push(`${source} ${width}w`)
            if (candidates.length) {
                image.setAttribute('srcset', candidates.join(', '))
                image.setAttribute('sizes', 'auto, 100vw')
            }
        }
    }
    image.setAttribute('src', source)
    image.setAttribute('alt', media.name || media.filename || '')
    normalizeNativeEditorImage(image)
    return image
}

export function normalizeNativeEditorImage(image: HTMLImageElement): void {
    const legacy = image.hasAttribute('data-stratus-src') || image.hasAttribute('stratus-src')
    const source = (legacy ? image.getAttribute('data-src') : image.getAttribute('src')) ||
        image.getAttribute('src') || image.getAttribute('data-src')
    if (!source) return
    // Froala's URL replacement can retain old attributes. Never let the previous
    // image's candidates override a newly selected source on save/reopen.
    const previousSource = image.getAttribute('data-native-editor-source')
    if (previousSource && previousSource !== source) {
        image.removeAttribute('srcset')
        image.removeAttribute('sizes')
    }
    image.setAttribute('src', source)
    if (image.hasAttribute('srcset')) image.setAttribute('data-native-editor-source', source)
    else image.removeAttribute('data-native-editor-source')
    image.setAttribute('data-stratus-placeholder', '')
    image.setAttribute('loading', 'lazy')
    image.setAttribute('decoding', 'async')
    for (const attribute of Array.from(image.attributes)) {
        if (attribute.name === 'stratus-src' || attribute.name.startsWith('data-stratus-src') ||
            ['data-src', 'data-size', 'data-loading', 'data-current-width', 'data-greatest-width',
                'data-resize-optimistic-lock', 'data-stratus-placeholder-state'].includes(attribute.name)) {
            image.removeAttribute(attribute.name)
        }
    }
    image.classList.remove('loaded', 'loading', 'placeholder', 'image-error')
}
