# IDX Bundle Splitting Plan

## Context

`@stratusjs/idx` currently builds one broad `idx.bundle` from `packages/idx/src/**/*.js`. The Stratus boot config maps all IDX component names to that one bundle, including:

- `stratus.components.idxPropertySearch`
- `stratus.components.idxPropertyList`
- `stratus.components.idxPropertyDetails`
- `stratus.components.idxMap`
- `stratus.components.idxDisclaimer`
- member and office widgets

This is simple and reliable, but it makes lightweight pages pay for code they do not use. For example, a landing page with only `<stratus-idx-property-search>` can still load the full IDX bundle, which includes list, details, map, disclaimer, popup-details, and code paths that can require swiper.

The optimization goal is to keep current behavior as the fallback while allowing simple pages to load only the IDX code they need.

## Constraints

- Search-only landing pages should not load property list, property details, map, office/member widgets, or swiper.
- A page with a property list may need property details later because list items can open a details popup.
- Property details may need swiper for image galleries.
- Dedicated property list pages may legitimately need search, list, map, disclaimer, and details popup support.
- IDX disclaimer is often added separately in the footer when IDX content is present.
- Dynamic popup content must still work. If a popup inserts `<stratus-idx-property-details>`, the component must already be available or Stratus must reliably rescan/import it.
- CSS must be considered with JS. Splitting JS while continuing to load all `idx.bundle.min.css` limits the performance gain.

## Recommended Phases

### Phase 1: Safe Component Bundles With Full Fallback

Create dedicated bundle outputs for the common top-level widgets while keeping the current full bundle as a fallback.

Initial bundle targets:

- `idx.core.bundle`: shared `Idx` service, session/token logic, common utilities, ListTrac.
- `idx.disclaimer.bundle`: disclaimer component only, depending on core.
- `idx.property-search.bundle`: property search component only, depending on core and AngularJS extras it actually uses.
- `idx.property-list.bundle`: property list component, depending on core. If popup details are enabled, either include or preload details support.
- `idx.property-details.bundle`: property details and details sub-section, depending on core and swiper.
- `idx.map.bundle`: IDX map component, depending on core and map package.

Boot config should map specific component names first:

```js
'stratus.components.idxDisclaimer': idxDisclaimerBundlePath,
'stratus.components.idxPropertySearch': idxPropertySearchBundlePath,
'stratus.components.idxPropertyList': idxPropertyListBundlePath,
'stratus.components.idxPropertyDetails': idxPropertyDetailsBundlePath,
'stratus.components.idxPropertyDetailsSubSection': idxPropertyDetailsBundlePath,
'stratus.components.idxMap': idxMapBundlePath,
// Keep broad fallback for unknown or not-yet-split widgets.
'@stratusjs/idx': idxBundlePath,
'@stratusjs/idx/*': idxBundlePath,
'stratus.components.idx*': idxBundlePath,
```

Expected win:

- Search-only landing pages can avoid loading the full IDX bundle and swiper.
- Full IDX pages still work through specific bundles or fallback.

### Phase 2: CSS Split

Split `idx.bundle.min.css` into component-level CSS:

- `idx.property-search.bundle.min.css`
- `idx.property-list.bundle.min.css`
- `idx.property-details.bundle.min.css`
- `idx.disclaimer.bundle.min.css`
- `idx.map.bundle.min.css`

Component code should load the matching CSS with `Stratus.Internals.CssLoader()` only when the component is active. Shared IDX CSS should either be very small or loaded by `idx.core.bundle`.

Expected win:

- Reduces render-blocking and unused CSS on pages with only the search widget.

### Phase 3: Dynamic Details Loading

For property list popups, choose one explicit behavior:

1. If details popup is enabled, `idx.property-list.bundle` preloads `idx.property-details.bundle`.
2. If details popup is opened, the list component imports `idx.property-details.bundle` on demand before rendering the popup.
3. Stratus reliably rescans/imports AngularJS components inserted into dynamic popup DOM.

Option 2 is likely the best long-term behavior. Option 1 is safer as a first implementation because it does not depend on new dynamic AngularJS scan behavior.

### Phase 4: Remove Broad Fallback After Coverage

After all IDX widgets have specific bundle mappings and pages have been tested, the broad `stratus.components.idx*` fallback can be removed or kept only for development compatibility.

Do not remove the fallback in the first pass.

## Testing Checklist

Test one URL at a time while iterating.

Search-only landing page:

- Page loads without console errors.
- Property search renders and submits.
- `idx.bundle.min.js` is not loaded.
- `swiper.bundle.min.js` is not loaded.
- Only property-search/disclaimer CSS loads.

Landing page with property list:

- Search renders.
- Property list renders.
- Disclaimer renders.
- Details popup opens.
- Details popup gallery works if images exist.

Dedicated property list page:

- Search, list, map, disclaimer, and details popup all work.
- No duplicate AngularJS module errors.
- No duplicate SystemJS fetches under different URL identities.

Admin/live preview:

- Preview mode still loads required widgets.
- Dynamic content inserted by live editing still loads.

## Known Risks

- Current per-component compiled files may contain relative `.less` imports. Do not point production config directly at raw component files until CSS handling is verified.
- Bundle splitting can accidentally duplicate the shared `Idx` service if each bundle includes its own copy. Shared service code should be externalized or centralized in `idx.core.bundle`.
- Property list popups are the main dynamic-loading risk.
- CSS split is necessary for the full Lighthouse gain, but it increases testing scope.

## Suggested First Implementation

Start with only:

- `idx.core.bundle`
- `idx.property-search.bundle`
- `idx.disclaimer.bundle`

Keep every other IDX component mapped to the existing full bundle. This gives the search-only landing page a measurable test case without changing property list/details behavior.
