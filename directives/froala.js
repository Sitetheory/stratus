// Froala Directive
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'stratus',
            'jquery',
            'froala',
            'angular',
            'underscore',
            'stratus.services.model',
            'codemirror/mode/htmlmixed/htmlmixed',
            'codemirror/addon/edit/matchbrackets',
            'codemirror',
            'froala-align',
            'froala-code-beautifier',
            'froala-code-view',
            'froala-draggable',
            'froala-entities',
            'froala-file',
            'froala-forms',
            'froala-fullscreen',
            'froala-help',
            'froala-image',
            'froala-image-manager',
            'froala-inline-style',
            'froala-link',
            'froala-lists',
            'froala-paragraph-format',
            'froala-paragraph-style',
            'froala-quick-insert',
            'froala-quote',
            'froala-table',
            'froala-url',
            'froala-video',
            'froala-word-paste'
        ], factory);
    } else {
        factory(root.Stratus, root.$);
    }
}(this, function (Stratus, $) {
    // This directive intends to provide basic froala capabilities.
    Stratus.Directives.Froala = ['froalaConfig', 'model', function (froalaConfig, model) {
        'use strict'; // Scope strict mode to only this directive
        var generatedIds = 0;
        var defaultConfig = {
            immediateAngularModelUpdate: false,
            angularIgnoreAttrs: null
        };

        var innerHtmlAttr = 'innerHTML';

        froalaConfig = froalaConfig || {};

        // console.log('froalaConfig:', froalaConfig);

        // Constants
        var MANUAL = 'manual';
        var AUTOMATIC = 'automatic';
        var SPECIAL_TAGS = ['img', 'button', 'input', 'a'];

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                ngModel: '=',
                property: '@',
                froalaOptions: '=stratusFroala',
                staticOptions: '@froalaOptions', // Alias of stratusFroala, but for instances where the data cannot be bound
                initFunction: '&froalaInit',
                autoSave: '@' // A bool/string to define if the model will auto save on focus out or Enter presses. Defaults to true
            },
            link: function (scope, element, attrs, ngModel) {
                // Initialize
                scope.uid = this.uid = _.uniqueId('froala_');
                Stratus.Instances[this.uid] = scope;

                // Data Connectivity
                scope.model = null;

                if (!ngModel || !scope.property) {
                    console.warn(scope.uid + ' has no model or property!');
                    return;
                }

                // Twiddle Element to Zepto since Angular is lame and doesn't handle anything other than jQuery...
                element = element.length ? $(element[0]) : element;

                var specialTag = false;
                if (SPECIAL_TAGS.indexOf(element.prop('tagName').toLowerCase()) !== -1) {
                    specialTag = true;
                }

                var ctrl = {
                    editorInitialized: false
                };

                if (scope.staticOptions && typeof scope.staticOptions === 'string') {
                    scope.staticOptions = JSON.parse(scope.staticOptions);
                }

                scope.initMode = attrs.froalaInit ? MANUAL : AUTOMATIC;

                scope.settle = function () {
                    if (ctrl.editorInitialized
                        && scope.model instanceof model
                        && scope.property
                        && scope.model.get(scope.property) !== scope.value
                    ) {
                        scope.model.set(scope.property, scope.value);
                        if (!scope.$root.$$phase) {
                            scope.$apply();
                        }
                    }
                };

                scope.accept = function () {
                    if (ctrl.editorInitialized
                        && scope.model instanceof model
                        && scope.property
                        && scope.model.changed === true
                    ) {
                        // scope.model.set(scope.property, scope.value);
                        scope.model.throttleSave();
                    }
                };

                // We may not be using a cancel function
                /*scope.cancel = function () {
                    if (ctrl.editorInitialized
                        && scope.model instanceof model
                        && scope.property)
                    {
                        scope.value = scope.model.get(scope.property);
                        ngModel.$render();
                    }
                };*/

                ctrl.init = function () {
                    if (!attrs.id) {
                        // generate an ID if not present
                        attrs.$set('id', 'froala-' + generatedIds++);
                    }

                    scope.$watch('model.data.' + scope.property, function (data) {
                        scope.value = data;
                        ngModel.$render(); // if the value changes, show the new change (since rendering doesn't always happen)
                    });

                    // init the editor
                    if (scope.initMode === AUTOMATIC) {
                        ctrl.createEditor();
                    }

                    // Instruct ngModel how to update the froala editor
                    ngModel.$render = function () {
                        if (ctrl.editorInitialized) {
                            if (specialTag) {
                                var tags = scope.value;

                                // add tags on element
                                if (tags) {
                                    for (var attr in tags) {
                                        if (tags.hasOwnProperty(attr) && attr != innerHtmlAttr) {
                                            element.attr(attr, tags[attr]);
                                        }
                                    }
                                    if (tags.hasOwnProperty(innerHtmlAttr)) {
                                        element[0].innerHTML = tags[innerHtmlAttr];
                                    }
                                }
                            } else if (element.froalaEditor('html.get') !== scope.value) { // only rerender if there is a change
                                element.froalaEditor('html.set', scope.value || '', true);

                                // This will reset the undo stack everytime the model changes externally. Can we fix this?
                                element.froalaEditor('undo.reset');
                                element.froalaEditor('undo.saveStep');
                            }
                        }
                    };

                    ngModel.$isEmpty = function (value) {
                        if (!value) {
                            return true;
                        }

                        return element.froalaEditor('node.isEmpty', $('<div>' + value + '</div>').get(0));
                    };
                };

                ctrl.createEditor = function (froalaInitOptions) {
                    ctrl.listeningEvents = ['froalaEditor'];
                    if (!ctrl.editorInitialized) {
                        froalaInitOptions = (froalaInitOptions || {});
                        ctrl.options = angular.extend({}, defaultConfig, froalaConfig, scope.froalaOptions, scope.staticOptions, froalaInitOptions);

                        if (ctrl.options.immediateAngularModelUpdate) {
                            ctrl.listeningEvents.push('keyup');
                        }

                        // flush means to load ng-model into editor
                        var flushNgModel = function () {
                            ctrl.editorInitialized = true;
                            ngModel.$render();
                        };

                        if (specialTag) {
                            // flush before editor is initialized
                            flushNgModel();
                        } else {
                            ctrl.registerEventsWithCallbacks('froalaEditor.initialized', function () {
                                flushNgModel();
                            });
                        }

                        // Register events provided in the options
                        // Registering events before initializing the editor will bind the initialized event correctly.
                        for (var eventName in ctrl.options.events) {
                            if (ctrl.options.events.hasOwnProperty(eventName)) {
                                ctrl.registerEventsWithCallbacks(eventName, ctrl.options.events[eventName]);
                            }
                        }

                        ctrl.froalaElement = element.froalaEditor(ctrl.options).data('froala.editor').$el;
                        ctrl.froalaEditor = angular.bind(element, element.froalaEditor);
                        ctrl.initListeners();

                        // assign the froala instance to the options object to make methods available in parent scope
                        if (scope.froalaOptions) {
                            scope.froalaOptions.froalaEditor = ctrl.froalaEditor;
                        }
                    }
                };

                ctrl.initListeners = function () {
                    if (ctrl.options.immediateAngularModelUpdate) {
                        ctrl.froalaElement.on('keyup', function () {
                            scope.$evalAsync(ctrl.updateModelView);
                        });
                    }

                    element.on('froalaEditor.contentChanged', function () {
                        scope.$evalAsync(ctrl.updateModelView);
                    });

                    element.bind('$destroy', function () {
                        element.off(ctrl.listeningEvents.join(' '));
                        element.froalaEditor('destroy');
                        element = null;
                    });

                    if (scope.autoSave !== false
                        && scope.autoSave !== 'false'
                    ) {
                        element.froalaEditor('events.on', 'blur', function () {
                            if (ctrl.editorInitialized) {
                                switch (event.type) {
                                    case 'focusout':
                                    case 'blur':
                                        scope.$apply(scope.accept);
                                        break;
                                }
                            }
                        });
                    }

                    // FIXME need to make blur on cancel
                    /*element.froalaEditor('events.on', 'keydown keypress', function (event) {
                        if (ctrl.editorInitialized) {
                            switch (event.which) {
                                case Stratus.Key.Escape:
                                    scope.$apply(scope.cancel);
                                    element.blur();
                                    break;
                            }
                        }
                    });*/
                };

                ctrl.updateModelView = function () {

                    var modelContent = null;

                    if (specialTag) {
                        var attributeNodes = element[0].attributes;
                        var attrs = {};

                        for (var i = 0; i < attributeNodes.length; i++) {
                            var attrName = attributeNodes[i].name;
                            if (ctrl.options.angularIgnoreAttrs && ctrl.options.angularIgnoreAttrs.indexOf(attrName) !== -1) {
                                continue;
                            }
                            attrs[attrName] = attributeNodes[i].value;
                        }
                        if (element[0].innerHTML) {
                            attrs[innerHtmlAttr] = element[0].innerHTML;
                        }
                        modelContent = attrs;
                    } else {
                        var returnedHtml = element.froalaEditor('html.get');
                        if (angular.isString(returnedHtml)) {
                            modelContent = returnedHtml;
                        }
                    }

                    scope.value = modelContent;
                    scope.settle();
                };

                ctrl.registerEventsWithCallbacks = function (eventName, callback) {
                    if (eventName && callback) {
                        ctrl.listeningEvents.push(eventName);
                        element.on(eventName, callback);
                    }
                };

                if (scope.initMode === MANUAL) {
                    var _ctrl = ctrl;
                    var controls = {
                        initialize: ctrl.createEditor,
                        destroy: function () {
                            if (_ctrl.froalaEditor) {
                                _ctrl.froalaEditor('destroy');
                                _ctrl.editorInitialized = false;
                            }
                        },
                        getEditor: function () {
                            return _ctrl.froalaEditor ? _ctrl.froalaEditor : null;
                        }
                    };
                    scope.initFunction({ initControls: controls });
                }

                scope.$watch('ngModel', function (data) {
                    if (data instanceof model && !_.isEqual(data, scope.model)) {
                        scope.model = data;
                        if (ctrl.initialized !== true) {
                            var unwatch = scope.$watch('model.data', function (dataCheck) {
                                if (dataCheck !== undefined) {
                                    unwatch(); // Remove this watch as soon as it's run once
                                    ctrl.init(); // Initialize only after there is a model to work with
                                }
                            });
                        }
                    }
                });
            }
        };
    }];
    Stratus.Directives.FroalaView = ['$sce', function ($sce) {
        return {
            restrict: 'ACM',
            scope: false,
            link: function (scope, element, attrs) {
                element.addClass('fr-view');
                scope.$watch(attrs.froalaView, function (nv) {
                    if (nv || nv === '') {
                        var explicitlyTrustedValue = $sce.trustAsHtml(nv);
                        element.html(explicitlyTrustedValue.toString());
                    }
                });
            }
        };
    }];
}));
