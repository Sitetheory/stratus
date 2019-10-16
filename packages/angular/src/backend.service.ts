import { Injectable } from '@angular/core'
import {HttpClient, HttpResponse} from '@angular/common/http'
import {Observable} from 'rxjs'

// External
import {Stratus} from '@stratusjs/runtime/stratus'
import * as _ from 'lodash'

// Interfaces
export interface Query {
    fetched: number
    data: Observable<HttpResponse<any>>
}

export interface QueryMap {
    [key: string]: Query
}

@Injectable({
    providedIn: 'root'
})
export class BackendService {

    // Basic Component Settings
    title = 'tree-dnd'
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

    get(url: string): Observable<HttpResponse<any>> {
        if (!_.has(this.cache, url)) {
            const now = new Date()
            const data = this.http.get(url, { observe: 'response' })
            this.cache[url] = {
                fetched: now.valueOf(),
                data
            }
            return data
        }
        return this.cache[url].data
    }
}
