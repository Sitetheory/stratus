System.register(["@angular/core", "@angular/cdk/drag-drop", "@angular/platform-browser", "@angular/material/icon", "stratus", "lodash"], function (exports_1, context_1) {
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
    var core_1, drag_drop_1, platform_browser_1, icon_1, Stratus, _, localDir, SelectorComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (drag_drop_1_1) {
                drag_drop_1 = drag_drop_1_1;
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
            SelectorComponent = class SelectorComponent {
                constructor(iconRegistry, sanitizer) {
                    this.title = 'selector-dnd';
                    this.uid = _.uniqueId('s2_selector_component_');
                    Stratus.Instances[this.uid] = this;
                    this.registry = new Stratus.Data.Registry();
                    this.registry.fetch({
                        target: 'Content'
                    }, this)
                        .then(function (data) {
                        console.log('Received:', data);
                    });
                    iconRegistry.addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg'));
                }
                drop(event) {
                    drag_drop_1.moveItemInArray(this.collection.models, event.previousIndex, event.currentIndex);
                }
                remove(model) {
                    console.log('remove:', model, 'from:', this.collection ? this.collection.models : []);
                }
            };
            SelectorComponent = __decorate([
                core_1.Component({
                    selector: 's2-selector',
                    templateUrl: `${localDir}/selector/selector.component.html`,
                    styleUrls: [
                        `${localDir}/selector/selector.component.css`
                    ],
                }),
                __metadata("design:paramtypes", [icon_1.MatIconRegistry, platform_browser_1.DomSanitizer])
            ], SelectorComponent);
            exports_1("SelectorComponent", SelectorComponent);
        }
    };
});
