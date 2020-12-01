/* tslint:disable */

/*!
 * froala_editor v3.2.3 (https://www.froala.com/wysiwyg-editor)
 * License https://froala.com/wysiwyg-editor/terms/
 * Copyright 2014-2020 Froala Labs
 */

// @ts-ignore
import FroalaEditor from 'froala-editor'

if (
    ((FroalaEditor && FroalaEditor.hasOwnProperty('default') ? FroalaEditor.default : FroalaEditor),
        Object.assign(FroalaEditor.DEFAULTS, {
            imageManagerLoadURL: 'https://i.froala.com/load-files',
            imageManagerLoadMethod: 'get',
            imageManagerLoadParams: {},
            imageManagerPreloader: null,
            imageManagerDeleteURL: '',
            imageManagerDeleteMethod: 'post',
            imageManagerDeleteParams: {},
            imageManagerPageSize: 12,
            imageManagerScrollOffset: 20,
            imageManagerToggleTags: !0,
        }),
        (FroalaEditor.PLUGINS.imageManagerCustom = (s: any) => {
            let g: { isVisible: () => any; data: (arg0: string, arg1: undefined) => any; find: (arg0: string) => { (): any; new(): any; each: { (arg0: () => void): any; new(): any }; length: number; removeClass: { (arg0: string): void; new(): any } }; on: (arg0: string, arg1: string, arg2: () => void) => any },
                l: { find: (arg0: string) => { (): any; new(): any; removeClass: { (arg0: string): any; new(): any }; show: { (): any; new(): any }; outerHeight: { (): any; new(): any } }; toggleClass: (arg0: string) => any; hasClass: (arg0: string) => any; css: (arg0: string, arg1: any) => any },
                i: { outerHeight: () => number; scrollTop: () => any; css: (arg0: string, arg1: any) => any; on: (arg0: string, arg1: () => void) => any },
                o: { (): any; new(): any; hide?: any; show?: any; each?: { (arg0: () => void): any; new(): any }; length?: number; removeClass?: { (arg0: string): void; new(): any } },
                d: { (): any; new(): any; empty?: any; append?: any; outerHeight?: any; find?: any; each?: { (arg0: () => void): any; new(): any }; length?: number; removeClass?: { (arg0: string): void; new(): any } },
                m: { (): any; new(): any; find?: any; append?: any; outerHeight?: any; each?: { (arg0: () => void): any; new(): any }; length?: number; removeClass?: { (arg0: string): void; new(): any } },
                c: string | any[],
                f: number,
                u: number,
                p: number,
                h: number,
                v = s.$,
                M = 'image_manager',
                e = 10,
                b = 11,
                w = 12,
                C = 13,
                L = 14,
                D = 15,
                t = 21,
                r = 22,
                n = {}

            function y() {
                let e = v(window).outerWidth()
                return e < 768 ? 2 : e < 1200 ? 3 : 4
            }

            function I() {
                d.empty()
                for (let e = 0; e < h; e++) {
                    d.append('<div class="fr-list-column"></div>')
                }
            }

            function P() {
                if (u < c.length
                    && (
                        d.outerHeight() <= i.outerHeight() + s.opts.imageManagerScrollOffset
                        || i.scrollTop() + s.opts.imageManagerScrollOffset > d.outerHeight() - i.outerHeight()
                    )
                ) {
                    f++
                    for (let e = s.opts.imageManagerPageSize * (f - 1); e < Math.min(c.length, s.opts.imageManagerPageSize * f); e++) {
                        a(c[e])
                    }
                }
            }

            function a(n: { [x: string]: any; thumb: any; url: any; tag: string; name: any; hasOwnProperty: (arg0: string) => any }) {
                let i = new Image(),
                    o = v(document.createElement('div'))
                        .attr('class', 'fr-image-container fr-empty fr-image-' + p++)
                        .attr('data-loading', s.language.translate('Loading') + '..')
                        .attr('data-deleting', s.language.translate('Deleting') + '..')
                R(!1),
                    (i.onload = function() {
                        o.height(Math.floor((o.width() / i.width) * i.height))
                        let t = v(document.createElement('img'))
                        if (n.thumb) {
                            t.attr('src', n.thumb)
                        } else {
                            if ((O(L, n), !n.url)) {
                                return O(D, n), !1
                            }
                            t.attr('src', n.url)
                        }
                        if ((n.url && t.attr('data-url', n.url), n.tag)) {
                            if ((l.find('.fr-modal-more.fr-not-available').removeClass('fr-not-available'), l.find('.fr-modal-tags').show(), 0 <= n.tag.indexOf(','))) {
                                for (let e = n.tag.split(','), a = 0; a < e.length; a++) {
                                    (e[a] =
                                        e[a].trim()), 0 === m.find('a[title="'.concat(e[a], '"]')).length && m.append('<a role="button" title="'.concat(e[a], '">').concat(e[a], '</a>'))
                                }
                                // @ts-ignore
                                t.attr('data-tag', e.join())
                            } else {
                                0 === m.find('a[title="'.concat(n.tag.trim(), '"]')).length && m.append('<a role="button" title="'.concat(n.tag.trim(), '">').concat(n.tag.trim(), '</a>')), t.attr('data-tag', n.tag.trim())
                            }
                        }
                        for (let r in (n.name && t.attr('alt', n.name), n)) {
                            n.hasOwnProperty(r) && 'thumb' !== r && 'url' !== r && 'tag' !== r && t.attr('data-'.concat(r), n[r])
                        }
                        o
                            .append(t)
                            .append(v(s.icon.create('imageManagerDelete')).addClass('fr-delete-img').attr('title', s.language.translate('Delete')))
                            .append(v(s.icon.create('imageManagerInsert')).addClass('fr-insert-img').attr('title', s.language.translate('Insert'))),
                            m.find('.fr-selected-tag').each(function(e: any, a: { text: any }) {
                                j(t, a.text) || o.hide()
                            }),
                            t.on('load', function() {
                                o.removeClass('fr-empty'),
                                    o.height('auto'),
                                    u++,
                                    E(
                                        // @ts-ignore
                                        T(
                                            parseInt(
                                                t
                                                    .parent()
                                                    .attr('class')
                                                    .match(/fr-image-(\d+)/)[1],
                                                10
                                            ) + 1
                                        )
                                    ),
                                    R(!1),
                                u % s.opts.imageManagerPageSize === 0 && P()
                            }),
                            s.events.trigger('imageManager.imageLoaded', [t])
                    }),
                    (i.onerror = () => {
                        u++,
                        o.remove(),
                        // @ts-ignore
                        E(T(parseInt(o.attr('class').match(/fr-image-(\d+)/)[1], 10) + 1)),
                        O(e, n),
                        u % s.opts.imageManagerPageSize === 0 && P()
                    }),
                    (i.src = n.thumb || n.url),
                    // @ts-ignore
                    S().append(o)
            }

            function S() {
                let r, n: number
                return (
                    d.find('.fr-list-column').each((e: any, a: any) => {
                        let t = v(a)
                        0 === e ? ((n = t.outerHeight()), (r = t)) : t.outerHeight() < n && ((n = t.outerHeight()), (r = t))
                    }),
                        r
                )
            }

            function T(e: number) {
                e === undefined && (e = 0)
                for (let a = [], t = p - 1; e <= t; t--) {
                    // @ts-ignore
                    let r = d.find('.fr-image-'.concat(t))
                    // @ts-ignore
                    r.length && (a.push(r), v(document.createElement('div')).attr('id', 'fr-image-hidden-container').append(r), d.find('.fr-image-'.concat(t)).remove())
                }
                return a
            }

            function E(e: string | any[]) {
                for (let a = e.length - 1; 0 <= a; a--) {
                    // @ts-ignore
                    S().append(e[a])
                }
            }

            function R(e: boolean) {
                if ((e === undefined && (e = !0), !g.isVisible())) {
                    return !0
                }
                let a = y()
                if (a !== h) {
                    h = a
                    // @ts-ignore
                    let t = T()
                    // @ts-ignore
                    I(), E(t)
                }
                s.modals.resize(M), e && P()
            }

            function U(e: { attributes: any }[]) {
                for (let a, t = e[0].attributes, r = t.length, n = {}; r--;) {
                    // @ts-ignore
                    t[r] && 'src' !== (a = t[r].name) && (n[a] = t[r].value)
                }
                return n
            }

            function x(e: { currentTarget: any }) {
                let a = v(e.currentTarget).siblings('img'),
                    // @ts-ignore
                    t = g.data('instance') || s,
                    // @ts-ignore
                    r = g.data('current-image')
                if ((s.modals.hide(M), t.image.showProgressBar(), r)) {
                    r.data('fr-old-src', r.attr('src')), r.trigger('click')
                } else {
                    t.events.focus(!0), t.selection.restore()
                    let n = t.position.getBoundingRect(),
                        i = n.left + n.width / 2 + v(s.doc).scrollLeft(),
                        o = n.top + n.height + v(s.doc).scrollTop()
                    t.popups.setContainer('image.insert', s.$sc), t.popups.show('image.insert', i, o)
                }
                t.image.insert(a.data('url'), !1, U(a), r)
            }

            function H(e: { currentTarget: any }) {
                let i = v(e.currentTarget).siblings('img'),
                    a = s.language.translate('Are you sure? Image will be deleted.')
                confirm(a) &&
                (s.opts.imageManagerDeleteURL
                 ? !1 !== s.events.trigger('imageManager.beforeDeleteImage', [i]) &&
                     (i.parent().addClass('fr-image-deleting'),
                         v(this).ajax({
                             method: s.opts.imageManagerDeleteMethod,
                             url: s.opts.imageManagerDeleteURL,
                             data: Object.assign(Object.assign({src: i.attr('src')}, U(i)), s.opts.imageManagerDeleteParams),
                             crossDomain: s.opts.requestWithCORS,
                             withCredentials: s.opts.requestWithCredentials,
                             headers: s.opts.requestHeaders,
                             done(e: any, a: any, t: any) {
                                 s.events.trigger('imageManager.imageDeleted', [e])
                                 let r = T(
                                     parseInt(
                                         i
                                             .parent()
                                             .attr('class')
                                             .match(/fr-image-(\d+)/)[1],
                                         10
                                     ) + 1
                                 )
                                 i.parent().remove(),
                                     // @ts-ignore
                                     E(r),
                                     (function n() {
                                         g.find('#fr-modal-tags > a').each(function() {
                                             0 === g.find('#fr-image-list [data-tag*="'.concat(v(this).text(), '"]')).length && v(this).removeClass('fr-selected-tag').hide()
                                         }),
                                             _()
                                     })(),
                                     R(!0)
                             },
                             fail(e: { response: any; responseText: any }) {
                                 O(t, e.response || e.responseText)
                             },
                         }))
                 : O(r))
            }

            function O(e: number, a?: any) {
                10 <= e && e < 20
                ? o.hide()
                : 20 <= e && e < 30 && v('.fr-image-deleting').removeClass('fr-image-deleting'), s.events.trigger('imageManager.error', [
                    // @ts-ignore
                    {code: e, message: n[e]},
                    a
                ])
            }

            function q() {
                let e = l.find('.fr-modal-head-line').outerHeight(),
                    a = m.outerHeight()
                l.toggleClass('fr-show-tags'), l.hasClass('fr-show-tags')
                                               ? (l.css('height', e + a), i.css('marginTop', e + a), m.find('a').css('opacity', 1))
                                               : (l.css('height', e), i.css('marginTop', e), m.find('a').css('opacity', 0))
            }

            function _() {
                let e = m.find('.fr-selected-tag')
                0 < e.length
                ? (d.find('img').parents().show(),
                    e.each((e: any, r: { text: any }) => {
                        d.find('img').each(function(e: any, a: any) {
                            let t = v(a)
                            j(t, r.text) || t.parent().hide()
                        })
                    }))
                : d.find('img').parents().show(),
                    // @ts-ignore
                    E(T()),
                    P()
            }

            function k(e: { preventDefault: () => void; currentTarget: any }) {
                e.preventDefault()
                let a = v(e.currentTarget)
                a.toggleClass('fr-selected-tag'), s.opts.imageManagerToggleTags && a.siblings('a').removeClass('fr-selected-tag'), _()
            }

            function j(e: { attr: (arg0: string) => any }, a: any) {
                for (let t = (e.attr('data-tag') || '').split(','), r = 0; r < t.length; r++) {
                    if (t[r] === a) {
                        return !0
                    }
                }
                return !1
            }

            return (
                // @ts-ignore
                (n[e] = 'Image cannot be loaded from the passed link.'),
                    // @ts-ignore
                    (n[b] = 'Error during load images request.'),
                    // @ts-ignore
                    (n[w] = 'Missing imageManagerLoadURL option.'),
                    // @ts-ignore
                    (n[C] = 'Parsing load response failed.'),
                    // @ts-ignore
                    (n[L] = 'Missing image thumb.'),
                    // @ts-ignore
                    (n[D] = 'Missing image URL.'),
                    // @ts-ignore
                    (n[t] = 'Error during delete image request.'),
                    // @ts-ignore
                    (n[r] = 'Missing imageManagerDeleteURL option.'),
                    {
                        require: ['image'],
                        _init: function z() {
                            if (!s.$wp && 'IMG' !== s.el.tagName) {
                                return !1
                            }
                        },
                        show: function G() {
                            if (!g) {
                                let e,
                                    a = '<button class="fr-command fr-btn fr-modal-more fr-not-available" id="fr-modal-more-'
                                        .concat(s.sid, '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24""><path d="')
                                        .concat(FroalaEditor.SVG.tags, '"/></svg></button><h4 data-text="true">')
                                        .concat(s.language.translate('Manage Images'), '</h4></div>\n      <div class="fr-modal-tags" id="fr-modal-tags">');
                                (e = s.opts.imageManagerPreloader
                                     ? '<img class="fr-preloader" id="fr-preloader" alt="'.concat(s.language.translate('Loading'), '.." src="').concat(s.opts.imageManagerPreloader, '" style="display: none;">')
                                     : '<span class="fr-preloader" id="fr-preloader" style="display: none;">'.concat(s.language.translate('Loading'), '</span>')),
                                    (e += '<div class="fr-image-list" id="fr-image-list"></div>')
                                let t = s.modals.create(M, a, e);
                                (g = t.$modal), (l = t.$head), (i = t.$body)
                            }
                            g.data('current-image', s.image.get()),
                                s.modals.show(M),
                            o ||
                            (function r() {
                                (o = g.find('#fr-preloader')),
                                    (d = g.find('#fr-image-list')),
                                    (m = g.find('#fr-modal-tags')),
                                    (h = y()),
                                    I(),
                                    l.css('height', l.find('.fr-modal-head-line').outerHeight()),
                                    s.events.$on(v(s.o_win), 'resize', () => {
                                        R(!!c)
                                    }),
                                    s.events.bindClick(d, '.fr-insert-img', x),
                                    s.events.bindClick(d, '.fr-delete-img', H),
                                s.helpers.isMobile() &&
                                (s.events.bindClick(d, 'div.fr-image-container', (e: any) => {
                                    g.find('.fr-mobile-selected').removeClass('fr-mobile-selected'),
                                        v(e.currentTarget).addClass('fr-mobile-selected')
                                }),
                                    // @ts-ignore
                                    g.on(s._mousedown, () => {
                                        g.find('.fr-mobile-selected').removeClass('fr-mobile-selected')
                                    })),
                                    // @ts-ignore
                                    g.on(s._mousedown + ' ' + s._mouseup, (e: any) => {
                                        e.stopPropagation()
                                    }),
                                    g.on(s._mousedown, '*', () => {
                                        s.events.disableBlur()
                                    }),
                                    i.on('scroll', P),
                                    s.events.bindClick(g, 'button#fr-modal-more-'.concat(s.sid), q),
                                    s.events.bindClick(m, 'a', k)
                            })(),
                                (function n() {
                                    o.show(),
                                        d.find('.fr-list-column').empty(),
                                        s.opts.imageManagerLoadURL
                                        ? v(this).ajax({
                                            url: s.opts.imageManagerLoadURL,
                                            method: s.opts.imageManagerLoadMethod,
                                            data: s.opts.imageManagerLoadParams,
                                            crossDomain: s.opts.requestWithCORS,
                                            withCredentials: s.opts.requestWithCredentials,
                                            headers: s.opts.requestHeaders,
                                            done(e: any, a: any, t: { response: any }) {
                                                s.events.trigger('imageManager.imagesLoaded', [e]),
                                                    (function r(e: string, a: any) {
                                                        try {
                                                            d.find('.fr-list-column').empty(), (p = u = f = 0), (c = JSON.parse(e)), P()
                                                        } catch (t) {
                                                            O(C, a)
                                                        }
                                                    })(e, t.response),
                                                    o.hide()
                                            },
                                            fail(e: any) {
                                                O(b, e.response || e.responseText)
                                            },
                                        })
                                        : O(w)
                                })()
                        },
                        hide: function N() {
                            s.modals.hide(M)
                        },
                    }
            )
        }),
        !FroalaEditor.PLUGINS.image)
) {
    throw new Error('Image manager plugin requires image plugin.')
}
FroalaEditor.DEFAULTS.imageInsertButtons.push('imageManagerCustom'),
    FroalaEditor.RegisterCommand('imageManagerCustom', {
        title: 'Browse',
        undo: !1,
        focus: !1,
        modal: !0,
        callback() {
            this.imageManagerCustom.show()
        },
        plugin: 'imageManagerCustom',
    }),
    FroalaEditor.DefineIcon('imageManagerCustom', {NAME: 'folder', SVG_KEY: 'imageManager'}),
    FroalaEditor.DefineIcon('imageManagerCustomInsert', {NAME: 'plus', SVG_KEY: 'add'}),
    FroalaEditor.DefineIcon('imageManagerCustomDelete', {NAME: 'trash', SVG_KEY: 'remove'})
