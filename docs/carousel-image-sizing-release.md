# Carousel image sizing release

Release `@stratusjs/swiper@1.2.5`, then `@stratusjs/idx@0.28.7`.
IDX now requires Swiper `^1.2.5`.

Swiper previously generated `-undefined` image URLs when its container exceeded
the largest configured derivative (1600px). It now caps selection at the largest
size, preserves URL query strings, and falls back to a decoded filename for image
titles and alt text. IDX forwards available media names and descriptions.
The core runtime lazy loader already has its own `hq` fallback and is unchanged.

## Build and validate

```sh
npm ci --install-links=true
npm test
npm pack ./packages/swiper --pack-destination /path/to/release
npm pack ./packages/idx --pack-destination /path/to/release
```

The full build generates the SystemJS sources, distribution bundles, styles,
and minified templates needed by the published packages. The carousel regression
checks run as part of `npm test` and can also run with `npm run test:carousel-images`.

## Publish and update Sitetheory

Publish the prepared tarballs in order:

```sh
npm publish /path/to/release/stratusjs-swiper-1.2.5.tgz --access public
npm publish /path/to/release/stratusjs-idx-0.28.7.tgz --access public
```

Sitetheory's companion PR updates both package manifests and its root lockfile,
and exposes media names/descriptions in the listing API. Its lockfile integrity
values refer to the prepared tarballs: publish those exact files. If the packages
are rebuilt or repacked, update the lockfile from npm after publication.

Keep the Sitetheory PR in draft until both packages are published. Then rerun its
checks before merging/deploying and invalidate cached listing API responses so
saved image metadata becomes available.
