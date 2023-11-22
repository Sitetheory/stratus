/**
 * @file Idx Service @stratusjs/idx/idx
 * @example import '@stratusjs/idx/idx'
 */

// Runtime
import {clone, extend, get, isArray, isDate, isEmpty, isEqual, isNumber, isObject, isPlainObject, isString, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    auto,
    element,
    material,
    IFilterOrderBy,
    IHttpService,
    ILocationService,
    IPromise,
    IRootScopeService,
    IScope,
    IQService,
    IWindowService
} from 'angular'
import {Model, ModelOptions, ModelSyncOptions} from '@stratusjs/angularjs/services/model'
import {Collection, CollectionSyncOptions} from '@stratusjs/angularjs/services/collection'
import {
    isJSON,
    LooseFunction,
    LooseObject
} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
import {IdxDisclaimerScope} from '@stratusjs/idx/disclaimer/disclaimer.component'
import {IdxMapScope} from '@stratusjs/idx/map/map.component'
import {IdxPropertyListScope} from '@stratusjs/idx/property/list.component'
import {IdxPropertySearchScope} from '@stratusjs/idx/property/search.component'
import {IdxMemberListScope} from '@stratusjs/idx/member/list.component'

// Stratus Preload
import '@stratusjs/idx/listTrac'

export interface IdxService {
    // Variables
    sharedValues: IdxSharedValue

    // Fetch Methods
    fetchMembers(
        uid: string,
        collectionVarName: string,
        options?: Pick<CompileFilterOptions,
            'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office'>,
        refresh?: boolean,
        listName?: string
    ): Promise<Collection>

    fetchOffices(
        uid: string,
        collectionVarName: string,
        options?: Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office' | 'managingBroker' | 'members'>,
        refresh?: boolean,
        listName?: string
    ): Promise<Collection>

    fetchProperties(
        uid: string,
        collectionVarName: string,
        options?: Pick<CompileFilterOptions, 'service' | 'where' | 'page' | 'perPage' | 'order' | 'fields' | 'images' | 'openhouses'>,
        refresh?: boolean,
        listName?: string
    ): Promise<Collection<Property>>

    fetchProperty(
        $scope: any,
        modelVarName: string,
        options?: Pick<CompileFilterOptions, 'service' | 'where' | 'fields' | 'images' | 'openhouses'>
    ): Promise<Model<Property>>

    // Instance Methods
    getDisclaimerInstance(disclaimerUid?: string): {[uid: string]: IdxDisclaimerScope} | null

    getListInstance(listUid: string, listType?: string): IdxPropertyListScope | IdxMemberListScope | IdxComponentScope | null

    getListInstanceLinks(listUid: string, listType?: string): (IdxPropertySearchScope | IdxMapScope | IdxComponentScope)[]

    getSearchInstanceLinks(searchUid: string, listType?: string): (IdxPropertyListScope | IdxComponentScope)[]

    ensureItemsAreArrays(itemParent: LooseObject, itemNames: string[]): void

    registerDetailsInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property',
        $scope: IdxDetailsScope
    ): void

    registerDisclaimerInstance(uid: string, $scope: IdxDisclaimerScope): void

    registerListInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property',
        $scope: IdxListScope
    ): void

    registerMapInstance(uid: string, $scope: IdxMapScope): void

    registerSearchInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property',
        $scope: IdxSearchScope,
        listUid?: string
    ): void

    unregisterDetailsInstance(uid: string, moduleName: 'member' | 'office' | 'property'): void

    // Url Option Methods
    getOptionsFromUrl(): UrlsOptionsObject

    getUrlOptions(listingOrSearch: 'Search' | 'Listing'): UrlWhereOptions

    getUrlOptionsPath(defaultOptions?: any): string

    refreshUrlOptions(defaultOptions: any): void

    setUrlOptions(listingOrSearch: 'Search' | 'Listing', options: any): void

    // Reusable Methods
    clearFieldInput(env: any): void

    devLog(...items: any): void

    emit(
        emitterName: string,
        $scope: IdxComponentScope,
        var1?: any, var2?: any, var3?: any
    ): void
    emitManual(
        emitterName: string,
        uid: string,
        $scope: IdxComponentScope,
        var1?: any, var2?: any, var3?: any
    ): void
    on(
        uid: string,
        emitterName: string,
        callback: IdxEmitter
    ): () => void

    getFriendlyStatus(property: Property, preferredStatus?: 'Closed' | 'Leased' | 'Rented'): string
    getFriendlyPriceLabel(property: Property): 'List Price' | 'Sale Price' | 'Lease Price' | 'Rent Price' | string
    getFullStatus(property: Property, preferredStatus: 'Closed' | 'Leased' | 'Rented'): 'Active' | 'Contingent' | 'Closed' | 'Leased' | 'Rented' | string
    getFullAddress(property: Property, encode?: boolean): string
    getGoogleMapsKey(): string | null
    getWebsiteMainContact(): {
        name: string
        email: string | null
        phone: string | null
    } | null

    getIdxServices(): number[]
    getMLSVariables(serviceIds?: number[]): MLSService[]

    getStreetAddress(property: Property): string

    // Other Unsorted Methods
    getContactVariables(): WidgetContact[]

    getDefaultWhereOptions(): WhereOptions

    setIdxServices(property: number[]): void

    setPageTitle(title?: string): void

    // Auth Methods
    setTokenURL(url: string): void

    tokenKeepAuth(keepAlive?: boolean): IPromise<void>

    getLastQueryTime(): Date|null

    getLastSessionTime(): Date|null

    // Scope helpers

    countArraysNotEmpty(arrayList: any[][]): number

    getInput(elementId: string): JQLite

    getNestedPathValue(currentNest: object | any, pathPieces: string[]): any

    getScopeValuePath(scope: IScope, scopeVarPath: string): any

    updateNestedPathValue(currentNest: object | any, pathPieces: object | any, value: any): Promise<string | any>

    updateScopeValuePath(scope: IScope, scopeVarPath: string, value: any): Promise<string | any>
}

export type IdxComponentScope = IScope & LooseObject<LooseFunction> & {
    uid: string
    elementId: string
    localDir: string
    Idx: IdxService

    on(emitterName: string, callback: IdxEmitter): () => void
    remove(): void
}

export type IdxDetailsScope<T = LooseObject> = IdxComponentScope & {
    model: Model<T>
}

export type IdxListScope<T = LooseObject> = IdxComponentScope & {
    collection: Collection<T>

    search(query?: CompileFilterOptions, refresh?: boolean, updateUrl?: boolean): Promise<Collection<T>>

    orderChange(order: string | string[], ev?: any): Promise<void>
    pageChange(pageNumber: number, ev?: any): Promise<void>
    pageNext(ev?: any): Promise<void>
    pagePrevious(ev?: any): Promise<void>

    displayModelDetails(model: T, ev?: any): void
    getPageModels(): T[]
    scrollToModel(model: T): void
    highlightModel(model: T, timeout?: number): void
    unhighlightModel(model: T): void
}

export type IdxSearchScope = IdxComponentScope & {
    listId: string
    listInitialized: boolean

    refreshSearchWidgetOptions(listScope?: IdxListScope): void
    search(force?: boolean): void
}

export type SelectionGroup = {
    name: string
    group: string[]
}

export interface UrlsOptionsObject {
    Listing: UrlWhereOptions // TODO convert to UrlWhereOptions
    Search: UrlWhereOptions
}

// This is what can be passed to the URL and useable options
export interface UrlWhereOptions extends Omit<WhereOptions, 'Page' | 'Order'> {
    Page?: number
    Order?: any // TODO specify order
}

// Reusable Objects. Keys listed are not required, but help programmers define what exists/is possible
export interface WhereOptions extends LooseObject {
    page?: undefined // Key being added to wrong type
    // Page?: undefined // Key being added to wrong type
    order?: undefined // Key being added to wrong type
    // Order?: undefined // Key being added to wrong type
    where?: undefined // Key being added to wrong type

    // Property
    ListingKey?: string,
    ListingId?: string[] | string,
    ListingType?: string[] | string,
    Status?: string[] | string,
    UnparsedAddress?: string,
    City?: string[] | string,
    eCity?: string[] | string,
    PostalCode?: string[] | string,
    CityRegion?: string[] | string,
    eCityRegion?: string[] | string,
    CountyOrParish?: string[] | string,
    eCountyOrParish?: string[] | string,
    MLSAreaMajor?: string[] | string, // DEPRECATED
    eMLSAreaMajor?: string[] | string, // DEPRECATED
    SubdivisionName?: string[] | string,
    eSubdivisionName?: string[] | string,
    ListPriceMin?: number | any,
    ListPriceMax?: number | any,
    Bathrooms?: number | any, // Previously BathroomsFullMin
    Bedrooms?: number | any, // Previously BedroomsTotalMin
    Location?: string,
    eLocation?: string,
    Neighborhood?: string[] | string,
    eNeighborhood?: string[] | string,
    AgentLicense?: string[] | string, // Converts on server to multiple checks
    OfficeNumber?: string[] | string, // Converts on server to multiple checks
    OfficeName?: string[] | string, // Converts on server to multiple checks
    OpenHouseOnly?: boolean, // Filters by only those with OpenHouses attached

    // Member
    MemberKey?: string,
    MemberStateLicense?: string,
    MemberNationalAssociationId?: string,
    MemberStatus?: string,
    MemberFullName?: string,

    // Office
    OfficeKey?: string,
    OfficeNationalAssociationId?: string,
    OfficeStatus?: string,
}

export interface CompileFilterOptions extends LooseObject {
    where?: WhereOptions,
    service?: number | number[],
    page?: number,
    perPage?: number | 20,
    order?: string | string[],
    fields?: string[],
    images?: boolean | {
        limit?: number,
        fields?: string[] | string,
    },
    openhouses?: boolean | {
        limit?: number,
        fields?: string[] | string,
    },
    office?: boolean | {
        limit?: number,
        fields?: string[] | string,
    },
    managingBroker?: boolean | {
        limit?: number,
        fields?: string[] | string,
    },
    members?: boolean | {
        limit?: number,
        fields?: string[] | string,
    }
}

export interface MLSService {
    id: number
    name: string
    disclaimer: string
    token?: string
    created?: string
    ttl?: number
    host?: string
    fetchTime: {
        Property: Date | null
        Media: Date | null
        Member: Date | null
        Office: Date | null
        OpenHouse: Date | null
    }
    analyticsEnabled: string[]
    logo: {
        default?: string
        tiny?: string // height 15px
        small?: string
        medium?: string
        large?: string
    }
    mandatoryLogo?: string[]
}

/** Sitetheory contact information */
export interface WidgetContact {
    name: string,
    emails: {
        Main?: string
    },
    locations: {
        Main?: string
    },
    phones: {
        Main?: string
    },
    socialUrls: {
        Main?: string
    },
    urls: {
        Main?: string
    }
}

/** Sitetheory provided integrations */
export interface WidgetIntegrations {
    analytics?: {
        googleAnalytics?: {
            accountId: string
        },
        listTrac?: {
            accountId: string
        }
    },
    maps?: {
        googleMaps?: {
            publicKey: string
        }
    }
}

/** Sitetheory provided preferences */
interface IdxSharedValue {
    contactUrl: string | null,
    contactCommentVariable: string | null,
    contact: WidgetContact | null,
    integrations: WidgetIntegrations
}

// Internal
interface Session {
    services: {[serviceId: number]: MLSService},
    lastCreated: Date,
    lastTtl: number
    expires?: Date
    contacts: WidgetContact[]
}

/** Sitetheory authentication token format */
interface TokenResponse {
    data: {
        contact?: {
            emails?: { Main?: string },
            locations?: { Main?: string },
            phones?: { Main?: string },
            socialUrls?: {},
            urls?: {},
        },
        contactName?: string,
        contactUrl?: string,
        contactCommentVariable?: string,
        errors?: any[],
        integrations?: WidgetIntegrations,
        lastCreated: Date,
        lastTtl: number,
        services?: MLSService[],
        site?: string,
    }
}

interface MongoWhereQuery {
    [key: string]: string | string[] | number | MongoWhereQuery[] | {
        inq?: string[] | number[],
        in?: string[] | number[], // Only for nested queries (alternative to inq)
        between?: number[],
        gte?: number,
        lte?: number,
        like?: string,
        options?: string,
        and?: MongoWhereQuery[],
        or?: MongoWhereQuery[]
    }
}

// Used locally to store a number of index prepared queries
interface IncludeOptions {
    [key: string]: MongoIncludeQuery
}


// type MongoOrderQuery = string[]
interface MongoOrderQuery extends Array<string> {
}


interface MongoIncludeQuery {
    relation: string,
    scope: {
        order?: string,
        fields?: '*' | string[],
        limit?: number,
    }
}

interface MongoFilterQuery {
    where: MongoWhereQuery,
    limit: number,
    skip: number,
    fields?: string[],
    order?: MongoOrderQuery,
    include?: MongoIncludeQuery[] | MongoIncludeQuery,
    count?: boolean,
}

export interface Office extends LooseObject {
    id: string
    OfficeKey: string
    OfficeMlsId?: string
    _OfficeNumber?: string

    _unmapped?: {
        [key: string]: unknown
        _highlight?: boolean
    }
}

export interface Member extends LooseObject {
    id: string
    MemberKey: string
    MemberFullName?: string
    MemberFirstName?: string
    MemberLastName?: string
    _MemberNumber?: string
    OfficeKey: string
    OfficeMlsId?: string

    _unmapped?: {
        [key: string]: unknown
        _highlight?: boolean
    }
}

export interface Media extends LooseObject {
    MediaKey: string
    MediaURL?: string
}

export interface OpenHouse extends LooseObject {
    OpenHouseKey: string
    OpenHouseStartTime: Date
    OpenHouseEndTime?: Date
    OpenHouseStatus?: string
    ShowingAgentFirstName?: string
    ShowingAgentLastName?: string
}

export interface Property extends LooseObject {
    id: string
    ListingKey: string
    ListingId: string
    MlsStatus: string
    StandardStatus: string
    PropertyType: string
    PropertySubType: string
    ListPrice: number
    ClosePrice: number

    // Time
    ModificationTimestamp: Date

    // TODO need to add basic types

