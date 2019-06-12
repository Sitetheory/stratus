System.register(["@angular/core", "@angular/cdk/drag-drop"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var core_1, drag_drop_1, Aetherial;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (drag_drop_1_1) {
                drag_drop_1 = drag_drop_1_1;
            }
        ],
        execute: function () {
            Aetherial = class Aetherial {
                constructor() {
                    this.examples = [
                        'Foo',
                        'Bar',
                        'Baz',
                        'Qux',
                    ];
                }
                drop(event) {
                    drag_drop_1.moveItemInArray(this.examples, event.previousIndex, event.currentIndex);
                    console.log('');
                    this.examples.forEach((m) => console.log(m));
                }
            };
            Aetherial = __decorate([
                core_1.Component({
                    selector: 'stratus-aetherial',
                    templateUrl: 'aetherial.html',
                    styleUrls: ['aetherial.css'],
                })
            ], Aetherial);
            exports_1("Aetherial", Aetherial);
        }
    };
});
