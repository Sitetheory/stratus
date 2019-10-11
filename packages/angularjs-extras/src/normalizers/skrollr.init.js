// Skrollr Definition
// ------------------
// This enables the Skrollr third party parallax scrolling. We use this in a normalizer so that it only loads once on a page (versus a directive)
// See: https://github.com/Prinzhorn/skrollr
// Initiate on the page by adding the stratus-skrollr attribute to any element, and then adding standard options, e.g.
// Usage: add this anywhere on the page <script>require(['skrollr'])</script>
// <div stratus-skrollr data-0="transform: translateY(0px); opacity: 1;" data-600="transform: translateY(300px); opacity: .2;"></div>

/* global define, require */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus'], factory)
  } else {
    factory(root.Stratus)
  }
}(this, function (Stratus, _) {
  // Disable Skrollr (parallax) for all mobile, it doesn't work on ios, safari, chrome or android chrome)
  if (Stratus.Client.mobile) {
    return
  }
  (function (root, factory) {
    if (typeof require === 'function') {
      require(['skrollr-native'], factory)
    } else {
      factory(root.skrollr)
    }
  }(this, function (skrollr) {
    Stratus.DOM.complete(function () {
      skrollr.init({})
      // HACK: This refresh is needed in order for certain areas to load
      setTimeout(function () {
        skrollr.get().refresh()
      }, 3000)
    })
  }))
}))
