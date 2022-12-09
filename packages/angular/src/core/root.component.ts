import 'reflect-metadata'
import _ from 'lodash'
import {
    ElementRef,
    Sanitizer,
    SecurityContext
} from '@angular/core'
import {
    ResponsiveComponent
} from './responsive.component'

/**
 * This provides common functionality for root components.
 */
export class RootComponent extends ResponsiveComponent {

    /**
     * @param elementRef The DOM Element to reference attributes from.
     * @param sanitizer The service to ensure we receive safe, sanitized data from attributes.
     * @param attrs List of attributes for this particular class.  Example: keys<FooComponent>()
     */
    protected hydrate(elementRef: ElementRef, sanitizer: Sanitizer, attrs: Array<string>) {
        _.forEach(attrs, (attr: string) => {
            const metaDataKeys = Reflect.getMetadataKeys(this, attr)
            if (!_.includes(metaDataKeys, 'design:type')) {
                return
            }
            const attrKebab = _.kebabCase(attr)
            const variants = [
                attrKebab,
                'data-' + attrKebab
            ]
            const variant = _.find(variants, (v) => elementRef.nativeElement.hasAttribute(v))
            if (_.isEmpty(variant)) {
                return
            }
            const value = sanitizer.sanitize(SecurityContext.HTML, elementRef.nativeElement.getAttribute(variant))
            _.set(this, attr, value)
        })
    }
}
