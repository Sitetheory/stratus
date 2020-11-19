import {Directive, ElementRef, Renderer2, Input} from '@angular/core'

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[froalaView]'
})
export class FroalaViewDirective {

    private _element: HTMLElement

    constructor(private renderer: Renderer2, element: ElementRef) {
        this._element = element.nativeElement
    }

    // update content model as it comes
    @Input() set froalaView(content: string) {
        this._element.innerHTML = content
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngAfterViewInit() {
        this.renderer.addClass(this._element, 'fr-view')
    }
}
