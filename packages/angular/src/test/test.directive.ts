// Angular Core
import {
    Directive,
    ElementRef,
    HostListener
} from '@angular/core'

// RXJS

// External Dependencies
import {Stratus} from '@stratusjs/runtime/stratus'
import _ from 'lodash'


// Local Setup
// const systemDir = '@stratusjs/angular'
const moduleName = 'test'

@Directive({
    selector: `[sa-internal-${moduleName}]`
})

export class TestDirective { // implements OnInit, OnChanges {

    // Basic Component Settings'
    uid: string

    constructor(private el: ElementRef) {
        // Chain constructor
        // super()

        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_directive_`)
        Stratus.Instances[this.uid] = this

        console.warn(this.uid, 'has been load to', this.el)

        /*
        Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component.css`)
            .then(() => {
                this.styled = true
                this.refresh()
            })
            .catch((err: any) => {
                console.warn('Issue detected in CSS Loader for Component:', this)
                console.error(err)
                this.styled = true
                this.refresh()
            })
         */

        // Hydrate Root App Inputs
        // this.hydrate(elementRef, sanitizer, keys<SelectorComponent>())
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.highlight('yellow')
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.highlight(null)
    }

    private highlight(color: string) {
        this.el.nativeElement.style.backgroundColor = color
    }
}
