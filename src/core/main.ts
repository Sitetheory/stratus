// import * as _ from 'lodash';
// import * as jQuery from 'jquery';
// import * as bowser from 'bowser';

// Modules
import {Environment} from '@stratus/core/environment';
import {DOM} from '@stratus/core/dom';
import {Conversion} from '@stratus/core/conversion';

export class Stratus {
    Conversion = new Conversion();
    DOM = new DOM();
    Environment = new Environment();
    constructor() {
        // console.log('Stratus:', this, _, jQuery, bowser);
        console.log('Stratus:', this);
    }
}
