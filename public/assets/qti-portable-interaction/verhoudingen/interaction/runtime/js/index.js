!(function (e, n) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = n(require('qtiCustomInteractionContext')))
    : 'function' == typeof define && define.amd
      ? define(['qtiCustomInteractionContext'], n)
      : ((e = 'undefined' != typeof globalThis ? globalThis : e || self)['@citolab/pci-verhoudingen'] = n(e.ctx));
})(this, function (e) {
  'use strict';
  function n(e) {
    var n = Object.create(null);
    return (
      e &&
        Object.keys(e).forEach(function (t) {
          if ('default' !== t) {
            var o = Object.getOwnPropertyDescriptor(e, t);
            Object.defineProperty(
              n,
              t,
              o.get
                ? o
                : {
                    enumerable: !0,
                    get: function () {
                      return e[t];
                    }
                  }
            );
          }
        }),
      (n.default = e),
      Object.freeze(n)
    );
  }
  var t,
    o,
    r,
    a,
    l,
    i,
    s = n(e),
    c = {},
    u = [],
    h = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function f(e, n) {
    for (var t in n) e[t] = n[t];
    return e;
  }
  function d(e) {
    var n = e.parentNode;
    n && n.removeChild(e);
  }
  function p(e, n, o) {
    var r,
      a,
      l,
      i = {};
    for (l in n) 'key' == l ? (r = n[l]) : 'ref' == l ? (a = n[l]) : (i[l] = n[l]);
    if (
      (arguments.length > 2 && (i.children = arguments.length > 3 ? t.call(arguments, 2) : o),
      'function' == typeof e && null != e.defaultProps)
    )
      for (l in e.defaultProps) void 0 === i[l] && (i[l] = e.defaultProps[l]);
    return _(e, i, r, a, null);
  }
  function _(e, n, t, a, l) {
    var i = {
      type: e,
      props: n,
      key: t,
      ref: a,
      __k: null,
      __: null,
      __b: 0,
      __e: null,
      __d: void 0,
      __c: null,
      __h: null,
      constructor: void 0,
      __v: null == l ? ++r : l
    };
    return null == l && null != o.vnode && o.vnode(i), i;
  }
  function m(e) {
    return e.children;
  }
  function y(e, n) {
    (this.props = e), (this.context = n);
  }
  function v(e, n) {
    if (null == n) return e.__ ? v(e.__, e.__.__k.indexOf(e) + 1) : null;
    for (var t; n < e.__k.length; n++) if (null != (t = e.__k[n]) && null != t.__e) return t.__e;
    return 'function' == typeof e.type ? v(e) : null;
  }
  function g(e) {
    var n, t;
    if (null != (e = e.__) && null != e.__c) {
      for (e.__e = e.__c.base = null, n = 0; n < e.__k.length; n++)
        if (null != (t = e.__k[n]) && null != t.__e) {
          e.__e = e.__c.base = t.__e;
          break;
        }
      return g(e);
    }
  }
  function k(e) {
    ((!e.__d && (e.__d = !0) && a.push(e) && !b.__r++) || i !== o.debounceRendering) &&
      ((i = o.debounceRendering) || l)(b);
  }
  function b() {
    for (var e; (b.__r = a.length); )
      (e = a.sort(function (e, n) {
        return e.__v.__b - n.__v.__b;
      })),
        (a = []),
        e.some(function (e) {
          var n, t, o, r, a, l;
          e.__d &&
            ((a = (r = (n = e).__v).__e),
            (l = n.__P) &&
              ((t = []),
              ((o = f({}, r)).__v = r.__v + 1),
              P(
                l,
                r,
                o,
                n.__n,
                void 0 !== l.ownerSVGElement,
                null != r.__h ? [a] : null,
                t,
                null == a ? v(r) : a,
                r.__h
              ),
              A(t, r),
              r.__e != a && g(r)));
        });
  }
  function x(e, n, t, o, r, a, l, i, s, h) {
    var f,
      d,
      p,
      y,
      g,
      k,
      b,
      x = (o && o.__k) || u,
      L = x.length;
    for (t.__k = [], f = 0; f < n.length; f++)
      if (
        null !=
        (y = t.__k[f] =
          null == (y = n[f]) || 'boolean' == typeof y
            ? null
            : 'string' == typeof y || 'number' == typeof y || 'bigint' == typeof y
              ? _(null, y, null, null, y)
              : Array.isArray(y)
                ? _(m, { children: y }, null, null, null)
                : y.__b > 0
                  ? _(y.type, y.props, y.key, null, y.__v)
                  : y)
      ) {
        if (((y.__ = t), (y.__b = t.__b + 1), null === (p = x[f]) || (p && y.key == p.key && y.type === p.type)))
          x[f] = void 0;
        else
          for (d = 0; d < L; d++) {
            if ((p = x[d]) && y.key == p.key && y.type === p.type) {
              x[d] = void 0;
              break;
            }
            p = null;
          }
        P(e, y, (p = p || c), r, a, l, i, s, h),
          (g = y.__e),
          (d = y.ref) && p.ref != d && (b || (b = []), p.ref && b.push(p.ref, null, y), b.push(d, y.__c || g, y)),
          null != g
            ? (null == k && (k = g),
              'function' == typeof y.type && y.__k === p.__k ? (y.__d = s = w(y, s, e)) : (s = S(e, y, p, x, g, s)),
              'function' == typeof t.type && (t.__d = s))
            : s && p.__e == s && s.parentNode != e && (s = v(p));
      }
    for (t.__e = k, f = L; f--; )
      null != x[f] &&
        ('function' == typeof t.type && null != x[f].__e && x[f].__e == t.__d && (t.__d = v(o, f + 1)), N(x[f], x[f]));
    if (b) for (f = 0; f < b.length; f++) z(b[f], b[++f], b[++f]);
  }
  function w(e, n, t) {
    for (var o, r = e.__k, a = 0; r && a < r.length; a++)
      (o = r[a]) && ((o.__ = e), (n = 'function' == typeof o.type ? w(o, n, t) : S(t, o, o, r, o.__e, n)));
    return n;
  }
  function L(e, n) {
    return (
      (n = n || []),
      null == e ||
        'boolean' == typeof e ||
        (Array.isArray(e)
          ? e.some(function (e) {
              L(e, n);
            })
          : n.push(e)),
      n
    );
  }
  function S(e, n, t, o, r, a) {
    var l, i, s;
    if (void 0 !== n.__d) (l = n.__d), (n.__d = void 0);
    else if (null == t || r != a || null == r.parentNode)
      e: if (null == a || a.parentNode !== e) e.appendChild(r), (l = null);
      else {
        for (i = a, s = 0; (i = i.nextSibling) && s < o.length; s += 2) if (i == r) break e;
        e.insertBefore(r, a), (l = a);
      }
    return void 0 !== l ? l : r.nextSibling;
  }
  function E(e, n, t) {
    '-' === n[0] ? e.setProperty(n, t) : (e[n] = null == t ? '' : 'number' != typeof t || h.test(n) ? t : t + 'px');
  }
  function C(e, n, t, o, r) {
    var a;
    e: if ('style' === n)
      if ('string' == typeof t) e.style.cssText = t;
      else {
        if (('string' == typeof o && (e.style.cssText = o = ''), o)) for (n in o) (t && n in t) || E(e.style, n, '');
        if (t) for (n in t) (o && t[n] === o[n]) || E(e.style, n, t[n]);
      }
    else if ('o' === n[0] && 'n' === n[1])
      (a = n !== (n = n.replace(/Capture$/, ''))),
        (n = n.toLowerCase() in e ? n.toLowerCase().slice(2) : n.slice(2)),
        e.l || (e.l = {}),
        (e.l[n + a] = t),
        t ? o || e.addEventListener(n, a ? T : O, a) : e.removeEventListener(n, a ? T : O, a);
    else if ('dangerouslySetInnerHTML' !== n) {
      if (r) n = n.replace(/xlink[H:h]/, 'h').replace(/sName$/, 's');
      else if ('href' !== n && 'list' !== n && 'form' !== n && 'tabIndex' !== n && 'download' !== n && n in e)
        try {
          e[n] = null == t ? '' : t;
          break e;
        } catch (e) {}
      'function' == typeof t ||
        (null != t && (!1 !== t || ('a' === n[0] && 'r' === n[1])) ? e.setAttribute(n, t) : e.removeAttribute(n));
    }
  }
  function O(e) {
    this.l[e.type + !1](o.event ? o.event(e) : e);
  }
  function T(e) {
    this.l[e.type + !0](o.event ? o.event(e) : e);
  }
  function P(e, n, t, r, a, l, i, s, c) {
    var u,
      h,
      d,
      p,
      _,
      v,
      g,
      k,
      b,
      w,
      L,
      S = n.type;
    if (void 0 !== n.constructor) return null;
    null != t.__h && ((c = t.__h), (s = n.__e = t.__e), (n.__h = null), (l = [s])), (u = o.__b) && u(n);
    try {
      e: if ('function' == typeof S) {
        if (
          ((k = n.props),
          (b = (u = S.contextType) && r[u.__c]),
          (w = u ? (b ? b.props.value : u.__) : r),
          t.__c
            ? (g = (h = n.__c = t.__c).__ = h.__E)
            : ('prototype' in S && S.prototype.render
                ? (n.__c = h = new S(k, w))
                : ((n.__c = h = new y(k, w)), (h.constructor = S), (h.render = R)),
              b && b.sub(h),
              (h.props = k),
              h.state || (h.state = {}),
              (h.context = w),
              (h.__n = r),
              (d = h.__d = !0),
              (h.__h = [])),
          null == h.__s && (h.__s = h.state),
          null != S.getDerivedStateFromProps &&
            (h.__s == h.state && (h.__s = f({}, h.__s)), f(h.__s, S.getDerivedStateFromProps(k, h.__s))),
          (p = h.props),
          (_ = h.state),
          d)
        )
          null == S.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(),
            null != h.componentDidMount && h.__h.push(h.componentDidMount);
        else {
          if (
            (null == S.getDerivedStateFromProps &&
              k !== p &&
              null != h.componentWillReceiveProps &&
              h.componentWillReceiveProps(k, w),
            (!h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(k, h.__s, w)) ||
              n.__v === t.__v)
          ) {
            (h.props = k),
              (h.state = h.__s),
              n.__v !== t.__v && (h.__d = !1),
              (h.__v = n),
              (n.__e = t.__e),
              (n.__k = t.__k),
              n.__k.forEach(function (e) {
                e && (e.__ = n);
              }),
              h.__h.length && i.push(h);
            break e;
          }
          null != h.componentWillUpdate && h.componentWillUpdate(k, h.__s, w),
            null != h.componentDidUpdate &&
              h.__h.push(function () {
                h.componentDidUpdate(p, _, v);
              });
        }
        (h.context = w),
          (h.props = k),
          (h.state = h.__s),
          (u = o.__r) && u(n),
          (h.__d = !1),
          (h.__v = n),
          (h.__P = e),
          (u = h.render(h.props, h.state, h.context)),
          (h.state = h.__s),
          null != h.getChildContext && (r = f(f({}, r), h.getChildContext())),
          d || null == h.getSnapshotBeforeUpdate || (v = h.getSnapshotBeforeUpdate(p, _)),
          (L = null != u && u.type === m && null == u.key ? u.props.children : u),
          x(e, Array.isArray(L) ? L : [L], n, t, r, a, l, i, s, c),
          (h.base = n.__e),
          (n.__h = null),
          h.__h.length && i.push(h),
          g && (h.__E = h.__ = null),
          (h.__e = !1);
      } else
        null == l && n.__v === t.__v ? ((n.__k = t.__k), (n.__e = t.__e)) : (n.__e = j(t.__e, n, t, r, a, l, i, c));
      (u = o.diffed) && u(n);
    } catch (e) {
      (n.__v = null), (c || null != l) && ((n.__e = s), (n.__h = !!c), (l[l.indexOf(s)] = null)), o.__e(e, n, t);
    }
  }
  function A(e, n) {
    o.__c && o.__c(n, e),
      e.some(function (n) {
        try {
          (e = n.__h),
            (n.__h = []),
            e.some(function (e) {
              e.call(n);
            });
        } catch (e) {
          o.__e(e, n.__v);
        }
      });
  }
  function j(e, n, o, r, a, l, i, s) {
    var u,
      h,
      f,
      p = o.props,
      _ = n.props,
      m = n.type,
      y = 0;
    if (('svg' === m && (a = !0), null != l))
      for (; y < l.length; y++)
        if ((u = l[y]) && 'setAttribute' in u == !!m && (m ? u.localName === m : 3 === u.nodeType)) {
          (e = u), (l[y] = null);
          break;
        }
    if (null == e) {
      if (null === m) return document.createTextNode(_);
      (e = a ? document.createElementNS('http://www.w3.org/2000/svg', m) : document.createElement(m, _.is && _)),
        (l = null),
        (s = !1);
    }
    if (null === m) p === _ || (s && e.data === _) || (e.data = _);
    else {
      if (
        ((l = l && t.call(e.childNodes)),
        (h = (p = o.props || c).dangerouslySetInnerHTML),
        (f = _.dangerouslySetInnerHTML),
        !s)
      ) {
        if (null != l)
          for (p = {}, y = 0; y < e.attributes.length; y++) p[e.attributes[y].name] = e.attributes[y].value;
        (f || h) &&
          ((f && ((h && f.__html == h.__html) || f.__html === e.innerHTML)) || (e.innerHTML = (f && f.__html) || ''));
      }
      if (
        ((function (e, n, t, o, r) {
          var a;
          for (a in t) 'children' === a || 'key' === a || a in n || C(e, a, null, t[a], o);
          for (a in n)
            (r && 'function' != typeof n[a]) ||
              'children' === a ||
              'key' === a ||
              'value' === a ||
              'checked' === a ||
              t[a] === n[a] ||
              C(e, a, n[a], t[a], o);
        })(e, _, p, a, s),
        f)
      )
        n.__k = [];
      else if (
        ((y = n.props.children),
        x(e, Array.isArray(y) ? y : [y], n, o, r, a && 'foreignObject' !== m, l, i, l ? l[0] : o.__k && v(o, 0), s),
        null != l)
      )
        for (y = l.length; y--; ) null != l[y] && d(l[y]);
      s ||
        ('value' in _ &&
          void 0 !== (y = _.value) &&
          (y !== p.value || y !== e.value || ('progress' === m && !y)) &&
          C(e, 'value', y, p.value, !1),
        'checked' in _ && void 0 !== (y = _.checked) && y !== e.checked && C(e, 'checked', y, p.checked, !1));
    }
    return e;
  }
  function z(e, n, t) {
    try {
      'function' == typeof e ? e(n) : (e.current = n);
    } catch (e) {
      o.__e(e, t);
    }
  }
  function N(e, n, t) {
    var r, a;
    if (
      (o.unmount && o.unmount(e),
      (r = e.ref) && ((r.current && r.current !== e.__e) || z(r, null, n)),
      null != (r = e.__c))
    ) {
      if (r.componentWillUnmount)
        try {
          r.componentWillUnmount();
        } catch (e) {
          o.__e(e, n);
        }
      r.base = r.__P = null;
    }
    if ((r = e.__k)) for (a = 0; a < r.length; a++) r[a] && N(r[a], n, 'function' != typeof e.type);
    t || null == e.__e || d(e.__e), (e.__e = e.__d = void 0);
  }
  function R(e, n, t) {
    return this.constructor(e, t);
  }
  function D(e, n, r) {
    var a, l;
    o.__ && o.__(e, n),
      (a = !1 ? null : n.__k),
      (l = []),
      P(
        n,
        (e = n.__k = p(m, null, [e])),
        a || c,
        c,
        void 0 !== n.ownerSVGElement,
        a ? null : n.firstChild ? t.call(n.childNodes) : null,
        l,
        a ? a.__e : n.firstChild,
        false
      ),
      A(l, e);
  }
  (t = u.slice),
    (o = {
      __e: function (e, n) {
        for (var t, o, r; (n = n.__); )
          if ((t = n.__c) && !t.__)
            try {
              if (
                ((o = t.constructor) &&
                  null != o.getDerivedStateFromError &&
                  (t.setState(o.getDerivedStateFromError(e)), (r = t.__d)),
                null != t.componentDidCatch && (t.componentDidCatch(e), (r = t.__d)),
                r)
              )
                return (t.__E = t);
            } catch (n) {
              e = n;
            }
        throw e;
      }
    }),
    (r = 0),
    (y.prototype.setState = function (e, n) {
      var t;
      (t = null != this.__s && this.__s !== this.state ? this.__s : (this.__s = f({}, this.state))),
        'function' == typeof e && (e = e(f({}, t), this.props)),
        e && f(t, e),
        null != e && this.__v && (n && this.__h.push(n), k(this));
    }),
    (y.prototype.forceUpdate = function (e) {
      this.__v && ((this.__e = !0), e && this.__h.push(e), k(this));
    }),
    (y.prototype.render = m),
    (a = []),
    (l = 'function' == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout),
    (b.__r = 0);
  var H = 0;
  function M(e, n, t, r, a) {
    var l,
      i,
      s = {};
    for (i in n) 'ref' == i ? (l = n[i]) : (s[i] = n[i]);
    var c = {
      type: e,
      props: s,
      key: t,
      ref: l,
      __k: null,
      __: null,
      __b: 0,
      __e: null,
      __d: void 0,
      __c: null,
      __h: null,
      constructor: void 0,
      __v: --H,
      __source: r,
      __self: a
    };
    if ('function' == typeof e && (l = e.defaultProps)) for (i in l) void 0 === s[i] && (s[i] = l[i]);
    return o.vnode && o.vnode(c), c;
  }
  'undefined' != typeof window &&
    window.__PREACT_DEVTOOLS__ &&
    window.__PREACT_DEVTOOLS__.attachPreact('10.6.4', o, { Fragment: m, Component: y });
  var U = {};
  function F(e) {
    return e.type === m
      ? 'Fragment'
      : 'function' == typeof e.type
        ? e.type.displayName || e.type.name
        : 'string' == typeof e.type
          ? e.type
          : '#text';
  }
  var I = [],
    Y = [];
  function W() {
    return I.length > 0 ? I[I.length - 1] : null;
  }
  var $ = !1;
  function X(e) {
    return 'function' == typeof e.type && e.type != m;
  }
  function B(e) {
    for (var n = [e], t = e; null != t.__o; ) n.push(t.__o), (t = t.__o);
    return n.reduce(function (e, n) {
      e += '  in ' + F(n);
      var t = n.__source;
      return (
        t
          ? (e += ' (at ' + t.fileName + ':' + t.lineNumber + ')')
          : $ ||
            (($ = !0),
            console.warn(
              'Add @babel/plugin-transform-react-jsx-source to get a more detailed component stack. Note that you should not add it to production builds of your App for bundle size reasons.'
            )),
        e + '\n'
      );
    }, '');
  }
  var q = 'function' == typeof WeakMap,
    J = y.prototype.setState;
  y.prototype.setState = function (e, n) {
    return (
      null == this.__v
        ? null == this.state &&
          console.warn(
            'Calling "this.setState" inside the constructor of a component is a no-op and might be a bug in your application. Instead, set "this.state = {}" directly.\n\n' +
              B(W())
          )
        : null == this.__P &&
          console.warn(
            'Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n' +
              B(this.__v)
          ),
      J.call(this, e, n)
    );
  };
  var V = y.prototype.forceUpdate;
  function G(e) {
    var n = e.props,
      t = F(e),
      o = '';
    for (var r in n)
      if (n.hasOwnProperty(r) && 'children' !== r) {
        var a = n[r];
        'function' == typeof a && (a = 'function ' + (a.displayName || a.name) + '() {}'),
          (a = Object(a) !== a || a.toString ? a + '' : Object.prototype.toString.call(a)),
          (o += ' ' + r + '=' + JSON.stringify(a));
      }
    var l = n.children;
    return '<' + t + o + (l && l.length ? '>..</' + t + '>' : ' />');
  }
  (y.prototype.forceUpdate = function (e) {
    return (
      null == this.__v
        ? console.warn(
            'Calling "this.forceUpdate" inside the constructor of a component is a no-op and might be a bug in your application.\n\n' +
              B(W())
          )
        : null == this.__P &&
          console.warn(
            'Can\'t call "this.forceUpdate" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n' +
              B(this.__v)
          ),
      V.call(this, e)
    );
  }),
    (function () {
      !(function () {
        var e = o.__b,
          n = o.diffed,
          t = o.__,
          r = o.vnode,
          a = o.__r;
        (o.diffed = function (e) {
          X(e) && Y.pop(), I.pop(), n && n(e);
        }),
          (o.__b = function (n) {
            X(n) && I.push(n), e && e(n);
          }),
          (o.__ = function (e, n) {
            (Y = []), t && t(e, n);
          }),
          (o.vnode = function (e) {
            (e.__o = Y.length > 0 ? Y[Y.length - 1] : null), r && r(e);
          }),
          (o.__r = function (e) {
            X(e) && Y.push(e), a && a(e);
          });
      })();
      var e = !1,
        n = o.__b,
        t = o.diffed,
        r = o.vnode,
        a = o.__e,
        l = o.__,
        i = o.__h,
        s = q ? { lazyPropTypes: new WeakMap() } : null,
        c = [];
      (o.__e = function (e, n, t) {
        if (n && n.__c && 'function' == typeof e.then) {
          var o = e;
          e = new Error('Missing Suspense. The throwing component was: ' + F(n));
          for (var r = n; r; r = r.__)
            if (r.__c && r.__c.__c) {
              e = o;
              break;
            }
          if (e instanceof Error) throw e;
        }
        try {
          a(e, n, t),
            'function' != typeof e.then &&
              setTimeout(function () {
                throw e;
              });
        } catch (e) {
          throw e;
        }
      }),
        (o.__ = function (e, n) {
          if (!n)
            throw new Error(
              'Undefined parent passed to render(), this is the second argument.\nCheck if the element is available in the DOM/has the correct id.'
            );
          var t;
          switch (n.nodeType) {
            case 1:
            case 11:
            case 9:
              t = !0;
              break;
            default:
              t = !1;
          }
          if (!t) {
            var o = F(e);
            throw new Error(
              'Expected a valid HTML node as a second argument to render.\tReceived ' +
                n +
                ' instead: render(<' +
                o +
                ' />, ' +
                n +
                ');'
            );
          }
          l && l(e, n);
        }),
        (o.__b = function (t) {
          var o = t.type,
            r = (function e(n) {
              return n ? ('function' == typeof n.type ? e(n.__) : n) : {};
            })(t.__);
          if (((e = !0), void 0 === o))
            throw new Error(
              'Undefined component passed to createElement()\n\nYou likely forgot to export your component or might have mixed up default and named imports' +
                G(t) +
                '\n\n' +
                B(t)
            );
          if (null != o && 'object' == typeof o) {
            if (void 0 !== o.__k && void 0 !== o.__e)
              throw new Error(
                'Invalid type passed to createElement(): ' +
                  o +
                  '\n\nDid you accidentally pass a JSX literal as JSX twice?\n\n  let My' +
                  F(t) +
                  ' = ' +
                  G(o) +
                  ';\n  let vnode = <My' +
                  F(t) +
                  ' />;\n\nThis usually happens when you export a JSX literal and not the component.\n\n' +
                  B(t)
              );
            throw new Error('Invalid type passed to createElement(): ' + (Array.isArray(o) ? 'array' : o));
          }
          if (
            (('thead' !== o && 'tfoot' !== o && 'tbody' !== o) || 'table' === r.type
              ? 'tr' === o && 'thead' !== r.type && 'tfoot' !== r.type && 'tbody' !== r.type && 'table' !== r.type
                ? console.error(
                    'Improper nesting of table. Your <tr> should have a <thead/tbody/tfoot/table> parent.' +
                      G(t) +
                      '\n\n' +
                      B(t)
                  )
                : 'td' === o && 'tr' !== r.type
                  ? console.error(
                      'Improper nesting of table. Your <td> should have a <tr> parent.' + G(t) + '\n\n' + B(t)
                    )
                  : 'th' === o &&
                    'tr' !== r.type &&
                    console.error('Improper nesting of table. Your <th> should have a <tr>.' + G(t) + '\n\n' + B(t))
              : console.error(
                  'Improper nesting of table. Your <thead/tbody/tfoot> should have a <table> parent.' +
                    G(t) +
                    '\n\n' +
                    B(t)
                ),
            void 0 !== t.ref && 'function' != typeof t.ref && 'object' != typeof t.ref && !('$$typeof' in t))
          )
            throw new Error(
              'Component\'s "ref" property should be a function, or an object created by createRef(), but got [' +
                typeof t.ref +
                '] instead\n' +
                G(t) +
                '\n\n' +
                B(t)
            );
          if ('string' == typeof t.type)
            for (var a in t.props)
              if ('o' === a[0] && 'n' === a[1] && 'function' != typeof t.props[a] && null != t.props[a])
                throw new Error(
                  'Component\'s "' +
                    a +
                    '" property should be a function, but got [' +
                    typeof t.props[a] +
                    '] instead\n' +
                    G(t) +
                    '\n\n' +
                    B(t)
                );
          if ('function' == typeof t.type && t.type.propTypes) {
            if ('Lazy' === t.type.displayName && s && !s.lazyPropTypes.has(t.type)) {
              var l = 'PropTypes are not supported on lazy(). Use propTypes on the wrapped component itself. ';
              try {
                var i = t.type();
                s.lazyPropTypes.set(t.type, !0), console.warn(l + 'Component wrapped in lazy() is ' + F(i));
              } catch (t) {
                console.warn(l + "We will log the wrapped component's name once it is loaded.");
              }
            }
            var c = t.props;
            t.type.__f &&
              delete (c = (function (e, n) {
                for (var t in n) e[t] = n[t];
                return e;
              })({}, c)).ref,
              (function (e, n, t, o, r) {
                Object.keys(e).forEach(function (t) {
                  var a;
                  try {
                    a = e[t](n, t, o, 'prop', null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
                  } catch (e) {
                    a = e;
                  }
                  !a ||
                    a.message in U ||
                    ((U[a.message] = !0), console.error('Failed prop type: ' + a.message + ((r && '\n' + r()) || '')));
                });
              })(t.type.propTypes, c, 0, F(t), function () {
                return B(t);
              });
          }
          n && n(t);
        }),
        (o.__h = function (n, t, o) {
          if (!n || !e) throw new Error('Hook can only be invoked from render methods.');
          i && i(n, t, o);
        });
      var u = function (e, n) {
          return {
            get: function () {
              var t = 'get' + e + n;
              c && c.indexOf(t) < 0 && (c.push(t), console.warn('getting vnode.' + e + ' is deprecated, ' + n));
            },
            set: function () {
              var t = 'set' + e + n;
              c && c.indexOf(t) < 0 && (c.push(t), console.warn('setting vnode.' + e + ' is not allowed, ' + n));
            }
          };
        },
        h = {
          nodeName: u('nodeName', 'use vnode.type'),
          attributes: u('attributes', 'use vnode.props'),
          children: u('children', 'use vnode.props.children')
        },
        f = Object.create({}, h);
      (o.vnode = function (e) {
        var n = e.props;
        if (null !== e.type && null != n && ('__source' in n || '__self' in n)) {
          var t = (e.props = {});
          for (var o in n) {
            var a = n[o];
            '__source' === o ? (e.__source = a) : '__self' === o ? (e.__self = a) : (t[o] = a);
          }
        }
        (e.__proto__ = f), r && r(e);
      }),
        (o.diffed = function (n) {
          if (
            (n.__k &&
              n.__k.forEach(function (e) {
                if (e && void 0 === e.type) {
                  delete e.__, delete e.__b;
                  var t = Object.keys(e).join(',');
                  throw new Error(
                    'Objects are not valid as a child. Encountered an object with the keys {' + t + '}.\n\n' + B(n)
                  );
                }
              }),
            (e = !1),
            t && t(n),
            null != n.__k)
          )
            for (var o = [], r = 0; r < n.__k.length; r++) {
              var a = n.__k[r];
              if (a && null != a.key) {
                var l = a.key;
                if (-1 !== o.indexOf(l)) {
                  console.error(
                    'Following component has two or more children with the same key attribute: "' +
                      l +
                      '". This may cause glitches and misbehavior in rendering process. Component: \n\n' +
                      G(n) +
                      '\n\n' +
                      B(n)
                  );
                  break;
                }
                o.push(l);
              }
            }
        });
    })();
  var Z,
    K,
    Q,
    ee = 0,
    ne = [],
    te = o.__b,
    oe = o.__r,
    re = o.diffed,
    ae = o.__c,
    le = o.unmount;
  function ie(e, n) {
    o.__h && o.__h(K, e, ee || n), (ee = 0);
    var t = K.__H || (K.__H = { __: [], __h: [] });
    return e >= t.__.length && t.__.push({}), t.__[e];
  }
  function se(e) {
    return (ee = 1), ce(ge, e);
  }
  function ce(e, n, t) {
    var o = ie(Z++, 2);
    return (
      (o.t = e),
      o.__c ||
        ((o.__ = [
          t ? t(n) : ge(void 0, n),
          function (e) {
            var n = o.t(o.__[0], e);
            o.__[0] !== n && ((o.__ = [n, o.__[1]]), o.__c.setState({}));
          }
        ]),
        (o.__c = K)),
      o.__
    );
  }
  function ue(e, n) {
    var t = ie(Z++, 3);
    !o.__s && ve(t.__H, n) && ((t.__ = e), (t.__H = n), K.__H.__h.push(t));
  }
  function he(e) {
    return (
      (ee = 5),
      fe(function () {
        return { current: e };
      }, [])
    );
  }
  function fe(e, n) {
    var t = ie(Z++, 7);
    return ve(t.__H, n) && ((t.__ = e()), (t.__H = n), (t.__h = e)), t.__;
  }
  function de(e, n) {
    return (
      (ee = 8),
      fe(function () {
        return e;
      }, n)
    );
  }
  function pe() {
    var e;
    for (
      ne.sort(function (e, n) {
        return e.__v.__b - n.__v.__b;
      });
      (e = ne.pop());

    )
      if (e.__P)
        try {
          e.__H.__h.forEach(me), e.__H.__h.forEach(ye), (e.__H.__h = []);
        } catch (n) {
          (e.__H.__h = []), o.__e(n, e.__v);
        }
  }
  (o.__b = function (e) {
    (K = null), te && te(e);
  }),
    (o.__r = function (e) {
      oe && oe(e), (Z = 0);
      var n = (K = e.__c).__H;
      n && (n.__h.forEach(me), n.__h.forEach(ye), (n.__h = []));
    }),
    (o.diffed = function (e) {
      re && re(e);
      var n = e.__c;
      n &&
        n.__H &&
        n.__H.__h.length &&
        ((1 !== ne.push(n) && Q === o.requestAnimationFrame) ||
          (
            (Q = o.requestAnimationFrame) ||
            function (e) {
              var n,
                t = function () {
                  clearTimeout(o), _e && cancelAnimationFrame(n), setTimeout(e);
                },
                o = setTimeout(t, 100);
              _e && (n = requestAnimationFrame(t));
            }
          )(pe)),
        (K = null);
    }),
    (o.__c = function (e, n) {
      n.some(function (e) {
        try {
          e.__h.forEach(me),
            (e.__h = e.__h.filter(function (e) {
              return !e.__ || ye(e);
            }));
        } catch (t) {
          n.some(function (e) {
            e.__h && (e.__h = []);
          }),
            (n = []),
            o.__e(t, e.__v);
        }
      }),
        ae && ae(e, n);
    }),
    (o.unmount = function (e) {
      le && le(e);
      var n,
        t = e.__c;
      t &&
        t.__H &&
        (t.__H.__.forEach(function (e) {
          try {
            me(e);
          } catch (e) {
            n = e;
          }
        }),
        n && o.__e(n, t.__v));
    });
  var _e = 'function' == typeof requestAnimationFrame;
  function me(e) {
    var n = K,
      t = e.__c;
    'function' == typeof t && ((e.__c = void 0), t()), (K = n);
  }
  function ye(e) {
    var n = K;
    (e.__c = e.__()), (K = n);
  }
  function ve(e, n) {
    return (
      !e ||
      e.length !== n.length ||
      n.some(function (n, t) {
        return n !== e[t];
      })
    );
  }
  function ge(e, n) {
    return 'function' == typeof n ? n(e) : n;
  }
  function ke(e, n) {
    for (var t in e) if ('__source' !== t && !(t in n)) return !0;
    for (var o in n) if ('__source' !== o && e[o] !== n[o]) return !0;
    return !1;
  }
  function be(e) {
    this.props = e;
  }
  ((be.prototype = new y()).isPureReactComponent = !0),
    (be.prototype.shouldComponentUpdate = function (e, n) {
      return ke(this.props, e) || ke(this.state, n);
    });
  var xe = o.__b;
  o.__b = function (e) {
    e.type && e.type.__f && e.ref && ((e.props.ref = e.ref), (e.ref = null)), xe && xe(e);
  };
  var we = o.__e;
  o.__e = function (e, n, t) {
    if (e.then)
      for (var o, r = n; (r = r.__); )
        if ((o = r.__c) && o.__c) return null == n.__e && ((n.__e = t.__e), (n.__k = t.__k)), o.__c(e, n);
    we(e, n, t);
  };
  var Le = o.unmount;
  function Se() {
    (this.__u = 0), (this.t = null), (this.__b = null);
  }
  function Ee(e) {
    var n = e.__.__c;
    return n && n.__e && n.__e(e);
  }
  function Ce() {
    (this.u = null), (this.o = null);
  }
  (o.unmount = function (e) {
    var n = e.__c;
    n && n.__R && n.__R(), n && !0 === e.__h && (e.type = null), Le && Le(e);
  }),
    ((Se.prototype = new y()).__c = function (e, n) {
      var t = n.__c,
        o = this;
      null == o.t && (o.t = []), o.t.push(t);
      var r = Ee(o.__v),
        a = !1,
        l = function () {
          a || ((a = !0), (t.__R = null), r ? r(i) : i());
        };
      t.__R = l;
      var i = function () {
          if (!--o.__u) {
            if (o.state.__e) {
              var e = o.state.__e;
              o.__v.__k[0] = (function e(n, t, o) {
                return (
                  n &&
                    ((n.__v = null),
                    (n.__k =
                      n.__k &&
                      n.__k.map(function (n) {
                        return e(n, t, o);
                      })),
                    n.__c &&
                      n.__c.__P === t &&
                      (n.__e && o.insertBefore(n.__e, n.__d), (n.__c.__e = !0), (n.__c.__P = o))),
                  n
                );
              })(e, e.__c.__P, e.__c.__O);
            }
            var n;
            for (o.setState({ __e: (o.__b = null) }); (n = o.t.pop()); ) n.forceUpdate();
          }
        },
        s = !0 === n.__h;
      o.__u++ || s || o.setState({ __e: (o.__b = o.__v.__k[0]) }), e.then(l, l);
    }),
    (Se.prototype.componentWillUnmount = function () {
      this.t = [];
    }),
    (Se.prototype.render = function (e, n) {
      if (this.__b) {
        if (this.__v.__k) {
          var t = document.createElement('div'),
            o = this.__v.__k[0].__c;
          this.__v.__k[0] = (function e(n, t, o) {
            return (
              n &&
                (n.__c &&
                  n.__c.__H &&
                  (n.__c.__H.__.forEach(function (e) {
                    'function' == typeof e.__c && e.__c();
                  }),
                  (n.__c.__H = null)),
                null !=
                  (n = (function (e, n) {
                    for (var t in n) e[t] = n[t];
                    return e;
                  })({}, n)).__c && (n.__c.__P === o && (n.__c.__P = t), (n.__c = null)),
                (n.__k =
                  n.__k &&
                  n.__k.map(function (n) {
                    return e(n, t, o);
                  }))),
              n
            );
          })(this.__b, t, (o.__O = o.__P));
        }
        this.__b = null;
      }
      var r = n.__e && p(m, null, e.fallback);
      return r && (r.__h = null), [p(m, null, n.__e ? null : e.children), r];
    });
  var Oe = function (e, n, t) {
    if ((++t[1] === t[0] && e.o.delete(n), e.props.revealOrder && ('t' !== e.props.revealOrder[0] || !e.o.size)))
      for (t = e.u; t; ) {
        for (; t.length > 3; ) t.pop()();
        if (t[1] < t[0]) break;
        e.u = t = t[2];
      }
  };
  ((Ce.prototype = new y()).__e = function (e) {
    var n = this,
      t = Ee(n.__v),
      o = n.o.get(e);
    return (
      o[0]++,
      function (r) {
        var a = function () {
          n.props.revealOrder ? (o.push(r), Oe(n, e, o)) : r();
        };
        t ? t(a) : a();
      }
    );
  }),
    (Ce.prototype.render = function (e) {
      (this.u = null), (this.o = new Map());
      var n = L(e.children);
      e.revealOrder && 'b' === e.revealOrder[0] && n.reverse();
      for (var t = n.length; t--; ) this.o.set(n[t], (this.u = [1, 0, this.u]));
      return e.children;
    }),
    (Ce.prototype.componentDidUpdate = Ce.prototype.componentDidMount =
      function () {
        var e = this;
        this.o.forEach(function (n, t) {
          Oe(e, t, n);
        });
      });
  var Te = ('undefined' != typeof Symbol && Symbol.for && Symbol.for('react.element')) || 60103,
    Pe =
      /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,
    Ae = 'undefined' != typeof document,
    je = function (e) {
      return ('undefined' != typeof Symbol && 'symbol' == typeof Symbol() ? /fil|che|rad/i : /fil|che|ra/i).test(e);
    };
  (y.prototype.isReactComponent = {}),
    ['componentWillMount', 'componentWillReceiveProps', 'componentWillUpdate'].forEach(function (e) {
      Object.defineProperty(y.prototype, e, {
        configurable: !0,
        get: function () {
          return this['UNSAFE_' + e];
        },
        set: function (n) {
          Object.defineProperty(this, e, { configurable: !0, writable: !0, value: n });
        }
      });
    });
  var ze = o.event;
  function Ne() {}
  function Re() {
    return this.cancelBubble;
  }
  function De() {
    return this.defaultPrevented;
  }
  o.event = function (e) {
    return (
      ze && (e = ze(e)),
      (e.persist = Ne),
      (e.isPropagationStopped = Re),
      (e.isDefaultPrevented = De),
      (e.nativeEvent = e)
    );
  };
  var He = {
      configurable: !0,
      get: function () {
        return this.class;
      }
    },
    Me = o.vnode;
  o.vnode = function (e) {
    var n = e.type,
      t = e.props,
      o = t;
    if ('string' == typeof n) {
      var r = -1 === n.indexOf('-');
      for (var a in ((o = {}), t)) {
        var l = t[a];
        (Ae && 'children' === a && 'noscript' === n) ||
          ('value' === a && 'defaultValue' in t && null == l) ||
          ('defaultValue' === a && 'value' in t && null == t.value
            ? (a = 'value')
            : 'download' === a && !0 === l
              ? (l = '')
              : /ondoubleclick/i.test(a)
                ? (a = 'ondblclick')
                : /^onchange(textarea|input)/i.test(a + n) && !je(t.type)
                  ? (a = 'oninput')
                  : /^onfocus$/i.test(a)
                    ? (a = 'onfocusin')
                    : /^onblur$/i.test(a)
                      ? (a = 'onfocusout')
                      : /^on(Ani|Tra|Tou|BeforeInp)/.test(a)
                        ? (a = a.toLowerCase())
                        : r && Pe.test(a)
                          ? (a = a.replace(/[A-Z0-9]/, '-$&').toLowerCase())
                          : null === l && (l = void 0),
          (o[a] = l));
      }
      'select' == n &&
        o.multiple &&
        Array.isArray(o.value) &&
        (o.value = L(t.children).forEach(function (e) {
          e.props.selected = -1 != o.value.indexOf(e.props.value);
        })),
        'select' == n &&
          null != o.defaultValue &&
          (o.value = L(t.children).forEach(function (e) {
            e.props.selected = o.multiple
              ? -1 != o.defaultValue.indexOf(e.props.value)
              : o.defaultValue == e.props.value;
          })),
        (e.props = o),
        t.class != t.className &&
          ((He.enumerable = 'className' in t),
          null != t.className && (o.class = t.className),
          Object.defineProperty(o, 'className', He));
    }
    (e.$$typeof = Te), Me && Me(e);
  };
  var Ue = o.__r;
  function Fe(e, n, t, o) {
    const r = he(t),
      a = he(o);
    ue(() => {
      (r.current = t), (a.current = o);
    }),
      ue(() => {
        const t = e && 'current' in e ? e.current : e;
        if (!t) return;
        let o = 0;
        function l(...e) {
          o || r.current.apply(this, e);
        }
        t.addEventListener(n, l);
        const i = a.current;
        return () => {
          (o = 1), t.removeEventListener(n, l), i && i();
        };
      }, [e, n]);
  }
  o.__r = function (e) {
    Ue && Ue(e), e.__c;
  };
  const Ie = 'undefined' != typeof performance ? performance : Date;
  function Ye(e, n = 30, t = !1) {
    const o = (e => {
        const n = he(e);
        return (
          ue(() => {
            n.current = e;
          }),
          n
        );
      })(e),
      r = 1e3 / n,
      a = he(0),
      l = he(),
      i = () => l.current && clearTimeout(l.current),
      s = [n, t, o];
    function c() {
      (a.current = 0), i();
    }
    return (
      ue(() => c, s),
      de(function () {
        const e = arguments,
          n = Ie.now(),
          s = () => {
            (a.current = n), i(), o.current.apply(null, e);
          },
          c = a.current;
        if (t && 0 === c) return s();
        if (n - c > r) {
          if (c > 0) return s();
          a.current = n;
        }
        i(),
          (l.current = setTimeout(() => {
            s(), (a.current = 0);
          }, r));
      }, s)
    );
  }
  function We(e, n) {
    if ('undefined' == typeof window) return e;
    const { event: t, element: o } = n;
    let r;
    r = 'touches' in t ? t.touches[0] : t;
    const { clientX: a, clientY: l, screenX: i, screenY: s, pageX: c = 0, pageY: u = 0 } = r,
      h = o.getBoundingClientRect(),
      f = c - h.left - (window.pageXOffset || window.scrollX),
      d = u - h.top - (window.pageYOffset || window.scrollY);
    return 'touches' in t && (f < 0 || d < 0 || f > h.width || d > h.height)
      ? { ...e, context: { ...e.context, hoverStatus: 'leave', touchStatus: 'end' } }
      : {
          context: { ...e.context, hoverStatus: 'enter' },
          mouse: {
            ...e.mouse,
            x: f,
            y: d,
            pageX: c,
            pageY: u,
            clientX: a,
            clientY: l,
            screenX: i,
            screenY: s,
            elementWidth: h.width,
            elementHeight: h.height,
            isOver: !0,
            isTouch: 'touches' in t
          }
        };
  }
  function $e(e, n) {
    const { mouse: t, context: o } = e,
      r = We;
    if ('mousemove' === n.type) return 'end' === o.touchStatus ? e : r(e, n);
    if ('touchmove' === n.type) {
      return r({ context: { ...o, touchStatus: 'start' }, mouse: t }, n);
    }
    if ('touchdown' === n.type) {
      return r({ context: { ...o, touchStatus: 'start' }, mouse: { ...t, isDown: !0 } }, n);
    }
    return 'mousedown' === n.type
      ? { context: o, mouse: { ...t, isDown: !0 } }
      : 'mouseup' === n.type
        ? { context: o, mouse: { ...t, isDown: !1 } }
        : 'mouseleave' === n.type
          ? { context: { ...o, hoverStatus: 'leave' }, mouse: { ...t, isOver: !1 } }
          : 'touchleave' === n.type
            ? { context: { ...o, hoverStatus: 'leave', touchStatus: 'end' }, mouse: { ...t, isOver: !1, isDown: !1 } }
            : 'activeStatus' === n.type
              ? { context: { ...o, activeStatus: n.value }, mouse: t }
              : e;
  }
  const Xe = {
      x: null,
      y: null,
      pageX: null,
      pageY: null,
      clientX: null,
      clientY: null,
      screenX: null,
      screenY: null,
      elementWidth: null,
      elementHeight: null,
      isOver: !1,
      isDown: !1,
      isTouch: !1
    },
    Be = { hoverStatus: 'idle', touchStatus: 'idle', activeStatus: 'inactive' };
  var qe = function (e, n, t, o) {
    return new (t || (t = Promise))(function (r, a) {
      function l(e) {
        try {
          s(o.next(e));
        } catch (e) {
          a(e);
        }
      }
      function i(e) {
        try {
          s(o.throw(e));
        } catch (e) {
          a(e);
        }
      }
      function s(e) {
        var n;
        e.done
          ? r(e.value)
          : ((n = e.value),
            n instanceof t
              ? n
              : new t(function (e) {
                  e(n);
                })).then(l, i);
      }
      s((o = o.apply(e, n || [])).next());
    });
  };
  class Je {
    constructor(e, n) {
      if (
        ((this.initialState = e),
        (this.listeners = []),
        (this.actionListeners = []),
        (this.actions = []),
        (this.reducers = {}),
        (this.timeout = e => new Promise(n => setTimeout(n, e))),
        (this.state = (null == n ? void 0 : n.state) || e),
        null == n ? void 0 : n.actions)
      ) {
        (this.state = e), (this.actions = n.actions);
        for (const e of this.actions) this.state = this.reduce(this.state, e);
      }
    }
    getState() {
      return this.state;
    }
    getActions() {
      return this.actions;
    }
    dispatch(e) {
      const n = Date.now(),
        t = Object.assign(Object.assign({}, e), { timestamp: n });
      this.actions.push(t), (this.state = this.reduce(this.state, t)), this.notifyListeners(t);
    }
    reset() {
      (this.state = this.initialState), (this.actions = []);
    }
    restoreState(e, n) {
      (this.state = e), (this.actions = n);
    }
    replay(e, n) {
      return qe(this, void 0, void 0, function* () {
        this.reset(), (this.actions = []);
        let t = 0;
        null != (null == n ? void 0 : n.until) && (e = e.slice(0, n.until));
        for (const o of e) {
          let e = !1 === (null == n ? void 0 : n.animate) ? 0 : t ? o.timestamp - t : 0;
          (null == n ? void 0 : n.speed) && (e /= n.speed),
            yield this.timeout(e),
            this.actions.push(o),
            (this.state = this.reduce(this.state, o)),
            this.notifyListeners(o),
            (t = o.timestamp);
        }
      });
    }
    subscribe(e) {
      this.listeners.push(e), e(this.state);
    }
    subscribeActions(e) {
      this.actionListeners.push(e);
    }
    unsubscribe(e) {
      const n = this.listeners.indexOf(e);
      -1 !== n && this.listeners.splice(n, 1);
    }
    unsubscribeAll() {
      this.listeners = [];
    }
    addReducer(e, n) {
      this.reducers[e] = n;
    }
    reduce(e, n) {
      const t = this.reducers[n.type];
      return t ? t(e, n.payload) : e;
    }
    notifyListeners(e) {
      for (const e of this.listeners) e(this.state);
      for (const n of this.actionListeners) n(e);
      console.log('Action:', e);
    }
  }
  decodeURIComponent(
    "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 643.5 896.5'preserveAspectRatio='xMidYMid meet'%3e %3cdefs%3e %3cclipPath id='a'%3e %3crect width='643.5' height='896' fill='none'/%3e %3c/clipPath%3e %3cclipPath id='b'%3e %3crect width='640' height='896.5' fill='none'/%3e %3c/clipPath%3e %3c/defs%3e %3cg transform='translate(0 .5)' clip-path='url(%23a)' fill='none' stroke='%23bcbcbc' stroke-dasharray='3 3'%3e %3cline data-name='Line 28' y2='896' transform='translate(.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(32.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(64.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(96.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(128.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(160.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(192.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(224.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(256.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(288.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(320.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(352.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(384.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(416.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(448.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(480.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(512.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(544.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(576.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(608.5)'/%3e %3cline data-name='Line 28' y2='896' transform='translate(640.5)'/%3e %3c/g%3e %3cg transform='translate(.5)' clip-path='url(%23b)' fill='none' stroke='%23bcbcbc' stroke-dasharray='3 3'%3e %3cline data-name='Line 29' x2='640' transform='translate(0 .5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 32.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 64.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 96.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 128.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 160.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 192.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 224.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 256.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 288.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 320.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 352.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 384.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 416.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 448.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 480.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 512.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 544.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 576.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 608.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 640.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 672.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 704.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 736.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 768.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 800.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 832.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 864.5)'/%3e %3cline data-name='Line 29' x2='640' transform='translate(0 896.5)'/%3e %3c/g%3e %3cg id='giveColor' transform='translate(.5 .5)' fill='white' stroke='%235c5c5c' stroke-width='3'%3e %3crect data-name='192' width='512' height='384' transform='translate(64 64)'/%3e %3crect data-name='96' width='256' height='384' transform='translate(65 448)'/%3e %3crect data-name='48' width='256' height='192' transform='translate(320 448)'/%3e %3crect data-name='24' width='128' height='192' transform='translate(320 640)'/%3e %3crect data-name='12B' width='128' height='96' transform='translate(448 736)'/%3e %3crect data-name='12A' width='128' height='96' transform='translate(448 640)'/%3e %3c/g%3e%3c/svg%3e"
  ).replace('data:image/svg+xml,', '');
  const Ve = ({ config: e, dom: n, store: t }) => {
    var r, a, l, i, s, c;
    const { width: u, height: h } = e,
      f = e.colors.split(',').map(e => e.trim().toLowerCase()),
      [d, p] = se(f[0]),
      _ = he(),
      m = he(),
      y = (function (e) {
        const [n, t] = se(e.getState());
        return (
          ue(() => {
            const n = e => {
              t(e);
            };
            return (
              e.subscribe(n),
              () => {
                e.unsubscribe(n);
              }
            );
          }, [e]),
          n
        );
      })(t),
      v = (function (e, n = {}) {
        const { fps: t = 30, enterDelay: o = 0, leaveDelay: r = 0 } = n,
          [a, l] = ce($e, { mouse: Xe, context: Be }),
          i = Ye(
            n => {
              const t = e && 'current' in e ? e.current : e;
              t && l({ type: 'mousemove', event: n, element: t });
            },
            t,
            !0
          ),
          s = Ye(
            n => {
              const t = e && 'current' in e ? e.current : e;
              t && l({ type: 'touchmove', event: n, element: t });
            },
            t,
            !0
          ),
          c = Ye(() => l({ type: 'mouseleave' }), t, !1),
          u = Ye(
            n => {
              const t = e && 'current' in e ? e.current : e;
              t &&
                l(
                  'touches' in n
                    ? { type: 'touchdown', element: t, event: n }
                    : { type: 'mousedown', element: t, event: n }
                );
            },
            t,
            !0
          ),
          h = Ye(() => l({ type: 'mouseup' }), t, !1),
          f = Ye(() => l({ type: 'touchleave' }), t, !1);
        function d() {
          return l({ type: 'activeStatus', value: 'active' });
        }
        function p() {
          return l({ type: 'activeStatus', value: 'inactive' });
        }
        return (
          Fe(e, 'mouseenter', i),
          Fe(e, 'mousemove', i),
          Fe(e, 'mouseleave', c),
          Fe(e, 'mousedown', u),
          Fe('undefined' != typeof window ? window : null, 'mousedown', u),
          Fe('undefined' != typeof window ? window : null, 'mouseup', h),
          Fe(e, 'touchstart', u),
          Fe(e, 'touchmove', s),
          Fe(e, 'touchend', f),
          Fe(e, 'touchcancel', f),
          ue(() => {
            if ('enter' === a.context.hoverStatus) {
              if (o) {
                const e = setTimeout(d, o);
                return () => clearTimeout(e);
              }
              l({ type: 'activeStatus', value: 'active' });
            } else {
              if (r) {
                const e = setTimeout(p, r);
                return () => clearTimeout(e);
              }
              l({ type: 'activeStatus', value: 'inactive' });
            }
          }, [a.context.hoverStatus, o, r]),
          'active' === a.context.activeStatus ? a.mouse : Xe
        );
      })(_, { fps: 60, enterDelay: 100, leaveDelay: 100 });
    ue(() => {
      const e = v.isDown ? 0.8 : 1;
      _.current.style.cursor = (function (e, n) {
        return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle id='Ellipse_10' cx='16' cy='16' r='16' fill='%23fff'/%3E%3Cg style='transition: all .4s; transform: translate(${16 * (1 - e)}px,${16 * (1 - e)}px) scale(${e})' %3E%3Ccircle id='Ellipse_11' cx='12' cy='12' r='12' transform='translate(4 4)' fill='${n}'/%3E%3C/g%3E%3C/svg%3E") 16 16, pointer`;
      })(e, d);
    }, [d, v.isDown]);
    const g = de(() => {
      const e = n.elementFromPoint(v.clientX, v.clientY),
        o = m.current.find(n => n == e);
      if (o && e.getAttribute('fill') !== `${d}`) {
        const n = e.getAttribute('data-name');
        t.dispatch({ type: 'SET_COLOR', payload: { id: n, color: d } });
      }
    }, [v, d, m, t]);
    return (
      (function (e, n) {
        var t = ie(Z++, 4);
        !o.__s && ve(t.__H, n) && ((t.__ = e), (t.__H = n), K.__h.push(t));
      })(() => {
        u && _.current.firstElementChild.setAttribute('width', u),
          h && _.current.firstElementChild.setAttribute('height', h),
          (m.current = [..._.current.querySelectorAll('#giveColor rect')]);
      }, [_]),
      M('div', {
        className: 'flex flex-col h-full',
        children: [
          M('h1', { class: 'mx-auto my-4 text-gray-500', children: 'Color the squares with your mouse' }),
          M('div', {
            className: 'flex justify-center',
            ref: _,
            children: M('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 643.5 896.5',
              onMouseDown: g,
              preserveAspectRatio: 'xMidYMid meet',
              children: [
                M('defs', {
                  children: [
                    M('clipPath', { id: 'a', children: M('rect', { width: '643.5', height: '896', fill: 'none' }) }),
                    M('clipPath', { id: 'b', children: M('rect', { width: '640', height: '896.5', fill: 'none' }) })
                  ]
                }),
                M('g', {
                  transform: 'translate(0 .5)',
                  'clip-path': 'url(#a)',
                  fill: 'none',
                  stroke: '#bcbcbc',
                  'stroke-dasharray': '3 3',
                  children: [
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(32.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(64.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(96.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(128.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(160.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(192.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(224.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(256.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(288.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(320.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(352.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(384.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(416.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(448.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(480.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(512.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(544.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(576.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(608.5)' }),
                    M('line', { 'data-name': 'Line 28', y2: '896', transform: 'translate(640.5)' })
                  ]
                }),
                M('g', {
                  transform: 'translate(.5)',
                  'clip-path': 'url(#b)',
                  fill: 'none',
                  stroke: '#bcbcbc',
                  'stroke-dasharray': '3 3',
                  children: [
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 .5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 32.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 64.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 96.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 128.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 160.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 192.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 224.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 256.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 288.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 320.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 352.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 384.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 416.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 448.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 480.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 512.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 544.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 576.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 608.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 640.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 672.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 704.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 736.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 768.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 800.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 832.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 864.5)' }),
                    M('line', { 'data-name': 'Line 29', x2: '640', transform: 'translate(0 896.5)' })
                  ]
                }),
                M('g', {
                  id: 'giveColor',
                  transform: 'translate(.5 .5)',
                  fill: '#fff',
                  stroke: '#5c5c5c',
                  'stroke-width': '3',
                  children: [
                    M('rect', {
                      'data-name': '192',
                      width: '512',
                      height: '384',
                      transform: 'translate(64 64)',
                      fill:
                        (null === (r = y.vlakken.find(e => '192' === e.id)) || void 0 === r ? void 0 : r.color) ||
                        '#fff'
                    }),
                    M('rect', {
                      'data-name': '96',
                      width: '256',
                      height: '384',
                      transform: 'translate(65 448)',
                      fill:
                        (null === (a = y.vlakken.find(e => '96' === e.id)) || void 0 === a ? void 0 : a.color) || '#fff'
                    }),
                    M('rect', {
                      'data-name': '48',
                      width: '256',
                      height: '192',
                      transform: 'translate(320 448)',
                      fill:
                        (null === (l = y.vlakken.find(e => '48' === e.id)) || void 0 === l ? void 0 : l.color) || '#fff'
                    }),
                    M('rect', {
                      'data-name': '24',
                      width: '128',
                      height: '192',
                      transform: 'translate(320 640)',
                      fill:
                        (null === (i = y.vlakken.find(e => '24' === e.id)) || void 0 === i ? void 0 : i.color) || '#fff'
                    }),
                    M('rect', {
                      'data-name': '12B',
                      width: '128',
                      height: '96',
                      transform: 'translate(448 736)',
                      fill:
                        (null === (s = y.vlakken.find(e => '12B' === e.id)) || void 0 === s ? void 0 : s.color) ||
                        '#fff'
                    }),
                    M('rect', {
                      'data-name': '12A',
                      width: '128',
                      height: '96',
                      transform: 'translate(448 640)',
                      fill:
                        (null === (c = y.vlakken.find(e => '12A' === e.id)) || void 0 === c ? void 0 : c.color) ||
                        '#fff'
                    })
                  ]
                })
              ]
            })
          }),
          M('div', {
            className: 'flex justify-center',
            children: M('div', {
              className:
                'bg-white rounded-full shadow-lg border border-gray-200 -mt-2 p-1 w-auto flex items-center justify-center space-x-1',
              children: f.map((e, n) =>
                M(
                  'div',
                  {
                    className: 'rounded-full border-4 w-10 h-10 ' + (e === d ? 'border-gray-100/70' : 'border-white'),
                    style: { background: e },
                    onClick: () => p(e)
                  },
                  n
                )
              )
            })
          })
        ]
      })
    );
  };
  var Ge = { colors: 'red, blue, green', width: '400', height: '400' };
  var Ze = new (class {
    constructor() {
      (this.typeIdentifier = 'colorProportions'),
        (this.initialState = { vlakken: [] }),
        (this.getInstance = (e, n, t) => {
          (n.properties = Object.assign(Object.assign({}, Ge), n.properties)), (this.config = n);
          const o = t ? JSON.parse(t) : null,
            r = t ? JSON.parse(t).log : null;
          if (
            ((this.store = ((e, n) => {
              const t = new Je(e, n);
              return (
                t.addReducer('SET_COLOR', (e, n) =>
                  e.vlakken.find(e => e.id === n.id)
                    ? Object.assign(Object.assign({}, e), {
                        vlakken: e.vlakken.map(e =>
                          e.id === n.id ? Object.assign(Object.assign({}, e), { color: n.color }) : e
                        )
                      })
                    : Object.assign(Object.assign({}, e), { vlakken: [...e.vlakken, n] })
                ),
                t
              );
            })(this.initialState)),
            (o || r) && this.store.restoreState(o, r),
            (this.shadowdom = e.attachShadow({ mode: 'open' })),
            this.store.subscribe(() => {
              const n = {
                  interaction: this,
                  responseIdentifier: this.config.responseIdentifier,
                  valid: !0,
                  value: this.getResponse()
                },
                t = new CustomEvent('qti-interaction-changed', { detail: n });
              e.dispatchEvent(t);
            }),
            this.render(),
            this.config.boundTo && Object.keys(this.config.boundTo).length > 0)
          ) {
            const e = Object.keys(this.config.boundTo)[0],
              n = this.config.boundTo[e],
              t = Object.values(n).some(e =>
                'object' == typeof e ? Object.values(e).some(e => void 0 !== e) : void 0 !== e
              );
            t && this.setResponse(n);
          }
          this.config.onready && this.config.onready(this);
        }),
        (this.render = () => {
          D(null, this.shadowdom);
          const e = document.createElement('style');
          (e.innerHTML =
            '/*! tailwindcss v4.0.3 | MIT License | https://tailwindcss.com */\n@layer theme, base, components, utilities;\n@layer theme {\n  :root, :host {\n    --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",\n      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";\n    --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;\n    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,\n      "Liberation Mono", "Courier New", monospace;\n    --color-red-50: oklch(0.971 0.013 17.38);\n    --color-red-100: oklch(0.936 0.032 17.717);\n    --color-red-200: oklch(0.885 0.062 18.334);\n    --color-red-300: oklch(0.808 0.114 19.571);\n    --color-red-400: oklch(0.704 0.191 22.216);\n    --color-red-500: oklch(0.637 0.237 25.331);\n    --color-red-600: oklch(0.577 0.245 27.325);\n    --color-red-700: oklch(0.505 0.213 27.518);\n    --color-red-800: oklch(0.444 0.177 26.899);\n    --color-red-900: oklch(0.396 0.141 25.723);\n    --color-red-950: oklch(0.258 0.092 26.042);\n    --color-orange-50: oklch(0.98 0.016 73.684);\n    --color-orange-100: oklch(0.954 0.038 75.164);\n    --color-orange-200: oklch(0.901 0.076 70.697);\n    --color-orange-300: oklch(0.837 0.128 66.29);\n    --color-orange-400: oklch(0.75 0.183 55.934);\n    --color-orange-500: oklch(0.705 0.213 47.604);\n    --color-orange-600: oklch(0.646 0.222 41.116);\n    --color-orange-700: oklch(0.553 0.195 38.402);\n    --color-orange-800: oklch(0.47 0.157 37.304);\n    --color-orange-900: oklch(0.408 0.123 38.172);\n    --color-orange-950: oklch(0.266 0.079 36.259);\n    --color-amber-50: oklch(0.987 0.022 95.277);\n    --color-amber-100: oklch(0.962 0.059 95.617);\n    --color-amber-200: oklch(0.924 0.12 95.746);\n    --color-amber-300: oklch(0.879 0.169 91.605);\n    --color-amber-400: oklch(0.828 0.189 84.429);\n    --color-amber-500: oklch(0.769 0.188 70.08);\n    --color-amber-600: oklch(0.666 0.179 58.318);\n    --color-amber-700: oklch(0.555 0.163 48.998);\n    --color-amber-800: oklch(0.473 0.137 46.201);\n    --color-amber-900: oklch(0.414 0.112 45.904);\n    --color-amber-950: oklch(0.279 0.077 45.635);\n    --color-yellow-50: oklch(0.987 0.026 102.212);\n    --color-yellow-100: oklch(0.973 0.071 103.193);\n    --color-yellow-200: oklch(0.945 0.129 101.54);\n    --color-yellow-300: oklch(0.905 0.182 98.111);\n    --color-yellow-400: oklch(0.852 0.199 91.936);\n    --color-yellow-500: oklch(0.795 0.184 86.047);\n    --color-yellow-600: oklch(0.681 0.162 75.834);\n    --color-yellow-700: oklch(0.554 0.135 66.442);\n    --color-yellow-800: oklch(0.476 0.114 61.907);\n    --color-yellow-900: oklch(0.421 0.095 57.708);\n    --color-yellow-950: oklch(0.286 0.066 53.813);\n    --color-lime-50: oklch(0.986 0.031 120.757);\n    --color-lime-100: oklch(0.967 0.067 122.328);\n    --color-lime-200: oklch(0.938 0.127 124.321);\n    --color-lime-300: oklch(0.897 0.196 126.665);\n    --color-lime-400: oklch(0.841 0.238 128.85);\n    --color-lime-500: oklch(0.768 0.233 130.85);\n    --color-lime-600: oklch(0.648 0.2 131.684);\n    --color-lime-700: oklch(0.532 0.157 131.589);\n    --color-lime-800: oklch(0.453 0.124 130.933);\n    --color-lime-900: oklch(0.405 0.101 131.063);\n    --color-lime-950: oklch(0.274 0.072 132.109);\n    --color-green-50: oklch(0.982 0.018 155.826);\n    --color-green-100: oklch(0.962 0.044 156.743);\n    --color-green-200: oklch(0.925 0.084 155.995);\n    --color-green-300: oklch(0.871 0.15 154.449);\n    --color-green-400: oklch(0.792 0.209 151.711);\n    --color-green-500: oklch(0.723 0.219 149.579);\n    --color-green-600: oklch(0.627 0.194 149.214);\n    --color-green-700: oklch(0.527 0.154 150.069);\n    --color-green-800: oklch(0.448 0.119 151.328);\n    --color-green-900: oklch(0.393 0.095 152.535);\n    --color-green-950: oklch(0.266 0.065 152.934);\n    --color-emerald-50: oklch(0.979 0.021 166.113);\n    --color-emerald-100: oklch(0.95 0.052 163.051);\n    --color-emerald-200: oklch(0.905 0.093 164.15);\n    --color-emerald-300: oklch(0.845 0.143 164.978);\n    --color-emerald-400: oklch(0.765 0.177 163.223);\n    --color-emerald-500: oklch(0.696 0.17 162.48);\n    --color-emerald-600: oklch(0.596 0.145 163.225);\n    --color-emerald-700: oklch(0.508 0.118 165.612);\n    --color-emerald-800: oklch(0.432 0.095 166.913);\n    --color-emerald-900: oklch(0.378 0.077 168.94);\n    --color-emerald-950: oklch(0.262 0.051 172.552);\n    --color-teal-50: oklch(0.984 0.014 180.72);\n    --color-teal-100: oklch(0.953 0.051 180.801);\n    --color-teal-200: oklch(0.91 0.096 180.426);\n    --color-teal-300: oklch(0.855 0.138 181.071);\n    --color-teal-400: oklch(0.777 0.152 181.912);\n    --color-teal-500: oklch(0.704 0.14 182.503);\n    --color-teal-600: oklch(0.6 0.118 184.704);\n    --color-teal-700: oklch(0.511 0.096 186.391);\n    --color-teal-800: oklch(0.437 0.078 188.216);\n    --color-teal-900: oklch(0.386 0.063 188.416);\n    --color-teal-950: oklch(0.277 0.046 192.524);\n    --color-cyan-50: oklch(0.984 0.019 200.873);\n    --color-cyan-100: oklch(0.956 0.045 203.388);\n    --color-cyan-200: oklch(0.917 0.08 205.041);\n    --color-cyan-300: oklch(0.865 0.127 207.078);\n    --color-cyan-400: oklch(0.789 0.154 211.53);\n    --color-cyan-500: oklch(0.715 0.143 215.221);\n    --color-cyan-600: oklch(0.609 0.126 221.723);\n    --color-cyan-700: oklch(0.52 0.105 223.128);\n    --color-cyan-800: oklch(0.45 0.085 224.283);\n    --color-cyan-900: oklch(0.398 0.07 227.392);\n    --color-cyan-950: oklch(0.302 0.056 229.695);\n    --color-sky-50: oklch(0.977 0.013 236.62);\n    --color-sky-100: oklch(0.951 0.026 236.824);\n    --color-sky-200: oklch(0.901 0.058 230.902);\n    --color-sky-300: oklch(0.828 0.111 230.318);\n    --color-sky-400: oklch(0.746 0.16 232.661);\n    --color-sky-500: oklch(0.685 0.169 237.323);\n    --color-sky-600: oklch(0.588 0.158 241.966);\n    --color-sky-700: oklch(0.5 0.134 242.749);\n    --color-sky-800: oklch(0.443 0.11 240.79);\n    --color-sky-900: oklch(0.391 0.09 240.876);\n    --color-sky-950: oklch(0.293 0.066 243.157);\n    --color-blue-50: oklch(0.97 0.014 254.604);\n    --color-blue-100: oklch(0.932 0.032 255.585);\n    --color-blue-200: oklch(0.882 0.059 254.128);\n    --color-blue-300: oklch(0.809 0.105 251.813);\n    --color-blue-400: oklch(0.707 0.165 254.624);\n    --color-blue-500: oklch(0.623 0.214 259.815);\n    --color-blue-600: oklch(0.546 0.245 262.881);\n    --color-blue-700: oklch(0.488 0.243 264.376);\n    --color-blue-800: oklch(0.424 0.199 265.638);\n    --color-blue-900: oklch(0.379 0.146 265.522);\n    --color-blue-950: oklch(0.282 0.091 267.935);\n    --color-indigo-50: oklch(0.962 0.018 272.314);\n    --color-indigo-100: oklch(0.93 0.034 272.788);\n    --color-indigo-200: oklch(0.87 0.065 274.039);\n    --color-indigo-300: oklch(0.785 0.115 274.713);\n    --color-indigo-400: oklch(0.673 0.182 276.935);\n    --color-indigo-500: oklch(0.585 0.233 277.117);\n    --color-indigo-600: oklch(0.511 0.262 276.966);\n    --color-indigo-700: oklch(0.457 0.24 277.023);\n    --color-indigo-800: oklch(0.398 0.195 277.366);\n    --color-indigo-900: oklch(0.359 0.144 278.697);\n    --color-indigo-950: oklch(0.257 0.09 281.288);\n    --color-violet-50: oklch(0.969 0.016 293.756);\n    --color-violet-100: oklch(0.943 0.029 294.588);\n    --color-violet-200: oklch(0.894 0.057 293.283);\n    --color-violet-300: oklch(0.811 0.111 293.571);\n    --color-violet-400: oklch(0.702 0.183 293.541);\n    --color-violet-500: oklch(0.606 0.25 292.717);\n    --color-violet-600: oklch(0.541 0.281 293.009);\n    --color-violet-700: oklch(0.491 0.27 292.581);\n    --color-violet-800: oklch(0.432 0.232 292.759);\n    --color-violet-900: oklch(0.38 0.189 293.745);\n    --color-violet-950: oklch(0.283 0.141 291.089);\n    --color-purple-50: oklch(0.977 0.014 308.299);\n    --color-purple-100: oklch(0.946 0.033 307.174);\n    --color-purple-200: oklch(0.902 0.063 306.703);\n    --color-purple-300: oklch(0.827 0.119 306.383);\n    --color-purple-400: oklch(0.714 0.203 305.504);\n    --color-purple-500: oklch(0.627 0.265 303.9);\n    --color-purple-600: oklch(0.558 0.288 302.321);\n    --color-purple-700: oklch(0.496 0.265 301.924);\n    --color-purple-800: oklch(0.438 0.218 303.724);\n    --color-purple-900: oklch(0.381 0.176 304.987);\n    --color-purple-950: oklch(0.291 0.149 302.717);\n    --color-fuchsia-50: oklch(0.977 0.017 320.058);\n    --color-fuchsia-100: oklch(0.952 0.037 318.852);\n    --color-fuchsia-200: oklch(0.903 0.076 319.62);\n    --color-fuchsia-300: oklch(0.833 0.145 321.434);\n    --color-fuchsia-400: oklch(0.74 0.238 322.16);\n    --color-fuchsia-500: oklch(0.667 0.295 322.15);\n    --color-fuchsia-600: oklch(0.591 0.293 322.896);\n    --color-fuchsia-700: oklch(0.518 0.253 323.949);\n    --color-fuchsia-800: oklch(0.452 0.211 324.591);\n    --color-fuchsia-900: oklch(0.401 0.17 325.612);\n    --color-fuchsia-950: oklch(0.293 0.136 325.661);\n    --color-pink-50: oklch(0.971 0.014 343.198);\n    --color-pink-100: oklch(0.948 0.028 342.258);\n    --color-pink-200: oklch(0.899 0.061 343.231);\n    --color-pink-300: oklch(0.823 0.12 346.018);\n    --color-pink-400: oklch(0.718 0.202 349.761);\n    --color-pink-500: oklch(0.656 0.241 354.308);\n    --color-pink-600: oklch(0.592 0.249 0.584);\n    --color-pink-700: oklch(0.525 0.223 3.958);\n    --color-pink-800: oklch(0.459 0.187 3.815);\n    --color-pink-900: oklch(0.408 0.153 2.432);\n    --color-pink-950: oklch(0.284 0.109 3.907);\n    --color-rose-50: oklch(0.969 0.015 12.422);\n    --color-rose-100: oklch(0.941 0.03 12.58);\n    --color-rose-200: oklch(0.892 0.058 10.001);\n    --color-rose-300: oklch(0.81 0.117 11.638);\n    --color-rose-400: oklch(0.712 0.194 13.428);\n    --color-rose-500: oklch(0.645 0.246 16.439);\n    --color-rose-600: oklch(0.586 0.253 17.585);\n    --color-rose-700: oklch(0.514 0.222 16.935);\n    --color-rose-800: oklch(0.455 0.188 13.697);\n    --color-rose-900: oklch(0.41 0.159 10.272);\n    --color-rose-950: oklch(0.271 0.105 12.094);\n    --color-slate-50: oklch(0.984 0.003 247.858);\n    --color-slate-100: oklch(0.968 0.007 247.896);\n    --color-slate-200: oklch(0.929 0.013 255.508);\n    --color-slate-300: oklch(0.869 0.022 252.894);\n    --color-slate-400: oklch(0.704 0.04 256.788);\n    --color-slate-500: oklch(0.554 0.046 257.417);\n    --color-slate-600: oklch(0.446 0.043 257.281);\n    --color-slate-700: oklch(0.372 0.044 257.287);\n    --color-slate-800: oklch(0.279 0.041 260.031);\n    --color-slate-900: oklch(0.208 0.042 265.755);\n    --color-slate-950: oklch(0.129 0.042 264.695);\n    --color-gray-50: oklch(0.985 0.002 247.839);\n    --color-gray-100: oklch(0.967 0.003 264.542);\n    --color-gray-200: oklch(0.928 0.006 264.531);\n    --color-gray-300: oklch(0.872 0.01 258.338);\n    --color-gray-400: oklch(0.707 0.022 261.325);\n    --color-gray-500: oklch(0.551 0.027 264.364);\n    --color-gray-600: oklch(0.446 0.03 256.802);\n    --color-gray-700: oklch(0.373 0.034 259.733);\n    --color-gray-800: oklch(0.278 0.033 256.848);\n    --color-gray-900: oklch(0.21 0.034 264.665);\n    --color-gray-950: oklch(0.13 0.028 261.692);\n    --color-zinc-50: oklch(0.985 0 0);\n    --color-zinc-100: oklch(0.967 0.001 286.375);\n    --color-zinc-200: oklch(0.92 0.004 286.32);\n    --color-zinc-300: oklch(0.871 0.006 286.286);\n    --color-zinc-400: oklch(0.705 0.015 286.067);\n    --color-zinc-500: oklch(0.552 0.016 285.938);\n    --color-zinc-600: oklch(0.442 0.017 285.786);\n    --color-zinc-700: oklch(0.37 0.013 285.805);\n    --color-zinc-800: oklch(0.274 0.006 286.033);\n    --color-zinc-900: oklch(0.21 0.006 285.885);\n    --color-zinc-950: oklch(0.141 0.005 285.823);\n    --color-neutral-50: oklch(0.985 0 0);\n    --color-neutral-100: oklch(0.97 0 0);\n    --color-neutral-200: oklch(0.922 0 0);\n    --color-neutral-300: oklch(0.87 0 0);\n    --color-neutral-400: oklch(0.708 0 0);\n    --color-neutral-500: oklch(0.556 0 0);\n    --color-neutral-600: oklch(0.439 0 0);\n    --color-neutral-700: oklch(0.371 0 0);\n    --color-neutral-800: oklch(0.269 0 0);\n    --color-neutral-900: oklch(0.205 0 0);\n    --color-neutral-950: oklch(0.145 0 0);\n    --color-stone-50: oklch(0.985 0.001 106.423);\n    --color-stone-100: oklch(0.97 0.001 106.424);\n    --color-stone-200: oklch(0.923 0.003 48.717);\n    --color-stone-300: oklch(0.869 0.005 56.366);\n    --color-stone-400: oklch(0.709 0.01 56.259);\n    --color-stone-500: oklch(0.553 0.013 58.071);\n    --color-stone-600: oklch(0.444 0.011 73.639);\n    --color-stone-700: oklch(0.374 0.01 67.558);\n    --color-stone-800: oklch(0.268 0.007 34.298);\n    --color-stone-900: oklch(0.216 0.006 56.043);\n    --color-stone-950: oklch(0.147 0.004 49.25);\n    --color-black: #000;\n    --color-white: #fff;\n    --spacing: 0.25rem;\n    --breakpoint-sm: 40rem;\n    --breakpoint-md: 48rem;\n    --breakpoint-lg: 64rem;\n    --breakpoint-xl: 80rem;\n    --breakpoint-2xl: 96rem;\n    --container-3xs: 16rem;\n    --container-2xs: 18rem;\n    --container-xs: 20rem;\n    --container-sm: 24rem;\n    --container-md: 28rem;\n    --container-lg: 32rem;\n    --container-xl: 36rem;\n    --container-2xl: 42rem;\n    --container-3xl: 48rem;\n    --container-4xl: 56rem;\n    --container-5xl: 64rem;\n    --container-6xl: 72rem;\n    --container-7xl: 80rem;\n    --text-xs: 0.75rem;\n    --text-xs--line-height: calc(1 / 0.75);\n    --text-sm: 0.875rem;\n    --text-sm--line-height: calc(1.25 / 0.875);\n    --text-base: 1rem;\n    --text-base--line-height: calc(1.5 / 1);\n    --text-lg: 1.125rem;\n    --text-lg--line-height: calc(1.75 / 1.125);\n    --text-xl: 1.25rem;\n    --text-xl--line-height: calc(1.75 / 1.25);\n    --text-2xl: 1.5rem;\n    --text-2xl--line-height: calc(2 / 1.5);\n    --text-3xl: 1.875rem;\n    --text-3xl--line-height: calc(2.25 / 1.875);\n    --text-4xl: 2.25rem;\n    --text-4xl--line-height: calc(2.5 / 2.25);\n    --text-5xl: 3rem;\n    --text-5xl--line-height: 1;\n    --text-6xl: 3.75rem;\n    --text-6xl--line-height: 1;\n    --text-7xl: 4.5rem;\n    --text-7xl--line-height: 1;\n    --text-8xl: 6rem;\n    --text-8xl--line-height: 1;\n    --text-9xl: 8rem;\n    --text-9xl--line-height: 1;\n    --font-weight-thin: 100;\n    --font-weight-extralight: 200;\n    --font-weight-light: 300;\n    --font-weight-normal: 400;\n    --font-weight-medium: 500;\n    --font-weight-semibold: 600;\n    --font-weight-bold: 700;\n    --font-weight-extrabold: 800;\n    --font-weight-black: 900;\n    --tracking-tighter: -0.05em;\n    --tracking-tight: -0.025em;\n    --tracking-normal: 0em;\n    --tracking-wide: 0.025em;\n    --tracking-wider: 0.05em;\n    --tracking-widest: 0.1em;\n    --leading-tight: 1.25;\n    --leading-snug: 1.375;\n    --leading-normal: 1.5;\n    --leading-relaxed: 1.625;\n    --leading-loose: 2;\n    --radius-xs: 0.125rem;\n    --radius-sm: 0.25rem;\n    --radius-md: 0.375rem;\n    --radius-lg: 0.5rem;\n    --radius-xl: 0.75rem;\n    --radius-2xl: 1rem;\n    --radius-3xl: 1.5rem;\n    --radius-4xl: 2rem;\n    --shadow-2xs: 0 1px rgb(0 0 0 / 0.05);\n    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),\n      0 2px 4px -2px rgb(0 0 0 / 0.1);\n    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),\n      0 4px 6px -4px rgb(0 0 0 / 0.1);\n    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),\n      0 8px 10px -6px rgb(0 0 0 / 0.1);\n    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n    --inset-shadow-2xs: inset 0 1px rgb(0 0 0 / 0.05);\n    --inset-shadow-xs: inset 0 1px 1px rgb(0 0 0 / 0.05);\n    --inset-shadow-sm: inset 0 2px 4px rgb(0 0 0 / 0.05);\n    --drop-shadow-xs: 0 1px 1px rgb(0 0 0 / 0.05);\n    --drop-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.15);\n    --drop-shadow-md: 0 3px 3px rgb(0 0 0 / 0.12);\n    --drop-shadow-lg: 0 4px 4px rgb(0 0 0 / 0.15);\n    --drop-shadow-xl: 0 9px 7px rgb(0 0 0 / 0.1);\n    --drop-shadow-2xl: 0 25px 25px rgb(0 0 0 / 0.15);\n    --ease-in: cubic-bezier(0.4, 0, 1, 1);\n    --ease-out: cubic-bezier(0, 0, 0.2, 1);\n    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);\n    --animate-spin: spin 1s linear infinite;\n    --animate-ping: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;\n    --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n    --animate-bounce: bounce 1s infinite;\n    --blur-xs: 4px;\n    --blur-sm: 8px;\n    --blur-md: 12px;\n    --blur-lg: 16px;\n    --blur-xl: 24px;\n    --blur-2xl: 40px;\n    --blur-3xl: 64px;\n    --perspective-dramatic: 100px;\n    --perspective-near: 300px;\n    --perspective-normal: 500px;\n    --perspective-midrange: 800px;\n    --perspective-distant: 1200px;\n    --aspect-video: 16 / 9;\n    --default-transition-duration: 150ms;\n    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    --default-font-family: var(--font-sans);\n    --default-font-feature-settings: var(--font-sans--font-feature-settings);\n    --default-font-variation-settings: var(\n      --font-sans--font-variation-settings\n    );\n    --default-mono-font-family: var(--font-mono);\n    --default-mono-font-feature-settings: var(\n      --font-mono--font-feature-settings\n    );\n    --default-mono-font-variation-settings: var(\n      --font-mono--font-variation-settings\n    );\n  }\n}\n@layer base {\n  *, ::after, ::before, ::backdrop, ::file-selector-button {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n    border: 0 solid;\n  }\n  html, :host {\n    line-height: 1.5;\n    -webkit-text-size-adjust: 100%;\n    -moz-tab-size: 4;\n      -o-tab-size: 4;\n         tab-size: 4;\n    font-family: var( --default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" );\n    font-feature-settings: var(--default-font-feature-settings, normal);\n    font-variation-settings: var( --default-font-variation-settings, normal );\n    -webkit-tap-highlight-color: transparent;\n  }\n  body {\n    line-height: inherit;\n  }\n  hr {\n    height: 0;\n    color: inherit;\n    border-top-width: 1px;\n  }\n  abbr:where([title]) {\n    -webkit-text-decoration: underline dotted;\n    text-decoration: underline dotted;\n  }\n  h1, h2, h3, h4, h5, h6 {\n    font-size: inherit;\n    font-weight: inherit;\n  }\n  a {\n    color: inherit;\n    -webkit-text-decoration: inherit;\n    text-decoration: inherit;\n  }\n  b, strong {\n    font-weight: bolder;\n  }\n  code, kbd, samp, pre {\n    font-family: var( --default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace );\n    font-feature-settings: var( --default-mono-font-feature-settings, normal );\n    font-variation-settings: var( --default-mono-font-variation-settings, normal );\n    font-size: 1em;\n  }\n  small {\n    font-size: 80%;\n  }\n  sub, sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n  sub {\n    bottom: -0.25em;\n  }\n  sup {\n    top: -0.5em;\n  }\n  table {\n    text-indent: 0;\n    border-color: inherit;\n    border-collapse: collapse;\n  }\n  :-moz-focusring {\n    outline: auto;\n  }\n  progress {\n    vertical-align: baseline;\n  }\n  summary {\n    display: list-item;\n  }\n  ol, ul, menu {\n    list-style: none;\n  }\n  img, svg, video, canvas, audio, iframe, embed, object {\n    display: block;\n    vertical-align: middle;\n  }\n  img, video {\n    max-width: 100%;\n    height: auto;\n  }\n  button, input, select, optgroup, textarea, ::file-selector-button {\n    font: inherit;\n    font-feature-settings: inherit;\n    font-variation-settings: inherit;\n    letter-spacing: inherit;\n    color: inherit;\n    border-radius: 0;\n    background-color: transparent;\n    opacity: 1;\n  }\n  :where(select:is([multiple], [size])) optgroup {\n    font-weight: bolder;\n  }\n  :where(select:is([multiple], [size])) optgroup option {\n    padding-inline-start: 20px;\n  }\n  ::file-selector-button {\n    margin-inline-end: 4px;\n  }\n  ::-moz-placeholder {\n    opacity: 1;\n    color: color-mix(in oklab, currentColor 50%, transparent);\n  }\n  ::placeholder {\n    opacity: 1;\n    color: color-mix(in oklab, currentColor 50%, transparent);\n  }\n  textarea {\n    resize: vertical;\n  }\n  ::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n  ::-webkit-date-and-time-value {\n    min-height: 1lh;\n    text-align: inherit;\n  }\n  ::-webkit-datetime-edit {\n    display: inline-flex;\n  }\n  ::-webkit-datetime-edit-fields-wrapper {\n    padding: 0;\n  }\n  ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {\n    padding-block: 0;\n  }\n  :-moz-ui-invalid {\n    box-shadow: none;\n  }\n  button, input:where([type="button"], [type="reset"], [type="submit"]), ::file-selector-button {\n    -webkit-appearance: button;\n       -moz-appearance: button;\n            appearance: button;\n  }\n  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {\n    height: auto;\n  }\n  [hidden]:where(:not([hidden="until-found"])) {\n    display: none !important;\n  }\n}\n@layer utilities {\n  .mx-auto {\n    margin-inline: auto;\n  }\n  .my-4 {\n    margin-block: calc(var(--spacing) * 4);\n  }\n  .-mt-2 {\n    margin-top: calc(var(--spacing) * -2);\n  }\n  .flex {\n    display: flex;\n  }\n  .h-10 {\n    height: calc(var(--spacing) * 10);\n  }\n  .h-full {\n    height: 100%;\n  }\n  .w-10 {\n    width: calc(var(--spacing) * 10);\n  }\n  .w-auto {\n    width: auto;\n  }\n  .transform {\n    transform: var(--tw-rotate-x) var(--tw-rotate-y) var(--tw-rotate-z) var(--tw-skew-x) var(--tw-skew-y);\n  }\n  .flex-col {\n    flex-direction: column;\n  }\n  .items-center {\n    align-items: center;\n  }\n  .justify-center {\n    justify-content: center;\n  }\n  .space-x-1 {\n    :where(& > :not(:last-child)) {\n      --tw-space-x-reverse: 0;\n      margin-inline-start: calc(calc(var(--spacing) * 1) * var(--tw-space-x-reverse));\n      margin-inline-end: calc(calc(var(--spacing) * 1) * calc(1 - var(--tw-space-x-reverse)));\n    }\n  }\n  .rounded-full {\n    border-radius: calc(infinity * 1px);\n  }\n  .border {\n    border-style: var(--tw-border-style);\n    border-width: 1px;\n  }\n  .border-4 {\n    border-style: var(--tw-border-style);\n    border-width: 4px;\n  }\n  .border-gray-100\\/70 {\n    border-color: color-mix(in oklab, var(--color-gray-100) 70%, transparent);\n  }\n  .border-gray-200 {\n    border-color: var(--color-gray-200);\n  }\n  .border-white {\n    border-color: var(--color-white);\n  }\n  .bg-white {\n    background-color: var(--color-white);\n  }\n  .p-1 {\n    padding: calc(var(--spacing) * 1);\n  }\n  .text-gray-500 {\n    color: var(--color-gray-500);\n  }\n  .shadow-lg {\n    --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1));\n    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n  }\n  .filter {\n    filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);\n  }\n  .transition {\n    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter;\n    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));\n    transition-duration: var(--tw-duration, var(--default-transition-duration));\n  }\n}\n@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n@keyframes ping {\n  75%, 100% {\n    transform: scale(2);\n    opacity: 0;\n  }\n}\n@keyframes pulse {\n  50% {\n    opacity: 0.5;\n  }\n}\n@keyframes bounce {\n  0%, 100% {\n    transform: translateY(-25%);\n    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);\n  }\n  50% {\n    transform: none;\n    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);\n  }\n}\n@property --tw-rotate-x {\n  syntax: "*";\n  inherits: false;\n  initial-value: rotateX(0);\n}\n@property --tw-rotate-y {\n  syntax: "*";\n  inherits: false;\n  initial-value: rotateY(0);\n}\n@property --tw-rotate-z {\n  syntax: "*";\n  inherits: false;\n  initial-value: rotateZ(0);\n}\n@property --tw-skew-x {\n  syntax: "*";\n  inherits: false;\n  initial-value: skewX(0);\n}\n@property --tw-skew-y {\n  syntax: "*";\n  inherits: false;\n  initial-value: skewY(0);\n}\n@property --tw-space-x-reverse {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-border-style {\n  syntax: "*";\n  inherits: false;\n  initial-value: solid;\n}\n@property --tw-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-shadow-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-inset-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-shadow-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-ring-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-ring-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-ring-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-inset-ring-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-ring-inset {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-ring-offset-width {\n  syntax: "<length>";\n  inherits: false;\n  initial-value: 0px;\n}\n@property --tw-ring-offset-color {\n  syntax: "*";\n  inherits: false;\n  initial-value: #fff;\n}\n@property --tw-ring-offset-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-blur {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-brightness {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-contrast {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-grayscale {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-hue-rotate {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-invert {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-opacity {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-saturate {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-sepia {\n  syntax: "*";\n  inherits: false;\n}\n'),
            this.shadowdom.appendChild(e),
            D(M(Ve, { config: this.config.properties, dom: this.shadowdom, store: this.store }), this.shadowdom);
        }),
        (this.off = () => {}),
        (this.on = e => {}),
        (this.trigger = (e, n) => {
          (this.config.properties[e] = n), this.render();
        }),
        (this.getResponse = () => {
          var e;
          const n = this.store.getState(),
            t = [];
          null === (e = this.shadowdom) ||
            void 0 === e ||
            e.querySelectorAll('rect[data-name]').forEach(e => {
              t.push({ id: e.getAttribute('data-name'), surface: this.extractNumber(e.getAttribute('data-name')) });
            });
          const o = this.sum(t, e => e.surface),
            r = [];
          n.vlakken.forEach(({ color: e, id: n }) => {
            const t = this.extractNumber(n),
              a = r.find(n => n.color.trim().toLowerCase() === e.trim().toLowerCase()),
              l = 0 !== o ? (t / o) * 100 : 0;
            a ? (a.percentage = a.percentage + l) : r.push({ surface: t, color: e, percentage: l });
          });
          const a = this.sort(
            r.map(({ color: e, percentage: n }) => ({ color: e.trim().toLowerCase(), percentage: n })),
            e => `${e.color}, percentage: ${this.round(e.percentage, 2)}`
          );
          if (a.find(e => e.percentage)) return { base: { string: JSON.stringify(a) } };
        }),
        (this.resetResponse = () => {
          this.store.unsubscribeAll(), this.store.reset(), this.render();
        }),
        (this.setResponse = e => {
          var n, t;
          if (e)
            try {
              const o = JSON.parse(
                  null === (n = null == e ? void 0 : e.base) || void 0 === n ? void 0 : n.string.toString()
                ),
                r = [];
              null === (t = this.shadowdom) ||
                void 0 === t ||
                t.querySelectorAll('rect[data-name]').forEach(e => {
                  r.push({ id: e.getAttribute('data-name'), surface: this.extractNumber(e.getAttribute('data-name')) });
                });
              const a = this.sort(r, e => e.surface, !0),
                l = a.map(({ id: e, surface: n }) => ({ color: '', id: e, surface: n })),
                i = this.sum(r, e => e.surface);
              let s = l.map(() => ({
                surfaceToFill: 0,
                vlakken: l.map(({ id: e }) => ({ id: e, color: '', surface: this.extractNumber(e) }))
              }));
              for (const e of o) {
                const n = i * (e.percentage / 100);
                s = this.getPossibleSolutionsForColor(e.color.trim().toLowerCase(), n, s);
              }
              this.resetResponse(), s.length > 0 && this.store.restoreState(s[0], []);
            } catch (n) {
              console.error(`couldn't restore state: ${e}`), this.resetResponse();
            }
        }),
        (this.oncompleted = () => {
          this.store.unsubscribeAll();
        }),
        (this.getState = () => JSON.stringify({ state: this.store.getState(), log: this.store.getActions() })),
        s && s.register(this);
    }
    getPossibleSolutionsForColor(e, n, t) {
      e = e.trim().toLowerCase();
      const o = [];
      for (const r of t) {
        const t = Object.assign(Object.assign({}, r), { surfaceToFill: n });
        for (const { surface: o, id: a } of r.vlakken.filter(
          e => e.surface <= t.surfaceToFill && !e.color && e.surface <= n
        )) {
          const n = t.vlakken.find(e => !e.color && e.id === a && e.surface <= t.surfaceToFill);
          n && ((n.color = e), (t.surfaceToFill -= o));
        }
        o.push(t);
      }
      return o.filter(n => n.vlakken.find(n => n.color === e) && 0 === n.surfaceToFill).map(e => e);
    }
    extractNumber(e) {
      let n =
        null == e
          ? void 0
          : e.split('').map(e => {
              if ('number' == typeof +e && !isNaN(+e)) return +e;
            });
      return n ? +n.join('') : 0;
    }
    sort(e, n, t = !1) {
      return (
        e.sort((e, o) => {
          const r = n(e),
            a = n(o);
          return r < a ? (t ? 1 : -1) : r > a ? (t ? -1 : 1) : 0;
        }),
        e
      );
    }
    sum(e, n) {
      return e.map(e => n(e)).reduce((e, n) => e + n, 0);
    }
    round(e, n) {
      return parseFloat(parseFloat(e.toString()).toFixed(n));
    }
  })();
  return Ze;
});
