//     Stratus.Components.Help.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Stratus Help Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular', 'angular-material'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {
    // TODO: Convert to Tether-Tooltip
    // This component intends to display help information
    // in an widely accessible tooltip icon standard.
    Stratus.Components.Help = {
        transclude: true,
        template: '<md-button class="md-icon-button" aria-label="help"><md-tooltip md-direction="top"><div ng-transclude=""></div></md-tooltip><md-icon md-svg-src="/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/info.svg"></md-icon></md-button>'
    };
}));
