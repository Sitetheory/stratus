// Interfaces
import {
    BaseInterface
} from '@stratusjs/angular/core/base.interface'
import {
    ResponsiveInterface
} from '@stratusjs/angular/core/responsive.interface'

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

    // private variables
    protected ref: ChangeDetectorRef

    // local flags
    reloading = false

    /**
     * force a redraw
     */
    public refresh() {
        return new Promise((resolve, reject) => {
            if (!this.ref) {
                console.error('ChangeDetectorRef not set:', this.uid)
                reject()
                return
            }
            if (this.reloading) {
                if (cookie('env')) {
                    console.warn('[control flow] waiting to refresh component:', this.uid)
                }
                setTimeout(() => {
                    this.refresh()
                        .then(() => resolve())
                }, 50)
                return
            }
            this.reloading = true
            this.ref.detach()
            this.ref.detectChanges()
            this.ref.reattach()
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
            delete Stratus.Instances[this.uid]
        }
    }
}
