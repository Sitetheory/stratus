# Runtime 0.15.6: Legacy SSO Retirement

Owner: legacy SSO retirement workspace. Release `@stratusjs/runtime@0.15.6`
from merged Stratus PR892 (`b36419f67500faece44cd3e5ca17445046eff71e`).
This follow-up changes the package version and local-package lock metadata only.
The SSO sender/receiver removal already passed review and merged; all final-head
Codex summaries reported no findings. No package has been published or server
uploaded by this workspace.

## Build and Validate

Run `npm run build`, `npm run test:session-origin-isolation`,
`npm run test:bundle-order`, and `npm run lint`. Inspect the packed normal and
minified runtime to ensure `SessionSync`, the auth-domain endpoint, and the
session-writing postMessage receiver are absent from executable JavaScript.
Preserve normal relative `/Api/Session` environment updates.

Pack with `npm pack ./packages/runtime --pack-destination /path/to/release`.
Retain the exact tarball until registry integrity is verified and CMS dependency
PRs are merged; do not repack after choosing its checksum for release.
Local publication artifact and receipt are outside TASKS under `~/dev/reports/`.

## Authenticate and Publish

After this version-metadata PR is approved and merged, run interactively:

```sh
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm publish /Users/chadwickmeyer/dev/reports/stratusjs-runtime-0.15.6.tgz --access public --registry=https://registry.npmjs.org/
npm view @stratusjs/runtime@0.15.6 version dist.integrity --registry=https://registry.npmjs.org/
```

Complete npm's browser/security-key or OTP prompts in the terminal. Never paste
credentials or OTPs into PRs/reports. Version0.15.5 already exists; do not try to
republish it. If0.15.6 was published concurrently, stop and verify its integrity
rather than replacing or incrementing versions blindly. This guide does not
publish the package automatically.

## CMS Handoff

After registry integrity matches the artifact, prepare dependency PRs for CMS
1.6,1.7,1.8,1.9. Update both `package.json` (root devDependency) and
`src/Sitetheory/CoreBundle/Resources/public/package.json` (runtime dependency),
and regenerate the root `package-lock.json` from the published package. Use an
exact0.15.6 direct pin; inspect remaining nested runtime entries and which paths
bootstrap/bundles actually load. Do not mass-upgrade unrelated dependencies.
Test the oldest release first, then newer releases, rebuild/compress assets,
and record the exact package integrity. Existing older nested0.x ranges may
retain older runtime copies; never claim every installed copy is removed merely
because the top-level pin changed. Validate the served browser entry points.

No production deployment until explicit approval. CMS1.9's central release
checklist already holds server setup, session/OAuth acceptance, and the reminder
to retire hosting site10 seven days after confirmed full1.9 migration. Neither
package publication nor PR merge starts that timer or authorizes site deletion.
