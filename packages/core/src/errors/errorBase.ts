// Error Prototype
// ---------------

import _ from 'lodash'

export class ErrorBase {
    public code: string
    public message: string
    public chain: Array<any>

    constructor(error: any, chain: any) {
        this.code = 'Internal'
        this.message = 'No discernible data received.'
        this.chain = []

        if (typeof error === 'string') {
            this.message = error
        } else if (error && typeof error === 'object') {
            _.extend(this, error)
        }

        this.chain.push(chain)
    }
}
