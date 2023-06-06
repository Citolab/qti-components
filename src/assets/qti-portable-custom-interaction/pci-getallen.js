(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('qtiCustomInteractionContext')) :
  typeof define === 'function' && define.amd ? define(['qtiCustomInteractionContext'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["@citolab/pci-getallen"] = factory(global.ctx));
})(this, (function (ctx) { 'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var ctx__namespace = /*#__PURE__*/_interopNamespace(ctx);

  var n,l$1,u$1,t$1,r$1,o$2,e$2={},c$1=[],s$1=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a$1(n,l){for(var u in l)n[u]=l[u];return n}function h(n){var l=n.parentNode;l&&l.removeChild(n);}function v$1(l,u,i){var t,r,o,f={};for(o in u)"key"==o?t=u[o]:"ref"==o?r=u[o]:f[o]=u[o];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):i),"function"==typeof l&&null!=l.defaultProps)for(o in l.defaultProps)void 0===f[o]&&(f[o]=l.defaultProps[o]);return y$1(l,f,t,r,null)}function y$1(n,i,t,r,o){var f={type:n,props:i,key:t,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++u$1:o};return null==o&&null!=l$1.vnode&&l$1.vnode(f),f}function d$1(n){return n.children}function _(n,l){this.props=n,this.context=l;}function k$1(n,l){if(null==l)return n.__?k$1(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?k$1(n):null}function b$1(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return b$1(n)}}function m$1(n){(!n.__d&&(n.__d=!0)&&t$1.push(n)&&!g$1.__r++||o$2!==l$1.debounceRendering)&&((o$2=l$1.debounceRendering)||r$1)(g$1);}function g$1(){for(var n;g$1.__r=t$1.length;)n=t$1.sort(function(n,l){return n.__v.__b-l.__v.__b}),t$1=[],n.some(function(n){var l,u,i,t,r,o;n.__d&&(r=(t=(l=n).__v).__e,(o=l.__P)&&(u=[],(i=a$1({},t)).__v=t.__v+1,j$1(o,t,i,l.__n,void 0!==o.ownerSVGElement,null!=t.__h?[r]:null,u,null==r?k$1(t):r,t.__h),z(u,t),t.__e!=r&&b$1(t)));});}function w$1(n,l,u,i,t,r,o,f,s,a){var h,v,p,_,b,m,g,w=i&&i.__k||c$1,A=w.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(_=u.__k[h]=null==(_=l[h])||"boolean"==typeof _?null:"string"==typeof _||"number"==typeof _||"bigint"==typeof _?y$1(null,_,null,null,_):Array.isArray(_)?y$1(d$1,{children:_},null,null,null):_.__b>0?y$1(_.type,_.props,_.key,null,_.__v):_)){if(_.__=u,_.__b=u.__b+1,null===(p=w[h])||p&&_.key==p.key&&_.type===p.type)w[h]=void 0;else for(v=0;v<A;v++){if((p=w[v])&&_.key==p.key&&_.type===p.type){w[v]=void 0;break}p=null;}j$1(n,_,p=p||e$2,t,r,o,f,s,a),b=_.__e,(v=_.ref)&&p.ref!=v&&(g||(g=[]),p.ref&&g.push(p.ref,null,_),g.push(v,_.__c||b,_)),null!=b?(null==m&&(m=b),"function"==typeof _.type&&_.__k===p.__k?_.__d=s=x$1(_,s,n):s=P(n,_,p,w,b,s),"function"==typeof u.type&&(u.__d=s)):s&&p.__e==s&&s.parentNode!=n&&(s=k$1(p));}for(u.__e=m,h=A;h--;)null!=w[h]&&("function"==typeof u.type&&null!=w[h].__e&&w[h].__e==u.__d&&(u.__d=k$1(i,h+1)),N(w[h],w[h]));if(g)for(h=0;h<g.length;h++)M(g[h],g[++h],g[++h]);}function x$1(n,l,u){for(var i,t=n.__k,r=0;t&&r<t.length;r++)(i=t[r])&&(i.__=n,l="function"==typeof i.type?x$1(i,l,u):P(u,i,i,t,i.__e,l));return l}function P(n,l,u,i,t,r){var o,f,e;if(void 0!==l.__d)o=l.__d,l.__d=void 0;else if(null==u||t!=r||null==t.parentNode)n:if(null==r||r.parentNode!==n)n.appendChild(t),o=null;else {for(f=r,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,r),o=r;}return void 0!==o?o:t.nextSibling}function C(n,l,u,i,t){var r;for(r in u)"children"===r||"key"===r||r in l||H(n,r,null,u[r],i);for(r in l)t&&"function"!=typeof l[r]||"children"===r||"key"===r||"value"===r||"checked"===r||u[r]===l[r]||H(n,r,l[r],u[r],i);}function $(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s$1.test(l)?u:u+"px";}function H(n,l,u,i,t){var r;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else {if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||$(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||$(n.style,l,u[l]);}else if("o"===l[0]&&"n"===l[1])r=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+r]=u,u?i||n.addEventListener(l,r?T:I,r):n.removeEventListener(l,r?T:I,r);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l));}}function I(n){this.l[n.type+!1](l$1.event?l$1.event(n):n);}function T(n){this.l[n.type+!0](l$1.event?l$1.event(n):n);}function j$1(n,u,i,t,r,o,f,e,c){var s,h,v,y,p,k,b,m,g,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,o=[e]),(s=l$1.__b)&&s(u);try{n:if("function"==typeof P){if(m=u.props,g=(s=P.contextType)&&t[s.__c],x=s?g?g.props.value:s.__:t,i.__c?b=(h=u.__c=i.__c).__=h.__E:("prototype"in P&&P.prototype.render?u.__c=h=new P(m,x):(u.__c=h=new _(m,x),h.constructor=P,h.render=O),g&&g.sub(h),h.props=m,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=P.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=a$1({},h.__s)),a$1(h.__s,P.getDerivedStateFromProps(m,h.__s))),y=h.props,p=h.state,v)null==P.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else {if(null==P.getDerivedStateFromProps&&m!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(m,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(m,h.__s,x)||u.__v===i.__v){h.props=m,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u);}),h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(m,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,p,k);});}h.context=x,h.props=m,h.state=h.__s,(s=l$1.__r)&&s(u),h.__d=!1,h.__v=u,h.__P=n,s=h.render(h.props,h.state,h.context),h.state=h.__s,null!=h.getChildContext&&(t=a$1(a$1({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(k=h.getSnapshotBeforeUpdate(y,p)),A=null!=s&&s.type===d$1&&null==s.key?s.props.children:s,w$1(n,Array.isArray(A)?A:[A],u,i,t,r,o,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),b&&(h.__E=h.__=null),h.__e=!1;}else null==o&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=L(i.__e,u,i,t,r,o,f,c);(s=l$1.diffed)&&s(u);}catch(n){u.__v=null,(c||null!=o)&&(u.__e=e,u.__h=!!c,o[o.indexOf(e)]=null),l$1.__e(n,u,i);}}function z(n,u){l$1.__c&&l$1.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u);});}catch(n){l$1.__e(n,u.__v);}});}function L(l,u,i,t,r,o,f,c){var s,a,v,y=i.props,p=u.props,d=u.type,_=0;if("svg"===d&&(r=!0),null!=o)for(;_<o.length;_++)if((s=o[_])&&"setAttribute"in s==!!d&&(d?s.localName===d:3===s.nodeType)){l=s,o[_]=null;break}if(null==l){if(null===d)return document.createTextNode(p);l=r?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,p.is&&p),o=null,c=!1;}if(null===d)y===p||c&&l.data===p||(l.data=p);else {if(o=o&&n.call(l.childNodes),a=(y=i.props||e$2).dangerouslySetInnerHTML,v=p.dangerouslySetInnerHTML,!c){if(null!=o)for(y={},_=0;_<l.attributes.length;_++)y[l.attributes[_].name]=l.attributes[_].value;(v||a)&&(v&&(a&&v.__html==a.__html||v.__html===l.innerHTML)||(l.innerHTML=v&&v.__html||""));}if(C(l,p,y,r,c),v)u.__k=[];else if(_=u.props.children,w$1(l,Array.isArray(_)?_:[_],u,i,t,r&&"foreignObject"!==d,o,f,o?o[0]:i.__k&&k$1(i,0),c),null!=o)for(_=o.length;_--;)null!=o[_]&&h(o[_]);c||("value"in p&&void 0!==(_=p.value)&&(_!==y.value||_!==l.value||"progress"===d&&!_)&&H(l,"value",_,y.value,!1),"checked"in p&&void 0!==(_=p.checked)&&_!==l.checked&&H(l,"checked",_,y.checked,!1));}return l}function M(n,u,i){try{"function"==typeof n?n(u):n.current=u;}catch(n){l$1.__e(n,i);}}function N(n,u,i){var t,r;if(l$1.unmount&&l$1.unmount(n),(t=n.ref)&&(t.current&&t.current!==n.__e||M(t,null,u)),null!=(t=n.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount();}catch(n){l$1.__e(n,u);}t.base=t.__P=null;}if(t=n.__k)for(r=0;r<t.length;r++)t[r]&&N(t[r],u,"function"!=typeof n.type);i||null==n.__e||h(n.__e),n.__e=n.__d=void 0;}function O(n,l,u){return this.constructor(n,u)}function S(u,i,t){var r,o,f;l$1.__&&l$1.__(u,i),o=(r="function"==typeof t)?null:t&&t.__k||i.__k,f=[],j$1(i,u=(!r&&t||i).__k=v$1(d$1,null,[u]),o||e$2,e$2,void 0!==i.ownerSVGElement,!r&&t?[t]:o?null:i.firstChild?n.call(i.childNodes):null,f,!r&&t?t:o?o.__e:i.firstChild,r),z(f,u);}n=c$1.slice,l$1={__e:function(n,l){for(var u,i,t;l=l.__;)if((u=l.__c)&&!u.__)try{if((i=u.constructor)&&null!=i.getDerivedStateFromError&&(u.setState(i.getDerivedStateFromError(n)),t=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),t=u.__d),t)return u.__E=u}catch(l){n=l;}throw n}},u$1=0,_.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a$1({},this.state),"function"==typeof n&&(n=n(a$1({},u),this.props)),n&&a$1(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),m$1(this));},_.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),m$1(this));},_.prototype.render=d$1,t$1=[],r$1="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g$1.__r=0;

  var o$1=0;function e$1(_,e,n,t,f){var l,s,u={};for(s in e)"ref"==s?l=e[s]:u[s]=e[s];var a={type:_,props:u,key:n,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:--o$1,__source:t,__self:f};if("function"==typeof _&&(l=_.defaultProps))for(s in l)void 0===u[s]&&(u[s]=l[s]);return l$1.vnode&&l$1.vnode(a),a}

  var t,u,r,o=0,i=[],c=l$1.__b,f=l$1.__r,e=l$1.diffed,a=l$1.__c,v=l$1.unmount;function m(t,r){l$1.__h&&l$1.__h(u,t,o||r),o=0;var i=u.__H||(u.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function l(n){return o=1,p(w,n)}function p(n,r,o){var i=m(t++,2);return i.t=n,i.__c||(i.__=[o?o(r):w(void 0,r),function(n){var t=i.t(i.__[0],n);i.__[0]!==t&&(i.__=[t,i.__[1]],i.__c.setState({}));}],i.__c=u),i.__}function y(r,o){var i=m(t++,3);!l$1.__s&&k(i.__H,o)&&(i.__=r,i.__H=o,u.__H.__h.push(i));}function s(n){return o=5,d(function(){return {current:n}},[])}function d(n,u){var r=m(t++,7);return k(r.__H,u)&&(r.__=n(),r.__H=u,r.__h=n),r.__}function x(){var t;for(i.sort(function(n,t){return n.__v.__b-t.__v.__b});t=i.pop();)if(t.__P)try{t.__H.__h.forEach(g),t.__H.__h.forEach(j),t.__H.__h=[];}catch(u){t.__H.__h=[],l$1.__e(u,t.__v);}}l$1.__b=function(n){u=null,c&&c(n);},l$1.__r=function(n){f&&f(n),t=0;var r=(u=n.__c).__H;r&&(r.__h.forEach(g),r.__h.forEach(j),r.__h=[]);},l$1.diffed=function(t){e&&e(t);var o=t.__c;o&&o.__H&&o.__H.__h.length&&(1!==i.push(o)&&r===l$1.requestAnimationFrame||((r=l$1.requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),b&&cancelAnimationFrame(t),setTimeout(n);},r=setTimeout(u,100);b&&(t=requestAnimationFrame(u));})(x)),u=null;},l$1.__c=function(t,u){u.some(function(t){try{t.__h.forEach(g),t.__h=t.__h.filter(function(n){return !n.__||j(n)});}catch(r){u.some(function(n){n.__h&&(n.__h=[]);}),u=[],l$1.__e(r,t.__v);}}),a&&a(t,u);},l$1.unmount=function(t){v&&v(t);var u,r=t.__c;r&&r.__H&&(r.__H.__.forEach(function(n){try{g(n);}catch(n){u=n;}}),u&&l$1.__e(u,r.__v));};var b="function"==typeof requestAnimationFrame;function g(n){var t=u,r=n.__c;"function"==typeof r&&(n.__c=void 0,r()),u=t;}function j(n){var t=u;n.__c=n.__(),u=t;}function k(n,t){return !n||n.length!==t.length||t.some(function(t,u){return t!==n[u]})}function w(n,t){return "function"==typeof t?t(n):t}

  var symbols = {
    '^': {
      infix: '_POW'
    },
    '*': {
      infix: '_MUL'
    },
    '/': {
      infix: '_DIV'
    },
    '%': {
      infix: '_MOD'
    },
    '+': {
      infix: '_ADD',
      prefix: '_POS'
    },
    '-': {
      infix: '_SUB',
      prefix: '_NEG'
    }
  };

  var factorial = function (x) { return x >= 0 ? x < 2 ? 1 : x * factorial(x - 1) : NaN; };

  var operators = {
    '_POW': {
      name: 'Power',
      precedence: 4,
      associativity: 'right',
      method: function (x, y) { return Math.pow( x, y ); }
    },
    '_POS': {
      name: 'Positive',
      precedence: 3,
      associativity: 'right',
      method: function (x) { return x; }
    },
    '_NEG': {
      name: 'Negative',
      precedence: 3,
      associativity: 'right',
      method: function (x) { return -x; }
    },
    '_MUL': {
      name: 'Multiply',
      precedence: 2,
      associativity: 'left',
      method: function (x, y) { return x * y; }
    },
    '_DIV': {
      name: 'Divide',
      precedence: 2,
      associativity: 'left',
      method: function (x, y) { return x / y; }
    },
    '_MOD': {
      name: 'Modulo',
      precedence: 2,
      associativity: 'left',
      method: function (x, y) { return x % y; }
    },
    '_ADD': {
      name: 'Add',
      precedence: 1,
      associativity: 'left',
      method: function (x, y) { return x + y; }
    },
    '_SUB': {
      name: 'Subtract',
      precedence: 1,
      associativity: 'left',
      method: function (x, y) { return x - y; }
    }
  };
  var constants = {
    'E': Math.E,
    'LN2': Math.LN2,
    'LN10': Math.LN10,
    'LOG2E': Math.LOG2E,
    'LOG10E': Math.LOG10E,
    'PHI': (1 + Math.sqrt(5)) / 2,
    'PI': Math.PI,
    'SQRT1_2': Math.SQRT1_2,
    'SQRT2': Math.SQRT2,
    'TAU': 2 * Math.PI
  };
  var methods = {
    'ABS': function (x) { return Math.abs(x); },
    'ACOS': function (x) { return Math.acos(x); },
    'ACOSH': function (x) { return Math.acosh(x); },
    'ADD': function (x, y) { return x + y; },
    'ASIN': function (x) { return Math.asin(x); },
    'ASINH': function (x) { return Math.asinh(x); },
    'ATAN': function (x) { return Math.atan(x); },
    'ATANH': function (x) { return Math.atanh(x); },
    'ATAN2': function (y, x) { return Math.atan2(y, x); },
    'CBRT': function (x) { return Math.cbrt(x); },
    'CEIL': function (x) { return Math.ceil(x); },
    'COS': function (x) { return Math.cos(x); },
    'COSH': function (x) { return Math.cosh(x); },
    'DIVIDE': function (x, y) { return x / y; },
    'EXP': function (x) { return Math.exp(x); },
    'EXPM1': function (x) { return Math.expm1(x); },
    'FACTORIAL': factorial,
    'FLOOR': function (x) { return Math.floor(x); },
    'HYPOT': function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return Math.hypot.apply(Math, args);
  },
    'LOG': function (x) { return Math.log(x); },
    'LOG1P': function (x) { return Math.log1p(x); },
    'LOG10': function (x) { return Math.log10(x); },
    'LOG2': function (x) { return Math.log2(x); },
    'MAX': function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return Math.max.apply(Math, args);
  },
    'MEAN': function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return [].concat( args ).reduce(function (sum, x) {
      return sum + x;
    }, 0) / [].concat( args ).length;
  },
    'MIN': function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return Math.min.apply(Math, args);
  },
    'MOD': function (x, y) { return x % y; },
    'MULTIPLY': function (x, y) { return x * y; },
    'POW': function (x, y) { return Math.pow( x, y ); },
    'SIN': function (x) { return Math.sin(x); },
    'SINH': function (x) { return Math.sinh(x); },
    'SQRT': function (x) { return Math.sqrt(x); },
    'SUBTRACT': function (x, y) { return x - y; },
    'SUM': function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return [].concat( args ).reduce(function (sum, x) {
      sum += x;
      return sum;
    }, 0);
  },
    'TAN': function (x) { return Math.tan(x); },
    'TANH': function (x) { return Math.tanh(x); }
  };

  var isSymbol = function (token) { return Object.keys(symbols).includes(token); };

  var isOperator = function (token) { return Object.keys(operators).includes(token); };

  var isMethod = function (token) { return Object.keys(methods).includes(token); };

  var isConstant = function (token) { return Object.keys(constants).includes(token); };

  var isNumber = function (token) { return /(\d+\.\d*)|(\d*\.\d+)|(\d+)/.test(token); };

  var isOpenParenthesis = function (token) { return /\(/.test(token); };

  var isCloseParenthesis = function (token) { return /\)/.test(token); };

  var isComma = function (token) { return /,/.test(token); };

  var isWhitespace = function (token) { return /\s/.test(token); };

  var round = function (number, precision) {
    var modifier = Math.pow( 10, precision );
    return !modifier ? Math.round(number) : Math.round(number * modifier) / modifier;
  };

  function topOperatorHasPrecedence(operatorStack, currentOperatorName) {
    if (!operatorStack.length) { return false; }
    var topToken = operatorStack[operatorStack.length - 1];
    if (!isOperator(topToken)) { return false; }
    var topOperator = operators[topToken];
    var currentOperator = operators[currentOperatorName];
    if (currentOperator.method.length === 1 && topOperator.method.length > 1) { return false; }
    if (topOperator.precedence > currentOperator.precedence) { return true; }
    return topOperator.precedence === currentOperator.precedence && topOperator.associativity === 'left';
  }

  function determineOperator(token, previousToken) {
    if (previousToken === undefined || isOpenParenthesis(previousToken) || isSymbol(previousToken) || isComma(previousToken)) {
      return symbols[token].prefix;
    }

    if (isCloseParenthesis(previousToken) || isNumber(previousToken) || isConstant(previousToken)) {
      return symbols[token].infix;
    }

    return undefined;
  }
  /**
   * Takes a string and parses out the array of tokens in infix notation.
   *
   * @param {string} expression The string.
   *
   * @throws {Error} No input.
   *
   * @returns {string[]} The array of tokens in infix notation.
   */


  function parse(expression) {
    if (!expression.length) {
      throw Error('No input');
    }

    var pattern = /(\d+\.\d*)|(\d*\.\d+)|(\d+)|([a-zA-Z0-9_]+)|(.)/g;
    var infixExpression = (expression.match(pattern) || []).filter(function (token) { return !isWhitespace(token); }).map(function (token) { return token.toUpperCase(); });
    return infixExpression;
  }
  /**
   * Takes an array of tokens in infix notation and converts it to postfix notation.
   *
   * @param {string[]} infixExpression The array of tokens in infix notation.
   *
   * @throws {Error} No valid tokens.
   * @throws {Error} Misused operator: <token>.
   * @throws {Error} Mismatched parentheses.
   * @throws {Error} Invalid token: <token>.
   * @throws {Error} Insufficient arguments for method: <token>.
   *
   * @returns {string[]} The array of tokens in postfix notation.
   */


  function convert(infixExpression) {
    if (!infixExpression.length) {
      throw Error('No valid tokens');
    }

    var operatorStack = [];
    var arityStack = [];
    var postfixExpression = [];
    var methodIsNewlyDeclared = false;
    infixExpression.forEach(function (token, index) {
      if (methodIsNewlyDeclared && !isOpenParenthesis(token)) {
        throw Error(("Misused method: " + (operatorStack[operatorStack.length - 1])));
      }

      methodIsNewlyDeclared = false;

      if (isMethod(token)) {
        methodIsNewlyDeclared = true;
        operatorStack.push(token);
        arityStack.push(1);
        return;
      }

      if (isConstant(token)) {
        postfixExpression.push(token);
        return;
      }

      if (isNumber(token)) {
        postfixExpression.push(parseFloat(token));
        return;
      }

      if (isSymbol(token)) {
        var operatorName = determineOperator(token, infixExpression[index - 1]);
        var operator = operators[operatorName];

        if (operator === undefined) {
          throw Error(("Misused operator: " + token));
        }

        while (topOperatorHasPrecedence(operatorStack, operatorName)) {
          postfixExpression.push(operatorStack.pop());
        }

        operatorStack.push(operatorName);
        return;
      }

      if (isOpenParenthesis(token)) {
        operatorStack.push(token);
        return;
      }

      if (isComma(token)) {
        arityStack[arityStack.length - 1] += 1;

        while (!isOpenParenthesis(operatorStack[operatorStack.length - 1])) {
          if (!operatorStack.length) {
            throw Error('Invalid token: ,');
          }

          postfixExpression.push(operatorStack.pop());
        }

        return;
      }

      if (isCloseParenthesis(token)) {
        while (!isOpenParenthesis(operatorStack[operatorStack.length - 1])) {
          if (!operatorStack.length) {
            throw Error('Mismatched parentheses');
          }

          postfixExpression.push(operatorStack.pop());
        }

        operatorStack.pop();

        if (isMethod(operatorStack[operatorStack.length - 1])) {
          var method = operatorStack[operatorStack.length - 1];
          var argumentCount = arityStack.pop();

          if (argumentCount < methods[method].length) {
            throw Error(("Insufficient arguments for method: " + method));
          }

          postfixExpression.push(((operatorStack.pop()) + ":" + argumentCount));
        }

        return;
      }

      throw Error(("Invalid token: " + token));
    });

    while (operatorStack.length) {
      var operator = operatorStack[operatorStack.length - 1];

      if (isOpenParenthesis(operator) || isCloseParenthesis(operator)) {
        throw Error('Mismatched parentheses');
      }

      postfixExpression.push(operatorStack.pop());
    }

    return postfixExpression;
  }
  /**
   * Takes an array of tokens in postfix notation and resolves the result.
   *
   * @param {string[]} postfixExpression The array of tokens in postfix notation.
   *
   * @throws {Error} No operations.
   * @throws {Error} Insufficient arguments for method: <token>.
   * @throws {Error} Insufficient operands for operator: <token>.
   * @throws {Error} Division by zero.
   * @throws {Error} Insufficient operators.
   *
   * @returns {number} The result.
   */


  function resolve(postfixExpression) {
    if (!postfixExpression.length) {
      throw Error('No operations');
    }

    var evaluationStack = [];
    postfixExpression.forEach(function (token) {
      if (isMethod(String(token).split(':')[0])) {
        var ref = token.split(':');
        var methodName = ref[0];
        var argumentCount = ref[1];
        var method = methods[methodName];
        var isVariadic = method.length === 0;
        var requiredArguments = isVariadic ? 1 : method.length;

        if (evaluationStack.length < requiredArguments) {
          throw Error(("Insufficient arguments for method: " + token));
        }

        var result$1 = method.apply(void 0, evaluationStack.splice(isVariadic ? -argumentCount : -method.length));
        evaluationStack.push(result$1);
        return;
      }

      if (isConstant(token)) {
        evaluationStack.push(constants[token]);
        return;
      }

      if (isNumber(token)) {
        evaluationStack.push(token);
        return;
      }

      var operator = operators[token];

      if (evaluationStack.length < operator.method.length) {
        throw Error(("Insufficient operands for operator: " + (operator.name)));
      }

      if (token === '_DIV' && evaluationStack[evaluationStack.length - 1] === 0) {
        throw Error('Division by zero');
      }

      var result = operator.method.apply(operator, evaluationStack.splice(-operator.method.length));
      evaluationStack.push(result);
    });

    if (evaluationStack.length > 1) {
      throw Error('Insufficient operators');
    }

    var reduction = evaluationStack[0];
    var result = round(reduction, 8);
    return result;
  }
  /**
   * Takes a string and evaluates the result.
   *
   * @param {string} expression The string.
   *
   * @throws {Error} No input.
   * @throws {Error} No valid tokens.
   * @throws {Error} Misused operator: <token>.
   * @throws {Error} Mismatched parentheses.
   * @throws {Error} Invalid token: <token>.
   * @throws {Error} No operations.
   * @throws {Error} Insufficient arguments for method: <token>.
   * @throws {Error} Insufficient operands for operator: <token>.
   * @throws {Error} Division by zero.
   * @throws {Error} Insufficient operators.
   *
   * @returns {number} The result.
   */


  function index$1 (expression) {
    try {
      var infixExpression = parse(expression);
      var postfixExpression = convert(infixExpression);
      var result = resolve(postfixExpression);
      return result;
    } catch (error) {
      throw error;
    }
  }

  const Apple = (props) => (e$1("svg", Object.assign({}, props, { version: "1.1", viewBox: "0 0 494.16 588.58", xmlns: "http://www.w3.org/2000/svg" }, { children: [e$1("path", { d: "m211.07 582.29c4.8941-5.4624 6.0939-8.4188 8.0692-19.883 1.7802-10.331 4.1893-15.948 8.1906-19.095 3.2778-2.5783 3.8935-2.594 6.3261-0.16144 1.6566 1.6566 2.1032 1.7281 3.1224 0.5 1.7173-2.0692 4.5597-1.7624 6.895 0.74414 1.1156 1.1975 2.1456 1.985 2.289 1.75 0.14331-0.23498 0.75879-1.3272 1.3677-2.4272 4.04-7.2979 12.364 2.6406 15.019 17.931 1.9631 11.308 3.1217 14.436 7.2251 19.507l3.5914 4.4384-4.4142-2.4384c-6.0153-3.3228-15.003-12.33-18.622-18.663l-2.9856-5.2244-2.7106 10.821c-1.4908 5.9518-2.7347 11.903-2.7642 13.224-0.0472 2.1192-2.4128-4.7466-6.1491-17.847-0.66667-2.3375-1.4665-4.25-1.7773-4.25-0.31086 0-1.455 1.6873-2.5426 3.7495-2.669 5.061-13.973 16.184-19.497 19.184l-4.4802 2.4335z" }, void 0), e$1("path", { d: "m157.22 549.07c-25.332-3.2289-57.41-17.026-80.985-34.834-6.1723-4.6623-23.987-21.237-28.476-26.494-1.3965-1.6354-3.3143-3.7606-4.2617-4.7226-6.0516-6.1448-19.159-26.274-24.076-36.974-24.833-54.038-23.056-115.05 4.9166-168.83 17.828-34.279 47.518-61.357 81.882-74.681 11.873-4.6036 24.317-8.1757 34.736-9.9712 13.493-2.3253 33.914-1.4052 47.264 2.1296 10.55 2.7935 31.932 9.7527 37 12.042 1.65 0.74549 5.7 2.4707 9 3.8338s9.4791 4.1116 13.731 6.1077l7.7314 3.6294 5.2686-3.8169c11.858-8.5911 20.214-12.92 34.793-18.026 13.35-4.6757 20.738-5.7536 38.976-5.6865 13.81 0.0508 17.886 0.42831 25 2.3156 15.155 4.0204 22.77 7.0483 42.5 16.899 13.154 6.5675 30.36 18.773 39 27.666 34.018 35.013 51.027 77.77 50.942 128.06-0.0567 33.483-6.6546 59.984-22.699 91.171-4.5936 8.9291-16.275 24.43-25.92 34.395-31.439 32.483-70.665 52.188-111.32 55.922-33.771 3.1014-59.305-0.88261-83.868-13.086-5.4275-2.6964-10.276-4.9026-10.775-4.9026s-3.7526 1.7976-7.2315 3.9948c-19.438 12.276-46.022 17.315-73.126 13.86z", fill: "#d20001" }, void 0), e$1("path", { d: "m254.27 204.04c0.76479-6.5233 0.71116-26.806-0.0861-32.549-4.831-34.799-23.218-61.059-50.471-72.079-3.0272-1.2241-6.8284-3.2817-8.4471-4.5724l-2.943-2.3467 7.447-11.796c4.0959-6.4879 7.7685-12.287 8.1613-12.887 1.4767-2.2552 35.47 33.866 41.49 44.087 7.9373 13.476 11.889 27.259 12.986 45.3 0.91545 15.042-2.5638 38.319-7.2324 48.386l-1.4544 3.1362 0.5486-4.6792z" }, void 0), e$1("path", { d: "m402.92 2.002c-0.13157 0.015144-0.20108 0.16987-0.20117 0.48242-9.7e-4 3.0634-6.085 19.903-10.199 28.232-12.905 26.126-28.066 42.537-57.801 62.559-6.875 4.6293-12.725 8.6781-13 8.9961-0.275 0.31799-2.7409 2.1031-5.4785 3.9668-21.418 14.581-36.106 34.166-41.98 55.979-1.1107 4.1244-1.9396 11.891-2.2695 21.25-0.28596 8.1125-0.27586 14.75 0.02148 14.75 0.29736 0 3.3898-2.9752 6.873-6.6113 8.9776-9.3719 23.987-20.37 34.951-25.609 10.641-5.0853 22.133-8.9546 42.383-14.27 27.537-7.2277 39.017-12.32 50.768-22.523 4.5584-3.958 12.154-15.155 14.336-21.133 8.3843-22.968 6.3152-51.121-6.0879-82.854-4.0729-10.42-11.043-23.361-12.314-23.215zm-35.314 104.71 0.03515 3.5c0.04008 4.1374-2.865 10.947-6.5488 15.352-2.6459 3.1635-13.248 11.619-14.594 11.639-0.39621 0.00578-3.0962 1.0734-6 2.373-2.9038 1.2996-8.8793 3.5939-13.279 5.0976-11.248 3.8439-24.009 10.102-30.338 14.881-6.3827 4.819-13.316 13.064-16.898 20.096-1.4186 2.7842-3.6158 7.5375-4.8809 10.562-2.1018 5.026-2.3032 5.2291-2.3418 2.3555-0.11678-8.6881 7.2896-23.396 16.471-32.709 8.5204-8.6426 16.436-12.95 36.988-20.127 25.499-8.9047 33.72-14.916 39.693-29.02l1.6934-4z", fill: "#038002" }, void 0)] }), void 0));

  var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };
  let globalState = {};
  let listeners = [];
  let actions$1 = [];
  let actionSubscription = undefined;
  function useStore(callback) {
      const setState = l(globalState)[1];
      y(() => {
          listeners.push(setState);
          return () => {
              listeners = listeners.filter((li) => li !== setState);
          };
      }, [setState]);
      function dispatch(actionIdentifier, payload, bypasslisteners = false) {
          const typeActions = actions$1;
          const action = typeActions.find((a) => a.type.toString() === actionIdentifier.toString());
          callback && callback(action.type, payload);
          const newState = action.action(globalState, payload);
          if (!bypasslisteners) {
              if (actionSubscription) {
                  actionSubscription({
                      type: actionIdentifier,
                      payload: payload,
                  });
              }
          }
          globalState = Object.assign(Object.assign({}, globalState), newState);
          // console.log(`new state: ${JSON.stringify(globalState)}`);
          for (const listener of listeners) {
              listener(globalState);
          }
      }
      function replay(replayActions, delayMs) {
          return __awaiter(this, void 0, void 0, function* () {
              for (const action of replayActions) {
                  yield timeout(delayMs);
                  dispatch(action.type, action.payload, true);
              }
          });
      }
      return [globalState, dispatch, replay];
  }
  function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function cleanupStore() {
      globalState = {};
      listeners = [];
      actions$1 = [];
  }
  function initStore(userActions, initialState, subscribe) {
      if (initialState) {
          globalState = Object.assign(Object.assign({}, globalState), initialState);
      }
      actions$1 = [...new Set([...actions$1, ...userActions])];
      actionSubscription = subscribe;
      return { getState: () => globalState, cleanup: () => cleanupStore() };
  }

  const Interaction = ({ config }) => {
      const { sum1, sum2, buttonText, tableSize } = config;
      const [state, dispatch] = useStore((type, payload) => {
      });
      const replaceAll = (str, find, replace) => {
          return str === null || str === void 0 ? void 0 : str.replace(new RegExp(find, "g"), replace);
      };
      const sum = (attempt, s) => {
          if (attempt) {
              return index$1(replaceAll(replaceAll(s, "\\$1", attempt.toString()), "x", "*"));
          }
      };
      const inputReference = s(null);
      y(() => {
          if (inputReference.current) {
              inputReference.current.value = "";
          }
      }, [state]);
      const calc = () => {
          var _a;
          const inputValue = (_a = inputReference.current) === null || _a === void 0 ? void 0 : _a.value;
          if (!isNaN(parseInt(inputValue))) {
              dispatch("ADD_ACTION", { x: +inputValue });
          }
      };
      return (e$1("div", Object.assign({ className: "flex space-x-4" }, { children: [e$1("div", Object.assign({ className: "basis-1/4 flex flex-col space-y-3 p-3" }, { children: [e$1("div", Object.assign({ className: "flex h-16" }, { children: [e$1("label", Object.assign({ className: "flex items-center space-x-2 bg-white shadow border border-gray-200 rounded px-2" }, { children: [e$1(Apple, { className: "min-w-[2rem] max-w-[2rem]" }, void 0), e$1("div", { children: "=" }, void 0), e$1("input", { ref: inputReference, maxLength: 3, className: "text-gray-700 text-4xl w-16 leading-tight focus:outline-none focus:shadow-outline" }, void 0)] }), void 0), e$1(Button, Object.assign({ onClick: calc }, { children: buttonText }), void 0)] }), void 0), [sum1, sum2].map((sum) => {
                          const expression = replaceAll(sum, "\\$1", "#");
                          return (e$1("div", Object.assign({ className: "flex h-16 space-x-1 items-center justify-end text-4xl" }, { children: [expression === null || expression === void 0 ? void 0 : expression.split("").map((sumPart, i) => {
                                      if (sumPart === "#") {
                                          return e$1(Apple, { className: "min-w-[2rem] max-w-[2rem]" }, i);
                                      }
                                      else {
                                          return (e$1("div", Object.assign({ className: "x*+/".includes(sumPart.toLowerCase()) ? "text-gray-400" : "italic" }, { children: sumPart.replace("*", "×") }), i));
                                      }
                                  }), e$1("div", Object.assign({ className: "text-gray-400" }, { children: "=" }), void 0)] }), void 0));
                      })] }), void 0), e$1("div", Object.assign({ className: "basis-3/4 bg-gray-100 p-3 rounded overflow-x-auto" }, { children: e$1("div", Object.assign({ className: "flex space-x-2 text-4xl h-full" }, { children: state.attempts &&
                          new Array(state.attempts.length <= tableSize ? state.attempts.length + tableSize - state.attempts.length : state.attempts.length).fill("").map((_, idx) => state.attempts[idx]).map((attempt, i) => {
                              return (e$1("div", Object.assign({ className: "flex flex-col space-y-3" }, { children: [e$1(Block, Object.assign({ className: "font-bold" }, { children: attempt }), void 0), [sum1, sum2].map((s, index) => {
                                          const result = sum(attempt, s);
                                          return e$1(Block, { children: result }, void 0);
                                      })] }), i));
                          }) }), void 0) }), void 0)] }), void 0));
  };
  function Block(props) {
      props.style ? props.style : {};
      return (e$1("div", Object.assign({}, props, { className: `${props.className} flex items-center justify-center bg-white border-1 text-right h-16 w-16` }, { children: props.children }), void 0));
  }
  function Button(props) {
      return (e$1("button", Object.assign({}, props, { className: "m-2 bg-blue-500 w-full text-blue-100 whitespace-nowrap py-1 px-6 rounded border-0" }, { children: props.children }), void 0));
  }

  var css_248z = ".m-2 {\n  margin: 0.5rem;\n}\n.flex {\n  display: flex;\n}\n.h-16 {\n  height: 4rem;\n}\n.h-full {\n  height: 100%;\n}\n.w-16 {\n  width: 4rem;\n}\n.w-full {\n  width: 100%;\n}\n.min-w-\\[2rem\\] {\n  min-width: 2rem;\n}\n.max-w-\\[2rem\\] {\n  max-width: 2rem;\n}\n.basis-1\\/4 {\n  flex-basis: 25%;\n}\n.basis-3\\/4 {\n  flex-basis: 75%;\n}\n.flex-col {\n  flex-direction: column;\n}\n.items-center {\n  align-items: center;\n}\n.justify-end {\n  justify-content: flex-end;\n}\n.justify-center {\n  justify-content: center;\n}\n.space-x-4 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(1rem * var(--tw-space-x-reverse));\n  margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));\n}\n.space-y-3 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));\n}\n.space-x-2 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(0.5rem * var(--tw-space-x-reverse));\n  margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));\n}\n.space-x-1 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(0.25rem * var(--tw-space-x-reverse));\n  margin-left: calc(0.25rem * calc(1 - var(--tw-space-x-reverse)));\n}\n.overflow-x-auto {\n  overflow-x: auto;\n}\n.whitespace-nowrap {\n  white-space: nowrap;\n}\n.rounded {\n  border-radius: 0.25rem;\n}\n.border {\n  border-width: 1px;\n}\n.border-0 {\n  border-width: 0px;\n}\n.border-gray-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(229 231 235 / var(--tw-border-opacity));\n}\n.bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.bg-gray-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity));\n}\n.bg-blue-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(59 130 246 / var(--tw-bg-opacity));\n}\n.p-3 {\n  padding: 0.75rem;\n}\n.px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n.py-1 {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n}\n.px-6 {\n  padding-left: 1.5rem;\n  padding-right: 1.5rem;\n}\n.text-right {\n  text-align: right;\n}\n.text-4xl {\n  font-size: 2.25rem;\n  line-height: 2.5rem;\n}\n.font-bold {\n  font-weight: 700;\n}\n.italic {\n  font-style: italic;\n}\n.leading-tight {\n  line-height: 1.25;\n}\n.text-gray-700 {\n  --tw-text-opacity: 1;\n  color: rgb(55 65 81 / var(--tw-text-opacity));\n}\n.text-gray-400 {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n.text-blue-100 {\n  --tw-text-opacity: 1;\n  color: rgb(219 234 254 / var(--tw-text-opacity));\n}\n.shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n /*\n! tailwindcss v3.0.15 | MIT License | https://tailwindcss.com\n*/\n /*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n *,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n ::before,\n::after {\n  --tw-content: '';\n}\n /*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n*/\n html {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4; /* 3 */\n  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */\n}\n /*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n body {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n /*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n hr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n /*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n abbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n /*\nRemove the default font size and weight for headings.\n*/\n h1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n /*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n a {\n  color: inherit;\n  text-decoration: inherit;\n}\n /*\nAdd the correct font weight in Edge and Safari.\n*/\n b,\nstrong {\n  font-weight: bolder;\n}\n /*\n1. Use the user's configured `mono` font family by default.\n2. Correct the odd `em` font sizing in all browsers.\n*/\n code,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n /*\nAdd the correct font size in all browsers.\n*/\n small {\n  font-size: 80%;\n}\n /*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n sub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n sub {\n  bottom: -0.25em;\n}\n sup {\n  top: -0.5em;\n}\n /*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n table {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n /*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n button,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  line-height: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n /*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n button,\nselect {\n  text-transform: none;\n}\n /*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n button,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n /*\nUse the modern Firefox focus style for all focusable elements.\n*/\n :-moz-focusring {\n  outline: auto;\n}\n /*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n :-moz-ui-invalid {\n  box-shadow: none;\n}\n /*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n progress {\n  vertical-align: baseline;\n}\n /*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n ::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n /*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n [type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n /*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n ::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n /*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n ::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n /*\nAdd the correct display in Chrome and Safari.\n*/\n summary {\n  display: list-item;\n}\n /*\nRemoves the default spacing and border for appropriate elements.\n*/\n blockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n fieldset {\n  margin: 0;\n  padding: 0;\n}\n legend {\n  padding: 0;\n}\n ol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n /*\nPrevent resizing textareas horizontally by default.\n*/\n textarea {\n  resize: vertical;\n}\n /*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n input::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n input:-ms-input-placeholder, textarea:-ms-input-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n input::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n /*\nSet the default cursor for buttons.\n*/\n button,\n[role=\"button\"] {\n  cursor: pointer;\n}\n /*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n :disabled {\n  cursor: default;\n}\n /*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n img,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n /*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n img,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n /*\nEnsure the default browser behavior of the `hidden` attribute.\n*/\n [hidden] {\n  display: none;\n}\n *, ::before, ::after {\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n .focus\\:outline-none:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}";

  const actions = [
      {
          type: "ADD_ACTION",
          action: (currentState, { x }) => {
              const newState = { attempts: [x, ...currentState.attempts] };
              return newState;
          },
      },
  ];

  var buttonText = "Berekenen";
  var sum1 = "$1 * 12 + 3";
  var sum2 = "$1 * 4 + 53";
  var tableSize = "4";
  var configProps = {
  	buttonText: buttonText,
  	sum1: sum1,
  	sum2: sum2,
  	tableSize: tableSize
  };

  class App {
      constructor() {
          this.typeIdentifier = "getallenFormule";
          this.logActions = [];
          this.getInstance = (dom, config, stateString) => {
              config.properties = Object.assign(Object.assign({}, configProps), config.properties);
              this.config = config;
              const initState = stateString ? JSON.parse(stateString).state : { attempts: [] };
              this.logActions = stateString ? JSON.parse(stateString).log : [];
              this.store = initStore(actions, initState, (action) => this.logActions.push(action));
              this.shadowdom = dom.attachShadow({ mode: "closed" });
              this.render();
              this.config.onready && this.config.onready(this);
          };
          this.render = () => {
              S(null, this.shadowdom);
              const css = document.createElement("style");
              css.innerHTML = css_248z;
              this.shadowdom.appendChild(css);
              S(e$1(Interaction, { config: this.config.properties }, void 0), this.shadowdom);
          };
          this.trigger = (event, value) => {
              this.config.properties[event] = value;
              this.render();
          };
          this.off = () => { };
          this.on = (val) => { };
          this.getResponse = () => {
              const response = {
                  base: null,
              };
              return response;
          };
          this.getState = () => JSON.stringify({
              state: this.store.getState(),
              log: this.logActions,
          });
          this.oncompleted = () => this.store.cleanup();
          ctx__namespace && ctx__namespace.register(this);
      }
  }
  var index = new App();

  return index;

}));
//# sourceMappingURL=index.js.map
