import Quill from 'quill'
const BaseImage = Quill.import('formats/image')

const ATTRIBUTES = [
    'alt',
    'height',
    'width',
    'stratus-src',
    'stratusSrc'
]

export class QuillImageFormatPlugin extends BaseImage {

    /* */
    blotName = 'imageCustom'
    tagName = 'IMG'
    /* */

    /* *
    static create(value: any) {
        console.log('create:', value)
        const node = super.create(value)
        if (typeof value !== 'string') {
            return node
        }
        node.setAttribute('src', this.sanitize(value))
        return node
    }
    /* */

    /* *
    static formats(domNode: any) {
        console.log('formats:', domNode)
        return ATTRIBUTES.reduce((formats: LooseObject, attribute: string) => {
            if (!domNode.hasAttribute(attribute)) {
                return formats
            }
            formats[attribute] = domNode.getAttribute(attribute)
            return formats
        }, {})
    }
    /* */

    /* *
    static match(url: string) {
        return /\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+base64/.test(url)
    }

    static sanitize(url: string) {
        // return sanitize(url, ['http', 'https', 'data']) ? url : '//:0'
        return ''
    }
    /* */

    format(name: any, value: any) {
        console.log('format:', name, value, this.domNode.getAttribute('src'))
        if (ATTRIBUTES.indexOf(name) === -1) {
            super.format(name, value)
            return
        }
        if (!value) {
            this.domNode.removeAttribute(name)
            return
        }
        if (name === 'stratus-src') {
            console.log('stratus-src:', value)
            // value = this.sanitize_style(value)
        }
        if (name === 'stratusSrc') {
            console.log('stratusSrc:', value)
            // value = this.sanitize_style(value)
        }
        this.domNode.setAttribute(name, value)
    }
}
