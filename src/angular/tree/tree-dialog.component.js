System.register(["@angular/core", "@angular/forms", "@angular/material/dialog", "rxjs/operators", "lodash", "stratus", "@stratus/angular/backend.service"], function (exports_1, context_1) {
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
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var core_1, forms_1, dialog_1, operators_1, _, Stratus, backend_service_1, localDir, systemDir, moduleName, parentModuleName, TreeDialogComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (dialog_1_1) {
                dialog_1 = dialog_1_1;
            },
            function (operators_1_1) {
                operators_1 = operators_1_1;
            },
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (backend_service_1_1) {
                backend_service_1 = backend_service_1_1;
            }
        ],
        execute: function () {
            localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
            systemDir = '@stratus/angular';
            moduleName = 'tree-dialog';
            parentModuleName = 'tree';
            TreeDialogComponent = class TreeDialogComponent {
                constructor(dialogRef, data, fb, backend) {
                    this.dialogRef = dialogRef;
                    this.data = data;
                    this.fb = fb;
                    this.backend = backend;
                    this.title = moduleName + '_component';
                    this.isContentLoading = false;
                }
                ngOnInit() {
                    this.uid = _.uniqueId(`sa_${moduleName}_component_`);
                    Stratus.Instances[this.uid] = this;
                    this._ = _;
                    Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component.css`);
                    this.dialogContentForm = this.fb.group({
                        contentSelectorInput: this.data.content
                    });
                    this.dialogContentForm
                        .get('contentSelectorInput')
                        .valueChanges
                        .pipe(operators_1.debounceTime(300), operators_1.tap(() => this.isContentLoading = true), operators_1.switchMap((value) => {
                        if (_.isString(value)) {
                            this.lastContentSelectorQuery = `/Api/Content?q=${value}`;
                        }
                        else {
                            this.data.content = value;
                            this.data.url = null;
                        }
                        return this.backend.get(this.lastContentSelectorQuery)
                            .pipe(operators_1.finalize(() => this.isContentLoading = false));
                    }))
                        .subscribe((response) => {
                        if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
                            return this.filteredContentOptions = [];
                        }
                        const payload = _.get(response.body, 'payload') || response.body;
                        if (_.isEmpty(payload) || !Array.isArray(payload)) {
                            return this.filteredContentOptions = [];
                        }
                        return this.filteredContentOptions = payload;
                    });
                }
                onCancelClick() {
                    this.dialogRef.close();
                }
                displayVersionTitle(option) {
                    if (option) {
                        return _.get(option, 'version.title');
                    }
                }
            };
            TreeDialogComponent = __decorate([
                core_1.Component({
                    selector: `sa-${moduleName}`,
                    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
                }),
                __param(1, core_1.Inject(dialog_1.MAT_DIALOG_DATA)),
                __metadata("design:paramtypes", [dialog_1.MatDialogRef, Object, forms_1.FormBuilder,
                    backend_service_1.BackendService])
            ], TreeDialogComponent);
            exports_1("TreeDialogComponent", TreeDialogComponent);
        }
    };
});
