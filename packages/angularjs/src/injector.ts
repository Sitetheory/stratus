import {auto, element} from 'angular'

export const getInjector = (): auto.IInjectorService|null => {
    const $root = element(document.documentElement)
    return (!$root || !$root.injector) ? null : $root.injector()
}
