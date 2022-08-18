import { Injectable } from '@angular/core'
import {HttpClient, HttpResponse} from '@angular/common/http'
import {Observable, Subscriber} from 'rxjs'

// External
import {Stratus} from '@stratusjs/runtime/stratus'
import _ from 'lodash'

// Interfaces
export interface Query {
    fetched: number
    observable: Observable<HttpResponse<any>>
    data?: HttpResponse<any>
}

export interface QueryMap {
    [key: string]: Query
}

@Injectable({
    providedIn: 'root'
})
export class BackendService {

    // Basic Component Settings
    title = 'backend'
    uid: string

    // HTTP Logic
    cache: QueryMap

    constructor(private http: HttpClient) {
        // Initialization
        this.uid = _.uniqueId('sa_backend_service_')
        Stratus.Instances[this.uid] = this

        // Instantiate Cache
        this.cache = {}
    }

    // Create an Observable that returns XHR data
    get(url: string): Observable<HttpResponse<any>> {
        if (!_.isString(url)) {
            console.error('url is not a string:', url)
            return //new Observable()
        }
        if (url in this.cache) {
            return this.cache[url].observable
        }
        const now = new Date()
        const query = this.cache[url] = {
            fetched: now.valueOf(),
            observable: new Observable((subscriber: Subscriber<any>) => this.getData(url, subscriber))
        }
        return query.observable
    }

    // This ensures the XHR only runs once per query by caching the data
    private getData(url: string, subscriber: Subscriber<any>) {
        if (!_.isString(url)) {
            console.error('url is not a string:', url)
            return
        }
        // The observable cache reference should always be available
        if (!(url in this.cache)) {
            return
        }
        const query = this.cache[url]
        // Return data if already cached
        if ('data' in query) {
            subscriber.next(query.data)
            subscriber.complete()
            return
        }
        // Fetch data if not available
        this.http
            .get(url, { observe: 'response' })
            .subscribe((response: HttpResponse<any>) => {
                query.data = response
                subscriber.next(response)
                subscriber.complete()
            })
    }
}
