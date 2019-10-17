import * as angular from 'angular'

export const getInjector = (): angular.auto.IInjectorService|null => {
    const $root = angular.element(document.documentElement)
    return (!$root || !$root.injector) ? null : $root.injector()
}
