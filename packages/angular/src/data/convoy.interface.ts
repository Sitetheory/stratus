export interface Convoy<t> {
    success: boolean
    route: Route
    meta: Meta
    payload?: Array<t> | null
}
export interface Route {
    controller: string
}
export interface Meta {
    method: string
    format: string
    sentinel: Sentinel
    searchable: Searchable
    editUrl: string
    editSeoUrl: string
    editLayoutUrl: string
    editSettingsUrl: string
    editVersionUrl: string
    allowedAction: AllowedAction
    pagination: Pagination
    status?: Array<Status> | null
}
export interface Sentinel {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    publish: boolean
    design: boolean
    dev: boolean
    master: boolean
    summary?: (string)[] | null
}
export interface AllowedAction {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    publish: boolean
    dev: boolean
}
export interface Pagination {
    countCurrent: number
    countTotal: number
    pageCurrent: number
    pageTotal: number
    limit: number
}
export interface Status {
    code: string
    message: string
    type: string
}
export interface Searchable {
    [key: string]: any
}