    // Location
    UnparsedAddress?: string
    StreetNumberNumeric?: number
    StreetNumber?: string
    StreetDirPrefix?: string
    StreetName?: string
    StreetSuffix?: string
    StreetSuffixModifier?: string
    StreetDirSuffix?: string
    UnitNumber?: string
    City?: string
    StateOrProvince?: string
    PostalCode?: string
    Country?: string
    Latitude?: number
    Longitude?: number
    MapCoordinateSource?: string

    // Details
    BathroomsFull?: number
    BathroomsHalf?: number
    BathroomsOneQuarter?: number
    BathroomsPartial?: number
    BathroomsTotalInteger?: number
    BedroomsTotal?: number
    LivingArea?: number
    LivingAreaUnits?: string
    LotSizeArea?: number
    LotSizeUnits?: number
    LotSizeAcres?: number
    LotSizeSquareFeet?: number
    LeasableArea?: number
    LeasableAreaUnits?: string
    BuildingAreaTotal?: number
    BuildingAreaUnits?: string
    Stories?: number
    Levels?: string[]
    PublicRemarks?: string
    YearBuilt?: number
    PoolPrivateYN?: boolean
    InternetAddressDisplayYN?: boolean

    // Agent
    ListAgentFullName?: string
    ListAgentFirstName?: string
    ListAgentLastName?: string
    ListAgentDirectPhone?: string
    ListAgentOfficePhone?: string
    CoListAgentFullName?: string
    CoListAgentFirstName?: string
    CoListAgentLastName?: string
    BuyerAgentFullName?: string
    BuyerAgentFirstName?: string
    BuyerAgentLastName?: string
    CoBuyerAgentFullName?: string
    CoBuyerAgentFirstName?: string
    CoBuyerAgentLastName?: string

    [key: string]: unknown

    // Custom
    Images?: Media[]
    OpenHouses?: OpenHouse[]
    _ServiceId: number
    _Class: string
    _IsRental?: boolean
    _unmapped?: {
        [key: string]: unknown
        CoordinateModificationTimestamp?: Date
        _highlight?: boolean
    }
}

interface SearchObject {
    type: 'valueEquals' | // Input is a string, needs to equal another string or number field
        'stringLike' | // Input is a string, needs to be similar to another string field
        'stringLikeArray' | // Input is a string or array, one of which needs to be found similar to db string field
        'stringIncludesArray' | // Input is a string or array, one of which needs to be found equal to db string field
        'stringIncludesArrayAlternative' | // Input is a string or array, one of which needs to be found equal to db string field
        'numberEqualGreater' | // Input is a string/number, needs to equal or greater than another number field
        'numberEqualLess' | // Input is a string/number, needs to equal or less than another number field
        'andOr', // Input is a string/number, needs to evaluate on any of the supplied statements contained
    apiField?: string, // Used if the widgetField name is different from the field in database
    andOr?: Omit<SearchObject, 'andOr'>[]
}

export type IdxEmitter = (source: IdxComponentScope, var1?: any, var2?: any, var3?: any) => any
export type IdxEmitterInit = IdxEmitter & ((source: IdxComponentScope) => any)
export type IdxEmitterSessionInit = IdxEmitter & ((source: null) => any)
export type IdxEmitterCollectionUpdated = IdxEmitter & ((source: IdxListScope, collection?: Collection) => any)
export type IdxEmitterPageChanged = IdxEmitter & ((source: IdxListScope, pageNumber?: number) => any)
export type IdxEmitterPageChanging = IdxEmitter & ((source: IdxListScope, pageNumber?: number) => any)
export type IdxEmitterOrderChanged = IdxEmitter & ((source: IdxListScope, order?: string | string[]) => any)
export type IdxEmitterOrderChanging = IdxEmitter & ((source: IdxListScope, order?: string | string[]) => any)
export type IdxEmitterSearching = IdxEmitter & ((source: IdxComponentScope, query?: CompileFilterOptions) => any)
export type IdxEmitterSearched = IdxEmitter & ((source: IdxComponentScope, query?: CompileFilterOptions) => any)

