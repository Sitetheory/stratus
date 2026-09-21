# IDX Showcase default release

Release `@stratusjs/idx@0.28.8` after `@stratusjs/swiper@1.2.5`.
The root development package remains `1.0.0`; it is not published.
Its test scripts register the IDX regression check without a version bump.

## Behavior

An omitted or empty details template now resolves to Showcase. The old explicit
`details` name is a compatibility alias for Showcase. The obsolete
`details.component.html` design is removed. Luxury, Showcase, Cosmopolitan and
Compact retain their templates. Shared details styles remain in use.

The companion Sitetheory changes forward the associated Property Filter layout,
contact and CTA settings into profile embeds. Profile listings and explicitly
configured popup modules write and reopen shareable listing URLs, including the
service ID, listing key and readable address.

## Validation

Run `npm ci --install-links=true` and `npm test`. The template resolver check is
also available as `npm run test:idx-details-template`. It checks empty values,
the legacy alias and all four supported layouts for normal and minified paths.

Pack both packages from the completed clean build. Inspect the tarballs for
compiled JavaScript, styles and templates; the IDX archive must contain
Showcase and must not contain the deleted legacy template.

The clean install and full `npm test` passed on Node 18.19.1/npm 9.2.0.
Additional checks passed for IDX media and the compiled normal/minified template
loaders, including removal of both legacy HTML artifacts.

## Publication

Upstream already requires Swiper `^1.2.5`; that version must be available before
publishing IDX `0.28.8`. Publish the exact validated tarballs, then update both
Sitetheory package manifests and its root lockfile from the registry. Keep the
Sitetheory PRs unmerged until publication and dependency validation succeed.
