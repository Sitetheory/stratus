## Angular Usage

This is the TypeScript version of Angular, which utilizes the TypeScript version of Stratus.

Note: This portion of the project is in heavy development and is subject to change.

##### Component

A Component takes on a full HTML tag, as opposed to Directives which are accessible as a decorator inside another tag.

```html
<sa-component></sa-component>
```

##### Directive

A Directive is only a decorator for an HTML tag, as opposed to Components which are the entire tag.

```html
<span saDirective></span>
```

##### XHRs

We currently handle XHRs with our Data Service, inside your respective Component or Directive.

```typescript
import {FormBuilder, FormGroup} from '@angular/forms';
import {BackendService} from '@stratus/angular/backend.service';
import * as _ from 'lodash';

@Component({
    selector: 'sa-data-component',
    templateUrl: 'data.component.html',
})
export class DataComponent implements OnInit {

    filteredOptions: any[];
    dialogForm: FormGroup;
    isLoading = false;
    lastSelectorQuery: string;

    content: any;
    url: string;

    constructor(
        private fb: FormBuilder,
        private backend: BackendService
    ) {}

    ngOnInit() {
        this.dialogForm = this.fb.group({
            selectorInput: this.content
        });

        this.dialogForm
            .get('selectorInput')
            .valueChanges
            .pipe(
                debounceTime(300),
                tap(() => this.isLoading = true),
                switchMap(value => {
                        if (_.isString(value)) {
                            this.lastSelectorQuery = `/Api/Content?q=${value}`;
                        } else {
                            this.content = value;
                            this.url = null;
                        }
                        return this.backend.get(this.lastSelectorQuery)
                            .pipe(
                                finalize(() => this.isLoading = false),
                            );
                    }
                )
            )
            .subscribe(response => {
                if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
                    return this.filteredOptions = [];
                }
                const payload = _.get(response.body, 'payload') || response.body;
                if (_.isEmpty(payload) || !Array.isArray(payload)) {
                    return this.filteredOptions = [];
                }
                return this.filteredOptions = payload;
            });
    }
}
```
