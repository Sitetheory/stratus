<!-- markdownlint-configure-file
{
  "MD043": {
    "headings": ["# Froala Editor Fixes", "*"]
  }
}
-->

# Froala Editor Fixes

## Goals

Fix the bugs users hit in the shared rich-text editor (`sa-editor`,
`@stratusjs/angular`): links that fail or don't save, inserts that don't save,
text lost on reload, markup deleted on save, the editor jumping in long
articles, dialogs that break in fullscreen, messy pastes, and hard-to-use link
and media dialogs. Add Code Block and Inline Code buttons.

## Observations

- Every admin form and the Visual Editor use this one component, so each fix
  applies everywhere.
- Content autosaves: the editor debounces 5s, then the model's idle timer saves
  (`PUT /Api/<Type>/<id>`).
- Component templates load at runtime from `src/editor/` (`.min.html`, or
  `.html` with the `env` cookie), so template changes need `npm run compress`;
  SCSS needs `npm run design`.

## Requirements

- No Froala or Angular version change (Froala 4.0.18, `angular-froala-wysiwyg`
  3.2.7); no new dependencies.
- No change to how existing saved content renders.
- Bump the `packages/angular` patch version (0.13.15 → 0.13.16).

## Deliverables

- Stratus PR into `Sitetheory/stratus:master`: the fixes below, the version bump
  and this doc.
- Companion Sitetheory PR: Visual Editor dropdowns above dialogs.

## Out of scope

Questions for Chad:

- Uploaded SVGs are served as `application/octet-stream` and don't display.
- Pasted embeds (YouTube etc.) are blocked on published pages by
  `ConsentMarkup::protect()` when the site uses the built-in consent manager.
- Images uploaded straight into the editor are saved as the `-xs` thumbnail
  with no `srcset`.

Not fixed:

- `changeImgSize()` `mode === 'out'` removes `src` from legacy images
  (asserted by `scripts/check-editor-native-images.js`).
- Inline `max-width: 100%` on native images (`native-image.ts`) overrides site
  image classes; a site can restore them with `!important`.
- The Visual Editor's compact toolbar has no custom-class menu.
- `data-stratus-src-native-registered` is saved on legacy images.
- Table popup placement and Froala's image classes (Froala's own behaviour).
- Citation titles aren't escaped: escaping would double-escape existing HTML
  titles.
- The two-letter size-suffix match in `getSizedImageSrc()`.
- Code blocks and inline code aren't styled on live pages yet (a later
  Sitetheory change to `templates.less`).
- Paste: images stay hotlinked; Word's "Keep" brings Word styling; Google Docs
  nested lists flatten; plain Markdown isn't converted; a ChatGPT code block's
  language label joins its first line.

---

AI IMPLEMENTATION: Only AI edits this section

## Planning

Fixes ran worst-first: security, data loss, jumping and fullscreen, link dialog,
small fixes, paste, media dialog, code buttons.

## Research

- `src/editor/editor.component.ts`: Froala config and events; the sync pipeline
  (form `valueChanges` → `modelSave` → model; `normalizeIn` / `normalizeOut` on
  the way in and out); `changeImgSize()`; dialog openers.
- `src/froala/plugins/inputButton.ts`: opens our dialogs; saves and restores the
  selection around them; inserts.
- `src/froala/plugins/linkManager.ts`, `mediaManager.ts`, `citationManager.ts`:
  the commands behind the dialogs.
- `src/froala/plugins/codeFormat.ts`: Code Block and Inline Code commands.
- `src/editor/link-dialog.component.*`, `media-dialog.component.*`,
  `citation-dialog.component.*`: the dialogs.

## Phases

All phases are complete; see Completed Tasks.

## Discoveries

- **Our inserts skip Froala's undo step,** and the undo step is what fires
  `contentChanged`, which is what saves.
- **Froala's popups share the selection markers.** The link popup restores the
  selection from the same `.fr-marker` spans when it closes, which used up the
  ones saved for our dialog; the link then went in at the top.
- **Blur is off while a dialog is open.** A blur saves, and when the saved text
  differs on the way back in (icons, protected spaces) `applyIncomingValue()`
  re-renders the editor, which would remove the markers.
- **The scroll container depends on width.** In the wide admin layout
  `#section-mask` scrolls. Below the layout breakpoint the page scrolls and the
  fixed `#header` covers the top 56px. Froala reads `scrollableContainer` once,
  so the editor picks at start. The admin pins the sticky toolbar to `top: 0
  !important` (`Core/edit.less`), which suits the wide layout only.
- **Focusing the editor scrolls it,** and MatDialog refocuses the opener on
  close. Dialogs use `restoreFocus: false`; the selection restore refocuses and
  puts every ancestor's scroll back.
- **Froala's `link.insert` only writes the attributes it's given,** and its
  `attr()` skips null on a new link, so `null` removes `target` /
  `data-content-id` on edit and writes nothing on insert.
- **The model registers a change on the next AngularJS digest** (a deep
  `$watch`), and its `autoSaveTimeout` id is never reset after it fires. So
  neither says what is unsaved at unload; `getSavablePatch()` compares the data
  with the last server payload and does.
