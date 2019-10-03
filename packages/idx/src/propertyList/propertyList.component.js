System.register(["lodash", "stratus", "angular", "angular-material", "angular-sanitize", "moment", "stratus.services.idx", "stratus.components.propertyDetails", "@stratusjs/core/misc", "@stratusjs/core/conversion"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var _, Stratus, angular, moment_1, misc_1, conversion_1, min, moduleName, localDir;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (angular_1) {
                angular = angular_1;
            },
            function (_2) {
            },
            function (_3) {
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (_4) {
            },
            function (_5) {
            },
            function (misc_1_1) {
                misc_1 = misc_1_1;
            },
            function (conversion_1_1) {
                conversion_1 = conversion_1_1;
            }
        ],
        execute: function () {
            min = Stratus.Environment.get('production') ? '.min' : '';
            moduleName = 'propertyList';
            localDir = Stratus.BaseUrl + 'content/common/stratus_test/node_modules/@stratusjs/idx/src/';
            Stratus.Components.PropertyList = {
                bindings: {
                    elementId: '@',
                    detailsLinkPopup: '@',
                    detailsLinkUrl: '@',
                    detailsLinkTarget: '@',
                    detailsTemplate: '@',
                    orderOptions: '@',
                    googleApiKey: '@',
                    options: '@',
                    template: '@'
                },
                controller($scope, $attrs, $mdDialog, $window, $timeout, $q, $sce, Idx) {
                    const $ctrl = this;
                    $ctrl.uid = _.uniqueId(conversion_1.camelToSnake(moduleName) + '_');
                    Stratus.Instances[$ctrl.uid] = $scope;
                    $scope.elementId = $attrs.elementId || $ctrl.uid;
                    Stratus.Internals.CssLoader(`${localDir}${moduleName}/${$attrs.template || moduleName}.component${min}.css`);
                    $ctrl.$onInit = () => __awaiter(this, void 0, void 0, function* () {
                        $scope.urlLoad = $attrs.urlLoad && misc_1.isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true;
                        $scope.detailsLinkPopup = $attrs.detailsLinkPopup && misc_1.isJSON($attrs.detailsLinkPopup) ?
                            JSON.parse($attrs.detailsLinkPopup) : true;
                        $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/details';
                        $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self';
                        $scope.detailsTemplate = $attrs.detailsTemplate || null;
                        $scope.options = $attrs.options && misc_1.isJSON($attrs.options) ? JSON.parse($attrs.options) : {};
                        $scope.options.order = $scope.options.order || null;
                        $scope.options.page = $scope.options.page || null;
                        $scope.options.perPage = $scope.options.perPage || 25;
                        $scope.options.images = $scope.options.images || { limit: 1 };
                        $scope.options.where = $scope.options.where || {};
                        $scope.options.where.City = $scope.options.where.City || '';
                        $scope.options.where.Status = $scope.options.where.Status || ['Active', 'Contract'];
                        $scope.options.where.ListingType = $scope.options.where.ListingType || ['House', 'Condo'];
                        $scope.options.where.AgentLicense = $scope.options.where.AgentLicense || [];
                        $ctrl.defaultOptions = JSON.parse(JSON.stringify($scope.options.where));
                        $scope.orderOptions = $scope.orderOptions || {
                            'Price (high to low)': '-ListPrice',
                            'Price (low to high)': 'ListPrice'
                        };
                        $scope.googleApiKey = $attrs.googleApiKey || null;
                        Idx.registerListInstance($scope.elementId, $scope);
                        let urlOptions = {};
                        if ($scope.urlLoad) {
                            Idx.setUrlOptions('Search', JSON.parse(JSON.stringify($ctrl.defaultOptions)));
                            urlOptions = Idx.getOptionsFromUrl();
                            if (urlOptions.Listing.service &&
                                urlOptions.Listing.ListingKey) {
                                $scope.displayPropertyDetails(urlOptions.Listing);
                            }
                        }
                        yield $scope.searchProperties(urlOptions.Search, true, false);
                    });
                    $scope.refreshSearchWidgetOptions = () => {
                        const searchScopes = Idx.getListInstanceLinks($scope.elementId);
                        searchScopes.forEach((searchScope) => {
                            searchScope.setQuery(Idx.getUrlOptions('Search'));
                            searchScope.listInitialized = true;
                        });
                    };
                    $scope.searchProperties = (options, refresh, updateUrl) => __awaiter(this, void 0, void 0, function* () {
                        return $q((resolve) => {
                            options = options || {};
                            updateUrl = updateUrl === false ? updateUrl : true;
                            if (refresh) {
                                $scope.options.page = 1;
                            }
                            if (Object.keys(options).length > 0) {
                                delete ($scope.options.where);
                                $scope.options.where = options;
                                if ($scope.options.where.Page) {
                                    $scope.options.page = $scope.options.where.Page;
                                    delete ($scope.options.where.Page);
                                }
                                if ($scope.options.where.Order) {
                                    $scope.options.order = $scope.options.where.Order;
                                    delete ($scope.options.where.Order);
                                }
                            }
                            else {
                                options = $scope.options.where || {};
                            }
                            if ($scope.options.page) {
                                options.Page = $scope.options.page;
                            }
                            if (options.Page <= 1) {
                                delete (options.Page);
                            }
                            if ($scope.options.order && $scope.options.order.length > 0) {
                                options.Order = $scope.options.order;
                            }
                            Idx.setUrlOptions('Search', options);
                            if (updateUrl) {
                                Idx.refreshUrlOptions($ctrl.defaultOptions);
                            }
                            $scope.refreshSearchWidgetOptions();
                            resolve(Idx.fetchProperties($scope, 'collection', $scope.options, refresh));
                        });
                    });
                    $scope.pageChange = (pageNumber, ev) => __awaiter(this, void 0, void 0, function* () {
                        if (ev) {
                            ev.preventDefault();
                        }
                        $scope.options.page = pageNumber;
                        yield $scope.searchProperties();
                    });
                    $scope.pageNext = (ev) => __awaiter(this, void 0, void 0, function* () {
                        if (!$scope.options.page) {
                            $scope.options.page = 1;
                        }
                        if ($scope.collection.completed && $scope.options.page < $scope.collection.meta.data.totalPages) {
                            yield $scope.pageChange($scope.options.page + 1, ev);
                        }
                    });
                    $scope.pagePrevious = (ev) => __awaiter(this, void 0, void 0, function* () {
                        if (!$scope.options.page) {
                            $scope.options.page = 1;
                        }
                        if ($scope.collection.completed && $scope.options.page > 1) {
                            const prev = parseInt($scope.options.page, 10) - 1 || 1;
                            yield $scope.pageChange(prev, ev);
                        }
                    });
                    $scope.orderChange = (order, ev) => __awaiter(this, void 0, void 0, function* () {
                        if (ev) {
                            ev.preventDefault();
                        }
                        $scope.options.order = order;
                        yield $scope.searchProperties(null, true, true);
                    });
                    $scope.getDetailsURL = (property) => $scope.detailsLinkUrl + '#!/Listing/' + property._ServiceId + '/' + property.ListingKey + '/';
                    $scope.getStreetAddress = (property) => {
                        let address = '';
                        if (Object.prototype.hasOwnProperty.call(property, 'UnparsedAddress') &&
                            property.UnparsedAddress !== '') {
                            address = property.UnparsedAddress;
                        }
                        else {
                            const addressParts = [];
                            [
                                'StreetNumberNumeric',
                                'StreetName',
                                'StreetSuffix',
                                'UnitNumber'
                            ]
                                .forEach((addressPart) => {
                                if (Object.prototype.hasOwnProperty.call(property, addressPart)) {
                                    if (addressPart === 'UnitNumber') {
                                        addressParts.push('Unit');
                                    }
                                    addressParts.push(property[addressPart]);
                                }
                            });
                            address = addressParts.join(' ');
                        }
                        return address;
                    };
                    $scope.getMLSVariables = () => {
                        if (!$ctrl.mlsVariables) {
                            $ctrl.mlsVariables = Idx.getMLSVariables();
                        }
                        return $ctrl.mlsVariables;
                    };
                    $scope.getMLSName = (serviceId) => {
                        const services = $scope.getMLSVariables();
                        let name = 'MLS';
                        if (services[serviceId]) {
                            name = services[serviceId].name;
                        }
                        return name;
                    };
                    $scope.processMLSDisclaimer = (html) => {
                        const services = $scope.getMLSVariables();
                        let disclaimer = '';
                        services.forEach(service => {
                            if (disclaimer) {
                                disclaimer += '<br>';
                            }
                            disclaimer += service.disclaimer;
                        });
                        if ($scope.collection.meta.data.fetchDate) {
                            disclaimer = `Last checked ${moment_1.default($scope.collection.meta.data.fetchDate).format('M/D/YY')}. ${disclaimer}`;
                        }
                        return html ? $sce.trustAsHtml(disclaimer) : disclaimer;
                    };
                    $scope.getMLSDisclaimer = (html) => {
                        if (!$ctrl.disclaimerHTML) {
                            $ctrl.disclaimerHTML = $scope.processMLSDisclaimer(true);
                        }
                        if (!$ctrl.disclaimerString) {
                            $ctrl.disclaimerString = $scope.processMLSDisclaimer(false);
                        }
                        return html ? $ctrl.disclaimerHTML : $ctrl.disclaimerString;
                    };
                    $scope.displayPropertyDetails = (property, ev) => {
                        if (ev) {
                            ev.preventDefault();
                        }
                        if ($scope.detailsLinkPopup === true) {
                            const templateOptions = {
                                element_id: 'property_detail_popup_' + property.ListingKey,
                                service: property._ServiceId,
                                'listing-key': property.ListingKey,
                                'default-list-options': JSON.stringify($ctrl.defaultOptions),
                                'page-title': true
                            };
                            if ($scope.googleApiKey) {
                                templateOptions['google-api-key'] = $scope.googleApiKey;
                            }
                            if ($scope.detailsTemplate) {
                                templateOptions.template = $scope.detailsTemplate;
                            }
                            let template = `<md-dialog aria-label="${property.ListingKey}">` +
                                '<stratus-property-details ';
                            _.each(templateOptions, (optionValue, optionKey) => {
                                template += `${optionKey}='${optionValue}'`;
                            });
                            template +=
                                '></stratus-property-details>' +
                                    '</md-dialog>';
                            $mdDialog.show({
                                template,
                                parent: angular.element(document.body),
                                targetEvent: ev,
                                clickOutsideToClose: true,
                                fullscreen: true
                            })
                                .then(() => {
                            }, () => {
                                Idx.setUrlOptions('Listing', {});
                                Idx.refreshUrlOptions($ctrl.defaultOptions);
                                Idx.setPageTitle();
                                $timeout(Idx.unregisterDetailsInstance('property_detail_popup'), 10);
                            });
                        }
                        else {
                            $window.open($scope.getDetailsURL(property), $scope.detailsLinkTarget);
                        }
                    };
                    $scope.remove = function remove() {
                    };
                },
                templateUrl: ($element, $attrs) => `${localDir}${moduleName}/${$attrs.template || moduleName}.component${min}.html`
            };
        }
    };
});
