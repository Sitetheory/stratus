// I will eventually break this up into individual schemas as we map out the API.
export interface ContentEntity<t> {
    type?: string
    version: ContentVersionEntity<t>
    contentType: ContentTypeEntity
    domain?: null
    author?: null
    associatedContent?: ContentEntity<any>
    mailLists?: null
    priority?: null
    tags?: TagEntity[]
    routing?: RoutingEntity[]
    menuLinks?: null
    reviews?: null
    main: boolean
    mainContentType: boolean
    id: number
    siteId: number
    vendorId?: null
    time: number
    timeEdit: number
    timeStatus?: number
    status: number
    importId?: string
    vendor?: null
    syndicated: number
    isPseudoPriority: boolean
}
export interface ContentVersionEntity<t> {
    modules?: ModuleEntity[]
    shellImages?: MediaEntity[]
    images?: MediaEntity[]
    mediaVR?: MediaEntity[]
    videos?: MediaEntity[]
    audios?: MediaEntity[]
    documents?: MediaEntity[]
    media?: MediaEntity[]
    locations?: null
    tags?: TagEntity[]
    metaImage?: (null)[]
    bestImage?: MediaEntity[]
    text: string
    header: string
    footer: string
    versionNotes?: string
    timeCustom?: number
    layout?: LayoutEntity
    shell?: null
    title: string
    internalIdentifier?: string
    bestIdentifier: string
    altTitle?: string
    subtitle?: string
    pullout: string
    citation: string
    ctaText: string
    ctaValue: string
    ctaButton: string
    ctaButtonUrl: string
    ctaBrowserTarget: string
    custom?: null
    main: boolean
    limit?: number
    sort?: string
    truncate?: null
    collectionStyle?: string
    collectionCounter: boolean
    imageRatio?: string
    displayContactForm: boolean
    enableRelated: boolean
    disableSidebar: boolean
    disableImage: boolean
    disableAnalytics: boolean
    disableSeo: boolean
    enableLayouts: boolean
    availableLayouts?: LayoutEntity[]
    restrictType?: string
    metaTitle?: string
    metaUrl?: string
    metaType?: string
    metaDescription?: null
    htmlAttribute?: string
    carouselOptions?: CarouselOptions
    display?: Display
    privateNotes: string
    latestId?: null
    id: number
    time: number
    timeEdit: number
    status: number
    published: number
    archived: boolean
    timePublish?: number
    meta?: t
}
export interface ModuleEntity {
    type: string
    version?: null
    contentType: ContentTypeEntity
    domain?: null
    author?: null
    associatedContent?: ContentEntity<any>
    mailLists?: null
    priority: number
    tags?: TagEntity
    routing?: null
    reviews?: null
    main: boolean
    mainContentType: boolean
    id: number
    status: number
}
export interface BundleEntity {
    id: number
    name?: string
}
export interface MediaEntity {
    images?: MediaEntity[]
    media?: MediaEntity[]
    priority?: null
    name?: string
    description?: string
    abstract?: string
    embed?: string
    hash?: string
    prefix?: string
    url?: string
    extension?: string
    mime: string
    ratio?: string
    ratioPercent?: null
    bestRatio?: null
    bestRatioWord?: null
    dimensions?: string
    service?: string
    serviceMediaId?: string
    meta?: MediaMetaEntity[]
    src?: string
    thumbSrc?: string
    bestImage?: MediaEntity
    duration?: null
    autoPlay: boolean
    vr: boolean
    timeCustom?: null
    author?: null
    modules?: null
    id?: number
    status?: number
}
export interface MediaMetaEntity {
    thumbnail_small: string
    thumbnail_medium: string
    thumbnail_large: string
}
export interface LayoutEntity {
    images?: MediaEntity[]
    icon: string
    iconResource: string
    iconResourcePath: string
    controller?: string
    variableName?: string
    name: string
    id: number
}
export interface CarouselOptions {
    play: number
    slidesPerView: number
}
export interface Display {
    attractions: number
}
export interface ContentTypeEntity {
    bundle: BundleEntity
    controller: string
    name: string
    nameId: string
    entity: string
    description: string
    routable?: boolean
    collection?: boolean
    integration?: boolean
    editUrl?: string
    editLayoutUrl?: string
    editSeoUrl?: string
    editSettingsUrl?: string
    editVersionUrl?: string
    class: string
    icon?: null
    iconResource: string
    iconResourcePath: string
    bundleName?: string
    vendorName?: string
    id: number
}
export interface TagEntity {
    name: string
    priority?: null
    id: number
    time: number
    timeEdit: number
    status: number
}
export interface RoutingEntity {
    url: string
    main: boolean
    redirect?: null
    redirectStatus?: null
    id: number
    time?: number
    timeEdit?: number
    status: number
}
