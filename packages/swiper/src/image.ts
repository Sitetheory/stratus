/** Select the smallest fitting derivative, capped at the largest available size. */
export const getCarouselImageSize = (width: number, sizes: Record<string, number>): string => {
    const available = Object.entries(sizes)
        .filter(([, pixels]) => Number.isFinite(pixels) && pixels > 0)
        .sort((a, b) => a[1] - b[1])
    const largest = available[available.length - 1]
    const fitting = Number.isFinite(width) && width > 0 ? available.find(([, pixels]) => pixels >= width) : null
    return (fitting || largest || ['hq'])[0]
}

/** Resize only the filename, leaving query parameters and fragments intact. */
export const resizeCarouselImage = (src: string, size: string): string => {
    if (!size) return src
    const boundary = src.search(/[?#]/)
    const path = boundary < 0 ? src : src.slice(0, boundary)
    const suffix = boundary < 0 ? '' : src.slice(boundary)
    return path.replace(/([^/]+?)(-(?:xs|s|m|l|xl|hq|hd|hdl|hdxl))?\.(\w+)$/i,
        (_match, name, _previousSize, extension) => `${name}-${size}.${extension}`) + suffix
}

/** A readable fallback when the image has no editorial title or description. */
export const getCarouselImageName = (src: string, generatedSize = false): string => {
    let name = (src || '').split(/[?#]/)[0].split('/').pop() || ''
    try {
        name = decodeURIComponent(name.replace(/\+/g, ' '))
    } catch (_error) {
        // Keep malformed percent escapes readable instead of failing the carousel.
    }
    name = name.replace(/\.[^.]+$/, '')
    if (generatedSize) name = name.replace(/-(?:xs|s|m|l|xl|hq|hd|hdl|hdxl)$/i, '')
    return name
}
