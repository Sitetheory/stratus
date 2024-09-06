// ical still working on releasing a typing. Phpstorm can't properly read the types here so don't expand
declare module 'ical.js' {
    /** @see ical.js/lib/ical/compponent.js */
    class Component {}
    /** @see ical.js/lib/ical/event.js */
    class Event {
        constructor(component: Component, options?: unknown)
    }
    /** @see ical.js/lib/ical/timezone_service.js */
    const TimezoneService: {
        get count(): number
        reset(): void
        has(tzid: string): boolean
        get(tzid: string): unknown
        register(name: string, timezone: string): void
        remove(tzid: string): unknown
    }
    function parse(input: string): Component // Object/ Component
    const ICALmodule = {
        Component,
        Event,
        TimezoneService,
        parse
    }
    export default ICALmodule
}
