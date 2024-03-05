// Interfaces
import {
    BaseInterface
} from './base.interface'
import {
    ResponsiveInterface
} from './responsive.interface'

// Libraries
import {
    ChangeDetectorRef,
    OnDestroy
} from '@angular/core'
import {
    cookie
} from '@stratusjs/core/environment'
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'

/**
 * This provides common functionality for component responsiveness.
 */
export class ResponsiveComponent implements OnDestroy, ResponsiveInterface, BaseInterface {

    // identifiers
    uid: string

    // protected variables
    protected ref: ChangeDetectorRef
    protected disableRefresh = false
    protected stagger = true

    // local flags
    reloading = false

    /**
     * force a redraw
     * Increasingly delay the refresh loop timeout to avoid cases of components never finishing
     */
    public refresh(timeout = 100) {
        return new Promise<void>((resolve, reject) => {
            if (this.disableRefresh) {
                resolve()
                return
            }
            if (!this.ref) {
                console.error('ChangeDetectorRef not set:', this.uid)
                reject()
                return
            }
            if (this.reloading && this.stagger) {
                if (cookie('env')) {
                    console.warn('[flow control] waiting to refresh component:', this.uid)
                }
                setTimeout(() => {
                    this.refresh(timeout*2)
                        .then(() => resolve())
                }, timeout)
                return
            }
            this.reloading = true
            this.ref.detectChanges()
            this.reloading = false
            resolve()
        })
    }

    /**
     * Remove Stratus.Instance References on destruction
     * use super.ngOnDestroy() to override
     */
    ngOnDestroy() {
        if (!_.isEmpty(this.uid)) {
            return
        }
        delete Stratus.Instances[this.uid]
    }
}
