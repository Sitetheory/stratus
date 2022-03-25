// Bind HTML Directive
// -----------------

// Runtime
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IParseService,
    ICompileService,
    ISCEService,
} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'bindHtml'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

// This directive binds html in a way that compiles the data as well...
Stratus.Directives.BindHtml = (
    $sce: ISCEService,
    $parse: IParseService,
    $compile: ICompileService & any,
) => ({
    restrict: 'A',
})
