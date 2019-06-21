System.register(["@angular/cdk/a11y", "@angular/cdk/drag-drop", "@angular/cdk/portal", "@angular/cdk/scrolling", "@angular/cdk/stepper", "@angular/cdk/table", "@angular/cdk/tree", "@angular/core", "@angular/material"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var a11y_1, drag_drop_1, portal_1, scrolling_1, stepper_1, table_1, tree_1, core_1, material_1, MaterialModules;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (a11y_1_1) {
                a11y_1 = a11y_1_1;
            },
            function (drag_drop_1_1) {
                drag_drop_1 = drag_drop_1_1;
            },
            function (portal_1_1) {
                portal_1 = portal_1_1;
            },
            function (scrolling_1_1) {
                scrolling_1 = scrolling_1_1;
            },
            function (stepper_1_1) {
                stepper_1 = stepper_1_1;
            },
            function (table_1_1) {
                table_1 = table_1_1;
            },
            function (tree_1_1) {
                tree_1 = tree_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (material_1_1) {
                material_1 = material_1_1;
            }
        ],
        execute: function () {
            MaterialModules = class MaterialModules {
            };
            MaterialModules = __decorate([
                core_1.NgModule({
                    exports: [
                        a11y_1.A11yModule,
                        stepper_1.CdkStepperModule,
                        table_1.CdkTableModule,
                        tree_1.CdkTreeModule,
                        drag_drop_1.DragDropModule,
                        material_1.MatAutocompleteModule,
                        material_1.MatBadgeModule,
                        material_1.MatBottomSheetModule,
                        material_1.MatButtonModule,
                        material_1.MatButtonToggleModule,
                        material_1.MatCardModule,
                        material_1.MatCheckboxModule,
                        material_1.MatChipsModule,
                        material_1.MatStepperModule,
                        material_1.MatDatepickerModule,
                        material_1.MatDialogModule,
                        material_1.MatDividerModule,
                        material_1.MatExpansionModule,
                        material_1.MatGridListModule,
                        material_1.MatIconModule,
                        material_1.MatInputModule,
                        material_1.MatListModule,
                        material_1.MatMenuModule,
                        material_1.MatNativeDateModule,
                        material_1.MatPaginatorModule,
                        material_1.MatProgressBarModule,
                        material_1.MatProgressSpinnerModule,
                        material_1.MatRadioModule,
                        material_1.MatRippleModule,
                        material_1.MatSelectModule,
                        material_1.MatSidenavModule,
                        material_1.MatSliderModule,
                        material_1.MatSlideToggleModule,
                        material_1.MatSnackBarModule,
                        material_1.MatSortModule,
                        material_1.MatTableModule,
                        material_1.MatTabsModule,
                        material_1.MatToolbarModule,
                        material_1.MatTooltipModule,
                        material_1.MatTreeModule,
                        portal_1.PortalModule,
                        scrolling_1.ScrollingModule,
                    ]
                })
            ], MaterialModules);
            exports_1("MaterialModules", MaterialModules);
        }
    };
});
//# sourceMappingURL=material.js.map