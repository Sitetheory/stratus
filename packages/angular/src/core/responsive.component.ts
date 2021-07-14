// Interfaces
import {
    BaseInterface
} from '@stratusjs/angular/core/base.interface'
import {
    ResponsiveInterface
} from '@stratusjs/angular/core/responsive.interface'

// Libraries
import {
    ChangeDetectorRef
} from '@angular/core'
import {
    cookie
} from '@stratusjs/core/environment'

/**
 * This provides common functionality for component responsiveness.
 */
export class ResponsiveComponent implements ResponsiveInterface, BaseInterface {

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
}
