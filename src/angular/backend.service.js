System.register(["@angular/core", "@angular/common/http", "stratus", "lodash"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, http_1, Stratus, _, BackendService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_1) {
                _ = _1;
            }
        ],
        execute: function () {
            BackendService = class BackendService {
                constructor(http) {
                    this.http = http;
                    this.title = 'tree-dnd';
                    this.uid = _.uniqueId('sa_backend_service_');
                    Stratus.Instances[this.uid] = this;
                    this.cache = {};
                }
                get(url) {
                    if (!_.has(this.cache, url)) {
                        const now = new Date();
                        const data = this.http.get(url, { observe: 'response' });
                        this.cache[url] = {
                            fetched: now.valueOf(),
                            data
                        };
                        return data;
                    }
                    return this.cache[url].data;
                }
            };
            BackendService = __decorate([
                core_1.Injectable({
                    providedIn: 'root'
                }),
                __metadata("design:paramtypes", [http_1.HttpClient])
            ], BackendService);
            exports_1("BackendService", BackendService);
        }
    };
});
