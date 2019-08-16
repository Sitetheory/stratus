System.register(["@angular/core", "@angular/forms", "@angular/cdk/drag-drop", "rxjs", "@angular/platform-browser", "@angular/material/icon", "stratus", "lodash"], function (exports_1, context_1) {
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
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var core_1, forms_1, drag_drop_1, rxjs_1, platform_browser_1, icon_1, Stratus, _, localDir, systemDir, moduleName, has, SelectorComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (drag_drop_1_1) {
                drag_drop_1 = drag_drop_1_1;
            },
            function (rxjs_1_1) {
                rxjs_1 = rxjs_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (icon_1_1) {
                icon_1 = icon_1_1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_1) {
                _ = _1;
            }
        ],
        execute: function () {
            localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
            systemDir = '@stratus/angular';
            moduleName = 'selector';
            has = (object, path) => {
                return _.has(object, path) && !_.isEmpty(_.get(object, path));
            };
            SelectorComponent = class SelectorComponent {
                constructor(iconRegistry, sanitizer, ref) {
                    this.ref = ref;
                    this.title = 'selector-dnd';
                    this._ = _;
                    this.has = has;
                    this.log = console.log;
                    this.selectCtrl = new forms_1.FormControl();
                    this.registry = new Stratus.Data.Registry();
                    this.onChange = new rxjs_1.Subject();
                    this.uid = _.uniqueId('sa_selector_component_');
                    Stratus.Instances[this.uid] = this;
                    const that = this;
                    this.sanitizer = sanitizer;
                    iconRegistry.addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg'));
                    Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component.css`);
                    console.log('inputs:', this.target, this.id, this.manifest, this.api);
                    if (_.isUndefined(this.target)) {
                        this.target = 'Content';
                    }
                    this.dataSub = new rxjs_1.Observable(subscriber => this.dataDefer(subscriber));
                    this.fetchData()
                        .then((data) => {
                        if (!data.on) {
                            console.warn('Unable to bind data from Registry!');
                            return;
                        }
                        data.on('change', () => {
                            that.dataDefer(that.subscriber);
                            ref.detectChanges();
                        });
                        that.dataDefer(that.subscriber);
                        ref.detectChanges();
                    });
                }
                drop(event) {
                    const models = this.dataRef();
                    if (!models || !models.length) {
                        return;
                    }
                    drag_drop_1.moveItemInArray(models, event.previousIndex, event.currentIndex);
                    let priority = 0;
                    _.each(models, (model) => model.priority = priority++);
                    this.model.trigger('change');
                }
                remove(model) {
                    const models = this.dataRef();
                    if (!models || !models.length) {
                        return;
                    }
                    const index = models.indexOf(model);
                    if (index === -1) {
                        return;
                    }
                    models.splice(index, 1);
                    this.model.trigger('change');
                }
                fetchData() {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!this.fetched) {
                            this.fetched = this.registry.fetch(Stratus.Select('#widget-edit-entity'), this);
                        }
                        return this.fetched;
                    });
                }
                dataDefer(subscriber) {
                    this.subscriber = subscriber;
                    const models = this.dataRef();
                    if (!models || !models.length) {
                        setTimeout(() => {
                            this.dataDefer(subscriber);
                        }, 500);
                        return;
                    }
                    console.log('pushed models to subscriber.');
                    subscriber.next(models);
                }
                dataRef() {
                    if (!this.model) {
                        return [];
                    }
                    const models = _.get(this.model, 'data.version.modules');
                    if (!models || !_.isArray(models)) {
                        return [];
                    }
                    return models;
                }
                onDataChange(ref) {
                    this.dataDefer(this.subscriber);
                    ref.detectChanges();
                }
                prioritize() {
                    const models = this.dataRef();
                    if (!models || !models.length) {
                        return;
                    }
                    let priority = 0;
                    _.each(models, (model) => model.priority = priority++);
                }
            };
            __decorate([
                core_1.Input(),
                __metadata("design:type", String)
            ], SelectorComponent.prototype, "target", void 0);
            __decorate([
                core_1.Input(),
                __metadata("design:type", Number)
            ], SelectorComponent.prototype, "id", void 0);
            __decorate([
                core_1.Input(),
                __metadata("design:type", Boolean)
            ], SelectorComponent.prototype, "manifest", void 0);
            __decorate([
                core_1.Input(),
                __metadata("design:type", Object)
            ], SelectorComponent.prototype, "api", void 0);
            __decorate([
                core_1.Input(),
                __metadata("design:type", Object)
            ], SelectorComponent.prototype, "searchQuery", void 0);
            SelectorComponent = __decorate([
                core_1.Component({
                    selector: 'sa-selector',
                    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
                }),
                __metadata("design:paramtypes", [icon_1.MatIconRegistry, platform_browser_1.DomSanitizer, core_1.ChangeDetectorRef])
            ], SelectorComponent);
            exports_1("SelectorComponent", SelectorComponent);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VsZWN0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFtQk0sUUFBUSxHQUFHLDJEQUEyRCxDQUFDO1lBQ3ZFLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztZQUMvQixVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRXhCLEdBQUcsR0FBRyxDQUFDLE1BQWMsRUFBRSxJQUFZLEVBQVcsRUFBRTtnQkFDbEQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUM7WUFzQlcsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO2dCQXNDMUIsWUFBWSxZQUE2QixFQUFFLFNBQXVCLEVBQVUsR0FBc0I7b0JBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO29CQW5DbEcsVUFBSyxHQUFHLGNBQWMsQ0FBQztvQkFXdkIsTUFBQyxHQUFHLENBQUMsQ0FBQztvQkFDTixRQUFHLEdBQUcsR0FBRyxDQUFDO29CQUNWLFFBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO29CQUVsQixlQUFVLEdBQUcsSUFBSSxtQkFBVyxFQUFFLENBQUM7b0JBRy9CLGFBQVEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBU3ZDLGFBQVEsR0FBRyxJQUFJLGNBQU8sRUFBRSxDQUFDO29CQVdyQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDaEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxD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