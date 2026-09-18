<!-- markdownlint-configure-file
{ "MD043": { "headings": ["# Property video and 3D tours"] } }
-->

# Property video and 3D tours

All six IDX details layouts use `property/details-media.component.html` before
their details section. Its single-player and multi-player layout follows the
standalone video/tour sections in Sitetheory's `Property.html.twig`. Section
navigation includes Video/3D Tour when present.

Inputs are shared API fields, with no service IDs or provider-specific
`_unmapped` reads:

- Prefer `VirtualTourURLUnbranded`, then `VirtualTourURLBranded`, honoring
  `hideVariables`.
- Also inspect public `Media` records, and video/tour records present in
  `Images` from other services.
- `VideosCount` is descriptive, not a source of URLs. It does not create an
  empty section.
- Matterport becomes a 3D Tour iframe; YouTube/Vimeo become video iframes.
  Direct MP4/WebM/OGV URLs use a native video player.
- Unknown providers keep the Virtual Tour link. Recognized but
  malformed/non-video provider URLs also keep a safe external link.
- Deduplicate recognized players by provider and media ID. Prefer the unbranded
  source when the same player appears twice.
- Only explicit provider hosts produce trusted iframe URLs. Never use
  `MediaHTML`, `_unmapped`, or `PrivateMedia`. Preserve Matterport MLS/branding
  options and Vimeo's unlisted `h` token.
- Frames load lazily without autoplay. Player controls provide external
  navigation; no redundant source link is shown below embeds.

The paired microIDX change preserves public video/tour records from embedded
`_Media` as `Media` before the existing photo-only `Images` conversion. Existing
status media limits apply before extraction; property/status restrictions on
Media and restricted Media fields are honored. No new MLS resources or private
media are fetched. Services that do not provide a URL will continue to have no
player.

The SFARMLS sample at 363 Munich Street provides Vimeo through
`VirtualTourURLUnbranded`; its video count does not supply another URL. Use
neighborhood pages with service 2 enabled to inspect SFARMLS listings, rather
than Butch Haze's exclusive-only search page.

Verification: `node scripts/check-idx-media.js`, frontend TypeScript check,
LESS/bundle build, and Angular browser rendering with desktop/mobile fixtures.
Provider iframe responses in the layout fixture are stubbed; this checks
rendering, not third-party playback permissions.

Provider references: [YouTube embed format][provider-1], [Vimeo unlisted
hash][provider-2], [Matterport iframe format][provider-3].

Live-page verification (local assets substituted only in the test browser, no
deployment): the Marina/Cow Hollow page successfully fetched and opened the
Matterport, Vimeo, and YouTube sample listings. Each rendered one matching
iframe, removed the generic tour button, and produced no page JavaScript errors.
The YouTube player rendered on a 390px mobile viewport. Matterport presented an
automated-browser security challenge, so its playback was not verified.

Dev upload — 2026-09-18: uploaded 23 IDX runtime assets to the configured dev
server's `/var/www/core/v/0/0` through Sitetheory `bin/dev-upload`. The remote
minified JS bundle, CSS bundle and shared media template match local SHA-256
checksums. Anonymous client.chad pages currently select 1.7; use a development
session selecting core 0.0. This upload is frontend-only: the shared production
microIDX backend was not deployed. The three SFARMLS test cases already expose
their tour URLs without that backend change.

Fraction pagination enabled on all six MLS details carousels and uploaded to
dev/core 0.0. Templates use `data-pagination='{"render":"fraction"}'` to show
the current photo number and total.

[provider-1]: https://developers.google.com/youtube/player_parameters
[provider-2]: https://help.vimeo.com/hc/en-us/articles/12426470858001-Embedded-player-displays-This-video-does-not-exist-message
[provider-3]: https://matterport.github.io/developer-docs/embed-sdk/