- **Froala's Return handler scrolls the page to the wrong place.** With
  `scrollableContainer` and `toolbarSticky` set, `cursor.enter` calls
  `$sc[0].scroll()` with the new line's offset inside the editor (or its
  viewport top), as if the editor were unscrolled at the top of the container.
  It fires whenever the cursor is in the lower part of the screen (also on the
  0.13.15 build). `cursor.enter` is wrapped to undo it.
- **The Visual Editor drawer wraps the editor in `md-input-container`,** so
  AngularJS Material's floating-label rules (absolute position, `bottom: 100%`,
  a 28px transform, hidden overflow) and its transparent text for empty
  unfocused inputs apply to Froala's toolbar popups. The admin's
  `.fr-btn.fr-open { margin-top: 0 }` rule (`edit.less`) isn't loaded there
  either.
- **Froala's `initialized` event fires inside its constructor,** before the
  directive's `getEditor()` returns the editor, so editor setup is deferred.
- **Froala hands typing to the form after ~300–600ms,** and only reads code view
  back when it closes.
- **Froala drops the space after an inline element** in a container that also
  holds blocks, on load and on paste, even as `&nbsp;`. A zero-width space in
  front keeps it, and Froala removes the zero-width space itself.
- **Froala's `paragraphFormat.apply` leaves `skip="true"`** on a `<pre>` turned
  back into a paragraph.
- **Froala writes every key of the upload response onto the image** as an
  attribute (all but `link`).
- **The editor's Font Awesome JavaScript rewrites icons inside the editable
  text** (inline SVG plus a comment).
- **Material calls an autocomplete's `displayWith` without the component as
  `this`.**
- **Already allowed:** the real `stratus-*` components are listed as allowed
  empty tags. What saving lost was empty icon tags, `<picture>`, `role`,
  microdata, and `script` / `style` (wrapped in `<p>`).
- **In the Visual Editor, dropdowns inside a dialog open behind it** (page
  search results, the media pager's "Items per page"): Sitetheory
  `Core/editLive.less` raises dialogs but not
  `.cdk-overlay-connected-position-bounding-box`. Fixed in the companion
  Sitetheory PR.

## Completed Tasks

### Phase 1: Security [status: completed]

#### 1.1: Parse stored HTML without running it [status: completed]

`changeImgSize()` parses with a `<template>`, whose content is inert (no image
loads, no `onerror`).

### Phase 2: Data loss [status: completed]

#### 2.1: Link insert failed within 300ms of typing [status: completed]

No debounce on the link form fields; an empty URL shows a message instead of
inserting.

#### 2.2: Inserts weren't saved until another keystroke [status: completed]

An undo step after each link, media and citation insert, citation edit, and
Froala's own link popup.

#### 2.3: A reload within the autosave delay lost text [status: completed]

`beforeunload` pushes the latest text to the model. If the model then has
unsaved changes (and auto-saves), it saves at once and asks the browser to
confirm leaving, so the save can finish. With nothing unsaved it does nothing.

#### 2.4: Markup deleted on save [status: completed]

Config: empty `i` / `.fa`; `picture`; `role`, `itemscope`, `itemtype`; `script`
and `style` in `htmlDoNotWrapTags`.

#### 2.5: An edited link was inserted at the top [status: completed]

Froala's popups close before the selection is saved; edits update
`data-content-id` and `target`; the pre-filled Link Text drops the markers'
zero-width spaces, so unchanged text keeps the link's inner formatting.

#### 2.6: Code view edits saved only on leaving code view [status: completed]

A CodeMirror update listener writes user edits to the form.

### Phase 3: Jumping and fullscreen [status: completed]

#### 3.1: Long articles jumped to the top after a dialog [status: completed]

`restoreSelection()` keeps the scroll of the editor and every ancestor; dialogs
use `restoreFocus: false`.

#### 3.2: Toolbar "more" rows moved the page [status: completed]

`.fr-box { overflow-anchor: none; }`

#### 3.3: Sticky toolbar hidden in the narrow layout [status: completed]

`scrollableContainer` is the element that scrolls; when that's the page, the
toolbar sits below the fixed header.

#### 3.4: Fullscreen [status: completed]

Dialogs open above the fullscreen editor (`body.sa-editor-fullscreen`); leaving
fullscreen restores the scroll of the page, the admin panel and the Visual
Editor drawer; the see-through sticky spacer is hidden, and the text area fills
the screen (Froala sized it from the toolbar's height before fullscreen, which
left a strip of the page showing when the toolbar went from two rows to one).

#### 3.5: Existing links couldn't be edited [status: completed]

`linkManagerEdit` is back in the link popup.

#### 3.6: Return scrolled the page away from the cursor [status: completed]

Froala's own scroll on Return is undone, then the editor (and the page only if
needed) scrolls just enough to keep the cursor in view below the toolbar.

### Phase 4: Link dialog [status: completed]

#### 4.1: Ok before the dialog is ready; Link Text; Enter [status: completed]