// All Service functionality
const angularJsService = (
    // $injector: auto.IInjectorService,
    $http: IHttpService,
    $location: ILocationService,
    $mdToast: material.IToastService,
    $q: IQService,
    $rootScope: IRootScopeService,
    $window: IWindowService,
    ListTrac: any,
    orderByFilter: IFilterOrderBy
): IdxService => {
    const sharedValues: IdxSharedValue = {
        contactUrl: null,
        contactCommentVariable: null,
        contact: null,
        integrations: {
            analytics: {},
            maps: {}
        }
    }
    // Blank options to initialize arrays
    const defaultWhereOptions: WhereOptions = {
        City: [], // Added as default so search and manipulate
        eCity: [], // Added as default so search and manipulate
        UnparsedAddress: '', // Added as default so search and manipulate
        Location: '', // Added as default so search and manipulate
        eLocation: '', // Added as default so search and manipulate
        Status: [],
        ListingId: [],
        ListingType: [],
        CountyOrParish: [],
        eCountyOrParish: [],
        MLSAreaMajor: [], // DEPRECATED
        eMLSAreaMajor: [], // DEPRECATED
        SubdivisionName: [],
        eSubdivisionName: [],
        Neighborhood: [],
        eNeighborhood: [],
        PostalCode: [],
        // NOTE: at this point we don't know if CityRegion is used (or how it differs from MLSAreaMajor)
        CityRegion: [],
        eCityRegion: [],
        AgentLicense: [],
        OfficeNumber: [],
        OfficeName: []
    }
    let idxServicesEnabled: number[] = []
    let tokenRefreshURL = '/ajax/request?class=property.token_auth&method=getToken'
    let sessionInitialized = false
    let refreshLoginTimer: any // Timeout object
    let defaultPageTitle: string
    const instance: {
        disclaimer: {
            [uid: string]: IdxDisclaimerScope
        }
        map: {
            [uid: string]: IdxMapScope
        }
        member: {
            details: { [uid: string]: IdxDetailsScope }
            list: { [uid: string]: IdxListScope }
            search: { [uid: string]: IdxSearchScope }
        }
        office: {
            details: { [uid: string]: IdxDetailsScope }
            list: { [uid: string]: IdxListScope }
            search: { [uid: string]: IdxSearchScope }
        }
        property: {
            details: { [uid: string]: IdxDetailsScope }
            list: { [uid: string]: IdxListScope }
            search: { [uid: string]: IdxSearchScope }
        }
    } = {
        disclaimer: {},
        map: {},
        member: {
            details: {},
            list: {},
            search: {}
        },
        office: {
            details: {},
            list: {},
            search: {}
        },
        property: {
            details: {},
            list: {},
            search: {}
        }
    }

    /** type {{List: Object<[String]>, Search: Object<[String]>}} */
    const instanceLink: {
        Disclaimer: {
            [uid: string]: string[]
        }
        List: {
            [uid: string]: string[]
        }
        Map: {
            [uid: string]: string[]
        }
        Search: {
            [uid: string]: string[]
        }
    } = {
        Disclaimer: {},
        List: {},
        Map: {},
        Search: {}
    }

    const instanceOnEmitters: {
        [emitterUid: string]: {
            // [onMethodName: string]: IdxEmitter[]
            [onMethodName: string]: {[uid: string]: IdxEmitter}
            init?: {[uid: string]: IdxEmitterInit}
            sessionInit?: {[uid: string]: IdxEmitterSessionInit}
            collectionUpdated?: {[uid: string]: IdxEmitterCollectionUpdated}
            pageChanged?: {[uid: string]: IdxEmitterPageChanged}
            pageChanging?: {[uid: string]: IdxEmitterPageChanging}
            orderChanged?: {[uid: string]: IdxEmitterOrderChanged}
            orderChanging?: {[uid: string]: IdxEmitterOrderChanging}
            searched?: {[uid: string]: IdxEmitterSearched}
            searching?: {[uid: string]: IdxEmitterSearching}
        }
    } = {
        /*idx_property_list_7: {
            somethingChangedFake: [
                (source) => {
                    console.log('The something updated in this scope', source)
                }
            ],
            collectionUpdated: [
                (source: IdxComponentScope, collection: Collection) => {
                    console.log('The collection in this scope updated', source)
                    console.log('collection is now', collection)
                }
            ]
        }*/
    }

    /** type {{services: Array<MLSService>, lastCreated: Date, lastTtl: number}} */
    const session: Session = {
        services: [],
        lastCreated: new Date(),
        lastTtl: 0,
        contacts: []
    }

    const urlOptions: UrlsOptionsObject = {
        Listing: {},
        Search: {}
    }

    /**
     * The last where query that was sent we're holding on to. This is mostly so we can move from page to page properly.
     * type {{whereFilter: {}, pages: Array<Number>, perPage: number}}
     */
    const lastQueries: {
        whereFilter: object | any
        pages: number[]
        perPage: number
        order?: string | string[]
        time?: Date
    } = {
        whereFilter: {},
        pages: [],
        perPage: 0,
        time: null
    }

    // TODO infer the emit type
    function emit(
        emitterName: string,
        $scope: IdxComponentScope,
        var1?: any, var2?: any, var3?: any
    ) {
        emitManual(emitterName, $scope.elementId, $scope, var1, var2, var3)
    }

    function emitManual(
        emitterName: string,
        uid: string,
        $scope: IdxComponentScope,
        var1?: any, var2?: any, var3?: any
    ) {
        if (
            Object.prototype.hasOwnProperty.call(instanceOnEmitters, uid) &&
            Object.prototype.hasOwnProperty.call(instanceOnEmitters[uid], emitterName)
        ) {
            Object.values(instanceOnEmitters[uid][emitterName]).forEach((emitter) => {
                try {
                    emitter($scope, var1, var2, var3)
                } catch (e) {
                    console.error(e, 'issue sending back emitter on', uid, emitterName, emitter)
                }
            })
        }

        if (emitterName === 'init') {
            // Let's prep the requests for 'init' so they immediate call if this scope has already init
            instanceOnEmitters[uid] ??= {}
            instanceOnEmitters[uid][emitterName] ??= {}
        }
    }

    /**
     * Removes a registered on emitter watcher
     * @param emitterName - Id of on scope requesting event updates
     * @param emitterId - The source of emitting id
     * @param onId - Id of on scope requesting event updates
     */
    function removeOnManual(
        emitterName: string,
        emitterId: string,
        onId: string,
    ) {
        if (
            Object.prototype.hasOwnProperty.call(instanceOnEmitters, emitterId) &&
            Object.prototype.hasOwnProperty.call(instanceOnEmitters[emitterId], emitterName) &&
            Object.prototype.hasOwnProperty.call(instanceOnEmitters[emitterId][emitterName], onId)
        ) {
            delete instanceOnEmitters[emitterId][emitterName][onId]
        }
    }

    // TODO infer the emit type
    function on(
        uid: string,
        emitterName: string,
        callback: IdxEmitter
    ) {
        // console.log('a request has been made to watch for', uid, 'to emit', emitterName)
        // Let's check if an init request has already missed it's opportunity to init
        if (
            emitterName === 'init' &&
            Object.prototype.hasOwnProperty.call(instanceOnEmitters, uid) &&
            Object.prototype.hasOwnProperty.call(instanceOnEmitters[uid], emitterName) &&
            Object.prototype.hasOwnProperty.call(Stratus.Instances, uid)
        ) {
            // init has already happened.... so let's send back the emit of 'init' right now!
            // emit('init', Stratus.Instances[uid]) // wait, would this send the init a second time? maybe just send it to this callback
            callback(Stratus.Instances[uid])
            return
        }

        if (
            uid === 'Idx' &&
            emitterName === 'sessionInit' &&
            sessionInitialized
        ) {
            // sessionInitialized has already happened.... so let's send back the emit of 'sessionInitialized' right now!
            callback(null)
            return
        }

        if (!Object.prototype.hasOwnProperty.call(instanceOnEmitters, uid)) {
            instanceOnEmitters[uid] = {}
        }
        if (!Object.prototype.hasOwnProperty.call(instanceOnEmitters[uid], emitterName)) {
            instanceOnEmitters[uid][emitterName] = {}
        }
        const onId = uniqueId() // TODO make a named connection to the requesting scope??
        instanceOnEmitters[uid][emitterName][onId] = callback
        return (): void => {removeOnManual(uid, emitterName, onId)}
    }

    /**
     * Add Search instance to the service
     * @param uid - The elementId of a widget
     * @param $scope - angular scope
     * @param moduleName - Property / Member / Office
     */
    function registerDetailsInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property',
        $scope: IdxDetailsScope,
    ): void {
        instance[moduleName].details[uid] = $scope
    }

    /**
     * Add List instance to the service
     * @param uid - The elementId of a widget
     * @param $scope - angular scope
     * @param moduleName - Property / Member / Office
     */
    function registerListInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property',
        $scope: IdxListScope
    ): void {
        if (!Object.prototype.hasOwnProperty.call(instance, moduleName)) {
            instance[moduleName].list = {}
        }
        instance[moduleName].list[uid] = $scope
        if (!Object.prototype.hasOwnProperty.call(instanceLink.List, uid)) {
            instanceLink.List[uid] = []
        }
    }

    /**
     * Add Search instance to the service, potentially connecting to a List
     * @param uid - The elementId of a widget
     * @param $scope - angular scope
     * @param listUid -  uid name
     * @param moduleName - Property / Member / Office
     */
    function registerSearchInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property',
        $scope: IdxSearchScope,
        listUid?: string
    ): void {
        instance[moduleName].search[uid] = $scope
        if (!Object.prototype.hasOwnProperty.call(instanceLink.Search, uid)) {
            instanceLink.Search[uid] = []
        }
        if (listUid) {
            // console.log('added', uid, 'to', listUid, 'instanceLink')
            instanceLink.Search[uid].push(listUid)
            if (!Object.prototype.hasOwnProperty.call(instanceLink.List, listUid)) {
                instanceLink.List[listUid] = []
            }
            instanceLink.List[listUid].push(uid)
        }
    }

    /**
     * Destroy a reference and Instance of a Details widget
     * @param uid - The elementId of a widget
     * @param moduleName - Property / Member / Office
     */
    function unregisterDetailsInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property'
    ): void {
        if (Object.prototype.hasOwnProperty.call(instance[moduleName].details, uid)) {
            const detailUid = instance[moduleName].details[uid].elementId
            delete instance[moduleName].details[uid]
            Stratus.Instances.Clean(detailUid)
        }
    }

    /**
     * Add Map instance to the service
     * @param uid - The elementId of a widget
     * @param $scope - angular scope
     */
    function registerMapInstance(uid: string, $scope: IdxMapScope): void {
        if (!Object.prototype.hasOwnProperty.call(instance, 'map')) {
            instance.map = {}
        }
        instance.map[uid] = $scope
        if (!Object.prototype.hasOwnProperty.call(instanceLink.Map, uid)) {
            instanceLink.Map[uid] = []
        }
    }

    /**
     * Add Disclaimer instance to the service
     * @param uid - The elementId of a widget
     * @param $scope - angular scope
     */
    function registerDisclaimerInstance(uid: string, $scope: IdxDisclaimerScope): void {
        if (!Object.prototype.hasOwnProperty.call(instance, 'disclaimer')) {
            instance.disclaimer = {}
        }
        instance.disclaimer[uid] = $scope
        if (!Object.prototype.hasOwnProperty.call(instanceLink.Disclaimer, uid)) {
            instanceLink.Disclaimer[uid] = []
        }
    }

    /**
     * Return Blank options to initialize arrays
     */
    function getDefaultWhereOptions(): WhereOptions {
        return clone(defaultWhereOptions)
    }

    /**
     * Return the List scopes of a those connected to a particular Search widget
     * @param searchUid - uid of search component
     * @param moduleName - Property / Member / Office
     * FIXME only using IdxComponentScope until all converted
     */
    function getSearchInstanceLinks(
        searchUid: string,
        moduleName: 'member' | 'office' | 'property' = 'property'
    ): (IdxPropertyListScope | IdxComponentScope)[] {
        const linkedLists: (IdxPropertyListScope | IdxComponentScope)[] = []
        if (Object.prototype.hasOwnProperty.call(instanceLink.Search, searchUid)) {
            instanceLink.Search[searchUid].forEach((listUid: any) => {
                if (Object.prototype.hasOwnProperty.call(instance[moduleName].list, listUid)) {
                    linkedLists.push(instance[moduleName].list[listUid])
                }
            })
        }
        return linkedLists
    }

    /**
     * Return a List scope
     * @param listUid - uid of List
     * @param moduleName - Property / Member / Office
     * FIXME only using IdxComponentScope until all converted
     */
    function getListInstance(
        listUid: string,
        moduleName: 'member' | 'office' | 'property' = 'property'
    ): IdxPropertyListScope | IdxComponentScope | null {
        return Object.prototype.hasOwnProperty.call(instanceLink.List, listUid) ? instance[moduleName].list[listUid] : null
    }

    /**
     * Return the Search scopes of a those connected to a particular List widget
     * @param listUid - uid of list
     * @param moduleName - Property / Member / Office
     * FIXME only using IdxComponentScope until all converted
     */
    function getListInstanceLinks(
        listUid: string,
        moduleName: 'member' | 'office' | 'property' = 'property'
    ): (IdxPropertySearchScope | IdxMapScope | IdxComponentScope)[] {
        const linkedSearches: (IdxPropertySearchScope | IdxComponentScope)[] = []
        if (Object.prototype.hasOwnProperty.call(instanceLink.List, listUid)) {
            instanceLink.List[listUid].forEach((searchUid) => {
                if (Object.prototype.hasOwnProperty.call(instance[moduleName].list, searchUid)) {
                    linkedSearches.push(instance[moduleName].list[searchUid])
                }
            })
        }
        return linkedSearches
    }

    /**
     * Return a Disclaimer scope
     * @param disclaimerUid - uid of Disclaimer
     */
    function getDisclaimerInstance(disclaimerUid?: string): {[uid: string]: IdxDisclaimerScope} | null {
        return disclaimerUid ? (
            Object.prototype.hasOwnProperty.call(instance.disclaimer, disclaimerUid) ?
                {[instance.disclaimer[disclaimerUid].elementId]: instance.disclaimer[disclaimerUid]} : null
        ) : instance.disclaimer
    }

    /**
     * Apply a new Page title or revert to the original; page title
     * @param title - Page Title
     */
    function setPageTitle(title?: string): void {
        if (!defaultPageTitle) {
            // save default title first
            defaultPageTitle = JSON.parse(JSON.stringify($window.document.title))
        }
        if (!title) {
            // Revert to default
            $window.document.title = defaultPageTitle
        } else {
            // Apply new title
            $window.document.title = title
        }
    }

    /**
     * Retrieve what services that we are fetching tokens for
     */
    function getIdxServices(): number[] {
        return idxServicesEnabled
    }

    /**
     * Updates what services that we are fetching tokens for
     * @param services = services to fetches the tokens and search listings for
     */
    function setIdxServices(services: number[]): void {
        idxServicesEnabled = services
    }

    /**
     * Updates the token url to another path
     * @param url = URL to change to
     */
    function setTokenURL(url: string): void {
        tokenRefreshURL = url
    }

    /**
     * Ensures there is a active session and performs token fetching if need be.
     * @param keepAlive -
     */
    function tokenKeepAuth(keepAlive = false): IPromise<void> {
        return $q(async (resolve: void | any, reject: any) => {
            try {
                if (
                    Object.keys(session.services).length < 1 ||
                    session.expires < new Date(Date.now() + (5 * 1000)) // if expiring in the next 5 seconds
                ) {
                    // need to send ?cacheReset=true to ensure the token is new
                    await tokenRefresh(keepAlive, true)
                    resolve()
                } else {
                    resolve()
                }
            } catch (err) {
                console.error('tokenKeepAuth Error:', err)
                reject(err)
            }
        })
    }

    /**
     * Fetches a new set of Tokens for data fetching
     * @param keepAlive -
     * @param cacheReset - if the cache needs to forcibly be reset and ensure this is a fresh token
     */
    function tokenRefresh(keepAlive: boolean = false, cacheReset: boolean = false): IPromise<void> {
        // TODO request only certain service_ids (&service_id=0,1,9 or &service_id[]=0&service_id[]=9)
        return $q((resolve: void | any, reject: void | any) => {
            let additionalQueries = ''
            // Fetch from each service allowed
            if (idxServicesEnabled.length !== 0) {
                idxServicesEnabled.forEach((service) => {
                    additionalQueries += `&service[]=${service}`
                })
            }
            if (cacheReset) {
                additionalQueries += '&cacheReset=true'
            }

            $http({
                method: 'GET',
                url: tokenRefreshURL + additionalQueries
            }).then((response: TokenResponse | any) => {
                // response as TokenResponse
                if (
                    typeof response === 'object' &&
                    Object.prototype.hasOwnProperty.call(response, 'data') &&
                    Object.prototype.hasOwnProperty.call(response.data, 'services') &&
                    Object.prototype.hasOwnProperty.call(response.data.services, 'length')
                ) {
                    tokenHandleGoodResponse(response, keepAlive)
                    resolve()
                } else {
                    reject(tokenHandleBadResponse(response))
                }
            }, (response: TokenResponse) => { // TODO interface a response
                reject(tokenHandleBadResponse(response))
            })
        })
    }

    /**
     * Functions to do once successfully retrieve a new set of tokens.
     * Currently will set a timer to refresh tokens after XXX
     * @param response - valid token response
     * @param keepAlive -
     * @param response.data.services Array<MLSService>
     */
    function tokenHandleGoodResponse(response: TokenResponse, keepAlive = false): void {
        session.services = {}
        /** {MLSService} service */
        response.data.services.forEach((service) => {
            if (Object.prototype.hasOwnProperty.call(service, 'id')) {
                if (!Object.prototype.hasOwnProperty.call(service, 'fetchTime')) {
                    service.fetchTime = {
                        Property: null,
                        Media: null,
                        Member: null,
                        Office: null,
                        OpenHouse: null
                    }
                }
                if (
                    !Object.prototype.hasOwnProperty.call(service, 'analyticsEnabled') ||
                    service.analyticsEnabled === null
                ) {
                    service.analyticsEnabled = []
                }
                if (
                    !Object.prototype.hasOwnProperty.call(service, 'logo') ||
                    service.logo === null
                ) {
                    service.logo = {
                        default: null
                    }
                }
                if (
                    !Object.prototype.hasOwnProperty.call(service, 'mandatoryLogo') ||
                    service.mandatoryLogo === null
                ) {
                    service.mandatoryLogo = []
                }
                session.services[service.id] = service
                session.lastCreated = new Date(service.created)// The object is a String being converted to Date
                session.lastTtl = service.ttl
                // Set to expire 15 secs before it actually does
                session.expires = new Date(session.lastCreated.getTime() + (session.lastTtl - 15) * 1000)
            }
        })

        // FIXME prevent more than a single service from populating. prefer the service other than 0
        /*if (session.services.length > 1) {
            let singleService = session.services.pop()
            if (singleService.id === 0) {
                // If this is the exclusive... try once again
                singleService = session.services.pop()
            }
            session.services = []
            session.services[singleService.id] = singleService
        }*/

        // Compile a contact from the response if it exists
        if (
            Object.prototype.hasOwnProperty.call(response.data, 'contactUrl')
            && response.data.contactUrl !== ''
        ) {
            sharedValues.contactUrl = response.data.contactUrl
        }

        if (
            Object.prototype.hasOwnProperty.call(response.data, 'contactCommentVariable')
            && response.data.contactCommentVariable !== ''
        ) {
            sharedValues.contactCommentVariable = response.data.contactCommentVariable
        }

        // Compile a contact from the response if it exists
        if (Object.prototype.hasOwnProperty.call(response.data, 'contact')) {
            sharedValues.contact = {
                name: '',
                emails: {},
                locations: {},
                phones: {},
                socialUrls: {},
                urls: {},
            }

            if (
                Object.prototype.hasOwnProperty.call(response.data, 'site')
                && isString(response.data.site)
                && response.data.site !== ''
            ) {
                sharedValues.contact.name = response.data.site
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data, 'contactName')
                && isString(response.data.contactName)
                && response.data.site !== ''
            ) {
                sharedValues.contact.name = response.data.contactName
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data, 'contact')
                && isPlainObject(response.data.contact)
            ) {
                if (
                    Object.prototype.hasOwnProperty.call(response.data.contact, 'emails')
                    && isPlainObject(response.data.contact.emails)
                ) {
                    sharedValues.contact.emails = response.data.contact.emails
                }
                if (
                    Object.prototype.hasOwnProperty.call(response.data.contact, 'locations')
                    && isPlainObject(response.data.contact.locations)
                ) {
                    sharedValues.contact.locations = response.data.contact.locations
                }
                if (
                    Object.prototype.hasOwnProperty.call(response.data.contact, 'phones')
                    && isPlainObject(response.data.contact.phones)
                ) {
                    sharedValues.contact.phones = response.data.contact.phones
                }
                if (
                    Object.prototype.hasOwnProperty.call(response.data.contact, 'socialUrls')
                    && isPlainObject(response.data.contact.socialUrls)
                ) {
                    sharedValues.contact.socialUrls = response.data.contact.socialUrls
                }
                if (
                    Object.prototype.hasOwnProperty.call(response.data.contact, 'urls')
                    && isPlainObject(response.data.contact.urls)
                ) {
                    sharedValues.contact.urls = response.data.contact.urls
                }
            }
        }

        // Compile a contact from the response if it exists
        if (Object.prototype.hasOwnProperty.call(response.data, 'integrations')) {
            if (Object.prototype.hasOwnProperty.call(response.data.integrations, 'analytics')) {
                if (Object.prototype.hasOwnProperty.call(response.data.integrations.analytics, 'googleAnalytics')) {
                    if (
                        Object.prototype.hasOwnProperty.call(response.data.integrations.analytics.googleAnalytics, 'accountId')
                        && isString(response.data.integrations.analytics.googleAnalytics.accountId)
                        && response.data.integrations.analytics.googleAnalytics.accountId !== ''
                    ) {
                        sharedValues.integrations.analytics.googleAnalytics = {
                            accountId: response.data.integrations.analytics.googleAnalytics.accountId
                        }
                    }
                }
                if (Object.prototype.hasOwnProperty.call(response.data.integrations.analytics, 'listTrac')) {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            response.data.integrations.analytics.listTrac, 'accountId'
                        )
                        && isString(response.data.integrations.analytics.listTrac.accountId)
                        && response.data.integrations.analytics.listTrac.accountId !== ''
                    ) {
                        sharedValues.integrations.analytics.listTrac = {
                            accountId: response.data.integrations.analytics.listTrac.accountId
                        }
                        ListTrac.setAccountId(sharedValues.integrations.analytics.listTrac.accountId)
                        // FIXME we only need to load ListTrac/send an event when the the MLS is whitelisted for it
                    }
                }
            }
            if (Object.prototype.hasOwnProperty.call(response.data.integrations, 'maps')) {
                if (Object.prototype.hasOwnProperty.call(response.data.integrations.maps, 'googleMaps')) {
                    if (
                        Object.prototype.hasOwnProperty.call(response.data.integrations.maps.googleMaps, 'publicKey')
                        && isString(response.data.integrations.maps.googleMaps.publicKey)
                        && response.data.integrations.maps.googleMaps.publicKey !== ''
                    ) {
                        sharedValues.integrations.maps.googleMaps = {
                            publicKey: response.data.integrations.maps.googleMaps.publicKey
                        }
                    }
                }
            }
        }
        if (!sessionInitialized) {
            emitManual('sessionInit', 'Idx', null)
        }
        emitManual('sessionRefresh', 'Idx', null)
        sessionInitialized = true

        if (keepAlive) {
            tokenEnableRefreshTimer()
        }
    }

    /**
     * Functions to do if the token retrieval fails. For now it just outputs the errors
     * @param response -
     */
    function tokenHandleBadResponse(response: TokenResponse | any): string | any {
        let errorMessage: any = 'Token supplied is invalid or blank'
        if (
            typeof response === 'object' &&
            Object.prototype.hasOwnProperty.call(response, 'data') &&
            Object.prototype.hasOwnProperty.call(response.data, 'errors') &&
            Object.prototype.hasOwnProperty.call(response.data.errors, 'length')
        ) {
            // console.error('Token Error', response.data.errors)
            errorMessage = response.data.errors
        } else {
            // console.error('Token Error', response)
        }
        $mdToast.show(
            $mdToast.simple()
                .textContent('Unable to authorize Idx feed!')
                .toastClass('errorMessage')
                .position('top right')
                .hideDelay(5000)
        )
        return errorMessage
    }

    /**
     * Set a timer to attempt to run a token fetch again 15 secs before the current tokens expire
     */
    function tokenEnableRefreshTimer(): void {
        clearTimeout(refreshLoginTimer)
        refreshLoginTimer = setTimeout(async () => {
            await tokenRefresh()
        }, (session.lastTtl - 15) * 1000) // 15 seconds before the token expires
    }

    function updateFetchTime(
        apiFetch: Collection | Model,
        modelName: 'Property' | 'Media' | 'Member' | 'Office' | 'OpenHouse',
        serviceId: number): void {
        // TODO save collection.header.get('x-fetch-time') to MLSVariables
        const fetchTime = apiFetch.header.get('x-fetch-time')
        if (fetchTime) {
            const oldTime = session.services[serviceId].fetchTime[modelName]
            session.services[serviceId].fetchTime[modelName] = new Date(fetchTime)
            // TODO check differences or old vs new and push emit

            if (
                !(isDate(oldTime) && isDate(session.services[serviceId].fetchTime[modelName])) ||
                oldTime.getTime() !== session.services[serviceId].fetchTime[modelName].getTime()
            ) {
                // Only emit if there is a new time set
                emitManual('fetchTimeUpdate', 'Idx', null, serviceId, modelName, session.services[serviceId].fetchTime[modelName])
            }
        }
    }

    /**
     * Model constructor helper that will help properly create a new Model.
     * Will do nothing else.
     * @param request - Standard Registry request object
     * TODO define type Request
     */
    function createModel<T>(
        request: ModelOptions & {
            serviceId?: number
            api?: LooseObject | string
        }
    ): Model<T> {
        // request.direct = true;
        const model = new Model(request) as Model<T>
        if (
            Object.prototype.hasOwnProperty.call(request, 'api') &&
            request.api
        ) {
            model.meta.set('api', isJSON(request.api)
                ? JSON.parse(request.api as string)
                : request.api)
        }
        if (Object.prototype.hasOwnProperty.call(request, 'serviceId')) {
            model.serviceId = request.serviceId
        }
        return model
    }

    /**
     * Collection constructor helper that will help properly create a new Collection.
     * Will do nothing else.
     * @param request - Standard Registry request object
     * TODO define type Request
     */
    function createCollection<T>(request: any): Collection<T> {
        request.direct = true
        const collection = new Collection(request) as Collection<T>
        if (request.api) {
            collection.meta.set('api', isJSON(request.api)
                ? JSON.parse(request.api)
                : request.api)
        }
        return collection
    }

    /**
     * Fetch the results of multiple 'collections', then merge those results together into a single Collection
     * These resulting Collections may not be properly set up to perform their usual action and are only
     * intended to hold Model data
     * @param originalCollection - {Collection}
     * @param collections - {Array<Collection>}
     * @param modelName - {'Property'/'Office','Member'}
     * @param append -
     */
    async function fetchMergeCollections<T>(
        originalCollection: Collection<T>,
        collections: Collection<T>[],
        modelName: 'Property' | 'Member' | 'Office' | 'OpenHouse',
        append = false
    ): Promise<Collection<T>> {
        // The Collection is now doing something. Let's label it as such.
        originalCollection.pending = true
        originalCollection.completed = false

        let maxCount = 0 // Total records possible to grab with this query (can be less than totalCount)
        let totalCount = 0 // Total records in db with this query (can be more than maxCount)

        // Make Promises that each of the collections shall fetch their results
        const fetchPromises: any[] = []
        collections.forEach(collection => {
            const options: CollectionSyncOptions = {}
            if (session.services[collection.serviceId].token !== null) {
                options.headers = {
                    Authorization: session.services[collection.serviceId].token
                }
            }
            fetchPromises.push(
                $q(async (resolve: any[] | any) => {
                    await collection.fetch('POST', null, options)
                    await modelInjectProperty<T>(collection.models as T[], {
                        _ServiceId: collection.serviceId
                    })
                    // TODO save collection.header.get('x-fetch-time') to MLSVariables
                    updateFetchTime(collection, modelName, collection.serviceId)
                    const maxRecords = collection.header.get('x-max-count')
                    const countRecords = collection.header.get('x-total-count')
                    if (maxRecords) {
                        maxCount += parseInt(maxRecords, 10)
                    }
                    if (countRecords) {
                        totalCount += parseInt(countRecords, 10)
                        if (!maxRecords) {
                            maxCount += parseInt(countRecords, 10)
                        }
                    }
                    resolve(collection.models)
                })
            )
        })
        if (!append) {
            originalCollection.models.splice(0, originalCollection.models.length) // empties the array
        }
        return $q.all(fetchPromises)
            .then(
                async (fetchedData: T[][]): Promise<Collection<T>> => {
                    // Once all the Results are returned, starting merging them into the original Collection
                    await $q.all(fetchedData.map((models) => {
                        if (isArray(models)) {
                            (originalCollection.models as T[]).push(...models)
                        }
                    }))
                    return originalCollection
                }
            )
            .then(() => {
                originalCollection.header.set('x-max-count', maxCount)
                originalCollection.header.set('x-total-count', totalCount)
                originalCollection.meta.set('fetchDate', new Date())

                // The Collection is now ready, let's make sure we label it as such
                originalCollection.pending = false
                originalCollection.completed = true
                originalCollection.filtering = false
                originalCollection.paginate = false

                return originalCollection
            })
    }

    /**
     * Fetch the results of one Model, then merge those results together into a single existing Model
     * These resulting Model may not be properly set up to perform their usual action and are only intended to hold Model data
     * @param originalModel - {Model}
     * @param newModel - {Model}
     * @param modelName - {string}
     */
    function fetchReplaceModel<T>(
        originalModel: Model<T>,
        newModel: Model<T>,
        modelName: 'Property' | 'Member' | 'Office' | 'OpenHouse'
    ): IPromise<Model<T>> {
        // The Model is now doing something. Let's label it as such.
        originalModel.pending = true
        originalModel.completed = false

        // Make Promises that each of the Models shall fetch their results. We're only using a single one here
        const fetchPromises = []
        const options: ModelSyncOptions = {}
        if (session.services[newModel.serviceId].token !== null) {
            options.headers = {
                Authorization: session.services[newModel.serviceId].token
            }
        }
        fetchPromises.push(
            $q(async (resolve: any[] | any) => {
                await newModel.fetch('POST', null, options)
                // Inject the local server's Service Id loaded from
                await modelInjectProperty<T>([newModel.data], {
                    _ServiceId: newModel.serviceId
                })
                updateFetchTime(newModel, modelName, newModel.serviceId)
                resolve(newModel.data)
            })
        )
        return $q.all(fetchPromises)
            .then(
                async (fetchedData: T[]): Promise<Model<T>> => {
                    // Once all the Results are returned, shove them into the original Model
                    await $q.all(fetchedData.map((data) => {
                        originalModel.data = data
                    }))
                    return originalModel
                }
            )
            .then(() => {
                originalModel.meta.set('fetchDate', new Date())

                // The Model is now ready, let's make sure we label it as such
                originalModel.pending = false
                originalModel.completed = true

                return originalModel
            })
    }

    /**
     * Inject Data into an array of models
     * @param modelDatas (either collection.models || model.data) {Array<Object>}
     * @param properties - {Object<String, *>}
     */
    function modelInjectProperty<T>(modelDatas: (Model<T>['data'])[], properties: { [key: string]: any }): IPromise<void[]> {
        return $q.all(modelDatas.map((modelData) => {
            extend(modelData, properties)
        }))
    }

    /**
     * Sync a Collection with all members of a certain instance
     */
    function createOrSyncCollectionVariable<T>(
        uid: string,
        moduleName: 'office' | 'member' | 'property',
        scopedCollectionVarName: string
    ): Collection<T> {
        let collection: Collection<T> // TODO define Collection
        Object.keys(instance[moduleName].list).forEach(listName => {
            if (
                !collection &&
                listName === uid &&
                Object.prototype.hasOwnProperty.call(instance[moduleName].list, listName) &&
                Object.prototype.hasOwnProperty.call(instance[moduleName].list[listName], scopedCollectionVarName) &&
                instance[moduleName].list[listName][scopedCollectionVarName] instanceof Collection
            ) {
                // collection = instance[instanceType][listName][scopedCollectionVarName]
                collection = (instance[moduleName].list[listName][scopedCollectionVarName] as unknown as Collection<T>)
            }
        })
        if (!collection) {
            collection = new Collection() as Collection<T>
        }
        Object.keys(instance[moduleName].list).forEach(listName => {
            if (
                listName === uid &&
                (
                    !Object.prototype.hasOwnProperty.call(instance[moduleName].list[listName], scopedCollectionVarName) ||
                    (instance[moduleName].list[listName][scopedCollectionVarName] as unknown as Collection<T>) !== collection
                )
            ) {
                (instance[moduleName].list[listName][scopedCollectionVarName] as unknown as Collection<T>) = collection
            }
        }, this)
        return collection
    }

    /**
     * @param where - {WhereOptions}
     * @param searchPossibilities List of Fields we can search for within the Widget's URL and option on List pages
     * The key is the field that the Widget accepts/expects
     * The apiField is the key that the microIdx can accept
     */
    function compileGenericWhereFilter(where: WhereOptions, searchPossibilities: { [key: string]: SearchObject }): MongoWhereQuery {
        const whereQuery: MongoWhereQuery = {}
        // andStatement is the collection of query's nested in an And filter
        const andStatement: MongoWhereQuery[] = [] // TS detecting [] as string[] otherwise

        // The type of search functions used by the above options
        // TODO since is still not fully optimized, but it's now much clean to look at and works faster
        // TODO whereQuery was not added
        const searchFunctions: {
            [key: string]: (searchObject: SearchObject, value: any) => void
        } = {
            valueEquals: (searchObject, value) => {
                // Allow empty equal requests, as this can bring intentional results
                whereQuery[searchObject.apiField] = value
            },
            stringLike: (searchObject, value) => {
                // Don't perform empty like searches
                if (!isEmpty(value)) {
                    whereQuery[searchObject.apiField] = {
                        like: value,
                        options: 'i'
                    }
                }
            },
            stringLikeArray: (searchObject, value) => {
                value = typeof value === 'string' ? [value] : value

                if (value.length > 1) {
                    const stringLikeArrayOrStatement: MongoWhereQuery[] = []
                    value.forEach((requestedValue: string) => {
                        // Don't perform empty like searches
                        if (!isEmpty(requestedValue)) {
                            stringLikeArrayOrStatement.push({
                                [searchObject.apiField]: {
                                    like: requestedValue,
                                    options: 'i'
                                }
                            })
                        }
                    })
                    if (!isEmpty(stringLikeArrayOrStatement)) {
                        andStatement.push({or: stringLikeArrayOrStatement})
                    }
                } else if (value.length === 1) {
                    if (!isEmpty(value[0])) {
                        whereQuery[searchObject.apiField] = {
                            like: value[0],
                            options: 'i'
                        }
                    }
                }
            },
            stringIncludesArray: (searchObject, value) => {
                value = typeof value === 'string' ? [value] : value
                if (value.length > 1) {
                    whereQuery[searchObject.apiField] = {
                        inq: value
                    }
                } else if (value.length === 1) {
                    whereQuery[searchObject.apiField] = value[0]
                }
            },
            stringIncludesArrayAlternative: (searchObject, value) => {
                // For some reason, `inq` doesn't work in certain situations. This is to overcome that
                value = typeof value === 'string' ? [value] : value
                if (value.length > 1) {
                    whereQuery[searchObject.apiField] = {
                        in: value
                    }
                } else if (value.length === 1) {
                    whereQuery[searchObject.apiField] = value[0]
                }
            },
            numberEqualGreater: (searchObject, value) => {
                if (value && value !== 0) {
                    if (
                        Object.prototype.hasOwnProperty.call(whereQuery, searchObject.apiField) &&
                        Object.prototype.hasOwnProperty.call(whereQuery[searchObject.apiField], 'lte')
                    ) {
                        // If a Less than already is being searched
                        whereQuery[searchObject.apiField] = {
                            between: [
                                parseInt(value, 10),
                                parseInt(get(whereQuery[searchObject.apiField], 'lte'), 10)
                            ]
                        }
                    } else {
                        whereQuery[searchObject.apiField] = {gte: parseInt(value, 10)}
                    }
                }
            },
            numberEqualLess: (searchObject, value) => {
                if (value && value !== 0) {
                    if (
                        Object.prototype.hasOwnProperty.call(whereQuery, searchObject.apiField) &&
                        Object.prototype.hasOwnProperty.call(whereQuery[searchObject.apiField], 'gte')
                    ) {
                        // If a Greater than already is being searched
                        whereQuery[searchObject.apiField] = {
                            between: [
                                parseInt(get(whereQuery[searchObject.apiField], 'gte'), 10),
                                parseInt(value, 10)
                            ]
                        }
                    } else {
                        whereQuery[searchObject.apiField] = {lte: parseInt(value, 10)}
                    }
                }
            },
            andOr: (searchObject, value) => {
                if (Object.prototype.hasOwnProperty.call(searchObject, 'andOr')) {
                    // andOr works similar to the queries above, where the types are just nested ORs
                    // andOrOrStatement is the collection of query's nested in an Or filter
                    // that will later be added to andStatement
                    const andOrOrStatement: MongoWhereQuery[] = []
                    searchObject.andOr.forEach((orObject) => {
                        if (orObject.type === 'valueEquals') {
                            andOrOrStatement.push({
                                [orObject.apiField]: value
                            })
                        } else if (orObject.type === 'stringLike') {
                            // Don't perform empty like searches
                            if (!isEmpty(value)) {
                                andOrOrStatement.push({
                                    [orObject.apiField]: {
                                        like: value,
                                        options: 'i'
                                    }
                                })
                            }
                        } else if (orObject.type === 'stringLikeArray') {
                            value = typeof value === 'string' ? [value] : value
                            if (value.length > 1) {
                                value.forEach((requestedValue: string) => {
                                    // Don't perform empty like searches
                                    if (!isEmpty(requestedValue)) {
                                        andOrOrStatement.push({
                                            [orObject.apiField]: {
                                                like: requestedValue,
                                                options: 'i'
                                            }
                                        })
                                    }
                                })
                            } else if (value.length === 1) {
                                // Don't perform empty like searches
                                if (!isEmpty(value[0])) {
                                    andOrOrStatement.push({
                                        [orObject.apiField]: {
                                            like: value[0],
                                            options: 'i'
                                        }
                                    })
                                }
                            }
                        } else if (orObject.type === 'stringIncludesArray') {
                            value = typeof value === 'string' ? [value] : value
                            if (value.length > 1) {
                                andOrOrStatement.push({
                                    [orObject.apiField]: {
                                        inq: value
                                    }
                                })
                            } else if (value.length === 1) {
                                andOrOrStatement.push({
                                    [orObject.apiField]:  value[0]
                                })
                            }
                        }
                    })

                    if (!isEmpty(andOrOrStatement)) {
                        // andStatement.push({or: andOrOrStatement})
                        if (andOrOrStatement.length > 1) {
                            andStatement.push({or: andOrOrStatement})
                        } else if (andOrOrStatement.length === 1) {
                            andStatement.push(andOrOrStatement[0])
                        }
                    }
                }
            }
        }

        // This loops through all the set Fields above to convert into a where query
        for (const [widgetField, searchObject] of Object.entries(searchPossibilities)) {
            // Ensure each searchObject has a apiField targeted by default
            if (!Object.prototype.hasOwnProperty.call(searchObject, 'apiField')) {
                searchObject.apiField = widgetField
            }

            if (
                Object.prototype.hasOwnProperty.call(searchFunctions, searchObject.type) &&
                Object.prototype.hasOwnProperty.call(where, widgetField) &&
                where[widgetField] !== ''
            ) {
                searchFunctions[searchObject.type](searchObject, where[widgetField])
            }
        }

        if (!isEmpty(andStatement)) {
            whereQuery.and = andStatement
        }

        return whereQuery
    }

    /**
     * @param where - {WhereOptions}
     */
    function compilePropertyWhereFilter(where: WhereOptions): MongoWhereQuery {
        return compileGenericWhereFilter(
            where,
            {
                ListingKey: {
                    type: 'valueEquals'
                },
                ListingId: {
                    type: 'stringIncludesArray'
                },
                ListingType: {
                    type: 'stringIncludesArray'
                },
                Status: {
                    type: 'stringIncludesArray'
                },
                ListPriceMin: {
                    type: 'numberEqualGreater',
                    apiField: '_BestPrice'
                },
                ListPriceMax: {
                    type: 'numberEqualLess',
                    apiField: '_BestPrice'
                },
                Bathrooms: {
                    type: 'numberEqualGreater'
                },
                Bedrooms: {
                    type: 'numberEqualGreater',
                    apiField: 'BedroomsTotal'
                },
                AgentLicense: {
                    type: 'stringIncludesArray'
                },
                OfficeNumber: {
                    type: 'stringIncludesArray'
                },
                OfficeName: {
                    type: 'stringIncludesArray'
                },
                // Filters by only listings with OpenHouses
                OpenHouseOnly: {
                    type: 'valueEquals'
                },
                // TODO: replace this with a generic API field that supports all MLS (which may not have
                // TODO: Unparsed Address but instead have StreetName, StreetNumber, etc.
                UnparsedAddress: {
                    type: 'stringLike'
                },
                City: {
                    type: 'stringLikeArray'
                },
                eCity: {
                    apiField: 'City',
                    type: 'stringIncludesArray'
                },
                PostalCode: {
                    type: 'stringIncludesArray'
                },
                CountyOrParish: {
                    // Note: only 'in' seems to work as a replacement for inq when nested in another object
                    type: 'stringLikeArray'
                },
                eCountyOrParish: {
                    apiField: 'CountyOrParish',
                    // stringIncludesArrayAlternative
                    type: 'stringIncludesArray'
                },
                SubdivisionName: {
                    // Note: only 'in' seems to work as a replacement for inq when nested in another object
                    type: 'stringLikeArray'
                },
                eSubdivisionName: {
                    apiField: 'SubdivisionName',
                    type: 'stringIncludesArray'
                },
                MLSAreaMajor: { // DEPRECATED
                    // Note: only 'in' seems to work as a replacement for inq when nested in another object
                    type: 'stringLikeArray'
                },
                eMLSAreaMajor: { // DEPRECATED
                    apiField: 'MLSAreaMajor',
                    type: 'stringIncludesArray'
                },
                CityRegion: {
                    // Note: only 'in' seems to work as a replacement for inq when nested in another object
                    type: 'stringLikeArray'
                },
                eCityRegion: {
                    apiField: 'CityRegion',
                    type: 'stringIncludesArray'
                },
                Location: {
                    type: 'andOr',
                    andOr: [
                        {apiField: 'City', type: 'stringLikeArray'},
                        {apiField: 'CityRegion', type: 'stringLikeArray'},
                        {apiField: 'CountyOrParish', type: 'stringLikeArray'},
                        {apiField: 'SubdivisionName', type: 'stringLikeArray'},
                        {apiField: 'MLSAreaMajor', type: 'stringLikeArray'}, // DEPRECATED
                        {apiField: 'PostalCode', type: 'stringLikeArray'},
                        // TODO: in the future we should pass in a new defined field like Address (that will
                        // TODO: search UnparsedAddress if it exists for the service, OR the API will parse
                        // TODO: it into StreetNumber, StreetName, StreetSuffix, depending on what's provided
                        // TODO: and all those are LIKE (but all must match LIKE)
                        {apiField: 'UnparsedAddress', type: 'stringLikeArray'},
                        {apiField: 'ListingId', type: 'stringIncludesArray'},
                    ]
                },
                eLocation: {
                    type: 'andOr',
                    andOr: [
                        {apiField: 'City', type: 'stringIncludesArray'},
                        {apiField: 'CityRegion', type: 'stringIncludesArray'},
                        {apiField: 'CountyOrParish', type: 'stringIncludesArray'},
                        {apiField: 'SubdivisionName', type: 'stringIncludesArray'},
                        {apiField: 'MLSAreaMajor', type: 'stringIncludesArray'}, // DEPRECATED
                        {apiField: 'PostalCode', type: 'stringIncludesArray'},
                        // TODO: in the future we should pass in a new defined field like Address (that will
                        // TODO: search UnparsedAddress if it exists for the service, OR the API will parse
                        // TODO: it into StreetNumber, StreetName, StreetSuffix, depending on what's provided
                        // TODO: and all those are LIKE (but all must match LIKE)
                        // Disabled UnparsedAddress as it is regex and not equals
                        // {apiField: 'UnparsedAddress', type: 'stringLikeArray'},
                        {apiField: 'ListingId', type: 'stringIncludesArray'},
                    ]
                },
                Neighborhood: {
                    type: 'andOr',
                    andOr: [
                        {apiField: 'CityRegion', type: 'stringLikeArray'},
                        {apiField: 'SubdivisionName', type: 'stringLikeArray'},
                        {apiField: 'MLSAreaMajor', type: 'stringLikeArray'} // DEPRECATED
                    ]
                },
                eNeighborhood: {
                    type: 'andOr',
                    andOr: [
                        {apiField: 'CityRegion', type: 'stringIncludesArray'},
                        {apiField: 'SubdivisionName', type: 'stringIncludesArray'},
                        {apiField: 'MLSAreaMajor', type: 'stringIncludesArray'} // DEPRECATED
                    ]
                }
            }
            )
    }

    /**
     * @param where - {WhereOptions}
     */
    function compileMemberWhereFilter(where: WhereOptions): MongoWhereQuery {
        return compileGenericWhereFilter(
            where,
            {
                MemberKey: {
                    type: 'valueEquals'
                },
                MemberStateLicense: {
                    type: 'valueEquals'
                },
                MemberNationalAssociationId: {
                    type: 'valueEquals'
                },
                MemberStatus: {
                    type: 'valueEquals'
                },
                MemberFullName: {
                    type: 'stringLike'
                }
            }
        )
    }

    /**
     * @param where - {WhereOptions}
     */
    function compileOfficeWhereFilter(where: WhereOptions): MongoWhereQuery {
        return compileGenericWhereFilter(
            where,
            {
                OfficeKey: {
                    type: 'valueEquals'
                },
                OfficeNationalAssociationId: {
                    type: 'valueEquals'
                },
                OfficeStatus: {
                    type: 'valueEquals'
                },
                OfficeNumber: {
                    type: 'stringIncludesArray'
                },
                OfficeName: {
                    type: 'stringLikeArray'
                }
            }
        )
    }

    /**
     * Convert the human given Order parameters to Loopback filter usable
     * @param orderUnparsed - String[] and String delimited with a `,` comma
     */
    function compileOrderFilter(orderUnparsed: string[] | string): MongoOrderQuery {
        if (typeof orderUnparsed === 'string') {
            orderUnparsed = orderUnparsed.split(',')
        }
        const orderQuery: MongoOrderQuery = []

        orderUnparsed.forEach(orderName => {
            let direction = 'ASC'
            if (orderName.charAt(0) === '-') {
                orderName = orderName.substring(1, orderName.length)
                direction = 'DESC'
            }
            orderQuery.push(orderName + ' ' + direction)
        })
        return orderQuery
    }

    function compileGenericFilter(
        options: CompileFilterOptions,
        filterFunction: (where: WhereOptions) => MongoWhereQuery
    ): MongoFilterQuery {
        if (!options.perPage) {
            options.perPage = 20
        }

        // Ensure we do not skip past some records by getting a list of what we need
        let activeServices = 0
        if (
            typeof options.service === 'number' ||
            typeof options.service === 'string'
        ) {
            options.service = [options.service]
        }
        options.service.forEach(serviceId => {
            if (Object.prototype.hasOwnProperty.call(session.services, serviceId)) {
                activeServices++
            }
        })
        // always ensure that it's 1 or greater
        activeServices = activeServices >= 1 ? activeServices : 1

        let skip = 0
        if (options.page) {
            // Divide skip by number of active services to get the correct page count
            skip = (options.page - 1) * options.perPage / activeServices
        }
        const filterQuery: MongoFilterQuery = {
            where: filterFunction(options.where),
            limit: options.perPage,
            skip
        }

        if (options.fields) {
            filterQuery.fields = options.fields
        }

        if (options.order && options.order.length > 0) {
            filterQuery.order = compileOrderFilter(options.order)
        }

        // Handle included collections
        const includes: MongoIncludeQuery[] = []
        const includeOptions: IncludeOptions = {
            images: {
                relation: 'Images',
                scope: {
                    order: 'Order',
                    fields: [
                        'MediaURL'
                    ]
                }
            },
            openhouses: {
                relation: 'OpenHouses',
                scope: {
                    order: 'OpenHouseStartTime', // FIXME should be ordered by default on db side (default scopes)
                    fields: [
                        'OpenHouseStartTime',
                        'OpenHouseEndTime'
                    ]
                }
            },
            office: {
                relation: 'Office',
                scope: {
                    fields: [
                        'OfficeName',
                        'OfficeKey'
                    ]
                }
            },
            managingBroker: {
                relation: 'Member',
                scope: {
                    fields: [
                        'MemberFullName',
                        'MemberStateLicense',
                        'MemberKey'
                    ]
                }
            },
            members: {
                relation: 'Member',
                scope: {
                    fields: [
                        'MemberFullName',
                        'MemberStateLicense',
                        'MemberKey'
                    ]
                }
            }
        }

        // Included Images, Open Houses (Property Only), Office (Member Only),
        // Managing Broker Member Data (Office Only), Members/Agents (Office Only)
        Object.entries(includeOptions).forEach(([optionName, includeItem]) => {
            if (Object.prototype.hasOwnProperty.call(options, optionName)) {
                const option: any = options[optionName]
                if (typeof option === 'object') {
                    if (Object.prototype.hasOwnProperty.call(option, 'fields')) {
                        if (option.fields === '*') {
                            delete includeItem.scope.fields
                        } else {
                            includeItem.scope.fields = option.fields
                        }
                    } else if (
                        Object.prototype.hasOwnProperty.call(option, 'limit') &&
                        isNumber(option.limit)
                    ) {
                        includeItem.scope.limit = option.limit
                    }
                }

                if (option !== false) {
                    includes.push(includeItem)
                }
            }
        })

        if (includes.length === 1) {
            filterQuery.include = includes[0]
        } else if (includes.length > 1) {
            filterQuery.include = includes
        }

        if (filterQuery.fields.length <= 0) {
            delete filterQuery.fields
        }

        return filterQuery
    }

    /**
     *
     * @param options - {Object}
     * @param options.where - {WhereOptions}
     * @param options.page -
     * @param options.perPage -
     * @param options.order - {[String]=}
     * @param options.fields - Which Fields to return {[String]=}
     * @param options.images - Include Image data {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {[String]=}
     */
    function compilePropertyFilter(
        options: Pick<CompileFilterOptions, 'where' | 'page' | 'perPage' | 'order' | 'fields' | 'images' | 'openhouses'>
    ): MongoFilterQuery {
        return compileGenericFilter(options, compilePropertyWhereFilter)
    }

    /**
     *
     * @param options -
     * @param options.where -
     * @param options.order - {[String]=}
     * @param options.fields - Which Fields to return {[String]=}
     * @param options.images - Include Image data {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {[String]=}
     * @param options.office - Include Office data {Boolean || Object =}
     * TODO interface these options and Extend?
     */
    function compileMemberFilter(
        options: Pick<CompileFilterOptions, 'where' | 'page' | 'perPage' | 'order' | 'fields' | 'images' | 'office'>
    ): MongoFilterQuery {
        return compileGenericFilter(options, compileMemberWhereFilter)
    }

    /**
     *
     * @param options -
     * @param options.where -
     * @param options.order - {[String]=}
     * @param options.fields - Which Fields to return - {[String]=}
     * @param options.images - Include Image data - {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {[String]=}
     * @param options.managingBroker - Include Managing Broker Member data - {Boolean || Object =}
     * @param options.members - Include Member data - {Boolean || Object =}
     * @param options.members.limit - {Number=}
     * @param options.members.fields - {[String]=}
     */
    function compileOfficeFilter(
        options: Pick<CompileFilterOptions, 'where' | 'page' | 'perPage' | 'order' | 'fields' | 'images' | 'managingBroker' | 'members'>
    ): MongoFilterQuery {
        return compileGenericFilter(options, compileOfficeWhereFilter)
    }

    /**
     * Return the MLS' required variables
     * @param serviceIds - Specify a certain MLS Service get the variables from. {[Number]=}
     */
    function getMLSVariables(serviceIds?: number[]): MLSService[] {
        const serviceList: MLSService[] = []
        if (serviceIds && isArray(serviceIds)) {
            serviceIds.forEach(serviceId => {
                if (Object.prototype.hasOwnProperty.call(session.services, serviceId)) {
                    serviceList.push({
                        id: session.services[serviceId].id,
                        name: session.services[serviceId].name,
                        disclaimer: session.services[serviceId].disclaimer,
                        fetchTime: session.services[serviceId].fetchTime,
                        analyticsEnabled: session.services[serviceId].analyticsEnabled,
                        logo: session.services[serviceId].logo,
                        mandatoryLogo: session.services[serviceId].mandatoryLogo
                    })
                }
            })
        } else {
            Object.values(session.services).forEach(service => {
                if (!isEmpty(service)) {
                    serviceList.push({
                        id: service.id,
                        name: service.name,
                        disclaimer: service.disclaimer,
                        fetchTime: service.fetchTime,
                        analyticsEnabled: service.analyticsEnabled,
                        logo: service.logo,
                        mandatoryLogo: service.mandatoryLogo
                    })
                }
            })
        }
        return serviceList
    }

    /**
     * Return currently supply feed owner's contact information (if any)
     */
    function getContactVariables(): WidgetContact[] {
        return session.contacts
    }

    /**
     * Parse the hangbang Url for the serviceId and ListingKey of a listings
     * TODO give options on different ways to parse? (e.g. Url formatting)
     * returns {Object}
     */
    function getOptionsFromUrl(): UrlsOptionsObject {
        // console.log('running getOptionsFromUrl')
        let path = $location.path()

        path = getListingOptionsFromUrlString(path)
        getSearchOptionsFromUrlString(path)

        return urlOptions
    }

    /**
     * Parse the hang bang Url for the serviceId and ListingKey of a listings
     * Save variables in urlOptions.Listing
     * returns {String} - Remaining unparsed hashbang variables
     */
    function getListingOptionsFromUrlString(path: string): string {
        // FIXME can't read unless ListingKey must end with /
        // /Listing/1/81582540/8883-Rancho/
        // const regex = /\/Listing\/(\d+?)\/(.*?)\/([\w-_]*)?\/?/
        // Group 1 (Service Id) require match a digit between 1-3 characters
        // Group 2 (Listing Key) require match at least 1 character that's not a space or /
        // Group 3 (Address hash to dispose of) optionally match an ending / or a / with - delimited strings optionally ending with /
        const regex = /\/Listing\/(\d{1,3})\/([^/\s]+)(\/?[\w\-_]*\/?)?/
        const matches = regex.exec(path)
        path = path.replace(regex, '')
        if (
            matches !== null &&
            matches[1] &&
            matches[2]
        ) {
            // Save the variables inot
            urlOptions.Listing.service = matches[1]
            urlOptions.Listing.ListingKey = matches[2]
        }
        return path
    }

    /**
     * Parse the hangbang Url for any Search options
     * Save variables in urlOptions.Search
     * returns {String} - Remaining unparsed hangbang variables
     */
    function getSearchOptionsFromUrlString(path: string): string {
        // console.log('getSearchOptionsFromUrlString', path)
        // /Search/ListPriceMin/500000/SomeVar/aValue
        let regex = /\/Search\/(.*)?\/?/
        let matches = regex.exec(path)
        path = path.replace(regex, '')
        if (
            matches !== null &&
            matches[1]
        ) {
            const rawSearchOptions = matches[1]
            // Time to separate all the values out in pairs between /'s
            // standard had me remove regex = /([^\/]+)\/([^\/]+)/g  (notice the missing \'s)
            // regex = /([^/]+)\/([^/]+)/g
            // quantifying * (0+) instead of + (1+) allows noting empty strings and well as trailing values
            // Group 1 (Variable) match a digit between 1-3 characters
            regex = /([^/]+)\/([^/]*)/g

            const whileLoopAssignmentBypass = (regexp: RegExp, value: string) => {
                matches = regexp.exec(value)
                // console.log('whileLoopAssignmentBypass value', value, matches)
                return matches
            }

            // console.log('rawSearchOptions', clone(rawSearchOptions))
            // while ((matches = regex.exec(rawSearchOptions)) != null) {
            while (whileLoopAssignmentBypass(regex, rawSearchOptions) != null) {
                if (matches[1]) {
                    // Check for a comma to break into an array.
                    // This might need to be altered as sometimes a comma might be used for something
                    if (matches[2] && matches[2].includes(',')) {
                        // matches[2] = matches[2].split(',')
                        // Save the pairing results into urlOptions.Search
                        urlOptions.Search[matches[1]] = matches[2].split(',')
                    } else {
                        // Save the pairing results into urlOptions.Search
                        urlOptions.Search[matches[1]] = matches[2]
                    }
                }
            }
        }

        // Math is performed in Page and needs to be converted
        if (Object.prototype.hasOwnProperty.call(urlOptions.Search, 'Page')) {
            if (isString(urlOptions.Search.Page)) {
                urlOptions.Search.Page = parseInt(urlOptions.Search.Page, 10)
            }
        }

        return path
    }

    /**
     * Internally set Listing or Search options to later update the URL
     * @param listingOrSearch - {'Listing'||'Search'}
     * @param options - {Object}
     * TODO define options
     */
    function setUrlOptions(listingOrSearch: 'Listing' | 'Search', options: object | any) {
        // console.log('setUrlOptions ', listingOrSearch, clone(options))
        urlOptions[listingOrSearch] = options || {}
        // console.log('set url options', clone(urlOptions[listingOrSearch]))
    }

    /**
     * Return either Listing or Search Options
     * @param listingOrSearch - {'Listing'||'Search'}
     * returns {Object}
     */
    function getUrlOptions(listingOrSearch: 'Listing' | 'Search') {
        return urlOptions[listingOrSearch]
    }

    /**
     * Process the currently set options returns what the URL hashbang should be
     * returns {string}
     * TODO define defaultOptions
     */
    function getUrlOptionsPath(defaultOptions?: object | any) {
        defaultOptions ??= {}
        // console.log('getUrlOptionsPath defaultOptions', clone(defaultOptions))
        let path = ''

        // Set the Search List url variables
        const searchOptionNames = Object.keys(urlOptions.Search)
        // console.log('getUrlOptionsPath searchOptionNames', clone(searchOptionNames))
        if (searchOptionNames.length > 0) {
            let searchPath = ''
            searchOptionNames.forEach(searchOptionName => {
                // console.log('searchOptionName', searchOptionName)
                if (
                    Object.prototype.hasOwnProperty.call(urlOptions.Search, searchOptionName) &&
                    urlOptions.Search[searchOptionName] !== null
                    // && urlOptions.Search[searchOptionName] !== ''
                    // && urlOptions.Search[searchOptionName] !== 0// may need to correct this
                ) {
                    let defaultValue = defaultOptions[searchOptionName]
                    const compareValue = urlOptions.Search[searchOptionName]
                    if (
                        !isArray(defaultValue) &&
                        isArray(compareValue)
                    ) {
                        // If they both aren't arrays, make them so we can compare
                        defaultValue = [defaultValue]
                    }
                    if (!isEqual(defaultValue, compareValue)) {
                        console.log(searchOptionName, defaultValue, compareValue)
                        searchPath += searchOptionName + '/' + compareValue + '/'
                    }
                }
            })
            if (searchPath !== '') {
                path += 'Search/' + searchPath
            }
        }

        // Set the Listing Details url variables
        if (
            Object.prototype.hasOwnProperty.call(urlOptions.Listing, 'service') &&
            Object.prototype.hasOwnProperty.call(urlOptions.Listing, 'ListingKey') &&
            !isNaN(urlOptions.Listing.service) &&
            urlOptions.Listing.ListingKey
        ) {
            path += 'Listing' + '/' + urlOptions.Listing.service + '/' + urlOptions.Listing.ListingKey + '/'
            if (
                Object.prototype.hasOwnProperty.call(urlOptions.Listing, 'address') &&
                urlOptions.Listing.address &&
                typeof urlOptions.Listing.address === 'string'
            ) {
                path += urlOptions.Listing.address.replace(/ /g, '-') + '/'
            }
        }
        return path
    }

    /**
     * TODO: Remove
     * Output console if not in production
     */
    function devLog(...items: any): void {
        if (cookie('env')) {
            console.log(...items)
        }
    }

    /**
     * Return the last time a Search was sent in
     */
    function getLastQueryTime(): Date|null {
        return lastQueries.time
    }

    /**
     * Return the last time a Token was refreshed
     */
    function getLastSessionTime(): Date|null {
        return session.lastCreated
    }

    /**
     * Process the currently set options and update the URL with what should be known
     * TODO define defaultOptions
     */
    function refreshUrlOptions(defaultOptions: object | any): void {
        // console.log('refreshUrlOptions', clone(defaultOptions))
        // console.log('refreshUrlOptions getUrlOptionsPath', clone(getUrlOptionsPath(defaultOptions)))
        setLocationPath(getUrlOptionsPath(defaultOptions))
        // console.log('Refreshed url with', urlOptions, defaultOptions);
    }

    /**
     * Update the hashbang address bar. The path will always begin with #!/
     * @param path - {String}
     */
    function setLocationPath(path: string): void {
        // console.log('setLocationPath', path)
        $rootScope.$applyAsync(() => {
            $location.path(path).replace()
            // $location.path(path);
        })
    }

    /**
     * Reorder/sort a collection's models by a defined value
     * If using multiple property values, the first in the array take precedence
     * @param collection - {Collection}
     * @param propertyNames - value(s) to reorder/sort by. {String || [String]}
     * @param reverse - If it should reverse sort by the value. {Boolean=}
     */
    function orderBy(collection: Collection, propertyNames: string[] | string, reverse = false): void {
        if (propertyNames) {
            const orderPropertyNames = isArray(propertyNames) ? clone(propertyNames) : [clone(propertyNames)]
            // BestPrice hotfix, as the variable is actually _BestPrice. Should actually be requesting _BestPrice
            // Status hotfix, as the variable is actually _Status. Should actually be requesting MlsStatus or StandardStatus
            orderPropertyNames.forEach((item: string, index: number) => {
                if (item === 'BestPrice') {
                    orderPropertyNames[index] = '_BestPrice'
                } else if (item === '-BestPrice') {
                    orderPropertyNames[index] = '-_BestPrice'
                }
                if (item === 'Status') {
                    orderPropertyNames[index] = '_Status'
                } else if (item === '-Status') {
                    orderPropertyNames[index] = '-_Status'
                }
            })
            collection.models = orderByFilter(collection.models, orderPropertyNames, reverse)
        }
    }

    function getSingularApiModelName(name: string): 'Property' | 'Member' | 'Office' | 'OpenHouse' {
        let apiModelSingular: 'Property' | 'Member' | 'Office' | 'OpenHouse' = 'Property'
        switch (name) {
            case 'Properties':
                apiModelSingular = 'Property'
                break
            case 'Members':
                apiModelSingular = 'Member'
                break
            case 'Offices':
                apiModelSingular = 'Office'
                break
            case 'OpenHouses':
                apiModelSingular = 'OpenHouse'
                break
        }
        return apiModelSingular
    }

    /**
     * Will sync only with lists
     * @param uid - string
     * @param collectionVarName - The variable name assigned in the scope to hold the Collection results {String}
     * @param options - {Object=}
     * @param options.service - Specify certain MLS Services to load from - {[Number]=}
     * @param options.where - {WhereOptions=}
     * @param options.order - {[String]=}
     * @param options.images - Include Image data {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {[String]=}
     * @param options.fields - Which Fields to return {[String]=}
     * @param refresh - Which Fields to return {Boolean=}
     * @param moduleName - {String}
     * @param apiModel - {String}
     * @param compileFilterFunction - {Function}
     */
    async function genericSearchCollection<T>(
        uid: string,
        collectionVarName: string,
        options = {} as CompileFilterOptions,
        refresh = false,
        moduleName: 'office' | 'member' | 'property',
        apiModel: string,
        compileFilterFunction: (options: CompileFilterOptions) => MongoFilterQuery
    ): Promise<Collection<T>> {
        options.service ??= []
        options.where ??= {}
        options.order ??= []
        options.page ??= 1
        options.perPage ??= 10
        options.images ||= false
        options.fields ??= [
            '_id'
        ]

        if (typeof options.order === 'string') {
            options.order = options.order.split(',')
        }

        if (typeof options.service === 'number') {
            options.service = [options.service]
        }
        // FIXME temp bandaid here to require a service
        if (options.service.length === 0) {
            options.service = [0]
        }

        const apiModelSingular = getSingularApiModelName(apiModel)

        // Prepare the same Collection for each List
        const collection: Collection<T> = createOrSyncCollectionVariable<T>(uid, moduleName, collectionVarName)

        // Set API paths to fetch listing data for each MLS Service
        const filterQuery = compileFilterFunction(options)
        // options.page items need to happen after here

        const collections: Collection<T>[] = [] // TODO define Collection

        // check if this filterQuery is any different from the 'last one' used
        // if this is a new query rather than a page change
        if (
            !isEqual(lastQueries.whereFilter, filterQuery.where) ||
            lastQueries.order !== options.order ||
            lastQueries.perPage !== options.perPage ||
            refresh
        ) {
            // clear the current models to refresh a new batch
            collection.models.splice(0, collection.models.length)
            refresh = true
            lastQueries.pages = []
            filterQuery.count = true // request the Total Count of all results
        } else {
            refresh = false
        }

        // the page on doesn't have listings in buffer
        if (collection.models.length < (options.page * options.perPage)) {
            // need to fetch more
            // Ensure the changes update on the DOM to see that the list is now pending
            collection.pending = true
            Object.keys(instance[moduleName].list).forEach(listName => {
                // instance.List[listName].$digest(); // Digest to ensure the DOM/$watch updates with new model data
                instance[moduleName].list[listName].$applyAsync() // Digest to ensure the DOM/$watch updates with new model data
            })

            // need to also have all previous pages to ensure that sorting is correct (need to track previous pages loaded)
            if (
                options.page > 1 &&
                !lastQueries.pages.includes(options.page - 1, options.page - 2)
            ) {
                // console.log('The previous pages weren\'t buffered yet');
                // we'll need to load pages 1 through options.page
                filterQuery.limit = options.perPage * options.page
                filterQuery.skip = 0
                // add those page to lastQueries.pages
                for (let addPage = 1; addPage < options.page; addPage++) {
                    // settings as loaded page {addPage}
                    // console.log('settings as loaded previous page #', addPage);
                    lastQueries.pages.push(addPage)
                }
            }
            // Fetch from each service allowed
            if (options.service.length !== 0) {
                setIdxServices(options.service)
            } else {
                options.service = getIdxServices()
            }

            // fetch Tokens
            await tokenKeepAuth()

            // Fetch from each service allowed
            if (options.service.length === 0) {
                options.service = Object.keys(session.services) as unknown as number[] // keys are numbers
            }

            options.service.forEach((serviceId) => {
                // Only load from a specific MLS Service
                if (Object.prototype.hasOwnProperty.call(session.services, serviceId)) {
                    const filterQueryCustom = clone(filterQuery)
                    if (!refresh) {
                        filterQueryCustom.skip = (get(collection.meta, `data.recordCounts[${serviceId}]`) ?? 0) as number
                    }
                    const request = {
                        serviceId,
                        urlRoot: session.services[serviceId].host,
                        target: apiModel + '/search',
                        api: {
                            filter: filterQueryCustom,
                            // route and controller needed and only used by Sitetheory
                            meta: {
                                action: 'search',
                                format: 'reso'
                            },
                            route: {
                                controller: apiModelSingular // There might be a better way to do this // FIXME test removal
                            }
                        }
                    }

                    collections.push(
                        createCollection<T>(request)
                    )
                }
            })

            // When using the same WHERE and only changing the page, results should pool together (append)
            // Fetch and Merge all results together into single list
            await fetchMergeCollections<T>(collection, collections, apiModelSingular, !refresh)

            // If the query as updated, adjust the TotalRecords available
            if (refresh) {
                const maxRecords = collection.header.get('x-max-count') || 0
                const totalRecords = collection.header.get('x-total-count') || 0
                collection.meta.set('maxRecords', maxRecords)
                collection.meta.set('totalRecords', totalRecords)
                collection.meta.set('totalPages', Math.ceil((maxRecords || totalRecords) / options.perPage))
            }

            // Sort once more on the front end to ensure it's ordered correctly
            // console.log('needs to hit orderBy here')
            orderBy(collection, options.order) // FIXME await?

            // Cut out any model counts beyond how many we should currently have
            if (collection.models.length > (options.page * options.perPage)) {
                collection.models.splice(options.page * options.perPage, collection.models.length)
            }

            // count how many of each service's properties are in our collection
            const recordCounts: {[key: number]: number} = {}
            await $q.all((collection.models as T[]).map((model: T & {_ServiceId: number}) => {
                recordCounts[model._ServiceId] ??= 0
                recordCounts[model._ServiceId]++
            }))
            collection.meta.set('recordCounts', recordCounts)

            // Ensure the changes update on the DOM
            Object.keys(instance[moduleName].list).forEach(listName => {
                // instance.List[listName].$digest(); // Digest to ensure the DOM/$watch updates with new model data
                instance[moduleName].list[listName].$applyAsync() // Digest to ensure the DOM/$watch updates with new model data
            })
        }

        // then save this in the last queries
        lastQueries.whereFilter = clone(filterQuery.where)
        lastQueries.order = options.order
        lastQueries.perPage = options.perPage
        lastQueries.pages.push(options.page)
        // console.log('lastQueries:', lastQueries);
        // set last query time
        lastQueries.time = new Date()

        return collection
    }

    /**
     *
     * @param $scope - {Object}
     * @param modelVarName - The variable name assigned in the scope to hold the model results - {String}
     * @param options - {Object=}
     * @param options.service - Specify a certain MLS Service to load from - {Number}
     * @param options.where - {WhereOptions=}
     * @param options.images - Include Image data - {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {Array<String>=}
     * @param options.fields - Which Fields to return - {Array<String>=}
     * @param options.append - Append to currently loaded collection or fetch freshly - {Boolean=}
     * @param apiModel - {String}
     * @param compileFilterFunction - {Function}
     */
    async function genericSearchModel<T>(
        $scope: object | any,
        modelVarName: string,
        options = {} as CompileFilterOptions,
        apiModel: string,
        compileFilterFunction: (options: CompileFilterOptions) => MongoFilterQuery
    ): Promise<Model<T>> {
        await tokenKeepAuth()

        options.service ??= 0
        options.where ??= {}
        options.images ||= false
        options.fields ??= []
        options.perPage = 1

        if (isArray(options.service)) {
            options.service = options.service[0]
        }

        const apiModelSingular = getSingularApiModelName(apiModel)

        // Prepare the Model and ensure we don't keep replacing it
        let model: Model<T>
        if (Object.prototype.hasOwnProperty.call($scope, modelVarName)) {
            model = $scope[modelVarName]
        }
        if (!model) {
            model = new Model() as Model<T>
        }
        if (
            !Object.prototype.hasOwnProperty.call($scope, modelVarName) ||
            $scope[modelVarName] !== model
        ) {
            $scope[modelVarName] = model
        }

        if (
            Object.prototype.hasOwnProperty.call(session.services, options.service)
        ) {
            // Set API paths to fetch listing data for the specific MLS Service
            // let filterQuery = compileFilterFunction(options);

            const request: ModelOptions & {
                serviceId?: number
                api?: LooseObject | string
            } = {
                serviceId: options.service,
                urlRoot: session.services[options.service].host,
                target: apiModel + '/search',
                api: {
                    filter: compileFilterFunction(options),
                    // route and controller needed and only used by Sitetheory
                    meta: {
                        action: 'search',
                        format: 'reso'
                    },
                    route: {
                        controller: apiModelSingular // There might be a better way to do this
                    }
                }
            }

            const tempModel = createModel<T>(request)
            // tempModel.serviceId = options.service

            fetchReplaceModel<T>(model, tempModel, apiModelSingular)
                .then(() => {
                    // $scope.$digest();
                    $scope.$applyAsync()
                })
        }
        // set last query time
        lastQueries.time = new Date()

        return $scope[modelVarName]
    }

    /**
     *
     * @param uid - string
     * @param collectionVarName - The variable name assigned in the scope to hold the Collection results = {String}
     * @param options - {Object=}
     * @param options.service - Specify certain MLS Services to load from - {[Number]=}
     * @param options.where - {WhereOptions=}
     * @param options.order - {[String]=}
     * @param options.page - {Number=}
     * @param options.perPage - {Number=}
     * @param options.images - Include Image data - {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {[String]=}
     * @param options.openhouses - Include Openhouse data - {Boolean || Object =}
     * @param options.fields - Which Fields to return - {[String]=}
     * @param refresh - Append to currently loaded collection or fetch freshly - {Boolean=}
     */
    async function fetchProperties(
        // $scope: IdxComponentScope,
        uid: string,
        collectionVarName: string,
        options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'page' | 'perPage' | 'order' | 'fields' | 'images' | 'openhouses'>,
        refresh = false,
        // listName = 'PropertyList'
    ): Promise<Collection<Property>> {
        options.service ??= []
        // options.where = options.where || urlOptions.Search || {} // TODO may want to sanitize the urlOptions
        if (
            !options.where &&
            !isEmpty(urlOptions.Search)
        ) {
            // Do fancy, since UrlWhereOptions isn't allowed
            const whereReAssign: WhereOptions = urlOptions.Search as WhereOptions
            delete urlOptions.Search.Page
            delete urlOptions.Search.Order

            options.where = whereReAssign
        }
        options.where ??= {}
        options.order ??= urlOptions.Search.Order || []
        options.page ??= urlOptions.Search.Page || 1
        options.perPage ??= 10
        options.images ||= false
        options.fields ??= [
            '_id',
            '_Class',
            'MlsStatus',
            'PropertyType',
            'PropertySubType',
            'UnparsedAddress',
            'StreetNumber',
            'StreetNumberNumeric',
            'StreetName',
            'StreetSuffix',
            'UnitNumber',
            'City',
            'CityRegion',
            'MLSAreaMajor', // DEPRECATED
            'CountyOrParish',
            'StateOrProvince',
            'Latitude',
            'Longitude',
            'ListPrice',
            'ClosePrice',
            'ListingId',
            'ListingKey',
            'BathroomsTotalInteger',
            'BathroomsFull',
            'BathroomsHalf',
            'BathroomsOneQuarter',
            'BathroomsThreeQuarter',
            'BathroomsPartial',
            'BedroomsTotal'
        ]
        // options.where['ListType'] = ['House','Townhouse']
        // Include openhouses is filtered
        if (
            Object.prototype.hasOwnProperty.call(options.where, 'OpenHouseOnly') &&
            isString(options.where.OpenHouseOnly)
        ) {
            options.where.OpenHouseOnly = (options.where.OpenHouseOnly === 'true')
        }
        if (
            Object.prototype.hasOwnProperty.call(options.where, 'OpenHouseOnly') &&
            options.where.OpenHouseOnly
        ) {
            options.openhouses = true
        }
        // OpenHousesOnly can work fast enough if there is more filters. Disable otherwise
        if (
            isEmpty(options.where.Neighborhood) &&
            isEmpty(options.where.eNeighborhood) &&
            isEmpty(options.where.Location) &&
            isEmpty(options.where.eLocation) &&
            isEmpty(options.where.AgentLicense) &&
            isEmpty(options.where.OfficeNumber) &&
            isEmpty(options.where.City) &&
            isEmpty(options.where.eCity) &&
            isEmpty(options.where.CityRegion) &&
            isEmpty(options.where.eCityRegion) &&
            isEmpty(options.where.CountyOrParish) &&
            isEmpty(options.where.eCountyOrParish) &&
            isEmpty(options.where.MLSAreaMajor) && // DEPRECATED
            isEmpty(options.where.eMLSAreaMajor) && // DEPRECATED
            isEmpty(options.where.PostalCode) &&
            isEmpty(options.where.UnparsedAddress)
        ) {
            options.openhouses = false
            delete options.where.OpenHouseOnly
        }

        return genericSearchCollection<Property>(
            uid,
            collectionVarName,
            options,
            refresh,
            'property',
            'Properties',
            compilePropertyFilter
        )
    }

    /**
     *
     * @param $scope - {Object}
     * @param modelVarName - The variable name assigned in the scope to hold the model results - {String}
     * @param options - {Object=}
     * @param options.service - Specify a certain MLS Service to load from - {Number}
     * @param options.where - {WhereOptions=}
     * @param options.images - Include Image data - {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {Array<String>=}
     * @param options.openhouses - Include Openhouse data - {Boolean || Object =}
     * @param options.fields - Which Fields to return - {Array<String>=}
     */
    async function fetchProperty(
        $scope: object | any,
        modelVarName: string,
        options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'fields' | 'images' | 'openhouses'>,
    ): Promise<Model<Property>> {
        options.service ??= null
        options.where ??= {}
        options.images ||= false
        options.openhouses ||= false
        options.fields ??= []

        return genericSearchModel<Property>($scope, modelVarName, options,
            'Properties',
            compilePropertyFilter
        )
    }

    /**
     *
     * @param uid - string
     * @param collectionVarName - The variable name assigned in the scope to hold the Collection results - {String}
     * @param options - {Object=}
     * @param options.service - Specify certain MLS Services to load from - {[Number]=}
     * @param options.where - {WhereOptions=}
     * @param options.order - {[String]=}
     * @param options.page - {Number=}
     * @param options.perPage - {Number=}
     * @param options.fields - Which Fields to return - {[String]=}
     * @param options.images - Include Image data - {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {[String]=}
     * @param options.office - Include Office data - {Boolean || Object =}
     * @param refresh - Append to currently loaded collection or fetch freshly - {Boolean=}
     */
    async function fetchMembers(
        uid: string,
        collectionVarName: string,
        options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office'>,
        refresh = false
    ): Promise<Collection> {
        options.service ??= []
        // options.listName ??= 'MemberList'
        options.where ??= {}
        options.order ??= []
        options.page ??= 1
        options.perPage ??= 10
        options.images ||= false
        options.office ||= false
        options.fields ??= [
            '_id',
            'MemberKey',
            'MemberStateLicense',
            'MemberNationalAssociationId',
            'MemberFirstName',
            'MemberLastName',
            'MemberFullName',
            'MemberStatus',
            'MemberMlsAccessYN',
            'MemberType',
            'MemberAOR',
            'OfficeKey',
            'OfficeMlsId',
            'OfficeName',
            'OriginatingSystemName',
            'SourceSystemName'
        ]
        // options.where['ListType'] = ['House','Townhouse'];

        return genericSearchCollection<Member>(uid, collectionVarName, options, refresh,
            'member',
            'Members',
            compileMemberFilter
        )
    }

    /**
     *
     * @param uid - string
     * @param collectionVarName - The variable name assigned in the scope to hold the Collection results {String}
     * @param options - {Object=}
     * @param options.service - Specify certain MLS Services to load from {[Number]=}
     * @param options.where - {WhereOptions=}
     * @param options.order - {[String]=}
     * @param options.page - {Number=}
     * @param options.perPage - {Number=}
     * @param options.images - Include Image data {Boolean || Object =}
     * @param options.images.limit - {Number=}
     * @param options.images.fields - {[String]=}
     * @param options.managingBroker - Include Managing Broker Member data {Boolean || Object =}
     * @param options.members - Include Member data {Boolean || Object =}
     * @param options.fields - Which Fields to return {[String]=}
     * @param refresh - Append to currently loaded collection or fetch freshly - {Boolean=}
     */
    async function fetchOffices(
        uid: string,
        collectionVarName: string,
        options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office' | 'managingBroker' | 'members'>,
        refresh = false
    ): Promise<Collection> {
        options.service ??= []
        options.where ??= {}
        options.order ??= []
        options.page ??= 1
        options.perPage ??= 10
        options.images ||= false
        options.managingBroker ||= false
        options.members ||= false
        options.fields ??= [
            '_id',
            'OfficeKey',
            'OfficeMlsId',
            'OfficeName',
            'OfficeNationalAssociationId',
            'OfficeStatus',
            'OfficePhone',
            'OfficeAddress1',
            'OfficeCity',
            'OfficePostalCode',
            'OfficeBrokerKey'
        ]
        // options.where['ListType'] = ['House','Townhouse'];
        refresh ||= false

        return genericSearchCollection<Office>(uid, collectionVarName, options, refresh,
            'office',
            'Offices',
            compileOfficeFilter
        )
    }

    /**
     * Grabs a shorten more human and code friendly name of the property's status
     * When selecting a preferredStatus, 'Closed' wil always show a Closed listing as such.
     * preferredStatus = 'Leased', a Closed listing will either be 'Sold' or 'Leased'
     * preferredStatus = 'Rented', a Closed listing will either be 'Sold' or 'Rented'
     */
    function getFriendlyStatus(
        property: Property,
        preferredStatus: 'Closed' | 'Leased' | 'Rented' = 'Closed'
    ): 'Active' | 'Contingent' | 'Closed' | 'Leased' | 'Rented' | string {
        let statusName = ''
        if (
            Object.prototype.hasOwnProperty.call(property, 'MlsStatus') &&
            property.MlsStatus !== ''
        ) {
            statusName = property.MlsStatus
        } else if (
            Object.prototype.hasOwnProperty.call(property, 'StandardStatus') &&
            property.StandardStatus !== ''
        ) {
            statusName = property.StandardStatus
        }
        if (statusName !== '') {
            switch (statusName) {
                case 'Act Cont Release':
                case 'Act Cont Show':
                case 'Contingent - Release':
                case 'Contingent - Show':
                case 'Contingent-Release':
                case 'Contingent-Show': {
                    statusName = 'Contingent'
                    break
                }
                default:
                    statusName = getFriendlyClosedStatus(property, statusName, preferredStatus)
            }
        }
        return statusName
    }

    /**
     * Grabs a more human label to append in front the the prices
     * Depends on the ClosePrice and Status of a Proeprty
     */
    function getFriendlyPriceLabel(
        property: Property
    ): 'List Price' | 'Sale Price' | 'Lease Price' | 'Rent Price' | string {
        let priceLabel = 'List'
        if (property.hasOwnProperty('ClosePrice')) {
            const statusName = getFriendlyStatus(property)
            switch (statusName) {
                case 'Closed': {
                    priceLabel = 'Sale'
                    break
                }
                case 'Leased': {
                    priceLabel = 'Lease'
                    break
                }
                case 'Rented': {
                    priceLabel = 'Rent'
                    break
                }
                default:
                    priceLabel = 'Sale'
            }
        }
        priceLabel += ' Price'

        return priceLabel
    }

    /**
     * Grabs a full/longer name of the property's status. Mostly intended to properly show the normal/rent status
     * When selecting a preferredStatus, 'Closed' wil always show a Closed listing as such.
     * preferredStatus = 'Leased', a Closed listing will either be 'Sold' or 'Leased'
     * preferredStatus = 'Rented', a Closed listing will either be 'Sold' or 'Rented'
     */
    function getFullStatus(
        property: Property,
        preferredStatus: 'Closed' | 'Leased' | 'Rented' = 'Closed'
    ): 'Active' | 'Contingent' | 'Closed' | 'Leased' | 'Rented' | string {
        let statusName = ''
        if (
            Object.prototype.hasOwnProperty.call(property, 'MlsStatus') &&
            property.MlsStatus !== ''
        ) {
            statusName = property.MlsStatus
        } else if (
            Object.prototype.hasOwnProperty.call(property, 'StandardStatus') &&
            property.StandardStatus !== ''
        ) {
            statusName = property.StandardStatus
        }
        if (statusName !== '') {
            statusName = getFriendlyClosedStatus(property, statusName, preferredStatus)
        }
        return statusName
    }

    /**
     * When selecting a preferredStatus, 'Closed' wil always show a Closed listing as such.
     * preferredStatus = 'Leased', a Closed listing will either be 'Sold' or 'Leased'
     * preferredStatus = 'Rented', a Closed listing will either be 'Sold' or 'Rented'
     */
    function getFriendlyClosedStatus(
        property: Property,
        statusName: string,
        preferredStatus: 'Closed' | 'Leased' | 'Rented' = 'Closed'
    ): string {
        if (statusName !== '') {
            if (preferredStatus === 'Closed') {
                // Ensure closed statuses are always converted to Closed
                switch (statusName) {
                    case 'Sold':
                    case 'Leased/Option':
                    case 'Leased/Rented': {
                        statusName = 'Closed'
                        break
                    }
                }
            } else {
                // The preferred is Sold / Leased / Rented now
                // Note some MLSs might not have listings with the wording of leased/rented
                switch (statusName) {
                    case 'Closed':
                    case 'Sold':
                        statusName = 'Sold'
                        if (
                            Object.prototype.hasOwnProperty.call(property, '_IsRental') &&
                            property._IsRental
                        ) {
                            statusName = preferredStatus
                        }
                        break
                    case 'Leased/Option':
                    case 'Leased/Rented': {
                        statusName = preferredStatus
                        break
                    }
                }
            }
        }
        return statusName
    }

    /**
     * Returns the processed street address
     * (StreetNumberNumeric / StreetNumber) + StreetDirPrefix + StreetName + StreetSuffix +  StreetSuffixModifier
     * +  StreetDirSuffix + 'Unit' + UnitNumber
     */
    function getStreetAddress(property: Property): string {
        if (
            // If a StreetName exists... let's build the Street Address!
            (Object.prototype.hasOwnProperty.call(property, 'StreetName') && property.StreetName !== '') ||
            // Or if we can't use the UnparsedAddress to begin with... e.g. we have no choice
            !Object.prototype.hasOwnProperty.call(property, 'UnparsedAddress') || property.UnparsedAddress === ''
        ) {
            const addressParts: string[] = []
            if (
                Object.prototype.hasOwnProperty.call(property, 'StreetNumberNumeric') &&
                isNumber(property.StreetNumberNumeric) &&
                property.StreetNumberNumeric > 0
            ) {
                addressParts.push(property.StreetNumberNumeric.toString())
            } else if (
                Object.prototype.hasOwnProperty.call(property, 'StreetNumber') &&
                property.StreetNumber !== ''
            ) {
                addressParts.push(property.StreetNumber)
            }
            [
                'StreetDirPrefix',
                'StreetName',
                'StreetSuffix',
                'StreetSuffixModifier',
                'StreetDirSuffix',
                'UnitNumber'
            ]
                .forEach((addressPart) => {
                    if (Object.prototype.hasOwnProperty.call(property, addressPart)) {
                        if (
                            addressPart === 'StreetSuffix' &&
                            property[addressPart] === 'None'
                        ) {
                            property[addressPart] = ''
                        }
                        if (addressPart === 'UnitNumber') {
                            addressParts.push('Unit')
                        }
                        if (!isEmpty(property[addressPart])) {
                            addressParts.push(property[addressPart] as string)
                        }
                    }
                })
            return addressParts.join(' ')
        } else {
            return property.UnparsedAddress || ''
        }
    }

    function getFullAddress(property: Property, encode?: boolean): string {
        const address = getStreetAddress(property) + ', ' + property.City + ' ' + property.StateOrProvince
        return encode ? encodeURIComponent(address) : address
    }

    function getGoogleMapsKey(): string | null {
        let googleMapsKey = null
        if (
            sharedValues.integrations
            && Object.prototype.hasOwnProperty.call(sharedValues.integrations, 'maps')
            && Object.prototype.hasOwnProperty.call(sharedValues.integrations.maps, 'googleMaps')
            && Object.prototype.hasOwnProperty.call(sharedValues.integrations.maps.googleMaps, 'publicKey')
            && sharedValues.integrations.maps.googleMaps.publicKey !== ''
        ) {
            googleMapsKey = sharedValues.integrations.maps.googleMaps.publicKey
        }
        return googleMapsKey
    }

    function getWebsiteMainContact(): {
        name: string
        email: string | null
        phone: string | null
    } | null {
        const contact: {
            name: string | null
            email: string | null
            phone: string | null
        } = {
            name: null,
            email: null,
            phone: null,
        }

        if (isPlainObject(sharedValues.contact)) {
            contact.name = clone(sharedValues.contact.name)
            if (sharedValues.contact.emails.hasOwnProperty('Main')) {
                contact.email = clone(sharedValues.contact.emails.Main)
            }
            if (sharedValues.contact.phones.hasOwnProperty('Main')) {
                contact.phone = clone(sharedValues.contact.phones.Main)
            }
        }

        if (!isString(contact.name) || contact.name === '') {
            // Don't return an empty object. (or one withg a name, as a a basic item)
            return null
        }
        return contact
    }

    /**
     * Get the Input element of a specified ID
     */
    function getInput(elementId: string): JQLite {
        return element(document.getElementById(elementId))
    }

    function getScopeValuePath(scope: IScope, scopeVarPath: string): any {
        // console.log('Update getScopeValuePath', scopeVarPath)
        const scopePieces = scopeVarPath.split('.')
        return getNestedPathValue(scope, scopePieces)
    }

    function getNestedPathValue(currentNest: object | any, pathPieces: string[]): any {
        const currentPiece = pathPieces.shift()
        if (pathPieces[0]) {
            return getNestedPathValue(currentNest[currentPiece], pathPieces)
        } else if ( Object.prototype.hasOwnProperty.call(currentNest, currentPiece)) {
            return currentNest[currentPiece]
        } else {
            return null
        }
    }

    /**
     * Update a scope nest variable from a given string path.
     * Works with updateNestedPathValue
     */
    async function updateScopeValuePath(scope: IScope, scopeVarPath: string, value: any): Promise<string | any> {
        if (
            value == null ||
            value === 'null' ||
            value === ''
        ) {
            return false
        }
        // console.log('Update updateScopeValuePath', scopeVarPath, 'to', value, typeof value)
        const scopePieces = scopeVarPath.split('.')
        return updateNestedPathValue(scope, scopePieces, value)
    }

    /**
     * Nests further into a string path to update a value
     * Works from updateScopeValuePath
     */
    async function updateNestedPathValue(currentNest: object | any, pathPieces: object | any, value: any): Promise<string | any> {
        const currentPiece = pathPieces.shift()
        if (
            // Object.prototype.hasOwnProperty.call(currentNest, currentPiece) &&
            currentPiece
        ) {
            // console.log('checking piece', currentPiece, 'in', currentNest)
            if (pathPieces[0]) {
                return updateNestedPathValue(currentNest[currentPiece], pathPieces, value)
            } else if (
                Object.prototype.hasOwnProperty.call(currentNest, currentPiece) &&
                (!isArray(currentNest[currentPiece]) && isArray(value))
            ) {
                console.warn(
                    'updateNestedPathValue couldn\'t connect', currentPiece, ' as value given is array, but value stored is not: ',
                    clone(currentNest), 'It may need to be initialized first (as an array)'
                )
            } else {
                if (isArray(currentNest[currentPiece]) && !isArray(value) && !isJSON(value)) {
                    // console.log('checking if this was an array', clone(value))
                    value = value === '' ? [] : value.split(',')
                }/* else if (
                        isString(value) &&
                        (value[0] === '[' || value[0] === '{') &&
                        isJSON(value)
                    ) {
                        value = JSON.parse(value)
                        console.log('converted', value, 'to object')
                    }*/
                // console.log(currentPiece, 'updated to ', value)
                // FIXME need to checks the typeof currentNest[currentPiece] and convert value to that type.
                // This is mostly just to allow a whole object to be passed in and saved
                if (
                    !isArray(value) &&
                    (
                        isObject(currentNest[currentPiece]) ||
                        isJSON(value)
                    )
                ) {
                    // console.log('parsing', clone(value))
                    currentNest[currentPiece] = JSON.parse(value)
                } else {
                    currentNest[currentPiece] = clone(value)
                }
                return value
            }
        } else {
            console.warn('updateNestedPathValue couldn\'t find', currentPiece, 'in', clone(currentNest), 'It may need to be initialized first')
            return null
        }
    }

    function clearFieldInput(ev?: any): void {
        if (
            ev &&
            ev.hasOwnProperty('target') &&
            ev.target &&
            ev.target.hasOwnProperty('value')
        ) {
            ev.target.value = null
        }
    }

    function countArraysNotEmpty(arrayList: any[][]) {
        return arrayList.filter((e)=>e.length).length
    }

    function ensureItemsAreArrays(itemParent: LooseObject, itemNames: string[]) {
        itemNames.forEach(itemName => {
            if (
                itemParent.hasOwnProperty(itemName) &&
                !isArray(itemParent[itemName])
            ) {
                itemParent[itemName] = isEmpty(itemParent[itemName]) ? [] : [itemParent[itemName]]
            }
        })
    }

    return {
        fetchMembers,
        fetchOffices,
        fetchProperties,
        fetchProperty,
        clearFieldInput,
        countArraysNotEmpty,
        devLog,
        emit,
        emitManual,
        ensureItemsAreArrays,
        getContactVariables,
        getDefaultWhereOptions,
        getDisclaimerInstance,
        getFriendlyPriceLabel,
        getFriendlyStatus,
        getFullAddress,
        getFullStatus,
        getGoogleMapsKey,
        getIdxServices,
        getInput,
        getScopeValuePath,
        getLastQueryTime,
        getLastSessionTime,
        getListInstance,
        getListInstanceLinks,
        getMLSVariables,
        getNestedPathValue,
        getOptionsFromUrl,
        getSearchInstanceLinks,
        getStreetAddress,
        getUrlOptions,
        getUrlOptionsPath,
        getWebsiteMainContact,
        on,
        registerDetailsInstance,
        registerDisclaimerInstance,
        registerListInstance,
        registerMapInstance,
        registerSearchInstance,
        setIdxServices,
        setPageTitle,
        setTokenURL,
        setUrlOptions,
        sharedValues,
        tokenKeepAuth,
        refreshUrlOptions,
        updateNestedPathValue,
        updateScopeValuePath,
        unregisterDetailsInstance
    }
}

Stratus.Services.Idx = [
    '$provide',
    ($provide: auto.IProvideService) => {
        $provide.factory('Idx', angularJsService)
    }
]
