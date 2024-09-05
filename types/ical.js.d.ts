// ical still working on releasing a typing
declare module 'ical.js' {
    class Component {}
    class Event {}
    const TimezoneService: {
        get count(): number
        reset(): void
        has(tzid: string): boolean
        get(tzid: string): unknown
        register(name: string, timezone: string): void
        remove(tzid: string): unknown
    }
    function parse(input: string): Component // Object/ Component
    let ICALmodule = {
        Component,
        Event,
        TimezoneService,
        parse
    }
    export { ICALmodule as default }
}