Ok waits for the dialog; Link Text prefills from the selection; Enter submits
(and doesn't reach the editor).

#### 4.2: Quick-insert link; undoing new tab and page links [status: completed]

One insert path for the toolbar and quick insert; Same tab removes `target`; a
custom URL drops the page id.

#### 4.3: Cmd/Ctrl+K; leftover selection markers [status: completed]

Cmd/Ctrl+K opens our dialog; every close (Cancel, Escape, outside click)
restores the selection.

#### 4.4: Page and target choices [status: completed]

"Open In: Same tab / New tab"; the page search selects its text on focus, typing
clears the old page, "No matching pages", "Untitled `<type>`" labels.

### Phase 5: Small fixes [status: completed]

#### 5.1: Paste markers [status: completed]

`id="isPasted"` and `data-fr-image-pasted` are removed after a paste.

#### 5.2: HR, citation buttons, citation markup [status: completed]

HR inserts after a selection instead of replacing it; citation buttons are
`type="button"`; the citation closes with `</stratus-citation>`.

#### 5.3: Upload stored the media record on the image [status: completed]

The upload response's keys are removed from the image.

#### 5.4: Leaks and dead code [status: completed]

The upload-token interval and unload listener are cleared on destroy;
`ResponsiveComponent.ngOnDestroy()` removes its instance; the unused image-TUI
plugin and the broken `fullscreen` event handler are gone.

### Phase 6: Paste and content fidelity [status: completed]

#### 6.1: Paste cleanup [status: completed]

Drops hidden content, 1x1 tracking images and page controls; keeps inline-styled
bold/italic (Google Docs, Notion); emoji images become emoji text; no pasted
`role` / `contenteditable`.

#### 6.2: Spaces, icons, GIFs [status: completed]

Spaces after inline elements are protected on load and paste; Font Awesome icons
save as their `<i>` tags; GIFs insert the original file and keep it on save.

### Phase 7: Media dialog [status: completed]

#### 7.1: Grid, card click, footer [status: completed]

Even grid with fixed-ratio previews; clicking a card inserts, once; Cancel/Done
and the pager sit in the footer.

### Phase 8: Code buttons [status: completed]

#### 8.1: Code Block and Inline Code [status: completed]

Toolbar buttons (admin and Visual Editor) and in-editor styling; `skip` is
removed after `paragraphFormat`.

### Phase 9: Popups and narrow editors [status: completed]

#### 9.1: Popup labels inside a Material container [status: completed]

Inside an `md-input-container`, Froala popup labels sit where Froala puts them
and unfocused inputs keep their text colour (video URL and embed, colour hex).

#### 9.2: Toolbar re-wrapped when a "more" row opened [status: completed]

The open "more" button no longer hangs 6px lower than the others, so wrapped
button groups stay on their rows.

#### 9.3: Quick insert [status: completed]

Off for compact editors: it sits 50px left of the editor, which a sidebar
covers. Its icons are inline again, as Froala lays them out: Sitetheory's
page-wide `svg { display: block }` collapsed their top margin and left them
off-centre.

#### 9.4: Popups in the scroll container [status: completed]

Froala misplaces the popups it puts in the scroll container (image, video,
link) when that container is scrolled (the admin's `#section-mask`), when
another scroller clips the editor (the Visual Editor drawer), or when the
image is taller than the screen: it hides them, opens them behind a header,
or opens them far away and scrolls the page there by focusing their first
field. `popups.show` is wrapped:

- The scroll is kept.
- A popup opened from an edit popup (image size, alt text, replace) takes its
  place and keeps it while open.
- A popup that is hidden or cut off while its image or link is in view is put
  under it, above it, or over it (an image filling the view).
- Any popup is kept inside the window.

### Phase 10: Wrap-up [status: completed]

#### 10.1: Version bump, build, retest, cleanup [status: completed]

## Testing

On the dev box (1.9, `coreVersion=1.9`, site 430), in the admin editor and the
Visual Editor drawer, with every change confirmed saved through the API:

- **Links:** insert with an immediate Ok and New tab; edit in place (pre-filled,
  inner formatting kept, Same tab, Enter); Cmd/Ctrl+K; Cancel leaves no markers
  and restores the selection; page link, then custom URL.
- **Media and citations:** grid insert, no duplicate on a second click, Done;
  citation insert and edit.
- **Content:** HR after a selection; code view saves while typing; Code Block on
  and off, Inline Code; icons saved as `<i>`; emoji and non-Latin text
  round-trip.
- **Paste:** web page, Word, Google Docs, Gmail, Notion and ChatGPT-style
  clipboards (synthetic).
- **Page behaviour:** no jump after inserts or closed dialogs in a long article;
  sticky toolbar in the wide and narrow layouts; fullscreen dialogs and scroll;
  a reload 300ms after an edit saves it.
- **Scripts:** `scripts/check-editor-defer.js`,
  `scripts/check-editor-native-images.js`.

Not covered on dev: a library GIF insert (site 430 has none; covered by the
script).
