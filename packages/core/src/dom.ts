// DOM Complete as a Promise instead of Callback
export function DOMComplete(): Promise<void> {
    return new Promise<void>(resolve => {
        document.readyState === 'complete' ? resolve() : window.addEventListener('load', () => resolve())
    })
}
