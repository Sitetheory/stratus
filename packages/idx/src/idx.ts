// Idx Service
// @stratusjs/idx/idx

// Runtime
import * as _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
import {IPromise} from 'angular'

// Services
import '@stratusjs/angularjs/services/model' // Needed as $provider
import {Model} from '@stratusjs/angularjs/services/model' // Needed as Class
import '@stratusjs/angularjs/services/collection' // Needed as $provider
import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'


// Environment
// const min = Stratus.Environment.get('production') ? '.min' : ''
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`

// Reusable Objects
export interface WhereOptions {
    // Property
    ListingKey?: string,
    ListingType?: string[] | string,
    Status?: string[] | string,
    City?: string,
    ListPriceMin?: number | any,
    ListPriceMax?: number | any,
    BathroomsFullMin?: number | any,
    BedroomsTotalMin?: number | any,
    AgentLicense?: string[] | string,

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

export interface CompileFilterOptions {
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
    host?: string
}

// Internal
interface Session {
    services: MLSService[],
    lastCreated: Date,
    lastTtl: number
    expires?: Date
}

interface TokenResponse {
    data: {
        services?: MLSService[],
        lastCreated: Date,
        lastTtl: number,
        errors?: any[]
    }
}

interface MongoWhereQuery {
    [key: string]: string | string[] | number | {
        inq?: string[] | number[],
        between?: number[],
        gte?: number,
        lte?: number,
        like?: string,
        options?: string
    }
}

// type MongoOrderQuery = string[]
interface MongoOrderQuery extends Array<string> {
}


interface MongoIncludeQuery {
    relation: string,
    scope: {
        fields: string[] | string,
        order?: string,
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


Stratus.Services.Idx = [
    '$provide',
    ($provide: any) => {
        $provide.factory('Idx', (
            $injector: angular.auto.IInjectorService,
            $http: angular.IHttpService,
            $location: angular.ILocationService,
            $q: angular.IQService,
            $rootScope: angular.IRootScopeService,
            $window: angular.IWindowService,
            // tslint:disable-next-line:no-shadowed-variable
            Collection: any,
            // tslint:disable-next-line:no-shadowed-variable
            Model: any,
            orderByFilter: any
            ) => {
                // TODO need to allow setting own tokenRefreshURL
                let tokenRefreshURL = '/ajax/request?class=property.token_auth&method=getToken'
                let refreshLoginTimer: any // Timeout object
                let defaultPageTitle: string
                console.log('Idx Service inited')
                /* const instance: {
                    List: object,
                    Search: object,
                    Details: object,
                    MemberList: object,
                    MemberSearch: object,
                    MemberDetails: object,
                    OfficeList: object,
                    OfficeSearch: object,
                    OfficeDetails: object
                } */
                const instance: any = { // FIXME theres a number of queries that need dynamic calls
                    PropertyList: {},
                    PropertySearch: {},
                    PropertyDetails: {},
                    MemberList: {},
                    MemberSearch: {},
                    MemberDetails: {},
                    OfficeList: {},
                    OfficeSearch: {},
                    OfficeDetails: {}
                }

                /** type {{List: Object<[String]>, Search: Object<[String]>}} */
                const instanceLink: {
                    List: object | any,
                    Search: object | any
                } = {
                    List: {},
                    Search: {}
                }

                /** type {{services: Array<MLSService>, lastCreated: Date, lastTtl: number}} */
                const session: Session = {
                    services: [],
                    lastCreated: new Date(),
                    lastTtl: 0
                }

                const urlOptions: {
                    Listing: object | any,
                    Search: object | any
                } = {
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
                 * Add List instance to the service
                 * @param uid - The elementId of a widget
                 * @param $scope - angular scope
                 * @param listType - Property / Member / Office
                 */
                function registerListInstance(uid: string, $scope: any, listType = 'Property'): void {
                    // if (!instance[listType + 'List']) {
                    if (!Object.prototype.hasOwnProperty.call(instance, listType + 'List')) {
                        instance[listType + 'List'] = {}
                    }
                    instance[listType + 'List'][uid] = $scope
                    if (!Object.prototype.hasOwnProperty.call(instanceLink.List, uid)) {
                        instanceLink.List[uid] = []
                    }
                }

                /**
                 * Add Search instance to the service, potentially connecting to a List
                 * @param uid - The elementId of a widget
                 * @param $scope - angular scope
                 * @param listUid -  uid name
                 * @param listType - Property / Member / Office
                 */
                function registerSearchInstance(uid: string, $scope: any, listUid?: string, listType = 'Property'): void {
                    instance[listType + 'Search'][uid] = $scope
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
                 * Add Search instance to the service
                 * @param uid - The elementId of a widget
                 * @param $scope - angular scope
                 * @param listType - Property / Member / Office
                 */
                function registerDetailsInstance(uid: string, $scope: any, listType = 'Property'): void {
                    instance[listType + 'Details'][uid] = $scope
                }

                /**
                 * Destroy a reference and Instance of a Details widget
                 * @param uid - The elementId of a widget
                 * @param listType - Property / Member / Office
                 */
                function unregisterDetailsInstance(uid: string, listType = 'Property'): void {
                    if (Object.prototype.hasOwnProperty.call(instance[listType + 'Details'], uid)) {
                        const detailUid = instance[listType + 'Details'][uid].getUid()
                        delete instance[listType + 'Details'][uid]
                        Stratus.Instances.Clean(detailUid)
                    }
                }

                /**
                 * Return the List scopes of a those connected to a particular Search widget
                 * @param searchUid - uid of search component
                 * @param listType - Property / Member / Office
                 */
                function getSearchInstanceLinks(searchUid: string, listType = 'Property'): any[] {
                    const linkedLists: any = []
                    if (Object.prototype.hasOwnProperty.call(instanceLink.Search, searchUid)) {
                        instanceLink.Search[searchUid].forEach((listUid: any) => {
                            if (Object.prototype.hasOwnProperty.call(instance[listType + 'List'], listUid)) {
                                linkedLists.push(instance[listType + 'List'][listUid])
                            }
                        })
                    }
                    return linkedLists
                }

                /**
                 * Return a List scope
                 * @param listUid - uid of List
                 * @param listType - Property / Member / Office
                 */
                function getListInstance(listUid: string, listType = 'Property'): any | null {
                    return Object.prototype.hasOwnProperty.call(instanceLink.List, listUid) ? instance[listType + 'List'][listUid] : null
                }

                /**
                 * Return the Search scopes of a those connected to a particular List widget
                 * @param listUid - uid of list
                 * @param listType - Property / Member / Office
                 */
                function getListInstanceLinks(listUid: string, listType = 'Property'): any[] {
                    const linkedSearches: any[] = []
                    if (Object.prototype.hasOwnProperty.call(instanceLink.List, listUid)) {
                        instanceLink.List[listUid].forEach((searchUid: any) => {
                            if (Object.prototype.hasOwnProperty.call(instance[listType + 'Search'], searchUid)) {
                                linkedSearches.push(instance[listType + 'Search'][searchUid])
                            }
                        })
                    }
                    return linkedSearches
                }

                /**
                 * Apply a new Page title or revert to the original; page title
                 * @param title - Page Title
                 */
                function setPageTitle(title: string): void {
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
                                session.expires < new Date() // if expiring in the next 15 seconds
                            ) {
                                await tokenRefresh(keepAlive)
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
                 */
                function tokenRefresh(keepAlive = false): IPromise<void> {
                    return $q((resolve: void | any, reject: void | any) => {
                        $http({
                            method: 'GET',
                            url: tokenRefreshURL
                        }).then((response: any) => {
                            // response as TokenResponse
                            if (
                                typeof response === 'object' &&
                                Object.prototype.hasOwnProperty.call(response, 'data') &&
                                Object.prototype.hasOwnProperty.call(response.data, 'services') &&
                                Object.prototype.hasOwnProperty.call(response.data.services, 'length')
                            ) {
                                tokenHandleGoodResponse(response)
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
                            session.services[service.id] = service
                            session.lastCreated = new Date(service.created)// The object is a String being converted to Date
                            session.lastTtl = service.ttl
                            // Set to expire 15 secs before it actually does
                            session.expires = new Date(session.lastCreated.getTime() + (session.lastTtl - 15) * 1000)
                        }
                    })
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
                function createModel(request: any): Model {
                    // request.direct = true;
                    const model = new Model(request) as Model
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
                function createCollection(request: any): Collection {
                    request.direct = true
                    const collection = new Collection(request) as Collection
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
                 * @param append -
                 */
                async function fetchMergeCollections(
                    originalCollection: Collection,
                    collections: Collection[],
                    append = false
                ): Promise<Collection> {
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
                                        resolve(modelInjectProperty(collection.models, {
                                            _ServiceId: collection.serviceId
                                        }))
                                    })
                                    .then(() => {
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
                 */
                function fetchReplaceModel(originalModel: Model, newModel: Model): IPromise<Model> {
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
                            console.log('sending fetchReplaceModel', newModel, options)
                            newModel.fetch('POST', null, options)
                                .then((data: any) => {
                                    resolve(data)
                                })
                                // Inject the local server's Service Id loaded from
                                .then(() => {
                                    resolve(modelInjectProperty([newModel.data], {
                                        _ServiceId: newModel.serviceId
                                    }))
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
                function modelInjectProperty(modelDatas: object[], properties: { [key: string]: any }): void {
                    modelDatas.forEach(modelData => {
                        _.extend(modelData, properties)
                    })
                }

                /**
                 * Sync a Collection with all members of a certain instance
                 * @param instanceType -
                 * @param scopedCollectionVarName -
                 */
                function createOrSyncCollectionVariable(instanceType: string, scopedCollectionVarName: string): Collection {
                    let collection: Collection // TODO define Collection
                    Object.keys(instance[instanceType]).forEach(listName => {
                        if (
                            !collection &&
                            Object.prototype.hasOwnProperty.call(instance[instanceType], listName) &&
                            Object.prototype.hasOwnProperty.call(instance[instanceType][listName], scopedCollectionVarName)
                        ) {
                            collection = instance[instanceType][listName][scopedCollectionVarName]
                        }
                    })
                    if (!collection) {
                        collection = new Collection() as Collection
                    }
                    Object.keys(instance[instanceType]).forEach(listName => {
                        if (
                            !Object.prototype.hasOwnProperty.call(instance[instanceType][listName], scopedCollectionVarName) ||
                            instance[instanceType][listName][scopedCollectionVarName] !== collection
                        ) {
                            instance[instanceType][listName][scopedCollectionVarName] = collection
                        }
                    }, this)
                    return collection
                }

                /**
                 * @param where - {WhereOptions}
                 */
                function compilePropertyWhereFilter(where: WhereOptions): MongoWhereQuery {
                    const whereQuery: MongoWhereQuery = {}
                    // ListingKey
                    if (Object.prototype.hasOwnProperty.call(where, 'ListingKey') && where.ListingKey !== '') {
                        whereQuery.ListingKey = where.ListingKey
                    }
                    // ListType
                    if (Object.prototype.hasOwnProperty.call(where, 'ListingType') && where.ListingType !== '') {
                        if (typeof where.ListingType === 'string') {
                            where.ListingType = [where.ListingType]
                        }
                        whereQuery.ListingType = where.ListingType
                    }
                    // Status
                    if (Object.prototype.hasOwnProperty.call(where, 'Status') && where.Status !== '') {
                        if (typeof where.Status === 'string') {
                            where.Status = [where.Status]
                        }
                        whereQuery.Status = {
                            inq: where.Status
                        }
                    }
                    // Agent License
                    if (Object.prototype.hasOwnProperty.call(where, 'AgentLicense') && where.AgentLicense !== '') {
                        if (typeof where.AgentLicense === 'string') {
                            where.AgentLicense = [where.AgentLicense]
                        }
                        if (where.AgentLicense.length > 0) {
                            whereQuery.AgentLicense = where.AgentLicense
                        }
                    }
                    // City
                    if (Object.prototype.hasOwnProperty.call(where, 'City') && where.City !== '') {
                        whereQuery.City = {
                            like: where.City,
                            options: 'i'
                        }
                    }
                    // List Price Min
                    if (Object.prototype.hasOwnProperty.call(where, 'ListPriceMin') && where.ListPriceMin && where.ListPriceMin !== 0) {
                        whereQuery.ListPrice = {gte: parseInt(where.ListPriceMin, 10)}
                    }
                    // List Price Max
                    if (Object.prototype.hasOwnProperty.call(where, 'ListPriceMax') && where.ListPriceMax && where.ListPriceMax !== 0) {
                        if (
                            Object.prototype.hasOwnProperty.call(whereQuery, 'ListPrice') &&
                            Object.prototype.hasOwnProperty.call(whereQuery.ListPrice, 'gte')
                        ) {
                            whereQuery.ListPrice = {
                                between: [
                                    parseInt(where.ListPriceMin, 10),
                                    parseInt(where.ListPriceMax, 10)
                                ]
                            }
                        } else {
                            whereQuery.ListPrice = {lte: parseInt(where.ListPriceMax, 10)}
                        }
                    }
                    // Baths Min
                    if (
                        Object.prototype.hasOwnProperty.call(where, 'BathroomsFullMin') &&
                        where.BathroomsFullMin && where.BathroomsFullMin !== 0
                    ) {
                        whereQuery.BathroomsFull = {gte: parseInt(where.BathroomsFullMin, 10)}
                    }
                    // Beds Min
                    if (
                        Object.prototype.hasOwnProperty.call(where, 'BedroomsTotalMin') &&
                        where.BedroomsTotalMin && where.BedroomsTotalMin !== 0
                    ) {
                        whereQuery.BedroomsTotal = {gte: parseInt(where.BedroomsTotalMin, 10)}
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

                    let skip = 0
                    if (options.page) {
                        skip = (options.page - 1) * options.perPage
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

                    // Included Images
                    if (options.images) {
                        const imageInclude: MongoIncludeQuery = {
                            relation: 'Images',
                            scope: {
                                order: 'Order',
                                fields: [
                                    'MediaURL'
                                ]
                            }
                        }
                        if (typeof options.images === 'object') {
                            if (Object.prototype.hasOwnProperty.call(options.images, 'limit')) {
                                imageInclude.scope.limit = options.images.limit
                            }
                            if (Object.prototype.hasOwnProperty.call(options.images, 'fields')) {
                                if (options.images.fields === '*') {
                                    delete imageInclude.scope.fields
                                } else {
                                    imageInclude.scope.fields = options.images.fields
                                }
                            }
                        }

                        includes.push(imageInclude)
                    }

                    // Included Open Houses (Property Only)
                    if (options.openhouses) {
                        const openHouseInclude: MongoIncludeQuery = {
                            relation: 'OpenHouses',
                            scope: {
                                order: 'OpenHouseStartTime', // FIXME should be ordered by default on db side (default scopes)
                                fields: [
                                    'OpenHouseStartTime',
                                    'OpenHouseEndTime'
                                ]
                            }
                        }
                        if (typeof options.openhouses === 'object') {
                            if (Object.prototype.hasOwnProperty.call(options.openhouses, 'limit')) {
                                openHouseInclude.scope.limit = options.openhouses.limit
                            }
                            if (Object.prototype.hasOwnProperty.call(options.openhouses, 'fields')) {
                                if (options.openhouses.fields === '*') {
                                    delete openHouseInclude.scope.fields
                                } else {
                                    openHouseInclude.scope.fields = options.openhouses.fields
                                }
                            }
                        }

                        includes.push(openHouseInclude)
                    }

                    // Include Office (Member Only)
                    if (options.office) {
                        const includeItem: MongoIncludeQuery = {
                            relation: 'Office',
                            scope: {
                                fields: [
                                    'OfficeName',
                                    'OfficeKey'
                                ]
                            }
                        }
                        if (typeof options.office === 'object') {
                            if (Object.prototype.hasOwnProperty.call(options.office, 'fields')) {
                                if (options.office.fields === '*') {
                                    delete includeItem.scope.fields
                                } else {
                                    includeItem.scope.fields = options.office.fields
                                }
                            }
                        }

                        includes.push(includeItem)
                    }

                    // Include Managing Broker Member Data (Office Only)
                    if (options.managingBroker) {
                        const includeItem: MongoIncludeQuery = {
                            relation: 'Member',
                            scope: {
                                fields: [
                                    'MemberFullName',
                                    'MemberStateLicense',
                                    'MemberKey'
                                ]
                            }
                        }
                        if (typeof options.managingBroker === 'object') {
                            if (Object.prototype.hasOwnProperty.call(options.managingBroker, 'fields')) {
                                if (options.managingBroker.fields === '*') {
                                    delete includeItem.scope.fields
                                } else {
                                    includeItem.scope.fields = options.managingBroker.fields
                                }
                            }
                        }

                        includes.push(includeItem)
                    }

                    // Include Members/Agents (Office Only)
                    if (options.members) {
                        const includeItem: MongoIncludeQuery = {
                            relation: 'Member',
                            scope: {
                                fields: [
                                    'MemberFullName',
                                    'MemberStateLicense',
                                    'MemberKey'
                                ]
                            }
                        }
                        if (typeof options.members === 'object') {
                            if (Object.prototype.hasOwnProperty.call(options.members, 'fields')) {
                                if (options.members.fields === '*') {
                                    delete includeItem.scope.fields
                                } else {
                                    includeItem.scope.fields = options.members.fields
                                }
                            }
                        }

                        includes.push(includeItem)
                    }

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
                                serviceList[session.services[serviceId].id] = {
                                    id: session.services[serviceId].id,
                                    name: session.services[serviceId].name,
                                    disclaimer: session.services[serviceId].disclaimer
                                }
                            }
                        })
                    } else {
                        session.services.forEach(service => {
                            serviceList[service.id] = {
                                id: service.id,
                                name: service.name,
                                disclaimer: service.disclaimer
                            }
                        })
                    }
                    // console.log('serviceList', serviceList);
                    return serviceList
                }

                /**
                 * Parse the hangbang Url for the serviceId and ListingKey of a listings
                 * TODO give options on different ways to parse? (e.g. Url formatting)
                 * returns {Object}
                 */
                function getOptionsFromUrl() {
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
                        urlOptions.Search.Page = parseInt(urlOptions.Search.Page, 10)
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
                    urlOptions[listingOrSearch] = options || {}
                    // console.log('updated urlOptions', listingOrSearch, options);
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
                function getUrlOptionsPath(defaultOptions: object | any) {
                    defaultOptions = defaultOptions || {}
                    let path = ''

                    // Set the Search List url variables
                    const searchOptionNames = Object.keys(urlOptions.Search)
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
                 * Process the currently set options and update the URL with what should be known
                 * TODO define defaultOptions
                 */
                function refreshUrlOptions(defaultOptions: object | any): void {
                    setLocationPath(getUrlOptionsPath(defaultOptions))
                    // console.log('Refreshed url with', urlOptions, defaultOptions);
                }

                /**
                 * Update the hashbang address bar. The path will always begin with #!/
                 * @param path - {String}
                 */
                function setLocationPath(path: string): void {
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
                 * TODO ensure 'orderByFilter' works
                 */
                function orderBy(collection: Collection, propertyNames: string | string[], reverse = false): void {
                    if (propertyNames && propertyNames !== []) {
                        collection.models = orderByFilter(collection.models, propertyNames, reverse)
                    }
                }

                function getSingularApiModelName(name: string): string {
                    let apiModelSingular = ''
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
                 *
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
                 * @param instanceName - {String}
                 * @param apiModel - {String}
                 * @param compileFilterFunction - {Function}
                 */
                async function genericSearchCollection(
                    $scope: object | any,
                    collectionVarName: string,
                    options = {} as CompileFilterOptions,
                    refresh = false,
                    instanceName: string,
                    apiModel: string,
                    compileFilterFunction: (options: CompileFilterOptions) => MongoFilterQuery
                ): Promise<Collection> {
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
                    const collection = await createOrSyncCollectionVariable(instanceName, collectionVarName)

                    // Set API paths to fetch listing data for each MLS Service
                    const filterQuery = compileFilterFunction(options)
                    // options.page items need to happen after here

                    const collections: Collection[] = [] // TODO define Collection

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
                                        createCollection(request)
                                    )
                                }
                            }
                        )

                        // When using the same WHERE and only changing the page, results should pool together (append)
                        // Fetch and Merge all results together into single list
                        await fetchMergeCollections(collection, collections, !refresh)

                        // If the query as updated, adjust the TotalRecords available
                        if (refresh) {
                            const totalRecords = collection.header.get('x-total-count') || 0
                            collection.meta.set('totalRecords', totalRecords)
                            collection.meta.set('totalPages', Math.ceil(totalRecords / options.perPage))
                        }

                        // Sort once more on the front end to ensure it's ordered correctly
                        orderBy(collection, options.order)

                        // Ensure the changes update on the DOM
                        Object.keys(instance[instanceName]).forEach(listName => {
                            // instance.List[listName].$digest(); // Digest to ensure the DOM/$watch updates with new model data
                            instance[instanceName][listName].$applyAsync() // Digest to ensure the DOM/$watch updates with new model data
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
                async function genericSearchModel(
                    $scope: object | any,
                    modelVarName: string,
                    options = {} as CompileFilterOptions,
                    apiModel: string,
                    compileFilterFunction: (options: CompileFilterOptions) => MongoFilterQuery
                ): Promise<Model> {
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
                    let model: Model
                    if (Object.prototype.hasOwnProperty.call($scope, modelVarName)) {
                        model = $scope[modelVarName]
                    }
                    if (!model) {
                        model = new Model() as Model
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

                        const request = {
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

                        const tempModel = createModel(request)

                        fetchReplaceModel(model, tempModel)
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
                 * @param listName - instance to save data to
                 */
                async function fetchProperties(
                    $scope: object | any,
                    collectionVarName: string,
                    options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'page' | 'perPage' | 'order' | 'fields' | 'images' | 'openhouses'>,
                    refresh = false,
                    listName = 'PropertyList'
                ): Promise<Collection> {
                    options.service = options.service || []
                    options.where = options.where || urlOptions.Search || {} // TODO may want to sanitize the urlOptions
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
                        'CountyOrParish',
                        'StateOrProvince',
                        'ListPrice',
                        'ClosePrice',
                        'ListingId',
                        'ListingKey',
                        'BathroomsFull',
                        'BedroomsTotal'
                    ]
                    // options.where['ListType'] = ['House','Townhouse'];

                    return genericSearchCollection($scope, collectionVarName, options, refresh,
                        listName,
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
                ): Promise<Model> {
                    options.service = options.service || null
                    options.where = options.where || {}
                    options.images = options.images || false
                    options.openhouses = options.openhouses || false
                    options.fields = options.fields || []

                    return genericSearchModel($scope, modelVarName, options,
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
                 * @param listName - instance to save data to
                 */
                async function fetchMembers(
                    $scope: object | any,
                    collectionVarName: string,
                    options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office'>,
                    refresh = false,
                    listName = 'MemberList'
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

                    return genericSearchCollection($scope, collectionVarName, options, refresh,
                        listName,
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
                 * @param listName - instance to save data to
                 */
                async function fetchOffices(
                    $scope: object | any,
                    collectionVarName: string,
                    options = {} as Pick<CompileFilterOptions, 'service' | 'where' | 'order' | 'page' | 'perPage' | 'fields' | 'images' | 'office' | 'managingBroker' | 'members'>,
                    refresh = false,
                    listName = 'OfficeList'
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

                    return genericSearchCollection($scope, collectionVarName, options, refresh,
                        listName,
                        'Offices',
                        compileOfficeFilter
                    )
                }

                return {
                    fetchMembers,
                    fetchOffices,
                    fetchProperties,
                    fetchProperty,
                    getListInstance,
                    getListInstanceLinks,
                    getSearchInstanceLinks,
                    getUrlOptionsPath,
                    getMLSVariables,
                    getOptionsFromUrl,
                    getUrlOptions,
                    tokenKeepAuth,
                    registerListInstance,
                    registerSearchInstance,
                    registerDetailsInstance,
                    setPageTitle,
                    setTokenURL,
                    setUrlOptions,
                    refreshUrlOptions,
                    unregisterDetailsInstance
                }
            }
        )
    }
]
