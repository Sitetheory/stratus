// Idx Service
// @stratusjs/idx/idx

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
import {IPromise} from 'angular'

// Services
import '@stratusjs/angularjs/services/model' // Needed as $provider
// tslint:disable-next-line:no-duplicate-imports
import {Model, ModelOptions} from '@stratusjs/angularjs/services/model' // Needed as Class
import '@stratusjs/angularjs/services/collection' // Needed as $provider
// tslint:disable-next-line:no-duplicate-imports
import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class
import '@stratusjs/idx/listTrac'

// Stratus Dependencies
import {isJSON, LooseObject} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
import {IdxMapScope} from '@stratusjs/idx/map.component'
import {IdxPropertyListScope} from '@stratusjs/idx/property/list.component'
import {IdxPropertySearchScope} from '@stratusjs/idx/property/search.component'
import {IdxPropertyDetailsScope} from '@stratusjs/idx/property/details.component'
// import {IdxMapScope} from '@stratusjs/idx/map.component'


// Environment
// const min = !cookie('env') ? '.min' : ''
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`

export type AnyFunction = (...args: any) => any

/** Allow an Object to contain any number of unspecified functions, useful in $scope */
export interface ObjectWithFunctions {
    [key: string]: AnyFunction
}

export interface IdxService {
    [key: string]: AnyFunction | IdxSharedValue

    // Variables
    sharedValues: IdxSharedValue

    // Fetch Methods
    fetchMembers(
        $scope: any,
        collectionVarName: string,
        options?: Pick<CompileFilterOptions,
            'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office'>,
        refresh?: boolean,
        listName?: string
    ): Promise<Collection>

    fetchOffices(
        $scope: any,
        collectionVarName: string,
        options?: Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office' | 'managingBroker' | 'members'>,
        refresh?: boolean,
        listName?: string
    ): Promise<Collection>

    fetchProperties(
        $scope: IdxComponentScope, collectionVarName: string,
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
    getListInstance(listUid: string, listType?: string): IdxPropertyListScope | IdxComponentScope | null

    getListInstanceLinks(listUid: string, listType?: string): (IdxPropertySearchScope | IdxMapScope | IdxComponentScope)[]

    getSearchInstanceLinks(searchUid: string, listType?: string): (IdxPropertyListScope | IdxComponentScope)[]

    registerDetailsInstance(
        uid: string,
        moduleName: 'member' | 'office' | 'property',
        $scope: IdxDetailsScope
    ): void

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
    devLog(arg: any, arg2: any): void

    getFriendlyStatus(property: Property): string // TODO replace with property object
    getFullAddress(property: Property, encode?: boolean): string

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

}

export type IdxComponentScope = angular.IScope & ObjectWithFunctions & {
    elementId: string
    localDir: string
    Idx: IdxService

    getUid(): string
    remove(): void
}

export type IdxDetailsScope<T = LooseObject> = IdxComponentScope & {
    model: Model<T>
}

export type IdxListScope<T = LooseObject> = IdxComponentScope & {
    collection: Collection<T>
}

export type IdxSearchScope = IdxComponentScope & {
    listId: string
    listInitialized: boolean
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
    Page?: undefined // Key being added to wrong type
    order?: undefined // Key being added to wrong type
    Order?: undefined // Key being added to wrong type
    where?: undefined // Key being added to wrong type

    // Property
    ListingKey?: string,
    ListingId?: string,
    ListingType?: string[] | string,
    Status?: string[] | string,
    UnparsedAddress?: string,
    City?: string,
    PostalCode?: string[] | string,
    CityRegion?: string[] | string,
    MLSAreaMajor?: string[] | string,
    ListPriceMin?: number | any,
    ListPriceMax?: number | any,
    Bathrooms?: number | any, // Previously BathroomsFullMin
    Bedrooms?: number | any, // Previously BedroomsTotalMin
    AgentLicense?: string[] | string,
    Location?: string,
    Neighborhood?: string[] | string,

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
    OfficeName?: string,
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
    id: number,
    name: string,
    disclaimer: string,
    token?: string,
    created?: string,
    ttl?: number,
    host?: string,
    fetchTime: {
        Property: Date | null,
        Media: Date | null,
        Member: Date | null,
        Office: Date | null,
        OpenHouse: Date | null
    },
    analyticsEnabled: string[]
}

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

export interface WidgetIntegrations {
    analytics?: {
        googleAnalytics?: {
            accountId: string
        },
        listTrac?: {
            accountId: string
        },
        listtracAnalytics?: { // FIXME: Need to remove this name and rename to listTrac (Sitetheory side)
            accountId: string
        }
    },
    maps?: {
        googleMaps?: {
            accountId: string
        }
    }
}

interface IdxSharedValue {
    contactUrl: string | null,
    contactCommentVariable: string | null,
    contact: WidgetContact | null,
    integrations: WidgetIntegrations
}

// Internal
interface Session {
    services: MLSService[],
    lastCreated: Date,
    lastTtl: number
    expires?: Date
    contacts: WidgetContact[]
}

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
}

export interface Member extends LooseObject {
    id: string
    MemberKey: string
}

export interface Property extends LooseObject {
    id: string
    ListingKey: string
    ListingId: string
    MlsStatus: string
    StandardStatus: string
    PropertyType: string
    PropertySubType: string

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
    PublicRemarks?: string

    // Agent
    ListAgentFullName?: string
    ListAgentFirstName?: string
    ListAgentLastName?: string
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
    _ServiceId: number
    _Class: string
    _unmapped?: {
        [key: string]: unknown
        CoordinateModificationTimestamp?: Date
    }
}

// All Service functionality
const angularJsService = (
    $injector: angular.auto.IInjectorService,
    $http: angular.IHttpService,
    $location: angular.ILocationService,
    $q: angular.IQService,
    $rootScope: angular.IRootScopeService,
    $window: angular.IWindowService,
    // tslint:disable-next-line:no-shadowed-variable
    Collection: any, // FIXME type 'Collection' is invalid, need to fix
    ListTrac: any,
    // tslint:disable-next-line:no-shadowed-variable
    Model: any, // FIXME type 'Model' is invalid, need to fix
    orderByFilter: angular.IFilterOrderBy
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
        Status: [],
        ListingType: [],
        CountyOrParish: [],
        MLSAreaMajor: [],
        Neighborhood: [],
        PostalCode: [],
        // NOTE: at this point we don't know if CityRegion is used (or how it differs from MLSAreaMajor)
        CityRegion: [],
        AgentLicense: []
    }
    let idxServicesEnabled: number[] = []
    let tokenRefreshURL = '/ajax/request?class=property.token_auth&method=getToken'
    let refreshLoginTimer: any // Timeout object
    let defaultPageTitle: string
    const instance: {
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
        List: {},
        Map: {},
        Search: {}
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
        whereFilter: object | any,
        pages: number[],
        perPage: number
        order?: string | string[]
    } = {
        whereFilter: {},
        pages: [],
        perPage: 0
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
            const detailUid = instance[moduleName].details[uid].getUid()
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
     * Return Blank options to initialize arrays
     */
    function getDefaultWhereOptions(): WhereOptions {
        return _.clone(defaultWhereOptions)
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
                    session.services.length < 1 ||
                    session.expires < new Date(Date.now() + (5 * 1000)) // if expiring in the next 5 seconds
                ) {
                    // need to send ?cacheReset=true to ensure the token is new
                    await tokenRefresh(keepAlive, true)
                    resolve()
                } else {
                    resolve()
                }
            } catch (err) {
                console.error('error', err)
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
                    tokenHandleBadResponse(response)
                    reject()
                }
            }, (response: TokenResponse) => { // TODO interface a response
                tokenHandleBadResponse(response)
                reject()
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
        session.services = []
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
                session.services[service.id] = service
                session.lastCreated = new Date(service.created)// The object is a String being converted to Date
                session.lastTtl = service.ttl
                // Set to expire 15 secs before it actually does
                session.expires = new Date(session.lastCreated.getTime() + (session.lastTtl - 15) * 1000)
            }
        })

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
                && _.isString(response.data.site)
                && response.data.site !== ''
            ) {
                sharedValues.contact.name = response.data.site
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data, 'contactName')
                && _.isString(response.data.contactName)
                && response.data.site !== ''
            ) {
                sharedValues.contact.name = response.data.contactName
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data.contact, 'emails')
                && _.isPlainObject(response.data.contact.emails)
            ) {
                sharedValues.contact.emails = response.data.contact.emails
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data.contact, 'locations')
                && _.isPlainObject(response.data.contact.locations)
            ) {
                sharedValues.contact.locations = response.data.contact.locations
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data.contact, 'phones')
                && _.isPlainObject(response.data.contact.phones)
            ) {
                sharedValues.contact.phones = response.data.contact.phones
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data.contact, 'socialUrls')
                && _.isPlainObject(response.data.contact.socialUrls)
            ) {
                sharedValues.contact.socialUrls = response.data.contact.socialUrls
            }
            if (
                Object.prototype.hasOwnProperty.call(response.data.contact, 'urls')
                && _.isPlainObject(response.data.contact.urls)
            ) {
                sharedValues.contact.urls = response.data.contact.urls
            }
        }

        // Compile a contact from the response if it exists
        if (Object.prototype.hasOwnProperty.call(response.data, 'integrations')) {
            if (Object.prototype.hasOwnProperty.call(response.data.integrations, 'analytics')) {
                if (Object.prototype.hasOwnProperty.call(response.data.integrations.analytics, 'googleAnalytics')) {
                    if (
                        Object.prototype.hasOwnProperty.call(response.data.integrations.analytics.googleAnalytics, 'accountId')
                        && _.isString(response.data.integrations.analytics.googleAnalytics.accountId)
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
                        && _.isString(response.data.integrations.analytics.listTrac.accountId)
                        && response.data.integrations.analytics.listTrac.accountId !== ''
                    ) {
                        sharedValues.integrations.analytics.listTrac = {
                            accountId: response.data.integrations.analytics.listTrac.accountId
                        }
                        ListTrac.setAccountId(sharedValues.integrations.analytics.listTrac.accountId)
                        // FIXME we only need to load ListTrac/send an event when the the MLS is whitelisted for it
                    }
                } else if (Object.prototype.hasOwnProperty.call(response.data.integrations.analytics, 'listtracAnalytics')) {
                    // FIXME this is a placeholder until Sitetheory is fixed (listtracAnalytics changed to listTrac)
                    if (
                        Object.prototype.hasOwnProperty.call(
                            response.data.integrations.analytics.listtracAnalytics, 'accountId'
                        )
                        && _.isString(response.data.integrations.analytics.listtracAnalytics.accountId)
                        && response.data.integrations.analytics.listtracAnalytics.accountId !== ''
                    ) {
                        sharedValues.integrations.analytics.listTrac = {
                            accountId: response.data.integrations.analytics.listtracAnalytics.accountId
                        }
                        ListTrac.setAccountId(sharedValues.integrations.analytics.listTrac.accountId)
                        // FIXME we only need to load ListTrac/send an event when the the MLS is whitelisted for it
                    }
                }
            }
            if (Object.prototype.hasOwnProperty.call(response.data.integrations, 'maps')) {
                if (Object.prototype.hasOwnProperty.call(response.data.integrations.maps, 'googleMaps')) {
                    if (
                        Object.prototype.hasOwnProperty.call(response.data.integrations.maps.googleMaps, 'accountId')
                        && _.isString(response.data.integrations.maps.googleMaps.accountId)
                        && response.data.integrations.maps.googleMaps.accountId !== ''
                    ) {
                        sharedValues.integrations.maps.googleMaps = {
                            accountId: response.data.integrations.maps.googleMaps.accountId
                        }
                    }
                }
            }
        }

        if (keepAlive) {
            tokenEnableRefreshTimer()
        }
    }

    /**
     * Functions to do if the token retrieval fails. For now it just outputs the errors
     * @param response -
     */
    function tokenHandleBadResponse(response: TokenResponse | any): void {
        if (
            typeof response === 'object' &&
            Object.prototype.hasOwnProperty.call(response, 'data') &&
            Object.prototype.hasOwnProperty.call(response.data, 'errors') &&
            Object.prototype.hasOwnProperty.call(response.data.errors, 'length')
        ) {
            console.error(response.data.errors)
        } else {
            console.error(response)
        }
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

    /**
     * Model constructor helper that will help properly create a new Model.
     * Will do nothing else.
     * @param request - Standard Registry request object
     * TODO define type Request
     */
    function createModel<T>(request: ModelOptions & LooseObject): Model<T> {
        // request.direct = true;
        const model = new Model(request) as Model<T>
        if (request.api) {
            model.meta.set('api', isJSON(request.api)
                ? JSON.parse(request.api)
                : request.api)
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

        let totalCount = 0

        // Make Promises that each of the collections shall fetch their results
        const fetchPromises: any[] = []
        collections.forEach(collection => {
            const options: {
                headers?: object
            } = {}
            if (session.services[collection.serviceId].token !== null) {
                options.headers = {
                    Authorization: session.services[collection.serviceId].token
                }
            }
            fetchPromises.push(
                $q((resolve: any[] | any) => {
                    collection.fetch('POST', null, options)
                        .then((models: any) => {
                            resolve(models)
                        })
                        // Inject the local server's Service Id loaded from
                        .then(() => {
                            resolve(modelInjectProperty<T>(collection.models as T[], {
                                _ServiceId: collection.serviceId
                            }))
                        })
                        .then(() => {
                            // TODO save collection.header.get('x-fetch-time') to MLSVariables
                            const fetchTime = collection.header.get('x-fetch-time')
                            if (fetchTime) {
                                session.services[collection.serviceId].fetchTime[modelName] = new Date(fetchTime)
                            }
                            const countRecords = collection.header.get('x-total-count')
                            if (countRecords) {
                                totalCount += parseInt(countRecords, 10)
                            }
                        })
                })
            )
        })
        if (!append) {
            originalCollection.models.splice(0, originalCollection.models.length) // empties the array
        }
        return $q.all(fetchPromises)
            .then(
                /**
                 * @param fetchedData - Array of models from other Collections {Array<Array<Object>>}
                 * returns {Collection}
                 */
                (fetchedData: any[]): any => {
                    // Once all the Results are returned, starting merging them into the original Collection
                    fetchedData.forEach(models => {
                        if (_.isArray(models)) {
                            originalCollection.models.push(...models)
                        }
                    })
                    return originalCollection
                }
            )
            .then(() => {
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
        const options: {
            headers?: object
        } = {}
        if (session.services[newModel.serviceId].token !== null) {
            options.headers = {
                Authorization: session.services[newModel.serviceId].token
            }
        }
        fetchPromises.push(
            $q((resolve: any[] | any) => {
                // console.log('sending fetchReplaceModel', newModel, options)
                newModel.fetch('POST', null, options)
                    .then((data: any) => {
                        resolve(data)
                    })
                    // Inject the local server's Service Id loaded from
                    .then(() => {
                        resolve(modelInjectProperty<T>([newModel.data], {
                            _ServiceId: newModel.serviceId
                        }))
                        const fetchTime = newModel.header.get('x-fetch-time')
                        if (fetchTime) {
                            session.services[newModel.serviceId].fetchTime[modelName] = new Date(fetchTime)
                        }
                    })
            })
        )
        return $q.all(fetchPromises)
            .then(
                /**
                 * @param fetchedData - Array of data from other Models {Array<Array<Object>>}
                 * returns {Model}
                 */
                (fetchedData: any[]): object | any => {
                    // Once all the Results are returned, shove them into the original Model
                    fetchedData.forEach(data => {
                        originalModel.data = data
                    })
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
     * TODO define Model?
     */
    function modelInjectProperty<T>(modelDatas: (Model<T>['data'])[], properties: { [key: string]: any }): void {
        modelDatas.forEach(modelData => {
            _.extend(modelData, properties)
        })
    }

    /**
     * Sync a Collection with all members of a certain instance
     * @param moduleName -
     * @param scopedCollectionVarName -
     */
    function createOrSyncCollectionVariable<T>(
        moduleName: 'office' | 'member' | 'property',
        scopedCollectionVarName: string
    ): Collection<T> {
        let collection: Collection<T> // TODO define Collection
        Object.keys(instance[moduleName].list).forEach(listName => {
            if (
                !collection &&
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
                !Object.prototype.hasOwnProperty.call(instance[moduleName].list[listName], scopedCollectionVarName) ||
                (instance[moduleName].list[listName][scopedCollectionVarName] as unknown as Collection<T>) !== collection
            ) {
                (instance[moduleName].list[listName][scopedCollectionVarName] as unknown as Collection<T>) = collection
            }
        }, this)
        return collection
    }

    /**
     * @param where - {WhereOptions}
     */
    function compilePropertyWhereFilter(where: WhereOptions): MongoWhereQuery {
        const whereQuery: MongoWhereQuery = {}
        // andStatement is the collection of query's nested in an And filter
        const andStatement: MongoWhereQuery[] = [] // TS detecting [] as string[] otherwise

        interface SearchObject {
            type: 'stringEquals' | // Input is a string, needs to equal another string or number field
                'stringLike' | // Input is a string, needs to be similar to another string field
                'stringLikeArray' | // Input is a string or array, one of which needs to be found similar to db string field
                'stringIncludesArray' | // Input is a string or array, one of which needs to be found equal to db string field
                'stringIncludesArrayAlternative' | // Input is a string or array, one of which needs to be found equal to db string field
                'numberEqualGreater' | // Input is a string/number, needs to equal or greater than another number field
                'numberEqualLess' | // Input is a string/number, needs to equal or less than another number field
                'andOr', // Input is a string/number, needs to evaluate on any of the supplied statements contained
            apiField?: string, // Used if the widgetField name is different from the field in database
            andOr?: Array<{
                apiField: string,
                type: 'stringEquals'
                    | 'stringLike'
                    | 'stringLikeArray'
                    | 'stringIncludesArray'
            }>
        }

        /**
         * List of Fields we can search for within the Widget's URL and option on List pages
         * The key is the field that the Widget accepts/expects
         * The apiField is the key that the microIdx can accept
         */
        const searchPossibilities: { [key: string]: SearchObject } = {
            ListingKey: {
                type: 'stringEquals'
            },
            ListingId: {
                type: 'stringEquals'
            },
            ListingType: {
                type: 'stringIncludesArray'
            },
            Status: {
                type: 'stringIncludesArray'
            },
            ListPriceMin: {
                type: 'numberEqualGreater',
                apiField: 'ListPrice'
            },
            ListPriceMax: {
                type: 'numberEqualLess',
                apiField: 'ListPrice'
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
            // TODO: replace this with a generic API field that supports all MLS (which may not have
            // TODO: Unparsed Address but instead have StreetName, StreetNumber, etc.
            UnparsedAddress: {
                type: 'stringLike'
            },
            City: {
                type: 'stringLike'
            },
            PostalCode: {
                type: 'stringIncludesArray'
            },
            CountyOrParish: {
                // Note: only 'in' seems to work as a replacement for inq when nested in another object
                type: 'stringLikeArray'
            },
            MLSAreaMajor: {
                // Note: only 'in' seems to work as a replacement for inq when nested in another object
                type: 'stringLikeArray'
            },
            CityRegion: {
                // Note: only 'in' seems to work as a replacement for inq when nested in another object
                type: 'stringIncludesArray'
            },
            Location: {
                type: 'andOr',
                andOr: [
                    {apiField: 'City', type: 'stringLikeArray'},
                    {apiField: 'CityRegion', type: 'stringLikeArray'},
                    {apiField: 'CountyOrParish', type: 'stringLikeArray'},
                    {apiField: 'MLSAreaMajor', type: 'stringLikeArray'},
                    {apiField: 'PostalCode', type: 'stringLikeArray'},
                    // TODO: in the future we should pass in a new defined field like Address (that will
                    // TODO: search UnparsedAddress if it exists for the service, OR the API will parse
                    // TODO: it into StreetNumber, StreetName, StreetSuffix, depending on what's provided
                    // TODO: and all those are LIKE (but all must match LIKE)
                    {apiField: 'UnparsedAddress', type: 'stringLikeArray'},
                ]
            },
            Neighborhood: {
                type: 'andOr',
                andOr: [
                    {apiField: 'CityRegion', type: 'stringLikeArray'},
                    {apiField: 'CountyOrParish', type: 'stringLikeArray'},
                    {apiField: 'MLSAreaMajor', type: 'stringLikeArray'}
                ]
            }
        }

        // The type of search functions used by the above options
        // TODO since is still not fully optimized, but it's now much clean to look at and works faster
        // TODO whereQuery was not added
        const searchFunctions: {
            [key: string]: (searchObject: SearchObject, value: any) => void
        } = {
            stringEquals: (searchObject, value) => {
                whereQuery[searchObject.apiField] = value
            },
            stringLike: (searchObject, value) => {
                whereQuery[searchObject.apiField] = {
                    like: value,
                    options: 'i'
                }
            },
            stringLikeArray: (searchObject, value) => {
                value = typeof value === 'string' ? [value] : value
                const stringLikeArrayOrStatement: MongoWhereQuery[] = []
                value.forEach((requestedValue: string) => {
                    stringLikeArrayOrStatement.push({
                        [searchObject.apiField]: {
                            like: requestedValue,
                            options: 'i'
                        }
                    })
                })
                if (!_.isEmpty(stringLikeArrayOrStatement)) {
                    andStatement.push({or: stringLikeArrayOrStatement})
                }
            },
            stringIncludesArray: (searchObject, value) => {
                value = typeof value === 'string' ? [value] : value
                if (value.length > 0) {
                    whereQuery[searchObject.apiField] = {
                        inq: value
                    }
                }
            },
            stringIncludesArrayAlternative: (searchObject, value) => {
                // For some reason, `inq` doesn't work in certain situations. This is to overcome that
                value = typeof value === 'string' ? [value] : value
                if (value.length > 0) {
                    whereQuery[searchObject.apiField] = {
                        in: value
                    }
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
                                parseInt(_.get(whereQuery[searchObject.apiField], 'lte'), 10)
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
                                parseInt(_.get(whereQuery[searchObject.apiField], 'gte'), 10),
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
                        if (orObject.type === 'stringEquals') {
                            andOrOrStatement.push({
                                [orObject.apiField]: value
                            })
                        } else if (orObject.type === 'stringLike') {
                            andOrOrStatement.push({
                                [orObject.apiField]: {
                                    like: value,
                                    options: 'i'
                                }
                            })
                        } else if (orObject.type === 'stringLikeArray') {
                            value = typeof value === 'string' ? [value] : value
                            if (value.length > 0) {
                                value.forEach((requestedValue: string) => {
                                    andOrOrStatement.push({
                                        [orObject.apiField]: {
                                            like: requestedValue,
                                            options: 'i'
                                        }
                                    })
                                })
                            }
                        } else if (orObject.type === 'stringIncludesArray') {
                            value = typeof value === 'string' ? [value] : value
                            if (value.length > 0) {
                                andOrOrStatement.push({
                                    [orObject.apiField]: {
                                        inq: value
                                    }
                                })
                            }
                        }
                    })

                    if (!_.isEmpty(andOrOrStatement)) {
                        andStatement.push({or: andOrOrStatement})
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

        if (!_.isEmpty(andStatement)) {
            whereQuery.and = andStatement
        }


        return whereQuery
    }

    /**
     * @param where - {WhereOptions}
     */
    function compileMemberWhereFilter(where: WhereOptions): MongoWhereQuery {
        const whereQuery: MongoWhereQuery = {}
        // MemberKey
        if (Object.prototype.hasOwnProperty.call(where, 'MemberKey') && where.MemberKey !== '') {
            whereQuery.MemberKey = where.MemberKey
        }
        // MemberStateLicense
        if (Object.prototype.hasOwnProperty.call(where, 'MemberStateLicense') && where.MemberStateLicense !== '') {
            whereQuery.MemberStateLicense = where.MemberStateLicense
        }
        // MemberNationalAssociationId
        if (
            Object.prototype.hasOwnProperty.call(where, 'MemberNationalAssociationId') &&
            where.MemberNationalAssociationId !== ''
        ) {
            whereQuery.MemberNationalAssociationId = where.MemberNationalAssociationId
        }
        // MemberStatus
        if (Object.prototype.hasOwnProperty.call(where, 'MemberStatus') && where.MemberStatus !== '') {
            whereQuery.MemberStatus = where.MemberStatus
        }
        // MemberFullName
        if (Object.prototype.hasOwnProperty.call(where, 'MemberFullName') && where.MemberFullName !== '') {
            whereQuery.MemberFullName = {
                like: where.MemberFullName,
                options: 'i'
            }
        }
        return whereQuery
    }

    /**
     * @param where - {WhereOptions}
     */
    function compileOfficeWhereFilter(where: WhereOptions): MongoWhereQuery {
        const whereQuery: MongoWhereQuery = {}
        // OfficeKey
        if (Object.prototype.hasOwnProperty.call(where, 'OfficeKey') && where.OfficeKey !== '') {
            whereQuery.OfficeKey = where.OfficeKey
        }
        // OfficeNationalAssociationId
        if (
            Object.prototype.hasOwnProperty.call(where, 'OfficeNationalAssociationId') &&
            where.OfficeNationalAssociationId !== ''
        ) {
            whereQuery.OfficeNationalAssociationId = where.OfficeNationalAssociationId
        }
        // OfficeStatus
        if (Object.prototype.hasOwnProperty.call(where, 'OfficeStatus') && where.OfficeStatus !== '') {
            whereQuery.OfficeStatus = where.OfficeStatus
        }
        // OfficeName
        if (Object.prototype.hasOwnProperty.call(where, 'OfficeName') && where.OfficeName !== '') {
            whereQuery.OfficeName = {
                like: where.OfficeName,
                options: 'i'
            }
        }
        return whereQuery
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
                    }
                }

                includes.push(includeItem)
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
        if (serviceIds && _.isArray(serviceIds)) {
            serviceIds.forEach(serviceId => {
                if (Object.prototype.hasOwnProperty.call(session.services, serviceId)) {
                    serviceList.push({
                        id: session.services[serviceId].id,
                        name: session.services[serviceId].name,
                        disclaimer: session.services[serviceId].disclaimer,
                        fetchTime: session.services[serviceId].fetchTime,
                        analyticsEnabled: session.services[serviceId].analyticsEnabled
                    })
                }
            })
        } else {
            session.services.forEach(service => {
                if (!_.isEmpty(service)) {
                    serviceList.push({
                        id: service.id,
                        name: service.name,
                        disclaimer: service.disclaimer,
                        fetchTime: service.fetchTime,
                        analyticsEnabled: service.analyticsEnabled
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
        let path = $location.path()

        path = getListingOptionsFromUrlString(path)
        getSearchOptionsFromUrlString(path)

        return urlOptions
    }

    /**
     * Parse the hangbang Url for the serviceId and ListingKey of a listings
     * Save variables in urlOptions.Listing
     * returns {String} - Remaining unparsed hashbang variables
     */
    function getListingOptionsFromUrlString(path: string): string {
        // FIXME can't read unless ListingKey must end with /
        // /Listing/1/81582540/8883-Rancho/
        const regex = /\/Listing\/(\d+?)\/(.*?)\/([\w-_]*)?\/?/
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
            regex = /([^/]+)\/([^/]+)/g

            const whileLoopAssignmentBypass = (regexp: RegExp, value: string) => {
                matches = regexp.exec(value)
                return matches
            }

            // while ((matches = regex.exec(rawSearchOptions)) != null) {
            while (whileLoopAssignmentBypass(regex, rawSearchOptions) != null) {
                if (
                    matches[1] &&
                    matches[2]
                ) {
                    // Check for a comma to break into an array.
                    // This might need to be altered as sometimes a comma might be used for something
                    if (matches[2].includes(',')) {
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
            if (_.isString(urlOptions.Search.Page)) {
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
        // console.log('setUrlOptions ', listingOrSearch, _.clone(options))
        urlOptions[listingOrSearch] = options || {}
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
        defaultOptions = defaultOptions || {}
        // console.log('getUrlOptionsPath defaultOptions', _.clone(defaultOptions))
        let path = ''

        // Set the Search List url variables
        const searchOptionNames = Object.keys(urlOptions.Search)
        // console.log('getUrlOptionsPath searchOptionNames', _.clone(searchOptionNames))
        if (searchOptionNames.length > 0) {
            let searchPath = ''
            searchOptionNames.forEach(searchOptionName => {
                if (
                    Object.prototype.hasOwnProperty.call(urlOptions.Search, searchOptionName) &&
                    urlOptions.Search[searchOptionName] !== null &&
                    // && urlOptions.Search[searchOptionName] !== ''
                    // && urlOptions.Search[searchOptionName] !== 0// may need to correct this
                    !_.isEqual(defaultOptions[searchOptionName], urlOptions.Search[searchOptionName])
                ) {
                    // console.log(searchOptionName, defaultOptions[searchOptionName], urlOptions.Search[searchOptionName]);
                    searchPath += searchOptionName + '/' + urlOptions.Search[searchOptionName] + '/'
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
    function devLog(item1: any, item2: any): void {
        if (cookie('env')) {
            console.log(item1, item2)
        }
    }

    /**
     * Process the currently set options and update the URL with what should be known
     * TODO define defaultOptions
     */
    function refreshUrlOptions(defaultOptions: object | any): void {
        // console.log('refreshUrlOptions', _.clone(defaultOptions))
        // console.log('refreshUrlOptions getUrlOptionsPath', _.clone(getUrlOptionsPath(defaultOptions)))
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
    function orderBy(collection: Collection, propertyNames: string | string[], reverse = false): void {
        const orderPropertyNames = _.clone(propertyNames)
        if (orderPropertyNames) {
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
     * @param $scope - {Object}
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
        $scope: object | any,
        collectionVarName: string,
        options = {} as CompileFilterOptions,
        refresh = false,
        moduleName: 'office' | 'member' | 'property',
        apiModel: string,
        compileFilterFunction: (options: CompileFilterOptions) => MongoFilterQuery
    ): Promise<Collection<T>> {
        options.service = options.service || []
        options.where = options.where || {}
        options.order = options.order || []
        options.page = options.page || 1
        options.perPage = options.perPage || 10
        options.images = options.images || false
        options.fields = options.fields || [
            '_id'
        ]

        if (typeof options.order === 'string') {
            options.order = options.order.split(',')
        }

        if (typeof options.service === 'number') {
            options.service = [options.service]
        }

        const apiModelSingular = getSingularApiModelName(apiModel)

        // Prepare the same Collection for each List
        const collection: Collection<T> = await createOrSyncCollectionVariable<T>(moduleName, collectionVarName)

        // Set API paths to fetch listing data for each MLS Service
        const filterQuery = compileFilterFunction(options)
        // options.page items need to happen after here

        const collections: Collection<T>[] = [] // TODO define Collection

        // check if this filterQuery is any different from the 'last one' used
        // if this is a new query rather than a page change
        if (
            !_.isEqual(lastQueries.whereFilter, filterQuery.where) ||
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

            options.service.forEach(
                serviceId => {
                    // Only load from a specific MLS Service
                    if (Object.prototype.hasOwnProperty.call(session.services, serviceId)) {
                        const request = {
                            serviceId,
                            urlRoot: session.services[serviceId].host,
                            target: apiModel + '/search',
                            api: {
                                filter: filterQuery,
                                // route and controller needed and only used by Sitetheory
                                meta: {
                                    method: 'get',
                                    action: 'search'
                                },
                                route: {
                                    controller: apiModelSingular // There might be a better way to do this
                                }
                            }
                        }

                        collections.push(
                            createCollection<T>(request)
                        )
                    }
                }
            )

            // When using the same WHERE and only changing the page, results should pool together (append)
            // Fetch and Merge all results together into single list
            await fetchMergeCollections<T>(collection, collections, apiModelSingular, !refresh)

            // If the query as updated, adjust the TotalRecords available
            if (refresh) {
                const totalRecords = collection.header.get('x-total-count') || 0
                collection.meta.set('totalRecords', totalRecords)
                collection.meta.set('totalPages', Math.ceil(totalRecords / options.perPage))
            }

            // Sort once more on the front end to ensure it's ordered correctly
            orderBy(collection, options.order)

            // Ensure the changes update on the DOM
            Object.keys(instance[moduleName].list).forEach(listName => {
                // instance.List[listName].$digest(); // Digest to ensure the DOM/$watch updates with new model data
                instance[moduleName].list[listName].$applyAsync() // Digest to ensure the DOM/$watch updates with new model data
            })
        }

        // then save this in the last queries
        lastQueries.whereFilter = _.clone(filterQuery.where)
        lastQueries.order = options.order
        lastQueries.perPage = options.perPage
        lastQueries.pages.push(options.page)
        // console.log('lastQueries:', lastQueries);

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

        options.service = options.service || 0
        options.where = options.where || {}
        options.images = options.images || false
        options.fields = options.fields || []
        options.perPage = 1

        if (_.isArray(options.service)) {
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

            const request: ModelOptions & LooseObject = {
                serviceId: options.service,
                urlRoot: session.services[options.service].host,
                target: apiModel + '/search',
                api: {
                    filter: compileFilterFunction(options),
                    // route and controller needed and only used by Sitetheory
                    meta: {
                        method: 'get',
                        action: 'search'
                    },
                    route: {
                        controller: apiModelSingular // There might be a better way to do this
                    }
                }
            }

            const tempModel = createModel<T>(request)

            fetchReplaceModel<T>(model, tempModel, apiModelSingular)
                .then(() => {
                    // $scope.$digest();
                    $scope.$applyAsync()
                })
        }

        return $scope[modelVarName]
    }

    /**
     *
     * @param $scope = {Object}
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
        $scope: IdxComponentScope,
        collectionVarName: string,
        options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'page' | 'perPage' | 'order' | 'fields' | 'images' | 'openhouses'>,
        refresh = false,
        // listName = 'PropertyList'
    ): Promise<Collection<Property>> {
        options.service = options.service || []
        // options.where = options.where || urlOptions.Search || {} // TODO may want to sanitize the urlOptions
        if (
            !options.where &&
            !_.isEmpty(urlOptions.Search)
        ) {
            // Do fancy, since UrlWhereOptions isn't allowed
            const whereReAssign: WhereOptions = urlOptions.Search as WhereOptions
            delete urlOptions.Search.Page
            delete urlOptions.Search.Order

            options.where = whereReAssign
        }
        options.where = options.where || {}
        options.order = options.order || urlOptions.Search.Order || []
        options.page = options.page || urlOptions.Search.Page || 1
        options.perPage = options.perPage || 10
        options.images = options.images || false
        options.fields = options.fields || [
            '_id',
            '_Class',
            'MlsStatus',
            'PropertyType',
            'PropertySubType',
            'UnparsedAddress',
            'StreetNumberNumeric',
            'StreetName',
            'StreetSuffix',
            'UnitNumber',
            'City',
            'CityRegion',
            'MLSAreaMajor',
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
            'BathroomsOneQuarter',
            'BathroomsPartial',
            'BedroomsTotal'
        ]
        // options.where['ListType'] = ['House','Townhouse'];

        return genericSearchCollection<Property>(
            $scope,
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
        options.service = options.service || null
        options.where = options.where || {}
        options.images = options.images || false
        options.openhouses = options.openhouses || false
        options.fields = options.fields || []

        return genericSearchModel<Property>($scope, modelVarName, options,
            'Properties',
            compilePropertyFilter
        )
    }

    /**
     *
     * @param $scope - {Object}
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
        $scope: object | any,
        collectionVarName: string,
        options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office'>,
        refresh = false
    ): Promise<Collection> {
        options.service = options.service || []
        // options.listName = options.listName || 'MemberList'
        options.where = options.where || {}
        options.order = options.order || []
        options.page = options.page || 1
        options.perPage = options.perPage || 10
        options.images = options.images || false
        options.office = options.office || false
        options.fields = options.fields || [
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
            'OfficeKey',
            'OfficeName',
            'OriginatingSystemName',
            'SourceSystemName'
        ]
        // options.where['ListType'] = ['House','Townhouse'];

        return genericSearchCollection<Member>($scope, collectionVarName, options, refresh,
            'member',
            'Members',
            compileMemberFilter
        )
    }

    /**
     *
     * @param $scope - {Object}
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
        $scope: object | any,
        collectionVarName: string,
        options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office' | 'managingBroker' | 'members'>,
        refresh = false
    ): Promise<Collection> {
        options.service = options.service || []
        options.where = options.where || {}
        options.order = options.order || []
        options.page = options.page || 1
        options.perPage = options.perPage || 10
        options.images = options.images || false
        options.managingBroker = options.managingBroker || false
        options.members = options.members || false
        options.fields = options.fields || [
            '_id',
            'OfficeKey',
            'OfficeName',
            'OfficeNationalAssociationId',
            'OfficeStatus',
            'OfficePhone',
            'OfficeAddress1',
            'OfficePostalCode',
            'OfficeBrokerKey'
        ]
        // options.where['ListType'] = ['House','Townhouse'];
        refresh = refresh || false

        return genericSearchCollection<Office>($scope, collectionVarName, options, refresh,
            'office',
            'Offices',
            compileOfficeFilter
        )
    }

    /**
     * Grabs a shorten more human and code friendly name of the property's status
     * @param property - Property Object
     * @returns 'Active' | 'Contingent' | 'Closed'
     */
    function getFriendlyStatus(property: Property): string {
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
                case 'Sold':
                case 'Leased/Option':
                case 'Leased/Rented': {
                    statusName = 'Closed'
                    break
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
            Object.prototype.hasOwnProperty.call(property, 'UnparsedAddress') &&
            property.UnparsedAddress !== ''
        ) {
            return property.UnparsedAddress
            // address = property.UnparsedAddress
            // console.log('using unparsed ')
        } else {
            const addressParts: string[] = []
            if (
                Object.prototype.hasOwnProperty.call(property, 'StreetNumberNumeric') &&
                _.isNumber(property.StreetNumberNumeric) &&
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
                        if (addressPart === 'UnitNumber') {
                            addressParts.push('Unit')
                        }
                        addressParts.push(property[addressPart] as string)
                    }
                })
            return addressParts.join(' ')
        }
    }

    function getFullAddress(property: Property, encode?: boolean): string {
        // const address = property.UnparsedAddress + ', ' + property.City + ' ' + property.StateOrProvince
        const address = getStreetAddress(property) + ', ' + property.City + ' ' + property.StateOrProvince
        return encode ? encodeURIComponent(address) : address
    }

    return {
        fetchMembers,
        fetchOffices,
        fetchProperties,
        fetchProperty,
        devLog,
        getContactVariables,
        getDefaultWhereOptions,
        getFriendlyStatus,
        getFullAddress,
        getIdxServices,
        getListInstance,
        getListInstanceLinks,
        getMLSVariables,
        getOptionsFromUrl,
        getSearchInstanceLinks,
        getStreetAddress,
        getUrlOptions,
        getUrlOptionsPath,
        registerDetailsInstance,
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
        unregisterDetailsInstance
    }
}

Stratus.Services.Idx = [
    '$provide',
    ($provide: angular.auto.IProvideService) => {
        $provide.factory('Idx', angularJsService)
    }
]
