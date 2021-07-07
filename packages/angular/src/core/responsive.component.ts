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
        if (!this.ref) {
            console.error('ChangeDetectorRef not set:', this.uid)
            return
        }
        if (this.reloading) {
            if (cookie('env')) {
                console.warn('[collision avoidance] waiting to refresh component:', this.uid)
            }
            setTimeout(() => {
                this.refresh()
            }, 500)
            return
        }
        this.reloading = true
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
        this.reloading = false
    }
}
