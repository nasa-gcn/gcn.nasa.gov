;(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require
          if (!f && c) return c(i, !0)
          if (u) return u(i, !0)
          var a = new Error("Cannot find module '" + i + "'")
          throw ((a.code = 'MODULE_NOT_FOUND'), a)
        }
        var p = (n[i] = { exports: {} })
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r]
            return o(n || r)
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        )
      }
      return n[i].exports
    }
    for (
      var u = 'function' == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i])
    return o
  }
  return r
})()(
  {
    1: [
      function (require, module, exports) {
        'use strict'

        /*
         * classList.js: Cross-browser full element.classList implementation.
         * 1.1.20170427
         *
         * By Eli Grey, http://eligrey.com
         * License: Dedicated to the public domain.
         *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
         */

        /*global self, document, DOMException */

        /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

        if ('document' in window.self) {
          // Full polyfill for browsers with no classList support
          // Including IE < Edge missing SVGElement.classList
          if (
            !('classList' in document.createElement('_')) ||
            (document.createElementNS &&
              !(
                'classList' in
                document.createElementNS('http://www.w3.org/2000/svg', 'g')
              ))
          ) {
            ;(function (view) {
              'use strict'

              if (!('Element' in view)) return
              var classListProp = 'classList',
                protoProp = 'prototype',
                elemCtrProto = view.Element[protoProp],
                objCtr = Object,
                strTrim =
                  String[protoProp].trim ||
                  function () {
                    return this.replace(/^\s+|\s+$/g, '')
                  },
                arrIndexOf =
                  Array[protoProp].indexOf ||
                  function (item) {
                    var i = 0,
                      len = this.length
                    for (; i < len; i++) {
                      if (i in this && this[i] === item) {
                        return i
                      }
                    }
                    return -1
                  },
                // Vendors: please allow content code to instantiate DOMExceptions
                DOMEx = function (type, message) {
                  this.name = type
                  this.code = DOMException[type]
                  this.message = message
                },
                checkTokenAndGetIndex = function (classList, token) {
                  if (token === '') {
                    throw new DOMEx(
                      'SYNTAX_ERR',
                      'An invalid or illegal string was specified'
                    )
                  }
                  if (/\s/.test(token)) {
                    throw new DOMEx(
                      'INVALID_CHARACTER_ERR',
                      'String contains an invalid character'
                    )
                  }
                  return arrIndexOf.call(classList, token)
                },
                ClassList = function (elem) {
                  var trimmedClasses = strTrim.call(
                      elem.getAttribute('class') || ''
                    ),
                    classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
                    i = 0,
                    len = classes.length
                  for (; i < len; i++) {
                    this.push(classes[i])
                  }
                  this._updateClassName = function () {
                    elem.setAttribute('class', this.toString())
                  }
                },
                classListProto = (ClassList[protoProp] = []),
                classListGetter = function () {
                  return new ClassList(this)
                }
              // Most DOMException implementations don't allow calling DOMException's toString()
              // on non-DOMExceptions. Error's toString() is sufficient here.
              DOMEx[protoProp] = Error[protoProp]
              classListProto.item = function (i) {
                return this[i] || null
              }
              classListProto.contains = function (token) {
                token = String(token)
                return checkTokenAndGetIndex(this, token) !== -1
              }
              classListProto.add = function () {
                var tokens = arguments,
                  i = 0,
                  l = tokens.length,
                  token,
                  updated = false
                do {
                  token = String(tokens[i])
                  if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token)
                    updated = true
                  }
                } while (++i < l)
                if (updated) {
                  this._updateClassName()
                }
              }
              classListProto.remove = function () {
                var tokens = arguments,
                  i = 0,
                  l = tokens.length,
                  token,
                  updated = false,
                  index
                do {
                  token = String(tokens[i])
                  index = checkTokenAndGetIndex(this, token)
                  while (index !== -1) {
                    this.splice(index, 1)
                    updated = true
                    index = checkTokenAndGetIndex(this, token)
                  }
                } while (++i < l)
                if (updated) {
                  this._updateClassName()
                }
              }
              classListProto.toggle = function (token, force) {
                token = String(token)
                var result = this.contains(token),
                  method = result
                    ? force !== true && 'remove'
                    : force !== false && 'add'
                if (method) {
                  this[method](token)
                }
                if (force === true || force === false) {
                  return force
                } else {
                  return !result
                }
              }
              classListProto.toString = function () {
                return this.join(' ')
              }
              if (objCtr.defineProperty) {
                var classListPropDesc = {
                  get: classListGetter,
                  enumerable: true,
                  configurable: true,
                }
                try {
                  objCtr.defineProperty(
                    elemCtrProto,
                    classListProp,
                    classListPropDesc
                  )
                } catch (ex) {
                  // IE 8 doesn't support enumerable:true
                  // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
                  // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
                  if (ex.number === undefined || ex.number === -0x7ff5ec54) {
                    classListPropDesc.enumerable = false
                    objCtr.defineProperty(
                      elemCtrProto,
                      classListProp,
                      classListPropDesc
                    )
                  }
                }
              } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter)
              }
            })(window.self)
          }

          // There is full or partial native classList support, so just check if we need
          // to normalize the add/remove and toggle APIs.

          ;(function () {
            'use strict'

            var testElement = document.createElement('_')
            testElement.classList.add('c1', 'c2')

            // Polyfill for IE 10/11 and Firefox <26, where classList.add and
            // classList.remove exist but support only one argument at a time.
            if (!testElement.classList.contains('c2')) {
              var createMethod = function (method) {
                var original = DOMTokenList.prototype[method]
                DOMTokenList.prototype[method] = function (token) {
                  var i,
                    len = arguments.length
                  for (i = 0; i < len; i++) {
                    token = arguments[i]
                    original.call(this, token)
                  }
                }
              }
              createMethod('add')
              createMethod('remove')
            }
            testElement.classList.toggle('c3', false)

            // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
            // support the second argument.
            if (testElement.classList.contains('c3')) {
              var _toggle = DOMTokenList.prototype.toggle
              DOMTokenList.prototype.toggle = function (token, force) {
                if (1 in arguments && !this.contains(token) === !force) {
                  return force
                } else {
                  return _toggle.call(this, token)
                }
              }
            }
            testElement = null
          })()
        }
      },
      {},
    ],
    2: [
      function (require, module, exports) {
        'use strict'

        /*!
         * domready (c) Dustin Diaz 2014 - License MIT
         */
        !(function (name, definition) {
          if (typeof module != 'undefined') module.exports = definition()
          else if (typeof define == 'function' && typeof define.amd == 'object')
            define(definition)
          else this[name] = definition()
        })('domready', function () {
          var fns = [],
            listener,
            doc = document,
            hack = doc.documentElement.doScroll,
            domContentLoaded = 'DOMContentLoaded',
            loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(
              doc.readyState
            )
          if (!loaded)
            doc.addEventListener(
              domContentLoaded,
              (listener = function () {
                doc.removeEventListener(domContentLoaded, listener)
                loaded = 1
                while ((listener = fns.shift())) listener()
              })
            )
          return function (fn) {
            loaded ? setTimeout(fn, 0) : fns.push(fn)
          }
        })
      },
      {},
    ],
    3: [
      function (require, module, exports) {
        'use strict'

        // element-closest | CC0-1.0 | github.com/jonathantneal/closest

        ;(function (ElementProto) {
          if (typeof ElementProto.matches !== 'function') {
            ElementProto.matches =
              ElementProto.msMatchesSelector ||
              ElementProto.mozMatchesSelector ||
              ElementProto.webkitMatchesSelector ||
              function matches(selector) {
                var element = this
                var elements = (
                  element.document || element.ownerDocument
                ).querySelectorAll(selector)
                var index = 0
                while (elements[index] && elements[index] !== element) {
                  ++index
                }
                return Boolean(elements[index])
              }
          }
          if (typeof ElementProto.closest !== 'function') {
            ElementProto.closest = function closest(selector) {
              var element = this
              while (element && element.nodeType === 1) {
                if (element.matches(selector)) {
                  return element
                }
                element = element.parentNode
              }
              return null
            }
          }
        })(window.Element.prototype)
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        'use strict'

        /* global define, KeyboardEvent, module */

        ;(function () {
          var keyboardeventKeyPolyfill = {
            polyfill: polyfill,
            keys: {
              3: 'Cancel',
              6: 'Help',
              8: 'Backspace',
              9: 'Tab',
              12: 'Clear',
              13: 'Enter',
              16: 'Shift',
              17: 'Control',
              18: 'Alt',
              19: 'Pause',
              20: 'CapsLock',
              27: 'Escape',
              28: 'Convert',
              29: 'NonConvert',
              30: 'Accept',
              31: 'ModeChange',
              32: ' ',
              33: 'PageUp',
              34: 'PageDown',
              35: 'End',
              36: 'Home',
              37: 'ArrowLeft',
              38: 'ArrowUp',
              39: 'ArrowRight',
              40: 'ArrowDown',
              41: 'Select',
              42: 'Print',
              43: 'Execute',
              44: 'PrintScreen',
              45: 'Insert',
              46: 'Delete',
              48: ['0', ')'],
              49: ['1', '!'],
              50: ['2', '@'],
              51: ['3', '#'],
              52: ['4', '$'],
              53: ['5', '%'],
              54: ['6', '^'],
              55: ['7', '&'],
              56: ['8', '*'],
              57: ['9', '('],
              91: 'OS',
              93: 'ContextMenu',
              144: 'NumLock',
              145: 'ScrollLock',
              181: 'VolumeMute',
              182: 'VolumeDown',
              183: 'VolumeUp',
              186: [';', ':'],
              187: ['=', '+'],
              188: [',', '<'],
              189: ['-', '_'],
              190: ['.', '>'],
              191: ['/', '?'],
              192: ['`', '~'],
              219: ['[', '{'],
              220: ['\\', '|'],
              221: [']', '}'],
              222: ["'", '"'],
              224: 'Meta',
              225: 'AltGraph',
              246: 'Attn',
              247: 'CrSel',
              248: 'ExSel',
              249: 'EraseEof',
              250: 'Play',
              251: 'ZoomOut',
            },
          }

          // Function keys (F1-24).
          var i
          for (i = 1; i < 25; i++) {
            keyboardeventKeyPolyfill.keys[111 + i] = 'F' + i
          }

          // Printable ASCII characters.
          var letter = ''
          for (i = 65; i < 91; i++) {
            letter = String.fromCharCode(i)
            keyboardeventKeyPolyfill.keys[i] = [
              letter.toLowerCase(),
              letter.toUpperCase(),
            ]
          }
          function polyfill() {
            if (
              !('KeyboardEvent' in window) ||
              'key' in KeyboardEvent.prototype
            ) {
              return false
            }

            // Polyfill `key` on `KeyboardEvent`.
            var proto = {
              get: function (x) {
                var key =
                  keyboardeventKeyPolyfill.keys[this.which || this.keyCode]
                if (Array.isArray(key)) {
                  key = key[Number(this.shiftKey)]
                }
                return key
              },
            }
            Object.defineProperty(KeyboardEvent.prototype, 'key', proto)
            return proto
          }
          if (typeof define === 'function' && define.amd) {
            define('keyboardevent-key-polyfill', keyboardeventKeyPolyfill)
          } else if (
            typeof exports !== 'undefined' &&
            typeof module !== 'undefined'
          ) {
            module.exports = keyboardeventKeyPolyfill
          } else if (window) {
            window.keyboardeventKeyPolyfill = keyboardeventKeyPolyfill
          }
        })()
      },
      {},
    ],
    5: [
      function (require, module, exports) {
        /*
object-assign
(c) Sindre Sorhus
@license MIT
*/

        'use strict'

        /* eslint-disable no-unused-vars */
        var getOwnPropertySymbols = Object.getOwnPropertySymbols
        var hasOwnProperty = Object.prototype.hasOwnProperty
        var propIsEnumerable = Object.prototype.propertyIsEnumerable
        function toObject(val) {
          if (val === null || val === undefined) {
            throw new TypeError(
              'Object.assign cannot be called with null or undefined'
            )
          }
          return Object(val)
        }
        function shouldUseNative() {
          try {
            if (!Object.assign) {
              return false
            }

            // Detect buggy property enumeration order in older V8 versions.

            // https://bugs.chromium.org/p/v8/issues/detail?id=4118
            var test1 = new String('abc') // eslint-disable-line no-new-wrappers
            test1[5] = 'de'
            if (Object.getOwnPropertyNames(test1)[0] === '5') {
              return false
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test2 = {}
            for (var i = 0; i < 10; i++) {
              test2['_' + String.fromCharCode(i)] = i
            }
            var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
              return test2[n]
            })
            if (order2.join('') !== '0123456789') {
              return false
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test3 = {}
            'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
              test3[letter] = letter
            })
            if (
              Object.keys(Object.assign({}, test3)).join('') !==
              'abcdefghijklmnopqrst'
            ) {
              return false
            }
            return true
          } catch (err) {
            // We don't expect any of the above to throw, but better to be safe.
            return false
          }
        }
        module.exports = shouldUseNative()
          ? Object.assign
          : function (target, source) {
              var from
              var to = toObject(target)
              var symbols
              for (var s = 1; s < arguments.length; s++) {
                from = Object(arguments[s])
                for (var key in from) {
                  if (hasOwnProperty.call(from, key)) {
                    to[key] = from[key]
                  }
                }
                if (getOwnPropertySymbols) {
                  symbols = getOwnPropertySymbols(from)
                  for (var i = 0; i < symbols.length; i++) {
                    if (propIsEnumerable.call(from, symbols[i])) {
                      to[symbols[i]] = from[symbols[i]]
                    }
                  }
                }
              }
              return to
            }
      },
      {},
    ],
    6: [
      function (require, module, exports) {
        'use strict'

        const assign = require('object-assign')
        const delegate = require('../delegate')
        const delegateAll = require('../delegateAll')
        const DELEGATE_PATTERN = /^(.+):delegate\((.+)\)$/
        const SPACE = ' '
        const getListeners = function (type, handler) {
          var match = type.match(DELEGATE_PATTERN)
          var selector
          if (match) {
            type = match[1]
            selector = match[2]
          }
          var options
          if (typeof handler === 'object') {
            options = {
              capture: popKey(handler, 'capture'),
              passive: popKey(handler, 'passive'),
            }
          }
          var listener = {
            selector: selector,
            delegate:
              typeof handler === 'object'
                ? delegateAll(handler)
                : selector
                ? delegate(selector, handler)
                : handler,
            options: options,
          }
          if (type.indexOf(SPACE) > -1) {
            return type.split(SPACE).map(function (_type) {
              return assign(
                {
                  type: _type,
                },
                listener
              )
            })
          } else {
            listener.type = type
            return [listener]
          }
        }
        var popKey = function (obj, key) {
          var value = obj[key]
          delete obj[key]
          return value
        }
        module.exports = function behavior(events, props) {
          const listeners = Object.keys(events).reduce(function (memo, type) {
            var listeners = getListeners(type, events[type])
            return memo.concat(listeners)
          }, [])
          return assign(
            {
              add: function addBehavior(element) {
                listeners.forEach(function (listener) {
                  element.addEventListener(
                    listener.type,
                    listener.delegate,
                    listener.options
                  )
                })
              },
              remove: function removeBehavior(element) {
                listeners.forEach(function (listener) {
                  element.removeEventListener(
                    listener.type,
                    listener.delegate,
                    listener.options
                  )
                })
              },
            },
            props
          )
        }
      },
      { '../delegate': 8, '../delegateAll': 9, 'object-assign': 5 },
    ],
    7: [
      function (require, module, exports) {
        'use strict'

        module.exports = function compose(functions) {
          return function (e) {
            return functions.some(function (fn) {
              return fn.call(this, e) === false
            }, this)
          }
        }
      },
      {},
    ],
    8: [
      function (require, module, exports) {
        'use strict'

        // polyfill Element.prototype.closest
        require('element-closest')
        module.exports = function delegate(selector, fn) {
          return function delegation(event) {
            var target = event.target.closest(selector)
            if (target) {
              return fn.call(target, event)
            }
          }
        }
      },
      { 'element-closest': 3 },
    ],
    9: [
      function (require, module, exports) {
        'use strict'

        const delegate = require('../delegate')
        const compose = require('../compose')
        const SPLAT = '*'
        module.exports = function delegateAll(selectors) {
          const keys = Object.keys(selectors)

          // XXX optimization: if there is only one handler and it applies to
          // all elements (the "*" CSS selector), then just return that
          // handler
          if (keys.length === 1 && keys[0] === SPLAT) {
            return selectors[SPLAT]
          }
          const delegates = keys.reduce(function (memo, selector) {
            memo.push(delegate(selector, selectors[selector]))
            return memo
          }, [])
          return compose(delegates)
        }
      },
      { '../compose': 7, '../delegate': 8 },
    ],
    10: [
      function (require, module, exports) {
        'use strict'

        module.exports = function ignore(element, fn) {
          return function ignorance(e) {
            if (element !== e.target && !element.contains(e.target)) {
              return fn.call(this, e)
            }
          }
        }
      },
      {},
    ],
    11: [
      function (require, module, exports) {
        'use strict'

        module.exports = {
          behavior: require('./behavior'),
          delegate: require('./delegate'),
          delegateAll: require('./delegateAll'),
          ignore: require('./ignore'),
          keymap: require('./keymap'),
        }
      },
      {
        './behavior': 6,
        './delegate': 8,
        './delegateAll': 9,
        './ignore': 10,
        './keymap': 12,
      },
    ],
    12: [
      function (require, module, exports) {
        'use strict'

        require('keyboardevent-key-polyfill')

        // these are the only relevant modifiers supported on all platforms,
        // according to MDN:
        // <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState>
        const MODIFIERS = {
          Alt: 'altKey',
          Control: 'ctrlKey',
          Ctrl: 'ctrlKey',
          Shift: 'shiftKey',
        }
        const MODIFIER_SEPARATOR = '+'
        const getEventKey = function (event, hasModifiers) {
          var key = event.key
          if (hasModifiers) {
            for (var modifier in MODIFIERS) {
              if (event[MODIFIERS[modifier]] === true) {
                key = [modifier, key].join(MODIFIER_SEPARATOR)
              }
            }
          }
          return key
        }
        module.exports = function keymap(keys) {
          const hasModifiers = Object.keys(keys).some(function (key) {
            return key.indexOf(MODIFIER_SEPARATOR) > -1
          })
          return function (event) {
            var key = getEventKey(event, hasModifiers)
            return [key, key.toLowerCase()].reduce(function (result, _key) {
              if (_key in keys) {
                result = keys[key].call(this, event)
              }
              return result
            }, undefined)
          }
        }
        module.exports.MODIFIERS = MODIFIERS
      },
      { 'keyboardevent-key-polyfill': 4 },
    ],
    13: [
      function (require, module, exports) {
        'use strict'

        module.exports = function once(listener, options) {
          var wrapped = function wrappedOnce(e) {
            e.currentTarget.removeEventListener(e.type, wrapped, options)
            return listener.call(this, e)
          }
          return wrapped
        }
      },
      {},
    ],
    14: [
      function (require, module, exports) {
        'use strict'

        var RE_TRIM = /(^\s+)|(\s+$)/g
        var RE_SPLIT = /\s+/
        var trim = String.prototype.trim
          ? function (str) {
              return str.trim()
            }
          : function (str) {
              return str.replace(RE_TRIM, '')
            }
        var queryById = function (id) {
          return this.querySelector('[id="' + id.replace(/"/g, '\\"') + '"]')
        }
        module.exports = function resolveIds(ids, doc) {
          if (typeof ids !== 'string') {
            throw new Error('Expected a string but got ' + typeof ids)
          }
          if (!doc) {
            doc = window.document
          }
          var getElementById = doc.getElementById
            ? doc.getElementById.bind(doc)
            : queryById.bind(doc)
          ids = trim(ids).split(RE_SPLIT)

          // XXX we can short-circuit here because trimming and splitting a
          // string of just whitespace produces an array containing a single,
          // empty string
          if (ids.length === 1 && ids[0] === '') {
            return []
          }
          return ids.map(function (id) {
            var el = getElementById(id)
            if (!el) {
              throw new Error('no element with id: "' + id + '"')
            }
            return el
          })
        }
      },
      {},
    ],
    15: [
      function (require, module, exports) {
        'use strict'

        const select = require('../utils/select')
        const behavior = require('../utils/behavior')
        const toggle = require('../utils/toggle')
        const isElementInViewport = require('../utils/is-in-viewport')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const ACCORDION = `.${PREFIX}-accordion, .${PREFIX}-accordion--bordered`
        const BUTTON = `.${PREFIX}-accordion__button[aria-controls]`
        const EXPANDED = 'aria-expanded'
        const MULTISELECTABLE = 'aria-multiselectable'

        /**
         * Get an Array of button elements belonging directly to the given
         * accordion element.
         * @param {HTMLElement} accordion
         * @return {array<HTMLButtonElement>}
         */
        const getAccordionButtons = (accordion) => {
          const buttons = select(BUTTON, accordion)
          return buttons.filter(
            (button) => button.closest(ACCORDION) === accordion
          )
        }

        /**
         * Toggle a button's "pressed" state, optionally providing a target
         * state.
         *
         * @param {HTMLButtonElement} button
         * @param {boolean?} expanded If no state is provided, the current
         * state will be toggled (from false to true, and vice-versa).
         * @return {boolean} the resulting state
         */
        const toggleButton = (button, expanded) => {
          const accordion = button.closest(ACCORDION)
          let safeExpanded = expanded
          if (!accordion) {
            throw new Error(`${BUTTON} is missing outer ${ACCORDION}`)
          }
          safeExpanded = toggle(button, expanded)

          // XXX multiselectable is opt-in, to preserve legacy behavior
          const multiselectable =
            accordion.getAttribute(MULTISELECTABLE) === 'true'
          if (safeExpanded && !multiselectable) {
            getAccordionButtons(accordion).forEach((other) => {
              if (other !== button) {
                toggle(other, false)
              }
            })
          }
        }

        /**
         * @param {HTMLButtonElement} button
         * @return {boolean} true
         */
        const showButton = (button) => toggleButton(button, true)

        /**
         * @param {HTMLButtonElement} button
         * @return {boolean} false
         */
        const hideButton = (button) => toggleButton(button, false)
        const accordion = behavior(
          {
            [CLICK]: {
              [BUTTON](event) {
                event.preventDefault()
                toggleButton(this)
                if (this.getAttribute(EXPANDED) === 'true') {
                  // We were just expanded, but if another accordion was also just
                  // collapsed, we may no longer be in the viewport. This ensures
                  // that we are still visible, so the user isn't confused.
                  if (!isElementInViewport(this)) this.scrollIntoView()
                }
              },
            },
          },
          {
            init(root) {
              select(BUTTON, root).forEach((button) => {
                const expanded = button.getAttribute(EXPANDED) === 'true'
                toggleButton(button, expanded)
              })
            },
            ACCORDION,
            BUTTON,
            show: showButton,
            hide: hideButton,
            toggle: toggleButton,
            getButtons: getAccordionButtons,
          }
        )
        module.exports = accordion
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/is-in-viewport': 45,
        '../utils/select': 49,
        '../utils/toggle': 52,
      },
    ],
    16: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const HEADER = `.${PREFIX}-banner__header`
        const EXPANDED_CLASS = `${PREFIX}-banner__header--expanded`
        const toggleBanner = function toggleEl(event) {
          event.preventDefault()
          this.closest(HEADER).classList.toggle(EXPANDED_CLASS)
        }
        module.exports = behavior({
          [CLICK]: {
            [`${HEADER} [aria-controls]`]: toggleBanner,
          },
        })
      },
      { '../config': 34, '../events': 35, '../utils/behavior': 43 },
    ],
    17: [
      function (require, module, exports) {
        'use strict'

        const select = require('../utils/select')
        const behavior = require('../utils/behavior')
        const { prefix: PREFIX } = require('../config')
        const CHARACTER_COUNT = `.${PREFIX}-character-count`
        const INPUT = `.${PREFIX}-character-count__field`
        const MESSAGE = `.${PREFIX}-character-count__message`
        const VALIDATION_MESSAGE = 'The content is too long.'
        const MESSAGE_INVALID_CLASS = `${PREFIX}-character-count__message--invalid`

        /**
         * The elements within the character count.
         * @typedef {Object} CharacterCountElements
         * @property {HTMLDivElement} characterCountEl
         * @property {HTMLSpanElement} messageEl
         */

        /**
         * Returns the root and message element
         * for an character count input
         *
         * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
         * @returns {CharacterCountElements} elements The root and message element.
         */
        const getCharacterCountElements = (inputEl) => {
          const characterCountEl = inputEl.closest(CHARACTER_COUNT)
          if (!characterCountEl) {
            throw new Error(`${INPUT} is missing outer ${CHARACTER_COUNT}`)
          }
          const messageEl = characterCountEl.querySelector(MESSAGE)
          if (!messageEl) {
            throw new Error(`${CHARACTER_COUNT} is missing inner ${MESSAGE}`)
          }
          return {
            characterCountEl,
            messageEl,
          }
        }

        /**
         * Update the character count component
         *
         * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
         */
        const updateCountMessage = (inputEl) => {
          const { characterCountEl, messageEl } =
            getCharacterCountElements(inputEl)
          const maxlength = parseInt(
            characterCountEl.getAttribute('data-maxlength'),
            10
          )
          if (!maxlength) return
          let newMessage = ''
          const currentLength = inputEl.value.length
          const isOverLimit = currentLength && currentLength > maxlength
          if (currentLength === 0) {
            newMessage = `${maxlength} characters allowed`
          } else {
            const difference = Math.abs(maxlength - currentLength)
            const characters = `character${difference === 1 ? '' : 's'}`
            const guidance = isOverLimit ? 'over limit' : 'left'
            newMessage = `${difference} ${characters} ${guidance}`
          }
          messageEl.classList.toggle(MESSAGE_INVALID_CLASS, isOverLimit)
          messageEl.textContent = newMessage
          if (isOverLimit && !inputEl.validationMessage) {
            inputEl.setCustomValidity(VALIDATION_MESSAGE)
          }
          if (
            !isOverLimit &&
            inputEl.validationMessage === VALIDATION_MESSAGE
          ) {
            inputEl.setCustomValidity('')
          }
        }

        /**
         * Setup the character count component
         *
         * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
         */
        const setupAttributes = (inputEl) => {
          const { characterCountEl } = getCharacterCountElements(inputEl)
          const maxlength = inputEl.getAttribute('maxlength')
          if (!maxlength) return
          inputEl.removeAttribute('maxlength')
          characterCountEl.setAttribute('data-maxlength', maxlength)
        }
        const characterCount = behavior(
          {
            input: {
              [INPUT]() {
                updateCountMessage(this)
              },
            },
          },
          {
            init(root) {
              select(INPUT, root).forEach((input) => {
                setupAttributes(input)
                updateCountMessage(input)
              })
            },
            MESSAGE_INVALID_CLASS,
            VALIDATION_MESSAGE,
          }
        )
        module.exports = characterCount
      },
      { '../config': 34, '../utils/behavior': 43, '../utils/select': 49 },
    ],
    18: [
      function (require, module, exports) {
        'use strict'

        const keymap = require('receptor/keymap')
        const select = require('../utils/select')
        const behavior = require('../utils/behavior')
        const Sanitizer = require('../utils/sanitizer')
        const { prefix: PREFIX } = require('../config')
        const { CLICK } = require('../events')
        const COMBO_BOX_CLASS = `${PREFIX}-combo-box`
        const COMBO_BOX_PRISTINE_CLASS = `${COMBO_BOX_CLASS}--pristine`
        const SELECT_CLASS = `${COMBO_BOX_CLASS}__select`
        const INPUT_CLASS = `${COMBO_BOX_CLASS}__input`
        const CLEAR_INPUT_BUTTON_CLASS = `${COMBO_BOX_CLASS}__clear-input`
        const CLEAR_INPUT_BUTTON_WRAPPER_CLASS = `${CLEAR_INPUT_BUTTON_CLASS}__wrapper`
        const INPUT_BUTTON_SEPARATOR_CLASS = `${COMBO_BOX_CLASS}__input-button-separator`
        const TOGGLE_LIST_BUTTON_CLASS = `${COMBO_BOX_CLASS}__toggle-list`
        const TOGGLE_LIST_BUTTON_WRAPPER_CLASS = `${TOGGLE_LIST_BUTTON_CLASS}__wrapper`
        const LIST_CLASS = `${COMBO_BOX_CLASS}__list`
        const LIST_OPTION_CLASS = `${COMBO_BOX_CLASS}__list-option`
        const LIST_OPTION_FOCUSED_CLASS = `${LIST_OPTION_CLASS}--focused`
        const LIST_OPTION_SELECTED_CLASS = `${LIST_OPTION_CLASS}--selected`
        const STATUS_CLASS = `${COMBO_BOX_CLASS}__status`
        const COMBO_BOX = `.${COMBO_BOX_CLASS}`
        const SELECT = `.${SELECT_CLASS}`
        const INPUT = `.${INPUT_CLASS}`
        const CLEAR_INPUT_BUTTON = `.${CLEAR_INPUT_BUTTON_CLASS}`
        const TOGGLE_LIST_BUTTON = `.${TOGGLE_LIST_BUTTON_CLASS}`
        const LIST = `.${LIST_CLASS}`
        const LIST_OPTION = `.${LIST_OPTION_CLASS}`
        const LIST_OPTION_FOCUSED = `.${LIST_OPTION_FOCUSED_CLASS}`
        const LIST_OPTION_SELECTED = `.${LIST_OPTION_SELECTED_CLASS}`
        const STATUS = `.${STATUS_CLASS}`
        const DEFAULT_FILTER = '.*{{query}}.*'
        const noop = () => {}

        /**
         * set the value of the element and dispatch a change event
         *
         * @param {HTMLInputElement|HTMLSelectElement} el The element to update
         * @param {string} value The new value of the element
         */
        const changeElementValue = function (el) {
          const value =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : ''
          const elementToChange = el
          elementToChange.value = value
          const event = new CustomEvent('change', {
            bubbles: true,
            cancelable: true,
            detail: {
              value,
            },
          })
          elementToChange.dispatchEvent(event)
        }

        /**
         * The elements within the combo box.
         * @typedef {Object} ComboBoxContext
         * @property {HTMLElement} comboBoxEl
         * @property {HTMLSelectElement} selectEl
         * @property {HTMLInputElement} inputEl
         * @property {HTMLUListElement} listEl
         * @property {HTMLDivElement} statusEl
         * @property {HTMLLIElement} focusedOptionEl
         * @property {HTMLLIElement} selectedOptionEl
         * @property {HTMLButtonElement} toggleListBtnEl
         * @property {HTMLButtonElement} clearInputBtnEl
         * @property {boolean} isPristine
         * @property {boolean} disableFiltering
         */

        /**
         * Get an object of elements belonging directly to the given
         * combo box component.
         *
         * @param {HTMLElement} el the element within the combo box
         * @returns {ComboBoxContext} elements
         */
        const getComboBoxContext = (el) => {
          const comboBoxEl = el.closest(COMBO_BOX)
          if (!comboBoxEl) {
            throw new Error(`Element is missing outer ${COMBO_BOX}`)
          }
          const selectEl = comboBoxEl.querySelector(SELECT)
          const inputEl = comboBoxEl.querySelector(INPUT)
          const listEl = comboBoxEl.querySelector(LIST)
          const statusEl = comboBoxEl.querySelector(STATUS)
          const focusedOptionEl = comboBoxEl.querySelector(LIST_OPTION_FOCUSED)
          const selectedOptionEl =
            comboBoxEl.querySelector(LIST_OPTION_SELECTED)
          const toggleListBtnEl = comboBoxEl.querySelector(TOGGLE_LIST_BUTTON)
          const clearInputBtnEl = comboBoxEl.querySelector(CLEAR_INPUT_BUTTON)
          const isPristine = comboBoxEl.classList.contains(
            COMBO_BOX_PRISTINE_CLASS
          )
          const disableFiltering =
            comboBoxEl.dataset.disableFiltering === 'true'
          return {
            comboBoxEl,
            selectEl,
            inputEl,
            listEl,
            statusEl,
            focusedOptionEl,
            selectedOptionEl,
            toggleListBtnEl,
            clearInputBtnEl,
            isPristine,
            disableFiltering,
          }
        }

        /**
         * Disable the combo-box component
         *
         * @param {HTMLInputElement} el An element within the combo box component
         */
        const disable = (el) => {
          const { inputEl, toggleListBtnEl, clearInputBtnEl } =
            getComboBoxContext(el)
          clearInputBtnEl.hidden = true
          clearInputBtnEl.disabled = true
          toggleListBtnEl.disabled = true
          inputEl.disabled = true
        }

        /**
         * Enable the combo-box component
         *
         * @param {HTMLInputElement} el An element within the combo box component
         */
        const enable = (el) => {
          const { inputEl, toggleListBtnEl, clearInputBtnEl } =
            getComboBoxContext(el)
          clearInputBtnEl.hidden = false
          clearInputBtnEl.disabled = false
          toggleListBtnEl.disabled = false
          inputEl.disabled = false
        }

        /**
         * Enhance a select element into a combo box component.
         *
         * @param {HTMLElement} _comboBoxEl The initial element of the combo box component
         */
        const enhanceComboBox = (_comboBoxEl) => {
          const comboBoxEl = _comboBoxEl.closest(COMBO_BOX)
          if (comboBoxEl.dataset.enhanced) return
          const selectEl = comboBoxEl.querySelector('select')
          if (!selectEl) {
            throw new Error(`${COMBO_BOX} is missing inner select`)
          }
          const selectId = selectEl.id
          const selectLabel = document.querySelector(`label[for="${selectId}"]`)
          const listId = `${selectId}--list`
          const listIdLabel = `${selectId}-label`
          const assistiveHintID = `${selectId}--assistiveHint`
          const additionalAttributes = []
          const { defaultValue } = comboBoxEl.dataset
          const { placeholder } = comboBoxEl.dataset
          let selectedOption
          if (placeholder) {
            additionalAttributes.push({
              placeholder,
            })
          }
          if (defaultValue) {
            for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
              const optionEl = selectEl.options[i]
              if (optionEl.value === defaultValue) {
                selectedOption = optionEl
                break
              }
            }
          }

          /**
           * Throw error if combobox is missing a label or label is missing
           * `for` attribute. Otherwise, set the ID to match the <ul> aria-labelledby
           */
          if (
            !selectLabel ||
            !selectLabel.matches(`label[for="${selectId}"]`)
          ) {
            throw new Error(
              `${COMBO_BOX} for ${selectId} is either missing a label or a "for" attribute`
            )
          } else {
            selectLabel.setAttribute('id', listIdLabel)
          }
          selectLabel.setAttribute('id', listIdLabel)
          selectEl.setAttribute('aria-hidden', 'true')
          selectEl.setAttribute('tabindex', '-1')
          selectEl.classList.add('usa-sr-only', SELECT_CLASS)
          selectEl.id = ''
          selectEl.value = ''
          ;['required', 'aria-label', 'aria-labelledby'].forEach((name) => {
            if (selectEl.hasAttribute(name)) {
              const value = selectEl.getAttribute(name)
              additionalAttributes.push({
                [name]: value,
              })
              selectEl.removeAttribute(name)
            }
          })

          // sanitize doesn't like functions in template literals
          const input = document.createElement('input')
          input.setAttribute('id', selectId)
          input.setAttribute('aria-owns', listId)
          input.setAttribute('aria-controls', listId)
          input.setAttribute('aria-autocomplete', 'list')
          input.setAttribute('aria-describedby', assistiveHintID)
          input.setAttribute('aria-expanded', 'false')
          input.setAttribute('autocapitalize', 'off')
          input.setAttribute('autocomplete', 'off')
          input.setAttribute('class', INPUT_CLASS)
          input.setAttribute('type', 'text')
          input.setAttribute('role', 'combobox')
          additionalAttributes.forEach((attr) =>
            Object.keys(attr).forEach((key) => {
              const value = Sanitizer.escapeHTML`${attr[key]}`
              input.setAttribute(key, value)
            })
          )
          comboBoxEl.insertAdjacentElement('beforeend', input)
          comboBoxEl.insertAdjacentHTML(
            'beforeend',
            Sanitizer.escapeHTML`
    <span class="${CLEAR_INPUT_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" class="${CLEAR_INPUT_BUTTON_CLASS}" aria-label="Clear the select contents">&nbsp;</button>
      </span>
      <span class="${INPUT_BUTTON_SEPARATOR_CLASS}">&nbsp;</span>
      <span class="${TOGGLE_LIST_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" tabindex="-1" class="${TOGGLE_LIST_BUTTON_CLASS}" aria-label="Toggle the dropdown list">&nbsp;</button>
      </span>
      <ul
        tabindex="-1"
        id="${listId}"
        class="${LIST_CLASS}"
        role="listbox"
        aria-labelledby="${listIdLabel}"
        hidden>
      </ul>
      <div class="${STATUS_CLASS} usa-sr-only" role="status"></div>
      <span id="${assistiveHintID}" class="usa-sr-only">
        When autocomplete results are available use up and down arrows to review and enter to select.
        Touch device users, explore by touch or with swipe gestures.
      </span>`
          )
          if (selectedOption) {
            const { inputEl } = getComboBoxContext(comboBoxEl)
            changeElementValue(selectEl, selectedOption.value)
            changeElementValue(inputEl, selectedOption.text)
            comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS)
          }
          if (selectEl.disabled) {
            disable(comboBoxEl)
            selectEl.disabled = false
          }
          comboBoxEl.dataset.enhanced = 'true'
        }

        /**
         * Manage the focused element within the list options when
         * navigating via keyboard.
         *
         * @param {HTMLElement} el An anchor element within the combo box component
         * @param {HTMLElement} nextEl An element within the combo box component
         * @param {Object} options options
         * @param {boolean} options.skipFocus skip focus of highlighted item
         * @param {boolean} options.preventScroll should skip procedure to scroll to element
         */
        const highlightOption = function (el, nextEl) {
          const { skipFocus, preventScroll } =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : {}
          const { inputEl, listEl, focusedOptionEl } = getComboBoxContext(el)
          if (focusedOptionEl) {
            focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS)
            focusedOptionEl.setAttribute('tabIndex', '-1')
          }
          if (nextEl) {
            inputEl.setAttribute('aria-activedescendant', nextEl.id)
            nextEl.setAttribute('tabIndex', '0')
            nextEl.classList.add(LIST_OPTION_FOCUSED_CLASS)
            if (!preventScroll) {
              const optionBottom = nextEl.offsetTop + nextEl.offsetHeight
              const currentBottom = listEl.scrollTop + listEl.offsetHeight
              if (optionBottom > currentBottom) {
                listEl.scrollTop = optionBottom - listEl.offsetHeight
              }
              if (nextEl.offsetTop < listEl.scrollTop) {
                listEl.scrollTop = nextEl.offsetTop
              }
            }
            if (!skipFocus) {
              nextEl.focus({
                preventScroll,
              })
            }
          } else {
            inputEl.setAttribute('aria-activedescendant', '')
            inputEl.focus()
          }
        }

        /**
         * Generate a dynamic regular expression based off of a replaceable and possibly filtered value.
         *
         * @param {string} el An element within the combo box component
         * @param {string} query The value to use in the regular expression
         * @param {object} extras An object of regular expressions to replace and filter the query
         */
        const generateDynamicRegExp = function (filter) {
          const query =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : ''
          const extras =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : {}
          const escapeRegExp = (text) =>
            text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
          let find = filter.replace(/{{(.*?)}}/g, (m, $1) => {
            const key = $1.trim()
            const queryFilter = extras[key]
            if (key !== 'query' && queryFilter) {
              const matcher = new RegExp(queryFilter, 'i')
              const matches = query.match(matcher)
              if (matches) {
                return escapeRegExp(matches[1])
              }
              return ''
            }
            return escapeRegExp(query)
          })
          find = `^(?:${find})$`
          return new RegExp(find, 'i')
        }

        /**
         * Display the option list of a combo box component.
         *
         * @param {HTMLElement} el An element within the combo box component
         */
        const displayList = (el) => {
          const {
            comboBoxEl,
            selectEl,
            inputEl,
            listEl,
            statusEl,
            isPristine,
            disableFiltering,
          } = getComboBoxContext(el)
          let selectedItemId
          let firstFoundId
          const listOptionBaseId = `${listEl.id}--option-`
          const inputValue = (inputEl.value || '').toLowerCase()
          const filter = comboBoxEl.dataset.filter || DEFAULT_FILTER
          const regex = generateDynamicRegExp(
            filter,
            inputValue,
            comboBoxEl.dataset
          )
          const options = []
          for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
            const optionEl = selectEl.options[i]
            const optionId = `${listOptionBaseId}${options.length}`
            if (
              optionEl.value &&
              (disableFiltering ||
                isPristine ||
                !inputValue ||
                regex.test(optionEl.text))
            ) {
              if (selectEl.value && optionEl.value === selectEl.value) {
                selectedItemId = optionId
              }
              if (
                disableFiltering &&
                !firstFoundId &&
                regex.test(optionEl.text)
              ) {
                firstFoundId = optionId
              }
              options.push(optionEl)
            }
          }
          const numOptions = options.length
          const optionHtml = options.map((option, index) => {
            const optionId = `${listOptionBaseId}${index}`
            const classes = [LIST_OPTION_CLASS]
            let tabindex = '-1'
            let ariaSelected = 'false'
            if (optionId === selectedItemId) {
              classes.push(
                LIST_OPTION_SELECTED_CLASS,
                LIST_OPTION_FOCUSED_CLASS
              )
              tabindex = '0'
              ariaSelected = 'true'
            }
            if (!selectedItemId && index === 0) {
              classes.push(LIST_OPTION_FOCUSED_CLASS)
              tabindex = '0'
            }
            const li = document.createElement('li')
            li.setAttribute('aria-setsize', options.length)
            li.setAttribute('aria-posinset', index + 1)
            li.setAttribute('aria-selected', ariaSelected)
            li.setAttribute('id', optionId)
            li.setAttribute('class', classes.join(' '))
            li.setAttribute('tabindex', tabindex)
            li.setAttribute('role', 'option')
            li.setAttribute('data-value', option.value)
            li.textContent = option.text
            return li
          })
          const noResults = document.createElement('li')
          noResults.setAttribute('class', `${LIST_OPTION_CLASS}--no-results`)
          noResults.textContent = 'No results found'
          listEl.hidden = false
          if (numOptions) {
            listEl.innerHTML = ''
            optionHtml.forEach((item) =>
              listEl.insertAdjacentElement('beforeend', item)
            )
          } else {
            listEl.innerHTML = ''
            listEl.insertAdjacentElement('beforeend', noResults)
          }
          inputEl.setAttribute('aria-expanded', 'true')
          statusEl.textContent = numOptions
            ? `${numOptions} result${numOptions > 1 ? 's' : ''} available.`
            : 'No results.'
          let itemToFocus
          if (isPristine && selectedItemId) {
            itemToFocus = listEl.querySelector(`#${selectedItemId}`)
          } else if (disableFiltering && firstFoundId) {
            itemToFocus = listEl.querySelector(`#${firstFoundId}`)
          }
          if (itemToFocus) {
            highlightOption(listEl, itemToFocus, {
              skipFocus: true,
            })
          }
        }

        /**
         * Hide the option list of a combo box component.
         *
         * @param {HTMLElement} el An element within the combo box component
         */
        const hideList = (el) => {
          const { inputEl, listEl, statusEl, focusedOptionEl } =
            getComboBoxContext(el)
          statusEl.innerHTML = ''
          inputEl.setAttribute('aria-expanded', 'false')
          inputEl.setAttribute('aria-activedescendant', '')
          if (focusedOptionEl) {
            focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS)
          }
          listEl.scrollTop = 0
          listEl.hidden = true
        }

        /**
         * Select an option list of the combo box component.
         *
         * @param {HTMLElement} listOptionEl The list option being selected
         */
        const selectItem = (listOptionEl) => {
          const { comboBoxEl, selectEl, inputEl } =
            getComboBoxContext(listOptionEl)
          changeElementValue(selectEl, listOptionEl.dataset.value)
          changeElementValue(inputEl, listOptionEl.textContent)
          comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS)
          hideList(comboBoxEl)
          inputEl.focus()
        }

        /**
         * Clear the input of the combo box
         *
         * @param {HTMLButtonElement} clearButtonEl The clear input button
         */
        const clearInput = (clearButtonEl) => {
          const { comboBoxEl, listEl, selectEl, inputEl } =
            getComboBoxContext(clearButtonEl)
          const listShown = !listEl.hidden
          if (selectEl.value) changeElementValue(selectEl)
          if (inputEl.value) changeElementValue(inputEl)
          comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS)
          if (listShown) displayList(comboBoxEl)
          inputEl.focus()
        }

        /**
         * Reset the select based off of currently set select value
         *
         * @param {HTMLElement} el An element within the combo box component
         */
        const resetSelection = (el) => {
          const { comboBoxEl, selectEl, inputEl } = getComboBoxContext(el)
          const selectValue = selectEl.value
          const inputValue = (inputEl.value || '').toLowerCase()
          if (selectValue) {
            for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
              const optionEl = selectEl.options[i]
              if (optionEl.value === selectValue) {
                if (inputValue !== optionEl.text) {
                  changeElementValue(inputEl, optionEl.text)
                }
                comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS)
                return
              }
            }
          }
          if (inputValue) {
            changeElementValue(inputEl)
          }
        }

        /**
         * Select an option list of the combo box component based off of
         * having a current focused list option or
         * having test that completely matches a list option.
         * Otherwise it clears the input and select.
         *
         * @param {HTMLElement} el An element within the combo box component
         */
        const completeSelection = (el) => {
          const { comboBoxEl, selectEl, inputEl, statusEl } =
            getComboBoxContext(el)
          statusEl.textContent = ''
          const inputValue = (inputEl.value || '').toLowerCase()
          if (inputValue) {
            for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
              const optionEl = selectEl.options[i]
              if (optionEl.text.toLowerCase() === inputValue) {
                changeElementValue(selectEl, optionEl.value)
                changeElementValue(inputEl, optionEl.text)
                comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS)
                return
              }
            }
          }
          resetSelection(comboBoxEl)
        }

        /**
         * Handle the escape event within the combo box component.
         *
         * @param {KeyboardEvent} event An event within the combo box component
         */
        const handleEscape = (event) => {
          const { comboBoxEl, inputEl } = getComboBoxContext(event.target)
          hideList(comboBoxEl)
          resetSelection(comboBoxEl)
          inputEl.focus()
        }

        /**
         * Handle the down event within the combo box component.
         *
         * @param {KeyboardEvent} event An event within the combo box component
         */
        const handleDownFromInput = (event) => {
          const { comboBoxEl, listEl } = getComboBoxContext(event.target)
          if (listEl.hidden) {
            displayList(comboBoxEl)
          }
          const nextOptionEl =
            listEl.querySelector(LIST_OPTION_FOCUSED) ||
            listEl.querySelector(LIST_OPTION)
          if (nextOptionEl) {
            highlightOption(comboBoxEl, nextOptionEl)
          }
          event.preventDefault()
        }

        /**
         * Handle the enter event from an input element within the combo box component.
         *
         * @param {KeyboardEvent} event An event within the combo box component
         */
        const handleEnterFromInput = (event) => {
          const { comboBoxEl, listEl } = getComboBoxContext(event.target)
          const listShown = !listEl.hidden
          completeSelection(comboBoxEl)
          if (listShown) {
            hideList(comboBoxEl)
          }
          event.preventDefault()
        }

        /**
         * Handle the down event within the combo box component.
         *
         * @param {KeyboardEvent} event An event within the combo box component
         */
        const handleDownFromListOption = (event) => {
          const focusedOptionEl = event.target
          const nextOptionEl = focusedOptionEl.nextSibling
          if (nextOptionEl) {
            highlightOption(focusedOptionEl, nextOptionEl)
          }
          event.preventDefault()
        }

        /**
         * Handle the tab event from an list option element within the combo box component.
         *
         * @param {KeyboardEvent} event An event within the combo box component
         */
        const handleTabFromListOption = (event) => {
          selectItem(event.target)
          event.preventDefault()
        }

        /**
         * Handle the enter event from list option within the combo box component.
         *
         * @param {KeyboardEvent} event An event within the combo box component
         */
        const handleEnterFromListOption = (event) => {
          selectItem(event.target)
          event.preventDefault()
        }

        /**
         * Handle the up event from list option within the combo box component.
         *
         * @param {KeyboardEvent} event An event within the combo box component
         */
        const handleUpFromListOption = (event) => {
          const { comboBoxEl, listEl, focusedOptionEl } = getComboBoxContext(
            event.target
          )
          const nextOptionEl =
            focusedOptionEl && focusedOptionEl.previousSibling
          const listShown = !listEl.hidden
          highlightOption(comboBoxEl, nextOptionEl)
          if (listShown) {
            event.preventDefault()
          }
          if (!nextOptionEl) {
            hideList(comboBoxEl)
          }
        }

        /**
         * Select list option on the mouseover event.
         *
         * @param {MouseEvent} event The mouseover event
         * @param {HTMLLIElement} listOptionEl An element within the combo box component
         */
        const handleMouseover = (listOptionEl) => {
          const isCurrentlyFocused = listOptionEl.classList.contains(
            LIST_OPTION_FOCUSED_CLASS
          )
          if (isCurrentlyFocused) return
          highlightOption(listOptionEl, listOptionEl, {
            preventScroll: true,
          })
        }

        /**
         * Toggle the list when the button is clicked
         *
         * @param {HTMLElement} el An element within the combo box component
         */
        const toggleList = (el) => {
          const { comboBoxEl, listEl, inputEl } = getComboBoxContext(el)
          if (listEl.hidden) {
            displayList(comboBoxEl)
          } else {
            hideList(comboBoxEl)
          }
          inputEl.focus()
        }

        /**
         * Handle click from input
         *
         * @param {HTMLInputElement} el An element within the combo box component
         */
        const handleClickFromInput = (el) => {
          const { comboBoxEl, listEl } = getComboBoxContext(el)
          if (listEl.hidden) {
            displayList(comboBoxEl)
          }
        }
        const comboBox = behavior(
          {
            [CLICK]: {
              [INPUT]() {
                if (this.disabled) return
                handleClickFromInput(this)
              },
              [TOGGLE_LIST_BUTTON]() {
                if (this.disabled) return
                toggleList(this)
              },
              [LIST_OPTION]() {
                if (this.disabled) return
                selectItem(this)
              },
              [CLEAR_INPUT_BUTTON]() {
                if (this.disabled) return
                clearInput(this)
              },
            },
            focusout: {
              [COMBO_BOX](event) {
                if (!this.contains(event.relatedTarget)) {
                  resetSelection(this)
                  hideList(this)
                }
              },
            },
            keydown: {
              [COMBO_BOX]: keymap({
                Escape: handleEscape,
              }),
              [INPUT]: keymap({
                Enter: handleEnterFromInput,
                ArrowDown: handleDownFromInput,
                Down: handleDownFromInput,
              }),
              [LIST_OPTION]: keymap({
                ArrowUp: handleUpFromListOption,
                Up: handleUpFromListOption,
                ArrowDown: handleDownFromListOption,
                Down: handleDownFromListOption,
                Enter: handleEnterFromListOption,
                Tab: handleTabFromListOption,
                'Shift+Tab': noop,
              }),
            },
            input: {
              [INPUT]() {
                const comboBoxEl = this.closest(COMBO_BOX)
                comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS)
                displayList(this)
              },
            },
            mouseover: {
              [LIST_OPTION]() {
                handleMouseover(this)
              },
            },
          },
          {
            init(root) {
              select(COMBO_BOX, root).forEach((comboBoxEl) => {
                enhanceComboBox(comboBoxEl)
              })
            },
            getComboBoxContext,
            enhanceComboBox,
            generateDynamicRegExp,
            disable,
            enable,
            displayList,
            hideList,
            COMBO_BOX_CLASS,
          }
        )
        module.exports = comboBox
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/sanitizer': 47,
        '../utils/select': 49,
        'receptor/keymap': 12,
      },
    ],
    19: [
      function (require, module, exports) {
        'use strict'

        const keymap = require('receptor/keymap')
        const behavior = require('../utils/behavior')
        const select = require('../utils/select')
        const { prefix: PREFIX } = require('../config')
        const { CLICK } = require('../events')
        const activeElement = require('../utils/active-element')
        const isIosDevice = require('../utils/is-ios-device')
        const Sanitizer = require('../utils/sanitizer')
        const DATE_PICKER_CLASS = `${PREFIX}-date-picker`
        const DATE_PICKER_WRAPPER_CLASS = `${DATE_PICKER_CLASS}__wrapper`
        const DATE_PICKER_INITIALIZED_CLASS = `${DATE_PICKER_CLASS}--initialized`
        const DATE_PICKER_ACTIVE_CLASS = `${DATE_PICKER_CLASS}--active`
        const DATE_PICKER_INTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__internal-input`
        const DATE_PICKER_EXTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__external-input`
        const DATE_PICKER_BUTTON_CLASS = `${DATE_PICKER_CLASS}__button`
        const DATE_PICKER_CALENDAR_CLASS = `${DATE_PICKER_CLASS}__calendar`
        const DATE_PICKER_STATUS_CLASS = `${DATE_PICKER_CLASS}__status`
        const CALENDAR_DATE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date`
        const CALENDAR_DATE_FOCUSED_CLASS = `${CALENDAR_DATE_CLASS}--focused`
        const CALENDAR_DATE_SELECTED_CLASS = `${CALENDAR_DATE_CLASS}--selected`
        const CALENDAR_DATE_PREVIOUS_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--previous-month`
        const CALENDAR_DATE_CURRENT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--current-month`
        const CALENDAR_DATE_NEXT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--next-month`
        const CALENDAR_DATE_RANGE_DATE_CLASS = `${CALENDAR_DATE_CLASS}--range-date`
        const CALENDAR_DATE_TODAY_CLASS = `${CALENDAR_DATE_CLASS}--today`
        const CALENDAR_DATE_RANGE_DATE_START_CLASS = `${CALENDAR_DATE_CLASS}--range-date-start`
        const CALENDAR_DATE_RANGE_DATE_END_CLASS = `${CALENDAR_DATE_CLASS}--range-date-end`
        const CALENDAR_DATE_WITHIN_RANGE_CLASS = `${CALENDAR_DATE_CLASS}--within-range`
        const CALENDAR_PREVIOUS_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year`
        const CALENDAR_PREVIOUS_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-month`
        const CALENDAR_NEXT_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year`
        const CALENDAR_NEXT_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-month`
        const CALENDAR_MONTH_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-selection`
        const CALENDAR_YEAR_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-selection`
        const CALENDAR_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month`
        const CALENDAR_MONTH_FOCUSED_CLASS = `${CALENDAR_MONTH_CLASS}--focused`
        const CALENDAR_MONTH_SELECTED_CLASS = `${CALENDAR_MONTH_CLASS}--selected`
        const CALENDAR_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year`
        const CALENDAR_YEAR_FOCUSED_CLASS = `${CALENDAR_YEAR_CLASS}--focused`
        const CALENDAR_YEAR_SELECTED_CLASS = `${CALENDAR_YEAR_CLASS}--selected`
        const CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year-chunk`
        const CALENDAR_NEXT_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year-chunk`
        const CALENDAR_DATE_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date-picker`
        const CALENDAR_MONTH_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-picker`
        const CALENDAR_YEAR_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-picker`
        const CALENDAR_TABLE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__table`
        const CALENDAR_ROW_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__row`
        const CALENDAR_CELL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__cell`
        const CALENDAR_CELL_CENTER_ITEMS_CLASS = `${CALENDAR_CELL_CLASS}--center-items`
        const CALENDAR_MONTH_LABEL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-label`
        const CALENDAR_DAY_OF_WEEK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__day-of-week`
        const DATE_PICKER = `.${DATE_PICKER_CLASS}`
        const DATE_PICKER_BUTTON = `.${DATE_PICKER_BUTTON_CLASS}`
        const DATE_PICKER_INTERNAL_INPUT = `.${DATE_PICKER_INTERNAL_INPUT_CLASS}`
        const DATE_PICKER_EXTERNAL_INPUT = `.${DATE_PICKER_EXTERNAL_INPUT_CLASS}`
        const DATE_PICKER_CALENDAR = `.${DATE_PICKER_CALENDAR_CLASS}`
        const DATE_PICKER_STATUS = `.${DATE_PICKER_STATUS_CLASS}`
        const CALENDAR_DATE = `.${CALENDAR_DATE_CLASS}`
        const CALENDAR_DATE_FOCUSED = `.${CALENDAR_DATE_FOCUSED_CLASS}`
        const CALENDAR_DATE_CURRENT_MONTH = `.${CALENDAR_DATE_CURRENT_MONTH_CLASS}`
        const CALENDAR_PREVIOUS_YEAR = `.${CALENDAR_PREVIOUS_YEAR_CLASS}`
        const CALENDAR_PREVIOUS_MONTH = `.${CALENDAR_PREVIOUS_MONTH_CLASS}`
        const CALENDAR_NEXT_YEAR = `.${CALENDAR_NEXT_YEAR_CLASS}`
        const CALENDAR_NEXT_MONTH = `.${CALENDAR_NEXT_MONTH_CLASS}`
        const CALENDAR_YEAR_SELECTION = `.${CALENDAR_YEAR_SELECTION_CLASS}`
        const CALENDAR_MONTH_SELECTION = `.${CALENDAR_MONTH_SELECTION_CLASS}`
        const CALENDAR_MONTH = `.${CALENDAR_MONTH_CLASS}`
        const CALENDAR_YEAR = `.${CALENDAR_YEAR_CLASS}`
        const CALENDAR_PREVIOUS_YEAR_CHUNK = `.${CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS}`
        const CALENDAR_NEXT_YEAR_CHUNK = `.${CALENDAR_NEXT_YEAR_CHUNK_CLASS}`
        const CALENDAR_DATE_PICKER = `.${CALENDAR_DATE_PICKER_CLASS}`
        const CALENDAR_MONTH_PICKER = `.${CALENDAR_MONTH_PICKER_CLASS}`
        const CALENDAR_YEAR_PICKER = `.${CALENDAR_YEAR_PICKER_CLASS}`
        const CALENDAR_MONTH_FOCUSED = `.${CALENDAR_MONTH_FOCUSED_CLASS}`
        const CALENDAR_YEAR_FOCUSED = `.${CALENDAR_YEAR_FOCUSED_CLASS}`
        const VALIDATION_MESSAGE = 'Please enter a valid date'
        const MONTH_LABELS = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]
        const DAY_OF_WEEK_LABELS = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]
        const ENTER_KEYCODE = 13
        const YEAR_CHUNK = 12
        const DEFAULT_MIN_DATE = '0000-01-01'
        const DEFAULT_EXTERNAL_DATE_FORMAT = 'MM/DD/YYYY'
        const INTERNAL_DATE_FORMAT = 'YYYY-MM-DD'
        const NOT_DISABLED_SELECTOR = ':not([disabled])'
        const processFocusableSelectors = function () {
          for (
            var _len = arguments.length, selectors = new Array(_len), _key = 0;
            _key < _len;
            _key++
          ) {
            selectors[_key] = arguments[_key]
          }
          return selectors
            .map((query) => query + NOT_DISABLED_SELECTOR)
            .join(', ')
        }
        const DATE_PICKER_FOCUSABLE = processFocusableSelectors(
          CALENDAR_PREVIOUS_YEAR,
          CALENDAR_PREVIOUS_MONTH,
          CALENDAR_YEAR_SELECTION,
          CALENDAR_MONTH_SELECTION,
          CALENDAR_NEXT_YEAR,
          CALENDAR_NEXT_MONTH,
          CALENDAR_DATE_FOCUSED
        )
        const MONTH_PICKER_FOCUSABLE = processFocusableSelectors(
          CALENDAR_MONTH_FOCUSED
        )
        const YEAR_PICKER_FOCUSABLE = processFocusableSelectors(
          CALENDAR_PREVIOUS_YEAR_CHUNK,
          CALENDAR_NEXT_YEAR_CHUNK,
          CALENDAR_YEAR_FOCUSED
        )

        // #region Date Manipulation Functions

        /**
         * Keep date within month. Month would only be over by 1 to 3 days
         *
         * @param {Date} dateToCheck the date object to check
         * @param {number} month the correct month
         * @returns {Date} the date, corrected if needed
         */
        const keepDateWithinMonth = (dateToCheck, month) => {
          if (month !== dateToCheck.getMonth()) {
            dateToCheck.setDate(0)
          }
          return dateToCheck
        }

        /**
         * Set date from month day year
         *
         * @param {number} year the year to set
         * @param {number} month the month to set (zero-indexed)
         * @param {number} date the date to set
         * @returns {Date} the set date
         */
        const setDate = (year, month, date) => {
          const newDate = new Date(0)
          newDate.setFullYear(year, month, date)
          return newDate
        }

        /**
         * todays date
         *
         * @returns {Date} todays date
         */
        const today = () => {
          const newDate = new Date()
          const day = newDate.getDate()
          const month = newDate.getMonth()
          const year = newDate.getFullYear()
          return setDate(year, month, day)
        }

        /**
         * Set date to first day of the month
         *
         * @param {number} date the date to adjust
         * @returns {Date} the adjusted date
         */
        const startOfMonth = (date) => {
          const newDate = new Date(0)
          newDate.setFullYear(date.getFullYear(), date.getMonth(), 1)
          return newDate
        }

        /**
         * Set date to last day of the month
         *
         * @param {number} date the date to adjust
         * @returns {Date} the adjusted date
         */
        const lastDayOfMonth = (date) => {
          const newDate = new Date(0)
          newDate.setFullYear(date.getFullYear(), date.getMonth() + 1, 0)
          return newDate
        }

        /**
         * Add days to date
         *
         * @param {Date} _date the date to adjust
         * @param {number} numDays the difference in days
         * @returns {Date} the adjusted date
         */
        const addDays = (_date, numDays) => {
          const newDate = new Date(_date.getTime())
          newDate.setDate(newDate.getDate() + numDays)
          return newDate
        }

        /**
         * Subtract days from date
         *
         * @param {Date} _date the date to adjust
         * @param {number} numDays the difference in days
         * @returns {Date} the adjusted date
         */
        const subDays = (_date, numDays) => addDays(_date, -numDays)

        /**
         * Add weeks to date
         *
         * @param {Date} _date the date to adjust
         * @param {number} numWeeks the difference in weeks
         * @returns {Date} the adjusted date
         */
        const addWeeks = (_date, numWeeks) => addDays(_date, numWeeks * 7)

        /**
         * Subtract weeks from date
         *
         * @param {Date} _date the date to adjust
         * @param {number} numWeeks the difference in weeks
         * @returns {Date} the adjusted date
         */
        const subWeeks = (_date, numWeeks) => addWeeks(_date, -numWeeks)

        /**
         * Set date to the start of the week (Sunday)
         *
         * @param {Date} _date the date to adjust
         * @returns {Date} the adjusted date
         */
        const startOfWeek = (_date) => {
          const dayOfWeek = _date.getDay()
          return subDays(_date, dayOfWeek)
        }

        /**
         * Set date to the end of the week (Saturday)
         *
         * @param {Date} _date the date to adjust
         * @param {number} numWeeks the difference in weeks
         * @returns {Date} the adjusted date
         */
        const endOfWeek = (_date) => {
          const dayOfWeek = _date.getDay()
          return addDays(_date, 6 - dayOfWeek)
        }

        /**
         * Add months to date and keep date within month
         *
         * @param {Date} _date the date to adjust
         * @param {number} numMonths the difference in months
         * @returns {Date} the adjusted date
         */
        const addMonths = (_date, numMonths) => {
          const newDate = new Date(_date.getTime())
          const dateMonth = (newDate.getMonth() + 12 + numMonths) % 12
          newDate.setMonth(newDate.getMonth() + numMonths)
          keepDateWithinMonth(newDate, dateMonth)
          return newDate
        }

        /**
         * Subtract months from date
         *
         * @param {Date} _date the date to adjust
         * @param {number} numMonths the difference in months
         * @returns {Date} the adjusted date
         */
        const subMonths = (_date, numMonths) => addMonths(_date, -numMonths)

        /**
         * Add years to date and keep date within month
         *
         * @param {Date} _date the date to adjust
         * @param {number} numYears the difference in years
         * @returns {Date} the adjusted date
         */
        const addYears = (_date, numYears) => addMonths(_date, numYears * 12)

        /**
         * Subtract years from date
         *
         * @param {Date} _date the date to adjust
         * @param {number} numYears the difference in years
         * @returns {Date} the adjusted date
         */
        const subYears = (_date, numYears) => addYears(_date, -numYears)

        /**
         * Set months of date
         *
         * @param {Date} _date the date to adjust
         * @param {number} month zero-indexed month to set
         * @returns {Date} the adjusted date
         */
        const setMonth = (_date, month) => {
          const newDate = new Date(_date.getTime())
          newDate.setMonth(month)
          keepDateWithinMonth(newDate, month)
          return newDate
        }

        /**
         * Set year of date
         *
         * @param {Date} _date the date to adjust
         * @param {number} year the year to set
         * @returns {Date} the adjusted date
         */
        const setYear = (_date, year) => {
          const newDate = new Date(_date.getTime())
          const month = newDate.getMonth()
          newDate.setFullYear(year)
          keepDateWithinMonth(newDate, month)
          return newDate
        }

        /**
         * Return the earliest date
         *
         * @param {Date} dateA date to compare
         * @param {Date} dateB date to compare
         * @returns {Date} the earliest date
         */
        const min = (dateA, dateB) => {
          let newDate = dateA
          if (dateB < dateA) {
            newDate = dateB
          }
          return new Date(newDate.getTime())
        }

        /**
         * Return the latest date
         *
         * @param {Date} dateA date to compare
         * @param {Date} dateB date to compare
         * @returns {Date} the latest date
         */
        const max = (dateA, dateB) => {
          let newDate = dateA
          if (dateB > dateA) {
            newDate = dateB
          }
          return new Date(newDate.getTime())
        }

        /**
         * Check if dates are the in the same year
         *
         * @param {Date} dateA date to compare
         * @param {Date} dateB date to compare
         * @returns {boolean} are dates in the same year
         */
        const isSameYear = (dateA, dateB) =>
          dateA && dateB && dateA.getFullYear() === dateB.getFullYear()

        /**
         * Check if dates are the in the same month
         *
         * @param {Date} dateA date to compare
         * @param {Date} dateB date to compare
         * @returns {boolean} are dates in the same month
         */
        const isSameMonth = (dateA, dateB) =>
          isSameYear(dateA, dateB) && dateA.getMonth() === dateB.getMonth()

        /**
         * Check if dates are the same date
         *
         * @param {Date} dateA the date to compare
         * @param {Date} dateA the date to compare
         * @returns {boolean} are dates the same date
         */
        const isSameDay = (dateA, dateB) =>
          isSameMonth(dateA, dateB) && dateA.getDate() === dateB.getDate()

        /**
         * return a new date within minimum and maximum date
         *
         * @param {Date} date date to check
         * @param {Date} minDate minimum date to allow
         * @param {Date} maxDate maximum date to allow
         * @returns {Date} the date between min and max
         */
        const keepDateBetweenMinAndMax = (date, minDate, maxDate) => {
          let newDate = date
          if (date < minDate) {
            newDate = minDate
          } else if (maxDate && date > maxDate) {
            newDate = maxDate
          }
          return new Date(newDate.getTime())
        }

        /**
         * Check if dates is valid.
         *
         * @param {Date} date date to check
         * @param {Date} minDate minimum date to allow
         * @param {Date} maxDate maximum date to allow
         * @return {boolean} is there a day within the month within min and max dates
         */
        const isDateWithinMinAndMax = (date, minDate, maxDate) =>
          date >= minDate && (!maxDate || date <= maxDate)

        /**
         * Check if dates month is invalid.
         *
         * @param {Date} date date to check
         * @param {Date} minDate minimum date to allow
         * @param {Date} maxDate maximum date to allow
         * @return {boolean} is the month outside min or max dates
         */
        const isDatesMonthOutsideMinOrMax = (date, minDate, maxDate) =>
          lastDayOfMonth(date) < minDate ||
          (maxDate && startOfMonth(date) > maxDate)

        /**
         * Check if dates year is invalid.
         *
         * @param {Date} date date to check
         * @param {Date} minDate minimum date to allow
         * @param {Date} maxDate maximum date to allow
         * @return {boolean} is the month outside min or max dates
         */
        const isDatesYearOutsideMinOrMax = (date, minDate, maxDate) =>
          lastDayOfMonth(setMonth(date, 11)) < minDate ||
          (maxDate && startOfMonth(setMonth(date, 0)) > maxDate)

        /**
         * Parse a date with format M-D-YY
         *
         * @param {string} dateString the date string to parse
         * @param {string} dateFormat the format of the date string
         * @param {boolean} adjustDate should the date be adjusted
         * @returns {Date} the parsed date
         */
        const parseDateString = function (dateString) {
          const dateFormat =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : INTERNAL_DATE_FORMAT
          const adjustDate =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : false
          let date
          let month
          let day
          let year
          let parsed
          if (dateString) {
            let monthStr
            let dayStr
            let yearStr
            if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
              ;[monthStr, dayStr, yearStr] = dateString.split('/')
            } else {
              ;[yearStr, monthStr, dayStr] = dateString.split('-')
            }
            if (yearStr) {
              parsed = parseInt(yearStr, 10)
              if (!Number.isNaN(parsed)) {
                year = parsed
                if (adjustDate) {
                  year = Math.max(0, year)
                  if (yearStr.length < 3) {
                    const currentYear = today().getFullYear()
                    const currentYearStub =
                      currentYear - (currentYear % 10 ** yearStr.length)
                    year = currentYearStub + parsed
                  }
                }
              }
            }
            if (monthStr) {
              parsed = parseInt(monthStr, 10)
              if (!Number.isNaN(parsed)) {
                month = parsed
                if (adjustDate) {
                  month = Math.max(1, month)
                  month = Math.min(12, month)
                }
              }
            }
            if (month && dayStr && year != null) {
              parsed = parseInt(dayStr, 10)
              if (!Number.isNaN(parsed)) {
                day = parsed
                if (adjustDate) {
                  const lastDayOfTheMonth = setDate(year, month, 0).getDate()
                  day = Math.max(1, day)
                  day = Math.min(lastDayOfTheMonth, day)
                }
              }
            }
            if (month && day && year != null) {
              date = setDate(year, month - 1, day)
            }
          }
          return date
        }

        /**
         * Format a date to format MM-DD-YYYY
         *
         * @param {Date} date the date to format
         * @param {string} dateFormat the format of the date string
         * @returns {string} the formatted date string
         */
        const formatDate = function (date) {
          const dateFormat =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : INTERNAL_DATE_FORMAT
          const padZeros = (value, length) => `0000${value}`.slice(-length)
          const month = date.getMonth() + 1
          const day = date.getDate()
          const year = date.getFullYear()
          if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
            return [
              padZeros(month, 2),
              padZeros(day, 2),
              padZeros(year, 4),
            ].join('/')
          }
          return [padZeros(year, 4), padZeros(month, 2), padZeros(day, 2)].join(
            '-'
          )
        }

        // #endregion Date Manipulation Functions

        /**
         * Create a grid string from an array of html strings
         *
         * @param {string[]} htmlArray the array of html items
         * @param {number} rowSize the length of a row
         * @returns {string} the grid string
         */
        const listToGridHtml = (htmlArray, rowSize) => {
          const grid = []
          let row = []
          let i = 0
          while (i < htmlArray.length) {
            row = []
            const tr = document.createElement('tr')
            while (i < htmlArray.length && row.length < rowSize) {
              const td = document.createElement('td')
              td.insertAdjacentElement('beforeend', htmlArray[i])
              row.push(td)
              i += 1
            }
            row.forEach((element) => {
              tr.insertAdjacentElement('beforeend', element)
            })
            grid.push(tr)
          }
          return grid
        }
        const createTableBody = (grid) => {
          const tableBody = document.createElement('tbody')
          grid.forEach((element) => {
            tableBody.insertAdjacentElement('beforeend', element)
          })
          return tableBody
        }

        /**
         * set the value of the element and dispatch a change event
         *
         * @param {HTMLInputElement} el The element to update
         * @param {string} value The new value of the element
         */
        const changeElementValue = function (el) {
          const value =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : ''
          const elementToChange = el
          elementToChange.value = value
          const event = new CustomEvent('change', {
            bubbles: true,
            cancelable: true,
            detail: {
              value,
            },
          })
          elementToChange.dispatchEvent(event)
        }

        /**
         * The properties and elements within the date picker.
         * @typedef {Object} DatePickerContext
         * @property {HTMLDivElement} calendarEl
         * @property {HTMLElement} datePickerEl
         * @property {HTMLInputElement} internalInputEl
         * @property {HTMLInputElement} externalInputEl
         * @property {HTMLDivElement} statusEl
         * @property {HTMLDivElement} firstYearChunkEl
         * @property {Date} calendarDate
         * @property {Date} minDate
         * @property {Date} maxDate
         * @property {Date} selectedDate
         * @property {Date} rangeDate
         * @property {Date} defaultDate
         */

        /**
         * Get an object of the properties and elements belonging directly to the given
         * date picker component.
         *
         * @param {HTMLElement} el the element within the date picker
         * @returns {DatePickerContext} elements
         */
        const getDatePickerContext = (el) => {
          const datePickerEl = el.closest(DATE_PICKER)
          if (!datePickerEl) {
            throw new Error(`Element is missing outer ${DATE_PICKER}`)
          }
          const internalInputEl = datePickerEl.querySelector(
            DATE_PICKER_INTERNAL_INPUT
          )
          const externalInputEl = datePickerEl.querySelector(
            DATE_PICKER_EXTERNAL_INPUT
          )
          const calendarEl = datePickerEl.querySelector(DATE_PICKER_CALENDAR)
          const toggleBtnEl = datePickerEl.querySelector(DATE_PICKER_BUTTON)
          const statusEl = datePickerEl.querySelector(DATE_PICKER_STATUS)
          const firstYearChunkEl = datePickerEl.querySelector(CALENDAR_YEAR)
          const inputDate = parseDateString(
            externalInputEl.value,
            DEFAULT_EXTERNAL_DATE_FORMAT,
            true
          )
          const selectedDate = parseDateString(internalInputEl.value)
          const calendarDate = parseDateString(calendarEl.dataset.value)
          const minDate = parseDateString(datePickerEl.dataset.minDate)
          const maxDate = parseDateString(datePickerEl.dataset.maxDate)
          const rangeDate = parseDateString(datePickerEl.dataset.rangeDate)
          const defaultDate = parseDateString(datePickerEl.dataset.defaultDate)
          if (minDate && maxDate && minDate > maxDate) {
            throw new Error('Minimum date cannot be after maximum date')
          }
          return {
            calendarDate,
            minDate,
            toggleBtnEl,
            selectedDate,
            maxDate,
            firstYearChunkEl,
            datePickerEl,
            inputDate,
            internalInputEl,
            externalInputEl,
            calendarEl,
            rangeDate,
            defaultDate,
            statusEl,
          }
        }

        /**
         * Disable the date picker component
         *
         * @param {HTMLElement} el An element within the date picker component
         */
        const disable = (el) => {
          const { externalInputEl, toggleBtnEl } = getDatePickerContext(el)
          toggleBtnEl.disabled = true
          externalInputEl.disabled = true
        }

        /**
         * Enable the date picker component
         *
         * @param {HTMLElement} el An element within the date picker component
         */
        const enable = (el) => {
          const { externalInputEl, toggleBtnEl } = getDatePickerContext(el)
          toggleBtnEl.disabled = false
          externalInputEl.disabled = false
        }

        // #region Validation

        /**
         * Validate the value in the input as a valid date of format M/D/YYYY
         *
         * @param {HTMLElement} el An element within the date picker component
         */
        const isDateInputInvalid = (el) => {
          const { externalInputEl, minDate, maxDate } = getDatePickerContext(el)
          const dateString = externalInputEl.value
          let isInvalid = false
          if (dateString) {
            isInvalid = true
            const dateStringParts = dateString.split('/')
            const [month, day, year] = dateStringParts.map((str) => {
              let value
              const parsed = parseInt(str, 10)
              if (!Number.isNaN(parsed)) value = parsed
              return value
            })
            if (month && day && year != null) {
              const checkDate = setDate(year, month - 1, day)
              if (
                checkDate.getMonth() === month - 1 &&
                checkDate.getDate() === day &&
                checkDate.getFullYear() === year &&
                dateStringParts[2].length === 4 &&
                isDateWithinMinAndMax(checkDate, minDate, maxDate)
              ) {
                isInvalid = false
              }
            }
          }
          return isInvalid
        }

        /**
         * Validate the value in the input as a valid date of format M/D/YYYY
         *
         * @param {HTMLElement} el An element within the date picker component
         */
        const validateDateInput = (el) => {
          const { externalInputEl } = getDatePickerContext(el)
          const isInvalid = isDateInputInvalid(externalInputEl)
          if (isInvalid && !externalInputEl.validationMessage) {
            externalInputEl.setCustomValidity(VALIDATION_MESSAGE)
          }
          if (
            !isInvalid &&
            externalInputEl.validationMessage === VALIDATION_MESSAGE
          ) {
            externalInputEl.setCustomValidity('')
          }
        }

        // #endregion Validation

        /**
         * Enable the date picker component
         *
         * @param {HTMLElement} el An element within the date picker component
         */
        const reconcileInputValues = (el) => {
          const { internalInputEl, inputDate } = getDatePickerContext(el)
          let newValue = ''
          if (inputDate && !isDateInputInvalid(el)) {
            newValue = formatDate(inputDate)
          }
          if (internalInputEl.value !== newValue) {
            changeElementValue(internalInputEl, newValue)
          }
        }

        /**
         * Select the value of the date picker inputs.
         *
         * @param {HTMLButtonElement} el An element within the date picker component
         * @param {string} dateString The date string to update in YYYY-MM-DD format
         */
        const setCalendarValue = (el, dateString) => {
          const parsedDate = parseDateString(dateString)
          if (parsedDate) {
            const formattedDate = formatDate(
              parsedDate,
              DEFAULT_EXTERNAL_DATE_FORMAT
            )
            const { datePickerEl, internalInputEl, externalInputEl } =
              getDatePickerContext(el)
            changeElementValue(internalInputEl, dateString)
            changeElementValue(externalInputEl, formattedDate)
            validateDateInput(datePickerEl)
          }
        }

        /**
         * Enhance an input with the date picker elements
         *
         * @param {HTMLElement} el The initial wrapping element of the date picker component
         */
        const enhanceDatePicker = (el) => {
          const datePickerEl = el.closest(DATE_PICKER)
          const { defaultValue } = datePickerEl.dataset
          const internalInputEl = datePickerEl.querySelector(`input`)
          if (!internalInputEl) {
            throw new Error(`${DATE_PICKER} is missing inner input`)
          }
          if (internalInputEl.value) {
            internalInputEl.value = ''
          }
          const minDate = parseDateString(
            datePickerEl.dataset.minDate || internalInputEl.getAttribute('min')
          )
          datePickerEl.dataset.minDate = minDate
            ? formatDate(minDate)
            : DEFAULT_MIN_DATE
          const maxDate = parseDateString(
            datePickerEl.dataset.maxDate || internalInputEl.getAttribute('max')
          )
          if (maxDate) {
            datePickerEl.dataset.maxDate = formatDate(maxDate)
          }
          const calendarWrapper = document.createElement('div')
          calendarWrapper.classList.add(DATE_PICKER_WRAPPER_CLASS)
          const externalInputEl = internalInputEl.cloneNode()
          externalInputEl.classList.add(DATE_PICKER_EXTERNAL_INPUT_CLASS)
          externalInputEl.type = 'text'
          calendarWrapper.appendChild(externalInputEl)
          calendarWrapper.insertAdjacentHTML(
            'beforeend',
            Sanitizer.escapeHTML`
    <button type="button" class="${DATE_PICKER_BUTTON_CLASS}" aria-haspopup="true" aria-label="Toggle calendar"></button>
    <div class="${DATE_PICKER_CALENDAR_CLASS}" role="dialog" aria-modal="true" hidden></div>
    <div class="usa-sr-only ${DATE_PICKER_STATUS_CLASS}" role="status" aria-live="polite"></div>`
          )
          internalInputEl.setAttribute('aria-hidden', 'true')
          internalInputEl.setAttribute('tabindex', '-1')
          internalInputEl.style.display = 'none'
          internalInputEl.classList.add(DATE_PICKER_INTERNAL_INPUT_CLASS)
          internalInputEl.removeAttribute('id')
          internalInputEl.removeAttribute('name')
          internalInputEl.required = false
          datePickerEl.appendChild(calendarWrapper)
          datePickerEl.classList.add(DATE_PICKER_INITIALIZED_CLASS)
          if (defaultValue) {
            setCalendarValue(datePickerEl, defaultValue)
          }
          if (internalInputEl.disabled) {
            disable(datePickerEl)
            internalInputEl.disabled = false
          }
        }

        // #region Calendar - Date Selection View

        /**
         * render the calendar.
         *
         * @param {HTMLElement} el An element within the date picker component
         * @param {Date} _dateToDisplay a date to render on the calendar
         * @returns {HTMLElement} a reference to the new calendar element
         */
        const renderCalendar = (el, _dateToDisplay) => {
          const {
            datePickerEl,
            calendarEl,
            statusEl,
            selectedDate,
            maxDate,
            minDate,
            rangeDate,
          } = getDatePickerContext(el)
          const todaysDate = today()
          let dateToDisplay = _dateToDisplay || todaysDate
          const calendarWasHidden = calendarEl.hidden
          const focusedDate = addDays(dateToDisplay, 0)
          const focusedMonth = dateToDisplay.getMonth()
          const focusedYear = dateToDisplay.getFullYear()
          const prevMonth = subMonths(dateToDisplay, 1)
          const nextMonth = addMonths(dateToDisplay, 1)
          const currentFormattedDate = formatDate(dateToDisplay)
          const firstOfMonth = startOfMonth(dateToDisplay)
          const prevButtonsDisabled = isSameMonth(dateToDisplay, minDate)
          const nextButtonsDisabled = isSameMonth(dateToDisplay, maxDate)
          const rangeConclusionDate = selectedDate || dateToDisplay
          const rangeStartDate =
            rangeDate && min(rangeConclusionDate, rangeDate)
          const rangeEndDate = rangeDate && max(rangeConclusionDate, rangeDate)
          const withinRangeStartDate = rangeDate && addDays(rangeStartDate, 1)
          const withinRangeEndDate = rangeDate && subDays(rangeEndDate, 1)
          const monthLabel = MONTH_LABELS[focusedMonth]
          const generateDateHtml = (dateToRender) => {
            const classes = [CALENDAR_DATE_CLASS]
            const day = dateToRender.getDate()
            const month = dateToRender.getMonth()
            const year = dateToRender.getFullYear()
            const dayOfWeek = dateToRender.getDay()
            const formattedDate = formatDate(dateToRender)
            let tabindex = '-1'
            const isDisabled = !isDateWithinMinAndMax(
              dateToRender,
              minDate,
              maxDate
            )
            const isSelected = isSameDay(dateToRender, selectedDate)
            if (isSameMonth(dateToRender, prevMonth)) {
              classes.push(CALENDAR_DATE_PREVIOUS_MONTH_CLASS)
            }
            if (isSameMonth(dateToRender, focusedDate)) {
              classes.push(CALENDAR_DATE_CURRENT_MONTH_CLASS)
            }
            if (isSameMonth(dateToRender, nextMonth)) {
              classes.push(CALENDAR_DATE_NEXT_MONTH_CLASS)
            }
            if (isSelected) {
              classes.push(CALENDAR_DATE_SELECTED_CLASS)
            }
            if (isSameDay(dateToRender, todaysDate)) {
              classes.push(CALENDAR_DATE_TODAY_CLASS)
            }
            if (rangeDate) {
              if (isSameDay(dateToRender, rangeDate)) {
                classes.push(CALENDAR_DATE_RANGE_DATE_CLASS)
              }
              if (isSameDay(dateToRender, rangeStartDate)) {
                classes.push(CALENDAR_DATE_RANGE_DATE_START_CLASS)
              }
              if (isSameDay(dateToRender, rangeEndDate)) {
                classes.push(CALENDAR_DATE_RANGE_DATE_END_CLASS)
              }
              if (
                isDateWithinMinAndMax(
                  dateToRender,
                  withinRangeStartDate,
                  withinRangeEndDate
                )
              ) {
                classes.push(CALENDAR_DATE_WITHIN_RANGE_CLASS)
              }
            }
            if (isSameDay(dateToRender, focusedDate)) {
              tabindex = '0'
              classes.push(CALENDAR_DATE_FOCUSED_CLASS)
            }
            const monthStr = MONTH_LABELS[month]
            const dayStr = DAY_OF_WEEK_LABELS[dayOfWeek]
            const btn = document.createElement('button')
            btn.setAttribute('type', 'button')
            btn.setAttribute('tabindex', tabindex)
            btn.setAttribute('class', classes.join(' '))
            btn.setAttribute('data-day', day)
            btn.setAttribute('data-month', month + 1)
            btn.setAttribute('data-year', year)
            btn.setAttribute('data-value', formattedDate)
            btn.setAttribute(
              'aria-label',
              Sanitizer.escapeHTML`${day} ${monthStr} ${year} ${dayStr}`
            )
            btn.setAttribute('aria-selected', isSelected ? 'true' : 'false')
            if (isDisabled === true) {
              btn.disabled = true
            }
            btn.textContent = day
            return btn
          }

          // set date to first rendered day
          dateToDisplay = startOfWeek(firstOfMonth)
          const days = []
          while (
            days.length < 28 ||
            dateToDisplay.getMonth() === focusedMonth ||
            days.length % 7 !== 0
          ) {
            days.push(generateDateHtml(dateToDisplay))
            dateToDisplay = addDays(dateToDisplay, 1)
          }
          const datesGrid = listToGridHtml(days, 7)
          const newCalendar = calendarEl.cloneNode()
          newCalendar.dataset.value = currentFormattedDate
          newCalendar.style.top = `${datePickerEl.offsetHeight}px`
          newCalendar.hidden = false
          newCalendar.innerHTML = Sanitizer.escapeHTML`
    <div tabindex="-1" class="${CALENDAR_DATE_PICKER_CLASS}">
      <div class="${CALENDAR_ROW_CLASS}">
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_YEAR_CLASS}"
            aria-label="Navigate back one year"
            ${prevButtonsDisabled ? `disabled="disabled"` : ''}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_MONTH_CLASS}"
            aria-label="Navigate back one month"
            ${prevButtonsDisabled ? `disabled="disabled"` : ''}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_MONTH_LABEL_CLASS}">
          <button
            type="button"
            class="${CALENDAR_MONTH_SELECTION_CLASS}" aria-label="${monthLabel}. Click to select month"
          >${monthLabel}</button>
          <button
            type="button"
            class="${CALENDAR_YEAR_SELECTION_CLASS}" aria-label="${focusedYear}. Click to select year"
          >${focusedYear}</button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_MONTH_CLASS}"
            aria-label="Navigate forward one month"
            ${nextButtonsDisabled ? `disabled="disabled"` : ''}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_YEAR_CLASS}"
            aria-label="Navigate forward one year"
            ${nextButtonsDisabled ? `disabled="disabled"` : ''}
          ></button>
        </div>
      </div>
    </div>
    `
          const table = document.createElement('table')
          table.setAttribute('class', CALENDAR_TABLE_CLASS)
          table.setAttribute('role', 'presentation')
          const tableHead = document.createElement('thead')
          table.insertAdjacentElement('beforeend', tableHead)
          const tableHeadRow = document.createElement('tr')
          tableHead.insertAdjacentElement('beforeend', tableHeadRow)
          const daysOfWeek = {
            Sunday: 'S',
            Monday: 'M',
            Tuesday: 'T',
            Wednesday: 'W',
            Thursday: 'Th',
            Friday: 'Fr',
            Saturday: 'S',
          }
          Object.keys(daysOfWeek).forEach((key) => {
            const th = document.createElement('th')
            th.setAttribute('class', CALENDAR_DAY_OF_WEEK_CLASS)
            th.setAttribute('scope', 'presentation')
            th.setAttribute('aria-label', key)
            th.textContent = daysOfWeek[key]
            tableHeadRow.insertAdjacentElement('beforeend', th)
          })
          const tableBody = createTableBody(datesGrid)
          table.insertAdjacentElement('beforeend', tableBody)

          // Container for Years, Months, and Days
          const datePickerCalendarContainer =
            newCalendar.querySelector(CALENDAR_DATE_PICKER)
          datePickerCalendarContainer.insertAdjacentElement('beforeend', table)
          calendarEl.parentNode.replaceChild(newCalendar, calendarEl)
          datePickerEl.classList.add(DATE_PICKER_ACTIVE_CLASS)
          const statuses = []
          if (isSameDay(selectedDate, focusedDate)) {
            statuses.push('Selected date')
          }
          if (calendarWasHidden) {
            statuses.push(
              'You can navigate by day using left and right arrows',
              'Weeks by using up and down arrows',
              'Months by using page up and page down keys',
              'Years by using shift plus page up and shift plus page down',
              'Home and end keys navigate to the beginning and end of a week'
            )
            statusEl.textContent = ''
          } else {
            statuses.push(`${monthLabel} ${focusedYear}`)
          }
          statusEl.textContent = statuses.join('. ')
          return newCalendar
        }

        /**
         * Navigate back one year and display the calendar.
         *
         * @param {HTMLButtonElement} _buttonEl An element within the date picker component
         */
        const displayPreviousYear = (_buttonEl) => {
          if (_buttonEl.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(_buttonEl)
          let date = subYears(calendarDate, 1)
          date = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = renderCalendar(calendarEl, date)
          let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_YEAR)
          if (nextToFocus.disabled) {
            nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER)
          }
          nextToFocus.focus()
        }

        /**
         * Navigate back one month and display the calendar.
         *
         * @param {HTMLButtonElement} _buttonEl An element within the date picker component
         */
        const displayPreviousMonth = (_buttonEl) => {
          if (_buttonEl.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(_buttonEl)
          let date = subMonths(calendarDate, 1)
          date = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = renderCalendar(calendarEl, date)
          let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_MONTH)
          if (nextToFocus.disabled) {
            nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER)
          }
          nextToFocus.focus()
        }

        /**
         * Navigate forward one month and display the calendar.
         *
         * @param {HTMLButtonElement} _buttonEl An element within the date picker component
         */
        const displayNextMonth = (_buttonEl) => {
          if (_buttonEl.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(_buttonEl)
          let date = addMonths(calendarDate, 1)
          date = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = renderCalendar(calendarEl, date)
          let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_MONTH)
          if (nextToFocus.disabled) {
            nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER)
          }
          nextToFocus.focus()
        }

        /**
         * Navigate forward one year and display the calendar.
         *
         * @param {HTMLButtonElement} _buttonEl An element within the date picker component
         */
        const displayNextYear = (_buttonEl) => {
          if (_buttonEl.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(_buttonEl)
          let date = addYears(calendarDate, 1)
          date = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = renderCalendar(calendarEl, date)
          let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR)
          if (nextToFocus.disabled) {
            nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER)
          }
          nextToFocus.focus()
        }

        /**
         * Hide the calendar of a date picker component.
         *
         * @param {HTMLElement} el An element within the date picker component
         */
        const hideCalendar = (el) => {
          const { datePickerEl, calendarEl, statusEl } =
            getDatePickerContext(el)
          datePickerEl.classList.remove(DATE_PICKER_ACTIVE_CLASS)
          calendarEl.hidden = true
          statusEl.textContent = ''
        }

        /**
         * Select a date within the date picker component.
         *
         * @param {HTMLButtonElement} calendarDateEl A date element within the date picker component
         */
        const selectDate = (calendarDateEl) => {
          if (calendarDateEl.disabled) return
          const { datePickerEl, externalInputEl } =
            getDatePickerContext(calendarDateEl)
          setCalendarValue(calendarDateEl, calendarDateEl.dataset.value)
          hideCalendar(datePickerEl)
          externalInputEl.focus()
        }

        /**
         * Toggle the calendar.
         *
         * @param {HTMLButtonElement} el An element within the date picker component
         */
        const toggleCalendar = (el) => {
          if (el.disabled) return
          const { calendarEl, inputDate, minDate, maxDate, defaultDate } =
            getDatePickerContext(el)
          if (calendarEl.hidden) {
            const dateToDisplay = keepDateBetweenMinAndMax(
              inputDate || defaultDate || today(),
              minDate,
              maxDate
            )
            const newCalendar = renderCalendar(calendarEl, dateToDisplay)
            newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus()
          } else {
            hideCalendar(el)
          }
        }

        /**
         * Update the calendar when visible.
         *
         * @param {HTMLElement} el an element within the date picker
         */
        const updateCalendarIfVisible = (el) => {
          const { calendarEl, inputDate, minDate, maxDate } =
            getDatePickerContext(el)
          const calendarShown = !calendarEl.hidden
          if (calendarShown && inputDate) {
            const dateToDisplay = keepDateBetweenMinAndMax(
              inputDate,
              minDate,
              maxDate
            )
            renderCalendar(calendarEl, dateToDisplay)
          }
        }

        // #endregion Calendar - Date Selection View

        // #region Calendar - Month Selection View
        /**
         * Display the month selection screen in the date picker.
         *
         * @param {HTMLButtonElement} el An element within the date picker component
         * @returns {HTMLElement} a reference to the new calendar element
         */
        const displayMonthSelection = (el, monthToDisplay) => {
          const { calendarEl, statusEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(el)
          const selectedMonth = calendarDate.getMonth()
          const focusedMonth =
            monthToDisplay == null ? selectedMonth : monthToDisplay
          const months = MONTH_LABELS.map((month, index) => {
            const monthToCheck = setMonth(calendarDate, index)
            const isDisabled = isDatesMonthOutsideMinOrMax(
              monthToCheck,
              minDate,
              maxDate
            )
            let tabindex = '-1'
            const classes = [CALENDAR_MONTH_CLASS]
            const isSelected = index === selectedMonth
            if (index === focusedMonth) {
              tabindex = '0'
              classes.push(CALENDAR_MONTH_FOCUSED_CLASS)
            }
            if (isSelected) {
              classes.push(CALENDAR_MONTH_SELECTED_CLASS)
            }
            const btn = document.createElement('button')
            btn.setAttribute('type', 'button')
            btn.setAttribute('tabindex', tabindex)
            btn.setAttribute('class', classes.join(' '))
            btn.setAttribute('data-value', index)
            btn.setAttribute('data-label', month)
            btn.setAttribute('aria-selected', isSelected ? 'true' : 'false')
            if (isDisabled === true) {
              btn.disabled = true
            }
            btn.textContent = month
            return btn
          })
          const monthsHtml = document.createElement('div')
          monthsHtml.setAttribute('tabindex', '-1')
          monthsHtml.setAttribute('class', CALENDAR_MONTH_PICKER_CLASS)
          const table = document.createElement('table')
          table.setAttribute('class', CALENDAR_TABLE_CLASS)
          table.setAttribute('role', 'presentation')
          const monthsGrid = listToGridHtml(months, 3)
          const tableBody = createTableBody(monthsGrid)
          table.insertAdjacentElement('beforeend', tableBody)
          monthsHtml.insertAdjacentElement('beforeend', table)
          const newCalendar = calendarEl.cloneNode()
          newCalendar.insertAdjacentElement('beforeend', monthsHtml)
          calendarEl.parentNode.replaceChild(newCalendar, calendarEl)
          statusEl.textContent = 'Select a month.'
          return newCalendar
        }

        /**
         * Select a month in the date picker component.
         *
         * @param {HTMLButtonElement} monthEl An month element within the date picker component
         */
        const selectMonth = (monthEl) => {
          if (monthEl.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(monthEl)
          const selectedMonth = parseInt(monthEl.dataset.value, 10)
          let date = setMonth(calendarDate, selectedMonth)
          date = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = renderCalendar(calendarEl, date)
          newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus()
        }

        // #endregion Calendar - Month Selection View

        // #region Calendar - Year Selection View

        /**
         * Display the year selection screen in the date picker.
         *
         * @param {HTMLButtonElement} el An element within the date picker component
         * @param {number} yearToDisplay year to display in year selection
         * @returns {HTMLElement} a reference to the new calendar element
         */
        const displayYearSelection = (el, yearToDisplay) => {
          const { calendarEl, statusEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(el)
          const selectedYear = calendarDate.getFullYear()
          const focusedYear =
            yearToDisplay == null ? selectedYear : yearToDisplay
          let yearToChunk = focusedYear
          yearToChunk -= yearToChunk % YEAR_CHUNK
          yearToChunk = Math.max(0, yearToChunk)
          const prevYearChunkDisabled = isDatesYearOutsideMinOrMax(
            setYear(calendarDate, yearToChunk - 1),
            minDate,
            maxDate
          )
          const nextYearChunkDisabled = isDatesYearOutsideMinOrMax(
            setYear(calendarDate, yearToChunk + YEAR_CHUNK),
            minDate,
            maxDate
          )
          const years = []
          let yearIndex = yearToChunk
          while (years.length < YEAR_CHUNK) {
            const isDisabled = isDatesYearOutsideMinOrMax(
              setYear(calendarDate, yearIndex),
              minDate,
              maxDate
            )
            let tabindex = '-1'
            const classes = [CALENDAR_YEAR_CLASS]
            const isSelected = yearIndex === selectedYear
            if (yearIndex === focusedYear) {
              tabindex = '0'
              classes.push(CALENDAR_YEAR_FOCUSED_CLASS)
            }
            if (isSelected) {
              classes.push(CALENDAR_YEAR_SELECTED_CLASS)
            }
            const btn = document.createElement('button')
            btn.setAttribute('type', 'button')
            btn.setAttribute('tabindex', tabindex)
            btn.setAttribute('class', classes.join(' '))
            btn.setAttribute('data-value', yearIndex)
            btn.setAttribute('aria-selected', isSelected ? 'true' : 'false')
            if (isDisabled === true) {
              btn.disabled = true
            }
            btn.textContent = yearIndex
            years.push(btn)
            yearIndex += 1
          }
          const newCalendar = calendarEl.cloneNode()

          // create the years calendar wrapper
          const yearsCalendarWrapper = document.createElement('div')
          yearsCalendarWrapper.setAttribute('tabindex', '-1')
          yearsCalendarWrapper.setAttribute('class', CALENDAR_YEAR_PICKER_CLASS)

          // create table parent
          const yearsTableParent = document.createElement('table')
          yearsTableParent.setAttribute('role', 'presentation')
          yearsTableParent.setAttribute('class', CALENDAR_TABLE_CLASS)

          // create table body and table row
          const yearsHTMLTableBody = document.createElement('tbody')
          const yearsHTMLTableBodyRow = document.createElement('tr')

          // create previous button
          const previousYearsBtn = document.createElement('button')
          previousYearsBtn.setAttribute('type', 'button')
          previousYearsBtn.setAttribute(
            'class',
            CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS
          )
          previousYearsBtn.setAttribute(
            'aria-label',
            `Navigate back ${YEAR_CHUNK} years`
          )
          if (prevYearChunkDisabled === true) {
            previousYearsBtn.disabled = true
          }
          previousYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`

          // create next button
          const nextYearsBtn = document.createElement('button')
          nextYearsBtn.setAttribute('type', 'button')
          nextYearsBtn.setAttribute('class', CALENDAR_NEXT_YEAR_CHUNK_CLASS)
          nextYearsBtn.setAttribute(
            'aria-label',
            `Navigate forward ${YEAR_CHUNK} years`
          )
          if (nextYearChunkDisabled === true) {
            nextYearsBtn.disabled = true
          }
          nextYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`

          // create the actual years table
          const yearsTable = document.createElement('table')
          yearsTable.setAttribute('class', CALENDAR_TABLE_CLASS)
          yearsTable.setAttribute('role', 'presentation')

          // create the years child table
          const yearsGrid = listToGridHtml(years, 3)
          const yearsTableBody = createTableBody(yearsGrid)

          // append the grid to the years child table
          yearsTable.insertAdjacentElement('beforeend', yearsTableBody)

          // create the prev button td and append the prev button
          const yearsHTMLTableBodyDetailPrev = document.createElement('td')
          yearsHTMLTableBodyDetailPrev.insertAdjacentElement(
            'beforeend',
            previousYearsBtn
          )

          // create the years td and append the years child table
          const yearsHTMLTableBodyYearsDetail = document.createElement('td')
          yearsHTMLTableBodyYearsDetail.setAttribute('colspan', '3')
          yearsHTMLTableBodyYearsDetail.insertAdjacentElement(
            'beforeend',
            yearsTable
          )

          // create the next button td and append the next button
          const yearsHTMLTableBodyDetailNext = document.createElement('td')
          yearsHTMLTableBodyDetailNext.insertAdjacentElement(
            'beforeend',
            nextYearsBtn
          )

          // append the three td to the years child table row
          yearsHTMLTableBodyRow.insertAdjacentElement(
            'beforeend',
            yearsHTMLTableBodyDetailPrev
          )
          yearsHTMLTableBodyRow.insertAdjacentElement(
            'beforeend',
            yearsHTMLTableBodyYearsDetail
          )
          yearsHTMLTableBodyRow.insertAdjacentElement(
            'beforeend',
            yearsHTMLTableBodyDetailNext
          )

          // append the table row to the years child table body
          yearsHTMLTableBody.insertAdjacentElement(
            'beforeend',
            yearsHTMLTableBodyRow
          )

          // append the years table body to the years parent table
          yearsTableParent.insertAdjacentElement(
            'beforeend',
            yearsHTMLTableBody
          )

          // append the parent table to the calendar wrapper
          yearsCalendarWrapper.insertAdjacentElement(
            'beforeend',
            yearsTableParent
          )

          // append the years calender to the new calendar
          newCalendar.insertAdjacentElement('beforeend', yearsCalendarWrapper)

          // replace calendar
          calendarEl.parentNode.replaceChild(newCalendar, calendarEl)
          statusEl.textContent = Sanitizer.escapeHTML`Showing years ${yearToChunk} to ${
            yearToChunk + YEAR_CHUNK - 1
          }. Select a year.`
          return newCalendar
        }

        /**
         * Navigate back by years and display the year selection screen.
         *
         * @param {HTMLButtonElement} el An element within the date picker component
         */
        const displayPreviousYearChunk = (el) => {
          if (el.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(el)
          const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED)
          const selectedYear = parseInt(yearEl.textContent, 10)
          let adjustedYear = selectedYear - YEAR_CHUNK
          adjustedYear = Math.max(0, adjustedYear)
          const date = setYear(calendarDate, adjustedYear)
          const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = displayYearSelection(
            calendarEl,
            cappedDate.getFullYear()
          )
          let nextToFocus = newCalendar.querySelector(
            CALENDAR_PREVIOUS_YEAR_CHUNK
          )
          if (nextToFocus.disabled) {
            nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER)
          }
          nextToFocus.focus()
        }

        /**
         * Navigate forward by years and display the year selection screen.
         *
         * @param {HTMLButtonElement} el An element within the date picker component
         */
        const displayNextYearChunk = (el) => {
          if (el.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(el)
          const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED)
          const selectedYear = parseInt(yearEl.textContent, 10)
          let adjustedYear = selectedYear + YEAR_CHUNK
          adjustedYear = Math.max(0, adjustedYear)
          const date = setYear(calendarDate, adjustedYear)
          const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = displayYearSelection(
            calendarEl,
            cappedDate.getFullYear()
          )
          let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR_CHUNK)
          if (nextToFocus.disabled) {
            nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER)
          }
          nextToFocus.focus()
        }

        /**
         * Select a year in the date picker component.
         *
         * @param {HTMLButtonElement} yearEl A year element within the date picker component
         */
        const selectYear = (yearEl) => {
          if (yearEl.disabled) return
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(yearEl)
          const selectedYear = parseInt(yearEl.innerHTML, 10)
          let date = setYear(calendarDate, selectedYear)
          date = keepDateBetweenMinAndMax(date, minDate, maxDate)
          const newCalendar = renderCalendar(calendarEl, date)
          newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus()
        }

        // #endregion Calendar - Year Selection View

        // #region Calendar Event Handling

        /**
         * Hide the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleEscapeFromCalendar = (event) => {
          const { datePickerEl, externalInputEl } = getDatePickerContext(
            event.target
          )
          hideCalendar(datePickerEl)
          externalInputEl.focus()
          event.preventDefault()
        }

        // #endregion Calendar Event Handling

        // #region Calendar Date Event Handling

        /**
         * Adjust the date and display the calendar if needed.
         *
         * @param {function} adjustDateFn function that returns the adjusted date
         */
        const adjustCalendar = (adjustDateFn) => (event) => {
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(event.target)
          const date = adjustDateFn(calendarDate)
          const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate)
          if (!isSameDay(calendarDate, cappedDate)) {
            const newCalendar = renderCalendar(calendarEl, cappedDate)
            newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus()
          }
          event.preventDefault()
        }

        /**
         * Navigate back one week and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleUpFromDate = adjustCalendar((date) => subWeeks(date, 1))

        /**
         * Navigate forward one week and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleDownFromDate = adjustCalendar((date) => addWeeks(date, 1))

        /**
         * Navigate back one day and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleLeftFromDate = adjustCalendar((date) => subDays(date, 1))

        /**
         * Navigate forward one day and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleRightFromDate = adjustCalendar((date) => addDays(date, 1))

        /**
         * Navigate to the start of the week and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleHomeFromDate = adjustCalendar((date) => startOfWeek(date))

        /**
         * Navigate to the end of the week and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleEndFromDate = adjustCalendar((date) => endOfWeek(date))

        /**
         * Navigate forward one month and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handlePageDownFromDate = adjustCalendar((date) =>
          addMonths(date, 1)
        )

        /**
         * Navigate back one month and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handlePageUpFromDate = adjustCalendar((date) =>
          subMonths(date, 1)
        )

        /**
         * Navigate forward one year and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleShiftPageDownFromDate = adjustCalendar((date) =>
          addYears(date, 1)
        )

        /**
         * Navigate back one year and display the calendar.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleShiftPageUpFromDate = adjustCalendar((date) =>
          subYears(date, 1)
        )

        /**
         * display the calendar for the mouseover date.
         *
         * @param {MouseEvent} event The mouseover event
         * @param {HTMLButtonElement} dateEl A date element within the date picker component
         */
        const handleMouseoverFromDate = (dateEl) => {
          if (dateEl.disabled) return
          const calendarEl = dateEl.closest(DATE_PICKER_CALENDAR)
          const currentCalendarDate = calendarEl.dataset.value
          const hoverDate = dateEl.dataset.value
          if (hoverDate === currentCalendarDate) return
          const dateToDisplay = parseDateString(hoverDate)
          const newCalendar = renderCalendar(calendarEl, dateToDisplay)
          newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus()
        }

        // #endregion Calendar Date Event Handling

        // #region Calendar Month Event Handling

        /**
         * Adjust the month and display the month selection screen if needed.
         *
         * @param {function} adjustMonthFn function that returns the adjusted month
         */
        const adjustMonthSelectionScreen = (adjustMonthFn) => (event) => {
          const monthEl = event.target
          const selectedMonth = parseInt(monthEl.dataset.value, 10)
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(monthEl)
          const currentDate = setMonth(calendarDate, selectedMonth)
          let adjustedMonth = adjustMonthFn(selectedMonth)
          adjustedMonth = Math.max(0, Math.min(11, adjustedMonth))
          const date = setMonth(calendarDate, adjustedMonth)
          const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate)
          if (!isSameMonth(currentDate, cappedDate)) {
            const newCalendar = displayMonthSelection(
              calendarEl,
              cappedDate.getMonth()
            )
            newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus()
          }
          event.preventDefault()
        }

        /**
         * Navigate back three months and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleUpFromMonth = adjustMonthSelectionScreen(
          (month) => month - 3
        )

        /**
         * Navigate forward three months and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleDownFromMonth = adjustMonthSelectionScreen(
          (month) => month + 3
        )

        /**
         * Navigate back one month and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleLeftFromMonth = adjustMonthSelectionScreen(
          (month) => month - 1
        )

        /**
         * Navigate forward one month and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleRightFromMonth = adjustMonthSelectionScreen(
          (month) => month + 1
        )

        /**
         * Navigate to the start of the row of months and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleHomeFromMonth = adjustMonthSelectionScreen(
          (month) => month - (month % 3)
        )

        /**
         * Navigate to the end of the row of months and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleEndFromMonth = adjustMonthSelectionScreen(
          (month) => month + 2 - (month % 3)
        )

        /**
         * Navigate to the last month (December) and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handlePageDownFromMonth = adjustMonthSelectionScreen(() => 11)

        /**
         * Navigate to the first month (January) and display the month selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handlePageUpFromMonth = adjustMonthSelectionScreen(() => 0)

        /**
         * update the focus on a month when the mouse moves.
         *
         * @param {MouseEvent} event The mouseover event
         * @param {HTMLButtonElement} monthEl A month element within the date picker component
         */
        const handleMouseoverFromMonth = (monthEl) => {
          if (monthEl.disabled) return
          if (monthEl.classList.contains(CALENDAR_MONTH_FOCUSED_CLASS)) return
          const focusMonth = parseInt(monthEl.dataset.value, 10)
          const newCalendar = displayMonthSelection(monthEl, focusMonth)
          newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus()
        }

        // #endregion Calendar Month Event Handling

        // #region Calendar Year Event Handling

        /**
         * Adjust the year and display the year selection screen if needed.
         *
         * @param {function} adjustYearFn function that returns the adjusted year
         */
        const adjustYearSelectionScreen = (adjustYearFn) => (event) => {
          const yearEl = event.target
          const selectedYear = parseInt(yearEl.dataset.value, 10)
          const { calendarEl, calendarDate, minDate, maxDate } =
            getDatePickerContext(yearEl)
          const currentDate = setYear(calendarDate, selectedYear)
          let adjustedYear = adjustYearFn(selectedYear)
          adjustedYear = Math.max(0, adjustedYear)
          const date = setYear(calendarDate, adjustedYear)
          const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate)
          if (!isSameYear(currentDate, cappedDate)) {
            const newCalendar = displayYearSelection(
              calendarEl,
              cappedDate.getFullYear()
            )
            newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus()
          }
          event.preventDefault()
        }

        /**
         * Navigate back three years and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleUpFromYear = adjustYearSelectionScreen((year) => year - 3)

        /**
         * Navigate forward three years and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleDownFromYear = adjustYearSelectionScreen((year) => year + 3)

        /**
         * Navigate back one year and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleLeftFromYear = adjustYearSelectionScreen((year) => year - 1)

        /**
         * Navigate forward one year and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleRightFromYear = adjustYearSelectionScreen(
          (year) => year + 1
        )

        /**
         * Navigate to the start of the row of years and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleHomeFromYear = adjustYearSelectionScreen(
          (year) => year - (year % 3)
        )

        /**
         * Navigate to the end of the row of years and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handleEndFromYear = adjustYearSelectionScreen(
          (year) => year + 2 - (year % 3)
        )

        /**
         * Navigate to back 12 years and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handlePageUpFromYear = adjustYearSelectionScreen(
          (year) => year - YEAR_CHUNK
        )

        /**
         * Navigate forward 12 years and display the year selection screen.
         *
         * @param {KeyboardEvent} event the keydown event
         */
        const handlePageDownFromYear = adjustYearSelectionScreen(
          (year) => year + YEAR_CHUNK
        )

        /**
         * update the focus on a year when the mouse moves.
         *
         * @param {MouseEvent} event The mouseover event
         * @param {HTMLButtonElement} dateEl A year element within the date picker component
         */
        const handleMouseoverFromYear = (yearEl) => {
          if (yearEl.disabled) return
          if (yearEl.classList.contains(CALENDAR_YEAR_FOCUSED_CLASS)) return
          const focusYear = parseInt(yearEl.dataset.value, 10)
          const newCalendar = displayYearSelection(yearEl, focusYear)
          newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus()
        }

        // #endregion Calendar Year Event Handling

        // #region Focus Handling Event Handling

        const tabHandler = (focusable) => {
          const getFocusableContext = (el) => {
            const { calendarEl } = getDatePickerContext(el)
            const focusableElements = select(focusable, calendarEl)
            const firstTabIndex = 0
            const lastTabIndex = focusableElements.length - 1
            const firstTabStop = focusableElements[firstTabIndex]
            const lastTabStop = focusableElements[lastTabIndex]
            const focusIndex = focusableElements.indexOf(activeElement())
            const isLastTab = focusIndex === lastTabIndex
            const isFirstTab = focusIndex === firstTabIndex
            const isNotFound = focusIndex === -1
            return {
              focusableElements,
              isNotFound,
              firstTabStop,
              isFirstTab,
              lastTabStop,
              isLastTab,
            }
          }
          return {
            tabAhead(event) {
              const { firstTabStop, isLastTab, isNotFound } =
                getFocusableContext(event.target)
              if (isLastTab || isNotFound) {
                event.preventDefault()
                firstTabStop.focus()
              }
            },
            tabBack(event) {
              const { lastTabStop, isFirstTab, isNotFound } =
                getFocusableContext(event.target)
              if (isFirstTab || isNotFound) {
                event.preventDefault()
                lastTabStop.focus()
              }
            },
          }
        }
        const datePickerTabEventHandler = tabHandler(DATE_PICKER_FOCUSABLE)
        const monthPickerTabEventHandler = tabHandler(MONTH_PICKER_FOCUSABLE)
        const yearPickerTabEventHandler = tabHandler(YEAR_PICKER_FOCUSABLE)

        // #endregion Focus Handling Event Handling

        // #region Date Picker Event Delegation Registration / Component

        const datePickerEvents = {
          [CLICK]: {
            [DATE_PICKER_BUTTON]() {
              toggleCalendar(this)
            },
            [CALENDAR_DATE]() {
              selectDate(this)
            },
            [CALENDAR_MONTH]() {
              selectMonth(this)
            },
            [CALENDAR_YEAR]() {
              selectYear(this)
            },
            [CALENDAR_PREVIOUS_MONTH]() {
              displayPreviousMonth(this)
            },
            [CALENDAR_NEXT_MONTH]() {
              displayNextMonth(this)
            },
            [CALENDAR_PREVIOUS_YEAR]() {
              displayPreviousYear(this)
            },
            [CALENDAR_NEXT_YEAR]() {
              displayNextYear(this)
            },
            [CALENDAR_PREVIOUS_YEAR_CHUNK]() {
              displayPreviousYearChunk(this)
            },
            [CALENDAR_NEXT_YEAR_CHUNK]() {
              displayNextYearChunk(this)
            },
            [CALENDAR_MONTH_SELECTION]() {
              const newCalendar = displayMonthSelection(this)
              newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus()
            },
            [CALENDAR_YEAR_SELECTION]() {
              const newCalendar = displayYearSelection(this)
              newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus()
            },
          },
          keyup: {
            [DATE_PICKER_CALENDAR](event) {
              const keydown = this.dataset.keydownKeyCode
              if (`${event.keyCode}` !== keydown) {
                event.preventDefault()
              }
            },
          },
          keydown: {
            [DATE_PICKER_EXTERNAL_INPUT](event) {
              if (event.keyCode === ENTER_KEYCODE) {
                validateDateInput(this)
              }
            },
            [CALENDAR_DATE]: keymap({
              Up: handleUpFromDate,
              ArrowUp: handleUpFromDate,
              Down: handleDownFromDate,
              ArrowDown: handleDownFromDate,
              Left: handleLeftFromDate,
              ArrowLeft: handleLeftFromDate,
              Right: handleRightFromDate,
              ArrowRight: handleRightFromDate,
              Home: handleHomeFromDate,
              End: handleEndFromDate,
              PageDown: handlePageDownFromDate,
              PageUp: handlePageUpFromDate,
              'Shift+PageDown': handleShiftPageDownFromDate,
              'Shift+PageUp': handleShiftPageUpFromDate,
              Tab: datePickerTabEventHandler.tabAhead,
            }),
            [CALENDAR_DATE_PICKER]: keymap({
              Tab: datePickerTabEventHandler.tabAhead,
              'Shift+Tab': datePickerTabEventHandler.tabBack,
            }),
            [CALENDAR_MONTH]: keymap({
              Up: handleUpFromMonth,
              ArrowUp: handleUpFromMonth,
              Down: handleDownFromMonth,
              ArrowDown: handleDownFromMonth,
              Left: handleLeftFromMonth,
              ArrowLeft: handleLeftFromMonth,
              Right: handleRightFromMonth,
              ArrowRight: handleRightFromMonth,
              Home: handleHomeFromMonth,
              End: handleEndFromMonth,
              PageDown: handlePageDownFromMonth,
              PageUp: handlePageUpFromMonth,
            }),
            [CALENDAR_MONTH_PICKER]: keymap({
              Tab: monthPickerTabEventHandler.tabAhead,
              'Shift+Tab': monthPickerTabEventHandler.tabBack,
            }),
            [CALENDAR_YEAR]: keymap({
              Up: handleUpFromYear,
              ArrowUp: handleUpFromYear,
              Down: handleDownFromYear,
              ArrowDown: handleDownFromYear,
              Left: handleLeftFromYear,
              ArrowLeft: handleLeftFromYear,
              Right: handleRightFromYear,
              ArrowRight: handleRightFromYear,
              Home: handleHomeFromYear,
              End: handleEndFromYear,
              PageDown: handlePageDownFromYear,
              PageUp: handlePageUpFromYear,
            }),
            [CALENDAR_YEAR_PICKER]: keymap({
              Tab: yearPickerTabEventHandler.tabAhead,
              'Shift+Tab': yearPickerTabEventHandler.tabBack,
            }),
            [DATE_PICKER_CALENDAR](event) {
              this.dataset.keydownKeyCode = event.keyCode
            },
            [DATE_PICKER](event) {
              const keyMap = keymap({
                Escape: handleEscapeFromCalendar,
              })
              keyMap(event)
            },
          },
          focusout: {
            [DATE_PICKER_EXTERNAL_INPUT]() {
              validateDateInput(this)
            },
            [DATE_PICKER](event) {
              if (!this.contains(event.relatedTarget)) {
                hideCalendar(this)
              }
            },
          },
          input: {
            [DATE_PICKER_EXTERNAL_INPUT]() {
              reconcileInputValues(this)
              updateCalendarIfVisible(this)
            },
          },
        }
        if (!isIosDevice()) {
          datePickerEvents.mouseover = {
            [CALENDAR_DATE_CURRENT_MONTH]() {
              handleMouseoverFromDate(this)
            },
            [CALENDAR_MONTH]() {
              handleMouseoverFromMonth(this)
            },
            [CALENDAR_YEAR]() {
              handleMouseoverFromYear(this)
            },
          }
        }
        const datePicker = behavior(datePickerEvents, {
          init(root) {
            select(DATE_PICKER, root).forEach((datePickerEl) => {
              enhanceDatePicker(datePickerEl)
            })
          },
          getDatePickerContext,
          disable,
          enable,
          isDateInputInvalid,
          setCalendarValue,
          validateDateInput,
          renderCalendar,
          updateCalendarIfVisible,
        })

        // #endregion Date Picker Event Delegation Registration / Component

        module.exports = datePicker
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/active-element': 42,
        '../utils/behavior': 43,
        '../utils/is-ios-device': 46,
        '../utils/sanitizer': 47,
        '../utils/select': 49,
        'receptor/keymap': 12,
      },
    ],
    20: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const select = require('../utils/select')
        const { prefix: PREFIX } = require('../config')
        const {
          getDatePickerContext,
          isDateInputInvalid,
          updateCalendarIfVisible,
        } = require('./date-picker')
        const DATE_PICKER_CLASS = `${PREFIX}-date-picker`
        const DATE_RANGE_PICKER_CLASS = `${PREFIX}-date-range-picker`
        const DATE_RANGE_PICKER_RANGE_START_CLASS = `${DATE_RANGE_PICKER_CLASS}__range-start`
        const DATE_RANGE_PICKER_RANGE_END_CLASS = `${DATE_RANGE_PICKER_CLASS}__range-end`
        const DATE_PICKER = `.${DATE_PICKER_CLASS}`
        const DATE_RANGE_PICKER = `.${DATE_RANGE_PICKER_CLASS}`
        const DATE_RANGE_PICKER_RANGE_START = `.${DATE_RANGE_PICKER_RANGE_START_CLASS}`
        const DATE_RANGE_PICKER_RANGE_END = `.${DATE_RANGE_PICKER_RANGE_END_CLASS}`
        const DEFAULT_MIN_DATE = '0000-01-01'

        /**
         * The properties and elements within the date range picker.
         * @typedef {Object} DateRangePickerContext
         * @property {HTMLElement} dateRangePickerEl
         * @property {HTMLElement} rangeStartEl
         * @property {HTMLElement} rangeEndEl
         */

        /**
         * Get an object of the properties and elements belonging directly to the given
         * date picker component.
         *
         * @param {HTMLElement} el the element within the date picker
         * @returns {DateRangePickerContext} elements
         */
        const getDateRangePickerContext = (el) => {
          const dateRangePickerEl = el.closest(DATE_RANGE_PICKER)
          if (!dateRangePickerEl) {
            throw new Error(`Element is missing outer ${DATE_RANGE_PICKER}`)
          }
          const rangeStartEl = dateRangePickerEl.querySelector(
            DATE_RANGE_PICKER_RANGE_START
          )
          const rangeEndEl = dateRangePickerEl.querySelector(
            DATE_RANGE_PICKER_RANGE_END
          )
          return {
            dateRangePickerEl,
            rangeStartEl,
            rangeEndEl,
          }
        }

        /**
         * handle update from range start date picker
         *
         * @param {HTMLElement} el an element within the date range picker
         */
        const handleRangeStartUpdate = (el) => {
          const { dateRangePickerEl, rangeStartEl, rangeEndEl } =
            getDateRangePickerContext(el)
          const { internalInputEl } = getDatePickerContext(rangeStartEl)
          const updatedDate = internalInputEl.value
          if (updatedDate && !isDateInputInvalid(internalInputEl)) {
            rangeEndEl.dataset.minDate = updatedDate
            rangeEndEl.dataset.rangeDate = updatedDate
            rangeEndEl.dataset.defaultDate = updatedDate
          } else {
            rangeEndEl.dataset.minDate = dateRangePickerEl.dataset.minDate || ''
            rangeEndEl.dataset.rangeDate = ''
            rangeEndEl.dataset.defaultDate = ''
          }
          updateCalendarIfVisible(rangeEndEl)
        }

        /**
         * handle update from range start date picker
         *
         * @param {HTMLElement} el an element within the date range picker
         */
        const handleRangeEndUpdate = (el) => {
          const { dateRangePickerEl, rangeStartEl, rangeEndEl } =
            getDateRangePickerContext(el)
          const { internalInputEl } = getDatePickerContext(rangeEndEl)
          const updatedDate = internalInputEl.value
          if (updatedDate && !isDateInputInvalid(internalInputEl)) {
            rangeStartEl.dataset.maxDate = updatedDate
            rangeStartEl.dataset.rangeDate = updatedDate
            rangeStartEl.dataset.defaultDate = updatedDate
          } else {
            rangeStartEl.dataset.maxDate =
              dateRangePickerEl.dataset.maxDate || ''
            rangeStartEl.dataset.rangeDate = ''
            rangeStartEl.dataset.defaultDate = ''
          }
          updateCalendarIfVisible(rangeStartEl)
        }

        /**
         * Enhance an input with the date picker elements
         *
         * @param {HTMLElement} el The initial wrapping element of the date range picker component
         */
        const enhanceDateRangePicker = (el) => {
          const dateRangePickerEl = el.closest(DATE_RANGE_PICKER)
          const [rangeStart, rangeEnd] = select(DATE_PICKER, dateRangePickerEl)
          if (!rangeStart) {
            throw new Error(
              `${DATE_RANGE_PICKER} is missing inner two '${DATE_PICKER}' elements`
            )
          }
          if (!rangeEnd) {
            throw new Error(
              `${DATE_RANGE_PICKER} is missing second '${DATE_PICKER}' element`
            )
          }
          rangeStart.classList.add(DATE_RANGE_PICKER_RANGE_START_CLASS)
          rangeEnd.classList.add(DATE_RANGE_PICKER_RANGE_END_CLASS)
          if (!dateRangePickerEl.dataset.minDate) {
            dateRangePickerEl.dataset.minDate = DEFAULT_MIN_DATE
          }
          const { minDate } = dateRangePickerEl.dataset
          rangeStart.dataset.minDate = minDate
          rangeEnd.dataset.minDate = minDate
          const { maxDate } = dateRangePickerEl.dataset
          if (maxDate) {
            rangeStart.dataset.maxDate = maxDate
            rangeEnd.dataset.maxDate = maxDate
          }
          handleRangeStartUpdate(dateRangePickerEl)
          handleRangeEndUpdate(dateRangePickerEl)
        }
        const dateRangePicker = behavior(
          {
            'input change': {
              [DATE_RANGE_PICKER_RANGE_START]() {
                handleRangeStartUpdate(this)
              },
              [DATE_RANGE_PICKER_RANGE_END]() {
                handleRangeEndUpdate(this)
              },
            },
          },
          {
            init(root) {
              select(DATE_RANGE_PICKER, root).forEach((dateRangePickerEl) => {
                enhanceDateRangePicker(dateRangePickerEl)
              })
            },
          }
        )
        module.exports = dateRangePicker
      },
      {
        '../config': 34,
        '../utils/behavior': 43,
        '../utils/select': 49,
        './date-picker': 19,
      },
    ],
    21: [
      function (require, module, exports) {
        'use strict'

        const select = require('../utils/select')
        const behavior = require('../utils/behavior')
        const { prefix: PREFIX } = require('../config')
        const Sanitizer = require('../utils/sanitizer')
        const DROPZONE_CLASS = `${PREFIX}-file-input`
        const DROPZONE = `.${DROPZONE_CLASS}`
        const INPUT_CLASS = `${PREFIX}-file-input__input`
        const TARGET_CLASS = `${PREFIX}-file-input__target`
        const INPUT = `.${INPUT_CLASS}`
        const BOX_CLASS = `${PREFIX}-file-input__box`
        const INSTRUCTIONS_CLASS = `${PREFIX}-file-input__instructions`
        const PREVIEW_CLASS = `${PREFIX}-file-input__preview`
        const PREVIEW_HEADING_CLASS = `${PREFIX}-file-input__preview-heading`
        const DISABLED_CLASS = `${PREFIX}-file-input--disabled`
        const CHOOSE_CLASS = `${PREFIX}-file-input__choose`
        const ACCEPTED_FILE_MESSAGE_CLASS = `${PREFIX}-file-input__accepted-files-message`
        const DRAG_TEXT_CLASS = `${PREFIX}-file-input__drag-text`
        const DRAG_CLASS = `${PREFIX}-file-input--drag`
        const LOADING_CLASS = 'is-loading'
        const HIDDEN_CLASS = 'display-none'
        const INVALID_FILE_CLASS = 'has-invalid-file'
        const GENERIC_PREVIEW_CLASS_NAME = `${PREFIX}-file-input__preview-image`
        const GENERIC_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--generic`
        const PDF_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--pdf`
        const WORD_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--word`
        const VIDEO_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--video`
        const EXCEL_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--excel`
        const SPACER_GIF =
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        let TYPE_IS_VALID = Boolean(true) // logic gate for change listener

        /**
         * The properties and elements within the file input.
         * @typedef {Object} FileInputContext
         * @property {HTMLDivElement} dropZoneEl
         * @property {HTMLInputElement} inputEl
         */

        /**
         * Get an object of the properties and elements belonging directly to the given
         * file input component.
         *
         * @param {HTMLElement} el the element within the file input
         * @returns {FileInputContext} elements
         */
        const getFileInputContext = (el) => {
          const dropZoneEl = el.closest(DROPZONE)
          if (!dropZoneEl) {
            throw new Error(`Element is missing outer ${DROPZONE}`)
          }
          const inputEl = dropZoneEl.querySelector(INPUT)
          return {
            dropZoneEl,
            inputEl,
          }
        }

        /**
         * Disable the file input component
         *
         * @param {HTMLElement} el An element within the file input component
         */
        const disable = (el) => {
          const { dropZoneEl, inputEl } = getFileInputContext(el)
          inputEl.disabled = true
          dropZoneEl.classList.add(DISABLED_CLASS)
          dropZoneEl.setAttribute('aria-disabled', 'true')
        }

        /**
         * Enable the file input component
         *
         * @param {HTMLElement} el An element within the file input component
         */
        const enable = (el) => {
          const { dropZoneEl, inputEl } = getFileInputContext(el)
          inputEl.disabled = false
          dropZoneEl.classList.remove(DISABLED_CLASS)
          dropZoneEl.removeAttribute('aria-disabled')
        }

        /**
         *
         * @param {String} s special characters
         * @returns {String} replaces specified values
         */
        const replaceName = (s) => {
          const c = s.charCodeAt(0)
          if (c === 32) return '-'
          if (c >= 65 && c <= 90) return `img_${s.toLowerCase()}`
          return `__${('000', c.toString(16)).slice(-4)}`
        }

        /**
         * Creates an ID name for each file that strips all invalid characters.
         * @param {String} name - name of the file added to file input (searchvalue)
         * @returns {String} same characters as the name with invalid chars removed (newvalue)
         */
        const makeSafeForID = (name) => name.replace(/[^a-z0-9]/g, replaceName)

        // Takes a generated safe ID and creates a unique ID.
        const createUniqueID = (name) =>
          `${name}-${Math.floor(Date.now().toString() / 1000)}`

        /**
         * Builds full file input component
         * @param {HTMLElement} fileInputEl - original file input on page
         * @returns {HTMLElement|HTMLElement} - Instructions, target area div
         */
        const buildFileInput = (fileInputEl) => {
          const acceptsMultiple = fileInputEl.hasAttribute('multiple')
          const fileInputParent = document.createElement('div')
          const dropTarget = document.createElement('div')
          const box = document.createElement('div')
          const instructions = document.createElement('div')
          const disabled = fileInputEl.hasAttribute('disabled')
          let defaultAriaLabel

          // Adds class names and other attributes
          fileInputEl.classList.remove(DROPZONE_CLASS)
          fileInputEl.classList.add(INPUT_CLASS)
          fileInputParent.classList.add(DROPZONE_CLASS)
          box.classList.add(BOX_CLASS)
          instructions.classList.add(INSTRUCTIONS_CLASS)
          instructions.setAttribute('aria-hidden', 'true')
          dropTarget.classList.add(TARGET_CLASS)
          // Encourage screenreader to read out aria changes immediately following upload status change
          fileInputEl.setAttribute('aria-live', 'polite')

          // Adds child elements to the DOM
          fileInputEl.parentNode.insertBefore(dropTarget, fileInputEl)
          fileInputEl.parentNode.insertBefore(fileInputParent, dropTarget)
          dropTarget.appendChild(fileInputEl)
          fileInputParent.appendChild(dropTarget)
          fileInputEl.parentNode.insertBefore(instructions, fileInputEl)
          fileInputEl.parentNode.insertBefore(box, fileInputEl)

          // Disabled styling
          if (disabled) {
            disable(fileInputEl)
          }

          // Sets instruction test and aria-label based on whether or not multiple files are accepted
          if (acceptsMultiple) {
            defaultAriaLabel = 'No files selected'
            instructions.innerHTML = Sanitizer.escapeHTML`<span class="${DRAG_TEXT_CLASS}">Drag files here or </span><span class="${CHOOSE_CLASS}">choose from folder</span>`
            fileInputEl.setAttribute('aria-label', defaultAriaLabel)
            fileInputEl.setAttribute(
              'data-default-aria-label',
              defaultAriaLabel
            )
          } else {
            defaultAriaLabel = 'No file selected'
            instructions.innerHTML = Sanitizer.escapeHTML`<span class="${DRAG_TEXT_CLASS}">Drag file here or </span><span class="${CHOOSE_CLASS}">choose from folder</span>`
            fileInputEl.setAttribute('aria-label', defaultAriaLabel)
            fileInputEl.setAttribute(
              'data-default-aria-label',
              defaultAriaLabel
            )
          }

          // IE11 and Edge do not support drop files on file inputs, so we've removed text that indicates that
          if (
            /rv:11.0/i.test(navigator.userAgent) ||
            /Edge\/\d./i.test(navigator.userAgent)
          ) {
            fileInputParent.querySelector(`.${DRAG_TEXT_CLASS}`).outerHTML = ''
          }
          return {
            instructions,
            dropTarget,
          }
        }

        /**
         * Removes image previews, we want to start with a clean list every time files are added to the file input
         * @param {HTMLElement} dropTarget - target area div that encases the input
         * @param {HTMLElement} instructions - text to inform users to drag or select files
         */
        const removeOldPreviews = (
          dropTarget,
          instructions,
          inputAriaLabel
        ) => {
          const filePreviews = dropTarget.querySelectorAll(`.${PREVIEW_CLASS}`)
          const fileInputElement = dropTarget.querySelector(INPUT)
          const currentPreviewHeading = dropTarget.querySelector(
            `.${PREVIEW_HEADING_CLASS}`
          )
          const currentErrorMessage = dropTarget.querySelector(
            `.${ACCEPTED_FILE_MESSAGE_CLASS}`
          )

          /**
           * finds the parent of the passed node and removes the child
           * @param {HTMLElement} node
           */
          const removeImages = (node) => {
            node.parentNode.removeChild(node)
          }

          // Remove the heading above the previews
          if (currentPreviewHeading) {
            currentPreviewHeading.outerHTML = ''
          }

          // Remove existing error messages
          if (currentErrorMessage) {
            currentErrorMessage.outerHTML = ''
            dropTarget.classList.remove(INVALID_FILE_CLASS)
          }

          // Get rid of existing previews if they exist, show instructions
          if (filePreviews !== null) {
            if (instructions) {
              instructions.classList.remove(HIDDEN_CLASS)
            }
            fileInputElement.setAttribute('aria-label', inputAriaLabel)
            Array.prototype.forEach.call(filePreviews, removeImages)
          }
        }

        /**
         * When new files are applied to file input, this function generates previews
         * and removes old ones.
         * @param {event} e
         * @param {HTMLElement} fileInputEl - file input element
         * @param {HTMLElement} instructions - text to inform users to drag or select files
         * @param {HTMLElement} dropTarget - target area div that encases the input
         */

        const handleChange = (e, fileInputEl, instructions, dropTarget) => {
          const fileNames = e.target.files
          const filePreviewsHeading = document.createElement('div')
          const inputAriaLabel = fileInputEl.dataset.defaultAriaLabel
          const fileStore = []

          // First, get rid of existing previews
          removeOldPreviews(dropTarget, instructions, inputAriaLabel)

          // Then, iterate through files list and:
          // 1. Add selected file list names to aria-label
          // 2. Create previews
          for (let i = 0; i < fileNames.length; i += 1) {
            const reader = new FileReader()
            const fileName = fileNames[i].name

            // Push updated file names into the store array
            fileStore.push(fileName)

            // read out the store array via aria-label, wording options vary based on file count
            if (i === 0) {
              fileInputEl.setAttribute(
                'aria-label',
                `You have selected the file: ${fileName}`
              )
            } else if (i >= 1) {
              fileInputEl.setAttribute(
                'aria-label',
                `You have selected ${fileNames.length} files: ${fileStore.join(
                  ', '
                )}`
              )
            }

            // Starts with a loading image while preview is created
            reader.onloadstart = function createLoadingImage() {
              const imageId = createUniqueID(makeSafeForID(fileName))
              instructions.insertAdjacentHTML(
                'afterend',
                Sanitizer.escapeHTML`<div class="${PREVIEW_CLASS}" aria-hidden="true">
          <img id="${imageId}" src="${SPACER_GIF}" alt="" class="${GENERIC_PREVIEW_CLASS_NAME} ${LOADING_CLASS}"/>${fileName}
        <div>`
              )
            }

            // Not all files will be able to generate previews. In case this happens, we provide several types "generic previews" based on the file extension.
            reader.onloadend = function createFilePreview() {
              const imageId = createUniqueID(makeSafeForID(fileName))
              const previewImage = document.getElementById(imageId)
              if (fileName.indexOf('.pdf') > 0) {
                previewImage.setAttribute(
                  'onerror',
                  `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${PDF_PREVIEW_CLASS}")`
                )
              } else if (
                fileName.indexOf('.doc') > 0 ||
                fileName.indexOf('.pages') > 0
              ) {
                previewImage.setAttribute(
                  'onerror',
                  `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${WORD_PREVIEW_CLASS}")`
                )
              } else if (
                fileName.indexOf('.xls') > 0 ||
                fileName.indexOf('.numbers') > 0
              ) {
                previewImage.setAttribute(
                  'onerror',
                  `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${EXCEL_PREVIEW_CLASS}")`
                )
              } else if (
                fileName.indexOf('.mov') > 0 ||
                fileName.indexOf('.mp4') > 0
              ) {
                previewImage.setAttribute(
                  'onerror',
                  `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${VIDEO_PREVIEW_CLASS}")`
                )
              } else {
                previewImage.setAttribute(
                  'onerror',
                  `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${GENERIC_PREVIEW_CLASS}")`
                )
              }

              // Removes loader and displays preview
              previewImage.classList.remove(LOADING_CLASS)
              previewImage.src = reader.result
            }
            if (fileNames[i]) {
              reader.readAsDataURL(fileNames[i])
            }

            // Adds heading above file previews, pluralizes if there are multiple
            if (i === 0) {
              dropTarget.insertBefore(filePreviewsHeading, instructions)
              filePreviewsHeading.innerHTML = `Selected file <span class="usa-file-input__choose">Change file</span>`
            } else if (i >= 1) {
              dropTarget.insertBefore(filePreviewsHeading, instructions)
              filePreviewsHeading.innerHTML = Sanitizer.escapeHTML`${
                i + 1
              } files selected <span class="usa-file-input__choose">Change files</span>`
            }

            // Hides null state content and sets preview heading class
            if (filePreviewsHeading) {
              instructions.classList.add(HIDDEN_CLASS)
              filePreviewsHeading.classList.add(PREVIEW_HEADING_CLASS)
            }
          }
        }

        /**
         * When using an Accept attribute, invalid files will be hidden from
         * file browser, but they can still be dragged to the input. This
         * function prevents them from being dragged and removes error states
         * when correct files are added.
         * @param {event} e
         * @param {HTMLElement} fileInputEl - file input element
         * @param {HTMLElement} instructions - text to inform users to drag or select files
         * @param {HTMLElement} dropTarget - target area div that encases the input
         */
        const preventInvalidFiles = (
          e,
          fileInputEl,
          instructions,
          dropTarget
        ) => {
          const acceptedFilesAttr = fileInputEl.getAttribute('accept')
          dropTarget.classList.remove(INVALID_FILE_CLASS)

          /**
           * We can probably move away from this once IE11 support stops, and replace
           * with a simple es `.includes`
           * check if element is in array
           * check if 1 or more alphabets are in string
           * if element is present return the position value and -1 otherwise
           * @param {Object} file
           * @param {String} value
           * @returns {Boolean}
           */
          const isIncluded = (file, value) => {
            let returnValue = false
            const pos = file.indexOf(value)
            if (pos >= 0) {
              returnValue = true
            }
            return returnValue
          }

          // Runs if only specific files are accepted
          if (acceptedFilesAttr) {
            const acceptedFiles = acceptedFilesAttr.split(',')
            const errorMessage = document.createElement('div')

            // If multiple files are dragged, this iterates through them and look for any files that are not accepted.
            let allFilesAllowed = true
            const scannedFiles = e.target.files || e.dataTransfer.files
            for (let i = 0; i < scannedFiles.length; i += 1) {
              const file = scannedFiles[i]
              if (allFilesAllowed) {
                for (let j = 0; j < acceptedFiles.length; j += 1) {
                  const fileType = acceptedFiles[j]
                  allFilesAllowed =
                    file.name.indexOf(fileType) > 0 ||
                    isIncluded(file.type, fileType.replace(/\*/g, ''))
                  if (allFilesAllowed) {
                    TYPE_IS_VALID = true
                    break
                  }
                }
              } else break
            }

            // If dragged files are not accepted, this removes them from the value of the input and creates and error state
            if (!allFilesAllowed) {
              removeOldPreviews(dropTarget, instructions)
              fileInputEl.value = '' // eslint-disable-line no-param-reassign
              dropTarget.insertBefore(errorMessage, fileInputEl)
              errorMessage.textContent =
                fileInputEl.dataset.errormessage ||
                `This is not a valid file type.`
              errorMessage.classList.add(ACCEPTED_FILE_MESSAGE_CLASS)
              dropTarget.classList.add(INVALID_FILE_CLASS)
              TYPE_IS_VALID = false
              e.preventDefault()
              e.stopPropagation()
            }
          }
        }

        /**
         * 1. passes through gate for preventing invalid files
         * 2. handles updates if file is valid
         * @param {event} event
         * @param {HTMLElement} element
         * @param {HTMLElement} instructionsEl
         * @param {HTMLElement} target
         */
        const handleUpload = (event, element, instructionsEl, dropTargetEl) => {
          preventInvalidFiles(event, element, instructionsEl, dropTargetEl)
          if (TYPE_IS_VALID === true) {
            handleChange(event, element, instructionsEl, dropTargetEl)
          }
        }
        const fileInput = behavior(
          {},
          {
            init(root) {
              select(DROPZONE, root).forEach((fileInputEl) => {
                const { instructions, dropTarget } = buildFileInput(fileInputEl)
                dropTarget.addEventListener(
                  'dragover',
                  function handleDragOver() {
                    this.classList.add(DRAG_CLASS)
                  },
                  false
                )
                dropTarget.addEventListener(
                  'dragleave',
                  function handleDragLeave() {
                    this.classList.remove(DRAG_CLASS)
                  },
                  false
                )
                dropTarget.addEventListener(
                  'drop',
                  function handleDrop() {
                    this.classList.remove(DRAG_CLASS)
                  },
                  false
                )
                fileInputEl.addEventListener(
                  'change',
                  (e) => handleUpload(e, fileInputEl, instructions, dropTarget),
                  false
                )
              })
            },
            getFileInputContext,
            disable,
            enable,
          }
        )
        module.exports = fileInput
      },
      {
        '../config': 34,
        '../utils/behavior': 43,
        '../utils/sanitizer': 47,
        '../utils/select': 49,
      },
    ],
    22: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const SCOPE = `.${PREFIX}-footer--big`
        const NAV = `${SCOPE} nav`
        const BUTTON = `${NAV} .${PREFIX}-footer__primary-link`
        const HIDE_MAX_WIDTH = 480

        /**
         * Expands selected footer menu panel, while collapsing others
         */
        function showPanel() {
          if (window.innerWidth < HIDE_MAX_WIDTH) {
            const isOpen = this.getAttribute('aria-expanded') === 'true'
            const thisFooter = this.closest(SCOPE)

            // Close all other menus
            thisFooter.querySelectorAll(BUTTON).forEach((button) => {
              button.setAttribute('aria-expanded', false)
            })
            this.setAttribute('aria-expanded', !isOpen)
          }
        }

        /**
         * Swaps the <h4> element for a <button> element (and vice-versa) and sets id
         * of menu list
         *
         * @param {Boolean} isMobile - If the footer is in mobile configuration
         */
        function toggleHtmlTag(isMobile) {
          const bigFooter = document.querySelector(SCOPE)
          if (!bigFooter) {
            return
          }
          const primaryLinks = bigFooter.querySelectorAll(BUTTON)
          const newElementType = isMobile ? 'button' : 'h4'
          primaryLinks.forEach((currentElement) => {
            const currentElementClasses = currentElement.getAttribute('class')

            // Create the new element
            const newElement = document.createElement(newElementType)
            newElement.setAttribute('class', currentElementClasses)
            newElement.classList.toggle(
              `${PREFIX}-footer__primary-link--button`,
              isMobile
            )
            newElement.textContent = currentElement.textContent
            if (isMobile) {
              const menuId = `${PREFIX}-footer-menu-list-${Math.floor(
                Math.random() * 100000
              )}`
              newElement.setAttribute('aria-controls', menuId)
              newElement.setAttribute('aria-expanded', 'false')
              currentElement.nextElementSibling.setAttribute('id', menuId)
              newElement.setAttribute('type', 'button')
            }

            // Insert the new element and delete the old
            currentElement.after(newElement)
            currentElement.remove()
          })
        }
        const resize = (event) => {
          toggleHtmlTag(event.matches)
        }
        module.exports = behavior(
          {
            [CLICK]: {
              [BUTTON]: showPanel,
            },
          },
          {
            // export for use elsewhere
            HIDE_MAX_WIDTH,
            init() {
              toggleHtmlTag(window.innerWidth < HIDE_MAX_WIDTH)
              this.mediaQueryList = window.matchMedia(
                `(max-width: ${HIDE_MAX_WIDTH - 0.1}px)`
              )
              this.mediaQueryList.addListener(resize)
            },
            teardown() {
              this.mediaQueryList.removeListener(resize)
            },
          }
        )
      },
      { '../config': 34, '../events': 35, '../utils/behavior': 43 },
    ],
    23: [
      function (require, module, exports) {
        'use strict'

        const accordion = require('./accordion')
        const banner = require('./banner')
        const characterCount = require('./character-count')
        const comboBox = require('./combo-box')
        const fileInput = require('./file-input')
        const footer = require('./footer')
        const inputPrefixSuffix = require('./input-prefix-suffix')
        const modal = require('./modal')
        const navigation = require('./navigation')
        const password = require('./password')
        const search = require('./search')
        const skipnav = require('./skipnav')
        const tooltip = require('./tooltip')
        const validator = require('./validator')
        const datePicker = require('./date-picker')
        const dateRangePicker = require('./date-range-picker')
        const timePicker = require('./time-picker')
        const table = require('./table')
        module.exports = {
          accordion,
          banner,
          characterCount,
          comboBox,
          datePicker,
          dateRangePicker,
          fileInput,
          footer,
          inputPrefixSuffix,
          modal,
          navigation,
          password,
          search,
          skipnav,
          table,
          timePicker,
          tooltip,
          validator,
        }
      },
      {
        './accordion': 15,
        './banner': 16,
        './character-count': 17,
        './combo-box': 18,
        './date-picker': 19,
        './date-range-picker': 20,
        './file-input': 21,
        './footer': 22,
        './input-prefix-suffix': 24,
        './modal': 25,
        './navigation': 26,
        './password': 27,
        './search': 28,
        './skipnav': 29,
        './table': 30,
        './time-picker': 31,
        './tooltip': 32,
        './validator': 33,
      },
    ],
    24: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const select = require('../utils/select')
        const { prefix: PREFIX } = require('../config')
        const { CLICK } = require('../events')
        const CONTAINER = `.${PREFIX}-input-group`
        const INPUT = `${CONTAINER} .${PREFIX}-input`
        const DECORATION = `${CONTAINER} .${PREFIX}-input-prefix, ${CONTAINER} .${PREFIX}-input-suffix`
        const FOCUS_CLASS = 'is-focused'
        function setFocus(el) {
          el.closest(CONTAINER).querySelector(`.${PREFIX}-input`).focus()
        }
        function handleFocus() {
          this.closest(CONTAINER).classList.add(FOCUS_CLASS)
        }
        function handleBlur() {
          this.closest(CONTAINER).classList.remove(FOCUS_CLASS)
        }
        const inputPrefixSuffix = behavior(
          {
            [CLICK]: {
              [DECORATION]() {
                setFocus(this)
              },
            },
          },
          {
            init(root) {
              select(INPUT, root).forEach((inputEl) => {
                inputEl.addEventListener('focus', handleFocus, false)
                inputEl.addEventListener('blur', handleBlur, false)
              })
            },
          }
        )
        module.exports = inputPrefixSuffix
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/select': 49,
      },
    ],
    25: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const select = require('../utils/select')
        const FocusTrap = require('../utils/focus-trap')
        const ScrollBarWidth = require('../utils/scrollbar-width')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const MODAL_CLASSNAME = `${PREFIX}-modal`
        const OVERLAY_CLASSNAME = `${MODAL_CLASSNAME}-overlay`
        const WRAPPER_CLASSNAME = `${MODAL_CLASSNAME}-wrapper`
        const OPENER_ATTRIBUTE = 'data-open-modal'
        const CLOSER_ATTRIBUTE = 'data-close-modal'
        const FORCE_ACTION_ATTRIBUTE = 'data-force-action'
        const NON_MODAL_HIDDEN_ATTRIBUTE = `data-modal-hidden`
        const MODAL = `.${MODAL_CLASSNAME}`
        const INITIAL_FOCUS = `.${WRAPPER_CLASSNAME} *[data-focus]`
        const CLOSE_BUTTON = `${WRAPPER_CLASSNAME} *[${CLOSER_ATTRIBUTE}]`
        const OPENERS = `*[${OPENER_ATTRIBUTE}][aria-controls]`
        const CLOSERS = `${CLOSE_BUTTON}, .${OVERLAY_CLASSNAME}:not([${FORCE_ACTION_ATTRIBUTE}])`
        const NON_MODALS = `body > *:not(.${WRAPPER_CLASSNAME}):not([aria-hidden])`
        const NON_MODALS_HIDDEN = `[${NON_MODAL_HIDDEN_ATTRIBUTE}]`
        const ACTIVE_CLASS = 'usa-js-modal--active'
        const PREVENT_CLICK_CLASS = 'usa-js-no-click'
        const VISIBLE_CLASS = 'is-visible'
        const HIDDEN_CLASS = 'is-hidden'
        let modal
        const isActive = () => document.body.classList.contains(ACTIVE_CLASS)
        const SCROLLBAR_WIDTH = ScrollBarWidth()
        const INITIAL_PADDING = window
          .getComputedStyle(document.body)
          .getPropertyValue('padding-right')
        const TEMPORARY_PADDING = `${
          parseInt(INITIAL_PADDING.replace(/px/, ''), 10) +
          parseInt(SCROLLBAR_WIDTH.replace(/px/, ''), 10)
        }px`

        /**
         *  Is bound to escape key, closes modal when
         */
        const onMenuClose = () => {
          modal.toggleModal.call(modal, false)
        }

        /**
         *  Toggle the visibility of a modal window
         *
         * @param {KeyboardEvent} event the keydown event
         * @returns {boolean} safeActive if mobile is open
         */
        function toggleModal(event) {
          let originalOpener
          let clickedElement = event.target
          const { body } = document
          const safeActive = !isActive()
          const modalId = clickedElement
            ? clickedElement.getAttribute('aria-controls')
            : document.querySelector('.usa-modal-wrapper.is-visible')
          const targetModal = safeActive
            ? document.getElementById(modalId)
            : document.querySelector('.usa-modal-wrapper.is-visible')

          // if there is no modal we return early
          if (!targetModal) {
            return false
          }
          const openFocusEl = targetModal.querySelector(INITIAL_FOCUS)
            ? targetModal.querySelector(INITIAL_FOCUS)
            : targetModal.querySelector('.usa-modal')
          const returnFocus = document.getElementById(
            targetModal.getAttribute('data-opener')
          )
          const menuButton = body.querySelector(OPENERS)
          const forceUserAction = targetModal.getAttribute(
            FORCE_ACTION_ATTRIBUTE
          )

          // Sets the clicked element to the close button
          // so esc key always closes modal
          if (event.type === 'keydown' && targetModal !== null) {
            clickedElement = targetModal.querySelector(CLOSE_BUTTON)
          }

          // When we're not hitting the escape key…
          if (clickedElement) {
            // Make sure we click the opener
            // If it doesn't have an ID, make one
            // Store id as data attribute on modal
            if (clickedElement.hasAttribute(OPENER_ATTRIBUTE)) {
              if (this.getAttribute('id') === null) {
                originalOpener = `modal-${
                  Math.floor(Math.random() * 900000) + 100000
                }`
                this.setAttribute('id', originalOpener)
              } else {
                originalOpener = this.getAttribute('id')
              }
              targetModal.setAttribute('data-opener', originalOpener)
            }

            // This basically stops the propagation if the element
            // is inside the modal and not a close button or
            // element inside a close button
            if (clickedElement.closest(`.${MODAL_CLASSNAME}`)) {
              if (
                clickedElement.hasAttribute(CLOSER_ATTRIBUTE) ||
                clickedElement.closest(`[${CLOSER_ATTRIBUTE}]`)
              ) {
                // do nothing. move on.
              } else {
                event.stopPropagation()
                return false
              }
            }
          }
          body.classList.toggle(ACTIVE_CLASS, safeActive)
          targetModal.classList.toggle(VISIBLE_CLASS, safeActive)
          targetModal.classList.toggle(HIDDEN_CLASS, !safeActive)

          // If user is forced to take an action, adding
          // a class to the body that prevents clicking underneath
          // overlay
          if (forceUserAction) {
            body.classList.toggle(PREVENT_CLICK_CLASS, safeActive)
          }

          // Account for content shifting from body overflow: hidden
          // We only check paddingRight in case apps are adding other properties
          // to the body element
          body.style.paddingRight =
            body.style.paddingRight === TEMPORARY_PADDING
              ? INITIAL_PADDING
              : TEMPORARY_PADDING

          // Handle the focus actions
          if (safeActive && openFocusEl) {
            // The modal window is opened. Focus is set to close button.

            // Binds escape key if we're not forcing
            // the user to take an action
            if (forceUserAction) {
              modal.focusTrap = FocusTrap(targetModal)
            } else {
              modal.focusTrap = FocusTrap(targetModal, {
                Escape: onMenuClose,
              })
            }

            // Handles focus setting and interactions
            modal.focusTrap.update(safeActive)
            openFocusEl.focus()

            // Hides everything that is not the modal from screen readers
            document.querySelectorAll(NON_MODALS).forEach((nonModal) => {
              nonModal.setAttribute('aria-hidden', 'true')
              nonModal.setAttribute(NON_MODAL_HIDDEN_ATTRIBUTE, '')
            })
          } else if (!safeActive && menuButton && returnFocus) {
            // The modal window is closed.
            // Non-modals now accesible to screen reader
            document.querySelectorAll(NON_MODALS_HIDDEN).forEach((nonModal) => {
              nonModal.removeAttribute('aria-hidden')
              nonModal.removeAttribute(NON_MODAL_HIDDEN_ATTRIBUTE)
            })

            // Focus is returned to the opener
            returnFocus.focus()
            modal.focusTrap.update(safeActive)
          }
          return safeActive
        }

        /**
         *  Builds modal window from base HTML
         *
         * @param {HTMLElement} baseComponent the modal html in the DOM
         */
        const setUpAttributes = (baseComponent) => {
          const modalContent = baseComponent
          const modalWrapper = document.createElement('div')
          const overlayDiv = document.createElement('div')
          const modalID = baseComponent.getAttribute('id')
          const ariaLabelledBy = baseComponent.getAttribute('aria-labelledby')
          const ariaDescribedBy = baseComponent.getAttribute('aria-describedby')
          const forceUserAction = baseComponent.hasAttribute(
            FORCE_ACTION_ATTRIBUTE
          )
            ? baseComponent.hasAttribute(FORCE_ACTION_ATTRIBUTE)
            : false

          // Rebuild the modal element
          modalContent.parentNode.insertBefore(modalWrapper, modalContent)
          modalWrapper.appendChild(modalContent)
          modalContent.parentNode.insertBefore(overlayDiv, modalContent)
          overlayDiv.appendChild(modalContent)

          // Add classes and attributes
          modalWrapper.classList.add(HIDDEN_CLASS)
          modalWrapper.classList.add(WRAPPER_CLASSNAME)
          overlayDiv.classList.add(OVERLAY_CLASSNAME)

          // Set attributes
          modalWrapper.setAttribute('role', 'dialog')
          modalWrapper.setAttribute('id', modalID)
          if (ariaLabelledBy) {
            modalWrapper.setAttribute('aria-labelledby', ariaLabelledBy)
          }
          if (ariaDescribedBy) {
            modalWrapper.setAttribute('aria-describedby', ariaDescribedBy)
          }
          if (forceUserAction) {
            modalWrapper.setAttribute(FORCE_ACTION_ATTRIBUTE, 'true')
          }

          // Update the base element HTML
          baseComponent.removeAttribute('id')
          baseComponent.removeAttribute('aria-labelledby')
          baseComponent.removeAttribute('aria-describedby')
          baseComponent.setAttribute('tabindex', '-1')

          // Add aria-controls
          const modalClosers = modalWrapper.querySelectorAll(CLOSERS)
          select(modalClosers).forEach((el) => {
            el.setAttribute('aria-controls', modalID)
          })

          // Move all modals to the end of the DOM. Doing this allows us to
          // more easily find the elements to hide from screen readers
          // when the modal is open.
          document.body.appendChild(modalWrapper)
        }
        modal = behavior(
          {
            [CLICK]: {
              [OPENERS]: toggleModal,
              [CLOSERS]: toggleModal,
            },
          },
          {
            init(root) {
              select(MODAL, root).forEach((modalWindow) => {
                setUpAttributes(modalWindow)
              })
              select(OPENERS, root).forEach((item) => {
                // Turn anchor links into buttons because of
                // VoiceOver on Safari
                if (item.nodeName === 'A') {
                  item.setAttribute('role', 'button')
                  item.addEventListener('click', (e) => {
                    e.preventDefault()
                  })
                }

                // Can uncomment when aria-haspopup="dialog" is supported
                // https://a11ysupport.io/tech/aria/aria-haspopup_attribute
                // Most screen readers support aria-haspopup, but might announce
                // as opening a menu if "dialog" is not supported.
                // item.setAttribute("aria-haspopup", "dialog");
              })
            },

            focusTrap: null,
            toggleModal,
          }
        )
        module.exports = modal
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/focus-trap': 44,
        '../utils/scrollbar-width': 48,
        '../utils/select': 49,
      },
    ],
    26: [
      function (require, module, exports) {
        'use strict'

        const keymap = require('receptor/keymap')
        const behavior = require('../utils/behavior')
        const select = require('../utils/select')
        const toggle = require('../utils/toggle')
        const FocusTrap = require('../utils/focus-trap')
        const accordion = require('./accordion')
        const ScrollBarWidth = require('../utils/scrollbar-width')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const BODY = 'body'
        const HEADER = `.${PREFIX}-header`
        const NAV = `.${PREFIX}-nav`
        const NAV_PRIMARY = `.${PREFIX}-nav__primary`
        const NAV_PRIMARY_ITEM = `.${PREFIX}-nav__primary-item`
        const NAV_CONTROL = `button.${PREFIX}-nav__link`
        const NAV_LINKS = `${NAV} a`
        const NON_NAV_HIDDEN_ATTRIBUTE = `data-nav-hidden`
        const OPENERS = `.${PREFIX}-menu-btn`
        const CLOSE_BUTTON = `.${PREFIX}-nav__close`
        const OVERLAY = `.${PREFIX}-overlay`
        const CLOSERS = `${CLOSE_BUTTON}, .${PREFIX}-overlay`
        const TOGGLES = [NAV, OVERLAY].join(', ')
        const NON_NAV_ELEMENTS = `body > *:not(${HEADER}):not([aria-hidden])`
        const NON_NAV_HIDDEN = `[${NON_NAV_HIDDEN_ATTRIBUTE}]`
        const ACTIVE_CLASS = 'usa-js-mobile-nav--active'
        const VISIBLE_CLASS = 'is-visible'
        let navigation
        let navActive
        let nonNavElements
        const isActive = () => document.body.classList.contains(ACTIVE_CLASS)
        const SCROLLBAR_WIDTH = ScrollBarWidth()
        const INITIAL_PADDING = window
          .getComputedStyle(document.body)
          .getPropertyValue('padding-right')
        const TEMPORARY_PADDING = `${
          parseInt(INITIAL_PADDING.replace(/px/, ''), 10) +
          parseInt(SCROLLBAR_WIDTH.replace(/px/, ''), 10)
        }px`
        const hideNonNavItems = () => {
          nonNavElements = document.querySelectorAll(NON_NAV_ELEMENTS)
          nonNavElements.forEach((nonNavElement) => {
            nonNavElement.setAttribute('aria-hidden', true)
            nonNavElement.setAttribute(NON_NAV_HIDDEN_ATTRIBUTE, '')
          })
        }
        const showNonNavItems = () => {
          nonNavElements = document.querySelectorAll(NON_NAV_HIDDEN)
          if (!nonNavElements) {
            return
          }

          // Remove aria-hidden from non-header elements
          nonNavElements.forEach((nonNavElement) => {
            nonNavElement.removeAttribute('aria-hidden')
            nonNavElement.removeAttribute(NON_NAV_HIDDEN_ATTRIBUTE)
          })
        }

        // Toggle all non-header elements #3527.
        const toggleNonNavItems = (active) => {
          if (active) {
            hideNonNavItems()
          } else {
            showNonNavItems()
          }
        }
        const toggleNav = (active) => {
          const { body } = document
          const safeActive = typeof active === 'boolean' ? active : !isActive()
          body.classList.toggle(ACTIVE_CLASS, safeActive)
          select(TOGGLES).forEach((el) =>
            el.classList.toggle(VISIBLE_CLASS, safeActive)
          )
          navigation.focusTrap.update(safeActive)
          const closeButton = body.querySelector(CLOSE_BUTTON)
          const menuButton = document.querySelector(OPENERS)
          body.style.paddingRight =
            body.style.paddingRight === TEMPORARY_PADDING
              ? INITIAL_PADDING
              : TEMPORARY_PADDING
          toggleNonNavItems(safeActive)
          if (safeActive && closeButton) {
            // The mobile nav was just activated. Focus on the close button, which is
            // just before all the nav elements in the tab order.
            closeButton.focus()
          } else if (
            !safeActive &&
            document.activeElement === closeButton &&
            menuButton
          ) {
            // The mobile nav was just deactivated, and focus was on the close
            // button, which is no longer visible. We don't want the focus to
            // disappear into the void, so focus on the menu button if it's
            // visible (this may have been what the user was just focused on,
            // if they triggered the mobile nav by mistake).
            menuButton.focus()
          }
          return safeActive
        }
        const resize = () => {
          const closer = document.body.querySelector(CLOSE_BUTTON)
          if (
            isActive() &&
            closer &&
            closer.getBoundingClientRect().width === 0
          ) {
            // When the mobile nav is active, and the close box isn't visible,
            // we know the user's viewport has been resized to be larger.
            // Let's make the page state consistent by deactivating the mobile nav.
            navigation.toggleNav.call(closer, false)
          }
        }
        const onMenuClose = () => navigation.toggleNav.call(navigation, false)
        const hideActiveNavDropdown = () => {
          if (!navActive) {
            return
          }
          toggle(navActive, false)
          navActive = null
        }
        const focusNavButton = (event) => {
          const parentNavItem = event.target.closest(NAV_PRIMARY_ITEM)

          // Only shift focus if within dropdown
          if (!event.target.matches(NAV_CONTROL)) {
            parentNavItem.querySelector(NAV_CONTROL).focus()
          }
        }
        const handleEscape = (event) => {
          hideActiveNavDropdown()
          focusNavButton(event)
        }
        navigation = behavior(
          {
            [CLICK]: {
              [NAV_CONTROL]() {
                // If another nav is open, close it
                if (navActive !== this) {
                  hideActiveNavDropdown()
                }
                // store a reference to the last clicked nav link element, so we
                // can hide the dropdown if another element on the page is clicked
                if (!navActive) {
                  navActive = this
                  toggle(navActive, true)
                }

                // Do this so the event handler on the body doesn't fire
                return false
              },
              [BODY]: hideActiveNavDropdown,
              [OPENERS]: toggleNav,
              [CLOSERS]: toggleNav,
              [NAV_LINKS]() {
                // A navigation link has been clicked! We want to collapse any
                // hierarchical navigation UI it's a part of, so that the user
                // can focus on whatever they've just selected.

                // Some navigation links are inside accordions; when they're
                // clicked, we want to collapse those accordions.
                const acc = this.closest(accordion.ACCORDION)
                if (acc) {
                  accordion
                    .getButtons(acc)
                    .forEach((btn) => accordion.hide(btn))
                }

                // If the mobile navigation menu is active, we want to hide it.
                if (isActive()) {
                  navigation.toggleNav.call(navigation, false)
                }
              },
            },
            keydown: {
              [NAV_PRIMARY]: keymap({
                Escape: handleEscape,
              }),
            },
            focusout: {
              [NAV_PRIMARY](event) {
                const nav = event.target.closest(NAV_PRIMARY)
                if (!nav.contains(event.relatedTarget)) {
                  hideActiveNavDropdown()
                }
              },
            },
          },
          {
            init(root) {
              const trapContainer = root.querySelector(NAV)
              if (trapContainer) {
                navigation.focusTrap = FocusTrap(trapContainer, {
                  Escape: onMenuClose,
                })
              }
              resize()
              window.addEventListener('resize', resize, false)
            },
            teardown() {
              window.removeEventListener('resize', resize, false)
              navActive = false
            },
            focusTrap: null,
            toggleNav,
          }
        )
        module.exports = navigation
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/focus-trap': 44,
        '../utils/scrollbar-width': 48,
        '../utils/select': 49,
        '../utils/toggle': 52,
        './accordion': 15,
        'receptor/keymap': 12,
      },
    ],
    27: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const toggleFormInput = require('../utils/toggle-form-input')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const LINK = `.${PREFIX}-show-password, .${PREFIX}-show-multipassword`
        function toggle(event) {
          event.preventDefault()
          toggleFormInput(this)
        }
        module.exports = behavior({
          [CLICK]: {
            [LINK]: toggle,
          },
        })
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/toggle-form-input': 51,
      },
    ],
    28: [
      function (require, module, exports) {
        'use strict'

        const ignore = require('receptor/ignore')
        const behavior = require('../utils/behavior')
        const select = require('../utils/select')
        const { CLICK } = require('../events')
        const BUTTON = '.js-search-button'
        const FORM = '.js-search-form'
        const INPUT = '[type=search]'
        const CONTEXT = 'header' // XXX

        let lastButton
        const getForm = (button) => {
          const context = button.closest(CONTEXT)
          return context
            ? context.querySelector(FORM)
            : document.querySelector(FORM)
        }
        const toggleSearch = (button, active) => {
          const form = getForm(button)
          if (!form) {
            throw new Error(`No ${FORM} found for search toggle in ${CONTEXT}!`)
          }

          /* eslint-disable no-param-reassign */
          button.hidden = active
          form.hidden = !active
          /* eslint-enable */

          if (!active) {
            return
          }
          const input = form.querySelector(INPUT)
          if (input) {
            input.focus()
          }
          // when the user clicks _outside_ of the form w/ignore(): hide the
          // search, then remove the listener
          const listener = ignore(form, () => {
            if (lastButton) {
              hideSearch.call(lastButton) // eslint-disable-line no-use-before-define
            }

            document.body.removeEventListener(CLICK, listener)
          })

          // Normally we would just run this code without a timeout, but
          // IE11 and Edge will actually call the listener *immediately* because
          // they are currently handling this exact type of event, so we'll
          // make sure the browser is done handling the current click event,
          // if any, before we attach the listener.
          setTimeout(() => {
            document.body.addEventListener(CLICK, listener)
          }, 0)
        }
        function showSearch() {
          toggleSearch(this, true)
          lastButton = this
        }
        function hideSearch() {
          toggleSearch(this, false)
          lastButton = undefined
        }
        const search = behavior(
          {
            [CLICK]: {
              [BUTTON]: showSearch,
            },
          },
          {
            init(target) {
              select(BUTTON, target).forEach((button) => {
                toggleSearch(button, false)
              })
            },
            teardown() {
              // forget the last button clicked
              lastButton = undefined
            },
          }
        )
        module.exports = search
      },
      {
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/select': 49,
        'receptor/ignore': 10,
      },
    ],
    29: [
      function (require, module, exports) {
        'use strict'

        const once = require('receptor/once')
        const behavior = require('../utils/behavior')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const LINK = `.${PREFIX}-skipnav[href^="#"], .${PREFIX}-footer__return-to-top [href^="#"]`
        const MAINCONTENT = 'main-content'
        function setTabindex() {
          // NB: we know because of the selector we're delegating to below that the
          // href already begins with '#'
          const id = encodeURI(this.getAttribute('href'))
          const target = document.getElementById(
            id === '#' ? MAINCONTENT : id.slice(1)
          )
          if (target) {
            target.style.outline = '0'
            target.setAttribute('tabindex', 0)
            target.focus()
            target.addEventListener(
              'blur',
              once(() => {
                target.setAttribute('tabindex', -1)
              })
            )
          } else {
            // throw an error?
          }
        }
        module.exports = behavior({
          [CLICK]: {
            [LINK]: setTabindex,
          },
        })
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        'receptor/once': 13,
      },
    ],
    30: [
      function (require, module, exports) {
        'use strict'

        const select = require('../utils/select')
        const behavior = require('../utils/behavior')
        const { CLICK } = require('../events')
        const { prefix: PREFIX } = require('../config')
        const Sanitizer = require('../utils/sanitizer')
        const TABLE = `.${PREFIX}-table`
        const SORTED = 'aria-sort'
        const ASCENDING = 'ascending'
        const DESCENDING = 'descending'
        const SORT_OVERRIDE = 'data-sort-value'
        const SORT_BUTTON_CLASS = `${PREFIX}-table__header__button`
        const SORT_BUTTON = `.${SORT_BUTTON_CLASS}`
        const SORTABLE_HEADER = `th[data-sortable]`
        const ANNOUNCEMENT_REGION = `.${PREFIX}-table__announcement-region[aria-live="polite"]`

        /** Gets the data-sort-value attribute value, if provided — otherwise, gets
         * the innerText or textContent — of the child element (HTMLTableCellElement)
         * at the specified index of the given table row
         *
         * @param {number} index
         * @param {array<HTMLTableRowElement>} tr
         * @return {boolean}
         */
        const getCellValue = (tr, index) =>
          tr.children[index].getAttribute(SORT_OVERRIDE) ||
          tr.children[index].innerText ||
          tr.children[index].textContent

        /**
         * Compares the values of two row array items at the given index, then sorts by the given direction
         * @param {number} index
         * @param {string} direction
         * @return {boolean}
         */
        const compareFunction = (index, isAscending) => (thisRow, nextRow) => {
          // get values to compare from data attribute or cell content
          const value1 = getCellValue(isAscending ? thisRow : nextRow, index)
          const value2 = getCellValue(isAscending ? nextRow : thisRow, index)

          // if neither value is empty, and if both values are already numbers, compare numerically
          if (
            value1 &&
            value2 &&
            !Number.isNaN(Number(value1)) &&
            !Number.isNaN(Number(value2))
          ) {
            return value1 - value2
          }
          // Otherwise, compare alphabetically based on current user locale
          return value1.toString().localeCompare(value2, navigator.language, {
            numeric: true,
            ignorePunctuation: true,
          })
        }

        /**
         * Get an Array of column headers elements belonging directly to the given
         * table element.
         * @param {HTMLTableElement} table
         * @return {array<HTMLTableHeaderCellElement>}
         */
        const getColumnHeaders = (table) => {
          const headers = select(SORTABLE_HEADER, table)
          return headers.filter((header) => header.closest(TABLE) === table)
        }

        /**
         * Update the button label within the given header element, resetting it
         * to the default state (ready to sort ascending) if it's no longer sorted
         * @param {HTMLTableHeaderCellElement} header
         */
        const updateSortLabel = (header) => {
          const headerName = header.innerText
          const sortedAscending = header.getAttribute(SORTED) === ASCENDING
          const isSorted =
            header.getAttribute(SORTED) === ASCENDING ||
            header.getAttribute(SORTED) === DESCENDING ||
            false
          const headerLabel = `${headerName}', sortable column, currently ${
            isSorted
              ? `${
                  sortedAscending
                    ? `sorted ${ASCENDING}`
                    : `sorted ${DESCENDING}`
                }`
              : 'unsorted'
          }`
          const headerButtonLabel = `Click to sort by ${headerName} in ${
            sortedAscending ? DESCENDING : ASCENDING
          } order.`
          header.setAttribute('aria-label', headerLabel)
          header
            .querySelector(SORT_BUTTON)
            .setAttribute('title', headerButtonLabel)
        }

        /**
         * Remove the aria-sort attribute on the given header element, and reset the label and button icon
         * @param {HTMLTableHeaderCellElement} header
         */
        const unsetSort = (header) => {
          header.removeAttribute(SORTED)
          updateSortLabel(header)
        }

        /**
         * Sort rows either ascending or descending, based on a given header's aria-sort attribute
         * @param {HTMLTableHeaderCellElement} header
         * @param {boolean} isAscending
         * @return {boolean} true
         */
        const sortRows = (header, isAscending) => {
          header.setAttribute(
            SORTED,
            isAscending === true ? DESCENDING : ASCENDING
          )
          updateSortLabel(header)
          const tbody = header.closest(TABLE).querySelector('tbody')

          // We can use Array.from() and Array.sort() instead once we drop IE11 support, likely in the summer of 2021
          //
          // Array.from(tbody.querySelectorAll('tr').sort(
          //   compareFunction(
          //     Array.from(header.parentNode.children).indexOf(header),
          //     !isAscending)
          //   )
          // .forEach(tr => tbody.appendChild(tr) );

          // [].slice.call() turns array-like sets into true arrays so that we can sort them
          const allRows = [].slice.call(tbody.querySelectorAll('tr'))
          const allHeaders = [].slice.call(header.parentNode.children)
          const thisHeaderIndex = allHeaders.indexOf(header)
          allRows
            .sort(compareFunction(thisHeaderIndex, !isAscending))
            .forEach((tr) => {
              ;[].slice
                .call(tr.children)
                .forEach((td) => td.removeAttribute('data-sort-active'))
              tr.children[thisHeaderIndex].setAttribute(
                'data-sort-active',
                true
              )
              tbody.appendChild(tr)
            })
          return true
        }

        /**
         * Update the live region immediately following the table whenever sort changes.
         * @param {HTMLTableElement} table
         * @param {HTMLTableHeaderCellElement} sortedHeader
         */

        const updateLiveRegion = (table, sortedHeader) => {
          const caption = table.querySelector('caption').innerText
          const sortedAscending =
            sortedHeader.getAttribute(SORTED) === ASCENDING
          const headerLabel = sortedHeader.innerText
          const liveRegion = table.nextElementSibling
          if (liveRegion && liveRegion.matches(ANNOUNCEMENT_REGION)) {
            const sortAnnouncement = `The table named "${caption}" is now sorted by ${headerLabel} in ${
              sortedAscending ? ASCENDING : DESCENDING
            } order.`
            liveRegion.innerText = sortAnnouncement
          } else {
            throw new Error(
              `Table containing a sortable column header is not followed by an aria-live region.`
            )
          }
        }

        /**
         * Toggle a header's sort state, optionally providing a target
         * state.
         *
         * @param {HTMLTableHeaderCellElement} header
         * @param {boolean?} isAscending If no state is provided, the current
         * state will be toggled (from false to true, and vice-versa).
         */
        const toggleSort = (header, isAscending) => {
          const table = header.closest(TABLE)
          let safeAscending = isAscending
          if (typeof safeAscending !== 'boolean') {
            safeAscending = header.getAttribute(SORTED) === ASCENDING
          }
          if (!table) {
            throw new Error(`${SORTABLE_HEADER} is missing outer ${TABLE}`)
          }
          safeAscending = sortRows(header, isAscending)
          if (safeAscending) {
            getColumnHeaders(table).forEach((otherHeader) => {
              if (otherHeader !== header) {
                unsetSort(otherHeader)
              }
            })
            updateLiveRegion(table, header)
          }
        }

        /**
         ** Inserts a button with icon inside a sortable header
         * @param {HTMLTableHeaderCellElement} header
         */

        const createHeaderButton = (header) => {
          const buttonEl = document.createElement('button')
          buttonEl.setAttribute('tabindex', '0')
          buttonEl.classList.add(SORT_BUTTON_CLASS)
          // ICON_SOURCE
          buttonEl.innerHTML = Sanitizer.escapeHTML`
  <svg class="${PREFIX}-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g class="descending" fill="transparent">
      <path d="M17 17L15.59 15.59L12.9999 18.17V2H10.9999V18.17L8.41 15.58L7 17L11.9999 22L17 17Z" />
    </g>
    <g class="ascending" fill="transparent">
      <path transform="rotate(180, 12, 12)" d="M17 17L15.59 15.59L12.9999 18.17V2H10.9999V18.17L8.41 15.58L7 17L11.9999 22L17 17Z" />
    </g>
    <g class="unsorted" fill="transparent">
      <polygon points="15.17 15 13 17.17 13 6.83 15.17 9 16.58 7.59 12 3 7.41 7.59 8.83 9 11 6.83 11 17.17 8.83 15 7.42 16.41 12 21 16.59 16.41 15.17 15"/>
    </g>
  </svg>
  `
          header.appendChild(buttonEl)
          updateSortLabel(header)
        }
        const table = behavior(
          {
            [CLICK]: {
              [SORT_BUTTON](event) {
                event.preventDefault()
                toggleSort(
                  event.target.closest(SORTABLE_HEADER),
                  event.target.closest(SORTABLE_HEADER).getAttribute(SORTED) ===
                    ASCENDING
                )
              },
            },
          },
          {
            init(root) {
              const sortableHeaders = select(SORTABLE_HEADER, root)
              sortableHeaders.forEach((header) => createHeaderButton(header))
              const firstSorted = sortableHeaders.filter(
                (header) =>
                  header.getAttribute(SORTED) === ASCENDING ||
                  header.getAttribute(SORTED) === DESCENDING
              )[0]
              if (typeof firstSorted === 'undefined') {
                // no sortable headers found
                return
              }
              const sortDir = firstSorted.getAttribute(SORTED)
              if (sortDir === ASCENDING) {
                toggleSort(firstSorted, true)
              } else if (sortDir === DESCENDING) {
                toggleSort(firstSorted, false)
              }
            },
            TABLE,
            SORTABLE_HEADER,
            SORT_BUTTON,
          }
        )
        module.exports = table
      },
      {
        '../config': 34,
        '../events': 35,
        '../utils/behavior': 43,
        '../utils/sanitizer': 47,
        '../utils/select': 49,
      },
    ],
    31: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const select = require('../utils/select')
        const { prefix: PREFIX } = require('../config')
        const { COMBO_BOX_CLASS, enhanceComboBox } = require('./combo-box')
        const TIME_PICKER_CLASS = `${PREFIX}-time-picker`
        const TIME_PICKER = `.${TIME_PICKER_CLASS}`
        const MAX_TIME = 60 * 24 - 1
        const MIN_TIME = 0
        const DEFAULT_STEP = 30
        const MIN_STEP = 1
        const FILTER_DATASET = {
          filter:
            '0?{{ hourQueryFilter }}:{{minuteQueryFilter}}.*{{ apQueryFilter }}m?',
          apQueryFilter: '([ap])',
          hourQueryFilter: '([1-9][0-2]?)',
          minuteQueryFilter: '[\\d]+:([0-9]{0,2})',
        }

        /**
         * Parse a string of hh:mm into minutes
         *
         * @param {string} timeStr the time string to parse
         * @returns {number} the number of minutes
         */
        const parseTimeString = (timeStr) => {
          let minutes
          if (timeStr) {
            const [hours, mins] = timeStr.split(':').map((str) => {
              let value
              const parsed = parseInt(str, 10)
              if (!Number.isNaN(parsed)) value = parsed
              return value
            })
            if (hours != null && mins != null) {
              minutes = hours * 60 + mins
            }
          }
          return minutes
        }

        /**
         * Enhance an input with the date picker elements
         *
         * @param {HTMLElement} el The initial wrapping element of the date picker component
         */
        const transformTimePicker = (el) => {
          const timePickerEl = el.closest(TIME_PICKER)
          const initialInputEl = timePickerEl.querySelector(`input`)
          if (!initialInputEl) {
            throw new Error(`${TIME_PICKER} is missing inner input`)
          }
          const selectEl = document.createElement('select')
          ;['id', 'name', 'required', 'aria-label', 'aria-labelledby'].forEach(
            (name) => {
              if (initialInputEl.hasAttribute(name)) {
                const value = initialInputEl.getAttribute(name)
                selectEl.setAttribute(name, value)
                initialInputEl.removeAttribute(name)
              }
            }
          )
          const padZeros = (value, length) => `0000${value}`.slice(-length)
          const getTimeContext = (minutes) => {
            const minute = minutes % 60
            const hour24 = Math.floor(minutes / 60)
            const hour12 = hour24 % 12 || 12
            const ampm = hour24 < 12 ? 'am' : 'pm'
            return {
              minute,
              hour24,
              hour12,
              ampm,
            }
          }
          const minTime = Math.max(
            MIN_TIME,
            parseTimeString(timePickerEl.dataset.minTime) || MIN_TIME
          )
          const maxTime = Math.min(
            MAX_TIME,
            parseTimeString(timePickerEl.dataset.maxTime) || MAX_TIME
          )
          const step = Math.floor(
            Math.max(MIN_STEP, timePickerEl.dataset.step || DEFAULT_STEP)
          )
          let defaultValue
          for (let time = minTime; time <= maxTime; time += step) {
            const { minute, hour24, hour12, ampm } = getTimeContext(time)
            const option = document.createElement('option')
            option.value = `${padZeros(hour24, 2)}:${padZeros(minute, 2)}`
            option.text = `${hour12}:${padZeros(minute, 2)}${ampm}`
            if (option.text === initialInputEl.value) {
              defaultValue = option.value
            }
            selectEl.appendChild(option)
          }
          timePickerEl.classList.add(COMBO_BOX_CLASS)

          // combo box properties
          Object.keys(FILTER_DATASET).forEach((key) => {
            timePickerEl.dataset[key] = FILTER_DATASET[key]
          })
          timePickerEl.dataset.disableFiltering = 'true'
          timePickerEl.dataset.defaultValue = defaultValue
          timePickerEl.appendChild(selectEl)
          initialInputEl.style.display = 'none'
        }
        const timePicker = behavior(
          {},
          {
            init(root) {
              select(TIME_PICKER, root).forEach((timePickerEl) => {
                transformTimePicker(timePickerEl)
                enhanceComboBox(timePickerEl)
              })
            },
            FILTER_DATASET,
          }
        )
        module.exports = timePicker
      },
      {
        '../config': 34,
        '../utils/behavior': 43,
        '../utils/select': 49,
        './combo-box': 18,
      },
    ],
    32: [
      function (require, module, exports) {
        'use strict'

        // Tooltips
        const select = require('../utils/select')
        const behavior = require('../utils/behavior')
        const { prefix: PREFIX } = require('../config')
        const isElementInViewport = require('../utils/is-in-viewport')
        const TOOLTIP = `.${PREFIX}-tooltip`
        const TOOLTIP_TRIGGER_CLASS = `${PREFIX}-tooltip__trigger`
        const TOOLTIP_CLASS = `${PREFIX}-tooltip`
        const TOOLTIP_BODY_CLASS = `${PREFIX}-tooltip__body`
        const SET_CLASS = 'is-set'
        const VISIBLE_CLASS = 'is-visible'
        const TRIANGLE_SIZE = 5
        const ADJUST_WIDTH_CLASS = `${PREFIX}-tooltip__body--wrap`

        /**
         * Add one or more listeners to an element
         * @param {DOMElement} element - DOM element to add listeners to
         * @param {events} eventNames - space separated list of event names, e.g. 'click change'
         * @param {Function} listener - function to attach for each event as a listener
         */
        const addListenerMulti = (element, eventNames, listener) => {
          const events = eventNames.split(' ')
          for (let i = 0, iLen = events.length; i < iLen; i += 1) {
            element.addEventListener(events[i], listener, false)
          }
        }

        /**
         * Shows the tooltip
         * @param {HTMLElement} tooltipTrigger - the element that initializes the tooltip
         */
        const showToolTip = (tooltipBody, tooltipTrigger, position) => {
          tooltipBody.setAttribute('aria-hidden', 'false')

          // This sets up the tooltip body. The opacity is 0, but
          // we can begin running the calculations below.
          tooltipBody.classList.add(SET_CLASS)

          /**
           * Position the tooltip body when the trigger is hovered
           * Removes old positioning classnames and reapplies. This allows
           * positioning to change in case the user resizes browser or DOM manipulation
           * causes tooltip to get clipped from viewport
           *
           * @param {string} setPos - can be "top", "bottom", "right", "left"
           */
          const setPositionClass = (setPos) => {
            tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--top`)
            tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--bottom`)
            tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--right`)
            tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--left`)
            tooltipBody.classList.add(`${TOOLTIP_BODY_CLASS}--${setPos}`)
          }

          /**
           * Removes old positioning styles. This allows
           * re-positioning to change without inheriting other
           * dynamic styles
           *
           * @param {HTMLElement} e - this is the tooltip body
           */
          const resetPositionStyles = (e) => {
            // we don't override anything in the stylesheet when finding alt positions
            e.style.top = null
            e.style.bottom = null
            e.style.right = null
            e.style.left = null
            e.style.margin = null
          }

          /**
           * get margin offset calculations
           *
           * @param {HTMLElement} target - this is the tooltip body
           * @param {String} propertyValue - this is the tooltip body
           */

          const offsetMargin = (target, propertyValue) =>
            parseInt(
              window.getComputedStyle(target).getPropertyValue(propertyValue),
              10
            )

          // offsetLeft = the left position, and margin of the element, the left
          // padding, scrollbar and border of the offsetParent element
          // offsetWidth = The offsetWidth property returns the viewable width of an
          // element in pixels, including padding, border and scrollbar, but not
          // the margin.

          /**
           * Calculate margin offset
           * tooltip trigger margin(position) offset + tooltipBody offsetWidth
           * @param {String} marginPosition
           * @param {Number} tooltipBodyOffset
           * @param {HTMLElement} trigger
           */

          const calculateMarginOffset = (
            marginPosition,
            tooltipBodyOffset,
            trigger
          ) => {
            const offset =
              offsetMargin(trigger, `margin-${marginPosition}`) > 0
                ? tooltipBodyOffset -
                  offsetMargin(trigger, `margin-${marginPosition}`)
                : tooltipBodyOffset
            return offset
          }

          /**
           * Positions tooltip at the top
           * @param {HTMLElement} e - this is the tooltip body
           */
          const positionTop = (e) => {
            resetPositionStyles(e) // ensures we start from the same point
            // get details on the elements object with

            const topMargin = calculateMarginOffset(
              'top',
              e.offsetHeight,
              tooltipTrigger
            )
            const leftMargin = calculateMarginOffset(
              'left',
              e.offsetWidth,
              tooltipTrigger
            )
            setPositionClass('top')
            e.style.left = `50%` // center the element
            e.style.top = `-${TRIANGLE_SIZE}px` // consider the pseudo element
            // apply our margins based on the offset
            e.style.margin = `-${topMargin}px 0 0 -${leftMargin / 2}px`
          }

          /**
           * Positions tooltip at the bottom
           * @param {HTMLElement} e - this is the tooltip body
           */
          const positionBottom = (e) => {
            resetPositionStyles(e)
            const leftMargin = calculateMarginOffset(
              'left',
              e.offsetWidth,
              tooltipTrigger
            )
            setPositionClass('bottom')
            e.style.left = `50%`
            e.style.margin = `${TRIANGLE_SIZE}px 0 0 -${leftMargin / 2}px`
          }

          /**
           * Positions tooltip at the right
           * @param {HTMLElement} e - this is the tooltip body
           */
          const positionRight = (e) => {
            resetPositionStyles(e)
            const topMargin = calculateMarginOffset(
              'top',
              e.offsetHeight,
              tooltipTrigger
            )
            setPositionClass('right')
            e.style.top = `50%`
            e.style.left = `${
              tooltipTrigger.offsetLeft +
              tooltipTrigger.offsetWidth +
              TRIANGLE_SIZE
            }px`
            e.style.margin = `-${topMargin / 2}px 0 0 0`
          }

          /**
           * Positions tooltip at the right
           * @param {HTMLElement} e - this is the tooltip body
           */
          const positionLeft = (e) => {
            resetPositionStyles(e)
            const topMargin = calculateMarginOffset(
              'top',
              e.offsetHeight,
              tooltipTrigger
            )

            // we have to check for some utility margins
            const leftMargin = calculateMarginOffset(
              'left',
              tooltipTrigger.offsetLeft > e.offsetWidth
                ? tooltipTrigger.offsetLeft - e.offsetWidth
                : e.offsetWidth,
              tooltipTrigger
            )
            setPositionClass('left')
            e.style.top = `50%`
            e.style.left = `-${TRIANGLE_SIZE}px`
            e.style.margin = `-${topMargin / 2}px 0 0 ${
              tooltipTrigger.offsetLeft > e.offsetWidth
                ? leftMargin
                : -leftMargin
            }px` // adjust the margin
          }

          /**
           * We try to set the position based on the
           * original intention, but make adjustments
           * if the element is clipped out of the viewport
           * we constrain the width only as a last resort
           * @param {HTMLElement} element(alias tooltipBody)
           * @param {Number} attempt (--flag)
           */

          const maxAttempts = 2
          function findBestPosition(element) {
            let attempt =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : 1
            // create array of optional positions
            const positions = [
              positionTop,
              positionBottom,
              positionRight,
              positionLeft,
            ]
            let hasVisiblePosition = false

            // we take a recursive approach
            function tryPositions(i) {
              if (i < positions.length) {
                const pos = positions[i]
                pos(element)
                if (!isElementInViewport(element)) {
                  // eslint-disable-next-line no-param-reassign
                  tryPositions((i += 1))
                } else {
                  hasVisiblePosition = true
                }
              }
            }
            tryPositions(0)
            // if we can't find a position we compress it and try again
            if (!hasVisiblePosition) {
              element.classList.add(ADJUST_WIDTH_CLASS)
              if (attempt <= maxAttempts) {
                // eslint-disable-next-line no-param-reassign
                findBestPosition(element, (attempt += 1))
              }
            }
          }
          switch (position) {
            case 'top':
              positionTop(tooltipBody)
              if (!isElementInViewport(tooltipBody)) {
                findBestPosition(tooltipBody)
              }
              break
            case 'bottom':
              positionBottom(tooltipBody)
              if (!isElementInViewport(tooltipBody)) {
                findBestPosition(tooltipBody)
              }
              break
            case 'right':
              positionRight(tooltipBody)
              if (!isElementInViewport(tooltipBody)) {
                findBestPosition(tooltipBody)
              }
              break
            case 'left':
              positionLeft(tooltipBody)
              if (!isElementInViewport(tooltipBody)) {
                findBestPosition(tooltipBody)
              }
              break
            default:
              // skip default case
              break
          }

          /**
           * Actually show the tooltip. The VISIBLE_CLASS
           * will change the opacity to 1
           */
          setTimeout(() => {
            tooltipBody.classList.add(VISIBLE_CLASS)
          }, 20)
        }

        /**
         * Removes all the properties to show and position the tooltip,
         * and resets the tooltip position to the original intention
         * in case the window is resized or the element is moved through
         * DOM manipulation.
         * @param {HTMLElement} tooltipBody - The body of the tooltip
         */
        const hideToolTip = (tooltipBody) => {
          tooltipBody.classList.remove(VISIBLE_CLASS)
          tooltipBody.classList.remove(SET_CLASS)
          tooltipBody.classList.remove(ADJUST_WIDTH_CLASS)
          tooltipBody.setAttribute('aria-hidden', 'true')
        }

        /**
         * Setup the tooltip component
         * @param {HTMLElement} tooltipTrigger The element that creates the tooltip
         */
        const setUpAttributes = (tooltipTrigger) => {
          const tooltipID = `tooltip-${
            Math.floor(Math.random() * 900000) + 100000
          }`
          const tooltipContent = tooltipTrigger.getAttribute('title')
          const wrapper = document.createElement('span')
          const tooltipBody = document.createElement('span')
          const position = tooltipTrigger.getAttribute('data-position')
            ? tooltipTrigger.getAttribute('data-position')
            : 'top'
          const additionalClasses = tooltipTrigger.getAttribute('data-classes')

          // Set up tooltip attributes
          tooltipTrigger.setAttribute('aria-describedby', tooltipID)
          tooltipTrigger.setAttribute('tabindex', '0')
          tooltipTrigger.setAttribute('title', '')
          tooltipTrigger.classList.remove(TOOLTIP_CLASS)
          tooltipTrigger.classList.add(TOOLTIP_TRIGGER_CLASS)

          // insert wrapper before el in the DOM tree
          tooltipTrigger.parentNode.insertBefore(wrapper, tooltipTrigger)

          // set up the wrapper
          wrapper.appendChild(tooltipTrigger)
          wrapper.classList.add(TOOLTIP_CLASS)
          wrapper.appendChild(tooltipBody)

          // Apply additional class names to wrapper element
          if (additionalClasses) {
            const classesArray = additionalClasses.split(' ')
            classesArray.forEach((classname) =>
              wrapper.classList.add(classname)
            )
          }

          // set up the tooltip body
          tooltipBody.classList.add(TOOLTIP_BODY_CLASS)
          tooltipBody.setAttribute('id', tooltipID)
          tooltipBody.setAttribute('role', 'tooltip')
          tooltipBody.setAttribute('aria-hidden', 'true')

          // place the text in the tooltip
          tooltipBody.textContent = tooltipContent
          return {
            tooltipBody,
            position,
            tooltipContent,
            wrapper,
          }
        }

        // Setup our function to run on various events
        const tooltip = behavior(
          {},
          {
            init(root) {
              select(TOOLTIP, root).forEach((tooltipTrigger) => {
                const { tooltipBody, position, tooltipContent, wrapper } =
                  setUpAttributes(tooltipTrigger)
                if (tooltipContent) {
                  // Listeners for showing and hiding the tooltip
                  addListenerMulti(tooltipTrigger, 'mouseenter focus', () => {
                    showToolTip(tooltipBody, tooltipTrigger, position, wrapper)
                    return false
                  })

                  // Keydown here prevents tooltips from being read twice by
                  // screen reader. Also allows escape key to close it
                  // (along with any other.)
                  addListenerMulti(
                    tooltipTrigger,
                    'mouseleave blur keydown',
                    () => {
                      hideToolTip(tooltipBody)
                      return false
                    }
                  )
                } else {
                  // throw error or let other tooltips on page function?
                }
              })
            },
          }
        )
        module.exports = tooltip
      },
      {
        '../config': 34,
        '../utils/behavior': 43,
        '../utils/is-in-viewport': 45,
        '../utils/select': 49,
      },
    ],
    33: [
      function (require, module, exports) {
        'use strict'

        const behavior = require('../utils/behavior')
        const validate = require('../utils/validate-input')
        function change() {
          validate(this)
        }
        const validator = behavior({
          'keyup change': {
            'input[data-validation-element]': change,
          },
        })
        module.exports = validator
      },
      { '../utils/behavior': 43, '../utils/validate-input': 53 },
    ],
    34: [
      function (require, module, exports) {
        'use strict'

        module.exports = {
          prefix: 'usa',
        }
      },
      {},
    ],
    35: [
      function (require, module, exports) {
        'use strict'

        module.exports = {
          // This used to be conditionally dependent on whether the
          // browser supported touch events; if it did, `CLICK` was set to
          // `touchstart`.  However, this had downsides:
          //
          // * It pre-empted mobile browsers' default behavior of detecting
          //   whether a touch turned into a scroll, thereby preventing
          //   users from using some of our components as scroll surfaces.
          //
          // * Some devices, such as the Microsoft Surface Pro, support *both*
          //   touch and clicks. This meant the conditional effectively dropped
          //   support for the user's mouse, frustrating users who preferred
          //   it on those systems.
          CLICK: 'click',
        }
      },
      {},
    ],
    36: [
      function (require, module, exports) {
        'use strict'

        /* eslint-disable consistent-return */
        /* eslint-disable func-names */
        ;(function () {
          if (typeof window.CustomEvent === 'function') return false
          function CustomEvent(event, _params) {
            const params = _params || {
              bubbles: false,
              cancelable: false,
              detail: null,
            }
            const evt = document.createEvent('CustomEvent')
            evt.initCustomEvent(
              event,
              params.bubbles,
              params.cancelable,
              params.detail
            )
            return evt
          }
          window.CustomEvent = CustomEvent
        })()
      },
      {},
    ],
    37: [
      function (require, module, exports) {
        'use strict'

        const elproto = window.HTMLElement.prototype
        const HIDDEN = 'hidden'
        if (!(HIDDEN in elproto)) {
          Object.defineProperty(elproto, HIDDEN, {
            get() {
              return this.hasAttribute(HIDDEN)
            },
            set(value) {
              if (value) {
                this.setAttribute(HIDDEN, '')
              } else {
                this.removeAttribute(HIDDEN)
              }
            },
          })
        }
      },
      {},
    ],
    38: [
      function (require, module, exports) {
        'use strict'

        // polyfills HTMLElement.prototype.classList and DOMTokenList
        require('classlist-polyfill')
        // polyfills HTMLElement.prototype.hidden
        require('./element-hidden')
        // polyfills Number.isNaN()
        require('./number-is-nan')
        // polyfills CustomEvent
        require('./custom-event')
        // polyfills svg4everybody
        require('./svg4everybody')
      },
      {
        './custom-event': 36,
        './element-hidden': 37,
        './number-is-nan': 39,
        './svg4everybody': 40,
        'classlist-polyfill': 1,
      },
    ],
    39: [
      function (require, module, exports) {
        'use strict'

        Number.isNaN =
          Number.isNaN ||
          function isNaN(input) {
            // eslint-disable-next-line no-self-compare
            return typeof input === 'number' && input !== input
          }
      },
      {},
    ],
    40: [
      function (require, module, exports) {
        'use strict'

        /* eslint-disable */
        !(function (factory) {
          module.exports = factory()
        })(function () {
          /*! svg4everybody v2.1.9 | github.com/jonathantneal/svg4everybody */
          function embed(parent, svg, target, use) {
            // if the target exists
            if (target) {
              // create a document fragment to hold the contents of the target
              var fragment = document.createDocumentFragment(),
                viewBox =
                  !svg.hasAttribute('viewBox') && target.getAttribute('viewBox')
              // conditionally set the viewBox on the svg
              viewBox && svg.setAttribute('viewBox', viewBox)
              // copy the contents of the clone into the fragment
              for (
                // clone the target
                var clone = document.importNode
                    ? document.importNode(target, !0)
                    : target.cloneNode(!0),
                  g = document.createElementNS(
                    svg.namespaceURI || 'http://www.w3.org/2000/svg',
                    'g'
                  );
                clone.childNodes.length;

              ) {
                g.appendChild(clone.firstChild)
              }
              if (use) {
                for (var i = 0; use.attributes.length > i; i++) {
                  var attr = use.attributes[i]
                  'xlink:href' !== attr.name &&
                    'href' !== attr.name &&
                    g.setAttribute(attr.name, attr.value)
                }
              }
              fragment.appendChild(g),
                // append the fragment into the svg
                parent.appendChild(fragment)
            }
          }
          function loadreadystatechange(xhr, use) {
            // listen to changes in the request
            ;(xhr.onreadystatechange = function () {
              // if the request is ready
              if (4 === xhr.readyState) {
                // get the cached html document
                var cachedDocument = xhr._cachedDocument
                // ensure the cached html document based on the xhr response
                cachedDocument ||
                  ((cachedDocument = xhr._cachedDocument =
                    document.implementation.createHTMLDocument('')),
                  (cachedDocument.body.innerHTML = xhr.responseText),
                  // ensure domains are the same, otherwise we'll have issues appending the
                  // element in IE 11
                  cachedDocument.domain !== document.domain &&
                    (cachedDocument.domain = document.domain),
                  (xhr._cachedTarget = {})),
                  // clear the xhr embeds list and embed each item
                  xhr._embeds.splice(0).map(function (item) {
                    // get the cached target
                    var target = xhr._cachedTarget[item.id]
                    // ensure the cached target
                    target ||
                      (target = xhr._cachedTarget[item.id] =
                        cachedDocument.getElementById(item.id)),
                      // embed the target into the svg
                      embed(item.parent, item.svg, target, use)
                  })
              }
            }),
              // test the ready state change immediately
              xhr.onreadystatechange()
          }
          function svg4everybody(rawopts) {
            function oninterval() {
              // if all <use>s in the array are being bypassed, don't proceed.
              if (
                numberOfSvgUseElementsToBypass &&
                uses.length - numberOfSvgUseElementsToBypass <= 0
              ) {
                return void requestAnimationFrame(oninterval, 67)
              }
              // if there are <use>s to process, proceed.
              // reset the bypass counter, since the counter will be incremented for every bypassed element,
              // even ones that were counted before.
              numberOfSvgUseElementsToBypass = 0
              // while the index exists in the live <use> collection
              for (
                // get the cached <use> index
                var index = 0;
                index < uses.length;

              ) {
                // get the current <use>
                var use = uses[index],
                  parent = use.parentNode,
                  svg = getSVGAncestor(parent),
                  src =
                    use.getAttribute('xlink:href') || use.getAttribute('href')
                if (
                  (!src &&
                    opts.attributeName &&
                    (src = use.getAttribute(opts.attributeName)),
                  svg && src)
                ) {
                  if (polyfill) {
                    if (!opts.validate || opts.validate(src, svg, use)) {
                      // remove the <use> element
                      parent.removeChild(use)
                      // parse the src and get the url and id
                      var srcSplit = src.split('#'),
                        url = srcSplit.shift(),
                        id = srcSplit.join('#')
                      // if the link is external
                      if (url.length) {
                        // get the cached xhr request
                        var xhr = requests[url]
                        // ensure the xhr request exists
                        xhr ||
                          ((xhr = requests[url] = new XMLHttpRequest()),
                          xhr.open('GET', url),
                          xhr.send(),
                          (xhr._embeds = [])),
                          // add the svg and id as an item to the xhr embeds list
                          xhr._embeds.push({
                            parent: parent,
                            svg: svg,
                            id: id,
                          }),
                          // prepare the xhr ready state change event
                          loadreadystatechange(xhr, use)
                      } else {
                        // embed the local id into the svg
                        embed(parent, svg, document.getElementById(id), use)
                      }
                    } else {
                      // increase the index when the previous value was not "valid"
                      ++index, ++numberOfSvgUseElementsToBypass
                    }
                  }
                } else {
                  // increase the index when the previous value was not "valid"
                  ++index
                }
              }
              // continue the interval
              requestAnimationFrame(oninterval, 67)
            }
            var polyfill,
              opts = Object(rawopts),
              newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/,
              webkitUA = /\bAppleWebKit\/(\d+)\b/,
              olderEdgeUA = /\bEdge\/12\.(\d+)\b/,
              edgeUA = /\bEdge\/.(\d+)\b/,
              inIframe = window.top !== window.self
            polyfill =
              'polyfill' in opts
                ? opts.polyfill
                : newerIEUA.test(navigator.userAgent) ||
                  (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 ||
                  (navigator.userAgent.match(webkitUA) || [])[1] < 537 ||
                  (edgeUA.test(navigator.userAgent) && inIframe)
            // create xhr requests object
            var requests = {},
              requestAnimationFrame =
                window.requestAnimationFrame || setTimeout,
              uses = document.getElementsByTagName('use'),
              numberOfSvgUseElementsToBypass = 0
            // conditionally start the interval if the polyfill is active
            polyfill && oninterval()
          }
          function getSVGAncestor(node) {
            for (
              var svg = node;
              'svg' !== svg.nodeName.toLowerCase() && (svg = svg.parentNode);

            ) {}
            return svg
          }
          return svg4everybody
        })
      },
      {},
    ],
    41: [
      function (require, module, exports) {
        'use strict'

        const domready = require('domready')
        window.uswdsPresent = true // GLOBAL variable to indicate that the uswds.js has loaded in the DOM.

        /**
         * The 'polyfills' define key ECMAScript 5 methods that may be missing from
         * older browsers, so must be loaded first.
         */
        require('./polyfills')
        const uswds = require('./config')
        const components = require('./components')
        const svg4everybody = require('./polyfills/svg4everybody')
        uswds.components = components
        domready(() => {
          const target = document.body
          Object.keys(components).forEach((key) => {
            const behavior = components[key]
            behavior.on(target)
          })
          svg4everybody()
        })
        module.exports = uswds
      },
      {
        './components': 23,
        './config': 34,
        './polyfills': 38,
        './polyfills/svg4everybody': 40,
        domready: 2,
      },
    ],
    42: [
      function (require, module, exports) {
        'use strict'

        module.exports = function () {
          let htmlDocument =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : document
          return htmlDocument.activeElement
        }
      },
      {},
    ],
    43: [
      function (require, module, exports) {
        'use strict'

        const assign = require('object-assign')
        const Behavior = require('receptor/behavior')

        /**
         * @name sequence
         * @param {...Function} seq an array of functions
         * @return { closure } callHooks
         */
        // We use a named function here because we want it to inherit its lexical scope
        // from the behavior props object, not from the module
        const sequence = function () {
          for (
            var _len = arguments.length, seq = new Array(_len), _key = 0;
            _key < _len;
            _key++
          ) {
            seq[_key] = arguments[_key]
          }
          return function callHooks() {
            let target =
              arguments.length > 0 && arguments[0] !== undefined
                ? arguments[0]
                : document.body
            seq.forEach((method) => {
              if (typeof this[method] === 'function') {
                this[method].call(this, target)
              }
            })
          }
        }

        /**
         * @name behavior
         * @param {object} events
         * @param {object?} props
         * @return {receptor.behavior}
         */
        module.exports = (events, props) =>
          Behavior(
            events,
            assign(
              {
                on: sequence('init', 'add'),
                off: sequence('teardown', 'remove'),
              },
              props
            )
          )
      },
      { 'object-assign': 5, 'receptor/behavior': 6 },
    ],
    44: [
      function (require, module, exports) {
        'use strict'

        const assign = require('object-assign')
        const { keymap } = require('receptor')
        const behavior = require('./behavior')
        const select = require('./select')
        const activeElement = require('./active-element')
        const FOCUSABLE =
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        const tabHandler = (context) => {
          const focusableElements = select(FOCUSABLE, context)
          const firstTabStop = focusableElements[0]
          const lastTabStop = focusableElements[focusableElements.length - 1]

          // Special rules for when the user is tabbing forward from the last focusable element,
          // or when tabbing backwards from the first focusable element
          function tabAhead(event) {
            if (activeElement() === lastTabStop) {
              event.preventDefault()
              firstTabStop.focus()
            }
          }
          function tabBack(event) {
            if (activeElement() === firstTabStop) {
              event.preventDefault()
              lastTabStop.focus()
            }
            // This checks if you want to set the initial focus to a container
            // instead of an element within, and the user tabs back.
            // Then we set the focus to the first
            else if (!focusableElements.includes(activeElement())) {
              event.preventDefault()
              firstTabStop.focus()
            }
          }
          return {
            firstTabStop,
            lastTabStop,
            tabAhead,
            tabBack,
          }
        }
        module.exports = function (context) {
          let additionalKeyBindings =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {}
          const tabEventHandler = tabHandler(context)
          const bindings = additionalKeyBindings
          const { Esc, Escape } = bindings
          if (Escape && !Esc) bindings.Esc = Escape

          //  TODO: In the future, loop over additional keybindings and pass an array
          // of functions, if necessary, to the map keys. Then people implementing
          // the focus trap could pass callbacks to fire when tabbing
          const keyMappings = keymap(
            assign(
              {
                Tab: tabEventHandler.tabAhead,
                'Shift+Tab': tabEventHandler.tabBack,
              },
              additionalKeyBindings
            )
          )
          const focusTrap = behavior(
            {
              keydown: keyMappings,
            },
            {
              init() {
                // TODO: is this desireable behavior? Should the trap always do this by default or should
                // the component getting decorated handle this?
                if (tabEventHandler.firstTabStop) {
                  tabEventHandler.firstTabStop.focus()
                }
              },
              update(isActive) {
                if (isActive) {
                  this.on()
                } else {
                  this.off()
                }
              },
            }
          )
          return focusTrap
        }
      },
      {
        './active-element': 42,
        './behavior': 43,
        './select': 49,
        'object-assign': 5,
        receptor: 11,
      },
    ],
    45: [
      function (require, module, exports) {
        'use strict'

        // https://stackoverflow.com/a/7557433
        function isElementInViewport(el) {
          let win =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : window
          let docEl =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : document.documentElement
          const rect = el.getBoundingClientRect()
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (win.innerHeight || docEl.clientHeight) &&
            rect.right <= (win.innerWidth || docEl.clientWidth)
          )
        }
        module.exports = isElementInViewport
      },
      {},
    ],
    46: [
      function (require, module, exports) {
        'use strict'

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        function isIosDevice() {
          return (
            typeof navigator !== 'undefined' &&
            (navigator.userAgent.match(/(iPod|iPhone|iPad)/g) ||
              (navigator.platform === 'MacIntel' &&
                navigator.maxTouchPoints > 1)) &&
            !window.MSStream
          )
        }
        module.exports = isIosDevice
      },
      {},
    ],
    47: [
      function (require, module, exports) {
        'use strict'

        /* eslint-disable */
        /* globals define, module */

        /**
         * A simple library to help you escape HTML using template strings.
         *
         * It's the counterpart to our eslint "no-unsafe-innerhtml" plugin that helps us
         * avoid unsafe coding practices.
         * A full write-up of the Hows and Whys are documented
         * for developers at
         *  https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_Automation
         * with additional background information and design docs at
         *  https://wiki.mozilla.org/User:Fbraun/Gaia/SafeinnerHTMLRoadmap
         *
         */

        !(function (factory) {
          module.exports = factory()
        })(function () {
          'use strict'

          var Sanitizer = {
            _entity: /[&<>"'/]/g,
            _entities: {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&apos;',
              '/': '&#x2F;',
            },
            getEntity: function (s) {
              return Sanitizer._entities[s]
            },
            /**
             * Escapes HTML for all values in a tagged template string.
             */
            escapeHTML: function (strings) {
              var result = ''
              for (var i = 0; i < strings.length; i++) {
                result += strings[i]
                if (i + 1 < arguments.length) {
                  var value = arguments[i + 1] || ''
                  result += String(value).replace(
                    Sanitizer._entity,
                    Sanitizer.getEntity
                  )
                }
              }
              return result
            },
            /**
             * Escapes HTML and returns a wrapped object to be used during DOM insertion
             */
            createSafeHTML: function (strings) {
              var _len = arguments.length
              var values = new Array(_len > 1 ? _len - 1 : 0)
              for (var _key = 1; _key < _len; _key++) {
                values[_key - 1] = arguments[_key]
              }
              var escaped = Sanitizer.escapeHTML.apply(
                Sanitizer,
                [strings].concat(values)
              )
              return {
                __html: escaped,
                toString: function () {
                  return '[object WrappedHTMLObject]'
                },
                info:
                  'This is a wrapped HTML object. See https://developer.mozilla.or' +
                  'g/en-US/Firefox_OS/Security/Security_Automation for more.',
              }
            },
            /**
             * Unwrap safe HTML created by createSafeHTML or a custom replacement that
             * underwent security review.
             */
            unwrapSafeHTML: function () {
              var _len = arguments.length
              var htmlObjects = new Array(_len)
              for (var _key = 0; _key < _len; _key++) {
                htmlObjects[_key] = arguments[_key]
              }
              var markupList = htmlObjects.map(function (obj) {
                return obj.__html
              })
              return markupList.join('')
            },
          }
          return Sanitizer
        })
      },
      {},
    ],
    48: [
      function (require, module, exports) {
        'use strict'

        module.exports = function getScrollbarWidth() {
          // Creating invisible container
          const outer = document.createElement('div')
          outer.style.visibility = 'hidden'
          outer.style.overflow = 'scroll' // forcing scrollbar to appear
          outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
          document.body.appendChild(outer)

          // Creating inner element and placing it in the container
          const inner = document.createElement('div')
          outer.appendChild(inner)

          // Calculating difference between container's full width and the child width
          const scrollbarWidth = `${outer.offsetWidth - inner.offsetWidth}px`

          // Removing temporary elements from the DOM
          outer.parentNode.removeChild(outer)
          return scrollbarWidth
        }
      },
      {},
    ],
    49: [
      function (require, module, exports) {
        'use strict'

        /**
         * @name isElement
         * @desc returns whether or not the given argument is a DOM element.
         * @param {any} value
         * @return {boolean}
         */
        const isElement = (value) =>
          value && typeof value === 'object' && value.nodeType === 1

        /**
         * @name select
         * @desc selects elements from the DOM by class selector or ID selector.
         * @param {string} selector - The selector to traverse the DOM with.
         * @param {Document|HTMLElement?} context - The context to traverse the DOM
         *   in. If not provided, it defaults to the document.
         * @return {HTMLElement[]} - An array of DOM nodes or an empty array.
         */
        module.exports = (selector, context) => {
          if (typeof selector !== 'string') {
            return []
          }
          if (!context || !isElement(context)) {
            context = window.document // eslint-disable-line no-param-reassign
          }

          const selection = context.querySelectorAll(selector)
          return Array.prototype.slice.call(selection)
        }
      },
      {},
    ],
    50: [
      function (require, module, exports) {
        'use strict'

        /**
         * Flips given INPUT elements between masked (hiding the field value) and unmasked
         * @param {Array.HTMLElement} fields - An array of INPUT elements
         * @param {Boolean} mask - Whether the mask should be applied, hiding the field value
         */
        module.exports = (field, mask) => {
          field.setAttribute('autocapitalize', 'off')
          field.setAttribute('autocorrect', 'off')
          field.setAttribute('type', mask ? 'password' : 'text')
        }
      },
      {},
    ],
    51: [
      function (require, module, exports) {
        'use strict'

        const resolveIdRefs = require('resolve-id-refs')
        const toggleFieldMask = require('./toggle-field-mask')
        const CONTROLS = 'aria-controls'
        const PRESSED = 'aria-pressed'
        const SHOW_ATTR = 'data-show-text'
        const HIDE_ATTR = 'data-hide-text'

        /**
         * Replace the word "Show" (or "show") with "Hide" (or "hide") in a string.
         * @param {string} showText
         * @return {strong} hideText
         */
        const getHideText = (showText) =>
          showText.replace(
            /\bShow\b/i,
            (show) => `${show[0] === 'S' ? 'H' : 'h'}ide`
          )

        /**
         * Component that decorates an HTML element with the ability to toggle the
         * masked state of an input field (like a password) when clicked.
         * The ids of the fields to be masked will be pulled directly from the button's
         * `aria-controls` attribute.
         *
         * @param  {HTMLElement} el    Parent element containing the fields to be masked
         * @return {boolean}
         */
        module.exports = (el) => {
          // this is the *target* state:
          // * if the element has the attr and it's !== "true", pressed is true
          // * otherwise, pressed is false
          const pressed =
            el.hasAttribute(PRESSED) && el.getAttribute(PRESSED) !== 'true'
          const fields = resolveIdRefs(el.getAttribute(CONTROLS))
          fields.forEach((field) => toggleFieldMask(field, pressed))
          if (!el.hasAttribute(SHOW_ATTR)) {
            el.setAttribute(SHOW_ATTR, el.textContent)
          }
          const showText = el.getAttribute(SHOW_ATTR)
          const hideText = el.getAttribute(HIDE_ATTR) || getHideText(showText)
          el.textContent = pressed ? showText : hideText // eslint-disable-line no-param-reassign
          el.setAttribute(PRESSED, pressed)
          return pressed
        }
      },
      { './toggle-field-mask': 50, 'resolve-id-refs': 14 },
    ],
    52: [
      function (require, module, exports) {
        'use strict'

        const EXPANDED = 'aria-expanded'
        const CONTROLS = 'aria-controls'
        const HIDDEN = 'hidden'
        module.exports = (button, expanded) => {
          let safeExpanded = expanded
          if (typeof safeExpanded !== 'boolean') {
            safeExpanded = button.getAttribute(EXPANDED) === 'false'
          }
          button.setAttribute(EXPANDED, safeExpanded)
          const id = button.getAttribute(CONTROLS)
          const controls = document.getElementById(id)
          if (!controls) {
            throw new Error(`No toggle target found with id: "${id}"`)
          }
          if (safeExpanded) {
            controls.removeAttribute(HIDDEN)
          } else {
            controls.setAttribute(HIDDEN, '')
          }
          return safeExpanded
        }
      },
      {},
    ],
    53: [
      function (require, module, exports) {
        'use strict'

        const { prefix: PREFIX } = require('../config')
        const CHECKED = 'aria-checked'
        const CHECKED_CLASS = `${PREFIX}-checklist__item--checked`
        module.exports = function validate(el) {
          const id = el.dataset.validationElement
          const checkList =
            id.charAt(0) === '#'
              ? document.querySelector(id)
              : document.getElementById(id)
          if (!checkList) {
            throw new Error(`No validation element found with id: "${id}"`)
          }
          Object.entries(el.dataset).forEach((_ref) => {
            let [key, value] = _ref
            if (key.startsWith('validate')) {
              const validatorName = key.substr('validate'.length).toLowerCase()
              const validatorPattern = new RegExp(value)
              const validatorSelector = `[data-validator="${validatorName}"]`
              const validatorCheckbox =
                checkList.querySelector(validatorSelector)
              if (!validatorCheckbox) {
                throw new Error(
                  `No validator checkbox found for: "${validatorName}"`
                )
              }
              const checked = validatorPattern.test(el.value)
              validatorCheckbox.classList.toggle(CHECKED_CLASS, checked)
              validatorCheckbox.setAttribute(CHECKED, checked)
            }
          })
        }
      },
      { '../config': 34 },
    ],
  },
  {},
  [41]
)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xhc3NsaXN0LXBvbHlmaWxsL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kb21yZWFkeS9yZWFkeS5qcyIsIm5vZGVfbW9kdWxlcy9lbGVtZW50LWNsb3Nlc3QvZWxlbWVudC1jbG9zZXN0LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkZXZlbnQta2V5LXBvbHlmaWxsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3IvYmVoYXZpb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3IvY29tcG9zZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWNlcHRvci9kZWxlZ2F0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWNlcHRvci9kZWxlZ2F0ZUFsbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWNlcHRvci9pZ25vcmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3Iva2V5bWFwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlY2VwdG9yL29uY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVzb2x2ZS1pZC1yZWZzL2luZGV4LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvYWNjb3JkaW9uLmpzIiwic3JjL2pzL2NvbXBvbmVudHMvYmFubmVyLmpzIiwic3JjL2pzL2NvbXBvbmVudHMvY2hhcmFjdGVyLWNvdW50LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvY29tYm8tYm94LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIuanMiLCJzcmMvanMvY29tcG9uZW50cy9kYXRlLXJhbmdlLXBpY2tlci5qcyIsInNyYy9qcy9jb21wb25lbnRzL2ZpbGUtaW5wdXQuanMiLCJzcmMvanMvY29tcG9uZW50cy9mb290ZXIuanMiLCJzcmMvanMvY29tcG9uZW50cy9pbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnRzL2lucHV0LXByZWZpeC1zdWZmaXguanMiLCJzcmMvanMvY29tcG9uZW50cy9tb2RhbC5qcyIsInNyYy9qcy9jb21wb25lbnRzL25hdmlnYXRpb24uanMiLCJzcmMvanMvY29tcG9uZW50cy9wYXNzd29yZC5qcyIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC5qcyIsInNyYy9qcy9jb21wb25lbnRzL3NraXBuYXYuanMiLCJzcmMvanMvY29tcG9uZW50cy90YWJsZS5qcyIsInNyYy9qcy9jb21wb25lbnRzL3RpbWUtcGlja2VyLmpzIiwic3JjL2pzL2NvbXBvbmVudHMvdG9vbHRpcC5qcyIsInNyYy9qcy9jb21wb25lbnRzL3ZhbGlkYXRvci5qcyIsInNyYy9qcy9jb25maWcuanMiLCJzcmMvanMvZXZlbnRzLmpzIiwic3JjL2pzL3BvbHlmaWxscy9jdXN0b20tZXZlbnQuanMiLCJzcmMvanMvcG9seWZpbGxzL2VsZW1lbnQtaGlkZGVuLmpzIiwic3JjL2pzL3BvbHlmaWxscy9pbmRleC5qcyIsInNyYy9qcy9wb2x5ZmlsbHMvbnVtYmVyLWlzLW5hbi5qcyIsInNyYy9qcy9wb2x5ZmlsbHMvc3ZnNGV2ZXJ5Ym9keS5qcyIsInNyYy9qcy9zdGFydC5qcyIsInNyYy9qcy91dGlscy9hY3RpdmUtZWxlbWVudC5qcyIsInNyYy9qcy91dGlscy9iZWhhdmlvci5qcyIsInNyYy9qcy91dGlscy9mb2N1cy10cmFwLmpzIiwic3JjL2pzL3V0aWxzL2lzLWluLXZpZXdwb3J0LmpzIiwic3JjL2pzL3V0aWxzL2lzLWlvcy1kZXZpY2UuanMiLCJzcmMvanMvdXRpbHMvc2FuaXRpemVyLmpzIiwic3JjL2pzL3V0aWxzL3Njcm9sbGJhci13aWR0aC5qcyIsInNyYy9qcy91dGlscy9zZWxlY3QuanMiLCJzcmMvanMvdXRpbHMvdG9nZ2xlLWZpZWxkLW1hc2suanMiLCJzcmMvanMvdXRpbHMvdG9nZ2xlLWZvcm0taW5wdXQuanMiLCJzcmMvanMvdXRpbHMvdG9nZ2xlLmpzIiwic3JjL2pzL3V0aWxzL3ZhbGlkYXRlLWlucHV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLElBQUksVUFBVSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7RUFFL0I7RUFDQTtFQUNBLElBQUksRUFBRSxXQUFXLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUM3QyxRQUFRLENBQUMsZUFBZSxJQUFJLEVBQUUsV0FBVyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUU3RyxXQUFVLElBQUksRUFBRTtNQUVqQixZQUFZOztNQUVaLElBQUksRUFBRSxTQUFTLElBQUksSUFBSSxDQUFDLEVBQUU7TUFFMUIsSUFDRyxhQUFhLEdBQUcsV0FBVztRQUMzQixTQUFTLEdBQUcsV0FBVztRQUN2QixZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDdEMsTUFBTSxHQUFHLE1BQU07UUFDZixPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksSUFBSSxZQUFZO1VBQ2pELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFDQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLElBQUksRUFBRTtVQUMxRCxJQUNHLENBQUMsR0FBRyxDQUFDO1lBQ0wsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNO1VBRXBCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQixJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtj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O0VBQzNCLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQy9ELE9BQU8sT0FBTztBQUNoQixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxLQUFLO0VBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztFQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7RUFDNUMsT0FBTyxPQUFPO0FBQ2hCLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLE9BQU8sR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLEtBQUssT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQzs7QUFFNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLEtBQUssT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDOztBQUVsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDOztBQUVoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLFdBQVcsR0FBSSxLQUFLLElBQUs7RUFDN0IsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtFQUNoQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDO0FBQ2xDLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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TSxJQUFJLEtBQUssQ0FBRSxxQ0FBb0MsYUFBYyxHQUFFLENBQUM7TUFDeEU7TUFFQSxNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztNQUMvQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUM7TUFDMUQsaUJBQWlCLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7SUFDbEQ7RUFDRixDQUFDLENBQUM7QUFDSixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcbiAqIGNsYXNzTGlzdC5qczogQ3Jvc3MtYnJvd3NlciBmdWxsIGVsZW1lbnQuY2xhc3NMaXN0IGltcGxlbWVudGF0aW9uLlxuICogMS4xLjIwMTcwNDI3XG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogTGljZW5zZTogRGVkaWNhdGVkIHRvIHRoZSBwdWJsaWMgZG9tYWluLlxuICogICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VsaWdyZXkvY2xhc3NMaXN0LmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiAqL1xuXG4vKmdsb2JhbCBzZWxmLCBkb2N1bWVudCwgRE9NRXhjZXB0aW9uICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9jbGFzc0xpc3QuanMvYmxvYi9tYXN0ZXIvY2xhc3NMaXN0LmpzICovXG5cbmlmIChcImRvY3VtZW50XCIgaW4gd2luZG93LnNlbGYpIHtcblxuLy8gRnVsbCBwb2x5ZmlsbCBmb3IgYnJvd3NlcnMgd2l0aCBubyBjbGFzc0xpc3Qgc3VwcG9ydFxuLy8gSW5jbHVkaW5nIElFIDwgRWRnZSBtaXNzaW5nIFNWR0VsZW1lbnQuY2xhc3NMaXN0XG5pZiAoIShcImNsYXNzTGlzdFwiIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJfXCIpKSBcblx0fHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICYmICEoXCJjbGFzc0xpc3RcIiBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFwiZ1wiKSkpIHtcblxuKGZ1bmN0aW9uICh2aWV3KSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5pZiAoISgnRWxlbWVudCcgaW4gdmlldykpIHJldHVybjtcblxudmFyXG5cdCAgY2xhc3NMaXN0UHJvcCA9IFwiY2xhc3NMaXN0XCJcblx0LCBwcm90b1Byb3AgPSBcInByb3RvdHlwZVwiXG5cdCwgZWxlbUN0clByb3RvID0gdmlldy5FbGVtZW50W3Byb3RvUHJvcF1cblx0LCBvYmpDdHIgPSBPYmplY3Rcblx0LCBzdHJUcmltID0gU3RyaW5nW3Byb3RvUHJvcF0udHJpbSB8fCBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIik7XG5cdH1cblx0LCBhcnJJbmRleE9mID0gQXJyYXlbcHJvdG9Qcm9wXS5pbmRleE9mIHx8IGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0dmFyXG5cdFx0XHQgIGkgPSAwXG5cdFx0XHQsIGxlbiA9IHRoaXMubGVuZ3RoXG5cdFx0O1xuXHRcdGZvciAoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkge1xuXHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cdC8vIFZlbmRvcnM6IHBsZWFzZSBhbGxvdyBjb250ZW50IGNvZGUgdG8gaW5zdGFudGlhdGUgRE9NRXhjZXB0aW9uc1xuXHQsIERPTUV4ID0gZnVuY3Rpb24gKHR5cGUsIG1lc3NhZ2UpIHtcblx0XHR0aGlzLm5hbWUgPSB0eXBlO1xuXHRcdHRoaXMuY29kZSA9IERPTUV4Y2VwdGlvblt0eXBlXTtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9XG5cdCwgY2hlY2tUb2tlbkFuZEdldEluZGV4ID0gZnVuY3Rpb24gKGNsYXNzTGlzdCwgdG9rZW4pIHtcblx0XHRpZiAodG9rZW4gPT09IFwiXCIpIHtcblx0XHRcdHRocm93IG5ldyBET01FeChcblx0XHRcdFx0ICBcIlNZTlRBWF9FUlJcIlxuXHRcdFx0XHQsIFwiQW4gaW52YWxpZCBvciBpbGxlZ2FsIHN0cmluZyB3YXMgc3BlY2lmaWVkXCJcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmICgvXFxzLy50ZXN0KHRva2VuKSkge1xuXHRcdFx0dGhyb3cgbmV3IERPTUV4KFxuXHRcdFx0XHQgIFwiSU5WQUxJRF9DSEFSQUNURVJfRVJSXCJcblx0XHRcdFx0LCBcIlN0cmluZyBjb250YWlucyBhbiBpbnZhbGlkIGNoYXJhY3RlclwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gYXJySW5kZXhPZi5jYWxsKGNsYXNzTGlzdCwgdG9rZW4pO1xuXHR9XG5cdCwgQ2xhc3NMaXN0ID0gZnVuY3Rpb24gKGVsZW0pIHtcblx0XHR2YXJcblx0XHRcdCAgdHJpbW1lZENsYXNzZXMgPSBzdHJUcmltLmNhbGwoZWxlbS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiKVxuXHRcdFx0LCBjbGFzc2VzID0gdHJpbW1lZENsYXNzZXMgPyB0cmltbWVkQ2xhc3Nlcy5zcGxpdCgvXFxzKy8pIDogW11cblx0XHRcdCwgaSA9IDBcblx0XHRcdCwgbGVuID0gY2xhc3Nlcy5sZW5ndGhcblx0XHQ7XG5cdFx0Zm9yICg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dGhpcy5wdXNoKGNsYXNzZXNbaV0pO1xuXHRcdH1cblx0XHR0aGlzLl91cGRhdGVDbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRlbGVtLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMudG9TdHJpbmcoKSk7XG5cdFx0fTtcblx0fVxuXHQsIGNsYXNzTGlzdFByb3RvID0gQ2xhc3NMaXN0W3Byb3RvUHJvcF0gPSBbXVxuXHQsIGNsYXNzTGlzdEdldHRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gbmV3IENsYXNzTGlzdCh0aGlzKTtcblx0fVxuO1xuLy8gTW9zdCBET01FeGNlcHRpb24gaW1wbGVtZW50YXRpb25zIGRvbid0IGFsbG93IGNhbGxpbmcgRE9NRXhjZXB0aW9uJ3MgdG9TdHJpbmcoKVxuLy8gb24gbm9uLURPTUV4Y2VwdGlvbnMuIEVycm9yJ3MgdG9TdHJpbmcoKSBpcyBzdWZmaWNpZW50IGhlcmUuXG5ET01FeFtwcm90b1Byb3BdID0gRXJyb3JbcHJvdG9Qcm9wXTtcbmNsYXNzTGlzdFByb3RvLml0ZW0gPSBmdW5jdGlvbiAoaSkge1xuXHRyZXR1cm4gdGhpc1tpXSB8fCBudWxsO1xufTtcbmNsYXNzTGlzdFByb3RvLmNvbnRhaW5zID0gZnVuY3Rpb24gKHRva2VuKSB7XG5cdHRva2VuICs9IFwiXCI7XG5cdHJldHVybiBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pICE9PSAtMTtcbn07XG5jbGFzc0xpc3RQcm90by5hZGQgPSBmdW5jdGlvbiAoKSB7XG5cdHZhclxuXHRcdCAgdG9rZW5zID0gYXJndW1lbnRzXG5cdFx0LCBpID0gMFxuXHRcdCwgbCA9IHRva2Vucy5sZW5ndGhcblx0XHQsIHRva2VuXG5cdFx0LCB1cGRhdGVkID0gZmFsc2Vcblx0O1xuXHRkbyB7XG5cdFx0dG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuXHRcdGlmIChjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pID09PSAtMSkge1xuXHRcdFx0dGhpcy5wdXNoKHRva2VuKTtcblx0XHRcdHVwZGF0ZWQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXHR3aGlsZSAoKytpIDwgbCk7XG5cblx0aWYgKHVwZGF0ZWQpIHtcblx0XHR0aGlzLl91cGRhdGVDbGFzc05hbWUoKTtcblx0fVxufTtcbmNsYXNzTGlzdFByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyXG5cdFx0ICB0b2tlbnMgPSBhcmd1bWVudHNcblx0XHQsIGkgPSAwXG5cdFx0LCBsID0gdG9rZW5zLmxlbmd0aFxuXHRcdCwgdG9rZW5cblx0XHQsIHVwZGF0ZWQgPSBmYWxzZVxuXHRcdCwgaW5kZXhcblx0O1xuXHRkbyB7XG5cdFx0dG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuXHRcdGluZGV4ID0gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKTtcblx0XHR3aGlsZSAoaW5kZXggIT09IC0xKSB7XG5cdFx0XHR0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHR1cGRhdGVkID0gdHJ1ZTtcblx0XHRcdGluZGV4ID0gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKTtcblx0XHR9XG5cdH1cblx0d2hpbGUgKCsraSA8IGwpO1xuXG5cdGlmICh1cGRhdGVkKSB7XG5cdFx0dGhpcy5fdXBkYXRlQ2xhc3NOYW1lKCk7XG5cdH1cbn07XG5jbGFzc0xpc3RQcm90by50b2dnbGUgPSBmdW5jdGlvbiAodG9rZW4sIGZvcmNlKSB7XG5cdHRva2VuICs9IFwiXCI7XG5cblx0dmFyXG5cdFx0ICByZXN1bHQgPSB0aGlzLmNvbnRhaW5zKHRva2VuKVxuXHRcdCwgbWV0aG9kID0gcmVzdWx0ID9cblx0XHRcdGZvcmNlICE9PSB0cnVlICYmIFwicmVtb3ZlXCJcblx0XHQ6XG5cdFx0XHRmb3JjZSAhPT0gZmFsc2UgJiYgXCJhZGRcIlxuXHQ7XG5cblx0aWYgKG1ldGhvZCkge1xuXHRcdHRoaXNbbWV0aG9kXSh0b2tlbik7XG5cdH1cblxuXHRpZiAoZm9yY2UgPT09IHRydWUgfHwgZm9yY2UgPT09IGZhbHNlKSB7XG5cdFx0cmV0dXJuIGZvcmNlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiAhcmVzdWx0O1xuXHR9XG59O1xuY2xhc3NMaXN0UHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLmpvaW4oXCIgXCIpO1xufTtcblxuaWYgKG9iakN0ci5kZWZpbmVQcm9wZXJ0eSkge1xuXHR2YXIgY2xhc3NMaXN0UHJvcERlc2MgPSB7XG5cdFx0ICBnZXQ6IGNsYXNzTGlzdEdldHRlclxuXHRcdCwgZW51bWVyYWJsZTogdHJ1ZVxuXHRcdCwgY29uZmlndXJhYmxlOiB0cnVlXG5cdH07XG5cdHRyeSB7XG5cdFx0b2JqQ3RyLmRlZmluZVByb3BlcnR5KGVsZW1DdHJQcm90bywgY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0UHJvcERlc2MpO1xuXHR9IGNhdGNoIChleCkgeyAvLyBJRSA4IGRvZXNuJ3Qgc3VwcG9ydCBlbnVtZXJhYmxlOnRydWVcblx0XHQvLyBhZGRpbmcgdW5kZWZpbmVkIHRvIGZpZ2h0IHRoaXMgaXNzdWUgaHR0cHM6Ly9naXRodWIuY29tL2VsaWdyZXkvY2xhc3NMaXN0LmpzL2lzc3Vlcy8zNlxuXHRcdC8vIG1vZGVybmllIElFOC1NU1c3IG1hY2hpbmUgaGFzIElFOCA4LjAuNjAwMS4xODcwMiBhbmQgaXMgYWZmZWN0ZWRcblx0XHRpZiAoZXgubnVtYmVyID09PSB1bmRlZmluZWQgfHwgZXgubnVtYmVyID09PSAtMHg3RkY1RUM1NCkge1xuXHRcdFx0Y2xhc3NMaXN0UHJvcERlc2MuZW51bWVyYWJsZSA9IGZhbHNlO1xuXHRcdFx0b2JqQ3RyLmRlZmluZVByb3BlcnR5KGVsZW1DdHJQcm90bywgY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0UHJvcERlc2MpO1xuXHRcdH1cblx0fVxufSBlbHNlIGlmIChvYmpDdHJbcHJvdG9Qcm9wXS5fX2RlZmluZUdldHRlcl9fKSB7XG5cdGVsZW1DdHJQcm90by5fX2RlZmluZUdldHRlcl9fKGNsYXNzTGlzdFByb3AsIGNsYXNzTGlzdEdldHRlcik7XG59XG5cbn0od2luZG93LnNlbGYpKTtcblxufVxuXG4vLyBUaGVyZSBpcyBmdWxsIG9yIHBhcnRpYWwgbmF0aXZlIGNsYXNzTGlzdCBzdXBwb3J0LCBzbyBqdXN0IGNoZWNrIGlmIHdlIG5lZWRcbi8vIHRvIG5vcm1hbGl6ZSB0aGUgYWRkL3JlbW92ZSBhbmQgdG9nZ2xlIEFQSXMuXG5cbihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciB0ZXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJfXCIpO1xuXG5cdHRlc3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjMVwiLCBcImMyXCIpO1xuXG5cdC8vIFBvbHlmaWxsIGZvciBJRSAxMC8xMSBhbmQgRmlyZWZveCA8MjYsIHdoZXJlIGNsYXNzTGlzdC5hZGQgYW5kXG5cdC8vIGNsYXNzTGlzdC5yZW1vdmUgZXhpc3QgYnV0IHN1cHBvcnQgb25seSBvbmUgYXJndW1lbnQgYXQgYSB0aW1lLlxuXHRpZiAoIXRlc3RFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImMyXCIpKSB7XG5cdFx0dmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuXHRcdFx0dmFyIG9yaWdpbmFsID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZVttZXRob2RdO1xuXG5cdFx0XHRET01Ub2tlbkxpc3QucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih0b2tlbikge1xuXHRcdFx0XHR2YXIgaSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcblxuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdFx0XHR0b2tlbiA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdFx0XHRvcmlnaW5hbC5jYWxsKHRoaXMsIHRva2VuKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9O1xuXHRcdGNyZWF0ZU1ldGhvZCgnYWRkJyk7XG5cdFx0Y3JlYXRlTWV0aG9kKCdyZW1vdmUnKTtcblx0fVxuXG5cdHRlc3RFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJjM1wiLCBmYWxzZSk7XG5cblx0Ly8gUG9seWZpbGwgZm9yIElFIDEwIGFuZCBGaXJlZm94IDwyNCwgd2hlcmUgY2xhc3NMaXN0LnRvZ2dsZSBkb2VzIG5vdFxuXHQvLyBzdXBwb3J0IHRoZSBzZWNvbmQgYXJndW1lbnQuXG5cdGlmICh0ZXN0RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJjM1wiKSkge1xuXHRcdHZhciBfdG9nZ2xlID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGU7XG5cblx0XHRET01Ub2tlbkxpc3QucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKHRva2VuLCBmb3JjZSkge1xuXHRcdFx0aWYgKDEgaW4gYXJndW1lbnRzICYmICF0aGlzLmNvbnRhaW5zKHRva2VuKSA9PT0gIWZvcmNlKSB7XG5cdFx0XHRcdHJldHVybiBmb3JjZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBfdG9nZ2xlLmNhbGwodGhpcywgdG9rZW4pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0fVxuXG5cdHRlc3RFbGVtZW50ID0gbnVsbDtcbn0oKSk7XG5cbn1cbiIsIi8qIVxuICAqIGRvbXJlYWR5IChjKSBEdXN0aW4gRGlheiAyMDE0IC0gTGljZW5zZSBNSVRcbiAgKi9cbiFmdW5jdGlvbiAobmFtZSwgZGVmaW5pdGlvbikge1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcpIGRlZmluZShkZWZpbml0aW9uKVxuICBlbHNlIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKClcblxufSgnZG9tcmVhZHknLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGZucyA9IFtdLCBsaXN0ZW5lclxuICAgICwgZG9jID0gZG9jdW1lbnRcbiAgICAsIGhhY2sgPSBkb2MuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsXG4gICAgLCBkb21Db250ZW50TG9hZGVkID0gJ0RPTUNvbnRlbnRMb2FkZWQnXG4gICAgLCBsb2FkZWQgPSAoaGFjayA/IC9ebG9hZGVkfF5jLyA6IC9ebG9hZGVkfF5pfF5jLykudGVzdChkb2MucmVhZHlTdGF0ZSlcblxuXG4gIGlmICghbG9hZGVkKVxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihkb21Db250ZW50TG9hZGVkLCBsaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihkb21Db250ZW50TG9hZGVkLCBsaXN0ZW5lcilcbiAgICBsb2FkZWQgPSAxXG4gICAgd2hpbGUgKGxpc3RlbmVyID0gZm5zLnNoaWZ0KCkpIGxpc3RlbmVyKClcbiAgfSlcblxuICByZXR1cm4gZnVuY3Rpb24gKGZuKSB7XG4gICAgbG9hZGVkID8gc2V0VGltZW91dChmbiwgMCkgOiBmbnMucHVzaChmbilcbiAgfVxuXG59KTtcbiIsIi8vIGVsZW1lbnQtY2xvc2VzdCB8IENDMC0xLjAgfCBnaXRodWIuY29tL2pvbmF0aGFudG5lYWwvY2xvc2VzdFxuXG4oZnVuY3Rpb24gKEVsZW1lbnRQcm90bykge1xuXHRpZiAodHlwZW9mIEVsZW1lbnRQcm90by5tYXRjaGVzICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0RWxlbWVudFByb3RvLm1hdGNoZXMgPSBFbGVtZW50UHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudFByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50UHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IGZ1bmN0aW9uIG1hdGNoZXMoc2VsZWN0b3IpIHtcblx0XHRcdHZhciBlbGVtZW50ID0gdGhpcztcblx0XHRcdHZhciBlbGVtZW50cyA9IChlbGVtZW50LmRvY3VtZW50IHx8IGVsZW1lbnQub3duZXJEb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cdFx0XHR2YXIgaW5kZXggPSAwO1xuXG5cdFx0XHR3aGlsZSAoZWxlbWVudHNbaW5kZXhdICYmIGVsZW1lbnRzW2luZGV4XSAhPT0gZWxlbWVudCkge1xuXHRcdFx0XHQrK2luZGV4O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gQm9vbGVhbihlbGVtZW50c1tpbmRleF0pO1xuXHRcdH07XG5cdH1cblxuXHRpZiAodHlwZW9mIEVsZW1lbnRQcm90by5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0RWxlbWVudFByb3RvLmNsb3Nlc3QgPSBmdW5jdGlvbiBjbG9zZXN0KHNlbGVjdG9yKSB7XG5cdFx0XHR2YXIgZWxlbWVudCA9IHRoaXM7XG5cblx0XHRcdHdoaWxlIChlbGVtZW50ICYmIGVsZW1lbnQubm9kZVR5cGUgPT09IDEpIHtcblx0XHRcdFx0aWYgKGVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpIHtcblx0XHRcdFx0XHRyZXR1cm4gZWxlbWVudDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cbn0pKHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZSk7XG4iLCIvKiBnbG9iYWwgZGVmaW5lLCBLZXlib2FyZEV2ZW50LCBtb2R1bGUgKi9cblxuKGZ1bmN0aW9uICgpIHtcblxuICB2YXIga2V5Ym9hcmRldmVudEtleVBvbHlmaWxsID0ge1xuICAgIHBvbHlmaWxsOiBwb2x5ZmlsbCxcbiAgICBrZXlzOiB7XG4gICAgICAzOiAnQ2FuY2VsJyxcbiAgICAgIDY6ICdIZWxwJyxcbiAgICAgIDg6ICdCYWNrc3BhY2UnLFxuICAgICAgOTogJ1RhYicsXG4gICAgICAxMjogJ0NsZWFyJyxcbiAgICAgIDEzOiAnRW50ZXInLFxuICAgICAgMTY6ICdTaGlmdCcsXG4gICAgICAxNzogJ0NvbnRyb2wnLFxuICAgICAgMTg6ICdBbHQnLFxuICAgICAgMTk6ICdQYXVzZScsXG4gICAgICAyMDogJ0NhcHNMb2NrJyxcbiAgICAgIDI3OiAnRXNjYXBlJyxcbiAgICAgIDI4OiAnQ29udmVydCcsXG4gICAgICAyOTogJ05vbkNvbnZlcnQnLFxuICAgICAgMzA6ICdBY2NlcHQnLFxuICAgICAgMzE6ICdNb2RlQ2hhbmdlJyxcbiAgICAgIDMyOiAnICcsXG4gICAgICAzMzogJ1BhZ2VVcCcsXG4gICAgICAzNDogJ1BhZ2VEb3duJyxcbiAgICAgIDM1OiAnRW5kJyxcbiAgICAgIDM2OiAnSG9tZScsXG4gICAgICAzNzogJ0Fycm93TGVmdCcsXG4gICAgICAzODogJ0Fycm93VXAnLFxuICAgICAgMzk6ICdBcnJvd1JpZ2h0JyxcbiAgICAgIDQwOiAnQXJyb3dEb3duJyxcbiAgICAgIDQxOiAnU2VsZWN0JyxcbiAgICAgIDQyOiAnUHJpbnQnLFxuICAgICAgNDM6ICdFeGVjdXRlJyxcbiAgICAgIDQ0OiAnUHJpbnRTY3JlZW4nLFxuICAgICAgNDU6ICdJbnNlcnQnLFxuICAgICAgNDY6ICdEZWxldGUnLFxuICAgICAgNDg6IFsnMCcsICcpJ10sXG4gICAgICA0OTogWycxJywgJyEnXSxcbiAgICAgIDUwOiBbJzInLCAnQCddLFxuICAgICAgNTE6IFsnMycsICcjJ10sXG4gICAgICA1MjogWyc0JywgJyQnXSxcbiAgICAgIDUzOiBbJzUnLCAnJSddLFxuICAgICAgNTQ6IFsnNicsICdeJ10sXG4gICAgICA1NTogWyc3JywgJyYnXSxcbiAgICAgIDU2OiBbJzgnLCAnKiddLFxuICAgICAgNTc6IFsnOScsICcoJ10sXG4gICAgICA5MTogJ09TJyxcbiAgICAgIDkzOiAnQ29udGV4dE1lbnUnLFxuICAgICAgMTQ0OiAnTnVtTG9jaycsXG4gICAgICAxNDU6ICdTY3JvbGxMb2NrJyxcbiAgICAgIDE4MTogJ1ZvbHVtZU11dGUnLFxuICAgICAgMTgyOiAnVm9sdW1lRG93bicsXG4gICAgICAxODM6ICdWb2x1bWVVcCcsXG4gICAgICAxODY6IFsnOycsICc6J10sXG4gICAgICAxODc6IFsnPScsICcrJ10sXG4gICAgICAxODg6IFsnLCcsICc8J10sXG4gICAgICAxODk6IFsnLScsICdfJ10sXG4gICAgICAxOTA6IFsnLicsICc+J10sXG4gICAgICAxOTE6IFsnLycsICc/J10sXG4gICAgICAxOTI6IFsnYCcsICd+J10sXG4gICAgICAyMTk6IFsnWycsICd7J10sXG4gICAgICAyMjA6IFsnXFxcXCcsICd8J10sXG4gICAgICAyMjE6IFsnXScsICd9J10sXG4gICAgICAyMjI6IFtcIidcIiwgJ1wiJ10sXG4gICAgICAyMjQ6ICdNZXRhJyxcbiAgICAgIDIyNTogJ0FsdEdyYXBoJyxcbiAgICAgIDI0NjogJ0F0dG4nLFxuICAgICAgMjQ3OiAnQ3JTZWwnLFxuICAgICAgMjQ4OiAnRXhTZWwnLFxuICAgICAgMjQ5OiAnRXJhc2VFb2YnLFxuICAgICAgMjUwOiAnUGxheScsXG4gICAgICAyNTE6ICdab29tT3V0J1xuICAgIH1cbiAgfTtcblxuICAvLyBGdW5jdGlvbiBrZXlzIChGMS0yNCkuXG4gIHZhciBpO1xuICBmb3IgKGkgPSAxOyBpIDwgMjU7IGkrKykge1xuICAgIGtleWJvYXJkZXZlbnRLZXlQb2x5ZmlsbC5rZXlzWzExMSArIGldID0gJ0YnICsgaTtcbiAgfVxuXG4gIC8vIFByaW50YWJsZSBBU0NJSSBjaGFyYWN0ZXJzLlxuICB2YXIgbGV0dGVyID0gJyc7XG4gIGZvciAoaSA9IDY1OyBpIDwgOTE7IGkrKykge1xuICAgIGxldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG4gICAga2V5Ym9hcmRldmVudEtleVBvbHlmaWxsLmtleXNbaV0gPSBbbGV0dGVyLnRvTG93ZXJDYXNlKCksIGxldHRlci50b1VwcGVyQ2FzZSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvbHlmaWxsICgpIHtcbiAgICBpZiAoISgnS2V5Ym9hcmRFdmVudCcgaW4gd2luZG93KSB8fFxuICAgICAgICAna2V5JyBpbiBLZXlib2FyZEV2ZW50LnByb3RvdHlwZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFBvbHlmaWxsIGBrZXlgIG9uIGBLZXlib2FyZEV2ZW50YC5cbiAgICB2YXIgcHJvdG8gPSB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlib2FyZGV2ZW50S2V5UG9seWZpbGwua2V5c1t0aGlzLndoaWNoIHx8IHRoaXMua2V5Q29kZV07XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5KSkge1xuICAgICAgICAgIGtleSA9IGtleVsrdGhpcy5zaGlmdEtleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgfVxuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEtleWJvYXJkRXZlbnQucHJvdG90eXBlLCAna2V5JywgcHJvdG8pO1xuICAgIHJldHVybiBwcm90bztcbiAgfVxuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ2tleWJvYXJkZXZlbnQta2V5LXBvbHlmaWxsJywga2V5Ym9hcmRldmVudEtleVBvbHlmaWxsKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGtleWJvYXJkZXZlbnRLZXlQb2x5ZmlsbDtcbiAgfSBlbHNlIGlmICh3aW5kb3cpIHtcbiAgICB3aW5kb3cua2V5Ym9hcmRldmVudEtleVBvbHlmaWxsID0ga2V5Ym9hcmRldmVudEtleVBvbHlmaWxsO1xuICB9XG5cbn0pKCk7XG4iLCIvKlxub2JqZWN0LWFzc2lnblxuKGMpIFNpbmRyZSBTb3JodXNcbkBsaWNlbnNlIE1JVFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG5cdHRyeSB7XG5cdFx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuXHRcdHZhciB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXctd3JhcHBlcnNcblx0XHR0ZXN0MVs1XSA9ICdkZSc7XG5cdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MiA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuXHRcdH1cblx0XHR2YXIgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbiAobikge1xuXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuXHRcdH0pO1xuXHRcdGlmIChvcmRlcjIuam9pbignJykgIT09ICcwMTIzNDU2Nzg5Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDMgPSB7fTtcblx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcblx0XHRcdHRlc3QzW2xldHRlcl0gPSBsZXR0ZXI7XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT09XG5cdFx0XHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuIiwiY29uc3QgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuY29uc3QgZGVsZWdhdGUgPSByZXF1aXJlKCcuLi9kZWxlZ2F0ZScpO1xuY29uc3QgZGVsZWdhdGVBbGwgPSByZXF1aXJlKCcuLi9kZWxlZ2F0ZUFsbCcpO1xuXG5jb25zdCBERUxFR0FURV9QQVRURVJOID0gL14oLispOmRlbGVnYXRlXFwoKC4rKVxcKSQvO1xuY29uc3QgU1BBQ0UgPSAnICc7XG5cbmNvbnN0IGdldExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgdmFyIG1hdGNoID0gdHlwZS5tYXRjaChERUxFR0FURV9QQVRURVJOKTtcbiAgdmFyIHNlbGVjdG9yO1xuICBpZiAobWF0Y2gpIHtcbiAgICB0eXBlID0gbWF0Y2hbMV07XG4gICAgc2VsZWN0b3IgPSBtYXRjaFsyXTtcbiAgfVxuXG4gIHZhciBvcHRpb25zO1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGNhcHR1cmU6IHBvcEtleShoYW5kbGVyLCAnY2FwdHVyZScpLFxuICAgICAgcGFzc2l2ZTogcG9wS2V5KGhhbmRsZXIsICdwYXNzaXZlJylcbiAgICB9O1xuICB9XG5cbiAgdmFyIGxpc3RlbmVyID0ge1xuICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICBkZWxlZ2F0ZTogKHR5cGVvZiBoYW5kbGVyID09PSAnb2JqZWN0JylcbiAgICAgID8gZGVsZWdhdGVBbGwoaGFuZGxlcilcbiAgICAgIDogc2VsZWN0b3JcbiAgICAgICAgPyBkZWxlZ2F0ZShzZWxlY3RvciwgaGFuZGxlcilcbiAgICAgICAgOiBoYW5kbGVyLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgfTtcblxuICBpZiAodHlwZS5pbmRleE9mKFNQQUNFKSA+IC0xKSB7XG4gICAgcmV0dXJuIHR5cGUuc3BsaXQoU1BBQ0UpLm1hcChmdW5jdGlvbihfdHlwZSkge1xuICAgICAgcmV0dXJuIGFzc2lnbih7dHlwZTogX3R5cGV9LCBsaXN0ZW5lcik7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbGlzdGVuZXIudHlwZSA9IHR5cGU7XG4gICAgcmV0dXJuIFtsaXN0ZW5lcl07XG4gIH1cbn07XG5cbnZhciBwb3BLZXkgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgZGVsZXRlIG9ialtrZXldO1xuICByZXR1cm4gdmFsdWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJlaGF2aW9yKGV2ZW50cywgcHJvcHMpIHtcbiAgY29uc3QgbGlzdGVuZXJzID0gT2JqZWN0LmtleXMoZXZlbnRzKVxuICAgIC5yZWR1Y2UoZnVuY3Rpb24obWVtbywgdHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IGdldExpc3RlbmVycyh0eXBlLCBldmVudHNbdHlwZV0pO1xuICAgICAgcmV0dXJuIG1lbW8uY29uY2F0KGxpc3RlbmVycyk7XG4gICAgfSwgW10pO1xuXG4gIHJldHVybiBhc3NpZ24oe1xuICAgIGFkZDogZnVuY3Rpb24gYWRkQmVoYXZpb3IoZWxlbWVudCkge1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIGxpc3RlbmVyLnR5cGUsXG4gICAgICAgICAgbGlzdGVuZXIuZGVsZWdhdGUsXG4gICAgICAgICAgbGlzdGVuZXIub3B0aW9uc1xuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZUJlaGF2aW9yKGVsZW1lbnQpIHtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBsaXN0ZW5lci50eXBlLFxuICAgICAgICAgIGxpc3RlbmVyLmRlbGVnYXRlLFxuICAgICAgICAgIGxpc3RlbmVyLm9wdGlvbnNcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgcHJvcHMpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tcG9zZShmdW5jdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb25zLnNvbWUoZnVuY3Rpb24oZm4pIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGUpID09PSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbiAgfTtcbn07XG4iLCIvLyBwb2x5ZmlsbCBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0XG5yZXF1aXJlKCdlbGVtZW50LWNsb3Nlc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWxlZ2F0ZShzZWxlY3RvciwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlbGVnYXRpb24oZXZlbnQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3Qoc2VsZWN0b3IpO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRhcmdldCwgZXZlbnQpO1xuICAgIH1cbiAgfVxufTtcbiIsImNvbnN0IGRlbGVnYXRlID0gcmVxdWlyZSgnLi4vZGVsZWdhdGUnKTtcbmNvbnN0IGNvbXBvc2UgPSByZXF1aXJlKCcuLi9jb21wb3NlJyk7XG5cbmNvbnN0IFNQTEFUID0gJyonO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlbGVnYXRlQWxsKHNlbGVjdG9ycykge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoc2VsZWN0b3JzKVxuXG4gIC8vIFhYWCBvcHRpbWl6YXRpb246IGlmIHRoZXJlIGlzIG9ubHkgb25lIGhhbmRsZXIgYW5kIGl0IGFwcGxpZXMgdG9cbiAgLy8gYWxsIGVsZW1lbnRzICh0aGUgXCIqXCIgQ1NTIHNlbGVjdG9yKSwgdGhlbiBqdXN0IHJldHVybiB0aGF0XG4gIC8vIGhhbmRsZXJcbiAgaWYgKGtleXMubGVuZ3RoID09PSAxICYmIGtleXNbMF0gPT09IFNQTEFUKSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yc1tTUExBVF07XG4gIH1cblxuICBjb25zdCBkZWxlZ2F0ZXMgPSBrZXlzLnJlZHVjZShmdW5jdGlvbihtZW1vLCBzZWxlY3Rvcikge1xuICAgIG1lbW8ucHVzaChkZWxlZ2F0ZShzZWxlY3Rvciwgc2VsZWN0b3JzW3NlbGVjdG9yXSkpO1xuICAgIHJldHVybiBtZW1vO1xuICB9LCBbXSk7XG4gIHJldHVybiBjb21wb3NlKGRlbGVnYXRlcyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpZ25vcmUoZWxlbWVudCwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGlnbm9yYW5jZShlKSB7XG4gICAgaWYgKGVsZW1lbnQgIT09IGUudGFyZ2V0ICYmICFlbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZSk7XG4gICAgfVxuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBiZWhhdmlvcjogICAgIHJlcXVpcmUoJy4vYmVoYXZpb3InKSxcbiAgZGVsZWdhdGU6ICAgICByZXF1aXJlKCcuL2RlbGVnYXRlJyksXG4gIGRlbGVnYXRlQWxsOiAgcmVxdWlyZSgnLi9kZWxlZ2F0ZUFsbCcpLFxuICBpZ25vcmU6ICAgICAgIHJlcXVpcmUoJy4vaWdub3JlJyksXG4gIGtleW1hcDogICAgICAgcmVxdWlyZSgnLi9rZXltYXAnKSxcbn07XG4iLCJyZXF1aXJlKCdrZXlib2FyZGV2ZW50LWtleS1wb2x5ZmlsbCcpO1xuXG4vLyB0aGVzZSBhcmUgdGhlIG9ubHkgcmVsZXZhbnQgbW9kaWZpZXJzIHN1cHBvcnRlZCBvbiBhbGwgcGxhdGZvcm1zLFxuLy8gYWNjb3JkaW5nIHRvIE1ETjpcbi8vIDxodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudC9nZXRNb2RpZmllclN0YXRlPlxuY29uc3QgTU9ESUZJRVJTID0ge1xuICAnQWx0JzogICAgICAnYWx0S2V5JyxcbiAgJ0NvbnRyb2wnOiAgJ2N0cmxLZXknLFxuICAnQ3RybCc6ICAgICAnY3RybEtleScsXG4gICdTaGlmdCc6ICAgICdzaGlmdEtleSdcbn07XG5cbmNvbnN0IE1PRElGSUVSX1NFUEFSQVRPUiA9ICcrJztcblxuY29uc3QgZ2V0RXZlbnRLZXkgPSBmdW5jdGlvbihldmVudCwgaGFzTW9kaWZpZXJzKSB7XG4gIHZhciBrZXkgPSBldmVudC5rZXk7XG4gIGlmIChoYXNNb2RpZmllcnMpIHtcbiAgICBmb3IgKHZhciBtb2RpZmllciBpbiBNT0RJRklFUlMpIHtcbiAgICAgIGlmIChldmVudFtNT0RJRklFUlNbbW9kaWZpZXJdXSA9PT0gdHJ1ZSkge1xuICAgICAgICBrZXkgPSBbbW9kaWZpZXIsIGtleV0uam9pbihNT0RJRklFUl9TRVBBUkFUT1IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ga2V5O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBrZXltYXAoa2V5cykge1xuICBjb25zdCBoYXNNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhrZXlzKS5zb21lKGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkuaW5kZXhPZihNT0RJRklFUl9TRVBBUkFUT1IpID4gLTE7XG4gIH0pO1xuICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIga2V5ID0gZ2V0RXZlbnRLZXkoZXZlbnQsIGhhc01vZGlmaWVycyk7XG4gICAgcmV0dXJuIFtrZXksIGtleS50b0xvd2VyQ2FzZSgpXVxuICAgICAgLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIF9rZXkpIHtcbiAgICAgICAgaWYgKF9rZXkgaW4ga2V5cykge1xuICAgICAgICAgIHJlc3VsdCA9IGtleXNba2V5XS5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgdW5kZWZpbmVkKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLk1PRElGSUVSUyA9IE1PRElGSUVSUztcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb25jZShsaXN0ZW5lciwgb3B0aW9ucykge1xuICB2YXIgd3JhcHBlZCA9IGZ1bmN0aW9uIHdyYXBwZWRPbmNlKGUpIHtcbiAgICBlLmN1cnJlbnRUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLnR5cGUsIHdyYXBwZWQsIG9wdGlvbnMpO1xuICAgIHJldHVybiBsaXN0ZW5lci5jYWxsKHRoaXMsIGUpO1xuICB9O1xuICByZXR1cm4gd3JhcHBlZDtcbn07XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJFX1RSSU0gPSAvKF5cXHMrKXwoXFxzKyQpL2c7XG52YXIgUkVfU1BMSVQgPSAvXFxzKy87XG5cbnZhciB0cmltID0gU3RyaW5nLnByb3RvdHlwZS50cmltXG4gID8gZnVuY3Rpb24oc3RyKSB7IHJldHVybiBzdHIudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24oc3RyKSB7IHJldHVybiBzdHIucmVwbGFjZShSRV9UUklNLCAnJyk7IH07XG5cbnZhciBxdWVyeUJ5SWQgPSBmdW5jdGlvbihpZCkge1xuICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKCdbaWQ9XCInICsgaWQucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICsgJ1wiXScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXNvbHZlSWRzKGlkcywgZG9jKSB7XG4gIGlmICh0eXBlb2YgaWRzICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcgYnV0IGdvdCAnICsgKHR5cGVvZiBpZHMpKTtcbiAgfVxuXG4gIGlmICghZG9jKSB7XG4gICAgZG9jID0gd2luZG93LmRvY3VtZW50O1xuICB9XG5cbiAgdmFyIGdldEVsZW1lbnRCeUlkID0gZG9jLmdldEVsZW1lbnRCeUlkXG4gICAgPyBkb2MuZ2V0RWxlbWVudEJ5SWQuYmluZChkb2MpXG4gICAgOiBxdWVyeUJ5SWQuYmluZChkb2MpO1xuXG4gIGlkcyA9IHRyaW0oaWRzKS5zcGxpdChSRV9TUExJVCk7XG5cbiAgLy8gWFhYIHdlIGNhbiBzaG9ydC1jaXJjdWl0IGhlcmUgYmVjYXVzZSB0cmltbWluZyBhbmQgc3BsaXR0aW5nIGFcbiAgLy8gc3RyaW5nIG9mIGp1c3Qgd2hpdGVzcGFjZSBwcm9kdWNlcyBhbiBhcnJheSBjb250YWluaW5nIGEgc2luZ2xlLFxuICAvLyBlbXB0eSBzdHJpbmdcbiAgaWYgKGlkcy5sZW5ndGggPT09IDEgJiYgaWRzWzBdID09PSAnJykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiBpZHNcbiAgICAubWFwKGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgZWwgPSBnZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICBpZiAoIWVsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gZWxlbWVudCB3aXRoIGlkOiBcIicgKyBpZCArICdcIicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsO1xuICAgIH0pO1xufTtcbiIsImNvbnN0IHNlbGVjdCA9IHJlcXVpcmUoXCIuLi91dGlscy9zZWxlY3RcIik7XG5jb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHRvZ2dsZSA9IHJlcXVpcmUoXCIuLi91dGlscy90b2dnbGVcIik7XG5jb25zdCBpc0VsZW1lbnRJblZpZXdwb3J0ID0gcmVxdWlyZShcIi4uL3V0aWxzL2lzLWluLXZpZXdwb3J0XCIpO1xuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbmNvbnN0IEFDQ09SRElPTiA9IGAuJHtQUkVGSVh9LWFjY29yZGlvbiwgLiR7UFJFRklYfS1hY2NvcmRpb24tLWJvcmRlcmVkYDtcbmNvbnN0IEJVVFRPTiA9IGAuJHtQUkVGSVh9LWFjY29yZGlvbl9fYnV0dG9uW2FyaWEtY29udHJvbHNdYDtcbmNvbnN0IEVYUEFOREVEID0gXCJhcmlhLWV4cGFuZGVkXCI7XG5jb25zdCBNVUxUSVNFTEVDVEFCTEUgPSBcImFyaWEtbXVsdGlzZWxlY3RhYmxlXCI7XG5cbi8qKlxuICogR2V0IGFuIEFycmF5IG9mIGJ1dHRvbiBlbGVtZW50cyBiZWxvbmdpbmcgZGlyZWN0bHkgdG8gdGhlIGdpdmVuXG4gKiBhY2NvcmRpb24gZWxlbWVudC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGFjY29yZGlvblxuICogQHJldHVybiB7YXJyYXk8SFRNTEJ1dHRvbkVsZW1lbnQ+fVxuICovXG5jb25zdCBnZXRBY2NvcmRpb25CdXR0b25zID0gKGFjY29yZGlvbikgPT4ge1xuICBjb25zdCBidXR0b25zID0gc2VsZWN0KEJVVFRPTiwgYWNjb3JkaW9uKTtcblxuICByZXR1cm4gYnV0dG9ucy5maWx0ZXIoKGJ1dHRvbikgPT4gYnV0dG9uLmNsb3Nlc3QoQUNDT1JESU9OKSA9PT0gYWNjb3JkaW9uKTtcbn07XG5cbi8qKlxuICogVG9nZ2xlIGEgYnV0dG9uJ3MgXCJwcmVzc2VkXCIgc3RhdGUsIG9wdGlvbmFsbHkgcHJvdmlkaW5nIGEgdGFyZ2V0XG4gKiBzdGF0ZS5cbiAqXG4gKiBAcGFyYW0ge0hUTUxCdXR0b25FbGVtZW50fSBidXR0b25cbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGV4cGFuZGVkIElmIG5vIHN0YXRlIGlzIHByb3ZpZGVkLCB0aGUgY3VycmVudFxuICogc3RhdGUgd2lsbCBiZSB0b2dnbGVkIChmcm9tIGZhbHNlIHRvIHRydWUsIGFuZCB2aWNlLXZlcnNhKS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRoZSByZXN1bHRpbmcgc3RhdGVcbiAqL1xuY29uc3QgdG9nZ2xlQnV0dG9uID0gKGJ1dHRvbiwgZXhwYW5kZWQpID0+IHtcbiAgY29uc3QgYWNjb3JkaW9uID0gYnV0dG9uLmNsb3Nlc3QoQUNDT1JESU9OKTtcbiAgbGV0IHNhZmVFeHBhbmRlZCA9IGV4cGFuZGVkO1xuXG4gIGlmICghYWNjb3JkaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke0JVVFRPTn0gaXMgbWlzc2luZyBvdXRlciAke0FDQ09SRElPTn1gKTtcbiAgfVxuXG4gIHNhZmVFeHBhbmRlZCA9IHRvZ2dsZShidXR0b24sIGV4cGFuZGVkKTtcblxuICAvLyBYWFggbXVsdGlzZWxlY3RhYmxlIGlzIG9wdC1pbiwgdG8gcHJlc2VydmUgbGVnYWN5IGJlaGF2aW9yXG4gIGNvbnN0IG11bHRpc2VsZWN0YWJsZSA9IGFjY29yZGlvbi5nZXRBdHRyaWJ1dGUoTVVMVElTRUxFQ1RBQkxFKSA9PT0gXCJ0cnVlXCI7XG5cbiAgaWYgKHNhZmVFeHBhbmRlZCAmJiAhbXVsdGlzZWxlY3RhYmxlKSB7XG4gICAgZ2V0QWNjb3JkaW9uQnV0dG9ucyhhY2NvcmRpb24pLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICBpZiAob3RoZXIgIT09IGJ1dHRvbikge1xuICAgICAgICB0b2dnbGUob3RoZXIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxCdXR0b25FbGVtZW50fSBidXR0b25cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWVcbiAqL1xuY29uc3Qgc2hvd0J1dHRvbiA9IChidXR0b24pID0+IHRvZ2dsZUJ1dHRvbihidXR0b24sIHRydWUpO1xuXG4vKipcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGJ1dHRvblxuICogQHJldHVybiB7Ym9vbGVhbn0gZmFsc2VcbiAqL1xuY29uc3QgaGlkZUJ1dHRvbiA9IChidXR0b24pID0+IHRvZ2dsZUJ1dHRvbihidXR0b24sIGZhbHNlKTtcblxuY29uc3QgYWNjb3JkaW9uID0gYmVoYXZpb3IoXG4gIHtcbiAgICBbQ0xJQ0tdOiB7XG4gICAgICBbQlVUVE9OXShldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRvZ2dsZUJ1dHRvbih0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoRVhQQU5ERUQpID09PSBcInRydWVcIikge1xuICAgICAgICAgIC8vIFdlIHdlcmUganVzdCBleHBhbmRlZCwgYnV0IGlmIGFub3RoZXIgYWNjb3JkaW9uIHdhcyBhbHNvIGp1c3RcbiAgICAgICAgICAvLyBjb2xsYXBzZWQsIHdlIG1heSBubyBsb25nZXIgYmUgaW4gdGhlIHZpZXdwb3J0LiBUaGlzIGVuc3VyZXNcbiAgICAgICAgICAvLyB0aGF0IHdlIGFyZSBzdGlsbCB2aXNpYmxlLCBzbyB0aGUgdXNlciBpc24ndCBjb25mdXNlZC5cbiAgICAgICAgICBpZiAoIWlzRWxlbWVudEluVmlld3BvcnQodGhpcykpIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaW5pdChyb290KSB7XG4gICAgICBzZWxlY3QoQlVUVE9OLCByb290KS5mb3JFYWNoKChidXR0b24pID0+IHtcbiAgICAgICAgY29uc3QgZXhwYW5kZWQgPSBidXR0b24uZ2V0QXR0cmlidXRlKEVYUEFOREVEKSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbihidXR0b24sIGV4cGFuZGVkKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgQUNDT1JESU9OLFxuICAgIEJVVFRPTixcbiAgICBzaG93OiBzaG93QnV0dG9uLFxuICAgIGhpZGU6IGhpZGVCdXR0b24sXG4gICAgdG9nZ2xlOiB0b2dnbGVCdXR0b24sXG4gICAgZ2V0QnV0dG9uczogZ2V0QWNjb3JkaW9uQnV0dG9ucyxcbiAgfVxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhY2NvcmRpb247XG4iLCJjb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHsgQ0xJQ0sgfSA9IHJlcXVpcmUoXCIuLi9ldmVudHNcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG5jb25zdCBIRUFERVIgPSBgLiR7UFJFRklYfS1iYW5uZXJfX2hlYWRlcmA7XG5jb25zdCBFWFBBTkRFRF9DTEFTUyA9IGAke1BSRUZJWH0tYmFubmVyX19oZWFkZXItLWV4cGFuZGVkYDtcblxuY29uc3QgdG9nZ2xlQmFubmVyID0gZnVuY3Rpb24gdG9nZ2xlRWwoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgdGhpcy5jbG9zZXN0KEhFQURFUikuY2xhc3NMaXN0LnRvZ2dsZShFWFBBTkRFRF9DTEFTUyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJlaGF2aW9yKHtcbiAgW0NMSUNLXToge1xuICAgIFtgJHtIRUFERVJ9IFthcmlhLWNvbnRyb2xzXWBdOiB0b2dnbGVCYW5uZXIsXG4gIH0sXG59KTtcbiIsImNvbnN0IHNlbGVjdCA9IHJlcXVpcmUoXCIuLi91dGlscy9zZWxlY3RcIik7XG5jb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbmNvbnN0IENIQVJBQ1RFUl9DT1VOVCA9IGAuJHtQUkVGSVh9LWNoYXJhY3Rlci1jb3VudGA7XG5jb25zdCBJTlBVVCA9IGAuJHtQUkVGSVh9LWNoYXJhY3Rlci1jb3VudF9fZmllbGRgO1xuY29uc3QgTUVTU0FHRSA9IGAuJHtQUkVGSVh9LWNoYXJhY3Rlci1jb3VudF9fbWVzc2FnZWA7XG5jb25zdCBWQUxJREFUSU9OX01FU1NBR0UgPSBcIlRoZSBjb250ZW50IGlzIHRvbyBsb25nLlwiO1xuY29uc3QgTUVTU0FHRV9JTlZBTElEX0NMQVNTID0gYCR7UFJFRklYfS1jaGFyYWN0ZXItY291bnRfX21lc3NhZ2UtLWludmFsaWRgO1xuXG4vKipcbiAqIFRoZSBlbGVtZW50cyB3aXRoaW4gdGhlIGNoYXJhY3RlciBjb3VudC5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IENoYXJhY3RlckNvdW50RWxlbWVudHNcbiAqIEBwcm9wZXJ0eSB7SFRNTERpdkVsZW1lbnR9IGNoYXJhY3RlckNvdW50RWxcbiAqIEBwcm9wZXJ0eSB7SFRNTFNwYW5FbGVtZW50fSBtZXNzYWdlRWxcbiAqL1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHJvb3QgYW5kIG1lc3NhZ2UgZWxlbWVudFxuICogZm9yIGFuIGNoYXJhY3RlciBjb3VudCBpbnB1dFxuICpcbiAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudHxIVE1MVGV4dEFyZWFFbGVtZW50fSBpbnB1dEVsIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5wdXQgZWxlbWVudFxuICogQHJldHVybnMge0NoYXJhY3RlckNvdW50RWxlbWVudHN9IGVsZW1lbnRzIFRoZSByb290IGFuZCBtZXNzYWdlIGVsZW1lbnQuXG4gKi9cbmNvbnN0IGdldENoYXJhY3RlckNvdW50RWxlbWVudHMgPSAoaW5wdXRFbCkgPT4ge1xuICBjb25zdCBjaGFyYWN0ZXJDb3VudEVsID0gaW5wdXRFbC5jbG9zZXN0KENIQVJBQ1RFUl9DT1VOVCk7XG5cbiAgaWYgKCFjaGFyYWN0ZXJDb3VudEVsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke0lOUFVUfSBpcyBtaXNzaW5nIG91dGVyICR7Q0hBUkFDVEVSX0NPVU5UfWApO1xuICB9XG5cbiAgY29uc3QgbWVzc2FnZUVsID0gY2hhcmFjdGVyQ291bnRFbC5xdWVyeVNlbGVjdG9yKE1FU1NBR0UpO1xuXG4gIGlmICghbWVzc2FnZUVsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke0NIQVJBQ1RFUl9DT1VOVH0gaXMgbWlzc2luZyBpbm5lciAke01FU1NBR0V9YCk7XG4gIH1cblxuICByZXR1cm4geyBjaGFyYWN0ZXJDb3VudEVsLCBtZXNzYWdlRWwgfTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBjaGFyYWN0ZXIgY291bnQgY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fEhUTUxUZXh0QXJlYUVsZW1lbnR9IGlucHV0RWwgVGhlIGNoYXJhY3RlciBjb3VudCBpbnB1dCBlbGVtZW50XG4gKi9cbmNvbnN0IHVwZGF0ZUNvdW50TWVzc2FnZSA9IChpbnB1dEVsKSA9PiB7XG4gIGNvbnN0IHsgY2hhcmFjdGVyQ291bnRFbCwgbWVzc2FnZUVsIH0gPSBnZXRDaGFyYWN0ZXJDb3VudEVsZW1lbnRzKGlucHV0RWwpO1xuXG4gIGNvbnN0IG1heGxlbmd0aCA9IHBhcnNlSW50KFxuICAgIGNoYXJhY3RlckNvdW50RWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1tYXhsZW5ndGhcIiksXG4gICAgMTBcbiAgKTtcblxuICBpZiAoIW1heGxlbmd0aCkgcmV0dXJuO1xuXG4gIGxldCBuZXdNZXNzYWdlID0gXCJcIjtcbiAgY29uc3QgY3VycmVudExlbmd0aCA9IGlucHV0RWwudmFsdWUubGVuZ3RoO1xuICBjb25zdCBpc092ZXJMaW1pdCA9IGN1cnJlbnRMZW5ndGggJiYgY3VycmVudExlbmd0aCA+IG1heGxlbmd0aDtcblxuICBpZiAoY3VycmVudExlbmd0aCA9PT0gMCkge1xuICAgIG5ld01lc3NhZ2UgPSBgJHttYXhsZW5ndGh9IGNoYXJhY3RlcnMgYWxsb3dlZGA7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZGlmZmVyZW5jZSA9IE1hdGguYWJzKG1heGxlbmd0aCAtIGN1cnJlbnRMZW5ndGgpO1xuICAgIGNvbnN0IGNoYXJhY3RlcnMgPSBgY2hhcmFjdGVyJHtkaWZmZXJlbmNlID09PSAxID8gXCJcIiA6IFwic1wifWA7XG4gICAgY29uc3QgZ3VpZGFuY2UgPSBpc092ZXJMaW1pdCA/IFwib3ZlciBsaW1pdFwiIDogXCJsZWZ0XCI7XG5cbiAgICBuZXdNZXNzYWdlID0gYCR7ZGlmZmVyZW5jZX0gJHtjaGFyYWN0ZXJzfSAke2d1aWRhbmNlfWA7XG4gIH1cblxuICBtZXNzYWdlRWwuY2xhc3NMaXN0LnRvZ2dsZShNRVNTQUdFX0lOVkFMSURfQ0xBU1MsIGlzT3ZlckxpbWl0KTtcbiAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gbmV3TWVzc2FnZTtcblxuICBpZiAoaXNPdmVyTGltaXQgJiYgIWlucHV0RWwudmFsaWRhdGlvbk1lc3NhZ2UpIHtcbiAgICBpbnB1dEVsLnNldEN1c3RvbVZhbGlkaXR5KFZBTElEQVRJT05fTUVTU0FHRSk7XG4gIH1cblxuICBpZiAoIWlzT3ZlckxpbWl0ICYmIGlucHV0RWwudmFsaWRhdGlvbk1lc3NhZ2UgPT09IFZBTElEQVRJT05fTUVTU0FHRSkge1xuICAgIGlucHV0RWwuc2V0Q3VzdG9tVmFsaWRpdHkoXCJcIik7XG4gIH1cbn07XG5cbi8qKlxuICogU2V0dXAgdGhlIGNoYXJhY3RlciBjb3VudCBjb21wb25lbnRcbiAqXG4gKiBAcGFyYW0ge0hUTUxJbnB1dEVsZW1lbnR8SFRNTFRleHRBcmVhRWxlbWVudH0gaW5wdXRFbCBUaGUgY2hhcmFjdGVyIGNvdW50IGlucHV0IGVsZW1lbnRcbiAqL1xuY29uc3Qgc2V0dXBBdHRyaWJ1dGVzID0gKGlucHV0RWwpID0+IHtcbiAgY29uc3QgeyBjaGFyYWN0ZXJDb3VudEVsIH0gPSBnZXRDaGFyYWN0ZXJDb3VudEVsZW1lbnRzKGlucHV0RWwpO1xuXG4gIGNvbnN0IG1heGxlbmd0aCA9IGlucHV0RWwuZ2V0QXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpO1xuXG4gIGlmICghbWF4bGVuZ3RoKSByZXR1cm47XG5cbiAgaW5wdXRFbC5yZW1vdmVBdHRyaWJ1dGUoXCJtYXhsZW5ndGhcIik7XG4gIGNoYXJhY3RlckNvdW50RWwuc2V0QXR0cmlidXRlKFwiZGF0YS1tYXhsZW5ndGhcIiwgbWF4bGVuZ3RoKTtcbn07XG5cbmNvbnN0IGNoYXJhY3RlckNvdW50ID0gYmVoYXZpb3IoXG4gIHtcbiAgICBpbnB1dDoge1xuICAgICAgW0lOUFVUXSgpIHtcbiAgICAgICAgdXBkYXRlQ291bnRNZXNzYWdlKHRoaXMpO1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaW5pdChyb290KSB7XG4gICAgICBzZWxlY3QoSU5QVVQsIHJvb3QpLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgICAgIHNldHVwQXR0cmlidXRlcyhpbnB1dCk7XG4gICAgICAgIHVwZGF0ZUNvdW50TWVzc2FnZShpbnB1dCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIE1FU1NBR0VfSU5WQUxJRF9DTEFTUyxcbiAgICBWQUxJREFUSU9OX01FU1NBR0UsXG4gIH1cbik7XG5cbm1vZHVsZS5leHBvcnRzID0gY2hhcmFjdGVyQ291bnQ7XG4iLCJjb25zdCBrZXltYXAgPSByZXF1aXJlKFwicmVjZXB0b3Iva2V5bWFwXCIpO1xuY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4uL3V0aWxzL3NlbGVjdFwiKTtcbmNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3QgU2FuaXRpemVyID0gcmVxdWlyZShcIi4uL3V0aWxzL3Nhbml0aXplclwiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5jb25zdCB7IENMSUNLIH0gPSByZXF1aXJlKFwiLi4vZXZlbnRzXCIpO1xuXG5jb25zdCBDT01CT19CT1hfQ0xBU1MgPSBgJHtQUkVGSVh9LWNvbWJvLWJveGA7XG5jb25zdCBDT01CT19CT1hfUFJJU1RJTkVfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9LS1wcmlzdGluZWA7XG5jb25zdCBTRUxFQ1RfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19zZWxlY3RgO1xuY29uc3QgSU5QVVRfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19pbnB1dGA7XG5jb25zdCBDTEVBUl9JTlBVVF9CVVRUT05fQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19jbGVhci1pbnB1dGA7XG5jb25zdCBDTEVBUl9JTlBVVF9CVVRUT05fV1JBUFBFUl9DTEFTUyA9IGAke0NMRUFSX0lOUFVUX0JVVFRPTl9DTEFTU31fX3dyYXBwZXJgO1xuY29uc3QgSU5QVVRfQlVUVE9OX1NFUEFSQVRPUl9DTEFTUyA9IGAke0NPTUJPX0JPWF9DTEFTU31fX2lucHV0LWJ1dHRvbi1zZXBhcmF0b3JgO1xuY29uc3QgVE9HR0xFX0xJU1RfQlVUVE9OX0NMQVNTID0gYCR7Q09NQk9fQk9YX0NMQVNTfV9fdG9nZ2xlLWxpc3RgO1xuY29uc3QgVE9HR0xFX0xJU1RfQlVUVE9OX1dSQVBQRVJfQ0xBU1MgPSBgJHtUT0dHTEVfTElTVF9CVVRUT05fQ0xBU1N9X193cmFwcGVyYDtcbmNvbnN0IExJU1RfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19saXN0YDtcbmNvbnN0IExJU1RfT1BUSU9OX0NMQVNTID0gYCR7Q09NQk9fQk9YX0NMQVNTfV9fbGlzdC1vcHRpb25gO1xuY29uc3QgTElTVF9PUFRJT05fRk9DVVNFRF9DTEFTUyA9IGAke0xJU1RfT1BUSU9OX0NMQVNTfS0tZm9jdXNlZGA7XG5jb25zdCBMSVNUX09QVElPTl9TRUxFQ1RFRF9DTEFTUyA9IGAke0xJU1RfT1BUSU9OX0NMQVNTfS0tc2VsZWN0ZWRgO1xuY29uc3QgU1RBVFVTX0NMQVNTID0gYCR7Q09NQk9fQk9YX0NMQVNTfV9fc3RhdHVzYDtcblxuY29uc3QgQ09NQk9fQk9YID0gYC4ke0NPTUJPX0JPWF9DTEFTU31gO1xuY29uc3QgU0VMRUNUID0gYC4ke1NFTEVDVF9DTEFTU31gO1xuY29uc3QgSU5QVVQgPSBgLiR7SU5QVVRfQ0xBU1N9YDtcbmNvbnN0IENMRUFSX0lOUFVUX0JVVFRPTiA9IGAuJHtDTEVBUl9JTlBVVF9CVVRUT05fQ0xBU1N9YDtcbmNvbnN0IFRPR0dMRV9MSVNUX0JVVFRPTiA9IGAuJHtUT0dHTEVfTElTVF9CVVRUT05fQ0xBU1N9YDtcbmNvbnN0IExJU1QgPSBgLiR7TElTVF9DTEFTU31gO1xuY29uc3QgTElTVF9PUFRJT04gPSBgLiR7TElTVF9PUFRJT05fQ0xBU1N9YDtcbmNvbnN0IExJU1RfT1BUSU9OX0ZPQ1VTRUQgPSBgLiR7TElTVF9PUFRJT05fRk9DVVNFRF9DTEFTU31gO1xuY29uc3QgTElTVF9PUFRJT05fU0VMRUNURUQgPSBgLiR7TElTVF9PUFRJT05fU0VMRUNURURfQ0xBU1N9YDtcbmNvbnN0IFNUQVRVUyA9IGAuJHtTVEFUVVNfQ0xBU1N9YDtcblxuY29uc3QgREVGQVVMVF9GSUxURVIgPSBcIi4qe3txdWVyeX19LipcIjtcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG4vKipcbiAqIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgYW5kIGRpc3BhdGNoIGEgY2hhbmdlIGV2ZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fEhUTUxTZWxlY3RFbGVtZW50fSBlbCBUaGUgZWxlbWVudCB0byB1cGRhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBlbGVtZW50XG4gKi9cbmNvbnN0IGNoYW5nZUVsZW1lbnRWYWx1ZSA9IChlbCwgdmFsdWUgPSBcIlwiKSA9PiB7XG4gIGNvbnN0IGVsZW1lbnRUb0NoYW5nZSA9IGVsO1xuICBlbGVtZW50VG9DaGFuZ2UudmFsdWUgPSB2YWx1ZTtcblxuICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChcImNoYW5nZVwiLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGRldGFpbDogeyB2YWx1ZSB9LFxuICB9KTtcbiAgZWxlbWVudFRvQ2hhbmdlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufTtcblxuLyoqXG4gKiBUaGUgZWxlbWVudHMgd2l0aGluIHRoZSBjb21ibyBib3guXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDb21ib0JveENvbnRleHRcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGNvbWJvQm94RWxcbiAqIEBwcm9wZXJ0eSB7SFRNTFNlbGVjdEVsZW1lbnR9IHNlbGVjdEVsXG4gKiBAcHJvcGVydHkge0hUTUxJbnB1dEVsZW1lbnR9IGlucHV0RWxcbiAqIEBwcm9wZXJ0eSB7SFRNTFVMaXN0RWxlbWVudH0gbGlzdEVsXG4gKiBAcHJvcGVydHkge0hUTUxEaXZFbGVtZW50fSBzdGF0dXNFbFxuICogQHByb3BlcnR5IHtIVE1MTElFbGVtZW50fSBmb2N1c2VkT3B0aW9uRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTExJRWxlbWVudH0gc2VsZWN0ZWRPcHRpb25FbFxuICogQHByb3BlcnR5IHtIVE1MQnV0dG9uRWxlbWVudH0gdG9nZ2xlTGlzdEJ0bkVsXG4gKiBAcHJvcGVydHkge0hUTUxCdXR0b25FbGVtZW50fSBjbGVhcklucHV0QnRuRWxcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gaXNQcmlzdGluZVxuICogQHByb3BlcnR5IHtib29sZWFufSBkaXNhYmxlRmlsdGVyaW5nXG4gKi9cblxuLyoqXG4gKiBHZXQgYW4gb2JqZWN0IG9mIGVsZW1lbnRzIGJlbG9uZ2luZyBkaXJlY3RseSB0byB0aGUgZ2l2ZW5cbiAqIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGhlIGVsZW1lbnQgd2l0aGluIHRoZSBjb21ibyBib3hcbiAqIEByZXR1cm5zIHtDb21ib0JveENvbnRleHR9IGVsZW1lbnRzXG4gKi9cbmNvbnN0IGdldENvbWJvQm94Q29udGV4dCA9IChlbCkgPT4ge1xuICBjb25zdCBjb21ib0JveEVsID0gZWwuY2xvc2VzdChDT01CT19CT1gpO1xuXG4gIGlmICghY29tYm9Cb3hFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBtaXNzaW5nIG91dGVyICR7Q09NQk9fQk9YfWApO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0RWwgPSBjb21ib0JveEVsLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUKTtcbiAgY29uc3QgaW5wdXRFbCA9IGNvbWJvQm94RWwucXVlcnlTZWxlY3RvcihJTlBVVCk7XG4gIGNvbnN0IGxpc3RFbCA9IGNvbWJvQm94RWwucXVlcnlTZWxlY3RvcihMSVNUKTtcbiAgY29uc3Qgc3RhdHVzRWwgPSBjb21ib0JveEVsLnF1ZXJ5U2VsZWN0b3IoU1RBVFVTKTtcbiAgY29uc3QgZm9jdXNlZE9wdGlvbkVsID0gY29tYm9Cb3hFbC5xdWVyeVNlbGVjdG9yKExJU1RfT1BUSU9OX0ZPQ1VTRUQpO1xuICBjb25zdCBzZWxlY3RlZE9wdGlvbkVsID0gY29tYm9Cb3hFbC5xdWVyeVNlbGVjdG9yKExJU1RfT1BUSU9OX1NFTEVDVEVEKTtcbiAgY29uc3QgdG9nZ2xlTGlzdEJ0bkVsID0gY29tYm9Cb3hFbC5xdWVyeVNlbGVjdG9yKFRPR0dMRV9MSVNUX0JVVFRPTik7XG4gIGNvbnN0IGNsZWFySW5wdXRCdG5FbCA9IGNvbWJvQm94RWwucXVlcnlTZWxlY3RvcihDTEVBUl9JTlBVVF9CVVRUT04pO1xuXG4gIGNvbnN0IGlzUHJpc3RpbmUgPSBjb21ib0JveEVsLmNsYXNzTGlzdC5jb250YWlucyhDT01CT19CT1hfUFJJU1RJTkVfQ0xBU1MpO1xuICBjb25zdCBkaXNhYmxlRmlsdGVyaW5nID0gY29tYm9Cb3hFbC5kYXRhc2V0LmRpc2FibGVGaWx0ZXJpbmcgPT09IFwidHJ1ZVwiO1xuXG4gIHJldHVybiB7XG4gICAgY29tYm9Cb3hFbCxcbiAgICBzZWxlY3RFbCxcbiAgICBpbnB1dEVsLFxuICAgIGxpc3RFbCxcbiAgICBzdGF0dXNFbCxcbiAgICBmb2N1c2VkT3B0aW9uRWwsXG4gICAgc2VsZWN0ZWRPcHRpb25FbCxcbiAgICB0b2dnbGVMaXN0QnRuRWwsXG4gICAgY2xlYXJJbnB1dEJ0bkVsLFxuICAgIGlzUHJpc3RpbmUsXG4gICAgZGlzYWJsZUZpbHRlcmluZyxcbiAgfTtcbn07XG5cbi8qKlxuICogRGlzYWJsZSB0aGUgY29tYm8tYm94IGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgZGlzYWJsZSA9IChlbCkgPT4ge1xuICBjb25zdCB7IGlucHV0RWwsIHRvZ2dsZUxpc3RCdG5FbCwgY2xlYXJJbnB1dEJ0bkVsIH0gPSBnZXRDb21ib0JveENvbnRleHQoZWwpO1xuXG4gIGNsZWFySW5wdXRCdG5FbC5oaWRkZW4gPSB0cnVlO1xuICBjbGVhcklucHV0QnRuRWwuZGlzYWJsZWQgPSB0cnVlO1xuICB0b2dnbGVMaXN0QnRuRWwuZGlzYWJsZWQgPSB0cnVlO1xuICBpbnB1dEVsLmRpc2FibGVkID0gdHJ1ZTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRoZSBjb21iby1ib3ggY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBlbmFibGUgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBpbnB1dEVsLCB0b2dnbGVMaXN0QnRuRWwsIGNsZWFySW5wdXRCdG5FbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBjbGVhcklucHV0QnRuRWwuaGlkZGVuID0gZmFsc2U7XG4gIGNsZWFySW5wdXRCdG5FbC5kaXNhYmxlZCA9IGZhbHNlO1xuICB0b2dnbGVMaXN0QnRuRWwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgaW5wdXRFbC5kaXNhYmxlZCA9IGZhbHNlO1xufTtcblxuLyoqXG4gKiBFbmhhbmNlIGEgc2VsZWN0IGVsZW1lbnQgaW50byBhIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gX2NvbWJvQm94RWwgVGhlIGluaXRpYWwgZWxlbWVudCBvZiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBlbmhhbmNlQ29tYm9Cb3ggPSAoX2NvbWJvQm94RWwpID0+IHtcbiAgY29uc3QgY29tYm9Cb3hFbCA9IF9jb21ib0JveEVsLmNsb3Nlc3QoQ09NQk9fQk9YKTtcblxuICBpZiAoY29tYm9Cb3hFbC5kYXRhc2V0LmVuaGFuY2VkKSByZXR1cm47XG5cbiAgY29uc3Qgc2VsZWN0RWwgPSBjb21ib0JveEVsLnF1ZXJ5U2VsZWN0b3IoXCJzZWxlY3RcIik7XG5cbiAgaWYgKCFzZWxlY3RFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtDT01CT19CT1h9IGlzIG1pc3NpbmcgaW5uZXIgc2VsZWN0YCk7XG4gIH1cblxuICBjb25zdCBzZWxlY3RJZCA9IHNlbGVjdEVsLmlkO1xuICBjb25zdCBzZWxlY3RMYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGxhYmVsW2Zvcj1cIiR7c2VsZWN0SWR9XCJdYCk7XG4gIGNvbnN0IGxpc3RJZCA9IGAke3NlbGVjdElkfS0tbGlzdGA7XG4gIGNvbnN0IGxpc3RJZExhYmVsID0gYCR7c2VsZWN0SWR9LWxhYmVsYDtcbiAgY29uc3QgYXNzaXN0aXZlSGludElEID0gYCR7c2VsZWN0SWR9LS1hc3Npc3RpdmVIaW50YDtcbiAgY29uc3QgYWRkaXRpb25hbEF0dHJpYnV0ZXMgPSBbXTtcbiAgY29uc3QgeyBkZWZhdWx0VmFsdWUgfSA9IGNvbWJvQm94RWwuZGF0YXNldDtcbiAgY29uc3QgeyBwbGFjZWhvbGRlciB9ID0gY29tYm9Cb3hFbC5kYXRhc2V0O1xuICBsZXQgc2VsZWN0ZWRPcHRpb247XG5cbiAgaWYgKHBsYWNlaG9sZGVyKSB7XG4gICAgYWRkaXRpb25hbEF0dHJpYnV0ZXMucHVzaCh7IHBsYWNlaG9sZGVyIH0pO1xuICB9XG5cbiAgaWYgKGRlZmF1bHRWYWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzZWxlY3RFbC5vcHRpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICBjb25zdCBvcHRpb25FbCA9IHNlbGVjdEVsLm9wdGlvbnNbaV07XG5cbiAgICAgIGlmIChvcHRpb25FbC52YWx1ZSA9PT0gZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgIHNlbGVjdGVkT3B0aW9uID0gb3B0aW9uRWw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvdyBlcnJvciBpZiBjb21ib2JveCBpcyBtaXNzaW5nIGEgbGFiZWwgb3IgbGFiZWwgaXMgbWlzc2luZ1xuICAgKiBgZm9yYCBhdHRyaWJ1dGUuIE90aGVyd2lzZSwgc2V0IHRoZSBJRCB0byBtYXRjaCB0aGUgPHVsPiBhcmlhLWxhYmVsbGVkYnlcbiAgICovXG4gIGlmICghc2VsZWN0TGFiZWwgfHwgIXNlbGVjdExhYmVsLm1hdGNoZXMoYGxhYmVsW2Zvcj1cIiR7c2VsZWN0SWR9XCJdYCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgJHtDT01CT19CT1h9IGZvciAke3NlbGVjdElkfSBpcyBlaXRoZXIgbWlzc2luZyBhIGxhYmVsIG9yIGEgXCJmb3JcIiBhdHRyaWJ1dGVgXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxlY3RMYWJlbC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBsaXN0SWRMYWJlbCk7XG4gIH1cblxuICBzZWxlY3RMYWJlbC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBsaXN0SWRMYWJlbCk7XG4gIHNlbGVjdEVsLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgc2VsZWN0RWwuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKTtcbiAgc2VsZWN0RWwuY2xhc3NMaXN0LmFkZChcInVzYS1zci1vbmx5XCIsIFNFTEVDVF9DTEFTUyk7XG4gIHNlbGVjdEVsLmlkID0gXCJcIjtcbiAgc2VsZWN0RWwudmFsdWUgPSBcIlwiO1xuXG4gIFtcInJlcXVpcmVkXCIsIFwiYXJpYS1sYWJlbFwiLCBcImFyaWEtbGFiZWxsZWRieVwiXS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgaWYgKHNlbGVjdEVsLmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBzZWxlY3RFbC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgICBhZGRpdGlvbmFsQXR0cmlidXRlcy5wdXNoKHsgW25hbWVdOiB2YWx1ZSB9KTtcbiAgICAgIHNlbGVjdEVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHNhbml0aXplIGRvZXNuJ3QgbGlrZSBmdW5jdGlvbnMgaW4gdGVtcGxhdGUgbGl0ZXJhbHNcbiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIHNlbGVjdElkKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXJpYS1vd25zXCIsIGxpc3RJZCk7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImFyaWEtY29udHJvbHNcIiwgbGlzdElkKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXJpYS1hdXRvY29tcGxldGVcIiwgXCJsaXN0XCIpO1xuICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWRlc2NyaWJlZGJ5XCIsIGFzc2lzdGl2ZUhpbnRJRCk7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXV0b2NhcGl0YWxpemVcIiwgXCJvZmZcIik7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImF1dG9jb21wbGV0ZVwiLCBcIm9mZlwiKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgSU5QVVRfQ0xBU1MpO1xuICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dFwiKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwicm9sZVwiLCBcImNvbWJvYm94XCIpO1xuICBhZGRpdGlvbmFsQXR0cmlidXRlcy5mb3JFYWNoKChhdHRyKSA9PlxuICAgIE9iamVjdC5rZXlzKGF0dHIpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGAke2F0dHJba2V5XX1gO1xuICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgIH0pXG4gICk7XG5cbiAgY29tYm9Cb3hFbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgaW5wdXQpO1xuXG4gIGNvbWJvQm94RWwuaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgIFwiYmVmb3JlZW5kXCIsXG4gICAgU2FuaXRpemVyLmVzY2FwZUhUTUxgXG4gICAgPHNwYW4gY2xhc3M9XCIke0NMRUFSX0lOUFVUX0JVVFRPTl9XUkFQUEVSX0NMQVNTfVwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCIke0NMRUFSX0lOUFVUX0JVVFRPTl9DTEFTU31cIiBhcmlhLWxhYmVsPVwiQ2xlYXIgdGhlIHNlbGVjdCBjb250ZW50c1wiPiZuYnNwOzwvYnV0dG9uPlxuICAgICAgPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCIke0lOUFVUX0JVVFRPTl9TRVBBUkFUT1JfQ0xBU1N9XCI+Jm5ic3A7PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCIke1RPR0dMRV9MSVNUX0JVVFRPTl9XUkFQUEVSX0NMQVNTfVwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCItMVwiIGNsYXNzPVwiJHtUT0dHTEVfTElTVF9CVVRUT05fQ0xBU1N9XCIgYXJpYS1sYWJlbD1cIlRvZ2dsZSB0aGUgZHJvcGRvd24gbGlzdFwiPiZuYnNwOzwvYnV0dG9uPlxuICAgICAgPC9zcGFuPlxuICAgICAgPHVsXG4gICAgICAgIHRhYmluZGV4PVwiLTFcIlxuICAgICAgICBpZD1cIiR7bGlzdElkfVwiXG4gICAgICAgIGNsYXNzPVwiJHtMSVNUX0NMQVNTfVwiXG4gICAgICAgIHJvbGU9XCJsaXN0Ym94XCJcbiAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwiJHtsaXN0SWRMYWJlbH1cIlxuICAgICAgICBoaWRkZW4+XG4gICAgICA8L3VsPlxuICAgICAgPGRpdiBjbGFzcz1cIiR7U1RBVFVTX0NMQVNTfSB1c2Etc3Itb25seVwiIHJvbGU9XCJzdGF0dXNcIj48L2Rpdj5cbiAgICAgIDxzcGFuIGlkPVwiJHthc3Npc3RpdmVIaW50SUR9XCIgY2xhc3M9XCJ1c2Etc3Itb25seVwiPlxuICAgICAgICBXaGVuIGF1dG9jb21wbGV0ZSByZXN1bHRzIGFyZSBhdmFpbGFibGUgdXNlIHVwIGFuZCBkb3duIGFycm93cyB0byByZXZpZXcgYW5kIGVudGVyIHRvIHNlbGVjdC5cbiAgICAgICAgVG91Y2ggZGV2aWNlIHVzZXJzLCBleHBsb3JlIGJ5IHRvdWNoIG9yIHdpdGggc3dpcGUgZ2VzdHVyZXMuXG4gICAgICA8L3NwYW4+YFxuICApO1xuXG4gIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgIGNvbnN0IHsgaW5wdXRFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGNvbWJvQm94RWwpO1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShzZWxlY3RFbCwgc2VsZWN0ZWRPcHRpb24udmFsdWUpO1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnB1dEVsLCBzZWxlY3RlZE9wdGlvbi50ZXh0KTtcbiAgICBjb21ib0JveEVsLmNsYXNzTGlzdC5hZGQoQ09NQk9fQk9YX1BSSVNUSU5FX0NMQVNTKTtcbiAgfVxuXG4gIGlmIChzZWxlY3RFbC5kaXNhYmxlZCkge1xuICAgIGRpc2FibGUoY29tYm9Cb3hFbCk7XG4gICAgc2VsZWN0RWwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbWJvQm94RWwuZGF0YXNldC5lbmhhbmNlZCA9IFwidHJ1ZVwiO1xufTtcblxuLyoqXG4gKiBNYW5hZ2UgdGhlIGZvY3VzZWQgZWxlbWVudCB3aXRoaW4gdGhlIGxpc3Qgb3B0aW9ucyB3aGVuXG4gKiBuYXZpZ2F0aW5nIHZpYSBrZXlib2FyZC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBhbmNob3IgZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG5leHRFbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb3B0aW9uc1xuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNraXBGb2N1cyBza2lwIGZvY3VzIG9mIGhpZ2hsaWdodGVkIGl0ZW1cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5wcmV2ZW50U2Nyb2xsIHNob3VsZCBza2lwIHByb2NlZHVyZSB0byBzY3JvbGwgdG8gZWxlbWVudFxuICovXG5jb25zdCBoaWdobGlnaHRPcHRpb24gPSAoZWwsIG5leHRFbCwgeyBza2lwRm9jdXMsIHByZXZlbnRTY3JvbGwgfSA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgaW5wdXRFbCwgbGlzdEVsLCBmb2N1c2VkT3B0aW9uRWwgfSA9IGdldENvbWJvQm94Q29udGV4dChlbCk7XG5cbiAgaWYgKGZvY3VzZWRPcHRpb25FbCkge1xuICAgIGZvY3VzZWRPcHRpb25FbC5jbGFzc0xpc3QucmVtb3ZlKExJU1RfT1BUSU9OX0ZPQ1VTRURfQ0xBU1MpO1xuICAgIGZvY3VzZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoXCJ0YWJJbmRleFwiLCBcIi0xXCIpO1xuICB9XG5cbiAgaWYgKG5leHRFbCkge1xuICAgIGlucHV0RWwuc2V0QXR0cmlidXRlKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsIG5leHRFbC5pZCk7XG4gICAgbmV4dEVsLnNldEF0dHJpYnV0ZShcInRhYkluZGV4XCIsIFwiMFwiKTtcbiAgICBuZXh0RWwuY2xhc3NMaXN0LmFkZChMSVNUX09QVElPTl9GT0NVU0VEX0NMQVNTKTtcblxuICAgIGlmICghcHJldmVudFNjcm9sbCkge1xuICAgICAgY29uc3Qgb3B0aW9uQm90dG9tID0gbmV4dEVsLm9mZnNldFRvcCArIG5leHRFbC5vZmZzZXRIZWlnaHQ7XG4gICAgICBjb25zdCBjdXJyZW50Qm90dG9tID0gbGlzdEVsLnNjcm9sbFRvcCArIGxpc3RFbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgIGlmIChvcHRpb25Cb3R0b20gPiBjdXJyZW50Qm90dG9tKSB7XG4gICAgICAgIGxpc3RFbC5zY3JvbGxUb3AgPSBvcHRpb25Cb3R0b20gLSBsaXN0RWwub2Zmc2V0SGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBpZiAobmV4dEVsLm9mZnNldFRvcCA8IGxpc3RFbC5zY3JvbGxUb3ApIHtcbiAgICAgICAgbGlzdEVsLnNjcm9sbFRvcCA9IG5leHRFbC5vZmZzZXRUb3A7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFza2lwRm9jdXMpIHtcbiAgICAgIG5leHRFbC5mb2N1cyh7IHByZXZlbnRTY3JvbGwgfSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlucHV0RWwuc2V0QXR0cmlidXRlKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsIFwiXCIpO1xuICAgIGlucHV0RWwuZm9jdXMoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIGR5bmFtaWMgcmVndWxhciBleHByZXNzaW9uIGJhc2VkIG9mZiBvZiBhIHJlcGxhY2VhYmxlIGFuZCBwb3NzaWJseSBmaWx0ZXJlZCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeSBUaGUgdmFsdWUgdG8gdXNlIGluIHRoZSByZWd1bGFyIGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBleHRyYXMgQW4gb2JqZWN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gcmVwbGFjZSBhbmQgZmlsdGVyIHRoZSBxdWVyeVxuICovXG5jb25zdCBnZW5lcmF0ZUR5bmFtaWNSZWdFeHAgPSAoZmlsdGVyLCBxdWVyeSA9IFwiXCIsIGV4dHJhcyA9IHt9KSA9PiB7XG4gIGNvbnN0IGVzY2FwZVJlZ0V4cCA9ICh0ZXh0KSA9PlxuICAgIHRleHQucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpO1xuXG4gIGxldCBmaW5kID0gZmlsdGVyLnJlcGxhY2UoL3t7KC4qPyl9fS9nLCAobSwgJDEpID0+IHtcbiAgICBjb25zdCBrZXkgPSAkMS50cmltKCk7XG4gICAgY29uc3QgcXVlcnlGaWx0ZXIgPSBleHRyYXNba2V5XTtcbiAgICBpZiAoa2V5ICE9PSBcInF1ZXJ5XCIgJiYgcXVlcnlGaWx0ZXIpIHtcbiAgICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgUmVnRXhwKHF1ZXJ5RmlsdGVyLCBcImlcIik7XG4gICAgICBjb25zdCBtYXRjaGVzID0gcXVlcnkubWF0Y2gobWF0Y2hlcik7XG5cbiAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIHJldHVybiBlc2NhcGVSZWdFeHAobWF0Y2hlc1sxXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gZXNjYXBlUmVnRXhwKHF1ZXJ5KTtcbiAgfSk7XG5cbiAgZmluZCA9IGBeKD86JHtmaW5kfSkkYDtcblxuICByZXR1cm4gbmV3IFJlZ0V4cChmaW5kLCBcImlcIik7XG59O1xuXG4vKipcbiAqIERpc3BsYXkgdGhlIG9wdGlvbiBsaXN0IG9mIGEgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBkaXNwbGF5TGlzdCA9IChlbCkgPT4ge1xuICBjb25zdCB7XG4gICAgY29tYm9Cb3hFbCxcbiAgICBzZWxlY3RFbCxcbiAgICBpbnB1dEVsLFxuICAgIGxpc3RFbCxcbiAgICBzdGF0dXNFbCxcbiAgICBpc1ByaXN0aW5lLFxuICAgIGRpc2FibGVGaWx0ZXJpbmcsXG4gIH0gPSBnZXRDb21ib0JveENvbnRleHQoZWwpO1xuICBsZXQgc2VsZWN0ZWRJdGVtSWQ7XG4gIGxldCBmaXJzdEZvdW5kSWQ7XG5cbiAgY29uc3QgbGlzdE9wdGlvbkJhc2VJZCA9IGAke2xpc3RFbC5pZH0tLW9wdGlvbi1gO1xuXG4gIGNvbnN0IGlucHV0VmFsdWUgPSAoaW5wdXRFbC52YWx1ZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBmaWx0ZXIgPSBjb21ib0JveEVsLmRhdGFzZXQuZmlsdGVyIHx8IERFRkFVTFRfRklMVEVSO1xuICBjb25zdCByZWdleCA9IGdlbmVyYXRlRHluYW1pY1JlZ0V4cChmaWx0ZXIsIGlucHV0VmFsdWUsIGNvbWJvQm94RWwuZGF0YXNldCk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IFtdO1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2VsZWN0RWwub3B0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgIGNvbnN0IG9wdGlvbkVsID0gc2VsZWN0RWwub3B0aW9uc1tpXTtcbiAgICBjb25zdCBvcHRpb25JZCA9IGAke2xpc3RPcHRpb25CYXNlSWR9JHtvcHRpb25zLmxlbmd0aH1gO1xuXG4gICAgaWYgKFxuICAgICAgb3B0aW9uRWwudmFsdWUgJiZcbiAgICAgIChkaXNhYmxlRmlsdGVyaW5nIHx8XG4gICAgICAgIGlzUHJpc3RpbmUgfHxcbiAgICAgICAgIWlucHV0VmFsdWUgfHxcbiAgICAgICAgcmVnZXgudGVzdChvcHRpb25FbC50ZXh0KSlcbiAgICApIHtcbiAgICAgIGlmIChzZWxlY3RFbC52YWx1ZSAmJiBvcHRpb25FbC52YWx1ZSA9PT0gc2VsZWN0RWwudmFsdWUpIHtcbiAgICAgICAgc2VsZWN0ZWRJdGVtSWQgPSBvcHRpb25JZDtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpc2FibGVGaWx0ZXJpbmcgJiYgIWZpcnN0Rm91bmRJZCAmJiByZWdleC50ZXN0KG9wdGlvbkVsLnRleHQpKSB7XG4gICAgICAgIGZpcnN0Rm91bmRJZCA9IG9wdGlvbklkO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5wdXNoKG9wdGlvbkVsKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1PcHRpb25zID0gb3B0aW9ucy5sZW5ndGg7XG4gIGNvbnN0IG9wdGlvbkh0bWwgPSBvcHRpb25zLm1hcCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbklkID0gYCR7bGlzdE9wdGlvbkJhc2VJZH0ke2luZGV4fWA7XG4gICAgY29uc3QgY2xhc3NlcyA9IFtMSVNUX09QVElPTl9DTEFTU107XG4gICAgbGV0IHRhYmluZGV4ID0gXCItMVwiO1xuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSBcImZhbHNlXCI7XG5cbiAgICBpZiAob3B0aW9uSWQgPT09IHNlbGVjdGVkSXRlbUlkKSB7XG4gICAgICBjbGFzc2VzLnB1c2goTElTVF9PUFRJT05fU0VMRUNURURfQ0xBU1MsIExJU1RfT1BUSU9OX0ZPQ1VTRURfQ0xBU1MpO1xuICAgICAgdGFiaW5kZXggPSBcIjBcIjtcbiAgICAgIGFyaWFTZWxlY3RlZCA9IFwidHJ1ZVwiO1xuICAgIH1cblxuICAgIGlmICghc2VsZWN0ZWRJdGVtSWQgJiYgaW5kZXggPT09IDApIHtcbiAgICAgIGNsYXNzZXMucHVzaChMSVNUX09QVElPTl9GT0NVU0VEX0NMQVNTKTtcbiAgICAgIHRhYmluZGV4ID0gXCIwXCI7XG4gICAgfVxuXG4gICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG5cbiAgICBsaS5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNldHNpemVcIiwgb3B0aW9ucy5sZW5ndGgpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcImFyaWEtcG9zaW5zZXRcIiwgaW5kZXggKyAxKTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNlbGVjdGVkXCIsIGFyaWFTZWxlY3RlZCk7XG4gICAgbGkuc2V0QXR0cmlidXRlKFwiaWRcIiwgb3B0aW9uSWQpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzZXMuam9pbihcIiBcIikpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRhYmluZGV4KTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwib3B0aW9uXCIpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcImRhdGEtdmFsdWVcIiwgb3B0aW9uLnZhbHVlKTtcbiAgICBsaS50ZXh0Q29udGVudCA9IG9wdGlvbi50ZXh0O1xuXG4gICAgcmV0dXJuIGxpO1xuICB9KTtcblxuICBjb25zdCBub1Jlc3VsdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gIG5vUmVzdWx0cy5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBgJHtMSVNUX09QVElPTl9DTEFTU30tLW5vLXJlc3VsdHNgKTtcbiAgbm9SZXN1bHRzLnRleHRDb250ZW50ID0gXCJObyByZXN1bHRzIGZvdW5kXCI7XG5cbiAgbGlzdEVsLmhpZGRlbiA9IGZhbHNlO1xuXG4gIGlmIChudW1PcHRpb25zKSB7XG4gICAgbGlzdEVsLmlubmVySFRNTCA9IFwiXCI7XG4gICAgb3B0aW9uSHRtbC5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgbGlzdEVsLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCBpdGVtKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgbGlzdEVsLmlubmVySFRNTCA9IFwiXCI7XG4gICAgbGlzdEVsLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCBub1Jlc3VsdHMpO1xuICB9XG5cbiAgaW5wdXRFbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwidHJ1ZVwiKTtcblxuICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IG51bU9wdGlvbnNcbiAgICA/IGAke251bU9wdGlvbnN9IHJlc3VsdCR7bnVtT3B0aW9ucyA+IDEgPyBcInNcIiA6IFwiXCJ9IGF2YWlsYWJsZS5gXG4gICAgOiBcIk5vIHJlc3VsdHMuXCI7XG5cbiAgbGV0IGl0ZW1Ub0ZvY3VzO1xuXG4gIGlmIChpc1ByaXN0aW5lICYmIHNlbGVjdGVkSXRlbUlkKSB7XG4gICAgaXRlbVRvRm9jdXMgPSBsaXN0RWwucXVlcnlTZWxlY3RvcihgIyR7c2VsZWN0ZWRJdGVtSWR9YCk7XG4gIH0gZWxzZSBpZiAoZGlzYWJsZUZpbHRlcmluZyAmJiBmaXJzdEZvdW5kSWQpIHtcbiAgICBpdGVtVG9Gb2N1cyA9IGxpc3RFbC5xdWVyeVNlbGVjdG9yKGAjJHtmaXJzdEZvdW5kSWR9YCk7XG4gIH1cblxuICBpZiAoaXRlbVRvRm9jdXMpIHtcbiAgICBoaWdobGlnaHRPcHRpb24obGlzdEVsLCBpdGVtVG9Gb2N1cywge1xuICAgICAgc2tpcEZvY3VzOiB0cnVlLFxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIG9wdGlvbiBsaXN0IG9mIGEgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoaWRlTGlzdCA9IChlbCkgPT4ge1xuICBjb25zdCB7IGlucHV0RWwsIGxpc3RFbCwgc3RhdHVzRWwsIGZvY3VzZWRPcHRpb25FbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBzdGF0dXNFbC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gIGlucHV0RWwuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcImZhbHNlXCIpO1xuICBpbnB1dEVsLnNldEF0dHJpYnV0ZShcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLCBcIlwiKTtcblxuICBpZiAoZm9jdXNlZE9wdGlvbkVsKSB7XG4gICAgZm9jdXNlZE9wdGlvbkVsLmNsYXNzTGlzdC5yZW1vdmUoTElTVF9PUFRJT05fRk9DVVNFRF9DTEFTUyk7XG4gIH1cblxuICBsaXN0RWwuc2Nyb2xsVG9wID0gMDtcbiAgbGlzdEVsLmhpZGRlbiA9IHRydWU7XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhbiBvcHRpb24gbGlzdCBvZiB0aGUgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBsaXN0T3B0aW9uRWwgVGhlIGxpc3Qgb3B0aW9uIGJlaW5nIHNlbGVjdGVkXG4gKi9cbmNvbnN0IHNlbGVjdEl0ZW0gPSAobGlzdE9wdGlvbkVsKSA9PiB7XG4gIGNvbnN0IHsgY29tYm9Cb3hFbCwgc2VsZWN0RWwsIGlucHV0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChsaXN0T3B0aW9uRWwpO1xuXG4gIGNoYW5nZUVsZW1lbnRWYWx1ZShzZWxlY3RFbCwgbGlzdE9wdGlvbkVsLmRhdGFzZXQudmFsdWUpO1xuICBjaGFuZ2VFbGVtZW50VmFsdWUoaW5wdXRFbCwgbGlzdE9wdGlvbkVsLnRleHRDb250ZW50KTtcbiAgY29tYm9Cb3hFbC5jbGFzc0xpc3QuYWRkKENPTUJPX0JPWF9QUklTVElORV9DTEFTUyk7XG4gIGhpZGVMaXN0KGNvbWJvQm94RWwpO1xuICBpbnB1dEVsLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIENsZWFyIHRoZSBpbnB1dCBvZiB0aGUgY29tYm8gYm94XG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gY2xlYXJCdXR0b25FbCBUaGUgY2xlYXIgaW5wdXQgYnV0dG9uXG4gKi9cbmNvbnN0IGNsZWFySW5wdXQgPSAoY2xlYXJCdXR0b25FbCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCwgc2VsZWN0RWwsIGlucHV0RWwgfSA9XG4gICAgZ2V0Q29tYm9Cb3hDb250ZXh0KGNsZWFyQnV0dG9uRWwpO1xuICBjb25zdCBsaXN0U2hvd24gPSAhbGlzdEVsLmhpZGRlbjtcblxuICBpZiAoc2VsZWN0RWwudmFsdWUpIGNoYW5nZUVsZW1lbnRWYWx1ZShzZWxlY3RFbCk7XG4gIGlmIChpbnB1dEVsLnZhbHVlKSBjaGFuZ2VFbGVtZW50VmFsdWUoaW5wdXRFbCk7XG4gIGNvbWJvQm94RWwuY2xhc3NMaXN0LnJlbW92ZShDT01CT19CT1hfUFJJU1RJTkVfQ0xBU1MpO1xuXG4gIGlmIChsaXN0U2hvd24pIGRpc3BsYXlMaXN0KGNvbWJvQm94RWwpO1xuICBpbnB1dEVsLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBzZWxlY3QgYmFzZWQgb2ZmIG9mIGN1cnJlbnRseSBzZXQgc2VsZWN0IHZhbHVlXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgcmVzZXRTZWxlY3Rpb24gPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBzZWxlY3RFbCwgaW5wdXRFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBjb25zdCBzZWxlY3RWYWx1ZSA9IHNlbGVjdEVsLnZhbHVlO1xuICBjb25zdCBpbnB1dFZhbHVlID0gKGlucHV0RWwudmFsdWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcblxuICBpZiAoc2VsZWN0VmFsdWUpIHtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2VsZWN0RWwub3B0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgY29uc3Qgb3B0aW9uRWwgPSBzZWxlY3RFbC5vcHRpb25zW2ldO1xuICAgICAgaWYgKG9wdGlvbkVsLnZhbHVlID09PSBzZWxlY3RWYWx1ZSkge1xuICAgICAgICBpZiAoaW5wdXRWYWx1ZSAhPT0gb3B0aW9uRWwudGV4dCkge1xuICAgICAgICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnB1dEVsLCBvcHRpb25FbC50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjb21ib0JveEVsLmNsYXNzTGlzdC5hZGQoQ09NQk9fQk9YX1BSSVNUSU5FX0NMQVNTKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbnB1dFZhbHVlKSB7XG4gICAgY2hhbmdlRWxlbWVudFZhbHVlKGlucHV0RWwpO1xuICB9XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhbiBvcHRpb24gbGlzdCBvZiB0aGUgY29tYm8gYm94IGNvbXBvbmVudCBiYXNlZCBvZmYgb2ZcbiAqIGhhdmluZyBhIGN1cnJlbnQgZm9jdXNlZCBsaXN0IG9wdGlvbiBvclxuICogaGF2aW5nIHRlc3QgdGhhdCBjb21wbGV0ZWx5IG1hdGNoZXMgYSBsaXN0IG9wdGlvbi5cbiAqIE90aGVyd2lzZSBpdCBjbGVhcnMgdGhlIGlucHV0IGFuZCBzZWxlY3QuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgY29tcGxldGVTZWxlY3Rpb24gPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBzZWxlY3RFbCwgaW5wdXRFbCwgc3RhdHVzRWwgfSA9IGdldENvbWJvQm94Q29udGV4dChlbCk7XG5cbiAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBcIlwiO1xuXG4gIGNvbnN0IGlucHV0VmFsdWUgPSAoaW5wdXRFbC52YWx1ZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmIChpbnB1dFZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHNlbGVjdEVsLm9wdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IG9wdGlvbkVsID0gc2VsZWN0RWwub3B0aW9uc1tpXTtcbiAgICAgIGlmIChvcHRpb25FbC50ZXh0LnRvTG93ZXJDYXNlKCkgPT09IGlucHV0VmFsdWUpIHtcbiAgICAgICAgY2hhbmdlRWxlbWVudFZhbHVlKHNlbGVjdEVsLCBvcHRpb25FbC52YWx1ZSk7XG4gICAgICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnB1dEVsLCBvcHRpb25FbC50ZXh0KTtcbiAgICAgICAgY29tYm9Cb3hFbC5jbGFzc0xpc3QuYWRkKENPTUJPX0JPWF9QUklTVElORV9DTEFTUyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNldFNlbGVjdGlvbihjb21ib0JveEVsKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSBlc2NhcGUgZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgQW4gZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50XG4gKi9cbmNvbnN0IGhhbmRsZUVzY2FwZSA9IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGlucHV0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChldmVudC50YXJnZXQpO1xuXG4gIGhpZGVMaXN0KGNvbWJvQm94RWwpO1xuICByZXNldFNlbGVjdGlvbihjb21ib0JveEVsKTtcbiAgaW5wdXRFbC5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgdGhlIGRvd24gZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgQW4gZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50XG4gKi9cbmNvbnN0IGhhbmRsZURvd25Gcm9tSW5wdXQgPSAoZXZlbnQpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBsaXN0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChldmVudC50YXJnZXQpO1xuXG4gIGlmIChsaXN0RWwuaGlkZGVuKSB7XG4gICAgZGlzcGxheUxpc3QoY29tYm9Cb3hFbCk7XG4gIH1cblxuICBjb25zdCBuZXh0T3B0aW9uRWwgPVxuICAgIGxpc3RFbC5xdWVyeVNlbGVjdG9yKExJU1RfT1BUSU9OX0ZPQ1VTRUQpIHx8XG4gICAgbGlzdEVsLnF1ZXJ5U2VsZWN0b3IoTElTVF9PUFRJT04pO1xuXG4gIGlmIChuZXh0T3B0aW9uRWwpIHtcbiAgICBoaWdobGlnaHRPcHRpb24oY29tYm9Cb3hFbCwgbmV4dE9wdGlvbkVsKTtcbiAgfVxuXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgZW50ZXIgZXZlbnQgZnJvbSBhbiBpbnB1dCBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IEFuIGV2ZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVFbnRlckZyb21JbnB1dCA9IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGV2ZW50LnRhcmdldCk7XG4gIGNvbnN0IGxpc3RTaG93biA9ICFsaXN0RWwuaGlkZGVuO1xuXG4gIGNvbXBsZXRlU2VsZWN0aW9uKGNvbWJvQm94RWwpO1xuXG4gIGlmIChsaXN0U2hvd24pIHtcbiAgICBoaWRlTGlzdChjb21ib0JveEVsKTtcbiAgfVxuXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgZG93biBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCBBbiBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlRG93bkZyb21MaXN0T3B0aW9uID0gKGV2ZW50KSA9PiB7XG4gIGNvbnN0IGZvY3VzZWRPcHRpb25FbCA9IGV2ZW50LnRhcmdldDtcbiAgY29uc3QgbmV4dE9wdGlvbkVsID0gZm9jdXNlZE9wdGlvbkVsLm5leHRTaWJsaW5nO1xuXG4gIGlmIChuZXh0T3B0aW9uRWwpIHtcbiAgICBoaWdobGlnaHRPcHRpb24oZm9jdXNlZE9wdGlvbkVsLCBuZXh0T3B0aW9uRWwpO1xuICB9XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSB0YWIgZXZlbnQgZnJvbSBhbiBsaXN0IG9wdGlvbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IEFuIGV2ZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVUYWJGcm9tTGlzdE9wdGlvbiA9IChldmVudCkgPT4ge1xuICBzZWxlY3RJdGVtKGV2ZW50LnRhcmdldCk7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgZW50ZXIgZXZlbnQgZnJvbSBsaXN0IG9wdGlvbiB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCBBbiBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlRW50ZXJGcm9tTGlzdE9wdGlvbiA9IChldmVudCkgPT4ge1xuICBzZWxlY3RJdGVtKGV2ZW50LnRhcmdldCk7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdXAgZXZlbnQgZnJvbSBsaXN0IG9wdGlvbiB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCBBbiBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlVXBGcm9tTGlzdE9wdGlvbiA9IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCwgZm9jdXNlZE9wdGlvbkVsIH0gPSBnZXRDb21ib0JveENvbnRleHQoXG4gICAgZXZlbnQudGFyZ2V0XG4gICk7XG4gIGNvbnN0IG5leHRPcHRpb25FbCA9IGZvY3VzZWRPcHRpb25FbCAmJiBmb2N1c2VkT3B0aW9uRWwucHJldmlvdXNTaWJsaW5nO1xuICBjb25zdCBsaXN0U2hvd24gPSAhbGlzdEVsLmhpZGRlbjtcblxuICBoaWdobGlnaHRPcHRpb24oY29tYm9Cb3hFbCwgbmV4dE9wdGlvbkVsKTtcblxuICBpZiAobGlzdFNob3duKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIGlmICghbmV4dE9wdGlvbkVsKSB7XG4gICAgaGlkZUxpc3QoY29tYm9Cb3hFbCk7XG4gIH1cbn07XG5cbi8qKlxuICogU2VsZWN0IGxpc3Qgb3B0aW9uIG9uIHRoZSBtb3VzZW92ZXIgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudCBUaGUgbW91c2VvdmVyIGV2ZW50XG4gKiBAcGFyYW0ge0hUTUxMSUVsZW1lbnR9IGxpc3RPcHRpb25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVNb3VzZW92ZXIgPSAobGlzdE9wdGlvbkVsKSA9PiB7XG4gIGNvbnN0IGlzQ3VycmVudGx5Rm9jdXNlZCA9IGxpc3RPcHRpb25FbC5jbGFzc0xpc3QuY29udGFpbnMoXG4gICAgTElTVF9PUFRJT05fRk9DVVNFRF9DTEFTU1xuICApO1xuXG4gIGlmIChpc0N1cnJlbnRseUZvY3VzZWQpIHJldHVybjtcblxuICBoaWdobGlnaHRPcHRpb24obGlzdE9wdGlvbkVsLCBsaXN0T3B0aW9uRWwsIHtcbiAgICBwcmV2ZW50U2Nyb2xsOiB0cnVlLFxuICB9KTtcbn07XG5cbi8qKlxuICogVG9nZ2xlIHRoZSBsaXN0IHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgdG9nZ2xlTGlzdCA9IChlbCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCwgaW5wdXRFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBpZiAobGlzdEVsLmhpZGRlbikge1xuICAgIGRpc3BsYXlMaXN0KGNvbWJvQm94RWwpO1xuICB9IGVsc2Uge1xuICAgIGhpZGVMaXN0KGNvbWJvQm94RWwpO1xuICB9XG5cbiAgaW5wdXRFbC5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgY2xpY2sgZnJvbSBpbnB1dFxuICpcbiAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlQ2xpY2tGcm9tSW5wdXQgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBsaXN0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChlbCk7XG5cbiAgaWYgKGxpc3RFbC5oaWRkZW4pIHtcbiAgICBkaXNwbGF5TGlzdChjb21ib0JveEVsKTtcbiAgfVxufTtcblxuY29uc3QgY29tYm9Cb3ggPSBiZWhhdmlvcihcbiAge1xuICAgIFtDTElDS106IHtcbiAgICAgIFtJTlBVVF0oKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIGhhbmRsZUNsaWNrRnJvbUlucHV0KHRoaXMpO1xuICAgICAgfSxcbiAgICAgIFtUT0dHTEVfTElTVF9CVVRUT05dKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0b2dnbGVMaXN0KHRoaXMpO1xuICAgICAgfSxcbiAgICAgIFtMSVNUX09QVElPTl0oKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHNlbGVjdEl0ZW0odGhpcyk7XG4gICAgICB9LFxuICAgICAgW0NMRUFSX0lOUFVUX0JVVFRPTl0oKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIGNsZWFySW5wdXQodGhpcyk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZm9jdXNvdXQ6IHtcbiAgICAgIFtDT01CT19CT1hdKGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICAgIHJlc2V0U2VsZWN0aW9uKHRoaXMpO1xuICAgICAgICAgIGhpZGVMaXN0KHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAga2V5ZG93bjoge1xuICAgICAgW0NPTUJPX0JPWF06IGtleW1hcCh7XG4gICAgICAgIEVzY2FwZTogaGFuZGxlRXNjYXBlLFxuICAgICAgfSksXG4gICAgICBbSU5QVVRdOiBrZXltYXAoe1xuICAgICAgICBFbnRlcjogaGFuZGxlRW50ZXJGcm9tSW5wdXQsXG4gICAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21JbnB1dCxcbiAgICAgICAgRG93bjogaGFuZGxlRG93bkZyb21JbnB1dCxcbiAgICAgIH0pLFxuICAgICAgW0xJU1RfT1BUSU9OXToga2V5bWFwKHtcbiAgICAgICAgQXJyb3dVcDogaGFuZGxlVXBGcm9tTGlzdE9wdGlvbixcbiAgICAgICAgVXA6IGhhbmRsZVVwRnJvbUxpc3RPcHRpb24sXG4gICAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21MaXN0T3B0aW9uLFxuICAgICAgICBEb3duOiBoYW5kbGVEb3duRnJvbUxpc3RPcHRpb24sXG4gICAgICAgIEVudGVyOiBoYW5kbGVFbnRlckZyb21MaXN0T3B0aW9uLFxuICAgICAgICBUYWI6IGhhbmRsZVRhYkZyb21MaXN0T3B0aW9uLFxuICAgICAgICBcIlNoaWZ0K1RhYlwiOiBub29wLFxuICAgICAgfSksXG4gICAgfSxcbiAgICBpbnB1dDoge1xuICAgICAgW0lOUFVUXSgpIHtcbiAgICAgICAgY29uc3QgY29tYm9Cb3hFbCA9IHRoaXMuY2xvc2VzdChDT01CT19CT1gpO1xuICAgICAgICBjb21ib0JveEVsLmNsYXNzTGlzdC5yZW1vdmUoQ09NQk9fQk9YX1BSSVNUSU5FX0NMQVNTKTtcbiAgICAgICAgZGlzcGxheUxpc3QodGhpcyk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgbW91c2VvdmVyOiB7XG4gICAgICBbTElTVF9PUFRJT05dKCkge1xuICAgICAgICBoYW5kbGVNb3VzZW92ZXIodGhpcyk7XG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpbml0KHJvb3QpIHtcbiAgICAgIHNlbGVjdChDT01CT19CT1gsIHJvb3QpLmZvckVhY2goKGNvbWJvQm94RWwpID0+IHtcbiAgICAgICAgZW5oYW5jZUNvbWJvQm94KGNvbWJvQm94RWwpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRDb21ib0JveENvbnRleHQsXG4gICAgZW5oYW5jZUNvbWJvQm94LFxuICAgIGdlbmVyYXRlRHluYW1pY1JlZ0V4cCxcbiAgICBkaXNhYmxlLFxuICAgIGVuYWJsZSxcbiAgICBkaXNwbGF5TGlzdCxcbiAgICBoaWRlTGlzdCxcbiAgICBDT01CT19CT1hfQ0xBU1MsXG4gIH1cbik7XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYm9Cb3g7XG4iLCJjb25zdCBrZXltYXAgPSByZXF1aXJlKFwicmVjZXB0b3Iva2V5bWFwXCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcbmNvbnN0IHsgQ0xJQ0sgfSA9IHJlcXVpcmUoXCIuLi9ldmVudHNcIik7XG5jb25zdCBhY3RpdmVFbGVtZW50ID0gcmVxdWlyZShcIi4uL3V0aWxzL2FjdGl2ZS1lbGVtZW50XCIpO1xuY29uc3QgaXNJb3NEZXZpY2UgPSByZXF1aXJlKFwiLi4vdXRpbHMvaXMtaW9zLWRldmljZVwiKTtcbmNvbnN0IFNhbml0aXplciA9IHJlcXVpcmUoXCIuLi91dGlscy9zYW5pdGl6ZXJcIik7XG5cbmNvbnN0IERBVEVfUElDS0VSX0NMQVNTID0gYCR7UFJFRklYfS1kYXRlLXBpY2tlcmA7XG5jb25zdCBEQVRFX1BJQ0tFUl9XUkFQUEVSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0xBU1N9X193cmFwcGVyYDtcbmNvbnN0IERBVEVfUElDS0VSX0lOSVRJQUxJWkVEX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0xBU1N9LS1pbml0aWFsaXplZGA7XG5jb25zdCBEQVRFX1BJQ0tFUl9BQ1RJVkVfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DTEFTU30tLWFjdGl2ZWA7XG5jb25zdCBEQVRFX1BJQ0tFUl9JTlRFUk5BTF9JTlBVVF9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NMQVNTfV9faW50ZXJuYWwtaW5wdXRgO1xuY29uc3QgREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DTEFTU31fX2V4dGVybmFsLWlucHV0YDtcbmNvbnN0IERBVEVfUElDS0VSX0JVVFRPTl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NMQVNTfV9fYnV0dG9uYDtcbmNvbnN0IERBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0xBU1N9X19jYWxlbmRhcmA7XG5jb25zdCBEQVRFX1BJQ0tFUl9TVEFUVVNfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DTEFTU31fX3N0YXR1c2A7XG5jb25zdCBDQUxFTkRBUl9EQVRFX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19kYXRlYDtcblxuY29uc3QgQ0FMRU5EQVJfREFURV9GT0NVU0VEX0NMQVNTID0gYCR7Q0FMRU5EQVJfREFURV9DTEFTU30tLWZvY3VzZWRgO1xuY29uc3QgQ0FMRU5EQVJfREFURV9TRUxFQ1RFRF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1zZWxlY3RlZGA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX1BSRVZJT1VTX01PTlRIX0NMQVNTID0gYCR7Q0FMRU5EQVJfREFURV9DTEFTU30tLXByZXZpb3VzLW1vbnRoYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfQ1VSUkVOVF9NT05USF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1jdXJyZW50LW1vbnRoYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfTkVYVF9NT05USF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1uZXh0LW1vbnRoYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfUkFOR0VfREFURV9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1yYW5nZS1kYXRlYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfVE9EQVlfQ0xBU1MgPSBgJHtDQUxFTkRBUl9EQVRFX0NMQVNTfS0tdG9kYXlgO1xuY29uc3QgQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX1NUQVJUX0NMQVNTID0gYCR7Q0FMRU5EQVJfREFURV9DTEFTU30tLXJhbmdlLWRhdGUtc3RhcnRgO1xuY29uc3QgQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX0VORF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1yYW5nZS1kYXRlLWVuZGA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX1dJVEhJTl9SQU5HRV9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS13aXRoaW4tcmFuZ2VgO1xuY29uc3QgQ0FMRU5EQVJfUFJFVklPVVNfWUVBUl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fcHJldmlvdXMteWVhcmA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19NT05USF9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fcHJldmlvdXMtbW9udGhgO1xuY29uc3QgQ0FMRU5EQVJfTkVYVF9ZRUFSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19uZXh0LXllYXJgO1xuY29uc3QgQ0FMRU5EQVJfTkVYVF9NT05USF9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fbmV4dC1tb250aGA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9TRUxFQ1RJT05fQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX21vbnRoLXNlbGVjdGlvbmA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9feWVhci1zZWxlY3Rpb25gO1xuY29uc3QgQ0FMRU5EQVJfTU9OVEhfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX21vbnRoYDtcbmNvbnN0IENBTEVOREFSX01PTlRIX0ZPQ1VTRURfQ0xBU1MgPSBgJHtDQUxFTkRBUl9NT05USF9DTEFTU30tLWZvY3VzZWRgO1xuY29uc3QgQ0FMRU5EQVJfTU9OVEhfU0VMRUNURURfQ0xBU1MgPSBgJHtDQUxFTkRBUl9NT05USF9DTEFTU30tLXNlbGVjdGVkYDtcbmNvbnN0IENBTEVOREFSX1lFQVJfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX3llYXJgO1xuY29uc3QgQ0FMRU5EQVJfWUVBUl9GT0NVU0VEX0NMQVNTID0gYCR7Q0FMRU5EQVJfWUVBUl9DTEFTU30tLWZvY3VzZWRgO1xuY29uc3QgQ0FMRU5EQVJfWUVBUl9TRUxFQ1RFRF9DTEFTUyA9IGAke0NBTEVOREFSX1lFQVJfQ0xBU1N9LS1zZWxlY3RlZGA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19ZRUFSX0NIVU5LX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19wcmV2aW91cy15ZWFyLWNodW5rYDtcbmNvbnN0IENBTEVOREFSX05FWFRfWUVBUl9DSFVOS19DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fbmV4dC15ZWFyLWNodW5rYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfUElDS0VSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19kYXRlLXBpY2tlcmA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9QSUNLRVJfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX21vbnRoLXBpY2tlcmA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX1BJQ0tFUl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9feWVhci1waWNrZXJgO1xuY29uc3QgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX3RhYmxlYDtcbmNvbnN0IENBTEVOREFSX1JPV19DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fcm93YDtcbmNvbnN0IENBTEVOREFSX0NFTExfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX2NlbGxgO1xuY29uc3QgQ0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1MgPSBgJHtDQUxFTkRBUl9DRUxMX0NMQVNTfS0tY2VudGVyLWl0ZW1zYDtcbmNvbnN0IENBTEVOREFSX01PTlRIX0xBQkVMX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19tb250aC1sYWJlbGA7XG5jb25zdCBDQUxFTkRBUl9EQVlfT0ZfV0VFS19DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fZGF5LW9mLXdlZWtgO1xuXG5jb25zdCBEQVRFX1BJQ0tFUiA9IGAuJHtEQVRFX1BJQ0tFUl9DTEFTU31gO1xuY29uc3QgREFURV9QSUNLRVJfQlVUVE9OID0gYC4ke0RBVEVfUElDS0VSX0JVVFRPTl9DTEFTU31gO1xuY29uc3QgREFURV9QSUNLRVJfSU5URVJOQUxfSU5QVVQgPSBgLiR7REFURV9QSUNLRVJfSU5URVJOQUxfSU5QVVRfQ0xBU1N9YDtcbmNvbnN0IERBVEVfUElDS0VSX0VYVEVSTkFMX0lOUFVUID0gYC4ke0RBVEVfUElDS0VSX0VYVEVSTkFMX0lOUFVUX0NMQVNTfWA7XG5jb25zdCBEQVRFX1BJQ0tFUl9DQUxFTkRBUiA9IGAuJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31gO1xuY29uc3QgREFURV9QSUNLRVJfU1RBVFVTID0gYC4ke0RBVEVfUElDS0VSX1NUQVRVU19DTEFTU31gO1xuY29uc3QgQ0FMRU5EQVJfREFURSA9IGAuJHtDQUxFTkRBUl9EQVRFX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX0ZPQ1VTRUQgPSBgLiR7Q0FMRU5EQVJfREFURV9GT0NVU0VEX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX0NVUlJFTlRfTU9OVEggPSBgLiR7Q0FMRU5EQVJfREFURV9DVVJSRU5UX01PTlRIX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19ZRUFSID0gYC4ke0NBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX1BSRVZJT1VTX01PTlRIID0gYC4ke0NBTEVOREFSX1BSRVZJT1VTX01PTlRIX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ORVhUX1lFQVIgPSBgLiR7Q0FMRU5EQVJfTkVYVF9ZRUFSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ORVhUX01PTlRIID0gYC4ke0NBTEVOREFSX05FWFRfTU9OVEhfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX1lFQVJfU0VMRUNUSU9OID0gYC4ke0NBTEVOREFSX1lFQVJfU0VMRUNUSU9OX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9TRUxFQ1RJT04gPSBgLiR7Q0FMRU5EQVJfTU9OVEhfU0VMRUNUSU9OX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9NT05USCA9IGAuJHtDQUxFTkRBUl9NT05USF9DTEFTU31gO1xuY29uc3QgQ0FMRU5EQVJfWUVBUiA9IGAuJHtDQUxFTkRBUl9ZRUFSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19ZRUFSX0NIVU5LID0gYC4ke0NBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0hVTktfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX05FWFRfWUVBUl9DSFVOSyA9IGAuJHtDQUxFTkRBUl9ORVhUX1lFQVJfQ0hVTktfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX0RBVEVfUElDS0VSID0gYC4ke0NBTEVOREFSX0RBVEVfUElDS0VSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9QSUNLRVIgPSBgLiR7Q0FMRU5EQVJfTU9OVEhfUElDS0VSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX1BJQ0tFUiA9IGAuJHtDQUxFTkRBUl9ZRUFSX1BJQ0tFUl9DTEFTU31gO1xuY29uc3QgQ0FMRU5EQVJfTU9OVEhfRk9DVVNFRCA9IGAuJHtDQUxFTkRBUl9NT05USF9GT0NVU0VEX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQgPSBgLiR7Q0FMRU5EQVJfWUVBUl9GT0NVU0VEX0NMQVNTfWA7XG5cbmNvbnN0IFZBTElEQVRJT05fTUVTU0FHRSA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZGF0ZVwiO1xuXG5jb25zdCBNT05USF9MQUJFTFMgPSBbXG4gIFwiSmFudWFyeVwiLFxuICBcIkZlYnJ1YXJ5XCIsXG4gIFwiTWFyY2hcIixcbiAgXCJBcHJpbFwiLFxuICBcIk1heVwiLFxuICBcIkp1bmVcIixcbiAgXCJKdWx5XCIsXG4gIFwiQXVndXN0XCIsXG4gIFwiU2VwdGVtYmVyXCIsXG4gIFwiT2N0b2JlclwiLFxuICBcIk5vdmVtYmVyXCIsXG4gIFwiRGVjZW1iZXJcIixcbl07XG5cbmNvbnN0IERBWV9PRl9XRUVLX0xBQkVMUyA9IFtcbiAgXCJTdW5kYXlcIixcbiAgXCJNb25kYXlcIixcbiAgXCJUdWVzZGF5XCIsXG4gIFwiV2VkbmVzZGF5XCIsXG4gIFwiVGh1cnNkYXlcIixcbiAgXCJGcmlkYXlcIixcbiAgXCJTYXR1cmRheVwiLFxuXTtcblxuY29uc3QgRU5URVJfS0VZQ09ERSA9IDEzO1xuXG5jb25zdCBZRUFSX0NIVU5LID0gMTI7XG5cbmNvbnN0IERFRkFVTFRfTUlOX0RBVEUgPSBcIjAwMDAtMDEtMDFcIjtcbmNvbnN0IERFRkFVTFRfRVhURVJOQUxfREFURV9GT1JNQVQgPSBcIk1NL0REL1lZWVlcIjtcbmNvbnN0IElOVEVSTkFMX0RBVEVfRk9STUFUID0gXCJZWVlZLU1NLUREXCI7XG5cbmNvbnN0IE5PVF9ESVNBQkxFRF9TRUxFQ1RPUiA9IFwiOm5vdChbZGlzYWJsZWRdKVwiO1xuXG5jb25zdCBwcm9jZXNzRm9jdXNhYmxlU2VsZWN0b3JzID0gKC4uLnNlbGVjdG9ycykgPT5cbiAgc2VsZWN0b3JzLm1hcCgocXVlcnkpID0+IHF1ZXJ5ICsgTk9UX0RJU0FCTEVEX1NFTEVDVE9SKS5qb2luKFwiLCBcIik7XG5cbmNvbnN0IERBVEVfUElDS0VSX0ZPQ1VTQUJMRSA9IHByb2Nlc3NGb2N1c2FibGVTZWxlY3RvcnMoXG4gIENBTEVOREFSX1BSRVZJT1VTX1lFQVIsXG4gIENBTEVOREFSX1BSRVZJT1VTX01PTlRILFxuICBDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTixcbiAgQ0FMRU5EQVJfTU9OVEhfU0VMRUNUSU9OLFxuICBDQUxFTkRBUl9ORVhUX1lFQVIsXG4gIENBTEVOREFSX05FWFRfTU9OVEgsXG4gIENBTEVOREFSX0RBVEVfRk9DVVNFRFxuKTtcblxuY29uc3QgTU9OVEhfUElDS0VSX0ZPQ1VTQUJMRSA9IHByb2Nlc3NGb2N1c2FibGVTZWxlY3RvcnMoXG4gIENBTEVOREFSX01PTlRIX0ZPQ1VTRURcbik7XG5cbmNvbnN0IFlFQVJfUElDS0VSX0ZPQ1VTQUJMRSA9IHByb2Nlc3NGb2N1c2FibGVTZWxlY3RvcnMoXG4gIENBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0hVTkssXG4gIENBTEVOREFSX05FWFRfWUVBUl9DSFVOSyxcbiAgQ0FMRU5EQVJfWUVBUl9GT0NVU0VEXG4pO1xuXG4vLyAjcmVnaW9uIERhdGUgTWFuaXB1bGF0aW9uIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEtlZXAgZGF0ZSB3aXRoaW4gbW9udGguIE1vbnRoIHdvdWxkIG9ubHkgYmUgb3ZlciBieSAxIHRvIDMgZGF5c1xuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZVRvQ2hlY2sgdGhlIGRhdGUgb2JqZWN0IHRvIGNoZWNrXG4gKiBAcGFyYW0ge251bWJlcn0gbW9udGggdGhlIGNvcnJlY3QgbW9udGhcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgZGF0ZSwgY29ycmVjdGVkIGlmIG5lZWRlZFxuICovXG5jb25zdCBrZWVwRGF0ZVdpdGhpbk1vbnRoID0gKGRhdGVUb0NoZWNrLCBtb250aCkgPT4ge1xuICBpZiAobW9udGggIT09IGRhdGVUb0NoZWNrLmdldE1vbnRoKCkpIHtcbiAgICBkYXRlVG9DaGVjay5zZXREYXRlKDApO1xuICB9XG5cbiAgcmV0dXJuIGRhdGVUb0NoZWNrO1xufTtcblxuLyoqXG4gKiBTZXQgZGF0ZSBmcm9tIG1vbnRoIGRheSB5ZWFyXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHllYXIgdGhlIHllYXIgdG8gc2V0XG4gKiBAcGFyYW0ge251bWJlcn0gbW9udGggdGhlIG1vbnRoIHRvIHNldCAoemVyby1pbmRleGVkKVxuICogQHBhcmFtIHtudW1iZXJ9IGRhdGUgdGhlIGRhdGUgdG8gc2V0XG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIHNldCBkYXRlXG4gKi9cbmNvbnN0IHNldERhdGUgPSAoeWVhciwgbW9udGgsIGRhdGUpID0+IHtcbiAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKDApO1xuICBuZXdEYXRlLnNldEZ1bGxZZWFyKHllYXIsIG1vbnRoLCBkYXRlKTtcbiAgcmV0dXJuIG5ld0RhdGU7XG59O1xuXG4vKipcbiAqIHRvZGF5cyBkYXRlXG4gKlxuICogQHJldHVybnMge0RhdGV9IHRvZGF5cyBkYXRlXG4gKi9cbmNvbnN0IHRvZGF5ID0gKCkgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoKTtcbiAgY29uc3QgZGF5ID0gbmV3RGF0ZS5nZXREYXRlKCk7XG4gIGNvbnN0IG1vbnRoID0gbmV3RGF0ZS5nZXRNb250aCgpO1xuICBjb25zdCB5ZWFyID0gbmV3RGF0ZS5nZXRGdWxsWWVhcigpO1xuICByZXR1cm4gc2V0RGF0ZSh5ZWFyLCBtb250aCwgZGF5KTtcbn07XG5cbi8qKlxuICogU2V0IGRhdGUgdG8gZmlyc3QgZGF5IG9mIHRoZSBtb250aFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IHN0YXJ0T2ZNb250aCA9IChkYXRlKSA9PiB7XG4gIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgbmV3RGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSk7XG4gIHJldHVybiBuZXdEYXRlO1xufTtcblxuLyoqXG4gKiBTZXQgZGF0ZSB0byBsYXN0IGRheSBvZiB0aGUgbW9udGhcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBsYXN0RGF5T2ZNb250aCA9IChkYXRlKSA9PiB7XG4gIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgbmV3RGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApO1xuICByZXR1cm4gbmV3RGF0ZTtcbn07XG5cbi8qKlxuICogQWRkIGRheXMgdG8gZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbnVtRGF5cyB0aGUgZGlmZmVyZW5jZSBpbiBkYXlzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3QgYWRkRGF5cyA9IChfZGF0ZSwgbnVtRGF5cykgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcbiAgbmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpICsgbnVtRGF5cyk7XG4gIHJldHVybiBuZXdEYXRlO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdCBkYXlzIGZyb20gZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbnVtRGF5cyB0aGUgZGlmZmVyZW5jZSBpbiBkYXlzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc3ViRGF5cyA9IChfZGF0ZSwgbnVtRGF5cykgPT4gYWRkRGF5cyhfZGF0ZSwgLW51bURheXMpO1xuXG4vKipcbiAqIEFkZCB3ZWVrcyB0byBkYXRlXG4gKlxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1XZWVrcyB0aGUgZGlmZmVyZW5jZSBpbiB3ZWVrc1xuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IGFkZFdlZWtzID0gKF9kYXRlLCBudW1XZWVrcykgPT4gYWRkRGF5cyhfZGF0ZSwgbnVtV2Vla3MgKiA3KTtcblxuLyoqXG4gKiBTdWJ0cmFjdCB3ZWVrcyBmcm9tIGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IG51bVdlZWtzIHRoZSBkaWZmZXJlbmNlIGluIHdlZWtzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc3ViV2Vla3MgPSAoX2RhdGUsIG51bVdlZWtzKSA9PiBhZGRXZWVrcyhfZGF0ZSwgLW51bVdlZWtzKTtcblxuLyoqXG4gKiBTZXQgZGF0ZSB0byB0aGUgc3RhcnQgb2YgdGhlIHdlZWsgKFN1bmRheSlcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IHN0YXJ0T2ZXZWVrID0gKF9kYXRlKSA9PiB7XG4gIGNvbnN0IGRheU9mV2VlayA9IF9kYXRlLmdldERheSgpO1xuICByZXR1cm4gc3ViRGF5cyhfZGF0ZSwgZGF5T2ZXZWVrKTtcbn07XG5cbi8qKlxuICogU2V0IGRhdGUgdG8gdGhlIGVuZCBvZiB0aGUgd2VlayAoU2F0dXJkYXkpXG4gKlxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1XZWVrcyB0aGUgZGlmZmVyZW5jZSBpbiB3ZWVrc1xuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IGVuZE9mV2VlayA9IChfZGF0ZSkgPT4ge1xuICBjb25zdCBkYXlPZldlZWsgPSBfZGF0ZS5nZXREYXkoKTtcbiAgcmV0dXJuIGFkZERheXMoX2RhdGUsIDYgLSBkYXlPZldlZWspO1xufTtcblxuLyoqXG4gKiBBZGQgbW9udGhzIHRvIGRhdGUgYW5kIGtlZXAgZGF0ZSB3aXRoaW4gbW9udGhcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IG51bU1vbnRocyB0aGUgZGlmZmVyZW5jZSBpbiBtb250aHNcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBhZGRNb250aHMgPSAoX2RhdGUsIG51bU1vbnRocykgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcblxuICBjb25zdCBkYXRlTW9udGggPSAobmV3RGF0ZS5nZXRNb250aCgpICsgMTIgKyBudW1Nb250aHMpICUgMTI7XG4gIG5ld0RhdGUuc2V0TW9udGgobmV3RGF0ZS5nZXRNb250aCgpICsgbnVtTW9udGhzKTtcbiAga2VlcERhdGVXaXRoaW5Nb250aChuZXdEYXRlLCBkYXRlTW9udGgpO1xuXG4gIHJldHVybiBuZXdEYXRlO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdCBtb250aHMgZnJvbSBkYXRlXG4gKlxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1Nb250aHMgdGhlIGRpZmZlcmVuY2UgaW4gbW9udGhzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc3ViTW9udGhzID0gKF9kYXRlLCBudW1Nb250aHMpID0+IGFkZE1vbnRocyhfZGF0ZSwgLW51bU1vbnRocyk7XG5cbi8qKlxuICogQWRkIHllYXJzIHRvIGRhdGUgYW5kIGtlZXAgZGF0ZSB3aXRoaW4gbW9udGhcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IG51bVllYXJzIHRoZSBkaWZmZXJlbmNlIGluIHllYXJzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3QgYWRkWWVhcnMgPSAoX2RhdGUsIG51bVllYXJzKSA9PiBhZGRNb250aHMoX2RhdGUsIG51bVllYXJzICogMTIpO1xuXG4vKipcbiAqIFN1YnRyYWN0IHllYXJzIGZyb20gZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbnVtWWVhcnMgdGhlIGRpZmZlcmVuY2UgaW4geWVhcnNcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBzdWJZZWFycyA9IChfZGF0ZSwgbnVtWWVhcnMpID0+IGFkZFllYXJzKF9kYXRlLCAtbnVtWWVhcnMpO1xuXG4vKipcbiAqIFNldCBtb250aHMgb2YgZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbW9udGggemVyby1pbmRleGVkIG1vbnRoIHRvIHNldFxuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IHNldE1vbnRoID0gKF9kYXRlLCBtb250aCkgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcblxuICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcbiAga2VlcERhdGVXaXRoaW5Nb250aChuZXdEYXRlLCBtb250aCk7XG5cbiAgcmV0dXJuIG5ld0RhdGU7XG59O1xuXG4vKipcbiAqIFNldCB5ZWFyIG9mIGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IHllYXIgdGhlIHllYXIgdG8gc2V0XG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc2V0WWVhciA9IChfZGF0ZSwgeWVhcikgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcblxuICBjb25zdCBtb250aCA9IG5ld0RhdGUuZ2V0TW9udGgoKTtcbiAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcbiAga2VlcERhdGVXaXRoaW5Nb250aChuZXdEYXRlLCBtb250aCk7XG5cbiAgcmV0dXJuIG5ld0RhdGU7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgZWFybGllc3QgZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZUEgZGF0ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVCIGRhdGUgdG8gY29tcGFyZVxuICogQHJldHVybnMge0RhdGV9IHRoZSBlYXJsaWVzdCBkYXRlXG4gKi9cbmNvbnN0IG1pbiA9IChkYXRlQSwgZGF0ZUIpID0+IHtcbiAgbGV0IG5ld0RhdGUgPSBkYXRlQTtcblxuICBpZiAoZGF0ZUIgPCBkYXRlQSkge1xuICAgIG5ld0RhdGUgPSBkYXRlQjtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0ZShuZXdEYXRlLmdldFRpbWUoKSk7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgbGF0ZXN0IGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVBIGRhdGUgdG8gY29tcGFyZVxuICogQHBhcmFtIHtEYXRlfSBkYXRlQiBkYXRlIHRvIGNvbXBhcmVcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgbGF0ZXN0IGRhdGVcbiAqL1xuY29uc3QgbWF4ID0gKGRhdGVBLCBkYXRlQikgPT4ge1xuICBsZXQgbmV3RGF0ZSA9IGRhdGVBO1xuXG4gIGlmIChkYXRlQiA+IGRhdGVBKSB7XG4gICAgbmV3RGF0ZSA9IGRhdGVCO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBEYXRlKG5ld0RhdGUuZ2V0VGltZSgpKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgZGF0ZXMgYXJlIHRoZSBpbiB0aGUgc2FtZSB5ZWFyXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlQSBkYXRlIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZUIgZGF0ZSB0byBjb21wYXJlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gYXJlIGRhdGVzIGluIHRoZSBzYW1lIHllYXJcbiAqL1xuY29uc3QgaXNTYW1lWWVhciA9IChkYXRlQSwgZGF0ZUIpID0+XG4gIGRhdGVBICYmIGRhdGVCICYmIGRhdGVBLmdldEZ1bGxZZWFyKCkgPT09IGRhdGVCLmdldEZ1bGxZZWFyKCk7XG5cbi8qKlxuICogQ2hlY2sgaWYgZGF0ZXMgYXJlIHRoZSBpbiB0aGUgc2FtZSBtb250aFxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZUEgZGF0ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVCIGRhdGUgdG8gY29tcGFyZVxuICogQHJldHVybnMge2Jvb2xlYW59IGFyZSBkYXRlcyBpbiB0aGUgc2FtZSBtb250aFxuICovXG5jb25zdCBpc1NhbWVNb250aCA9IChkYXRlQSwgZGF0ZUIpID0+XG4gIGlzU2FtZVllYXIoZGF0ZUEsIGRhdGVCKSAmJiBkYXRlQS5nZXRNb250aCgpID09PSBkYXRlQi5nZXRNb250aCgpO1xuXG4vKipcbiAqIENoZWNrIGlmIGRhdGVzIGFyZSB0aGUgc2FtZSBkYXRlXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlQSB0aGUgZGF0ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVBIHRoZSBkYXRlIHRvIGNvbXBhcmVcbiAqIEByZXR1cm5zIHtib29sZWFufSBhcmUgZGF0ZXMgdGhlIHNhbWUgZGF0ZVxuICovXG5jb25zdCBpc1NhbWVEYXkgPSAoZGF0ZUEsIGRhdGVCKSA9PlxuICBpc1NhbWVNb250aChkYXRlQSwgZGF0ZUIpICYmIGRhdGVBLmdldERhdGUoKSA9PT0gZGF0ZUIuZ2V0RGF0ZSgpO1xuXG4vKipcbiAqIHJldHVybiBhIG5ldyBkYXRlIHdpdGhpbiBtaW5pbXVtIGFuZCBtYXhpbXVtIGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGUgZGF0ZSB0byBjaGVja1xuICogQHBhcmFtIHtEYXRlfSBtaW5EYXRlIG1pbmltdW0gZGF0ZSB0byBhbGxvd1xuICogQHBhcmFtIHtEYXRlfSBtYXhEYXRlIG1heGltdW0gZGF0ZSB0byBhbGxvd1xuICogQHJldHVybnMge0RhdGV9IHRoZSBkYXRlIGJldHdlZW4gbWluIGFuZCBtYXhcbiAqL1xuY29uc3Qga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4ID0gKGRhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+IHtcbiAgbGV0IG5ld0RhdGUgPSBkYXRlO1xuXG4gIGlmIChkYXRlIDwgbWluRGF0ZSkge1xuICAgIG5ld0RhdGUgPSBtaW5EYXRlO1xuICB9IGVsc2UgaWYgKG1heERhdGUgJiYgZGF0ZSA+IG1heERhdGUpIHtcbiAgICBuZXdEYXRlID0gbWF4RGF0ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0ZShuZXdEYXRlLmdldFRpbWUoKSk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGRhdGVzIGlzIHZhbGlkLlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZSBkYXRlIHRvIGNoZWNrXG4gKiBAcGFyYW0ge0RhdGV9IG1pbkRhdGUgbWluaW11bSBkYXRlIHRvIGFsbG93XG4gKiBAcGFyYW0ge0RhdGV9IG1heERhdGUgbWF4aW11bSBkYXRlIHRvIGFsbG93XG4gKiBAcmV0dXJuIHtib29sZWFufSBpcyB0aGVyZSBhIGRheSB3aXRoaW4gdGhlIG1vbnRoIHdpdGhpbiBtaW4gYW5kIG1heCBkYXRlc1xuICovXG5jb25zdCBpc0RhdGVXaXRoaW5NaW5BbmRNYXggPSAoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSkgPT5cbiAgZGF0ZSA+PSBtaW5EYXRlICYmICghbWF4RGF0ZSB8fCBkYXRlIDw9IG1heERhdGUpO1xuXG4vKipcbiAqIENoZWNrIGlmIGRhdGVzIG1vbnRoIGlzIGludmFsaWQuXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIGRhdGUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7RGF0ZX0gbWluRGF0ZSBtaW5pbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4RGF0ZSBtYXhpbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEByZXR1cm4ge2Jvb2xlYW59IGlzIHRoZSBtb250aCBvdXRzaWRlIG1pbiBvciBtYXggZGF0ZXNcbiAqL1xuY29uc3QgaXNEYXRlc01vbnRoT3V0c2lkZU1pbk9yTWF4ID0gKGRhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+XG4gIGxhc3REYXlPZk1vbnRoKGRhdGUpIDwgbWluRGF0ZSB8fCAobWF4RGF0ZSAmJiBzdGFydE9mTW9udGgoZGF0ZSkgPiBtYXhEYXRlKTtcblxuLyoqXG4gKiBDaGVjayBpZiBkYXRlcyB5ZWFyIGlzIGludmFsaWQuXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIGRhdGUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7RGF0ZX0gbWluRGF0ZSBtaW5pbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4RGF0ZSBtYXhpbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEByZXR1cm4ge2Jvb2xlYW59IGlzIHRoZSBtb250aCBvdXRzaWRlIG1pbiBvciBtYXggZGF0ZXNcbiAqL1xuY29uc3QgaXNEYXRlc1llYXJPdXRzaWRlTWluT3JNYXggPSAoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSkgPT5cbiAgbGFzdERheU9mTW9udGgoc2V0TW9udGgoZGF0ZSwgMTEpKSA8IG1pbkRhdGUgfHxcbiAgKG1heERhdGUgJiYgc3RhcnRPZk1vbnRoKHNldE1vbnRoKGRhdGUsIDApKSA+IG1heERhdGUpO1xuXG4vKipcbiAqIFBhcnNlIGEgZGF0ZSB3aXRoIGZvcm1hdCBNLUQtWVlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0ZVN0cmluZyB0aGUgZGF0ZSBzdHJpbmcgdG8gcGFyc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRlRm9ybWF0IHRoZSBmb3JtYXQgb2YgdGhlIGRhdGUgc3RyaW5nXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGFkanVzdERhdGUgc2hvdWxkIHRoZSBkYXRlIGJlIGFkanVzdGVkXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIHBhcnNlZCBkYXRlXG4gKi9cbmNvbnN0IHBhcnNlRGF0ZVN0cmluZyA9IChcbiAgZGF0ZVN0cmluZyxcbiAgZGF0ZUZvcm1hdCA9IElOVEVSTkFMX0RBVEVfRk9STUFULFxuICBhZGp1c3REYXRlID0gZmFsc2VcbikgPT4ge1xuICBsZXQgZGF0ZTtcbiAgbGV0IG1vbnRoO1xuICBsZXQgZGF5O1xuICBsZXQgeWVhcjtcbiAgbGV0IHBhcnNlZDtcblxuICBpZiAoZGF0ZVN0cmluZykge1xuICAgIGxldCBtb250aFN0cjtcbiAgICBsZXQgZGF5U3RyO1xuICAgIGxldCB5ZWFyU3RyO1xuXG4gICAgaWYgKGRhdGVGb3JtYXQgPT09IERFRkFVTFRfRVhURVJOQUxfREFURV9GT1JNQVQpIHtcbiAgICAgIFttb250aFN0ciwgZGF5U3RyLCB5ZWFyU3RyXSA9IGRhdGVTdHJpbmcuc3BsaXQoXCIvXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBbeWVhclN0ciwgbW9udGhTdHIsIGRheVN0cl0gPSBkYXRlU3RyaW5nLnNwbGl0KFwiLVwiKTtcbiAgICB9XG5cbiAgICBpZiAoeWVhclN0cikge1xuICAgICAgcGFyc2VkID0gcGFyc2VJbnQoeWVhclN0ciwgMTApO1xuICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkge1xuICAgICAgICB5ZWFyID0gcGFyc2VkO1xuICAgICAgICBpZiAoYWRqdXN0RGF0ZSkge1xuICAgICAgICAgIHllYXIgPSBNYXRoLm1heCgwLCB5ZWFyKTtcbiAgICAgICAgICBpZiAoeWVhclN0ci5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50WWVhciA9IHRvZGF5KCkuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRZZWFyU3R1YiA9XG4gICAgICAgICAgICAgIGN1cnJlbnRZZWFyIC0gKGN1cnJlbnRZZWFyICUgMTAgKiogeWVhclN0ci5sZW5ndGgpO1xuICAgICAgICAgICAgeWVhciA9IGN1cnJlbnRZZWFyU3R1YiArIHBhcnNlZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobW9udGhTdHIpIHtcbiAgICAgIHBhcnNlZCA9IHBhcnNlSW50KG1vbnRoU3RyLCAxMCk7XG4gICAgICBpZiAoIU51bWJlci5pc05hTihwYXJzZWQpKSB7XG4gICAgICAgIG1vbnRoID0gcGFyc2VkO1xuICAgICAgICBpZiAoYWRqdXN0RGF0ZSkge1xuICAgICAgICAgIG1vbnRoID0gTWF0aC5tYXgoMSwgbW9udGgpO1xuICAgICAgICAgIG1vbnRoID0gTWF0aC5taW4oMTIsIG1vbnRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtb250aCAmJiBkYXlTdHIgJiYgeWVhciAhPSBudWxsKSB7XG4gICAgICBwYXJzZWQgPSBwYXJzZUludChkYXlTdHIsIDEwKTtcbiAgICAgIGlmICghTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHtcbiAgICAgICAgZGF5ID0gcGFyc2VkO1xuICAgICAgICBpZiAoYWRqdXN0RGF0ZSkge1xuICAgICAgICAgIGNvbnN0IGxhc3REYXlPZlRoZU1vbnRoID0gc2V0RGF0ZSh5ZWFyLCBtb250aCwgMCkuZ2V0RGF0ZSgpO1xuICAgICAgICAgIGRheSA9IE1hdGgubWF4KDEsIGRheSk7XG4gICAgICAgICAgZGF5ID0gTWF0aC5taW4obGFzdERheU9mVGhlTW9udGgsIGRheSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobW9udGggJiYgZGF5ICYmIHllYXIgIT0gbnVsbCkge1xuICAgICAgZGF0ZSA9IHNldERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRlO1xufTtcblxuLyoqXG4gKiBGb3JtYXQgYSBkYXRlIHRvIGZvcm1hdCBNTS1ERC1ZWVlZXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIHRoZSBkYXRlIHRvIGZvcm1hdFxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGVGb3JtYXQgdGhlIGZvcm1hdCBvZiB0aGUgZGF0ZSBzdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBmb3JtYXR0ZWQgZGF0ZSBzdHJpbmdcbiAqL1xuY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlLCBkYXRlRm9ybWF0ID0gSU5URVJOQUxfREFURV9GT1JNQVQpID0+IHtcbiAgY29uc3QgcGFkWmVyb3MgPSAodmFsdWUsIGxlbmd0aCkgPT4gYDAwMDAke3ZhbHVlfWAuc2xpY2UoLWxlbmd0aCk7XG5cbiAgY29uc3QgbW9udGggPSBkYXRlLmdldE1vbnRoKCkgKyAxO1xuICBjb25zdCBkYXkgPSBkYXRlLmdldERhdGUoKTtcbiAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblxuICBpZiAoZGF0ZUZvcm1hdCA9PT0gREVGQVVMVF9FWFRFUk5BTF9EQVRFX0ZPUk1BVCkge1xuICAgIHJldHVybiBbcGFkWmVyb3MobW9udGgsIDIpLCBwYWRaZXJvcyhkYXksIDIpLCBwYWRaZXJvcyh5ZWFyLCA0KV0uam9pbihcIi9cIik7XG4gIH1cblxuICByZXR1cm4gW3BhZFplcm9zKHllYXIsIDQpLCBwYWRaZXJvcyhtb250aCwgMiksIHBhZFplcm9zKGRheSwgMildLmpvaW4oXCItXCIpO1xufTtcblxuLy8gI2VuZHJlZ2lvbiBEYXRlIE1hbmlwdWxhdGlvbiBGdW5jdGlvbnNcblxuLyoqXG4gKiBDcmVhdGUgYSBncmlkIHN0cmluZyBmcm9tIGFuIGFycmF5IG9mIGh0bWwgc3RyaW5nc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nW119IGh0bWxBcnJheSB0aGUgYXJyYXkgb2YgaHRtbCBpdGVtc1xuICogQHBhcmFtIHtudW1iZXJ9IHJvd1NpemUgdGhlIGxlbmd0aCBvZiBhIHJvd1xuICogQHJldHVybnMge3N0cmluZ30gdGhlIGdyaWQgc3RyaW5nXG4gKi9cbmNvbnN0IGxpc3RUb0dyaWRIdG1sID0gKGh0bWxBcnJheSwgcm93U2l6ZSkgPT4ge1xuICBjb25zdCBncmlkID0gW107XG4gIGxldCByb3cgPSBbXTtcblxuICBsZXQgaSA9IDA7XG4gIHdoaWxlIChpIDwgaHRtbEFycmF5Lmxlbmd0aCkge1xuICAgIHJvdyA9IFtdO1xuXG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XG4gICAgd2hpbGUgKGkgPCBodG1sQXJyYXkubGVuZ3RoICYmIHJvdy5sZW5ndGggPCByb3dTaXplKSB7XG4gICAgICBjb25zdCB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcbiAgICAgIHRkLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCBodG1sQXJyYXlbaV0pO1xuICAgICAgcm93LnB1c2godGQpO1xuICAgICAgaSArPSAxO1xuICAgIH1cblxuICAgIHJvdy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICB0ci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgZWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICBncmlkLnB1c2godHIpO1xuICB9XG5cbiAgcmV0dXJuIGdyaWQ7XG59O1xuXG5jb25zdCBjcmVhdGVUYWJsZUJvZHkgPSAoZ3JpZCkgPT4ge1xuICBjb25zdCB0YWJsZUJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGJvZHlcIik7XG4gIGdyaWQuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgIHRhYmxlQm9keS5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgZWxlbWVudCk7XG4gIH0pO1xuXG4gIHJldHVybiB0YWJsZUJvZHk7XG59O1xuXG4vKipcbiAqIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgYW5kIGRpc3BhdGNoIGEgY2hhbmdlIGV2ZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fSBlbCBUaGUgZWxlbWVudCB0byB1cGRhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBlbGVtZW50XG4gKi9cbmNvbnN0IGNoYW5nZUVsZW1lbnRWYWx1ZSA9IChlbCwgdmFsdWUgPSBcIlwiKSA9PiB7XG4gIGNvbnN0IGVsZW1lbnRUb0NoYW5nZSA9IGVsO1xuICBlbGVtZW50VG9DaGFuZ2UudmFsdWUgPSB2YWx1ZTtcblxuICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChcImNoYW5nZVwiLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGRldGFpbDogeyB2YWx1ZSB9LFxuICB9KTtcbiAgZWxlbWVudFRvQ2hhbmdlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufTtcblxuLyoqXG4gKiBUaGUgcHJvcGVydGllcyBhbmQgZWxlbWVudHMgd2l0aGluIHRoZSBkYXRlIHBpY2tlci5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IERhdGVQaWNrZXJDb250ZXh0XG4gKiBAcHJvcGVydHkge0hUTUxEaXZFbGVtZW50fSBjYWxlbmRhckVsXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBkYXRlUGlja2VyRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTElucHV0RWxlbWVudH0gaW50ZXJuYWxJbnB1dEVsXG4gKiBAcHJvcGVydHkge0hUTUxJbnB1dEVsZW1lbnR9IGV4dGVybmFsSW5wdXRFbFxuICogQHByb3BlcnR5IHtIVE1MRGl2RWxlbWVudH0gc3RhdHVzRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTERpdkVsZW1lbnR9IGZpcnN0WWVhckNodW5rRWxcbiAqIEBwcm9wZXJ0eSB7RGF0ZX0gY2FsZW5kYXJEYXRlXG4gKiBAcHJvcGVydHkge0RhdGV9IG1pbkRhdGVcbiAqIEBwcm9wZXJ0eSB7RGF0ZX0gbWF4RGF0ZVxuICogQHByb3BlcnR5IHtEYXRlfSBzZWxlY3RlZERhdGVcbiAqIEBwcm9wZXJ0eSB7RGF0ZX0gcmFuZ2VEYXRlXG4gKiBAcHJvcGVydHkge0RhdGV9IGRlZmF1bHREYXRlXG4gKi9cblxuLyoqXG4gKiBHZXQgYW4gb2JqZWN0IG9mIHRoZSBwcm9wZXJ0aWVzIGFuZCBlbGVtZW50cyBiZWxvbmdpbmcgZGlyZWN0bHkgdG8gdGhlIGdpdmVuXG4gKiBkYXRlIHBpY2tlciBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGhlIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlclxuICogQHJldHVybnMge0RhdGVQaWNrZXJDb250ZXh0fSBlbGVtZW50c1xuICovXG5jb25zdCBnZXREYXRlUGlja2VyQ29udGV4dCA9IChlbCkgPT4ge1xuICBjb25zdCBkYXRlUGlja2VyRWwgPSBlbC5jbG9zZXN0KERBVEVfUElDS0VSKTtcblxuICBpZiAoIWRhdGVQaWNrZXJFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBtaXNzaW5nIG91dGVyICR7REFURV9QSUNLRVJ9YCk7XG4gIH1cblxuICBjb25zdCBpbnRlcm5hbElucHV0RWwgPSBkYXRlUGlja2VyRWwucXVlcnlTZWxlY3RvcihcbiAgICBEQVRFX1BJQ0tFUl9JTlRFUk5BTF9JTlBVVFxuICApO1xuICBjb25zdCBleHRlcm5hbElucHV0RWwgPSBkYXRlUGlja2VyRWwucXVlcnlTZWxlY3RvcihcbiAgICBEQVRFX1BJQ0tFUl9FWFRFUk5BTF9JTlBVVFxuICApO1xuICBjb25zdCBjYWxlbmRhckVsID0gZGF0ZVBpY2tlckVsLnF1ZXJ5U2VsZWN0b3IoREFURV9QSUNLRVJfQ0FMRU5EQVIpO1xuICBjb25zdCB0b2dnbGVCdG5FbCA9IGRhdGVQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKERBVEVfUElDS0VSX0JVVFRPTik7XG4gIGNvbnN0IHN0YXR1c0VsID0gZGF0ZVBpY2tlckVsLnF1ZXJ5U2VsZWN0b3IoREFURV9QSUNLRVJfU1RBVFVTKTtcbiAgY29uc3QgZmlyc3RZZWFyQ2h1bmtFbCA9IGRhdGVQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKENBTEVOREFSX1lFQVIpO1xuXG4gIGNvbnN0IGlucHV0RGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhcbiAgICBleHRlcm5hbElucHV0RWwudmFsdWUsXG4gICAgREVGQVVMVF9FWFRFUk5BTF9EQVRFX0ZPUk1BVCxcbiAgICB0cnVlXG4gICk7XG4gIGNvbnN0IHNlbGVjdGVkRGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhpbnRlcm5hbElucHV0RWwudmFsdWUpO1xuXG4gIGNvbnN0IGNhbGVuZGFyRGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhjYWxlbmRhckVsLmRhdGFzZXQudmFsdWUpO1xuICBjb25zdCBtaW5EYXRlID0gcGFyc2VEYXRlU3RyaW5nKGRhdGVQaWNrZXJFbC5kYXRhc2V0Lm1pbkRhdGUpO1xuICBjb25zdCBtYXhEYXRlID0gcGFyc2VEYXRlU3RyaW5nKGRhdGVQaWNrZXJFbC5kYXRhc2V0Lm1heERhdGUpO1xuICBjb25zdCByYW5nZURhdGUgPSBwYXJzZURhdGVTdHJpbmcoZGF0ZVBpY2tlckVsLmRhdGFzZXQucmFuZ2VEYXRlKTtcbiAgY29uc3QgZGVmYXVsdERhdGUgPSBwYXJzZURhdGVTdHJpbmcoZGF0ZVBpY2tlckVsLmRhdGFzZXQuZGVmYXVsdERhdGUpO1xuXG4gIGlmIChtaW5EYXRlICYmIG1heERhdGUgJiYgbWluRGF0ZSA+IG1heERhdGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaW5pbXVtIGRhdGUgY2Fubm90IGJlIGFmdGVyIG1heGltdW0gZGF0ZVwiKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2FsZW5kYXJEYXRlLFxuICAgIG1pbkRhdGUsXG4gICAgdG9nZ2xlQnRuRWwsXG4gICAgc2VsZWN0ZWREYXRlLFxuICAgIG1heERhdGUsXG4gICAgZmlyc3RZZWFyQ2h1bmtFbCxcbiAgICBkYXRlUGlja2VyRWwsXG4gICAgaW5wdXREYXRlLFxuICAgIGludGVybmFsSW5wdXRFbCxcbiAgICBleHRlcm5hbElucHV0RWwsXG4gICAgY2FsZW5kYXJFbCxcbiAgICByYW5nZURhdGUsXG4gICAgZGVmYXVsdERhdGUsXG4gICAgc3RhdHVzRWwsXG4gIH07XG59O1xuXG4vKipcbiAqIERpc2FibGUgdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgZGlzYWJsZSA9IChlbCkgPT4ge1xuICBjb25zdCB7IGV4dGVybmFsSW5wdXRFbCwgdG9nZ2xlQnRuRWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcblxuICB0b2dnbGVCdG5FbC5kaXNhYmxlZCA9IHRydWU7XG4gIGV4dGVybmFsSW5wdXRFbC5kaXNhYmxlZCA9IHRydWU7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBlbmFibGUgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBleHRlcm5hbElucHV0RWwsIHRvZ2dsZUJ0bkVsIH0gPSBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG5cbiAgdG9nZ2xlQnRuRWwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgZXh0ZXJuYWxJbnB1dEVsLmRpc2FibGVkID0gZmFsc2U7XG59O1xuXG4vLyAjcmVnaW9uIFZhbGlkYXRpb25cblxuLyoqXG4gKiBWYWxpZGF0ZSB0aGUgdmFsdWUgaW4gdGhlIGlucHV0IGFzIGEgdmFsaWQgZGF0ZSBvZiBmb3JtYXQgTS9EL1lZWVlcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGlzRGF0ZUlucHV0SW52YWxpZCA9IChlbCkgPT4ge1xuICBjb25zdCB7IGV4dGVybmFsSW5wdXRFbCwgbWluRGF0ZSwgbWF4RGF0ZSB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuXG4gIGNvbnN0IGRhdGVTdHJpbmcgPSBleHRlcm5hbElucHV0RWwudmFsdWU7XG4gIGxldCBpc0ludmFsaWQgPSBmYWxzZTtcblxuICBpZiAoZGF0ZVN0cmluZykge1xuICAgIGlzSW52YWxpZCA9IHRydWU7XG5cbiAgICBjb25zdCBkYXRlU3RyaW5nUGFydHMgPSBkYXRlU3RyaW5nLnNwbGl0KFwiL1wiKTtcbiAgICBjb25zdCBbbW9udGgsIGRheSwgeWVhcl0gPSBkYXRlU3RyaW5nUGFydHMubWFwKChzdHIpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KHN0ciwgMTApO1xuICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkgdmFsdWUgPSBwYXJzZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG5cbiAgICBpZiAobW9udGggJiYgZGF5ICYmIHllYXIgIT0gbnVsbCkge1xuICAgICAgY29uc3QgY2hlY2tEYXRlID0gc2V0RGF0ZSh5ZWFyLCBtb250aCAtIDEsIGRheSk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgY2hlY2tEYXRlLmdldE1vbnRoKCkgPT09IG1vbnRoIC0gMSAmJlxuICAgICAgICBjaGVja0RhdGUuZ2V0RGF0ZSgpID09PSBkYXkgJiZcbiAgICAgICAgY2hlY2tEYXRlLmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiZcbiAgICAgICAgZGF0ZVN0cmluZ1BhcnRzWzJdLmxlbmd0aCA9PT0gNCAmJlxuICAgICAgICBpc0RhdGVXaXRoaW5NaW5BbmRNYXgoY2hlY2tEYXRlLCBtaW5EYXRlLCBtYXhEYXRlKVxuICAgICAgKSB7XG4gICAgICAgIGlzSW52YWxpZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpc0ludmFsaWQ7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlIHRoZSB2YWx1ZSBpbiB0aGUgaW5wdXQgYXMgYSB2YWxpZCBkYXRlIG9mIGZvcm1hdCBNL0QvWVlZWVxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgdmFsaWRhdGVEYXRlSW5wdXQgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBleHRlcm5hbElucHV0RWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgaXNJbnZhbGlkID0gaXNEYXRlSW5wdXRJbnZhbGlkKGV4dGVybmFsSW5wdXRFbCk7XG5cbiAgaWYgKGlzSW52YWxpZCAmJiAhZXh0ZXJuYWxJbnB1dEVsLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgZXh0ZXJuYWxJbnB1dEVsLnNldEN1c3RvbVZhbGlkaXR5KFZBTElEQVRJT05fTUVTU0FHRSk7XG4gIH1cblxuICBpZiAoIWlzSW52YWxpZCAmJiBleHRlcm5hbElucHV0RWwudmFsaWRhdGlvbk1lc3NhZ2UgPT09IFZBTElEQVRJT05fTUVTU0FHRSkge1xuICAgIGV4dGVybmFsSW5wdXRFbC5zZXRDdXN0b21WYWxpZGl0eShcIlwiKTtcbiAgfVxufTtcblxuLy8gI2VuZHJlZ2lvbiBWYWxpZGF0aW9uXG5cbi8qKlxuICogRW5hYmxlIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IHJlY29uY2lsZUlucHV0VmFsdWVzID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgaW50ZXJuYWxJbnB1dEVsLCBpbnB1dERhdGUgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgbGV0IG5ld1ZhbHVlID0gXCJcIjtcblxuICBpZiAoaW5wdXREYXRlICYmICFpc0RhdGVJbnB1dEludmFsaWQoZWwpKSB7XG4gICAgbmV3VmFsdWUgPSBmb3JtYXREYXRlKGlucHV0RGF0ZSk7XG4gIH1cblxuICBpZiAoaW50ZXJuYWxJbnB1dEVsLnZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnRlcm5hbElucHV0RWwsIG5ld1ZhbHVlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZWxlY3QgdGhlIHZhbHVlIG9mIHRoZSBkYXRlIHBpY2tlciBpbnB1dHMuXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGVTdHJpbmcgVGhlIGRhdGUgc3RyaW5nIHRvIHVwZGF0ZSBpbiBZWVlZLU1NLUREIGZvcm1hdFxuICovXG5jb25zdCBzZXRDYWxlbmRhclZhbHVlID0gKGVsLCBkYXRlU3RyaW5nKSA9PiB7XG4gIGNvbnN0IHBhcnNlZERhdGUgPSBwYXJzZURhdGVTdHJpbmcoZGF0ZVN0cmluZyk7XG5cbiAgaWYgKHBhcnNlZERhdGUpIHtcbiAgICBjb25zdCBmb3JtYXR0ZWREYXRlID0gZm9ybWF0RGF0ZShwYXJzZWREYXRlLCBERUZBVUxUX0VYVEVSTkFMX0RBVEVfRk9STUFUKTtcblxuICAgIGNvbnN0IHsgZGF0ZVBpY2tlckVsLCBpbnRlcm5hbElucHV0RWwsIGV4dGVybmFsSW5wdXRFbCB9ID1cbiAgICAgIGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcblxuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnRlcm5hbElucHV0RWwsIGRhdGVTdHJpbmcpO1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShleHRlcm5hbElucHV0RWwsIGZvcm1hdHRlZERhdGUpO1xuXG4gICAgdmFsaWRhdGVEYXRlSW5wdXQoZGF0ZVBpY2tlckVsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBFbmhhbmNlIGFuIGlucHV0IHdpdGggdGhlIGRhdGUgcGlja2VyIGVsZW1lbnRzXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgVGhlIGluaXRpYWwgd3JhcHBpbmcgZWxlbWVudCBvZiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGVuaGFuY2VEYXRlUGlja2VyID0gKGVsKSA9PiB7XG4gIGNvbnN0IGRhdGVQaWNrZXJFbCA9IGVsLmNsb3Nlc3QoREFURV9QSUNLRVIpO1xuICBjb25zdCB7IGRlZmF1bHRWYWx1ZSB9ID0gZGF0ZVBpY2tlckVsLmRhdGFzZXQ7XG5cbiAgY29uc3QgaW50ZXJuYWxJbnB1dEVsID0gZGF0ZVBpY2tlckVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG5cbiAgaWYgKCFpbnRlcm5hbElucHV0RWwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7REFURV9QSUNLRVJ9IGlzIG1pc3NpbmcgaW5uZXIgaW5wdXRgKTtcbiAgfVxuXG4gIGlmIChpbnRlcm5hbElucHV0RWwudmFsdWUpIHtcbiAgICBpbnRlcm5hbElucHV0RWwudmFsdWUgPSBcIlwiO1xuICB9XG5cbiAgY29uc3QgbWluRGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhcbiAgICBkYXRlUGlja2VyRWwuZGF0YXNldC5taW5EYXRlIHx8IGludGVybmFsSW5wdXRFbC5nZXRBdHRyaWJ1dGUoXCJtaW5cIilcbiAgKTtcbiAgZGF0ZVBpY2tlckVsLmRhdGFzZXQubWluRGF0ZSA9IG1pbkRhdGVcbiAgICA/IGZvcm1hdERhdGUobWluRGF0ZSlcbiAgICA6IERFRkFVTFRfTUlOX0RBVEU7XG5cbiAgY29uc3QgbWF4RGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhcbiAgICBkYXRlUGlja2VyRWwuZGF0YXNldC5tYXhEYXRlIHx8IGludGVybmFsSW5wdXRFbC5nZXRBdHRyaWJ1dGUoXCJtYXhcIilcbiAgKTtcbiAgaWYgKG1heERhdGUpIHtcbiAgICBkYXRlUGlja2VyRWwuZGF0YXNldC5tYXhEYXRlID0gZm9ybWF0RGF0ZShtYXhEYXRlKTtcbiAgfVxuXG4gIGNvbnN0IGNhbGVuZGFyV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGNhbGVuZGFyV3JhcHBlci5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX1dSQVBQRVJfQ0xBU1MpO1xuXG4gIGNvbnN0IGV4dGVybmFsSW5wdXRFbCA9IGludGVybmFsSW5wdXRFbC5jbG9uZU5vZGUoKTtcbiAgZXh0ZXJuYWxJbnB1dEVsLmNsYXNzTGlzdC5hZGQoREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRfQ0xBU1MpO1xuICBleHRlcm5hbElucHV0RWwudHlwZSA9IFwidGV4dFwiO1xuXG4gIGNhbGVuZGFyV3JhcHBlci5hcHBlbmRDaGlsZChleHRlcm5hbElucHV0RWwpO1xuICBjYWxlbmRhcldyYXBwZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgIFwiYmVmb3JlZW5kXCIsXG4gICAgU2FuaXRpemVyLmVzY2FwZUhUTUxgXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCIke0RBVEVfUElDS0VSX0JVVFRPTl9DTEFTU31cIiBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIGFyaWEtbGFiZWw9XCJUb2dnbGUgY2FsZW5kYXJcIj48L2J1dHRvbj5cbiAgICA8ZGl2IGNsYXNzPVwiJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31cIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBoaWRkZW4+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInVzYS1zci1vbmx5ICR7REFURV9QSUNLRVJfU1RBVFVTX0NMQVNTfVwiIHJvbGU9XCJzdGF0dXNcIiBhcmlhLWxpdmU9XCJwb2xpdGVcIj48L2Rpdj5gXG4gICk7XG5cbiAgaW50ZXJuYWxJbnB1dEVsLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgaW50ZXJuYWxJbnB1dEVsLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIik7XG4gIGludGVybmFsSW5wdXRFbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIGludGVybmFsSW5wdXRFbC5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX0lOVEVSTkFMX0lOUFVUX0NMQVNTKTtcbiAgaW50ZXJuYWxJbnB1dEVsLnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuICBpbnRlcm5hbElucHV0RWwucmVtb3ZlQXR0cmlidXRlKFwibmFtZVwiKTtcbiAgaW50ZXJuYWxJbnB1dEVsLnJlcXVpcmVkID0gZmFsc2U7XG5cbiAgZGF0ZVBpY2tlckVsLmFwcGVuZENoaWxkKGNhbGVuZGFyV3JhcHBlcik7XG4gIGRhdGVQaWNrZXJFbC5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX0lOSVRJQUxJWkVEX0NMQVNTKTtcblxuICBpZiAoZGVmYXVsdFZhbHVlKSB7XG4gICAgc2V0Q2FsZW5kYXJWYWx1ZShkYXRlUGlja2VyRWwsIGRlZmF1bHRWYWx1ZSk7XG4gIH1cblxuICBpZiAoaW50ZXJuYWxJbnB1dEVsLmRpc2FibGVkKSB7XG4gICAgZGlzYWJsZShkYXRlUGlja2VyRWwpO1xuICAgIGludGVybmFsSW5wdXRFbC5kaXNhYmxlZCA9IGZhbHNlO1xuICB9XG59O1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIC0gRGF0ZSBTZWxlY3Rpb24gVmlld1xuXG4vKipcbiAqIHJlbmRlciB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZVRvRGlzcGxheSBhIGRhdGUgdG8gcmVuZGVyIG9uIHRoZSBjYWxlbmRhclxuICogQHJldHVybnMge0hUTUxFbGVtZW50fSBhIHJlZmVyZW5jZSB0byB0aGUgbmV3IGNhbGVuZGFyIGVsZW1lbnRcbiAqL1xuY29uc3QgcmVuZGVyQ2FsZW5kYXIgPSAoZWwsIF9kYXRlVG9EaXNwbGF5KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBkYXRlUGlja2VyRWwsXG4gICAgY2FsZW5kYXJFbCxcbiAgICBzdGF0dXNFbCxcbiAgICBzZWxlY3RlZERhdGUsXG4gICAgbWF4RGF0ZSxcbiAgICBtaW5EYXRlLFxuICAgIHJhbmdlRGF0ZSxcbiAgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgdG9kYXlzRGF0ZSA9IHRvZGF5KCk7XG4gIGxldCBkYXRlVG9EaXNwbGF5ID0gX2RhdGVUb0Rpc3BsYXkgfHwgdG9kYXlzRGF0ZTtcblxuICBjb25zdCBjYWxlbmRhcldhc0hpZGRlbiA9IGNhbGVuZGFyRWwuaGlkZGVuO1xuXG4gIGNvbnN0IGZvY3VzZWREYXRlID0gYWRkRGF5cyhkYXRlVG9EaXNwbGF5LCAwKTtcbiAgY29uc3QgZm9jdXNlZE1vbnRoID0gZGF0ZVRvRGlzcGxheS5nZXRNb250aCgpO1xuICBjb25zdCBmb2N1c2VkWWVhciA9IGRhdGVUb0Rpc3BsYXkuZ2V0RnVsbFllYXIoKTtcblxuICBjb25zdCBwcmV2TW9udGggPSBzdWJNb250aHMoZGF0ZVRvRGlzcGxheSwgMSk7XG4gIGNvbnN0IG5leHRNb250aCA9IGFkZE1vbnRocyhkYXRlVG9EaXNwbGF5LCAxKTtcblxuICBjb25zdCBjdXJyZW50Rm9ybWF0dGVkRGF0ZSA9IGZvcm1hdERhdGUoZGF0ZVRvRGlzcGxheSk7XG5cbiAgY29uc3QgZmlyc3RPZk1vbnRoID0gc3RhcnRPZk1vbnRoKGRhdGVUb0Rpc3BsYXkpO1xuICBjb25zdCBwcmV2QnV0dG9uc0Rpc2FibGVkID0gaXNTYW1lTW9udGgoZGF0ZVRvRGlzcGxheSwgbWluRGF0ZSk7XG4gIGNvbnN0IG5leHRCdXR0b25zRGlzYWJsZWQgPSBpc1NhbWVNb250aChkYXRlVG9EaXNwbGF5LCBtYXhEYXRlKTtcblxuICBjb25zdCByYW5nZUNvbmNsdXNpb25EYXRlID0gc2VsZWN0ZWREYXRlIHx8IGRhdGVUb0Rpc3BsYXk7XG4gIGNvbnN0IHJhbmdlU3RhcnREYXRlID0gcmFuZ2VEYXRlICYmIG1pbihyYW5nZUNvbmNsdXNpb25EYXRlLCByYW5nZURhdGUpO1xuICBjb25zdCByYW5nZUVuZERhdGUgPSByYW5nZURhdGUgJiYgbWF4KHJhbmdlQ29uY2x1c2lvbkRhdGUsIHJhbmdlRGF0ZSk7XG5cbiAgY29uc3Qgd2l0aGluUmFuZ2VTdGFydERhdGUgPSByYW5nZURhdGUgJiYgYWRkRGF5cyhyYW5nZVN0YXJ0RGF0ZSwgMSk7XG4gIGNvbnN0IHdpdGhpblJhbmdlRW5kRGF0ZSA9IHJhbmdlRGF0ZSAmJiBzdWJEYXlzKHJhbmdlRW5kRGF0ZSwgMSk7XG5cbiAgY29uc3QgbW9udGhMYWJlbCA9IE1PTlRIX0xBQkVMU1tmb2N1c2VkTW9udGhdO1xuXG4gIGNvbnN0IGdlbmVyYXRlRGF0ZUh0bWwgPSAoZGF0ZVRvUmVuZGVyKSA9PiB7XG4gICAgY29uc3QgY2xhc3NlcyA9IFtDQUxFTkRBUl9EQVRFX0NMQVNTXTtcbiAgICBjb25zdCBkYXkgPSBkYXRlVG9SZW5kZXIuZ2V0RGF0ZSgpO1xuICAgIGNvbnN0IG1vbnRoID0gZGF0ZVRvUmVuZGVyLmdldE1vbnRoKCk7XG4gICAgY29uc3QgeWVhciA9IGRhdGVUb1JlbmRlci5nZXRGdWxsWWVhcigpO1xuICAgIGNvbnN0IGRheU9mV2VlayA9IGRhdGVUb1JlbmRlci5nZXREYXkoKTtcblxuICAgIGNvbnN0IGZvcm1hdHRlZERhdGUgPSBmb3JtYXREYXRlKGRhdGVUb1JlbmRlcik7XG5cbiAgICBsZXQgdGFiaW5kZXggPSBcIi0xXCI7XG5cbiAgICBjb25zdCBpc0Rpc2FibGVkID0gIWlzRGF0ZVdpdGhpbk1pbkFuZE1heChkYXRlVG9SZW5kZXIsIG1pbkRhdGUsIG1heERhdGUpO1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpc1NhbWVEYXkoZGF0ZVRvUmVuZGVyLCBzZWxlY3RlZERhdGUpO1xuXG4gICAgaWYgKGlzU2FtZU1vbnRoKGRhdGVUb1JlbmRlciwgcHJldk1vbnRoKSkge1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfUFJFVklPVVNfTU9OVEhfQ0xBU1MpO1xuICAgIH1cblxuICAgIGlmIChpc1NhbWVNb250aChkYXRlVG9SZW5kZXIsIGZvY3VzZWREYXRlKSkge1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfQ1VSUkVOVF9NT05USF9DTEFTUyk7XG4gICAgfVxuXG4gICAgaWYgKGlzU2FtZU1vbnRoKGRhdGVUb1JlbmRlciwgbmV4dE1vbnRoKSkge1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfTkVYVF9NT05USF9DTEFTUyk7XG4gICAgfVxuXG4gICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgIGNsYXNzZXMucHVzaChDQUxFTkRBUl9EQVRFX1NFTEVDVEVEX0NMQVNTKTtcbiAgICB9XG5cbiAgICBpZiAoaXNTYW1lRGF5KGRhdGVUb1JlbmRlciwgdG9kYXlzRGF0ZSkpIHtcbiAgICAgIGNsYXNzZXMucHVzaChDQUxFTkRBUl9EQVRFX1RPREFZX0NMQVNTKTtcbiAgICB9XG5cbiAgICBpZiAocmFuZ2VEYXRlKSB7XG4gICAgICBpZiAoaXNTYW1lRGF5KGRhdGVUb1JlbmRlciwgcmFuZ2VEYXRlKSkge1xuICAgICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX0NMQVNTKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzU2FtZURheShkYXRlVG9SZW5kZXIsIHJhbmdlU3RhcnREYXRlKSkge1xuICAgICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX1NUQVJUX0NMQVNTKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzU2FtZURheShkYXRlVG9SZW5kZXIsIHJhbmdlRW5kRGF0ZSkpIHtcbiAgICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfUkFOR0VfREFURV9FTkRfQ0xBU1MpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGlzRGF0ZVdpdGhpbk1pbkFuZE1heChcbiAgICAgICAgICBkYXRlVG9SZW5kZXIsXG4gICAgICAgICAgd2l0aGluUmFuZ2VTdGFydERhdGUsXG4gICAgICAgICAgd2l0aGluUmFuZ2VFbmREYXRlXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9XSVRISU5fUkFOR0VfQ0xBU1MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpc1NhbWVEYXkoZGF0ZVRvUmVuZGVyLCBmb2N1c2VkRGF0ZSkpIHtcbiAgICAgIHRhYmluZGV4ID0gXCIwXCI7XG4gICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9GT0NVU0VEX0NMQVNTKTtcbiAgICB9XG5cbiAgICBjb25zdCBtb250aFN0ciA9IE1PTlRIX0xBQkVMU1ttb250aF07XG4gICAgY29uc3QgZGF5U3RyID0gREFZX09GX1dFRUtfTEFCRUxTW2RheU9mV2Vla107XG5cbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCB0YWJpbmRleCk7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzZXMuam9pbihcIiBcIikpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJkYXRhLWRheVwiLCBkYXkpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJkYXRhLW1vbnRoXCIsIG1vbnRoICsgMSk7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcImRhdGEteWVhclwiLCB5ZWFyKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiZGF0YS12YWx1ZVwiLCBmb3JtYXR0ZWREYXRlKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFxuICAgICAgXCJhcmlhLWxhYmVsXCIsXG4gICAgICBTYW5pdGl6ZXIuZXNjYXBlSFRNTGAke2RheX0gJHttb250aFN0cn0gJHt5ZWFyfSAke2RheVN0cn1gXG4gICAgKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBpc1NlbGVjdGVkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpO1xuICAgIGlmIChpc0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBidG4udGV4dENvbnRlbnQgPSBkYXk7XG5cbiAgICByZXR1cm4gYnRuO1xuICB9O1xuXG4gIC8vIHNldCBkYXRlIHRvIGZpcnN0IHJlbmRlcmVkIGRheVxuICBkYXRlVG9EaXNwbGF5ID0gc3RhcnRPZldlZWsoZmlyc3RPZk1vbnRoKTtcblxuICBjb25zdCBkYXlzID0gW107XG5cbiAgd2hpbGUgKFxuICAgIGRheXMubGVuZ3RoIDwgMjggfHxcbiAgICBkYXRlVG9EaXNwbGF5LmdldE1vbnRoKCkgPT09IGZvY3VzZWRNb250aCB8fFxuICAgIGRheXMubGVuZ3RoICUgNyAhPT0gMFxuICApIHtcbiAgICBkYXlzLnB1c2goZ2VuZXJhdGVEYXRlSHRtbChkYXRlVG9EaXNwbGF5KSk7XG4gICAgZGF0ZVRvRGlzcGxheSA9IGFkZERheXMoZGF0ZVRvRGlzcGxheSwgMSk7XG4gIH1cblxuICBjb25zdCBkYXRlc0dyaWQgPSBsaXN0VG9HcmlkSHRtbChkYXlzLCA3KTtcblxuICBjb25zdCBuZXdDYWxlbmRhciA9IGNhbGVuZGFyRWwuY2xvbmVOb2RlKCk7XG4gIG5ld0NhbGVuZGFyLmRhdGFzZXQudmFsdWUgPSBjdXJyZW50Rm9ybWF0dGVkRGF0ZTtcbiAgbmV3Q2FsZW5kYXIuc3R5bGUudG9wID0gYCR7ZGF0ZVBpY2tlckVsLm9mZnNldEhlaWdodH1weGA7XG4gIG5ld0NhbGVuZGFyLmhpZGRlbiA9IGZhbHNlO1xuICBuZXdDYWxlbmRhci5pbm5lckhUTUwgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGBcbiAgICA8ZGl2IHRhYmluZGV4PVwiLTFcIiBjbGFzcz1cIiR7Q0FMRU5EQVJfREFURV9QSUNLRVJfQ0xBU1N9XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiJHtDQUxFTkRBUl9ST1dfQ0xBU1N9XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke0NBTEVOREFSX0NFTExfQ0xBU1N9ICR7Q0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1N9XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cIiR7Q0FMRU5EQVJfUFJFVklPVVNfWUVBUl9DTEFTU31cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIk5hdmlnYXRlIGJhY2sgb25lIHllYXJcIlxuICAgICAgICAgICAgJHtwcmV2QnV0dG9uc0Rpc2FibGVkID8gYGRpc2FibGVkPVwiZGlzYWJsZWRcImAgOiBcIlwifVxuICAgICAgICAgID48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke0NBTEVOREFSX0NFTExfQ0xBU1N9ICR7Q0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1N9XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cIiR7Q0FMRU5EQVJfUFJFVklPVVNfTU9OVEhfQ0xBU1N9XCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJOYXZpZ2F0ZSBiYWNrIG9uZSBtb250aFwiXG4gICAgICAgICAgICAke3ByZXZCdXR0b25zRGlzYWJsZWQgPyBgZGlzYWJsZWQ9XCJkaXNhYmxlZFwiYCA6IFwiXCJ9XG4gICAgICAgICAgPjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7Q0FMRU5EQVJfQ0VMTF9DTEFTU30gJHtDQUxFTkRBUl9NT05USF9MQUJFTF9DTEFTU31cIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzPVwiJHtDQUxFTkRBUl9NT05USF9TRUxFQ1RJT05fQ0xBU1N9XCIgYXJpYS1sYWJlbD1cIiR7bW9udGhMYWJlbH0uIENsaWNrIHRvIHNlbGVjdCBtb250aFwiXG4gICAgICAgICAgPiR7bW9udGhMYWJlbH08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzPVwiJHtDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTl9DTEFTU31cIiBhcmlhLWxhYmVsPVwiJHtmb2N1c2VkWWVhcn0uIENsaWNrIHRvIHNlbGVjdCB5ZWFyXCJcbiAgICAgICAgICA+JHtmb2N1c2VkWWVhcn08L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke0NBTEVOREFSX0NFTExfQ0xBU1N9ICR7Q0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1N9XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cIiR7Q0FMRU5EQVJfTkVYVF9NT05USF9DTEFTU31cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIk5hdmlnYXRlIGZvcndhcmQgb25lIG1vbnRoXCJcbiAgICAgICAgICAgICR7bmV4dEJ1dHRvbnNEaXNhYmxlZCA/IGBkaXNhYmxlZD1cImRpc2FibGVkXCJgIDogXCJcIn1cbiAgICAgICAgICA+PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtDQUxFTkRBUl9DRUxMX0NMQVNTfSAke0NBTEVOREFSX0NFTExfQ0VOVEVSX0lURU1TX0NMQVNTfVwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3M9XCIke0NBTEVOREFSX05FWFRfWUVBUl9DTEFTU31cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIk5hdmlnYXRlIGZvcndhcmQgb25lIHllYXJcIlxuICAgICAgICAgICAgJHtuZXh0QnV0dG9uc0Rpc2FibGVkID8gYGRpc2FibGVkPVwiZGlzYWJsZWRcImAgOiBcIlwifVxuICAgICAgICAgID48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgO1xuXG4gIGNvbnN0IHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRhYmxlXCIpO1xuICB0YWJsZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBDQUxFTkRBUl9UQUJMRV9DTEFTUyk7XG4gIHRhYmxlLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG5cbiAgY29uc3QgdGFibGVIZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRoZWFkXCIpO1xuICB0YWJsZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgdGFibGVIZWFkKTtcbiAgY29uc3QgdGFibGVIZWFkUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRyXCIpO1xuICB0YWJsZUhlYWQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHRhYmxlSGVhZFJvdyk7XG5cbiAgY29uc3QgZGF5c09mV2VlayA9IHtcbiAgICBTdW5kYXk6IFwiU1wiLFxuICAgIE1vbmRheTogXCJNXCIsXG4gICAgVHVlc2RheTogXCJUXCIsXG4gICAgV2VkbmVzZGF5OiBcIldcIixcbiAgICBUaHVyc2RheTogXCJUaFwiLFxuICAgIEZyaWRheTogXCJGclwiLFxuICAgIFNhdHVyZGF5OiBcIlNcIixcbiAgfTtcblxuICBPYmplY3Qua2V5cyhkYXlzT2ZXZWVrKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCB0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0aFwiKTtcbiAgICB0aC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBDQUxFTkRBUl9EQVlfT0ZfV0VFS19DTEFTUyk7XG4gICAgdGguc2V0QXR0cmlidXRlKFwic2NvcGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG4gICAgdGguc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBrZXkpO1xuICAgIHRoLnRleHRDb250ZW50ID0gZGF5c09mV2Vla1trZXldO1xuICAgIHRhYmxlSGVhZFJvdy5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgdGgpO1xuICB9KTtcblxuICBjb25zdCB0YWJsZUJvZHkgPSBjcmVhdGVUYWJsZUJvZHkoZGF0ZXNHcmlkKTtcbiAgdGFibGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHRhYmxlQm9keSk7XG5cbiAgLy8gQ29udGFpbmVyIGZvciBZZWFycywgTW9udGhzLCBhbmQgRGF5c1xuICBjb25zdCBkYXRlUGlja2VyQ2FsZW5kYXJDb250YWluZXIgPVxuICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9QSUNLRVIpO1xuXG4gIGRhdGVQaWNrZXJDYWxlbmRhckNvbnRhaW5lci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgdGFibGUpO1xuXG4gIGNhbGVuZGFyRWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Q2FsZW5kYXIsIGNhbGVuZGFyRWwpO1xuXG4gIGRhdGVQaWNrZXJFbC5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX0FDVElWRV9DTEFTUyk7XG5cbiAgY29uc3Qgc3RhdHVzZXMgPSBbXTtcblxuICBpZiAoaXNTYW1lRGF5KHNlbGVjdGVkRGF0ZSwgZm9jdXNlZERhdGUpKSB7XG4gICAgc3RhdHVzZXMucHVzaChcIlNlbGVjdGVkIGRhdGVcIik7XG4gIH1cblxuICBpZiAoY2FsZW5kYXJXYXNIaWRkZW4pIHtcbiAgICBzdGF0dXNlcy5wdXNoKFxuICAgICAgXCJZb3UgY2FuIG5hdmlnYXRlIGJ5IGRheSB1c2luZyBsZWZ0IGFuZCByaWdodCBhcnJvd3NcIixcbiAgICAgIFwiV2Vla3MgYnkgdXNpbmcgdXAgYW5kIGRvd24gYXJyb3dzXCIsXG4gICAgICBcIk1vbnRocyBieSB1c2luZyBwYWdlIHVwIGFuZCBwYWdlIGRvd24ga2V5c1wiLFxuICAgICAgXCJZZWFycyBieSB1c2luZyBzaGlmdCBwbHVzIHBhZ2UgdXAgYW5kIHNoaWZ0IHBsdXMgcGFnZSBkb3duXCIsXG4gICAgICBcIkhvbWUgYW5kIGVuZCBrZXlzIG5hdmlnYXRlIHRvIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHdlZWtcIlxuICAgICk7XG4gICAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBcIlwiO1xuICB9IGVsc2Uge1xuICAgIHN0YXR1c2VzLnB1c2goYCR7bW9udGhMYWJlbH0gJHtmb2N1c2VkWWVhcn1gKTtcbiAgfVxuICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IHN0YXR1c2VzLmpvaW4oXCIuIFwiKTtcblxuICByZXR1cm4gbmV3Q2FsZW5kYXI7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlQcmV2aW91c1llYXIgPSAoX2J1dHRvbkVsKSA9PiB7XG4gIGlmIChfYnV0dG9uRWwuZGlzYWJsZWQpIHJldHVybjtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoX2J1dHRvbkVsKTtcbiAgbGV0IGRhdGUgPSBzdWJZZWFycyhjYWxlbmRhckRhdGUsIDEpO1xuICBkYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBjb25zdCBuZXdDYWxlbmRhciA9IHJlbmRlckNhbGVuZGFyKGNhbGVuZGFyRWwsIGRhdGUpO1xuXG4gIGxldCBuZXh0VG9Gb2N1cyA9IG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfUFJFVklPVVNfWUVBUik7XG4gIGlmIChuZXh0VG9Gb2N1cy5kaXNhYmxlZCkge1xuICAgIG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX1BJQ0tFUik7XG4gIH1cbiAgbmV4dFRvRm9jdXMuZm9jdXMoKTtcbn07XG5cbi8qKlxuICogTmF2aWdhdGUgYmFjayBvbmUgbW9udGggYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlQcmV2aW91c01vbnRoID0gKF9idXR0b25FbCkgPT4ge1xuICBpZiAoX2J1dHRvbkVsLmRpc2FibGVkKSByZXR1cm47XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgY2FsZW5kYXJEYXRlLCBtaW5EYXRlLCBtYXhEYXRlIH0gPVxuICAgIGdldERhdGVQaWNrZXJDb250ZXh0KF9idXR0b25FbCk7XG4gIGxldCBkYXRlID0gc3ViTW9udGhzKGNhbGVuZGFyRGF0ZSwgMSk7XG4gIGRhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZSk7XG5cbiAgbGV0IG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9QUkVWSU9VU19NT05USCk7XG4gIGlmIChuZXh0VG9Gb2N1cy5kaXNhYmxlZCkge1xuICAgIG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX1BJQ0tFUik7XG4gIH1cbiAgbmV4dFRvRm9jdXMuZm9jdXMoKTtcbn07XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCBvbmUgbW9udGggYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlOZXh0TW9udGggPSAoX2J1dHRvbkVsKSA9PiB7XG4gIGlmIChfYnV0dG9uRWwuZGlzYWJsZWQpIHJldHVybjtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoX2J1dHRvbkVsKTtcbiAgbGV0IGRhdGUgPSBhZGRNb250aHMoY2FsZW5kYXJEYXRlLCAxKTtcbiAgZGF0ZSA9IGtlZXBEYXRlQmV0d2Vlbk1pbkFuZE1heChkYXRlLCBtaW5EYXRlLCBtYXhEYXRlKTtcbiAgY29uc3QgbmV3Q2FsZW5kYXIgPSByZW5kZXJDYWxlbmRhcihjYWxlbmRhckVsLCBkYXRlKTtcblxuICBsZXQgbmV4dFRvRm9jdXMgPSBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX05FWFRfTU9OVEgpO1xuICBpZiAobmV4dFRvRm9jdXMuZGlzYWJsZWQpIHtcbiAgICBuZXh0VG9Gb2N1cyA9IG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9QSUNLRVIpO1xuICB9XG4gIG5leHRUb0ZvY3VzLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGZvcndhcmQgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlOZXh0WWVhciA9IChfYnV0dG9uRWwpID0+IHtcbiAgaWYgKF9idXR0b25FbC5kaXNhYmxlZCkgcmV0dXJuO1xuICBjb25zdCB7IGNhbGVuZGFyRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChfYnV0dG9uRWwpO1xuICBsZXQgZGF0ZSA9IGFkZFllYXJzKGNhbGVuZGFyRGF0ZSwgMSk7XG4gIGRhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZSk7XG5cbiAgbGV0IG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ORVhUX1lFQVIpO1xuICBpZiAobmV4dFRvRm9jdXMuZGlzYWJsZWQpIHtcbiAgICBuZXh0VG9Gb2N1cyA9IG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9QSUNLRVIpO1xuICB9XG4gIG5leHRUb0ZvY3VzLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIGNhbGVuZGFyIG9mIGEgZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgaGlkZUNhbGVuZGFyID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZGF0ZVBpY2tlckVsLCBjYWxlbmRhckVsLCBzdGF0dXNFbCB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuXG4gIGRhdGVQaWNrZXJFbC5jbGFzc0xpc3QucmVtb3ZlKERBVEVfUElDS0VSX0FDVElWRV9DTEFTUyk7XG4gIGNhbGVuZGFyRWwuaGlkZGVuID0gdHJ1ZTtcbiAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBcIlwiO1xufTtcblxuLyoqXG4gKiBTZWxlY3QgYSBkYXRlIHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGNhbGVuZGFyRGF0ZUVsIEEgZGF0ZSBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IHNlbGVjdERhdGUgPSAoY2FsZW5kYXJEYXRlRWwpID0+IHtcbiAgaWYgKGNhbGVuZGFyRGF0ZUVsLmRpc2FibGVkKSByZXR1cm47XG5cbiAgY29uc3QgeyBkYXRlUGlja2VyRWwsIGV4dGVybmFsSW5wdXRFbCB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChjYWxlbmRhckRhdGVFbCk7XG5cbiAgc2V0Q2FsZW5kYXJWYWx1ZShjYWxlbmRhckRhdGVFbCwgY2FsZW5kYXJEYXRlRWwuZGF0YXNldC52YWx1ZSk7XG4gIGhpZGVDYWxlbmRhcihkYXRlUGlja2VyRWwpO1xuXG4gIGV4dGVybmFsSW5wdXRFbC5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgdG9nZ2xlQ2FsZW5kYXIgPSAoZWwpID0+IHtcbiAgaWYgKGVsLmRpc2FibGVkKSByZXR1cm47XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgaW5wdXREYXRlLCBtaW5EYXRlLCBtYXhEYXRlLCBkZWZhdWx0RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG5cbiAgaWYgKGNhbGVuZGFyRWwuaGlkZGVuKSB7XG4gICAgY29uc3QgZGF0ZVRvRGlzcGxheSA9IGtlZXBEYXRlQmV0d2Vlbk1pbkFuZE1heChcbiAgICAgIGlucHV0RGF0ZSB8fCBkZWZhdWx0RGF0ZSB8fCB0b2RheSgpLFxuICAgICAgbWluRGF0ZSxcbiAgICAgIG1heERhdGVcbiAgICApO1xuICAgIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZVRvRGlzcGxheSk7XG4gICAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX0ZPQ1VTRUQpLmZvY3VzKCk7XG4gIH0gZWxzZSB7XG4gICAgaGlkZUNhbGVuZGFyKGVsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGNhbGVuZGFyIHdoZW4gdmlzaWJsZS5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBhbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXJcbiAqL1xuY29uc3QgdXBkYXRlQ2FsZW5kYXJJZlZpc2libGUgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBpbnB1dERhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgY2FsZW5kYXJTaG93biA9ICFjYWxlbmRhckVsLmhpZGRlbjtcblxuICBpZiAoY2FsZW5kYXJTaG93biAmJiBpbnB1dERhdGUpIHtcbiAgICBjb25zdCBkYXRlVG9EaXNwbGF5ID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGlucHV0RGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gICAgcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZVRvRGlzcGxheSk7XG4gIH1cbn07XG5cbi8vICNlbmRyZWdpb24gQ2FsZW5kYXIgLSBEYXRlIFNlbGVjdGlvbiBWaWV3XG5cbi8vICNyZWdpb24gQ2FsZW5kYXIgLSBNb250aCBTZWxlY3Rpb24gVmlld1xuLyoqXG4gKiBEaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuIGluIHRoZSBkYXRlIHBpY2tlci5cbiAqXG4gKiBAcGFyYW0ge0hUTUxCdXR0b25FbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgY2FsZW5kYXIgZWxlbWVudFxuICovXG5jb25zdCBkaXNwbGF5TW9udGhTZWxlY3Rpb24gPSAoZWwsIG1vbnRoVG9EaXNwbGF5KSA9PiB7XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgc3RhdHVzRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG5cbiAgY29uc3Qgc2VsZWN0ZWRNb250aCA9IGNhbGVuZGFyRGF0ZS5nZXRNb250aCgpO1xuICBjb25zdCBmb2N1c2VkTW9udGggPSBtb250aFRvRGlzcGxheSA9PSBudWxsID8gc2VsZWN0ZWRNb250aCA6IG1vbnRoVG9EaXNwbGF5O1xuXG4gIGNvbnN0IG1vbnRocyA9IE1PTlRIX0xBQkVMUy5tYXAoKG1vbnRoLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG1vbnRoVG9DaGVjayA9IHNldE1vbnRoKGNhbGVuZGFyRGF0ZSwgaW5kZXgpO1xuXG4gICAgY29uc3QgaXNEaXNhYmxlZCA9IGlzRGF0ZXNNb250aE91dHNpZGVNaW5Pck1heChcbiAgICAgIG1vbnRoVG9DaGVjayxcbiAgICAgIG1pbkRhdGUsXG4gICAgICBtYXhEYXRlXG4gICAgKTtcblxuICAgIGxldCB0YWJpbmRleCA9IFwiLTFcIjtcblxuICAgIGNvbnN0IGNsYXNzZXMgPSBbQ0FMRU5EQVJfTU9OVEhfQ0xBU1NdO1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpbmRleCA9PT0gc2VsZWN0ZWRNb250aDtcblxuICAgIGlmIChpbmRleCA9PT0gZm9jdXNlZE1vbnRoKSB7XG4gICAgICB0YWJpbmRleCA9IFwiMFwiO1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX01PTlRIX0ZPQ1VTRURfQ0xBU1MpO1xuICAgIH1cblxuICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfTU9OVEhfU0VMRUNURURfQ0xBU1MpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJidXR0b25cIik7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRhYmluZGV4KTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY2xhc3Nlcy5qb2luKFwiIFwiKSk7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcImRhdGEtdmFsdWVcIiwgaW5kZXgpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJkYXRhLWxhYmVsXCIsIG1vbnRoKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBpc1NlbGVjdGVkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpO1xuICAgIGlmIChpc0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBidG4udGV4dENvbnRlbnQgPSBtb250aDtcblxuICAgIHJldHVybiBidG47XG4gIH0pO1xuXG4gIGNvbnN0IG1vbnRoc0h0bWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBtb250aHNIdG1sLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIik7XG4gIG1vbnRoc0h0bWwuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfTU9OVEhfUElDS0VSX0NMQVNTKTtcblxuICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0YWJsZVwiKTtcbiAgdGFibGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MpO1xuICB0YWJsZS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwicHJlc2VudGF0aW9uXCIpO1xuXG4gIGNvbnN0IG1vbnRoc0dyaWQgPSBsaXN0VG9HcmlkSHRtbChtb250aHMsIDMpO1xuICBjb25zdCB0YWJsZUJvZHkgPSBjcmVhdGVUYWJsZUJvZHkobW9udGhzR3JpZCk7XG4gIHRhYmxlLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB0YWJsZUJvZHkpO1xuICBtb250aHNIdG1sLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB0YWJsZSk7XG5cbiAgY29uc3QgbmV3Q2FsZW5kYXIgPSBjYWxlbmRhckVsLmNsb25lTm9kZSgpO1xuICBuZXdDYWxlbmRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgbW9udGhzSHRtbCk7XG4gIGNhbGVuZGFyRWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Q2FsZW5kYXIsIGNhbGVuZGFyRWwpO1xuXG4gIHN0YXR1c0VsLnRleHRDb250ZW50ID0gXCJTZWxlY3QgYSBtb250aC5cIjtcblxuICByZXR1cm4gbmV3Q2FsZW5kYXI7XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhIG1vbnRoIGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gbW9udGhFbCBBbiBtb250aCBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IHNlbGVjdE1vbnRoID0gKG1vbnRoRWwpID0+IHtcbiAgaWYgKG1vbnRoRWwuZGlzYWJsZWQpIHJldHVybjtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQobW9udGhFbCk7XG4gIGNvbnN0IHNlbGVjdGVkTW9udGggPSBwYXJzZUludChtb250aEVsLmRhdGFzZXQudmFsdWUsIDEwKTtcbiAgbGV0IGRhdGUgPSBzZXRNb250aChjYWxlbmRhckRhdGUsIHNlbGVjdGVkTW9udGgpO1xuICBkYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBjb25zdCBuZXdDYWxlbmRhciA9IHJlbmRlckNhbGVuZGFyKGNhbGVuZGFyRWwsIGRhdGUpO1xuICBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX0RBVEVfRk9DVVNFRCkuZm9jdXMoKTtcbn07XG5cbi8vICNlbmRyZWdpb24gQ2FsZW5kYXIgLSBNb250aCBTZWxlY3Rpb24gVmlld1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIC0gWWVhciBTZWxlY3Rpb24gVmlld1xuXG4vKipcbiAqIERpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbiBpbiB0aGUgZGF0ZSBwaWNrZXIuXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICogQHBhcmFtIHtudW1iZXJ9IHllYXJUb0Rpc3BsYXkgeWVhciB0byBkaXNwbGF5IGluIHllYXIgc2VsZWN0aW9uXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgY2FsZW5kYXIgZWxlbWVudFxuICovXG5jb25zdCBkaXNwbGF5WWVhclNlbGVjdGlvbiA9IChlbCwgeWVhclRvRGlzcGxheSkgPT4ge1xuICBjb25zdCB7IGNhbGVuZGFyRWwsIHN0YXR1c0VsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuXG4gIGNvbnN0IHNlbGVjdGVkWWVhciA9IGNhbGVuZGFyRGF0ZS5nZXRGdWxsWWVhcigpO1xuICBjb25zdCBmb2N1c2VkWWVhciA9IHllYXJUb0Rpc3BsYXkgPT0gbnVsbCA/IHNlbGVjdGVkWWVhciA6IHllYXJUb0Rpc3BsYXk7XG5cbiAgbGV0IHllYXJUb0NodW5rID0gZm9jdXNlZFllYXI7XG4gIHllYXJUb0NodW5rIC09IHllYXJUb0NodW5rICUgWUVBUl9DSFVOSztcbiAgeWVhclRvQ2h1bmsgPSBNYXRoLm1heCgwLCB5ZWFyVG9DaHVuayk7XG5cbiAgY29uc3QgcHJldlllYXJDaHVua0Rpc2FibGVkID0gaXNEYXRlc1llYXJPdXRzaWRlTWluT3JNYXgoXG4gICAgc2V0WWVhcihjYWxlbmRhckRhdGUsIHllYXJUb0NodW5rIC0gMSksXG4gICAgbWluRGF0ZSxcbiAgICBtYXhEYXRlXG4gICk7XG5cbiAgY29uc3QgbmV4dFllYXJDaHVua0Rpc2FibGVkID0gaXNEYXRlc1llYXJPdXRzaWRlTWluT3JNYXgoXG4gICAgc2V0WWVhcihjYWxlbmRhckRhdGUsIHllYXJUb0NodW5rICsgWUVBUl9DSFVOSyksXG4gICAgbWluRGF0ZSxcbiAgICBtYXhEYXRlXG4gICk7XG5cbiAgY29uc3QgeWVhcnMgPSBbXTtcbiAgbGV0IHllYXJJbmRleCA9IHllYXJUb0NodW5rO1xuICB3aGlsZSAoeWVhcnMubGVuZ3RoIDwgWUVBUl9DSFVOSykge1xuICAgIGNvbnN0IGlzRGlzYWJsZWQgPSBpc0RhdGVzWWVhck91dHNpZGVNaW5Pck1heChcbiAgICAgIHNldFllYXIoY2FsZW5kYXJEYXRlLCB5ZWFySW5kZXgpLFxuICAgICAgbWluRGF0ZSxcbiAgICAgIG1heERhdGVcbiAgICApO1xuXG4gICAgbGV0IHRhYmluZGV4ID0gXCItMVwiO1xuXG4gICAgY29uc3QgY2xhc3NlcyA9IFtDQUxFTkRBUl9ZRUFSX0NMQVNTXTtcbiAgICBjb25zdCBpc1NlbGVjdGVkID0geWVhckluZGV4ID09PSBzZWxlY3RlZFllYXI7XG5cbiAgICBpZiAoeWVhckluZGV4ID09PSBmb2N1c2VkWWVhcikge1xuICAgICAgdGFiaW5kZXggPSBcIjBcIjtcbiAgICAgIGNsYXNzZXMucHVzaChDQUxFTkRBUl9ZRUFSX0ZPQ1VTRURfQ0xBU1MpO1xuICAgIH1cblxuICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfWUVBUl9TRUxFQ1RFRF9DTEFTUyk7XG4gICAgfVxuXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImJ1dHRvblwiKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdGFiaW5kZXgpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBjbGFzc2VzLmpvaW4oXCIgXCIpKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiZGF0YS12YWx1ZVwiLCB5ZWFySW5kZXgpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNlbGVjdGVkXCIsIGlzU2VsZWN0ZWQgPyBcInRydWVcIiA6IFwiZmFsc2VcIik7XG4gICAgaWYgKGlzRGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuICAgIGJ0bi50ZXh0Q29udGVudCA9IHllYXJJbmRleDtcblxuICAgIHllYXJzLnB1c2goYnRuKTtcbiAgICB5ZWFySW5kZXggKz0gMTtcbiAgfVxuXG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gY2FsZW5kYXJFbC5jbG9uZU5vZGUoKTtcblxuICAvLyBjcmVhdGUgdGhlIHllYXJzIGNhbGVuZGFyIHdyYXBwZXJcbiAgY29uc3QgeWVhcnNDYWxlbmRhcldyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICB5ZWFyc0NhbGVuZGFyV3JhcHBlci5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIi0xXCIpO1xuICB5ZWFyc0NhbGVuZGFyV3JhcHBlci5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBDQUxFTkRBUl9ZRUFSX1BJQ0tFUl9DTEFTUyk7XG5cbiAgLy8gY3JlYXRlIHRhYmxlIHBhcmVudFxuICBjb25zdCB5ZWFyc1RhYmxlUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRhYmxlXCIpO1xuICB5ZWFyc1RhYmxlUGFyZW50LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG4gIHllYXJzVGFibGVQYXJlbnQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MpO1xuXG4gIC8vIGNyZWF0ZSB0YWJsZSBib2R5IGFuZCB0YWJsZSByb3dcbiAgY29uc3QgeWVhcnNIVE1MVGFibGVCb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRib2R5XCIpO1xuICBjb25zdCB5ZWFyc0hUTUxUYWJsZUJvZHlSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XG5cbiAgLy8gY3JlYXRlIHByZXZpb3VzIGJ1dHRvblxuICBjb25zdCBwcmV2aW91c1llYXJzQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgcHJldmlvdXNZZWFyc0J0bi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICBwcmV2aW91c1llYXJzQnRuLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIENBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0hVTktfQ0xBU1MpO1xuICBwcmV2aW91c1llYXJzQnRuLnNldEF0dHJpYnV0ZShcbiAgICBcImFyaWEtbGFiZWxcIixcbiAgICBgTmF2aWdhdGUgYmFjayAke1lFQVJfQ0hVTkt9IHllYXJzYFxuICApO1xuICBpZiAocHJldlllYXJDaHVua0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgcHJldmlvdXNZZWFyc0J0bi5kaXNhYmxlZCA9IHRydWU7XG4gIH1cbiAgcHJldmlvdXNZZWFyc0J0bi5pbm5lckhUTUwgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGAmbmJzcGA7XG5cbiAgLy8gY3JlYXRlIG5leHQgYnV0dG9uXG4gIGNvbnN0IG5leHRZZWFyc0J0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gIG5leHRZZWFyc0J0bi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICBuZXh0WWVhcnNCdG4uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfTkVYVF9ZRUFSX0NIVU5LX0NMQVNTKTtcbiAgbmV4dFllYXJzQnRuLnNldEF0dHJpYnV0ZShcbiAgICBcImFyaWEtbGFiZWxcIixcbiAgICBgTmF2aWdhdGUgZm9yd2FyZCAke1lFQVJfQ0hVTkt9IHllYXJzYFxuICApO1xuICBpZiAobmV4dFllYXJDaHVua0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgbmV4dFllYXJzQnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgfVxuICBuZXh0WWVhcnNCdG4uaW5uZXJIVE1MID0gU2FuaXRpemVyLmVzY2FwZUhUTUxgJm5ic3BgO1xuXG4gIC8vIGNyZWF0ZSB0aGUgYWN0dWFsIHllYXJzIHRhYmxlXG4gIGNvbnN0IHllYXJzVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGFibGVcIik7XG4gIHllYXJzVGFibGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MpO1xuICB5ZWFyc1RhYmxlLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG5cbiAgLy8gY3JlYXRlIHRoZSB5ZWFycyBjaGlsZCB0YWJsZVxuICBjb25zdCB5ZWFyc0dyaWQgPSBsaXN0VG9HcmlkSHRtbCh5ZWFycywgMyk7XG4gIGNvbnN0IHllYXJzVGFibGVCb2R5ID0gY3JlYXRlVGFibGVCb2R5KHllYXJzR3JpZCk7XG5cbiAgLy8gYXBwZW5kIHRoZSBncmlkIHRvIHRoZSB5ZWFycyBjaGlsZCB0YWJsZVxuICB5ZWFyc1RhYmxlLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB5ZWFyc1RhYmxlQm9keSk7XG5cbiAgLy8gY3JlYXRlIHRoZSBwcmV2IGJ1dHRvbiB0ZCBhbmQgYXBwZW5kIHRoZSBwcmV2IGJ1dHRvblxuICBjb25zdCB5ZWFyc0hUTUxUYWJsZUJvZHlEZXRhaWxQcmV2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xuICB5ZWFyc0hUTUxUYWJsZUJvZHlEZXRhaWxQcmV2Lmluc2VydEFkamFjZW50RWxlbWVudChcbiAgICBcImJlZm9yZWVuZFwiLFxuICAgIHByZXZpb3VzWWVhcnNCdG5cbiAgKTtcblxuICAvLyBjcmVhdGUgdGhlIHllYXJzIHRkIGFuZCBhcHBlbmQgdGhlIHllYXJzIGNoaWxkIHRhYmxlXG4gIGNvbnN0IHllYXJzSFRNTFRhYmxlQm9keVllYXJzRGV0YWlsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xuICB5ZWFyc0hUTUxUYWJsZUJvZHlZZWFyc0RldGFpbC5zZXRBdHRyaWJ1dGUoXCJjb2xzcGFuXCIsIFwiM1wiKTtcbiAgeWVhcnNIVE1MVGFibGVCb2R5WWVhcnNEZXRhaWwuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHllYXJzVGFibGUpO1xuXG4gIC8vIGNyZWF0ZSB0aGUgbmV4dCBidXR0b24gdGQgYW5kIGFwcGVuZCB0aGUgbmV4dCBidXR0b25cbiAgY29uc3QgeWVhcnNIVE1MVGFibGVCb2R5RGV0YWlsTmV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcbiAgeWVhcnNIVE1MVGFibGVCb2R5RGV0YWlsTmV4dC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgbmV4dFllYXJzQnRuKTtcblxuICAvLyBhcHBlbmQgdGhlIHRocmVlIHRkIHRvIHRoZSB5ZWFycyBjaGlsZCB0YWJsZSByb3dcbiAgeWVhcnNIVE1MVGFibGVCb2R5Um93Lmluc2VydEFkamFjZW50RWxlbWVudChcbiAgICBcImJlZm9yZWVuZFwiLFxuICAgIHllYXJzSFRNTFRhYmxlQm9keURldGFpbFByZXZcbiAgKTtcbiAgeWVhcnNIVE1MVGFibGVCb2R5Um93Lmluc2VydEFkamFjZW50RWxlbWVudChcbiAgICBcImJlZm9yZWVuZFwiLFxuICAgIHllYXJzSFRNTFRhYmxlQm9keVllYXJzRGV0YWlsXG4gICk7XG4gIHllYXJzSFRNTFRhYmxlQm9keVJvdy5pbnNlcnRBZGphY2VudEVsZW1lbnQoXG4gICAgXCJiZWZvcmVlbmRcIixcbiAgICB5ZWFyc0hUTUxUYWJsZUJvZHlEZXRhaWxOZXh0XG4gICk7XG5cbiAgLy8gYXBwZW5kIHRoZSB0YWJsZSByb3cgdG8gdGhlIHllYXJzIGNoaWxkIHRhYmxlIGJvZHlcbiAgeWVhcnNIVE1MVGFibGVCb2R5Lmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB5ZWFyc0hUTUxUYWJsZUJvZHlSb3cpO1xuXG4gIC8vIGFwcGVuZCB0aGUgeWVhcnMgdGFibGUgYm9keSB0byB0aGUgeWVhcnMgcGFyZW50IHRhYmxlXG4gIHllYXJzVGFibGVQYXJlbnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHllYXJzSFRNTFRhYmxlQm9keSk7XG5cbiAgLy8gYXBwZW5kIHRoZSBwYXJlbnQgdGFibGUgdG8gdGhlIGNhbGVuZGFyIHdyYXBwZXJcbiAgeWVhcnNDYWxlbmRhcldyYXBwZXIuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHllYXJzVGFibGVQYXJlbnQpO1xuXG4gIC8vIGFwcGVuZCB0aGUgeWVhcnMgY2FsZW5kZXIgdG8gdGhlIG5ldyBjYWxlbmRhclxuICBuZXdDYWxlbmRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgeWVhcnNDYWxlbmRhcldyYXBwZXIpO1xuXG4gIC8vIHJlcGxhY2UgY2FsZW5kYXJcbiAgY2FsZW5kYXJFbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdDYWxlbmRhciwgY2FsZW5kYXJFbCk7XG5cbiAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGBTaG93aW5nIHllYXJzICR7eWVhclRvQ2h1bmt9IHRvICR7XG4gICAgeWVhclRvQ2h1bmsgKyBZRUFSX0NIVU5LIC0gMVxuICB9LiBTZWxlY3QgYSB5ZWFyLmA7XG5cbiAgcmV0dXJuIG5ld0NhbGVuZGFyO1xufTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBiYWNrIGJ5IHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBkaXNwbGF5UHJldmlvdXNZZWFyQ2h1bmsgPSAoZWwpID0+IHtcbiAgaWYgKGVsLmRpc2FibGVkKSByZXR1cm47XG5cbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuICBjb25zdCB5ZWFyRWwgPSBjYWxlbmRhckVsLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfWUVBUl9GT0NVU0VEKTtcbiAgY29uc3Qgc2VsZWN0ZWRZZWFyID0gcGFyc2VJbnQoeWVhckVsLnRleHRDb250ZW50LCAxMCk7XG5cbiAgbGV0IGFkanVzdGVkWWVhciA9IHNlbGVjdGVkWWVhciAtIFlFQVJfQ0hVTks7XG4gIGFkanVzdGVkWWVhciA9IE1hdGgubWF4KDAsIGFkanVzdGVkWWVhcik7XG5cbiAgY29uc3QgZGF0ZSA9IHNldFllYXIoY2FsZW5kYXJEYXRlLCBhZGp1c3RlZFllYXIpO1xuICBjb25zdCBjYXBwZWREYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlZZWFyU2VsZWN0aW9uKFxuICAgIGNhbGVuZGFyRWwsXG4gICAgY2FwcGVkRGF0ZS5nZXRGdWxsWWVhcigpXG4gICk7XG5cbiAgbGV0IG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9QUkVWSU9VU19ZRUFSX0NIVU5LKTtcbiAgaWYgKG5leHRUb0ZvY3VzLmRpc2FibGVkKSB7XG4gICAgbmV4dFRvRm9jdXMgPSBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX1lFQVJfUElDS0VSKTtcbiAgfVxuICBuZXh0VG9Gb2N1cy5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBmb3J3YXJkIGJ5IHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBkaXNwbGF5TmV4dFllYXJDaHVuayA9IChlbCkgPT4ge1xuICBpZiAoZWwuZGlzYWJsZWQpIHJldHVybjtcblxuICBjb25zdCB7IGNhbGVuZGFyRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG4gIGNvbnN0IHllYXJFbCA9IGNhbGVuZGFyRWwucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQpO1xuICBjb25zdCBzZWxlY3RlZFllYXIgPSBwYXJzZUludCh5ZWFyRWwudGV4dENvbnRlbnQsIDEwKTtcblxuICBsZXQgYWRqdXN0ZWRZZWFyID0gc2VsZWN0ZWRZZWFyICsgWUVBUl9DSFVOSztcbiAgYWRqdXN0ZWRZZWFyID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWRZZWFyKTtcblxuICBjb25zdCBkYXRlID0gc2V0WWVhcihjYWxlbmRhckRhdGUsIGFkanVzdGVkWWVhcik7XG4gIGNvbnN0IGNhcHBlZERhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gZGlzcGxheVllYXJTZWxlY3Rpb24oXG4gICAgY2FsZW5kYXJFbCxcbiAgICBjYXBwZWREYXRlLmdldEZ1bGxZZWFyKClcbiAgKTtcblxuICBsZXQgbmV4dFRvRm9jdXMgPSBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX05FWFRfWUVBUl9DSFVOSyk7XG4gIGlmIChuZXh0VG9Gb2N1cy5kaXNhYmxlZCkge1xuICAgIG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX1BJQ0tFUik7XG4gIH1cbiAgbmV4dFRvRm9jdXMuZm9jdXMoKTtcbn07XG5cbi8qKlxuICogU2VsZWN0IGEgeWVhciBpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IHllYXJFbCBBIHllYXIgZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBzZWxlY3RZZWFyID0gKHllYXJFbCkgPT4ge1xuICBpZiAoeWVhckVsLmRpc2FibGVkKSByZXR1cm47XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgY2FsZW5kYXJEYXRlLCBtaW5EYXRlLCBtYXhEYXRlIH0gPVxuICAgIGdldERhdGVQaWNrZXJDb250ZXh0KHllYXJFbCk7XG4gIGNvbnN0IHNlbGVjdGVkWWVhciA9IHBhcnNlSW50KHllYXJFbC5pbm5lckhUTUwsIDEwKTtcbiAgbGV0IGRhdGUgPSBzZXRZZWFyKGNhbGVuZGFyRGF0ZSwgc2VsZWN0ZWRZZWFyKTtcbiAgZGF0ZSA9IGtlZXBEYXRlQmV0d2Vlbk1pbkFuZE1heChkYXRlLCBtaW5EYXRlLCBtYXhEYXRlKTtcbiAgY29uc3QgbmV3Q2FsZW5kYXIgPSByZW5kZXJDYWxlbmRhcihjYWxlbmRhckVsLCBkYXRlKTtcbiAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX0ZPQ1VTRUQpLmZvY3VzKCk7XG59O1xuXG4vLyAjZW5kcmVnaW9uIENhbGVuZGFyIC0gWWVhciBTZWxlY3Rpb24gVmlld1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIEV2ZW50IEhhbmRsaW5nXG5cbi8qKlxuICogSGlkZSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFc2NhcGVGcm9tQ2FsZW5kYXIgPSAoZXZlbnQpID0+IHtcbiAgY29uc3QgeyBkYXRlUGlja2VyRWwsIGV4dGVybmFsSW5wdXRFbCB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoZXZlbnQudGFyZ2V0KTtcblxuICBoaWRlQ2FsZW5kYXIoZGF0ZVBpY2tlckVsKTtcbiAgZXh0ZXJuYWxJbnB1dEVsLmZvY3VzKCk7XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn07XG5cbi8vICNlbmRyZWdpb24gQ2FsZW5kYXIgRXZlbnQgSGFuZGxpbmdcblxuLy8gI3JlZ2lvbiBDYWxlbmRhciBEYXRlIEV2ZW50IEhhbmRsaW5nXG5cbi8qKlxuICogQWRqdXN0IHRoZSBkYXRlIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhciBpZiBuZWVkZWQuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gYWRqdXN0RGF0ZUZuIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBhZGp1c3RDYWxlbmRhciA9IChhZGp1c3REYXRlRm4pID0+IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNhbGVuZGFyRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoXG4gICAgZXZlbnQudGFyZ2V0XG4gICk7XG5cbiAgY29uc3QgZGF0ZSA9IGFkanVzdERhdGVGbihjYWxlbmRhckRhdGUpO1xuXG4gIGNvbnN0IGNhcHBlZERhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGlmICghaXNTYW1lRGF5KGNhbGVuZGFyRGF0ZSwgY2FwcGVkRGF0ZSkpIHtcbiAgICBjb25zdCBuZXdDYWxlbmRhciA9IHJlbmRlckNhbGVuZGFyKGNhbGVuZGFyRWwsIGNhcHBlZERhdGUpO1xuICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9GT0NVU0VEKS5mb2N1cygpO1xuICB9XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIHdlZWsgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlVXBGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBzdWJXZWVrcyhkYXRlLCAxKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCBvbmUgd2VlayBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVEb3duRnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gYWRkV2Vla3MoZGF0ZSwgMSkpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIGRheSBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVMZWZ0RnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gc3ViRGF5cyhkYXRlLCAxKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCBvbmUgZGF5IGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVJpZ2h0RnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gYWRkRGF5cyhkYXRlLCAxKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIHN0YXJ0IG9mIHRoZSB3ZWVrIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZUhvbWVGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBzdGFydE9mV2VlayhkYXRlKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIGVuZCBvZiB0aGUgd2VlayBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFbmRGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBlbmRPZldlZWsoZGF0ZSkpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGZvcndhcmQgb25lIG1vbnRoIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVBhZ2VEb3duRnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gYWRkTW9udGhzKGRhdGUsIDEpKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBiYWNrIG9uZSBtb250aCBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVQYWdlVXBGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBzdWJNb250aHMoZGF0ZSwgMSkpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGZvcndhcmQgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlU2hpZnRQYWdlRG93bkZyb21EYXRlID0gYWRqdXN0Q2FsZW5kYXIoKGRhdGUpID0+IGFkZFllYXJzKGRhdGUsIDEpKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBiYWNrIG9uZSB5ZWFyIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVNoaWZ0UGFnZVVwRnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gc3ViWWVhcnMoZGF0ZSwgMSkpO1xuXG4vKipcbiAqIGRpc3BsYXkgdGhlIGNhbGVuZGFyIGZvciB0aGUgbW91c2VvdmVyIGRhdGUuXG4gKlxuICogQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudCBUaGUgbW91c2VvdmVyIGV2ZW50XG4gKiBAcGFyYW0ge0hUTUxCdXR0b25FbGVtZW50fSBkYXRlRWwgQSBkYXRlIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlTW91c2VvdmVyRnJvbURhdGUgPSAoZGF0ZUVsKSA9PiB7XG4gIGlmIChkYXRlRWwuZGlzYWJsZWQpIHJldHVybjtcblxuICBjb25zdCBjYWxlbmRhckVsID0gZGF0ZUVsLmNsb3Nlc3QoREFURV9QSUNLRVJfQ0FMRU5EQVIpO1xuXG4gIGNvbnN0IGN1cnJlbnRDYWxlbmRhckRhdGUgPSBjYWxlbmRhckVsLmRhdGFzZXQudmFsdWU7XG4gIGNvbnN0IGhvdmVyRGF0ZSA9IGRhdGVFbC5kYXRhc2V0LnZhbHVlO1xuXG4gIGlmIChob3ZlckRhdGUgPT09IGN1cnJlbnRDYWxlbmRhckRhdGUpIHJldHVybjtcblxuICBjb25zdCBkYXRlVG9EaXNwbGF5ID0gcGFyc2VEYXRlU3RyaW5nKGhvdmVyRGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZVRvRGlzcGxheSk7XG4gIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9GT0NVU0VEKS5mb2N1cygpO1xufTtcblxuLy8gI2VuZHJlZ2lvbiBDYWxlbmRhciBEYXRlIEV2ZW50IEhhbmRsaW5nXG5cbi8vICNyZWdpb24gQ2FsZW5kYXIgTW9udGggRXZlbnQgSGFuZGxpbmdcblxuLyoqXG4gKiBBZGp1c3QgdGhlIG1vbnRoIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuIGlmIG5lZWRlZC5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBhZGp1c3RNb250aEZuIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWRqdXN0ZWQgbW9udGhcbiAqL1xuY29uc3QgYWRqdXN0TW9udGhTZWxlY3Rpb25TY3JlZW4gPSAoYWRqdXN0TW9udGhGbikgPT4gKGV2ZW50KSA9PiB7XG4gIGNvbnN0IG1vbnRoRWwgPSBldmVudC50YXJnZXQ7XG4gIGNvbnN0IHNlbGVjdGVkTW9udGggPSBwYXJzZUludChtb250aEVsLmRhdGFzZXQudmFsdWUsIDEwKTtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQobW9udGhFbCk7XG4gIGNvbnN0IGN1cnJlbnREYXRlID0gc2V0TW9udGgoY2FsZW5kYXJEYXRlLCBzZWxlY3RlZE1vbnRoKTtcblxuICBsZXQgYWRqdXN0ZWRNb250aCA9IGFkanVzdE1vbnRoRm4oc2VsZWN0ZWRNb250aCk7XG4gIGFkanVzdGVkTW9udGggPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMSwgYWRqdXN0ZWRNb250aCkpO1xuXG4gIGNvbnN0IGRhdGUgPSBzZXRNb250aChjYWxlbmRhckRhdGUsIGFkanVzdGVkTW9udGgpO1xuICBjb25zdCBjYXBwZWREYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBpZiAoIWlzU2FtZU1vbnRoKGN1cnJlbnREYXRlLCBjYXBwZWREYXRlKSkge1xuICAgIGNvbnN0IG5ld0NhbGVuZGFyID0gZGlzcGxheU1vbnRoU2VsZWN0aW9uKFxuICAgICAgY2FsZW5kYXJFbCxcbiAgICAgIGNhcHBlZERhdGUuZ2V0TW9udGgoKVxuICAgICk7XG4gICAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9NT05USF9GT0NVU0VEKS5mb2N1cygpO1xuICB9XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgdGhyZWUgbW9udGhzIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlVXBGcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbigobW9udGgpID0+IG1vbnRoIC0gMyk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCB0aHJlZSBtb250aHMgYW5kIGRpc3BsYXkgdGhlIG1vbnRoIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVEb3duRnJvbU1vbnRoID0gYWRqdXN0TW9udGhTZWxlY3Rpb25TY3JlZW4oKG1vbnRoKSA9PiBtb250aCArIDMpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIG1vbnRoIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlTGVmdEZyb21Nb250aCA9IGFkanVzdE1vbnRoU2VsZWN0aW9uU2NyZWVuKChtb250aCkgPT4gbW9udGggLSAxKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBmb3J3YXJkIG9uZSBtb250aCBhbmQgZGlzcGxheSB0aGUgbW9udGggc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVJpZ2h0RnJvbU1vbnRoID0gYWRqdXN0TW9udGhTZWxlY3Rpb25TY3JlZW4oKG1vbnRoKSA9PiBtb250aCArIDEpO1xuXG4vKipcbiAqIE5hdmlnYXRlIHRvIHRoZSBzdGFydCBvZiB0aGUgcm93IG9mIG1vbnRocyBhbmQgZGlzcGxheSB0aGUgbW9udGggc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZUhvbWVGcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbihcbiAgKG1vbnRoKSA9PiBtb250aCAtIChtb250aCAlIDMpXG4pO1xuXG4vKipcbiAqIE5hdmlnYXRlIHRvIHRoZSBlbmQgb2YgdGhlIHJvdyBvZiBtb250aHMgYW5kIGRpc3BsYXkgdGhlIG1vbnRoIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFbmRGcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbihcbiAgKG1vbnRoKSA9PiBtb250aCArIDIgLSAobW9udGggJSAzKVxuKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSB0byB0aGUgbGFzdCBtb250aCAoRGVjZW1iZXIpIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlUGFnZURvd25Gcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbigoKSA9PiAxMSk7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIGZpcnN0IG1vbnRoIChKYW51YXJ5KSBhbmQgZGlzcGxheSB0aGUgbW9udGggc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVBhZ2VVcEZyb21Nb250aCA9IGFkanVzdE1vbnRoU2VsZWN0aW9uU2NyZWVuKCgpID0+IDApO1xuXG4vKipcbiAqIHVwZGF0ZSB0aGUgZm9jdXMgb24gYSBtb250aCB3aGVuIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50IFRoZSBtb3VzZW92ZXIgZXZlbnRcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IG1vbnRoRWwgQSBtb250aCBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGhhbmRsZU1vdXNlb3ZlckZyb21Nb250aCA9IChtb250aEVsKSA9PiB7XG4gIGlmIChtb250aEVsLmRpc2FibGVkKSByZXR1cm47XG4gIGlmIChtb250aEVsLmNsYXNzTGlzdC5jb250YWlucyhDQUxFTkRBUl9NT05USF9GT0NVU0VEX0NMQVNTKSkgcmV0dXJuO1xuXG4gIGNvbnN0IGZvY3VzTW9udGggPSBwYXJzZUludChtb250aEVsLmRhdGFzZXQudmFsdWUsIDEwKTtcblxuICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlNb250aFNlbGVjdGlvbihtb250aEVsLCBmb2N1c01vbnRoKTtcbiAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9NT05USF9GT0NVU0VEKS5mb2N1cygpO1xufTtcblxuLy8gI2VuZHJlZ2lvbiBDYWxlbmRhciBNb250aCBFdmVudCBIYW5kbGluZ1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIFllYXIgRXZlbnQgSGFuZGxpbmdcblxuLyoqXG4gKiBBZGp1c3QgdGhlIHllYXIgYW5kIGRpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbiBpZiBuZWVkZWQuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gYWRqdXN0WWVhckZuIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWRqdXN0ZWQgeWVhclxuICovXG5jb25zdCBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuID0gKGFkanVzdFllYXJGbikgPT4gKGV2ZW50KSA9PiB7XG4gIGNvbnN0IHllYXJFbCA9IGV2ZW50LnRhcmdldDtcbiAgY29uc3Qgc2VsZWN0ZWRZZWFyID0gcGFyc2VJbnQoeWVhckVsLmRhdGFzZXQudmFsdWUsIDEwKTtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoeWVhckVsKTtcbiAgY29uc3QgY3VycmVudERhdGUgPSBzZXRZZWFyKGNhbGVuZGFyRGF0ZSwgc2VsZWN0ZWRZZWFyKTtcblxuICBsZXQgYWRqdXN0ZWRZZWFyID0gYWRqdXN0WWVhckZuKHNlbGVjdGVkWWVhcik7XG4gIGFkanVzdGVkWWVhciA9IE1hdGgubWF4KDAsIGFkanVzdGVkWWVhcik7XG5cbiAgY29uc3QgZGF0ZSA9IHNldFllYXIoY2FsZW5kYXJEYXRlLCBhZGp1c3RlZFllYXIpO1xuICBjb25zdCBjYXBwZWREYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBpZiAoIWlzU2FtZVllYXIoY3VycmVudERhdGUsIGNhcHBlZERhdGUpKSB7XG4gICAgY29uc3QgbmV3Q2FsZW5kYXIgPSBkaXNwbGF5WWVhclNlbGVjdGlvbihcbiAgICAgIGNhbGVuZGFyRWwsXG4gICAgICBjYXBwZWREYXRlLmdldEZ1bGxZZWFyKClcbiAgICApO1xuICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfWUVBUl9GT0NVU0VEKS5mb2N1cygpO1xuICB9XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgdGhyZWUgeWVhcnMgYW5kIGRpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVVwRnJvbVllYXIgPSBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuKCh5ZWFyKSA9PiB5ZWFyIC0gMyk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCB0aHJlZSB5ZWFycyBhbmQgZGlzcGxheSB0aGUgeWVhciBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlRG93bkZyb21ZZWFyID0gYWRqdXN0WWVhclNlbGVjdGlvblNjcmVlbigoeWVhcikgPT4geWVhciArIDMpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZUxlZnRGcm9tWWVhciA9IGFkanVzdFllYXJTZWxlY3Rpb25TY3JlZW4oKHllYXIpID0+IHllYXIgLSAxKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBmb3J3YXJkIG9uZSB5ZWFyIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVSaWdodEZyb21ZZWFyID0gYWRqdXN0WWVhclNlbGVjdGlvblNjcmVlbigoeWVhcikgPT4geWVhciArIDEpO1xuXG4vKipcbiAqIE5hdmlnYXRlIHRvIHRoZSBzdGFydCBvZiB0aGUgcm93IG9mIHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVIb21lRnJvbVllYXIgPSBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuKFxuICAoeWVhcikgPT4geWVhciAtICh5ZWFyICUgMylcbik7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIGVuZCBvZiB0aGUgcm93IG9mIHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFbmRGcm9tWWVhciA9IGFkanVzdFllYXJTZWxlY3Rpb25TY3JlZW4oXG4gICh5ZWFyKSA9PiB5ZWFyICsgMiAtICh5ZWFyICUgMylcbik7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gYmFjayAxMiB5ZWFycyBhbmQgZGlzcGxheSB0aGUgeWVhciBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlUGFnZVVwRnJvbVllYXIgPSBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuKFxuICAoeWVhcikgPT4geWVhciAtIFlFQVJfQ0hVTktcbik7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCAxMiB5ZWFycyBhbmQgZGlzcGxheSB0aGUgeWVhciBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlUGFnZURvd25Gcm9tWWVhciA9IGFkanVzdFllYXJTZWxlY3Rpb25TY3JlZW4oXG4gICh5ZWFyKSA9PiB5ZWFyICsgWUVBUl9DSFVOS1xuKTtcblxuLyoqXG4gKiB1cGRhdGUgdGhlIGZvY3VzIG9uIGEgeWVhciB3aGVuIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50IFRoZSBtb3VzZW92ZXIgZXZlbnRcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGRhdGVFbCBBIHllYXIgZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVNb3VzZW92ZXJGcm9tWWVhciA9ICh5ZWFyRWwpID0+IHtcbiAgaWYgKHllYXJFbC5kaXNhYmxlZCkgcmV0dXJuO1xuICBpZiAoeWVhckVsLmNsYXNzTGlzdC5jb250YWlucyhDQUxFTkRBUl9ZRUFSX0ZPQ1VTRURfQ0xBU1MpKSByZXR1cm47XG5cbiAgY29uc3QgZm9jdXNZZWFyID0gcGFyc2VJbnQoeWVhckVsLmRhdGFzZXQudmFsdWUsIDEwKTtcblxuICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlZZWFyU2VsZWN0aW9uKHllYXJFbCwgZm9jdXNZZWFyKTtcbiAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQpLmZvY3VzKCk7XG59O1xuXG4vLyAjZW5kcmVnaW9uIENhbGVuZGFyIFllYXIgRXZlbnQgSGFuZGxpbmdcblxuLy8gI3JlZ2lvbiBGb2N1cyBIYW5kbGluZyBFdmVudCBIYW5kbGluZ1xuXG5jb25zdCB0YWJIYW5kbGVyID0gKGZvY3VzYWJsZSkgPT4ge1xuICBjb25zdCBnZXRGb2N1c2FibGVDb250ZXh0ID0gKGVsKSA9PiB7XG4gICAgY29uc3QgeyBjYWxlbmRhckVsIH0gPSBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG4gICAgY29uc3QgZm9jdXNhYmxlRWxlbWVudHMgPSBzZWxlY3QoZm9jdXNhYmxlLCBjYWxlbmRhckVsKTtcblxuICAgIGNvbnN0IGZpcnN0VGFiSW5kZXggPSAwO1xuICAgIGNvbnN0IGxhc3RUYWJJbmRleCA9IGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDE7XG4gICAgY29uc3QgZmlyc3RUYWJTdG9wID0gZm9jdXNhYmxlRWxlbWVudHNbZmlyc3RUYWJJbmRleF07XG4gICAgY29uc3QgbGFzdFRhYlN0b3AgPSBmb2N1c2FibGVFbGVtZW50c1tsYXN0VGFiSW5kZXhdO1xuICAgIGNvbnN0IGZvY3VzSW5kZXggPSBmb2N1c2FibGVFbGVtZW50cy5pbmRleE9mKGFjdGl2ZUVsZW1lbnQoKSk7XG5cbiAgICBjb25zdCBpc0xhc3RUYWIgPSBmb2N1c0luZGV4ID09PSBsYXN0VGFiSW5kZXg7XG4gICAgY29uc3QgaXNGaXJzdFRhYiA9IGZvY3VzSW5kZXggPT09IGZpcnN0VGFiSW5kZXg7XG4gICAgY29uc3QgaXNOb3RGb3VuZCA9IGZvY3VzSW5kZXggPT09IC0xO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZvY3VzYWJsZUVsZW1lbnRzLFxuICAgICAgaXNOb3RGb3VuZCxcbiAgICAgIGZpcnN0VGFiU3RvcCxcbiAgICAgIGlzRmlyc3RUYWIsXG4gICAgICBsYXN0VGFiU3RvcCxcbiAgICAgIGlzTGFzdFRhYixcbiAgICB9O1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgdGFiQWhlYWQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHsgZmlyc3RUYWJTdG9wLCBpc0xhc3RUYWIsIGlzTm90Rm91bmQgfSA9IGdldEZvY3VzYWJsZUNvbnRleHQoXG4gICAgICAgIGV2ZW50LnRhcmdldFxuICAgICAgKTtcblxuICAgICAgaWYgKGlzTGFzdFRhYiB8fCBpc05vdEZvdW5kKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGZpcnN0VGFiU3RvcC5mb2N1cygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGFiQmFjayhldmVudCkge1xuICAgICAgY29uc3QgeyBsYXN0VGFiU3RvcCwgaXNGaXJzdFRhYiwgaXNOb3RGb3VuZCB9ID0gZ2V0Rm9jdXNhYmxlQ29udGV4dChcbiAgICAgICAgZXZlbnQudGFyZ2V0XG4gICAgICApO1xuXG4gICAgICBpZiAoaXNGaXJzdFRhYiB8fCBpc05vdEZvdW5kKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxhc3RUYWJTdG9wLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG5cbmNvbnN0IGRhdGVQaWNrZXJUYWJFdmVudEhhbmRsZXIgPSB0YWJIYW5kbGVyKERBVEVfUElDS0VSX0ZPQ1VTQUJMRSk7XG5jb25zdCBtb250aFBpY2tlclRhYkV2ZW50SGFuZGxlciA9IHRhYkhhbmRsZXIoTU9OVEhfUElDS0VSX0ZPQ1VTQUJMRSk7XG5jb25zdCB5ZWFyUGlja2VyVGFiRXZlbnRIYW5kbGVyID0gdGFiSGFuZGxlcihZRUFSX1BJQ0tFUl9GT0NVU0FCTEUpO1xuXG4vLyAjZW5kcmVnaW9uIEZvY3VzIEhhbmRsaW5nIEV2ZW50IEhhbmRsaW5nXG5cbi8vICNyZWdpb24gRGF0ZSBQaWNrZXIgRXZlbnQgRGVsZWdhdGlvbiBSZWdpc3RyYXRpb24gLyBDb21wb25lbnRcblxuY29uc3QgZGF0ZVBpY2tlckV2ZW50cyA9IHtcbiAgW0NMSUNLXToge1xuICAgIFtEQVRFX1BJQ0tFUl9CVVRUT05dKCkge1xuICAgICAgdG9nZ2xlQ2FsZW5kYXIodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfREFURV0oKSB7XG4gICAgICBzZWxlY3REYXRlKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX01PTlRIXSgpIHtcbiAgICAgIHNlbGVjdE1vbnRoKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX1lFQVJdKCkge1xuICAgICAgc2VsZWN0WWVhcih0aGlzKTtcbiAgICB9LFxuICAgIFtDQUxFTkRBUl9QUkVWSU9VU19NT05USF0oKSB7XG4gICAgICBkaXNwbGF5UHJldmlvdXNNb250aCh0aGlzKTtcbiAgICB9LFxuICAgIFtDQUxFTkRBUl9ORVhUX01PTlRIXSgpIHtcbiAgICAgIGRpc3BsYXlOZXh0TW9udGgodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfUFJFVklPVVNfWUVBUl0oKSB7XG4gICAgICBkaXNwbGF5UHJldmlvdXNZZWFyKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX05FWFRfWUVBUl0oKSB7XG4gICAgICBkaXNwbGF5TmV4dFllYXIodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfUFJFVklPVVNfWUVBUl9DSFVOS10oKSB7XG4gICAgICBkaXNwbGF5UHJldmlvdXNZZWFyQ2h1bmsodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfTkVYVF9ZRUFSX0NIVU5LXSgpIHtcbiAgICAgIGRpc3BsYXlOZXh0WWVhckNodW5rKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX01PTlRIX1NFTEVDVElPTl0oKSB7XG4gICAgICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlNb250aFNlbGVjdGlvbih0aGlzKTtcbiAgICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfTU9OVEhfRk9DVVNFRCkuZm9jdXMoKTtcbiAgICB9LFxuICAgIFtDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTl0oKSB7XG4gICAgICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlZZWFyU2VsZWN0aW9uKHRoaXMpO1xuICAgICAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQpLmZvY3VzKCk7XG4gICAgfSxcbiAgfSxcbiAga2V5dXA6IHtcbiAgICBbREFURV9QSUNLRVJfQ0FMRU5EQVJdKGV2ZW50KSB7XG4gICAgICBjb25zdCBrZXlkb3duID0gdGhpcy5kYXRhc2V0LmtleWRvd25LZXlDb2RlO1xuICAgICAgaWYgKGAke2V2ZW50LmtleUNvZGV9YCAhPT0ga2V5ZG93bikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIGtleWRvd246IHtcbiAgICBbREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRdKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gRU5URVJfS0VZQ09ERSkge1xuICAgICAgICB2YWxpZGF0ZURhdGVJbnB1dCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFtDQUxFTkRBUl9EQVRFXToga2V5bWFwKHtcbiAgICAgIFVwOiBoYW5kbGVVcEZyb21EYXRlLFxuICAgICAgQXJyb3dVcDogaGFuZGxlVXBGcm9tRGF0ZSxcbiAgICAgIERvd246IGhhbmRsZURvd25Gcm9tRGF0ZSxcbiAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21EYXRlLFxuICAgICAgTGVmdDogaGFuZGxlTGVmdEZyb21EYXRlLFxuICAgICAgQXJyb3dMZWZ0OiBoYW5kbGVMZWZ0RnJvbURhdGUsXG4gICAgICBSaWdodDogaGFuZGxlUmlnaHRGcm9tRGF0ZSxcbiAgICAgIEFycm93UmlnaHQ6IGhhbmRsZVJpZ2h0RnJvbURhdGUsXG4gICAgICBIb21lOiBoYW5kbGVIb21lRnJvbURhdGUsXG4gICAgICBFbmQ6IGhhbmRsZUVuZEZyb21EYXRlLFxuICAgICAgUGFnZURvd246IGhhbmRsZVBhZ2VEb3duRnJvbURhdGUsXG4gICAgICBQYWdlVXA6IGhhbmRsZVBhZ2VVcEZyb21EYXRlLFxuICAgICAgXCJTaGlmdCtQYWdlRG93blwiOiBoYW5kbGVTaGlmdFBhZ2VEb3duRnJvbURhdGUsXG4gICAgICBcIlNoaWZ0K1BhZ2VVcFwiOiBoYW5kbGVTaGlmdFBhZ2VVcEZyb21EYXRlLFxuICAgICAgVGFiOiBkYXRlUGlja2VyVGFiRXZlbnRIYW5kbGVyLnRhYkFoZWFkLFxuICAgIH0pLFxuICAgIFtDQUxFTkRBUl9EQVRFX1BJQ0tFUl06IGtleW1hcCh7XG4gICAgICBUYWI6IGRhdGVQaWNrZXJUYWJFdmVudEhhbmRsZXIudGFiQWhlYWQsXG4gICAgICBcIlNoaWZ0K1RhYlwiOiBkYXRlUGlja2VyVGFiRXZlbnRIYW5kbGVyLnRhYkJhY2ssXG4gICAgfSksXG4gICAgW0NBTEVOREFSX01PTlRIXToga2V5bWFwKHtcbiAgICAgIFVwOiBoYW5kbGVVcEZyb21Nb250aCxcbiAgICAgIEFycm93VXA6IGhhbmRsZVVwRnJvbU1vbnRoLFxuICAgICAgRG93bjogaGFuZGxlRG93bkZyb21Nb250aCxcbiAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21Nb250aCxcbiAgICAgIExlZnQ6IGhhbmRsZUxlZnRGcm9tTW9udGgsXG4gICAgICBBcnJvd0xlZnQ6IGhhbmRsZUxlZnRGcm9tTW9udGgsXG4gICAgICBSaWdodDogaGFuZGxlUmlnaHRGcm9tTW9udGgsXG4gICAgICBBcnJvd1JpZ2h0OiBoYW5kbGVSaWdodEZyb21Nb250aCxcbiAgICAgIEhvbWU6IGhhbmRsZUhvbWVGcm9tTW9udGgsXG4gICAgICBFbmQ6IGhhbmRsZUVuZEZyb21Nb250aCxcbiAgICAgIFBhZ2VEb3duOiBoYW5kbGVQYWdlRG93bkZyb21Nb250aCxcbiAgICAgIFBhZ2VVcDogaGFuZGxlUGFnZVVwRnJvbU1vbnRoLFxuICAgIH0pLFxuICAgIFtDQUxFTkRBUl9NT05USF9QSUNLRVJdOiBrZXltYXAoe1xuICAgICAgVGFiOiBtb250aFBpY2tlclRhYkV2ZW50SGFuZGxlci50YWJBaGVhZCxcbiAgICAgIFwiU2hpZnQrVGFiXCI6IG1vbnRoUGlja2VyVGFiRXZlbnRIYW5kbGVyLnRhYkJhY2ssXG4gICAgfSksXG4gICAgW0NBTEVOREFSX1lFQVJdOiBrZXltYXAoe1xuICAgICAgVXA6IGhhbmRsZVVwRnJvbVllYXIsXG4gICAgICBBcnJvd1VwOiBoYW5kbGVVcEZyb21ZZWFyLFxuICAgICAgRG93bjogaGFuZGxlRG93bkZyb21ZZWFyLFxuICAgICAgQXJyb3dEb3duOiBoYW5kbGVEb3duRnJvbVllYXIsXG4gICAgICBMZWZ0OiBoYW5kbGVMZWZ0RnJvbVllYXIsXG4gICAgICBBcnJvd0xlZnQ6IGhhbmRsZUxlZnRGcm9tWWVhcixcbiAgICAgIFJpZ2h0OiBoYW5kbGVSaWdodEZyb21ZZWFyLFxuICAgICAgQXJyb3dSaWdodDogaGFuZGxlUmlnaHRGcm9tWWVhcixcbiAgICAgIEhvbWU6IGhhbmRsZUhvbWVGcm9tWWVhcixcbiAgICAgIEVuZDogaGFuZGxlRW5kRnJvbVllYXIsXG4gICAgICBQYWdlRG93bjogaGFuZGxlUGFnZURvd25Gcm9tWWVhcixcbiAgICAgIFBhZ2VVcDogaGFuZGxlUGFnZVVwRnJvbVllYXIsXG4gICAgfSksXG4gICAgW0NBTEVOREFSX1lFQVJfUElDS0VSXToga2V5bWFwKHtcbiAgICAgIFRhYjogeWVhclBpY2tlclRhYkV2ZW50SGFuZGxlci50YWJBaGVhZCxcbiAgICAgIFwiU2hpZnQrVGFiXCI6IHllYXJQaWNrZXJUYWJFdmVudEhhbmRsZXIudGFiQmFjayxcbiAgICB9KSxcbiAgICBbREFURV9QSUNLRVJfQ0FMRU5EQVJdKGV2ZW50KSB7XG4gICAgICB0aGlzLmRhdGFzZXQua2V5ZG93bktleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIH0sXG4gICAgW0RBVEVfUElDS0VSXShldmVudCkge1xuICAgICAgY29uc3Qga2V5TWFwID0ga2V5bWFwKHtcbiAgICAgICAgRXNjYXBlOiBoYW5kbGVFc2NhcGVGcm9tQ2FsZW5kYXIsXG4gICAgICB9KTtcblxuICAgICAga2V5TWFwKGV2ZW50KTtcbiAgICB9LFxuICB9LFxuICBmb2N1c291dDoge1xuICAgIFtEQVRFX1BJQ0tFUl9FWFRFUk5BTF9JTlBVVF0oKSB7XG4gICAgICB2YWxpZGF0ZURhdGVJbnB1dCh0aGlzKTtcbiAgICB9LFxuICAgIFtEQVRFX1BJQ0tFUl0oZXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICBoaWRlQ2FsZW5kYXIodGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgaW5wdXQ6IHtcbiAgICBbREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRdKCkge1xuICAgICAgcmVjb25jaWxlSW5wdXRWYWx1ZXModGhpcyk7XG4gICAgICB1cGRhdGVDYWxlbmRhcklmVmlzaWJsZSh0aGlzKTtcbiAgICB9LFxuICB9LFxufTtcblxuaWYgKCFpc0lvc0RldmljZSgpKSB7XG4gIGRhdGVQaWNrZXJFdmVudHMubW91c2VvdmVyID0ge1xuICAgIFtDQUxFTkRBUl9EQVRFX0NVUlJFTlRfTU9OVEhdKCkge1xuICAgICAgaGFuZGxlTW91c2VvdmVyRnJvbURhdGUodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfTU9OVEhdKCkge1xuICAgICAgaGFuZGxlTW91c2VvdmVyRnJvbU1vbnRoKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX1lFQVJdKCkge1xuICAgICAgaGFuZGxlTW91c2VvdmVyRnJvbVllYXIodGhpcyk7XG4gICAgfSxcbiAgfTtcbn1cblxuY29uc3QgZGF0ZVBpY2tlciA9IGJlaGF2aW9yKGRhdGVQaWNrZXJFdmVudHMsIHtcbiAgaW5pdChyb290KSB7XG4gICAgc2VsZWN0KERBVEVfUElDS0VSLCByb290KS5mb3JFYWNoKChkYXRlUGlja2VyRWwpID0+IHtcbiAgICAgIGVuaGFuY2VEYXRlUGlja2VyKGRhdGVQaWNrZXJFbCk7XG4gICAgfSk7XG4gIH0sXG4gIGdldERhdGVQaWNrZXJDb250ZXh0LFxuICBkaXNhYmxlLFxuICBlbmFibGUsXG4gIGlzRGF0ZUlucHV0SW52YWxpZCxcbiAgc2V0Q2FsZW5kYXJWYWx1ZSxcbiAgdmFsaWRhdGVEYXRlSW5wdXQsXG4gIHJlbmRlckNhbGVuZGFyLFxuICB1cGRhdGVDYWxlbmRhcklmVmlzaWJsZSxcbn0pO1xuXG4vLyAjZW5kcmVnaW9uIERhdGUgUGlja2VyIEV2ZW50IERlbGVnYXRpb24gUmVnaXN0cmF0aW9uIC8gQ29tcG9uZW50XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0ZVBpY2tlcjtcbiIsImNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4uL3V0aWxzL3NlbGVjdFwiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5jb25zdCB7XG4gIGdldERhdGVQaWNrZXJDb250ZXh0LFxuICBpc0RhdGVJbnB1dEludmFsaWQsXG4gIHVwZGF0ZUNhbGVuZGFySWZWaXNpYmxlLFxufSA9IHJlcXVpcmUoXCIuL2RhdGUtcGlja2VyXCIpO1xuXG5jb25zdCBEQVRFX1BJQ0tFUl9DTEFTUyA9IGAke1BSRUZJWH0tZGF0ZS1waWNrZXJgO1xuY29uc3QgREFURV9SQU5HRV9QSUNLRVJfQ0xBU1MgPSBgJHtQUkVGSVh9LWRhdGUtcmFuZ2UtcGlja2VyYDtcbmNvbnN0IERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX1NUQVJUX0NMQVNTID0gYCR7REFURV9SQU5HRV9QSUNLRVJfQ0xBU1N9X19yYW5nZS1zdGFydGA7XG5jb25zdCBEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9FTkRfQ0xBU1MgPSBgJHtEQVRFX1JBTkdFX1BJQ0tFUl9DTEFTU31fX3JhbmdlLWVuZGA7XG5cbmNvbnN0IERBVEVfUElDS0VSID0gYC4ke0RBVEVfUElDS0VSX0NMQVNTfWA7XG5jb25zdCBEQVRFX1JBTkdFX1BJQ0tFUiA9IGAuJHtEQVRFX1JBTkdFX1BJQ0tFUl9DTEFTU31gO1xuY29uc3QgREFURV9SQU5HRV9QSUNLRVJfUkFOR0VfU1RBUlQgPSBgLiR7REFURV9SQU5HRV9QSUNLRVJfUkFOR0VfU1RBUlRfQ0xBU1N9YDtcbmNvbnN0IERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX0VORCA9IGAuJHtEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9FTkRfQ0xBU1N9YDtcblxuY29uc3QgREVGQVVMVF9NSU5fREFURSA9IFwiMDAwMC0wMS0wMVwiO1xuXG4vKipcbiAqIFRoZSBwcm9wZXJ0aWVzIGFuZCBlbGVtZW50cyB3aXRoaW4gdGhlIGRhdGUgcmFuZ2UgcGlja2VyLlxuICogQHR5cGVkZWYge09iamVjdH0gRGF0ZVJhbmdlUGlja2VyQ29udGV4dFxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZGF0ZVJhbmdlUGlja2VyRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IHJhbmdlU3RhcnRFbFxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gcmFuZ2VFbmRFbFxuICovXG5cbi8qKlxuICogR2V0IGFuIG9iamVjdCBvZiB0aGUgcHJvcGVydGllcyBhbmQgZWxlbWVudHMgYmVsb25naW5nIGRpcmVjdGx5IHRvIHRoZSBnaXZlblxuICogZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRoZSBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXJcbiAqIEByZXR1cm5zIHtEYXRlUmFuZ2VQaWNrZXJDb250ZXh0fSBlbGVtZW50c1xuICovXG5jb25zdCBnZXREYXRlUmFuZ2VQaWNrZXJDb250ZXh0ID0gKGVsKSA9PiB7XG4gIGNvbnN0IGRhdGVSYW5nZVBpY2tlckVsID0gZWwuY2xvc2VzdChEQVRFX1JBTkdFX1BJQ0tFUik7XG5cbiAgaWYgKCFkYXRlUmFuZ2VQaWNrZXJFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBtaXNzaW5nIG91dGVyICR7REFURV9SQU5HRV9QSUNLRVJ9YCk7XG4gIH1cblxuICBjb25zdCByYW5nZVN0YXJ0RWwgPSBkYXRlUmFuZ2VQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKFxuICAgIERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX1NUQVJUXG4gICk7XG4gIGNvbnN0IHJhbmdlRW5kRWwgPSBkYXRlUmFuZ2VQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKFxuICAgIERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX0VORFxuICApO1xuXG4gIHJldHVybiB7XG4gICAgZGF0ZVJhbmdlUGlja2VyRWwsXG4gICAgcmFuZ2VTdGFydEVsLFxuICAgIHJhbmdlRW5kRWwsXG4gIH07XG59O1xuXG4vKipcbiAqIGhhbmRsZSB1cGRhdGUgZnJvbSByYW5nZSBzdGFydCBkYXRlIHBpY2tlclxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHJhbmdlIHBpY2tlclxuICovXG5jb25zdCBoYW5kbGVSYW5nZVN0YXJ0VXBkYXRlID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZGF0ZVJhbmdlUGlja2VyRWwsIHJhbmdlU3RhcnRFbCwgcmFuZ2VFbmRFbCB9ID1cbiAgICBnZXREYXRlUmFuZ2VQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgeyBpbnRlcm5hbElucHV0RWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KHJhbmdlU3RhcnRFbCk7XG4gIGNvbnN0IHVwZGF0ZWREYXRlID0gaW50ZXJuYWxJbnB1dEVsLnZhbHVlO1xuXG4gIGlmICh1cGRhdGVkRGF0ZSAmJiAhaXNEYXRlSW5wdXRJbnZhbGlkKGludGVybmFsSW5wdXRFbCkpIHtcbiAgICByYW5nZUVuZEVsLmRhdGFzZXQubWluRGF0ZSA9IHVwZGF0ZWREYXRlO1xuICAgIHJhbmdlRW5kRWwuZGF0YXNldC5yYW5nZURhdGUgPSB1cGRhdGVkRGF0ZTtcbiAgICByYW5nZUVuZEVsLmRhdGFzZXQuZGVmYXVsdERhdGUgPSB1cGRhdGVkRGF0ZTtcbiAgfSBlbHNlIHtcbiAgICByYW5nZUVuZEVsLmRhdGFzZXQubWluRGF0ZSA9IGRhdGVSYW5nZVBpY2tlckVsLmRhdGFzZXQubWluRGF0ZSB8fCBcIlwiO1xuICAgIHJhbmdlRW5kRWwuZGF0YXNldC5yYW5nZURhdGUgPSBcIlwiO1xuICAgIHJhbmdlRW5kRWwuZGF0YXNldC5kZWZhdWx0RGF0ZSA9IFwiXCI7XG4gIH1cblxuICB1cGRhdGVDYWxlbmRhcklmVmlzaWJsZShyYW5nZUVuZEVsKTtcbn07XG5cbi8qKlxuICogaGFuZGxlIHVwZGF0ZSBmcm9tIHJhbmdlIHN0YXJ0IGRhdGUgcGlja2VyXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgYW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcmFuZ2UgcGlja2VyXG4gKi9cbmNvbnN0IGhhbmRsZVJhbmdlRW5kVXBkYXRlID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZGF0ZVJhbmdlUGlja2VyRWwsIHJhbmdlU3RhcnRFbCwgcmFuZ2VFbmRFbCB9ID1cbiAgICBnZXREYXRlUmFuZ2VQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgeyBpbnRlcm5hbElucHV0RWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KHJhbmdlRW5kRWwpO1xuICBjb25zdCB1cGRhdGVkRGF0ZSA9IGludGVybmFsSW5wdXRFbC52YWx1ZTtcblxuICBpZiAodXBkYXRlZERhdGUgJiYgIWlzRGF0ZUlucHV0SW52YWxpZChpbnRlcm5hbElucHV0RWwpKSB7XG4gICAgcmFuZ2VTdGFydEVsLmRhdGFzZXQubWF4RGF0ZSA9IHVwZGF0ZWREYXRlO1xuICAgIHJhbmdlU3RhcnRFbC5kYXRhc2V0LnJhbmdlRGF0ZSA9IHVwZGF0ZWREYXRlO1xuICAgIHJhbmdlU3RhcnRFbC5kYXRhc2V0LmRlZmF1bHREYXRlID0gdXBkYXRlZERhdGU7XG4gIH0gZWxzZSB7XG4gICAgcmFuZ2VTdGFydEVsLmRhdGFzZXQubWF4RGF0ZSA9IGRhdGVSYW5nZVBpY2tlckVsLmRhdGFzZXQubWF4RGF0ZSB8fCBcIlwiO1xuICAgIHJhbmdlU3RhcnRFbC5kYXRhc2V0LnJhbmdlRGF0ZSA9IFwiXCI7XG4gICAgcmFuZ2VTdGFydEVsLmRhdGFzZXQuZGVmYXVsdERhdGUgPSBcIlwiO1xuICB9XG5cbiAgdXBkYXRlQ2FsZW5kYXJJZlZpc2libGUocmFuZ2VTdGFydEVsKTtcbn07XG5cbi8qKlxuICogRW5oYW5jZSBhbiBpbnB1dCB3aXRoIHRoZSBkYXRlIHBpY2tlciBlbGVtZW50c1xuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIFRoZSBpbml0aWFsIHdyYXBwaW5nIGVsZW1lbnQgb2YgdGhlIGRhdGUgcmFuZ2UgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBlbmhhbmNlRGF0ZVJhbmdlUGlja2VyID0gKGVsKSA9PiB7XG4gIGNvbnN0IGRhdGVSYW5nZVBpY2tlckVsID0gZWwuY2xvc2VzdChEQVRFX1JBTkdFX1BJQ0tFUik7XG5cbiAgY29uc3QgW3JhbmdlU3RhcnQsIHJhbmdlRW5kXSA9IHNlbGVjdChEQVRFX1BJQ0tFUiwgZGF0ZVJhbmdlUGlja2VyRWwpO1xuXG4gIGlmICghcmFuZ2VTdGFydCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGAke0RBVEVfUkFOR0VfUElDS0VSfSBpcyBtaXNzaW5nIGlubmVyIHR3byAnJHtEQVRFX1BJQ0tFUn0nIGVsZW1lbnRzYFxuICAgICk7XG4gIH1cblxuICBpZiAoIXJhbmdlRW5kKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYCR7REFURV9SQU5HRV9QSUNLRVJ9IGlzIG1pc3Npbmcgc2Vjb25kICcke0RBVEVfUElDS0VSfScgZWxlbWVudGBcbiAgICApO1xuICB9XG5cbiAgcmFuZ2VTdGFydC5jbGFzc0xpc3QuYWRkKERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX1NUQVJUX0NMQVNTKTtcbiAgcmFuZ2VFbmQuY2xhc3NMaXN0LmFkZChEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9FTkRfQ0xBU1MpO1xuXG4gIGlmICghZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldC5taW5EYXRlKSB7XG4gICAgZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldC5taW5EYXRlID0gREVGQVVMVF9NSU5fREFURTtcbiAgfVxuXG4gIGNvbnN0IHsgbWluRGF0ZSB9ID0gZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldDtcbiAgcmFuZ2VTdGFydC5kYXRhc2V0Lm1pbkRhdGUgPSBtaW5EYXRlO1xuICByYW5nZUVuZC5kYXRhc2V0Lm1pbkRhdGUgPSBtaW5EYXRlO1xuXG4gIGNvbnN0IHsgbWF4RGF0ZSB9ID0gZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldDtcbiAgaWYgKG1heERhdGUpIHtcbiAgICByYW5nZVN0YXJ0LmRhdGFzZXQubWF4RGF0ZSA9IG1heERhdGU7XG4gICAgcmFuZ2VFbmQuZGF0YXNldC5tYXhEYXRlID0gbWF4RGF0ZTtcbiAgfVxuXG4gIGhhbmRsZVJhbmdlU3RhcnRVcGRhdGUoZGF0ZVJhbmdlUGlja2VyRWwpO1xuICBoYW5kbGVSYW5nZUVuZFVwZGF0ZShkYXRlUmFuZ2VQaWNrZXJFbCk7XG59O1xuXG5jb25zdCBkYXRlUmFuZ2VQaWNrZXIgPSBiZWhhdmlvcihcbiAge1xuICAgIFwiaW5wdXQgY2hhbmdlXCI6IHtcbiAgICAgIFtEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9TVEFSVF0oKSB7XG4gICAgICAgIGhhbmRsZVJhbmdlU3RhcnRVcGRhdGUodGhpcyk7XG4gICAgICB9LFxuICAgICAgW0RBVEVfUkFOR0VfUElDS0VSX1JBTkdFX0VORF0oKSB7XG4gICAgICAgIGhhbmRsZVJhbmdlRW5kVXBkYXRlKHRoaXMpO1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaW5pdChyb290KSB7XG4gICAgICBzZWxlY3QoREFURV9SQU5HRV9QSUNLRVIsIHJvb3QpLmZvckVhY2goKGRhdGVSYW5nZVBpY2tlckVsKSA9PiB7XG4gICAgICAgIGVuaGFuY2VEYXRlUmFuZ2VQaWNrZXIoZGF0ZVJhbmdlUGlja2VyRWwpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfVxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXRlUmFuZ2VQaWNrZXI7XG4iLCJjb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuY29uc3QgU2FuaXRpemVyID0gcmVxdWlyZShcIi4uL3V0aWxzL3Nhbml0aXplclwiKTtcblxuY29uc3QgRFJPUFpPTkVfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRgO1xuY29uc3QgRFJPUFpPTkUgPSBgLiR7RFJPUFpPTkVfQ0xBU1N9YDtcbmNvbnN0IElOUFVUX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0X19pbnB1dGA7XG5jb25zdCBUQVJHRVRfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX3RhcmdldGA7XG5jb25zdCBJTlBVVCA9IGAuJHtJTlBVVF9DTEFTU31gO1xuY29uc3QgQk9YX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0X19ib3hgO1xuY29uc3QgSU5TVFJVQ1RJT05TX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0X19pbnN0cnVjdGlvbnNgO1xuY29uc3QgUFJFVklFV19DTEFTUyA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dF9fcHJldmlld2A7XG5jb25zdCBQUkVWSUVXX0hFQURJTkdfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX3ByZXZpZXctaGVhZGluZ2A7XG5jb25zdCBESVNBQkxFRF9DTEFTUyA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dC0tZGlzYWJsZWRgO1xuY29uc3QgQ0hPT1NFX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0X19jaG9vc2VgO1xuY29uc3QgQUNDRVBURURfRklMRV9NRVNTQUdFX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0X19hY2NlcHRlZC1maWxlcy1tZXNzYWdlYDtcbmNvbnN0IERSQUdfVEVYVF9DTEFTUyA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dF9fZHJhZy10ZXh0YDtcbmNvbnN0IERSQUdfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXQtLWRyYWdgO1xuY29uc3QgTE9BRElOR19DTEFTUyA9IFwiaXMtbG9hZGluZ1wiO1xuY29uc3QgSElEREVOX0NMQVNTID0gXCJkaXNwbGF5LW5vbmVcIjtcbmNvbnN0IElOVkFMSURfRklMRV9DTEFTUyA9IFwiaGFzLWludmFsaWQtZmlsZVwiO1xuY29uc3QgR0VORVJJQ19QUkVWSUVXX0NMQVNTX05BTUUgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX3ByZXZpZXctaW1hZ2VgO1xuY29uc3QgR0VORVJJQ19QUkVWSUVXX0NMQVNTID0gYCR7R0VORVJJQ19QUkVWSUVXX0NMQVNTX05BTUV9LS1nZW5lcmljYDtcbmNvbnN0IFBERl9QUkVWSUVXX0NMQVNTID0gYCR7R0VORVJJQ19QUkVWSUVXX0NMQVNTX05BTUV9LS1wZGZgO1xuY29uc3QgV09SRF9QUkVWSUVXX0NMQVNTID0gYCR7R0VORVJJQ19QUkVWSUVXX0NMQVNTX05BTUV9LS13b3JkYDtcbmNvbnN0IFZJREVPX1BSRVZJRVdfQ0xBU1MgPSBgJHtHRU5FUklDX1BSRVZJRVdfQ0xBU1NfTkFNRX0tLXZpZGVvYDtcbmNvbnN0IEVYQ0VMX1BSRVZJRVdfQ0xBU1MgPSBgJHtHRU5FUklDX1BSRVZJRVdfQ0xBU1NfTkFNRX0tLWV4Y2VsYDtcbmNvbnN0IFNQQUNFUl9HSUYgPVxuICBcImRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQUFBQUFQLy8veUg1QkFFQUFBQUFMQUFBQUFBQkFBRUFBQUlCUkFBN1wiO1xuXG5sZXQgVFlQRV9JU19WQUxJRCA9IEJvb2xlYW4odHJ1ZSk7IC8vIGxvZ2ljIGdhdGUgZm9yIGNoYW5nZSBsaXN0ZW5lclxuXG4vKipcbiAqIFRoZSBwcm9wZXJ0aWVzIGFuZCBlbGVtZW50cyB3aXRoaW4gdGhlIGZpbGUgaW5wdXQuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBGaWxlSW5wdXRDb250ZXh0XG4gKiBAcHJvcGVydHkge0hUTUxEaXZFbGVtZW50fSBkcm9wWm9uZUVsXG4gKiBAcHJvcGVydHkge0hUTUxJbnB1dEVsZW1lbnR9IGlucHV0RWxcbiAqL1xuXG4vKipcbiAqIEdldCBhbiBvYmplY3Qgb2YgdGhlIHByb3BlcnRpZXMgYW5kIGVsZW1lbnRzIGJlbG9uZ2luZyBkaXJlY3RseSB0byB0aGUgZ2l2ZW5cbiAqIGZpbGUgaW5wdXQgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRoZSBlbGVtZW50IHdpdGhpbiB0aGUgZmlsZSBpbnB1dFxuICogQHJldHVybnMge0ZpbGVJbnB1dENvbnRleHR9IGVsZW1lbnRzXG4gKi9cbmNvbnN0IGdldEZpbGVJbnB1dENvbnRleHQgPSAoZWwpID0+IHtcbiAgY29uc3QgZHJvcFpvbmVFbCA9IGVsLmNsb3Nlc3QoRFJPUFpPTkUpO1xuXG4gIGlmICghZHJvcFpvbmVFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBtaXNzaW5nIG91dGVyICR7RFJPUFpPTkV9YCk7XG4gIH1cblxuICBjb25zdCBpbnB1dEVsID0gZHJvcFpvbmVFbC5xdWVyeVNlbGVjdG9yKElOUFVUKTtcblxuICByZXR1cm4ge1xuICAgIGRyb3Bab25lRWwsXG4gICAgaW5wdXRFbCxcbiAgfTtcbn07XG5cbi8qKlxuICogRGlzYWJsZSB0aGUgZmlsZSBpbnB1dCBjb21wb25lbnRcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZmlsZSBpbnB1dCBjb21wb25lbnRcbiAqL1xuY29uc3QgZGlzYWJsZSA9IChlbCkgPT4ge1xuICBjb25zdCB7IGRyb3Bab25lRWwsIGlucHV0RWwgfSA9IGdldEZpbGVJbnB1dENvbnRleHQoZWwpO1xuXG4gIGlucHV0RWwuZGlzYWJsZWQgPSB0cnVlO1xuICBkcm9wWm9uZUVsLmNsYXNzTGlzdC5hZGQoRElTQUJMRURfQ0xBU1MpO1xuICBkcm9wWm9uZUVsLnNldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIiwgXCJ0cnVlXCIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdGhlIGZpbGUgaW5wdXQgY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGZpbGUgaW5wdXQgY29tcG9uZW50XG4gKi9cbmNvbnN0IGVuYWJsZSA9IChlbCkgPT4ge1xuICBjb25zdCB7IGRyb3Bab25lRWwsIGlucHV0RWwgfSA9IGdldEZpbGVJbnB1dENvbnRleHQoZWwpO1xuXG4gIGlucHV0RWwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgZHJvcFpvbmVFbC5jbGFzc0xpc3QucmVtb3ZlKERJU0FCTEVEX0NMQVNTKTtcbiAgZHJvcFpvbmVFbC5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLWRpc2FibGVkXCIpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHMgc3BlY2lhbCBjaGFyYWN0ZXJzXG4gKiBAcmV0dXJucyB7U3RyaW5nfSByZXBsYWNlcyBzcGVjaWZpZWQgdmFsdWVzXG4gKi9cbmNvbnN0IHJlcGxhY2VOYW1lID0gKHMpID0+IHtcbiAgY29uc3QgYyA9IHMuY2hhckNvZGVBdCgwKTtcbiAgaWYgKGMgPT09IDMyKSByZXR1cm4gXCItXCI7XG4gIGlmIChjID49IDY1ICYmIGMgPD0gOTApIHJldHVybiBgaW1nXyR7cy50b0xvd2VyQ2FzZSgpfWA7XG4gIHJldHVybiBgX18keyhcIjAwMFwiLCBjLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpfWA7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gSUQgbmFtZSBmb3IgZWFjaCBmaWxlIHRoYXQgc3RyaXBzIGFsbCBpbnZhbGlkIGNoYXJhY3RlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIG5hbWUgb2YgdGhlIGZpbGUgYWRkZWQgdG8gZmlsZSBpbnB1dCAoc2VhcmNodmFsdWUpXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzYW1lIGNoYXJhY3RlcnMgYXMgdGhlIG5hbWUgd2l0aCBpbnZhbGlkIGNoYXJzIHJlbW92ZWQgKG5ld3ZhbHVlKVxuICovXG5jb25zdCBtYWtlU2FmZUZvcklEID0gKG5hbWUpID0+IG5hbWUucmVwbGFjZSgvW15hLXowLTldL2csIHJlcGxhY2VOYW1lKTtcblxuLy8gVGFrZXMgYSBnZW5lcmF0ZWQgc2FmZSBJRCBhbmQgY3JlYXRlcyBhIHVuaXF1ZSBJRC5cbmNvbnN0IGNyZWF0ZVVuaXF1ZUlEID0gKG5hbWUpID0+XG4gIGAke25hbWV9LSR7TWF0aC5mbG9vcihEYXRlLm5vdygpLnRvU3RyaW5nKCkgLyAxMDAwKX1gO1xuXG4vKipcbiAqIEJ1aWxkcyBmdWxsIGZpbGUgaW5wdXQgY29tcG9uZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBmaWxlSW5wdXRFbCAtIG9yaWdpbmFsIGZpbGUgaW5wdXQgb24gcGFnZVxuICogQHJldHVybnMge0hUTUxFbGVtZW50fEhUTUxFbGVtZW50fSAtIEluc3RydWN0aW9ucywgdGFyZ2V0IGFyZWEgZGl2XG4gKi9cbmNvbnN0IGJ1aWxkRmlsZUlucHV0ID0gKGZpbGVJbnB1dEVsKSA9PiB7XG4gIGNvbnN0IGFjY2VwdHNNdWx0aXBsZSA9IGZpbGVJbnB1dEVsLmhhc0F0dHJpYnV0ZShcIm11bHRpcGxlXCIpO1xuICBjb25zdCBmaWxlSW5wdXRQYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb25zdCBkcm9wVGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29uc3QgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29uc3QgaW5zdHJ1Y3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29uc3QgZGlzYWJsZWQgPSBmaWxlSW5wdXRFbC5oYXNBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgbGV0IGRlZmF1bHRBcmlhTGFiZWw7XG5cbiAgLy8gQWRkcyBjbGFzcyBuYW1lcyBhbmQgb3RoZXIgYXR0cmlidXRlc1xuICBmaWxlSW5wdXRFbC5jbGFzc0xpc3QucmVtb3ZlKERST1BaT05FX0NMQVNTKTtcbiAgZmlsZUlucHV0RWwuY2xhc3NMaXN0LmFkZChJTlBVVF9DTEFTUyk7XG4gIGZpbGVJbnB1dFBhcmVudC5jbGFzc0xpc3QuYWRkKERST1BaT05FX0NMQVNTKTtcbiAgYm94LmNsYXNzTGlzdC5hZGQoQk9YX0NMQVNTKTtcbiAgaW5zdHJ1Y3Rpb25zLmNsYXNzTGlzdC5hZGQoSU5TVFJVQ1RJT05TX0NMQVNTKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgZHJvcFRhcmdldC5jbGFzc0xpc3QuYWRkKFRBUkdFVF9DTEFTUyk7XG4gIC8vIEVuY291cmFnZSBzY3JlZW5yZWFkZXIgdG8gcmVhZCBvdXQgYXJpYSBjaGFuZ2VzIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB1cGxvYWQgc3RhdHVzIGNoYW5nZVxuICBmaWxlSW5wdXRFbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxpdmVcIiwgXCJwb2xpdGVcIik7XG5cbiAgLy8gQWRkcyBjaGlsZCBlbGVtZW50cyB0byB0aGUgRE9NXG4gIGZpbGVJbnB1dEVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyb3BUYXJnZXQsIGZpbGVJbnB1dEVsKTtcbiAgZmlsZUlucHV0RWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZmlsZUlucHV0UGFyZW50LCBkcm9wVGFyZ2V0KTtcbiAgZHJvcFRhcmdldC5hcHBlbmRDaGlsZChmaWxlSW5wdXRFbCk7XG4gIGZpbGVJbnB1dFBhcmVudC5hcHBlbmRDaGlsZChkcm9wVGFyZ2V0KTtcbiAgZmlsZUlucHV0RWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaW5zdHJ1Y3Rpb25zLCBmaWxlSW5wdXRFbCk7XG4gIGZpbGVJbnB1dEVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGJveCwgZmlsZUlucHV0RWwpO1xuXG4gIC8vIERpc2FibGVkIHN0eWxpbmdcbiAgaWYgKGRpc2FibGVkKSB7XG4gICAgZGlzYWJsZShmaWxlSW5wdXRFbCk7XG4gIH1cblxuICAvLyBTZXRzIGluc3RydWN0aW9uIHRlc3QgYW5kIGFyaWEtbGFiZWwgYmFzZWQgb24gd2hldGhlciBvciBub3QgbXVsdGlwbGUgZmlsZXMgYXJlIGFjY2VwdGVkXG4gIGlmIChhY2NlcHRzTXVsdGlwbGUpIHtcbiAgICBkZWZhdWx0QXJpYUxhYmVsID0gXCJObyBmaWxlcyBzZWxlY3RlZFwiO1xuICAgIGluc3RydWN0aW9ucy5pbm5lckhUTUwgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGA8c3BhbiBjbGFzcz1cIiR7RFJBR19URVhUX0NMQVNTfVwiPkRyYWcgZmlsZXMgaGVyZSBvciA8L3NwYW4+PHNwYW4gY2xhc3M9XCIke0NIT09TRV9DTEFTU31cIj5jaG9vc2UgZnJvbSBmb2xkZXI8L3NwYW4+YDtcbiAgICBmaWxlSW5wdXRFbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGRlZmF1bHRBcmlhTGFiZWwpO1xuICAgIGZpbGVJbnB1dEVsLnNldEF0dHJpYnV0ZShcImRhdGEtZGVmYXVsdC1hcmlhLWxhYmVsXCIsIGRlZmF1bHRBcmlhTGFiZWwpO1xuICB9IGVsc2Uge1xuICAgIGRlZmF1bHRBcmlhTGFiZWwgPSBcIk5vIGZpbGUgc2VsZWN0ZWRcIjtcbiAgICBpbnN0cnVjdGlvbnMuaW5uZXJIVE1MID0gU2FuaXRpemVyLmVzY2FwZUhUTUxgPHNwYW4gY2xhc3M9XCIke0RSQUdfVEVYVF9DTEFTU31cIj5EcmFnIGZpbGUgaGVyZSBvciA8L3NwYW4+PHNwYW4gY2xhc3M9XCIke0NIT09TRV9DTEFTU31cIj5jaG9vc2UgZnJvbSBmb2xkZXI8L3NwYW4+YDtcbiAgICBmaWxlSW5wdXRFbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGRlZmF1bHRBcmlhTGFiZWwpO1xuICAgIGZpbGVJbnB1dEVsLnNldEF0dHJpYnV0ZShcImRhdGEtZGVmYXVsdC1hcmlhLWxhYmVsXCIsIGRlZmF1bHRBcmlhTGFiZWwpO1xuICB9XG5cbiAgLy8gSUUxMSBhbmQgRWRnZSBkbyBub3Qgc3VwcG9ydCBkcm9wIGZpbGVzIG9uIGZpbGUgaW5wdXRzLCBzbyB3ZSd2ZSByZW1vdmVkIHRleHQgdGhhdCBpbmRpY2F0ZXMgdGhhdFxuICBpZiAoXG4gICAgL3J2OjExLjAvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIHx8XG4gICAgL0VkZ2VcXC9cXGQuL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuICApIHtcbiAgICBmaWxlSW5wdXRQYXJlbnQucXVlcnlTZWxlY3RvcihgLiR7RFJBR19URVhUX0NMQVNTfWApLm91dGVySFRNTCA9IFwiXCI7XG4gIH1cblxuICByZXR1cm4geyBpbnN0cnVjdGlvbnMsIGRyb3BUYXJnZXQgfTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBpbWFnZSBwcmV2aWV3cywgd2Ugd2FudCB0byBzdGFydCB3aXRoIGEgY2xlYW4gbGlzdCBldmVyeSB0aW1lIGZpbGVzIGFyZSBhZGRlZCB0byB0aGUgZmlsZSBpbnB1dFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJvcFRhcmdldCAtIHRhcmdldCBhcmVhIGRpdiB0aGF0IGVuY2FzZXMgdGhlIGlucHV0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBpbnN0cnVjdGlvbnMgLSB0ZXh0IHRvIGluZm9ybSB1c2VycyB0byBkcmFnIG9yIHNlbGVjdCBmaWxlc1xuICovXG5jb25zdCByZW1vdmVPbGRQcmV2aWV3cyA9IChkcm9wVGFyZ2V0LCBpbnN0cnVjdGlvbnMsIGlucHV0QXJpYUxhYmVsKSA9PiB7XG4gIGNvbnN0IGZpbGVQcmV2aWV3cyA9IGRyb3BUYXJnZXQucXVlcnlTZWxlY3RvckFsbChgLiR7UFJFVklFV19DTEFTU31gKTtcbiAgY29uc3QgZmlsZUlucHV0RWxlbWVudCA9IGRyb3BUYXJnZXQucXVlcnlTZWxlY3RvcihJTlBVVCk7XG4gIGNvbnN0IGN1cnJlbnRQcmV2aWV3SGVhZGluZyA9IGRyb3BUYXJnZXQucXVlcnlTZWxlY3RvcihcbiAgICBgLiR7UFJFVklFV19IRUFESU5HX0NMQVNTfWBcbiAgKTtcbiAgY29uc3QgY3VycmVudEVycm9yTWVzc2FnZSA9IGRyb3BUYXJnZXQucXVlcnlTZWxlY3RvcihcbiAgICBgLiR7QUNDRVBURURfRklMRV9NRVNTQUdFX0NMQVNTfWBcbiAgKTtcblxuICAvKipcbiAgICogZmluZHMgdGhlIHBhcmVudCBvZiB0aGUgcGFzc2VkIG5vZGUgYW5kIHJlbW92ZXMgdGhlIGNoaWxkXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG5vZGVcbiAgICovXG4gIGNvbnN0IHJlbW92ZUltYWdlcyA9IChub2RlKSA9PiB7XG4gICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICB9O1xuXG4gIC8vIFJlbW92ZSB0aGUgaGVhZGluZyBhYm92ZSB0aGUgcHJldmlld3NcbiAgaWYgKGN1cnJlbnRQcmV2aWV3SGVhZGluZykge1xuICAgIGN1cnJlbnRQcmV2aWV3SGVhZGluZy5vdXRlckhUTUwgPSBcIlwiO1xuICB9XG5cbiAgLy8gUmVtb3ZlIGV4aXN0aW5nIGVycm9yIG1lc3NhZ2VzXG4gIGlmIChjdXJyZW50RXJyb3JNZXNzYWdlKSB7XG4gICAgY3VycmVudEVycm9yTWVzc2FnZS5vdXRlckhUTUwgPSBcIlwiO1xuICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShJTlZBTElEX0ZJTEVfQ0xBU1MpO1xuICB9XG5cbiAgLy8gR2V0IHJpZCBvZiBleGlzdGluZyBwcmV2aWV3cyBpZiB0aGV5IGV4aXN0LCBzaG93IGluc3RydWN0aW9uc1xuICBpZiAoZmlsZVByZXZpZXdzICE9PSBudWxsKSB7XG4gICAgaWYgKGluc3RydWN0aW9ucykge1xuICAgICAgaW5zdHJ1Y3Rpb25zLmNsYXNzTGlzdC5yZW1vdmUoSElEREVOX0NMQVNTKTtcbiAgICB9XG4gICAgZmlsZUlucHV0RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGlucHV0QXJpYUxhYmVsKTtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGZpbGVQcmV2aWV3cywgcmVtb3ZlSW1hZ2VzKTtcbiAgfVxufTtcblxuLyoqXG4gKiBXaGVuIG5ldyBmaWxlcyBhcmUgYXBwbGllZCB0byBmaWxlIGlucHV0LCB0aGlzIGZ1bmN0aW9uIGdlbmVyYXRlcyBwcmV2aWV3c1xuICogYW5kIHJlbW92ZXMgb2xkIG9uZXMuXG4gKiBAcGFyYW0ge2V2ZW50fSBlXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBmaWxlSW5wdXRFbCAtIGZpbGUgaW5wdXQgZWxlbWVudFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gaW5zdHJ1Y3Rpb25zIC0gdGV4dCB0byBpbmZvcm0gdXNlcnMgdG8gZHJhZyBvciBzZWxlY3QgZmlsZXNcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyb3BUYXJnZXQgLSB0YXJnZXQgYXJlYSBkaXYgdGhhdCBlbmNhc2VzIHRoZSBpbnB1dFxuICovXG5cbmNvbnN0IGhhbmRsZUNoYW5nZSA9IChlLCBmaWxlSW5wdXRFbCwgaW5zdHJ1Y3Rpb25zLCBkcm9wVGFyZ2V0KSA9PiB7XG4gIGNvbnN0IGZpbGVOYW1lcyA9IGUudGFyZ2V0LmZpbGVzO1xuICBjb25zdCBmaWxlUHJldmlld3NIZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29uc3QgaW5wdXRBcmlhTGFiZWwgPSBmaWxlSW5wdXRFbC5kYXRhc2V0LmRlZmF1bHRBcmlhTGFiZWw7XG4gIGNvbnN0IGZpbGVTdG9yZSA9IFtdO1xuXG4gIC8vIEZpcnN0LCBnZXQgcmlkIG9mIGV4aXN0aW5nIHByZXZpZXdzXG4gIHJlbW92ZU9sZFByZXZpZXdzKGRyb3BUYXJnZXQsIGluc3RydWN0aW9ucywgaW5wdXRBcmlhTGFiZWwpO1xuXG4gIC8vIFRoZW4sIGl0ZXJhdGUgdGhyb3VnaCBmaWxlcyBsaXN0IGFuZDpcbiAgLy8gMS4gQWRkIHNlbGVjdGVkIGZpbGUgbGlzdCBuYW1lcyB0byBhcmlhLWxhYmVsXG4gIC8vIDIuIENyZWF0ZSBwcmV2aWV3c1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVOYW1lcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlTmFtZXNbaV0ubmFtZTtcblxuICAgIC8vIFB1c2ggdXBkYXRlZCBmaWxlIG5hbWVzIGludG8gdGhlIHN0b3JlIGFycmF5XG4gICAgZmlsZVN0b3JlLnB1c2goZmlsZU5hbWUpO1xuXG4gICAgLy8gcmVhZCBvdXQgdGhlIHN0b3JlIGFycmF5IHZpYSBhcmlhLWxhYmVsLCB3b3JkaW5nIG9wdGlvbnMgdmFyeSBiYXNlZCBvbiBmaWxlIGNvdW50XG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGZpbGVJbnB1dEVsLnNldEF0dHJpYnV0ZShcbiAgICAgICAgXCJhcmlhLWxhYmVsXCIsXG4gICAgICAgIGBZb3UgaGF2ZSBzZWxlY3RlZCB0aGUgZmlsZTogJHtmaWxlTmFtZX1gXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoaSA+PSAxKSB7XG4gICAgICBmaWxlSW5wdXRFbC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgIFwiYXJpYS1sYWJlbFwiLFxuICAgICAgICBgWW91IGhhdmUgc2VsZWN0ZWQgJHtmaWxlTmFtZXMubGVuZ3RofSBmaWxlczogJHtmaWxlU3RvcmUuam9pbihcIiwgXCIpfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU3RhcnRzIHdpdGggYSBsb2FkaW5nIGltYWdlIHdoaWxlIHByZXZpZXcgaXMgY3JlYXRlZFxuICAgIHJlYWRlci5vbmxvYWRzdGFydCA9IGZ1bmN0aW9uIGNyZWF0ZUxvYWRpbmdJbWFnZSgpIHtcbiAgICAgIGNvbnN0IGltYWdlSWQgPSBjcmVhdGVVbmlxdWVJRChtYWtlU2FmZUZvcklEKGZpbGVOYW1lKSk7XG5cbiAgICAgIGluc3RydWN0aW9ucy5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgIFwiYWZ0ZXJlbmRcIixcbiAgICAgICAgU2FuaXRpemVyLmVzY2FwZUhUTUxgPGRpdiBjbGFzcz1cIiR7UFJFVklFV19DTEFTU31cIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICA8aW1nIGlkPVwiJHtpbWFnZUlkfVwiIHNyYz1cIiR7U1BBQ0VSX0dJRn1cIiBhbHQ9XCJcIiBjbGFzcz1cIiR7R0VORVJJQ19QUkVWSUVXX0NMQVNTX05BTUV9ICR7TE9BRElOR19DTEFTU31cIi8+JHtmaWxlTmFtZX1cbiAgICAgICAgPGRpdj5gXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBOb3QgYWxsIGZpbGVzIHdpbGwgYmUgYWJsZSB0byBnZW5lcmF0ZSBwcmV2aWV3cy4gSW4gY2FzZSB0aGlzIGhhcHBlbnMsIHdlIHByb3ZpZGUgc2V2ZXJhbCB0eXBlcyBcImdlbmVyaWMgcHJldmlld3NcIiBiYXNlZCBvbiB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgcmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uIGNyZWF0ZUZpbGVQcmV2aWV3KCkge1xuICAgICAgY29uc3QgaW1hZ2VJZCA9IGNyZWF0ZVVuaXF1ZUlEKG1ha2VTYWZlRm9ySUQoZmlsZU5hbWUpKTtcbiAgICAgIGNvbnN0IHByZXZpZXdJbWFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGltYWdlSWQpO1xuICAgICAgaWYgKGZpbGVOYW1lLmluZGV4T2YoXCIucGRmXCIpID4gMCkge1xuICAgICAgICBwcmV2aWV3SW1hZ2Uuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwib25lcnJvclwiLFxuICAgICAgICAgIGB0aGlzLm9uZXJyb3I9bnVsbDt0aGlzLnNyYz1cIiR7U1BBQ0VSX0dJRn1cIjsgdGhpcy5jbGFzc0xpc3QuYWRkKFwiJHtQREZfUFJFVklFV19DTEFTU31cIilgXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBmaWxlTmFtZS5pbmRleE9mKFwiLmRvY1wiKSA+IDAgfHxcbiAgICAgICAgZmlsZU5hbWUuaW5kZXhPZihcIi5wYWdlc1wiKSA+IDBcbiAgICAgICkge1xuICAgICAgICBwcmV2aWV3SW1hZ2Uuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwib25lcnJvclwiLFxuICAgICAgICAgIGB0aGlzLm9uZXJyb3I9bnVsbDt0aGlzLnNyYz1cIiR7U1BBQ0VSX0dJRn1cIjsgdGhpcy5jbGFzc0xpc3QuYWRkKFwiJHtXT1JEX1BSRVZJRVdfQ0xBU1N9XCIpYFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZmlsZU5hbWUuaW5kZXhPZihcIi54bHNcIikgPiAwIHx8XG4gICAgICAgIGZpbGVOYW1lLmluZGV4T2YoXCIubnVtYmVyc1wiKSA+IDBcbiAgICAgICkge1xuICAgICAgICBwcmV2aWV3SW1hZ2Uuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwib25lcnJvclwiLFxuICAgICAgICAgIGB0aGlzLm9uZXJyb3I9bnVsbDt0aGlzLnNyYz1cIiR7U1BBQ0VSX0dJRn1cIjsgdGhpcy5jbGFzc0xpc3QuYWRkKFwiJHtFWENFTF9QUkVWSUVXX0NMQVNTfVwiKWBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoZmlsZU5hbWUuaW5kZXhPZihcIi5tb3ZcIikgPiAwIHx8IGZpbGVOYW1lLmluZGV4T2YoXCIubXA0XCIpID4gMCkge1xuICAgICAgICBwcmV2aWV3SW1hZ2Uuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwib25lcnJvclwiLFxuICAgICAgICAgIGB0aGlzLm9uZXJyb3I9bnVsbDt0aGlzLnNyYz1cIiR7U1BBQ0VSX0dJRn1cIjsgdGhpcy5jbGFzc0xpc3QuYWRkKFwiJHtWSURFT19QUkVWSUVXX0NMQVNTfVwiKWBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByZXZpZXdJbWFnZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJvbmVycm9yXCIsXG4gICAgICAgICAgYHRoaXMub25lcnJvcj1udWxsO3RoaXMuc3JjPVwiJHtTUEFDRVJfR0lGfVwiOyB0aGlzLmNsYXNzTGlzdC5hZGQoXCIke0dFTkVSSUNfUFJFVklFV19DTEFTU31cIilgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZXMgbG9hZGVyIGFuZCBkaXNwbGF5cyBwcmV2aWV3XG4gICAgICBwcmV2aWV3SW1hZ2UuY2xhc3NMaXN0LnJlbW92ZShMT0FESU5HX0NMQVNTKTtcbiAgICAgIHByZXZpZXdJbWFnZS5zcmMgPSByZWFkZXIucmVzdWx0O1xuICAgIH07XG5cbiAgICBpZiAoZmlsZU5hbWVzW2ldKSB7XG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlTmFtZXNbaV0pO1xuICAgIH1cblxuICAgIC8vIEFkZHMgaGVhZGluZyBhYm92ZSBmaWxlIHByZXZpZXdzLCBwbHVyYWxpemVzIGlmIHRoZXJlIGFyZSBtdWx0aXBsZVxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICBkcm9wVGFyZ2V0Lmluc2VydEJlZm9yZShmaWxlUHJldmlld3NIZWFkaW5nLCBpbnN0cnVjdGlvbnMpO1xuICAgICAgZmlsZVByZXZpZXdzSGVhZGluZy5pbm5lckhUTUwgPSBgU2VsZWN0ZWQgZmlsZSA8c3BhbiBjbGFzcz1cInVzYS1maWxlLWlucHV0X19jaG9vc2VcIj5DaGFuZ2UgZmlsZTwvc3Bhbj5gO1xuICAgIH0gZWxzZSBpZiAoaSA+PSAxKSB7XG4gICAgICBkcm9wVGFyZ2V0Lmluc2VydEJlZm9yZShmaWxlUHJldmlld3NIZWFkaW5nLCBpbnN0cnVjdGlvbnMpO1xuICAgICAgZmlsZVByZXZpZXdzSGVhZGluZy5pbm5lckhUTUwgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGAke1xuICAgICAgICBpICsgMVxuICAgICAgfSBmaWxlcyBzZWxlY3RlZCA8c3BhbiBjbGFzcz1cInVzYS1maWxlLWlucHV0X19jaG9vc2VcIj5DaGFuZ2UgZmlsZXM8L3NwYW4+YDtcbiAgICB9XG5cbiAgICAvLyBIaWRlcyBudWxsIHN0YXRlIGNvbnRlbnQgYW5kIHNldHMgcHJldmlldyBoZWFkaW5nIGNsYXNzXG4gICAgaWYgKGZpbGVQcmV2aWV3c0hlYWRpbmcpIHtcbiAgICAgIGluc3RydWN0aW9ucy5jbGFzc0xpc3QuYWRkKEhJRERFTl9DTEFTUyk7XG4gICAgICBmaWxlUHJldmlld3NIZWFkaW5nLmNsYXNzTGlzdC5hZGQoUFJFVklFV19IRUFESU5HX0NMQVNTKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogV2hlbiB1c2luZyBhbiBBY2NlcHQgYXR0cmlidXRlLCBpbnZhbGlkIGZpbGVzIHdpbGwgYmUgaGlkZGVuIGZyb21cbiAqIGZpbGUgYnJvd3NlciwgYnV0IHRoZXkgY2FuIHN0aWxsIGJlIGRyYWdnZWQgdG8gdGhlIGlucHV0LiBUaGlzXG4gKiBmdW5jdGlvbiBwcmV2ZW50cyB0aGVtIGZyb20gYmVpbmcgZHJhZ2dlZCBhbmQgcmVtb3ZlcyBlcnJvciBzdGF0ZXNcbiAqIHdoZW4gY29ycmVjdCBmaWxlcyBhcmUgYWRkZWQuXG4gKiBAcGFyYW0ge2V2ZW50fSBlXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBmaWxlSW5wdXRFbCAtIGZpbGUgaW5wdXQgZWxlbWVudFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gaW5zdHJ1Y3Rpb25zIC0gdGV4dCB0byBpbmZvcm0gdXNlcnMgdG8gZHJhZyBvciBzZWxlY3QgZmlsZXNcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyb3BUYXJnZXQgLSB0YXJnZXQgYXJlYSBkaXYgdGhhdCBlbmNhc2VzIHRoZSBpbnB1dFxuICovXG5jb25zdCBwcmV2ZW50SW52YWxpZEZpbGVzID0gKGUsIGZpbGVJbnB1dEVsLCBpbnN0cnVjdGlvbnMsIGRyb3BUYXJnZXQpID0+IHtcbiAgY29uc3QgYWNjZXB0ZWRGaWxlc0F0dHIgPSBmaWxlSW5wdXRFbC5nZXRBdHRyaWJ1dGUoXCJhY2NlcHRcIik7XG4gIGRyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShJTlZBTElEX0ZJTEVfQ0xBU1MpO1xuXG4gIC8qKlxuICAgKiBXZSBjYW4gcHJvYmFibHkgbW92ZSBhd2F5IGZyb20gdGhpcyBvbmNlIElFMTEgc3VwcG9ydCBzdG9wcywgYW5kIHJlcGxhY2VcbiAgICogd2l0aCBhIHNpbXBsZSBlcyBgLmluY2x1ZGVzYFxuICAgKiBjaGVjayBpZiBlbGVtZW50IGlzIGluIGFycmF5XG4gICAqIGNoZWNrIGlmIDEgb3IgbW9yZSBhbHBoYWJldHMgYXJlIGluIHN0cmluZ1xuICAgKiBpZiBlbGVtZW50IGlzIHByZXNlbnQgcmV0dXJuIHRoZSBwb3NpdGlvbiB2YWx1ZSBhbmQgLTEgb3RoZXJ3aXNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmaWxlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGNvbnN0IGlzSW5jbHVkZWQgPSAoZmlsZSwgdmFsdWUpID0+IHtcbiAgICBsZXQgcmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICBjb25zdCBwb3MgPSBmaWxlLmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChwb3MgPj0gMCkge1xuICAgICAgcmV0dXJuVmFsdWUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH07XG5cbiAgLy8gUnVucyBpZiBvbmx5IHNwZWNpZmljIGZpbGVzIGFyZSBhY2NlcHRlZFxuICBpZiAoYWNjZXB0ZWRGaWxlc0F0dHIpIHtcbiAgICBjb25zdCBhY2NlcHRlZEZpbGVzID0gYWNjZXB0ZWRGaWxlc0F0dHIuc3BsaXQoXCIsXCIpO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICAvLyBJZiBtdWx0aXBsZSBmaWxlcyBhcmUgZHJhZ2dlZCwgdGhpcyBpdGVyYXRlcyB0aHJvdWdoIHRoZW0gYW5kIGxvb2sgZm9yIGFueSBmaWxlcyB0aGF0IGFyZSBub3QgYWNjZXB0ZWQuXG4gICAgbGV0IGFsbEZpbGVzQWxsb3dlZCA9IHRydWU7XG4gICAgY29uc3Qgc2Nhbm5lZEZpbGVzID0gZS50YXJnZXQuZmlsZXMgfHwgZS5kYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2FubmVkRmlsZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBzY2FubmVkRmlsZXNbaV07XG4gICAgICBpZiAoYWxsRmlsZXNBbGxvd2VkKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYWNjZXB0ZWRGaWxlcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIGNvbnN0IGZpbGVUeXBlID0gYWNjZXB0ZWRGaWxlc1tqXTtcbiAgICAgICAgICBhbGxGaWxlc0FsbG93ZWQgPVxuICAgICAgICAgICAgZmlsZS5uYW1lLmluZGV4T2YoZmlsZVR5cGUpID4gMCB8fFxuICAgICAgICAgICAgaXNJbmNsdWRlZChmaWxlLnR5cGUsIGZpbGVUeXBlLnJlcGxhY2UoL1xcKi9nLCBcIlwiKSk7XG4gICAgICAgICAgaWYgKGFsbEZpbGVzQWxsb3dlZCkge1xuICAgICAgICAgICAgVFlQRV9JU19WQUxJRCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBicmVhaztcbiAgICB9XG5cbiAgICAvLyBJZiBkcmFnZ2VkIGZpbGVzIGFyZSBub3QgYWNjZXB0ZWQsIHRoaXMgcmVtb3ZlcyB0aGVtIGZyb20gdGhlIHZhbHVlIG9mIHRoZSBpbnB1dCBhbmQgY3JlYXRlcyBhbmQgZXJyb3Igc3RhdGVcbiAgICBpZiAoIWFsbEZpbGVzQWxsb3dlZCkge1xuICAgICAgcmVtb3ZlT2xkUHJldmlld3MoZHJvcFRhcmdldCwgaW5zdHJ1Y3Rpb25zKTtcbiAgICAgIGZpbGVJbnB1dEVsLnZhbHVlID0gXCJcIjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgZHJvcFRhcmdldC5pbnNlcnRCZWZvcmUoZXJyb3JNZXNzYWdlLCBmaWxlSW5wdXRFbCk7XG4gICAgICBlcnJvck1lc3NhZ2UudGV4dENvbnRlbnQgPVxuICAgICAgICBmaWxlSW5wdXRFbC5kYXRhc2V0LmVycm9ybWVzc2FnZSB8fCBgVGhpcyBpcyBub3QgYSB2YWxpZCBmaWxlIHR5cGUuYDtcbiAgICAgIGVycm9yTWVzc2FnZS5jbGFzc0xpc3QuYWRkKEFDQ0VQVEVEX0ZJTEVfTUVTU0FHRV9DTEFTUyk7XG4gICAgICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5hZGQoSU5WQUxJRF9GSUxFX0NMQVNTKTtcbiAgICAgIFRZUEVfSVNfVkFMSUQgPSBmYWxzZTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIDEuIHBhc3NlcyB0aHJvdWdoIGdhdGUgZm9yIHByZXZlbnRpbmcgaW52YWxpZCBmaWxlc1xuICogMi4gaGFuZGxlcyB1cGRhdGVzIGlmIGZpbGUgaXMgdmFsaWRcbiAqIEBwYXJhbSB7ZXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBpbnN0cnVjdGlvbnNFbFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0XG4gKi9cbmNvbnN0IGhhbmRsZVVwbG9hZCA9IChldmVudCwgZWxlbWVudCwgaW5zdHJ1Y3Rpb25zRWwsIGRyb3BUYXJnZXRFbCkgPT4ge1xuICBwcmV2ZW50SW52YWxpZEZpbGVzKGV2ZW50LCBlbGVtZW50LCBpbnN0cnVjdGlvbnNFbCwgZHJvcFRhcmdldEVsKTtcbiAgaWYgKFRZUEVfSVNfVkFMSUQgPT09IHRydWUpIHtcbiAgICBoYW5kbGVDaGFuZ2UoZXZlbnQsIGVsZW1lbnQsIGluc3RydWN0aW9uc0VsLCBkcm9wVGFyZ2V0RWwpO1xuICB9XG59O1xuXG5jb25zdCBmaWxlSW5wdXQgPSBiZWhhdmlvcihcbiAge30sXG4gIHtcbiAgICBpbml0KHJvb3QpIHtcbiAgICAgIHNlbGVjdChEUk9QWk9ORSwgcm9vdCkuZm9yRWFjaCgoZmlsZUlucHV0RWwpID0+IHtcbiAgICAgICAgY29uc3QgeyBpbnN0cnVjdGlvbnMsIGRyb3BUYXJnZXQgfSA9IGJ1aWxkRmlsZUlucHV0KGZpbGVJbnB1dEVsKTtcblxuICAgICAgICBkcm9wVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgXCJkcmFnb3ZlclwiLFxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZURyYWdPdmVyKCkge1xuICAgICAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKERSQUdfQ0xBU1MpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICBkcm9wVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgXCJkcmFnbGVhdmVcIixcbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVEcmFnTGVhdmUoKSB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoRFJBR19DTEFTUyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIGRyb3BUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImRyb3BcIixcbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVEcm9wKCkge1xuICAgICAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKERSQUdfQ0xBU1MpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICBmaWxlSW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwiY2hhbmdlXCIsXG4gICAgICAgICAgKGUpID0+IGhhbmRsZVVwbG9hZChlLCBmaWxlSW5wdXRFbCwgaW5zdHJ1Y3Rpb25zLCBkcm9wVGFyZ2V0KSxcbiAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRGaWxlSW5wdXRDb250ZXh0LFxuICAgIGRpc2FibGUsXG4gICAgZW5hYmxlLFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbGVJbnB1dDtcbiIsImNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbmNvbnN0IFNDT1BFID0gYC4ke1BSRUZJWH0tZm9vdGVyLS1iaWdgO1xuY29uc3QgTkFWID0gYCR7U0NPUEV9IG5hdmA7XG5jb25zdCBCVVRUT04gPSBgJHtOQVZ9IC4ke1BSRUZJWH0tZm9vdGVyX19wcmltYXJ5LWxpbmtgO1xuY29uc3QgSElERV9NQVhfV0lEVEggPSA0ODA7XG5cbi8qKlxuICogRXhwYW5kcyBzZWxlY3RlZCBmb290ZXIgbWVudSBwYW5lbCwgd2hpbGUgY29sbGFwc2luZyBvdGhlcnNcbiAqL1xuZnVuY3Rpb24gc2hvd1BhbmVsKCkge1xuICBpZiAod2luZG93LmlubmVyV2lkdGggPCBISURFX01BWF9XSURUSCkge1xuICAgIGNvbnN0IGlzT3BlbiA9IHRoaXMuZ2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJykgPT09ICd0cnVlJztcbiAgICBjb25zdCB0aGlzRm9vdGVyID0gdGhpcy5jbG9zZXN0KFNDT1BFKTtcblxuICAgIC8vIENsb3NlIGFsbCBvdGhlciBtZW51c1xuICAgIHRoaXNGb290ZXIucXVlcnlTZWxlY3RvckFsbChCVVRUT04pLmZvckVhY2goKGJ1dHRvbikgPT4ge1xuICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgIWlzT3Blbik7XG4gIH1cbn1cblxuLyoqXG4gKiBTd2FwcyB0aGUgPGg0PiBlbGVtZW50IGZvciBhIDxidXR0b24+IGVsZW1lbnQgKGFuZCB2aWNlLXZlcnNhKSBhbmQgc2V0cyBpZFxuICogb2YgbWVudSBsaXN0XG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBpc01vYmlsZSAtIElmIHRoZSBmb290ZXIgaXMgaW4gbW9iaWxlIGNvbmZpZ3VyYXRpb25cbiAqL1xuZnVuY3Rpb24gdG9nZ2xlSHRtbFRhZyhpc01vYmlsZSkge1xuICBjb25zdCBiaWdGb290ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNDT1BFKTtcblxuICBpZiAoIWJpZ0Zvb3Rlcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHByaW1hcnlMaW5rcyA9IGJpZ0Zvb3Rlci5xdWVyeVNlbGVjdG9yQWxsKEJVVFRPTik7XG4gIGNvbnN0IG5ld0VsZW1lbnRUeXBlID0gaXNNb2JpbGUgPyAnYnV0dG9uJyA6ICdoNCc7XG5cbiAgcHJpbWFyeUxpbmtzLmZvckVhY2goY3VycmVudEVsZW1lbnQgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRFbGVtZW50Q2xhc3NlcyA9IGN1cnJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGVsZW1lbnRcbiAgICBjb25zdCBuZXdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuZXdFbGVtZW50VHlwZSk7XG4gICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY3VycmVudEVsZW1lbnRDbGFzc2VzKTtcbiAgICBuZXdFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoYCR7UFJFRklYfS1mb290ZXJfX3ByaW1hcnktbGluay0tYnV0dG9uYCwgaXNNb2JpbGUpO1xuICAgIG5ld0VsZW1lbnQudGV4dENvbnRlbnQgPSBjdXJyZW50RWxlbWVudC50ZXh0Q29udGVudDtcblxuICAgIGlmIChpc01vYmlsZSkge1xuICAgICAgY29uc3QgbWVudUlkID0gYCR7UFJFRklYfS1mb290ZXItbWVudS1saXN0LSR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwKX1gO1xuXG4gICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycsIG1lbnVJZCk7XG4gICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgICAgY3VycmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLnNldEF0dHJpYnV0ZSgnaWQnLCBtZW51SWQpO1xuICAgICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgfVxuXG4gICAgLy8gSW5zZXJ0IHRoZSBuZXcgZWxlbWVudCBhbmQgZGVsZXRlIHRoZSBvbGRcbiAgICBjdXJyZW50RWxlbWVudC5hZnRlcihuZXdFbGVtZW50KTtcbiAgICBjdXJyZW50RWxlbWVudC5yZW1vdmUoKTtcbiAgfSk7XG59XG5cbmNvbnN0IHJlc2l6ZSA9IChldmVudCkgPT4ge1xuICB0b2dnbGVIdG1sVGFnKGV2ZW50Lm1hdGNoZXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJlaGF2aW9yKFxuICB7XG4gICAgW0NMSUNLXToge1xuICAgICAgW0JVVFRPTl06IHNob3dQYW5lbCxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgLy8gZXhwb3J0IGZvciB1c2UgZWxzZXdoZXJlXG4gICAgSElERV9NQVhfV0lEVEgsXG5cbiAgICBpbml0KCkge1xuICAgICAgdG9nZ2xlSHRtbFRhZyh3aW5kb3cuaW5uZXJXaWR0aCA8IEhJREVfTUFYX1dJRFRIKTtcbiAgICAgIHRoaXMubWVkaWFRdWVyeUxpc3QgPSB3aW5kb3cubWF0Y2hNZWRpYShcbiAgICAgICAgYChtYXgtd2lkdGg6ICR7SElERV9NQVhfV0lEVEggLSAwLjF9cHgpYFxuICAgICAgKTtcbiAgICAgIHRoaXMubWVkaWFRdWVyeUxpc3QuYWRkTGlzdGVuZXIocmVzaXplKTtcbiAgICB9LFxuXG4gICAgdGVhcmRvd24oKSB7XG4gICAgICB0aGlzLm1lZGlhUXVlcnlMaXN0LnJlbW92ZUxpc3RlbmVyKHJlc2l6ZSk7XG4gICAgfSxcbiAgfVxuKTtcbiIsImNvbnN0IGFjY29yZGlvbiA9IHJlcXVpcmUoXCIuL2FjY29yZGlvblwiKTtcbmNvbnN0IGJhbm5lciA9IHJlcXVpcmUoXCIuL2Jhbm5lclwiKTtcbmNvbnN0IGNoYXJhY3RlckNvdW50ID0gcmVxdWlyZShcIi4vY2hhcmFjdGVyLWNvdW50XCIpO1xuY29uc3QgY29tYm9Cb3ggPSByZXF1aXJlKFwiLi9jb21iby1ib3hcIik7XG5jb25zdCBmaWxlSW5wdXQgPSByZXF1aXJlKFwiLi9maWxlLWlucHV0XCIpO1xuY29uc3QgZm9vdGVyID0gcmVxdWlyZShcIi4vZm9vdGVyXCIpO1xuY29uc3QgaW5wdXRQcmVmaXhTdWZmaXggPSByZXF1aXJlKFwiLi9pbnB1dC1wcmVmaXgtc3VmZml4XCIpO1xuY29uc3QgbW9kYWwgPSByZXF1aXJlKFwiLi9tb2RhbFwiKTtcbmNvbnN0IG5hdmlnYXRpb24gPSByZXF1aXJlKFwiLi9uYXZpZ2F0aW9uXCIpO1xuY29uc3QgcGFzc3dvcmQgPSByZXF1aXJlKFwiLi9wYXNzd29yZFwiKTtcbmNvbnN0IHNlYXJjaCA9IHJlcXVpcmUoXCIuL3NlYXJjaFwiKTtcbmNvbnN0IHNraXBuYXYgPSByZXF1aXJlKFwiLi9za2lwbmF2XCIpO1xuY29uc3QgdG9vbHRpcCA9IHJlcXVpcmUoXCIuL3Rvb2x0aXBcIik7XG5jb25zdCB2YWxpZGF0b3IgPSByZXF1aXJlKFwiLi92YWxpZGF0b3JcIik7XG5jb25zdCBkYXRlUGlja2VyID0gcmVxdWlyZShcIi4vZGF0ZS1waWNrZXJcIik7XG5jb25zdCBkYXRlUmFuZ2VQaWNrZXIgPSByZXF1aXJlKFwiLi9kYXRlLXJhbmdlLXBpY2tlclwiKTtcbmNvbnN0IHRpbWVQaWNrZXIgPSByZXF1aXJlKFwiLi90aW1lLXBpY2tlclwiKTtcbmNvbnN0IHRhYmxlID0gcmVxdWlyZShcIi4vdGFibGVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY2NvcmRpb24sXG4gIGJhbm5lcixcbiAgY2hhcmFjdGVyQ291bnQsXG4gIGNvbWJvQm94LFxuICBkYXRlUGlja2VyLFxuICBkYXRlUmFuZ2VQaWNrZXIsXG4gIGZpbGVJbnB1dCxcbiAgZm9vdGVyLFxuICBpbnB1dFByZWZpeFN1ZmZpeCxcbiAgbW9kYWwsXG4gIG5hdmlnYXRpb24sXG4gIHBhc3N3b3JkLFxuICBzZWFyY2gsXG4gIHNraXBuYXYsXG4gIHRhYmxlLFxuICB0aW1lUGlja2VyLFxuICB0b29sdGlwLFxuICB2YWxpZGF0b3IsXG59O1xuIiwiY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcbmNvbnN0IHsgQ0xJQ0sgfSA9IHJlcXVpcmUoXCIuLi9ldmVudHNcIik7XG5cbmNvbnN0IENPTlRBSU5FUiA9IGAuJHtQUkVGSVh9LWlucHV0LWdyb3VwYDtcbmNvbnN0IElOUFVUID0gYCR7Q09OVEFJTkVSfSAuJHtQUkVGSVh9LWlucHV0YDtcbmNvbnN0IERFQ09SQVRJT04gPSBgJHtDT05UQUlORVJ9IC4ke1BSRUZJWH0taW5wdXQtcHJlZml4LCAke0NPTlRBSU5FUn0gLiR7UFJFRklYfS1pbnB1dC1zdWZmaXhgO1xuY29uc3QgRk9DVVNfQ0xBU1MgPSBcImlzLWZvY3VzZWRcIjtcblxuZnVuY3Rpb24gc2V0Rm9jdXMoZWwpIHtcbiAgZWwuY2xvc2VzdChDT05UQUlORVIpLnF1ZXJ5U2VsZWN0b3IoYC4ke1BSRUZJWH0taW5wdXRgKS5mb2N1cygpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVGb2N1cygpIHtcbiAgdGhpcy5jbG9zZXN0KENPTlRBSU5FUikuY2xhc3NMaXN0LmFkZChGT0NVU19DTEFTUyk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUJsdXIoKSB7XG4gIHRoaXMuY2xvc2VzdChDT05UQUlORVIpLmNsYXNzTGlzdC5yZW1vdmUoRk9DVVNfQ0xBU1MpO1xufVxuXG5jb25zdCBpbnB1dFByZWZpeFN1ZmZpeCA9IGJlaGF2aW9yKFxuICB7XG4gICAgW0NMSUNLXToge1xuICAgICAgW0RFQ09SQVRJT05dKCkge1xuICAgICAgICBzZXRGb2N1cyh0aGlzKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgc2VsZWN0KElOUFVULCByb290KS5mb3JFYWNoKChpbnB1dEVsKSA9PiB7XG4gICAgICAgIGlucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIGhhbmRsZUZvY3VzLCBmYWxzZSk7XG4gICAgICAgIGlucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgaGFuZGxlQmx1ciwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfVxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dFByZWZpeFN1ZmZpeDtcbiIsImNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4uL3V0aWxzL3NlbGVjdFwiKTtcbmNvbnN0IEZvY3VzVHJhcCA9IHJlcXVpcmUoXCIuLi91dGlscy9mb2N1cy10cmFwXCIpO1xuY29uc3QgU2Nyb2xsQmFyV2lkdGggPSByZXF1aXJlKFwiLi4vdXRpbHMvc2Nyb2xsYmFyLXdpZHRoXCIpO1xuXG5jb25zdCB7IENMSUNLIH0gPSByZXF1aXJlKFwiLi4vZXZlbnRzXCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxuY29uc3QgTU9EQUxfQ0xBU1NOQU1FID0gYCR7UFJFRklYfS1tb2RhbGA7XG5jb25zdCBPVkVSTEFZX0NMQVNTTkFNRSA9IGAke01PREFMX0NMQVNTTkFNRX0tb3ZlcmxheWA7XG5jb25zdCBXUkFQUEVSX0NMQVNTTkFNRSA9IGAke01PREFMX0NMQVNTTkFNRX0td3JhcHBlcmA7XG5jb25zdCBPUEVORVJfQVRUUklCVVRFID0gXCJkYXRhLW9wZW4tbW9kYWxcIjtcbmNvbnN0IENMT1NFUl9BVFRSSUJVVEUgPSBcImRhdGEtY2xvc2UtbW9kYWxcIjtcbmNvbnN0IEZPUkNFX0FDVElPTl9BVFRSSUJVVEUgPSBcImRhdGEtZm9yY2UtYWN0aW9uXCI7XG5jb25zdCBOT05fTU9EQUxfSElEREVOX0FUVFJJQlVURSA9IGBkYXRhLW1vZGFsLWhpZGRlbmA7XG5jb25zdCBNT0RBTCA9IGAuJHtNT0RBTF9DTEFTU05BTUV9YDtcbmNvbnN0IElOSVRJQUxfRk9DVVMgPSBgLiR7V1JBUFBFUl9DTEFTU05BTUV9ICpbZGF0YS1mb2N1c11gO1xuY29uc3QgQ0xPU0VfQlVUVE9OID0gYCR7V1JBUFBFUl9DTEFTU05BTUV9ICpbJHtDTE9TRVJfQVRUUklCVVRFfV1gO1xuY29uc3QgT1BFTkVSUyA9IGAqWyR7T1BFTkVSX0FUVFJJQlVURX1dW2FyaWEtY29udHJvbHNdYDtcbmNvbnN0IENMT1NFUlMgPSBgJHtDTE9TRV9CVVRUT059LCAuJHtPVkVSTEFZX0NMQVNTTkFNRX06bm90KFske0ZPUkNFX0FDVElPTl9BVFRSSUJVVEV9XSlgO1xuY29uc3QgTk9OX01PREFMUyA9IGBib2R5ID4gKjpub3QoLiR7V1JBUFBFUl9DTEFTU05BTUV9KTpub3QoW2FyaWEtaGlkZGVuXSlgO1xuY29uc3QgTk9OX01PREFMU19ISURERU4gPSBgWyR7Tk9OX01PREFMX0hJRERFTl9BVFRSSUJVVEV9XWA7XG5cbmNvbnN0IEFDVElWRV9DTEFTUyA9IFwidXNhLWpzLW1vZGFsLS1hY3RpdmVcIjtcbmNvbnN0IFBSRVZFTlRfQ0xJQ0tfQ0xBU1MgPSBcInVzYS1qcy1uby1jbGlja1wiO1xuY29uc3QgVklTSUJMRV9DTEFTUyA9IFwiaXMtdmlzaWJsZVwiO1xuY29uc3QgSElEREVOX0NMQVNTID0gXCJpcy1oaWRkZW5cIjtcblxubGV0IG1vZGFsO1xuXG5jb25zdCBpc0FjdGl2ZSA9ICgpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKEFDVElWRV9DTEFTUyk7XG5jb25zdCBTQ1JPTExCQVJfV0lEVEggPSBTY3JvbGxCYXJXaWR0aCgpO1xuY29uc3QgSU5JVElBTF9QQURESU5HID0gd2luZG93XG4gIC5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpXG4gIC5nZXRQcm9wZXJ0eVZhbHVlKFwicGFkZGluZy1yaWdodFwiKTtcbmNvbnN0IFRFTVBPUkFSWV9QQURESU5HID0gYCR7XG4gIHBhcnNlSW50KElOSVRJQUxfUEFERElORy5yZXBsYWNlKC9weC8sIFwiXCIpLCAxMCkgK1xuICBwYXJzZUludChTQ1JPTExCQVJfV0lEVEgucmVwbGFjZSgvcHgvLCBcIlwiKSwgMTApXG59cHhgO1xuXG4vKipcbiAqICBJcyBib3VuZCB0byBlc2NhcGUga2V5LCBjbG9zZXMgbW9kYWwgd2hlblxuICovXG5jb25zdCBvbk1lbnVDbG9zZSA9ICgpID0+IHtcbiAgbW9kYWwudG9nZ2xlTW9kYWwuY2FsbChtb2RhbCwgZmFsc2UpO1xufTtcblxuLyoqXG4gKiAgVG9nZ2xlIHRoZSB2aXNpYmlsaXR5IG9mIGEgbW9kYWwgd2luZG93XG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICogQHJldHVybnMge2Jvb2xlYW59IHNhZmVBY3RpdmUgaWYgbW9iaWxlIGlzIG9wZW5cbiAqL1xuZnVuY3Rpb24gdG9nZ2xlTW9kYWwoZXZlbnQpIHtcbiAgbGV0IG9yaWdpbmFsT3BlbmVyO1xuICBsZXQgY2xpY2tlZEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gIGNvbnN0IHsgYm9keSB9ID0gZG9jdW1lbnQ7XG4gIGNvbnN0IHNhZmVBY3RpdmUgPSAhaXNBY3RpdmUoKTtcbiAgY29uc3QgbW9kYWxJZCA9IGNsaWNrZWRFbGVtZW50XG4gICAgPyBjbGlja2VkRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWNvbnRyb2xzXCIpXG4gICAgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnVzYS1tb2RhbC13cmFwcGVyLmlzLXZpc2libGVcIik7XG4gIGNvbnN0IHRhcmdldE1vZGFsID0gc2FmZUFjdGl2ZVxuICAgID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobW9kYWxJZClcbiAgICA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNhLW1vZGFsLXdyYXBwZXIuaXMtdmlzaWJsZVwiKTtcblxuICAvLyBpZiB0aGVyZSBpcyBubyBtb2RhbCB3ZSByZXR1cm4gZWFybHlcbiAgaWYgKCF0YXJnZXRNb2RhbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IG9wZW5Gb2N1c0VsID0gdGFyZ2V0TW9kYWwucXVlcnlTZWxlY3RvcihJTklUSUFMX0ZPQ1VTKVxuICAgID8gdGFyZ2V0TW9kYWwucXVlcnlTZWxlY3RvcihJTklUSUFMX0ZPQ1VTKVxuICAgIDogdGFyZ2V0TW9kYWwucXVlcnlTZWxlY3RvcihcIi51c2EtbW9kYWxcIik7XG4gIGNvbnN0IHJldHVybkZvY3VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgdGFyZ2V0TW9kYWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1vcGVuZXJcIilcbiAgKTtcbiAgY29uc3QgbWVudUJ1dHRvbiA9IGJvZHkucXVlcnlTZWxlY3RvcihPUEVORVJTKTtcbiAgY29uc3QgZm9yY2VVc2VyQWN0aW9uID0gdGFyZ2V0TW9kYWwuZ2V0QXR0cmlidXRlKEZPUkNFX0FDVElPTl9BVFRSSUJVVEUpO1xuXG4gIC8vIFNldHMgdGhlIGNsaWNrZWQgZWxlbWVudCB0byB0aGUgY2xvc2UgYnV0dG9uXG4gIC8vIHNvIGVzYyBrZXkgYWx3YXlzIGNsb3NlcyBtb2RhbFxuICBpZiAoZXZlbnQudHlwZSA9PT0gXCJrZXlkb3duXCIgJiYgdGFyZ2V0TW9kYWwgIT09IG51bGwpIHtcbiAgICBjbGlja2VkRWxlbWVudCA9IHRhcmdldE1vZGFsLnF1ZXJ5U2VsZWN0b3IoQ0xPU0VfQlVUVE9OKTtcbiAgfVxuXG4gIC8vIFdoZW4gd2UncmUgbm90IGhpdHRpbmcgdGhlIGVzY2FwZSBrZXnigKZcbiAgaWYgKGNsaWNrZWRFbGVtZW50KSB7XG4gICAgLy8gTWFrZSBzdXJlIHdlIGNsaWNrIHRoZSBvcGVuZXJcbiAgICAvLyBJZiBpdCBkb2Vzbid0IGhhdmUgYW4gSUQsIG1ha2Ugb25lXG4gICAgLy8gU3RvcmUgaWQgYXMgZGF0YSBhdHRyaWJ1dGUgb24gbW9kYWxcbiAgICBpZiAoY2xpY2tlZEVsZW1lbnQuaGFzQXR0cmlidXRlKE9QRU5FUl9BVFRSSUJVVEUpKSB7XG4gICAgICBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoXCJpZFwiKSA9PT0gbnVsbCkge1xuICAgICAgICBvcmlnaW5hbE9wZW5lciA9IGBtb2RhbC0ke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDkwMDAwMCkgKyAxMDAwMDB9YDtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBvcmlnaW5hbE9wZW5lcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcmlnaW5hbE9wZW5lciA9IHRoaXMuZ2V0QXR0cmlidXRlKFwiaWRcIik7XG4gICAgICB9XG4gICAgICB0YXJnZXRNb2RhbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wZW5lclwiLCBvcmlnaW5hbE9wZW5lcik7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBiYXNpY2FsbHkgc3RvcHMgdGhlIHByb3BhZ2F0aW9uIGlmIHRoZSBlbGVtZW50XG4gICAgLy8gaXMgaW5zaWRlIHRoZSBtb2RhbCBhbmQgbm90IGEgY2xvc2UgYnV0dG9uIG9yXG4gICAgLy8gZWxlbWVudCBpbnNpZGUgYSBjbG9zZSBidXR0b25cbiAgICBpZiAoY2xpY2tlZEVsZW1lbnQuY2xvc2VzdChgLiR7TU9EQUxfQ0xBU1NOQU1FfWApKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGNsaWNrZWRFbGVtZW50Lmhhc0F0dHJpYnV0ZShDTE9TRVJfQVRUUklCVVRFKSB8fFxuICAgICAgICBjbGlja2VkRWxlbWVudC5jbG9zZXN0KGBbJHtDTE9TRVJfQVRUUklCVVRFfV1gKVxuICAgICAgKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmcuIG1vdmUgb24uXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZShBQ1RJVkVfQ0xBU1MsIHNhZmVBY3RpdmUpO1xuICB0YXJnZXRNb2RhbC5jbGFzc0xpc3QudG9nZ2xlKFZJU0lCTEVfQ0xBU1MsIHNhZmVBY3RpdmUpO1xuICB0YXJnZXRNb2RhbC5jbGFzc0xpc3QudG9nZ2xlKEhJRERFTl9DTEFTUywgIXNhZmVBY3RpdmUpO1xuXG4gIC8vIElmIHVzZXIgaXMgZm9yY2VkIHRvIHRha2UgYW4gYWN0aW9uLCBhZGRpbmdcbiAgLy8gYSBjbGFzcyB0byB0aGUgYm9keSB0aGF0IHByZXZlbnRzIGNsaWNraW5nIHVuZGVybmVhdGhcbiAgLy8gb3ZlcmxheVxuICBpZiAoZm9yY2VVc2VyQWN0aW9uKSB7XG4gICAgYm9keS5jbGFzc0xpc3QudG9nZ2xlKFBSRVZFTlRfQ0xJQ0tfQ0xBU1MsIHNhZmVBY3RpdmUpO1xuICB9XG5cbiAgLy8gQWNjb3VudCBmb3IgY29udGVudCBzaGlmdGluZyBmcm9tIGJvZHkgb3ZlcmZsb3c6IGhpZGRlblxuICAvLyBXZSBvbmx5IGNoZWNrIHBhZGRpbmdSaWdodCBpbiBjYXNlIGFwcHMgYXJlIGFkZGluZyBvdGhlciBwcm9wZXJ0aWVzXG4gIC8vIHRvIHRoZSBib2R5IGVsZW1lbnRcbiAgYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPVxuICAgIGJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID09PSBURU1QT1JBUllfUEFERElOR1xuICAgICAgPyBJTklUSUFMX1BBRERJTkdcbiAgICAgIDogVEVNUE9SQVJZX1BBRERJTkc7XG5cbiAgLy8gSGFuZGxlIHRoZSBmb2N1cyBhY3Rpb25zXG4gIGlmIChzYWZlQWN0aXZlICYmIG9wZW5Gb2N1c0VsKSB7XG4gICAgLy8gVGhlIG1vZGFsIHdpbmRvdyBpcyBvcGVuZWQuIEZvY3VzIGlzIHNldCB0byBjbG9zZSBidXR0b24uXG5cbiAgICAvLyBCaW5kcyBlc2NhcGUga2V5IGlmIHdlJ3JlIG5vdCBmb3JjaW5nXG4gICAgLy8gdGhlIHVzZXIgdG8gdGFrZSBhbiBhY3Rpb25cbiAgICBpZiAoZm9yY2VVc2VyQWN0aW9uKSB7XG4gICAgICBtb2RhbC5mb2N1c1RyYXAgPSBGb2N1c1RyYXAodGFyZ2V0TW9kYWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtb2RhbC5mb2N1c1RyYXAgPSBGb2N1c1RyYXAodGFyZ2V0TW9kYWwsIHtcbiAgICAgICAgRXNjYXBlOiBvbk1lbnVDbG9zZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgZm9jdXMgc2V0dGluZyBhbmQgaW50ZXJhY3Rpb25zXG4gICAgbW9kYWwuZm9jdXNUcmFwLnVwZGF0ZShzYWZlQWN0aXZlKTtcbiAgICBvcGVuRm9jdXNFbC5mb2N1cygpO1xuXG4gICAgLy8gSGlkZXMgZXZlcnl0aGluZyB0aGF0IGlzIG5vdCB0aGUgbW9kYWwgZnJvbSBzY3JlZW4gcmVhZGVyc1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoTk9OX01PREFMUykuZm9yRWFjaCgobm9uTW9kYWwpID0+IHtcbiAgICAgIG5vbk1vZGFsLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICAgIG5vbk1vZGFsLnNldEF0dHJpYnV0ZShOT05fTU9EQUxfSElEREVOX0FUVFJJQlVURSwgXCJcIik7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIXNhZmVBY3RpdmUgJiYgbWVudUJ1dHRvbiAmJiByZXR1cm5Gb2N1cykge1xuICAgIC8vIFRoZSBtb2RhbCB3aW5kb3cgaXMgY2xvc2VkLlxuICAgIC8vIE5vbi1tb2RhbHMgbm93IGFjY2VzaWJsZSB0byBzY3JlZW4gcmVhZGVyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChOT05fTU9EQUxTX0hJRERFTikuZm9yRWFjaCgobm9uTW9kYWwpID0+IHtcbiAgICAgIG5vbk1vZGFsLnJlbW92ZUF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIpO1xuICAgICAgbm9uTW9kYWwucmVtb3ZlQXR0cmlidXRlKE5PTl9NT0RBTF9ISURERU5fQVRUUklCVVRFKTtcbiAgICB9KTtcblxuICAgIC8vIEZvY3VzIGlzIHJldHVybmVkIHRvIHRoZSBvcGVuZXJcbiAgICByZXR1cm5Gb2N1cy5mb2N1cygpO1xuICAgIG1vZGFsLmZvY3VzVHJhcC51cGRhdGUoc2FmZUFjdGl2ZSk7XG4gIH1cblxuICByZXR1cm4gc2FmZUFjdGl2ZTtcbn1cblxuLyoqXG4gKiAgQnVpbGRzIG1vZGFsIHdpbmRvdyBmcm9tIGJhc2UgSFRNTFxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGJhc2VDb21wb25lbnQgdGhlIG1vZGFsIGh0bWwgaW4gdGhlIERPTVxuICovXG5jb25zdCBzZXRVcEF0dHJpYnV0ZXMgPSAoYmFzZUNvbXBvbmVudCkgPT4ge1xuICBjb25zdCBtb2RhbENvbnRlbnQgPSBiYXNlQ29tcG9uZW50O1xuICBjb25zdCBtb2RhbFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb25zdCBvdmVybGF5RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29uc3QgbW9kYWxJRCA9IGJhc2VDb21wb25lbnQuZ2V0QXR0cmlidXRlKFwiaWRcIik7XG4gIGNvbnN0IGFyaWFMYWJlbGxlZEJ5ID0gYmFzZUNvbXBvbmVudC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsbGVkYnlcIik7XG4gIGNvbnN0IGFyaWFEZXNjcmliZWRCeSA9IGJhc2VDb21wb25lbnQuZ2V0QXR0cmlidXRlKFwiYXJpYS1kZXNjcmliZWRieVwiKTtcbiAgY29uc3QgZm9yY2VVc2VyQWN0aW9uID0gYmFzZUNvbXBvbmVudC5oYXNBdHRyaWJ1dGUoRk9SQ0VfQUNUSU9OX0FUVFJJQlVURSlcbiAgICA/IGJhc2VDb21wb25lbnQuaGFzQXR0cmlidXRlKEZPUkNFX0FDVElPTl9BVFRSSUJVVEUpXG4gICAgOiBmYWxzZTtcblxuICAvLyBSZWJ1aWxkIHRoZSBtb2RhbCBlbGVtZW50XG4gIG1vZGFsQ29udGVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtb2RhbFdyYXBwZXIsIG1vZGFsQ29udGVudCk7XG4gIG1vZGFsV3JhcHBlci5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuICBtb2RhbENvbnRlbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUob3ZlcmxheURpdiwgbW9kYWxDb250ZW50KTtcbiAgb3ZlcmxheURpdi5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuXG4gIC8vIEFkZCBjbGFzc2VzIGFuZCBhdHRyaWJ1dGVzXG4gIG1vZGFsV3JhcHBlci5jbGFzc0xpc3QuYWRkKEhJRERFTl9DTEFTUyk7XG4gIG1vZGFsV3JhcHBlci5jbGFzc0xpc3QuYWRkKFdSQVBQRVJfQ0xBU1NOQU1FKTtcbiAgb3ZlcmxheURpdi5jbGFzc0xpc3QuYWRkKE9WRVJMQVlfQ0xBU1NOQU1FKTtcblxuICAvLyBTZXQgYXR0cmlidXRlc1xuICBtb2RhbFdyYXBwZXIuc2V0QXR0cmlidXRlKFwicm9sZVwiLCBcImRpYWxvZ1wiKTtcbiAgbW9kYWxXcmFwcGVyLnNldEF0dHJpYnV0ZShcImlkXCIsIG1vZGFsSUQpO1xuXG4gIGlmIChhcmlhTGFiZWxsZWRCeSkge1xuICAgIG1vZGFsV3JhcHBlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsbGVkYnlcIiwgYXJpYUxhYmVsbGVkQnkpO1xuICB9XG5cbiAgaWYgKGFyaWFEZXNjcmliZWRCeSkge1xuICAgIG1vZGFsV3JhcHBlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWRlc2NyaWJlZGJ5XCIsIGFyaWFEZXNjcmliZWRCeSk7XG4gIH1cblxuICBpZiAoZm9yY2VVc2VyQWN0aW9uKSB7XG4gICAgbW9kYWxXcmFwcGVyLnNldEF0dHJpYnV0ZShGT1JDRV9BQ1RJT05fQVRUUklCVVRFLCBcInRydWVcIik7XG4gIH1cblxuICAvLyBVcGRhdGUgdGhlIGJhc2UgZWxlbWVudCBIVE1MXG4gIGJhc2VDb21wb25lbnQucmVtb3ZlQXR0cmlidXRlKFwiaWRcIik7XG4gIGJhc2VDb21wb25lbnQucmVtb3ZlQXR0cmlidXRlKFwiYXJpYS1sYWJlbGxlZGJ5XCIpO1xuICBiYXNlQ29tcG9uZW50LnJlbW92ZUF0dHJpYnV0ZShcImFyaWEtZGVzY3JpYmVkYnlcIik7XG4gIGJhc2VDb21wb25lbnQuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKTtcblxuICAvLyBBZGQgYXJpYS1jb250cm9sc1xuICBjb25zdCBtb2RhbENsb3NlcnMgPSBtb2RhbFdyYXBwZXIucXVlcnlTZWxlY3RvckFsbChDTE9TRVJTKTtcbiAgc2VsZWN0KG1vZGFsQ2xvc2VycykuZm9yRWFjaCgoZWwpID0+IHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWNvbnRyb2xzXCIsIG1vZGFsSUQpO1xuICB9KTtcblxuICAvLyBNb3ZlIGFsbCBtb2RhbHMgdG8gdGhlIGVuZCBvZiB0aGUgRE9NLiBEb2luZyB0aGlzIGFsbG93cyB1cyB0b1xuICAvLyBtb3JlIGVhc2lseSBmaW5kIHRoZSBlbGVtZW50cyB0byBoaWRlIGZyb20gc2NyZWVuIHJlYWRlcnNcbiAgLy8gd2hlbiB0aGUgbW9kYWwgaXMgb3Blbi5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbFdyYXBwZXIpO1xufTtcblxubW9kYWwgPSBiZWhhdmlvcihcbiAge1xuICAgIFtDTElDS106IHtcbiAgICAgIFtPUEVORVJTXTogdG9nZ2xlTW9kYWwsXG4gICAgICBbQ0xPU0VSU106IHRvZ2dsZU1vZGFsLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpbml0KHJvb3QpIHtcbiAgICAgIHNlbGVjdChNT0RBTCwgcm9vdCkuZm9yRWFjaCgobW9kYWxXaW5kb3cpID0+IHtcbiAgICAgICAgc2V0VXBBdHRyaWJ1dGVzKG1vZGFsV2luZG93KTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxlY3QoT1BFTkVSUywgcm9vdCkuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAvLyBUdXJuIGFuY2hvciBsaW5rcyBpbnRvIGJ1dHRvbnMgYmVjYXVzZSBvZlxuICAgICAgICAvLyBWb2ljZU92ZXIgb24gU2FmYXJpXG4gICAgICAgIGlmIChpdGVtLm5vZGVOYW1lID09PSBcIkFcIikge1xuICAgICAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwicm9sZVwiLCBcImJ1dHRvblwiKTtcbiAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuIHVuY29tbWVudCB3aGVuIGFyaWEtaGFzcG9wdXA9XCJkaWFsb2dcIiBpcyBzdXBwb3J0ZWRcbiAgICAgICAgLy8gaHR0cHM6Ly9hMTF5c3VwcG9ydC5pby90ZWNoL2FyaWEvYXJpYS1oYXNwb3B1cF9hdHRyaWJ1dGVcbiAgICAgICAgLy8gTW9zdCBzY3JlZW4gcmVhZGVycyBzdXBwb3J0IGFyaWEtaGFzcG9wdXAsIGJ1dCBtaWdodCBhbm5vdW5jZVxuICAgICAgICAvLyBhcyBvcGVuaW5nIGEgbWVudSBpZiBcImRpYWxvZ1wiIGlzIG5vdCBzdXBwb3J0ZWQuXG4gICAgICAgIC8vIGl0ZW0uc2V0QXR0cmlidXRlKFwiYXJpYS1oYXNwb3B1cFwiLCBcImRpYWxvZ1wiKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZm9jdXNUcmFwOiBudWxsLFxuICAgIHRvZ2dsZU1vZGFsLFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vZGFsO1xuIiwiY29uc3Qga2V5bWFwID0gcmVxdWlyZShcInJlY2VwdG9yL2tleW1hcFwiKTtcbmNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4uL3V0aWxzL3NlbGVjdFwiKTtcbmNvbnN0IHRvZ2dsZSA9IHJlcXVpcmUoXCIuLi91dGlscy90b2dnbGVcIik7XG5jb25zdCBGb2N1c1RyYXAgPSByZXF1aXJlKFwiLi4vdXRpbHMvZm9jdXMtdHJhcFwiKTtcbmNvbnN0IGFjY29yZGlvbiA9IHJlcXVpcmUoXCIuL2FjY29yZGlvblwiKTtcbmNvbnN0IFNjcm9sbEJhcldpZHRoID0gcmVxdWlyZShcIi4uL3V0aWxzL3Njcm9sbGJhci13aWR0aFwiKTtcblxuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbmNvbnN0IEJPRFkgPSBcImJvZHlcIjtcbmNvbnN0IEhFQURFUiA9IGAuJHtQUkVGSVh9LWhlYWRlcmA7XG5jb25zdCBOQVYgPSBgLiR7UFJFRklYfS1uYXZgO1xuY29uc3QgTkFWX1BSSU1BUlkgPSBgLiR7UFJFRklYfS1uYXZfX3ByaW1hcnlgO1xuY29uc3QgTkFWX1BSSU1BUllfSVRFTSA9IGAuJHtQUkVGSVh9LW5hdl9fcHJpbWFyeS1pdGVtYDtcbmNvbnN0IE5BVl9DT05UUk9MID0gYGJ1dHRvbi4ke1BSRUZJWH0tbmF2X19saW5rYDtcbmNvbnN0IE5BVl9MSU5LUyA9IGAke05BVn0gYWA7XG5jb25zdCBOT05fTkFWX0hJRERFTl9BVFRSSUJVVEUgPSBgZGF0YS1uYXYtaGlkZGVuYDtcbmNvbnN0IE9QRU5FUlMgPSBgLiR7UFJFRklYfS1tZW51LWJ0bmA7XG5jb25zdCBDTE9TRV9CVVRUT04gPSBgLiR7UFJFRklYfS1uYXZfX2Nsb3NlYDtcbmNvbnN0IE9WRVJMQVkgPSBgLiR7UFJFRklYfS1vdmVybGF5YDtcbmNvbnN0IENMT1NFUlMgPSBgJHtDTE9TRV9CVVRUT059LCAuJHtQUkVGSVh9LW92ZXJsYXlgO1xuY29uc3QgVE9HR0xFUyA9IFtOQVYsIE9WRVJMQVldLmpvaW4oXCIsIFwiKTtcbmNvbnN0IE5PTl9OQVZfRUxFTUVOVFMgPSBgYm9keSA+ICo6bm90KCR7SEVBREVSfSk6bm90KFthcmlhLWhpZGRlbl0pYDtcbmNvbnN0IE5PTl9OQVZfSElEREVOID0gYFske05PTl9OQVZfSElEREVOX0FUVFJJQlVURX1dYDtcblxuY29uc3QgQUNUSVZFX0NMQVNTID0gXCJ1c2EtanMtbW9iaWxlLW5hdi0tYWN0aXZlXCI7XG5jb25zdCBWSVNJQkxFX0NMQVNTID0gXCJpcy12aXNpYmxlXCI7XG5cbmxldCBuYXZpZ2F0aW9uO1xubGV0IG5hdkFjdGl2ZTtcbmxldCBub25OYXZFbGVtZW50cztcblxuY29uc3QgaXNBY3RpdmUgPSAoKSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucyhBQ1RJVkVfQ0xBU1MpO1xuY29uc3QgU0NST0xMQkFSX1dJRFRIID0gU2Nyb2xsQmFyV2lkdGgoKTtcbmNvbnN0IElOSVRJQUxfUEFERElORyA9IHdpbmRvd1xuICAuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KVxuICAuZ2V0UHJvcGVydHlWYWx1ZShcInBhZGRpbmctcmlnaHRcIik7XG5jb25zdCBURU1QT1JBUllfUEFERElORyA9IGAke1xuICBwYXJzZUludChJTklUSUFMX1BBRERJTkcucmVwbGFjZSgvcHgvLCBcIlwiKSwgMTApICtcbiAgcGFyc2VJbnQoU0NST0xMQkFSX1dJRFRILnJlcGxhY2UoL3B4LywgXCJcIiksIDEwKVxufXB4YDtcblxuY29uc3QgaGlkZU5vbk5hdkl0ZW1zID0gKCkgPT4ge1xuICBub25OYXZFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoTk9OX05BVl9FTEVNRU5UUyk7XG5cbiAgbm9uTmF2RWxlbWVudHMuZm9yRWFjaCgobm9uTmF2RWxlbWVudCkgPT4ge1xuICAgIG5vbk5hdkVsZW1lbnQuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgdHJ1ZSk7XG4gICAgbm9uTmF2RWxlbWVudC5zZXRBdHRyaWJ1dGUoTk9OX05BVl9ISURERU5fQVRUUklCVVRFLCBcIlwiKTtcbiAgfSk7XG59O1xuXG5jb25zdCBzaG93Tm9uTmF2SXRlbXMgPSAoKSA9PiB7XG4gIG5vbk5hdkVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChOT05fTkFWX0hJRERFTik7XG5cbiAgaWYgKCFub25OYXZFbGVtZW50cykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFJlbW92ZSBhcmlhLWhpZGRlbiBmcm9tIG5vbi1oZWFkZXIgZWxlbWVudHNcbiAgbm9uTmF2RWxlbWVudHMuZm9yRWFjaCgobm9uTmF2RWxlbWVudCkgPT4ge1xuICAgIG5vbk5hdkVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIik7XG4gICAgbm9uTmF2RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoTk9OX05BVl9ISURERU5fQVRUUklCVVRFKTtcbiAgfSk7XG59O1xuXG4vLyBUb2dnbGUgYWxsIG5vbi1oZWFkZXIgZWxlbWVudHMgIzM1MjcuXG5jb25zdCB0b2dnbGVOb25OYXZJdGVtcyA9IChhY3RpdmUpID0+IHtcbiAgaWYgKGFjdGl2ZSkge1xuICAgIGhpZGVOb25OYXZJdGVtcygpO1xuICB9IGVsc2Uge1xuICAgIHNob3dOb25OYXZJdGVtcygpO1xuICB9XG59O1xuXG5jb25zdCB0b2dnbGVOYXYgPSAoYWN0aXZlKSA9PiB7XG4gIGNvbnN0IHsgYm9keSB9ID0gZG9jdW1lbnQ7XG4gIGNvbnN0IHNhZmVBY3RpdmUgPSB0eXBlb2YgYWN0aXZlID09PSBcImJvb2xlYW5cIiA/IGFjdGl2ZSA6ICFpc0FjdGl2ZSgpO1xuXG4gIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZShBQ1RJVkVfQ0xBU1MsIHNhZmVBY3RpdmUpO1xuXG4gIHNlbGVjdChUT0dHTEVTKS5mb3JFYWNoKChlbCkgPT5cbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKFZJU0lCTEVfQ0xBU1MsIHNhZmVBY3RpdmUpXG4gICk7XG5cbiAgbmF2aWdhdGlvbi5mb2N1c1RyYXAudXBkYXRlKHNhZmVBY3RpdmUpO1xuXG4gIGNvbnN0IGNsb3NlQnV0dG9uID0gYm9keS5xdWVyeVNlbGVjdG9yKENMT1NFX0JVVFRPTik7XG4gIGNvbnN0IG1lbnVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKE9QRU5FUlMpO1xuXG4gIGJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID1cbiAgICBib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9PT0gVEVNUE9SQVJZX1BBRERJTkdcbiAgICAgID8gSU5JVElBTF9QQURESU5HXG4gICAgICA6IFRFTVBPUkFSWV9QQURESU5HO1xuXG4gIHRvZ2dsZU5vbk5hdkl0ZW1zKHNhZmVBY3RpdmUpO1xuXG4gIGlmIChzYWZlQWN0aXZlICYmIGNsb3NlQnV0dG9uKSB7XG4gICAgLy8gVGhlIG1vYmlsZSBuYXYgd2FzIGp1c3QgYWN0aXZhdGVkLiBGb2N1cyBvbiB0aGUgY2xvc2UgYnV0dG9uLCB3aGljaCBpc1xuICAgIC8vIGp1c3QgYmVmb3JlIGFsbCB0aGUgbmF2IGVsZW1lbnRzIGluIHRoZSB0YWIgb3JkZXIuXG4gICAgY2xvc2VCdXR0b24uZm9jdXMoKTtcbiAgfSBlbHNlIGlmIChcbiAgICAhc2FmZUFjdGl2ZSAmJlxuICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IGNsb3NlQnV0dG9uICYmXG4gICAgbWVudUJ1dHRvblxuICApIHtcbiAgICAvLyBUaGUgbW9iaWxlIG5hdiB3YXMganVzdCBkZWFjdGl2YXRlZCwgYW5kIGZvY3VzIHdhcyBvbiB0aGUgY2xvc2VcbiAgICAvLyBidXR0b24sIHdoaWNoIGlzIG5vIGxvbmdlciB2aXNpYmxlLiBXZSBkb24ndCB3YW50IHRoZSBmb2N1cyB0b1xuICAgIC8vIGRpc2FwcGVhciBpbnRvIHRoZSB2b2lkLCBzbyBmb2N1cyBvbiB0aGUgbWVudSBidXR0b24gaWYgaXQnc1xuICAgIC8vIHZpc2libGUgKHRoaXMgbWF5IGhhdmUgYmVlbiB3aGF0IHRoZSB1c2VyIHdhcyBqdXN0IGZvY3VzZWQgb24sXG4gICAgLy8gaWYgdGhleSB0cmlnZ2VyZWQgdGhlIG1vYmlsZSBuYXYgYnkgbWlzdGFrZSkuXG4gICAgbWVudUJ1dHRvbi5mb2N1cygpO1xuICB9XG5cbiAgcmV0dXJuIHNhZmVBY3RpdmU7XG59O1xuXG5jb25zdCByZXNpemUgPSAoKSA9PiB7XG4gIGNvbnN0IGNsb3NlciA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcihDTE9TRV9CVVRUT04pO1xuXG4gIGlmIChpc0FjdGl2ZSgpICYmIGNsb3NlciAmJiBjbG9zZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggPT09IDApIHtcbiAgICAvLyBXaGVuIHRoZSBtb2JpbGUgbmF2IGlzIGFjdGl2ZSwgYW5kIHRoZSBjbG9zZSBib3ggaXNuJ3QgdmlzaWJsZSxcbiAgICAvLyB3ZSBrbm93IHRoZSB1c2VyJ3Mgdmlld3BvcnQgaGFzIGJlZW4gcmVzaXplZCB0byBiZSBsYXJnZXIuXG4gICAgLy8gTGV0J3MgbWFrZSB0aGUgcGFnZSBzdGF0ZSBjb25zaXN0ZW50IGJ5IGRlYWN0aXZhdGluZyB0aGUgbW9iaWxlIG5hdi5cbiAgICBuYXZpZ2F0aW9uLnRvZ2dsZU5hdi5jYWxsKGNsb3NlciwgZmFsc2UpO1xuICB9XG59O1xuXG5jb25zdCBvbk1lbnVDbG9zZSA9ICgpID0+IG5hdmlnYXRpb24udG9nZ2xlTmF2LmNhbGwobmF2aWdhdGlvbiwgZmFsc2UpO1xuXG5jb25zdCBoaWRlQWN0aXZlTmF2RHJvcGRvd24gPSAoKSA9PiB7XG4gIGlmICghbmF2QWN0aXZlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdG9nZ2xlKG5hdkFjdGl2ZSwgZmFsc2UpO1xuICBuYXZBY3RpdmUgPSBudWxsO1xufTtcblxuY29uc3QgZm9jdXNOYXZCdXR0b24gPSAoZXZlbnQpID0+IHtcbiAgY29uc3QgcGFyZW50TmF2SXRlbSA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KE5BVl9QUklNQVJZX0lURU0pO1xuXG4gIC8vIE9ubHkgc2hpZnQgZm9jdXMgaWYgd2l0aGluIGRyb3Bkb3duXG4gIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoTkFWX0NPTlRST0wpKSB7XG4gICAgcGFyZW50TmF2SXRlbS5xdWVyeVNlbGVjdG9yKE5BVl9DT05UUk9MKS5mb2N1cygpO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVFc2NhcGUgPSAoZXZlbnQpID0+IHtcbiAgaGlkZUFjdGl2ZU5hdkRyb3Bkb3duKCk7XG4gIGZvY3VzTmF2QnV0dG9uKGV2ZW50KTtcbn07XG5cbm5hdmlnYXRpb24gPSBiZWhhdmlvcihcbiAge1xuICAgIFtDTElDS106IHtcbiAgICAgIFtOQVZfQ09OVFJPTF0oKSB7XG4gICAgICAgIC8vIElmIGFub3RoZXIgbmF2IGlzIG9wZW4sIGNsb3NlIGl0XG4gICAgICAgIGlmIChuYXZBY3RpdmUgIT09IHRoaXMpIHtcbiAgICAgICAgICBoaWRlQWN0aXZlTmF2RHJvcGRvd24oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgbGFzdCBjbGlja2VkIG5hdiBsaW5rIGVsZW1lbnQsIHNvIHdlXG4gICAgICAgIC8vIGNhbiBoaWRlIHRoZSBkcm9wZG93biBpZiBhbm90aGVyIGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgY2xpY2tlZFxuICAgICAgICBpZiAoIW5hdkFjdGl2ZSkge1xuICAgICAgICAgIG5hdkFjdGl2ZSA9IHRoaXM7XG4gICAgICAgICAgdG9nZ2xlKG5hdkFjdGl2ZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyB0aGlzIHNvIHRoZSBldmVudCBoYW5kbGVyIG9uIHRoZSBib2R5IGRvZXNuJ3QgZmlyZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgW0JPRFldOiBoaWRlQWN0aXZlTmF2RHJvcGRvd24sXG4gICAgICBbT1BFTkVSU106IHRvZ2dsZU5hdixcbiAgICAgIFtDTE9TRVJTXTogdG9nZ2xlTmF2LFxuICAgICAgW05BVl9MSU5LU10oKSB7XG4gICAgICAgIC8vIEEgbmF2aWdhdGlvbiBsaW5rIGhhcyBiZWVuIGNsaWNrZWQhIFdlIHdhbnQgdG8gY29sbGFwc2UgYW55XG4gICAgICAgIC8vIGhpZXJhcmNoaWNhbCBuYXZpZ2F0aW9uIFVJIGl0J3MgYSBwYXJ0IG9mLCBzbyB0aGF0IHRoZSB1c2VyXG4gICAgICAgIC8vIGNhbiBmb2N1cyBvbiB3aGF0ZXZlciB0aGV5J3ZlIGp1c3Qgc2VsZWN0ZWQuXG5cbiAgICAgICAgLy8gU29tZSBuYXZpZ2F0aW9uIGxpbmtzIGFyZSBpbnNpZGUgYWNjb3JkaW9uczsgd2hlbiB0aGV5J3JlXG4gICAgICAgIC8vIGNsaWNrZWQsIHdlIHdhbnQgdG8gY29sbGFwc2UgdGhvc2UgYWNjb3JkaW9ucy5cbiAgICAgICAgY29uc3QgYWNjID0gdGhpcy5jbG9zZXN0KGFjY29yZGlvbi5BQ0NPUkRJT04pO1xuXG4gICAgICAgIGlmIChhY2MpIHtcbiAgICAgICAgICBhY2NvcmRpb24uZ2V0QnV0dG9ucyhhY2MpLmZvckVhY2goKGJ0bikgPT4gYWNjb3JkaW9uLmhpZGUoYnRuKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgbW9iaWxlIG5hdmlnYXRpb24gbWVudSBpcyBhY3RpdmUsIHdlIHdhbnQgdG8gaGlkZSBpdC5cbiAgICAgICAgaWYgKGlzQWN0aXZlKCkpIHtcbiAgICAgICAgICBuYXZpZ2F0aW9uLnRvZ2dsZU5hdi5jYWxsKG5hdmlnYXRpb24sIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICAgIGtleWRvd246IHtcbiAgICAgIFtOQVZfUFJJTUFSWV06IGtleW1hcCh7IEVzY2FwZTogaGFuZGxlRXNjYXBlIH0pLFxuICAgIH0sXG4gICAgZm9jdXNvdXQ6IHtcbiAgICAgIFtOQVZfUFJJTUFSWV0oZXZlbnQpIHtcbiAgICAgICAgY29uc3QgbmF2ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoTkFWX1BSSU1BUlkpO1xuXG4gICAgICAgIGlmICghbmF2LmNvbnRhaW5zKGV2ZW50LnJlbGF0ZWRUYXJnZXQpKSB7XG4gICAgICAgICAgaGlkZUFjdGl2ZU5hdkRyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgY29uc3QgdHJhcENvbnRhaW5lciA9IHJvb3QucXVlcnlTZWxlY3RvcihOQVYpO1xuXG4gICAgICBpZiAodHJhcENvbnRhaW5lcikge1xuICAgICAgICBuYXZpZ2F0aW9uLmZvY3VzVHJhcCA9IEZvY3VzVHJhcCh0cmFwQ29udGFpbmVyLCB7XG4gICAgICAgICAgRXNjYXBlOiBvbk1lbnVDbG9zZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJlc2l6ZSgpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcmVzaXplLCBmYWxzZSk7XG4gICAgfSxcbiAgICB0ZWFyZG93bigpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHJlc2l6ZSwgZmFsc2UpO1xuICAgICAgbmF2QWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICBmb2N1c1RyYXA6IG51bGwsXG4gICAgdG9nZ2xlTmF2LFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdmlnYXRpb247XG4iLCJjb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHRvZ2dsZUZvcm1JbnB1dCA9IHJlcXVpcmUoXCIuLi91dGlscy90b2dnbGUtZm9ybS1pbnB1dFwiKTtcblxuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbmNvbnN0IExJTksgPSBgLiR7UFJFRklYfS1zaG93LXBhc3N3b3JkLCAuJHtQUkVGSVh9LXNob3ctbXVsdGlwYXNzd29yZGA7XG5cbmZ1bmN0aW9uIHRvZ2dsZShldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB0b2dnbGVGb3JtSW5wdXQodGhpcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmVoYXZpb3Ioe1xuICBbQ0xJQ0tdOiB7XG4gICAgW0xJTktdOiB0b2dnbGUsXG4gIH0sXG59KTtcbiIsImNvbnN0IGlnbm9yZSA9IHJlcXVpcmUoXCJyZWNlcHRvci9pZ25vcmVcIik7XG5jb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHNlbGVjdCA9IHJlcXVpcmUoXCIuLi91dGlscy9zZWxlY3RcIik7XG5cbmNvbnN0IHsgQ0xJQ0sgfSA9IHJlcXVpcmUoXCIuLi9ldmVudHNcIik7XG5cbmNvbnN0IEJVVFRPTiA9IFwiLmpzLXNlYXJjaC1idXR0b25cIjtcbmNvbnN0IEZPUk0gPSBcIi5qcy1zZWFyY2gtZm9ybVwiO1xuY29uc3QgSU5QVVQgPSBcIlt0eXBlPXNlYXJjaF1cIjtcbmNvbnN0IENPTlRFWFQgPSBcImhlYWRlclwiOyAvLyBYWFhcblxubGV0IGxhc3RCdXR0b247XG5cbmNvbnN0IGdldEZvcm0gPSAoYnV0dG9uKSA9PiB7XG4gIGNvbnN0IGNvbnRleHQgPSBidXR0b24uY2xvc2VzdChDT05URVhUKTtcbiAgcmV0dXJuIGNvbnRleHQgPyBjb250ZXh0LnF1ZXJ5U2VsZWN0b3IoRk9STSkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKEZPUk0pO1xufTtcblxuY29uc3QgdG9nZ2xlU2VhcmNoID0gKGJ1dHRvbiwgYWN0aXZlKSA9PiB7XG4gIGNvbnN0IGZvcm0gPSBnZXRGb3JtKGJ1dHRvbik7XG5cbiAgaWYgKCFmb3JtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBObyAke0ZPUk19IGZvdW5kIGZvciBzZWFyY2ggdG9nZ2xlIGluICR7Q09OVEVYVH0hYCk7XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICBidXR0b24uaGlkZGVuID0gYWN0aXZlO1xuICBmb3JtLmhpZGRlbiA9ICFhY3RpdmU7XG4gIC8qIGVzbGludC1lbmFibGUgKi9cblxuICBpZiAoIWFjdGl2ZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGlucHV0ID0gZm9ybS5xdWVyeVNlbGVjdG9yKElOUFVUKTtcblxuICBpZiAoaW5wdXQpIHtcbiAgICBpbnB1dC5mb2N1cygpO1xuICB9XG4gIC8vIHdoZW4gdGhlIHVzZXIgY2xpY2tzIF9vdXRzaWRlXyBvZiB0aGUgZm9ybSB3L2lnbm9yZSgpOiBoaWRlIHRoZVxuICAvLyBzZWFyY2gsIHRoZW4gcmVtb3ZlIHRoZSBsaXN0ZW5lclxuICBjb25zdCBsaXN0ZW5lciA9IGlnbm9yZShmb3JtLCAoKSA9PiB7XG4gICAgaWYgKGxhc3RCdXR0b24pIHtcbiAgICAgIGhpZGVTZWFyY2guY2FsbChsYXN0QnV0dG9uKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgIH1cblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihDTElDSywgbGlzdGVuZXIpO1xuICB9KTtcblxuICAvLyBOb3JtYWxseSB3ZSB3b3VsZCBqdXN0IHJ1biB0aGlzIGNvZGUgd2l0aG91dCBhIHRpbWVvdXQsIGJ1dFxuICAvLyBJRTExIGFuZCBFZGdlIHdpbGwgYWN0dWFsbHkgY2FsbCB0aGUgbGlzdGVuZXIgKmltbWVkaWF0ZWx5KiBiZWNhdXNlXG4gIC8vIHRoZXkgYXJlIGN1cnJlbnRseSBoYW5kbGluZyB0aGlzIGV4YWN0IHR5cGUgb2YgZXZlbnQsIHNvIHdlJ2xsXG4gIC8vIG1ha2Ugc3VyZSB0aGUgYnJvd3NlciBpcyBkb25lIGhhbmRsaW5nIHRoZSBjdXJyZW50IGNsaWNrIGV2ZW50LFxuICAvLyBpZiBhbnksIGJlZm9yZSB3ZSBhdHRhY2ggdGhlIGxpc3RlbmVyLlxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoQ0xJQ0ssIGxpc3RlbmVyKTtcbiAgfSwgMCk7XG59O1xuXG5mdW5jdGlvbiBzaG93U2VhcmNoKCkge1xuICB0b2dnbGVTZWFyY2godGhpcywgdHJ1ZSk7XG4gIGxhc3RCdXR0b24gPSB0aGlzO1xufVxuXG5mdW5jdGlvbiBoaWRlU2VhcmNoKCkge1xuICB0b2dnbGVTZWFyY2godGhpcywgZmFsc2UpO1xuICBsYXN0QnV0dG9uID0gdW5kZWZpbmVkO1xufVxuXG5jb25zdCBzZWFyY2ggPSBiZWhhdmlvcihcbiAge1xuICAgIFtDTElDS106IHtcbiAgICAgIFtCVVRUT05dOiBzaG93U2VhcmNoLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpbml0KHRhcmdldCkge1xuICAgICAgc2VsZWN0KEJVVFRPTiwgdGFyZ2V0KS5mb3JFYWNoKChidXR0b24pID0+IHtcbiAgICAgICAgdG9nZ2xlU2VhcmNoKGJ1dHRvbiwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0ZWFyZG93bigpIHtcbiAgICAgIC8vIGZvcmdldCB0aGUgbGFzdCBidXR0b24gY2xpY2tlZFxuICAgICAgbGFzdEJ1dHRvbiA9IHVuZGVmaW5lZDtcbiAgICB9LFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlYXJjaDtcbiIsImNvbnN0IG9uY2UgPSByZXF1aXJlKFwicmVjZXB0b3Ivb25jZVwiKTtcbmNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbmNvbnN0IExJTksgPSBgLiR7UFJFRklYfS1za2lwbmF2W2hyZWZePVwiI1wiXSwgLiR7UFJFRklYfS1mb290ZXJfX3JldHVybi10by10b3AgW2hyZWZePVwiI1wiXWA7XG5jb25zdCBNQUlOQ09OVEVOVCA9IFwibWFpbi1jb250ZW50XCI7XG5cbmZ1bmN0aW9uIHNldFRhYmluZGV4KCkge1xuICAvLyBOQjogd2Uga25vdyBiZWNhdXNlIG9mIHRoZSBzZWxlY3RvciB3ZSdyZSBkZWxlZ2F0aW5nIHRvIGJlbG93IHRoYXQgdGhlXG4gIC8vIGhyZWYgYWxyZWFkeSBiZWdpbnMgd2l0aCAnIydcbiAgY29uc3QgaWQgPSBlbmNvZGVVUkkodGhpcy5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpKTtcbiAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgaWQgPT09IFwiI1wiID8gTUFJTkNPTlRFTlQgOiBpZC5zbGljZSgxKVxuICApO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICB0YXJnZXQuc3R5bGUub3V0bGluZSA9IFwiMFwiO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAwKTtcbiAgICB0YXJnZXQuZm9jdXMoKTtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiYmx1clwiLFxuICAgICAgb25jZSgoKSA9PiB7XG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAtMSk7XG4gICAgICB9KVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdGhyb3cgYW4gZXJyb3I/XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiZWhhdmlvcih7XG4gIFtDTElDS106IHtcbiAgICBbTElOS106IHNldFRhYmluZGV4LFxuICB9LFxufSk7XG4iLCJjb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCB7IENMSUNLIH0gPSByZXF1aXJlKFwiLi4vZXZlbnRzXCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcbmNvbnN0IFNhbml0aXplciA9IHJlcXVpcmUoXCIuLi91dGlscy9zYW5pdGl6ZXJcIik7XG5cbmNvbnN0IFRBQkxFID0gYC4ke1BSRUZJWH0tdGFibGVgO1xuY29uc3QgU09SVEVEID0gXCJhcmlhLXNvcnRcIjtcbmNvbnN0IEFTQ0VORElORyA9IFwiYXNjZW5kaW5nXCI7XG5jb25zdCBERVNDRU5ESU5HID0gXCJkZXNjZW5kaW5nXCI7XG5jb25zdCBTT1JUX09WRVJSSURFID0gXCJkYXRhLXNvcnQtdmFsdWVcIjtcbmNvbnN0IFNPUlRfQlVUVE9OX0NMQVNTID0gYCR7UFJFRklYfS10YWJsZV9faGVhZGVyX19idXR0b25gO1xuY29uc3QgU09SVF9CVVRUT04gPSBgLiR7U09SVF9CVVRUT05fQ0xBU1N9YDtcbmNvbnN0IFNPUlRBQkxFX0hFQURFUiA9IGB0aFtkYXRhLXNvcnRhYmxlXWA7XG5jb25zdCBBTk5PVU5DRU1FTlRfUkVHSU9OID0gYC4ke1BSRUZJWH0tdGFibGVfX2Fubm91bmNlbWVudC1yZWdpb25bYXJpYS1saXZlPVwicG9saXRlXCJdYDtcblxuLyoqIEdldHMgdGhlIGRhdGEtc29ydC12YWx1ZSBhdHRyaWJ1dGUgdmFsdWUsIGlmIHByb3ZpZGVkIOKAlCBvdGhlcndpc2UsIGdldHNcbiAqIHRoZSBpbm5lclRleHQgb3IgdGV4dENvbnRlbnQg4oCUIG9mIHRoZSBjaGlsZCBlbGVtZW50IChIVE1MVGFibGVDZWxsRWxlbWVudClcbiAqIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggb2YgdGhlIGdpdmVuIHRhYmxlIHJvd1xuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHthcnJheTxIVE1MVGFibGVSb3dFbGVtZW50Pn0gdHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGdldENlbGxWYWx1ZSA9ICh0ciwgaW5kZXgpID0+XG4gIHRyLmNoaWxkcmVuW2luZGV4XS5nZXRBdHRyaWJ1dGUoU09SVF9PVkVSUklERSkgfHxcbiAgdHIuY2hpbGRyZW5baW5kZXhdLmlubmVyVGV4dCB8fFxuICB0ci5jaGlsZHJlbltpbmRleF0udGV4dENvbnRlbnQ7XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIHZhbHVlcyBvZiB0d28gcm93IGFycmF5IGl0ZW1zIGF0IHRoZSBnaXZlbiBpbmRleCwgdGhlbiBzb3J0cyBieSB0aGUgZ2l2ZW4gZGlyZWN0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGNvbXBhcmVGdW5jdGlvbiA9IChpbmRleCwgaXNBc2NlbmRpbmcpID0+ICh0aGlzUm93LCBuZXh0Um93KSA9PiB7XG4gIC8vIGdldCB2YWx1ZXMgdG8gY29tcGFyZSBmcm9tIGRhdGEgYXR0cmlidXRlIG9yIGNlbGwgY29udGVudFxuICBjb25zdCB2YWx1ZTEgPSBnZXRDZWxsVmFsdWUoaXNBc2NlbmRpbmcgPyB0aGlzUm93IDogbmV4dFJvdywgaW5kZXgpO1xuICBjb25zdCB2YWx1ZTIgPSBnZXRDZWxsVmFsdWUoaXNBc2NlbmRpbmcgPyBuZXh0Um93IDogdGhpc1JvdywgaW5kZXgpO1xuXG4gIC8vIGlmIG5laXRoZXIgdmFsdWUgaXMgZW1wdHksIGFuZCBpZiBib3RoIHZhbHVlcyBhcmUgYWxyZWFkeSBudW1iZXJzLCBjb21wYXJlIG51bWVyaWNhbGx5XG4gIGlmIChcbiAgICB2YWx1ZTEgJiZcbiAgICB2YWx1ZTIgJiZcbiAgICAhTnVtYmVyLmlzTmFOKE51bWJlcih2YWx1ZTEpKSAmJlxuICAgICFOdW1iZXIuaXNOYU4oTnVtYmVyKHZhbHVlMikpXG4gICkge1xuICAgIHJldHVybiB2YWx1ZTEgLSB2YWx1ZTI7XG4gIH1cbiAgLy8gT3RoZXJ3aXNlLCBjb21wYXJlIGFscGhhYmV0aWNhbGx5IGJhc2VkIG9uIGN1cnJlbnQgdXNlciBsb2NhbGVcbiAgcmV0dXJuIHZhbHVlMS50b1N0cmluZygpLmxvY2FsZUNvbXBhcmUodmFsdWUyLCBuYXZpZ2F0b3IubGFuZ3VhZ2UsIHtcbiAgICBudW1lcmljOiB0cnVlLFxuICAgIGlnbm9yZVB1bmN0dWF0aW9uOiB0cnVlLFxuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IGFuIEFycmF5IG9mIGNvbHVtbiBoZWFkZXJzIGVsZW1lbnRzIGJlbG9uZ2luZyBkaXJlY3RseSB0byB0aGUgZ2l2ZW5cbiAqIHRhYmxlIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUVsZW1lbnR9IHRhYmxlXG4gKiBAcmV0dXJuIHthcnJheTxIVE1MVGFibGVIZWFkZXJDZWxsRWxlbWVudD59XG4gKi9cbmNvbnN0IGdldENvbHVtbkhlYWRlcnMgPSAodGFibGUpID0+IHtcbiAgY29uc3QgaGVhZGVycyA9IHNlbGVjdChTT1JUQUJMRV9IRUFERVIsIHRhYmxlKTtcbiAgcmV0dXJuIGhlYWRlcnMuZmlsdGVyKChoZWFkZXIpID0+IGhlYWRlci5jbG9zZXN0KFRBQkxFKSA9PT0gdGFibGUpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGJ1dHRvbiBsYWJlbCB3aXRoaW4gdGhlIGdpdmVuIGhlYWRlciBlbGVtZW50LCByZXNldHRpbmcgaXRcbiAqIHRvIHRoZSBkZWZhdWx0IHN0YXRlIChyZWFkeSB0byBzb3J0IGFzY2VuZGluZykgaWYgaXQncyBubyBsb25nZXIgc29ydGVkXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUhlYWRlckNlbGxFbGVtZW50fSBoZWFkZXJcbiAqL1xuY29uc3QgdXBkYXRlU29ydExhYmVsID0gKGhlYWRlcikgPT4ge1xuICBjb25zdCBoZWFkZXJOYW1lID0gaGVhZGVyLmlubmVyVGV4dDtcbiAgY29uc3Qgc29ydGVkQXNjZW5kaW5nID0gaGVhZGVyLmdldEF0dHJpYnV0ZShTT1JURUQpID09PSBBU0NFTkRJTkc7XG4gIGNvbnN0IGlzU29ydGVkID1cbiAgICBoZWFkZXIuZ2V0QXR0cmlidXRlKFNPUlRFRCkgPT09IEFTQ0VORElORyB8fFxuICAgIGhlYWRlci5nZXRBdHRyaWJ1dGUoU09SVEVEKSA9PT0gREVTQ0VORElORyB8fFxuICAgIGZhbHNlO1xuICBjb25zdCBoZWFkZXJMYWJlbCA9IGAke2hlYWRlck5hbWV9Jywgc29ydGFibGUgY29sdW1uLCBjdXJyZW50bHkgJHtcbiAgICBpc1NvcnRlZFxuICAgICAgPyBgJHtzb3J0ZWRBc2NlbmRpbmcgPyBgc29ydGVkICR7QVNDRU5ESU5HfWAgOiBgc29ydGVkICR7REVTQ0VORElOR31gfWBcbiAgICAgIDogXCJ1bnNvcnRlZFwiXG4gIH1gO1xuICBjb25zdCBoZWFkZXJCdXR0b25MYWJlbCA9IGBDbGljayB0byBzb3J0IGJ5ICR7aGVhZGVyTmFtZX0gaW4gJHtcbiAgICBzb3J0ZWRBc2NlbmRpbmcgPyBERVNDRU5ESU5HIDogQVNDRU5ESU5HXG4gIH0gb3JkZXIuYDtcbiAgaGVhZGVyLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgaGVhZGVyTGFiZWwpO1xuICBoZWFkZXIucXVlcnlTZWxlY3RvcihTT1JUX0JVVFRPTikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgaGVhZGVyQnV0dG9uTGFiZWwpO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGFyaWEtc29ydCBhdHRyaWJ1dGUgb24gdGhlIGdpdmVuIGhlYWRlciBlbGVtZW50LCBhbmQgcmVzZXQgdGhlIGxhYmVsIGFuZCBidXR0b24gaWNvblxuICogQHBhcmFtIHtIVE1MVGFibGVIZWFkZXJDZWxsRWxlbWVudH0gaGVhZGVyXG4gKi9cbmNvbnN0IHVuc2V0U29ydCA9IChoZWFkZXIpID0+IHtcbiAgaGVhZGVyLnJlbW92ZUF0dHJpYnV0ZShTT1JURUQpO1xuICB1cGRhdGVTb3J0TGFiZWwoaGVhZGVyKTtcbn07XG5cbi8qKlxuICogU29ydCByb3dzIGVpdGhlciBhc2NlbmRpbmcgb3IgZGVzY2VuZGluZywgYmFzZWQgb24gYSBnaXZlbiBoZWFkZXIncyBhcmlhLXNvcnQgYXR0cmlidXRlXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUhlYWRlckNlbGxFbGVtZW50fSBoZWFkZXJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBc2NlbmRpbmdcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWVcbiAqL1xuY29uc3Qgc29ydFJvd3MgPSAoaGVhZGVyLCBpc0FzY2VuZGluZykgPT4ge1xuICBoZWFkZXIuc2V0QXR0cmlidXRlKFNPUlRFRCwgaXNBc2NlbmRpbmcgPT09IHRydWUgPyBERVNDRU5ESU5HIDogQVNDRU5ESU5HKTtcbiAgdXBkYXRlU29ydExhYmVsKGhlYWRlcik7XG5cbiAgY29uc3QgdGJvZHkgPSBoZWFkZXIuY2xvc2VzdChUQUJMRSkucXVlcnlTZWxlY3RvcihcInRib2R5XCIpO1xuXG4gIC8vIFdlIGNhbiB1c2UgQXJyYXkuZnJvbSgpIGFuZCBBcnJheS5zb3J0KCkgaW5zdGVhZCBvbmNlIHdlIGRyb3AgSUUxMSBzdXBwb3J0LCBsaWtlbHkgaW4gdGhlIHN1bW1lciBvZiAyMDIxXG4gIC8vXG4gIC8vIEFycmF5LmZyb20odGJvZHkucXVlcnlTZWxlY3RvckFsbCgndHInKS5zb3J0KFxuICAvLyAgIGNvbXBhcmVGdW5jdGlvbihcbiAgLy8gICAgIEFycmF5LmZyb20oaGVhZGVyLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YoaGVhZGVyKSxcbiAgLy8gICAgICFpc0FzY2VuZGluZylcbiAgLy8gICApXG4gIC8vIC5mb3JFYWNoKHRyID0+IHRib2R5LmFwcGVuZENoaWxkKHRyKSApO1xuXG4gIC8vIFtdLnNsaWNlLmNhbGwoKSB0dXJucyBhcnJheS1saWtlIHNldHMgaW50byB0cnVlIGFycmF5cyBzbyB0aGF0IHdlIGNhbiBzb3J0IHRoZW1cbiAgY29uc3QgYWxsUm93cyA9IFtdLnNsaWNlLmNhbGwodGJvZHkucXVlcnlTZWxlY3RvckFsbChcInRyXCIpKTtcbiAgY29uc3QgYWxsSGVhZGVycyA9IFtdLnNsaWNlLmNhbGwoaGVhZGVyLnBhcmVudE5vZGUuY2hpbGRyZW4pO1xuICBjb25zdCB0aGlzSGVhZGVySW5kZXggPSBhbGxIZWFkZXJzLmluZGV4T2YoaGVhZGVyKTtcbiAgYWxsUm93cy5zb3J0KGNvbXBhcmVGdW5jdGlvbih0aGlzSGVhZGVySW5kZXgsICFpc0FzY2VuZGluZykpLmZvckVhY2goKHRyKSA9PiB7XG4gICAgW10uc2xpY2VcbiAgICAgIC5jYWxsKHRyLmNoaWxkcmVuKVxuICAgICAgLmZvckVhY2goKHRkKSA9PiB0ZC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtYWN0aXZlXCIpKTtcbiAgICB0ci5jaGlsZHJlblt0aGlzSGVhZGVySW5kZXhdLnNldEF0dHJpYnV0ZShcImRhdGEtc29ydC1hY3RpdmVcIiwgdHJ1ZSk7XG4gICAgdGJvZHkuYXBwZW5kQ2hpbGQodHIpO1xuICB9KTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBsaXZlIHJlZ2lvbiBpbW1lZGlhdGVseSBmb2xsb3dpbmcgdGhlIHRhYmxlIHdoZW5ldmVyIHNvcnQgY2hhbmdlcy5cbiAqIEBwYXJhbSB7SFRNTFRhYmxlRWxlbWVudH0gdGFibGVcbiAqIEBwYXJhbSB7SFRNTFRhYmxlSGVhZGVyQ2VsbEVsZW1lbnR9IHNvcnRlZEhlYWRlclxuICovXG5cbmNvbnN0IHVwZGF0ZUxpdmVSZWdpb24gPSAodGFibGUsIHNvcnRlZEhlYWRlcikgPT4ge1xuICBjb25zdCBjYXB0aW9uID0gdGFibGUucXVlcnlTZWxlY3RvcihcImNhcHRpb25cIikuaW5uZXJUZXh0O1xuICBjb25zdCBzb3J0ZWRBc2NlbmRpbmcgPSBzb3J0ZWRIZWFkZXIuZ2V0QXR0cmlidXRlKFNPUlRFRCkgPT09IEFTQ0VORElORztcbiAgY29uc3QgaGVhZGVyTGFiZWwgPSBzb3J0ZWRIZWFkZXIuaW5uZXJUZXh0O1xuICBjb25zdCBsaXZlUmVnaW9uID0gdGFibGUubmV4dEVsZW1lbnRTaWJsaW5nO1xuICBpZiAobGl2ZVJlZ2lvbiAmJiBsaXZlUmVnaW9uLm1hdGNoZXMoQU5OT1VOQ0VNRU5UX1JFR0lPTikpIHtcbiAgICBjb25zdCBzb3J0QW5ub3VuY2VtZW50ID0gYFRoZSB0YWJsZSBuYW1lZCBcIiR7Y2FwdGlvbn1cIiBpcyBub3cgc29ydGVkIGJ5ICR7aGVhZGVyTGFiZWx9IGluICR7XG4gICAgICBzb3J0ZWRBc2NlbmRpbmcgPyBBU0NFTkRJTkcgOiBERVNDRU5ESU5HXG4gICAgfSBvcmRlci5gO1xuICAgIGxpdmVSZWdpb24uaW5uZXJUZXh0ID0gc29ydEFubm91bmNlbWVudDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVGFibGUgY29udGFpbmluZyBhIHNvcnRhYmxlIGNvbHVtbiBoZWFkZXIgaXMgbm90IGZvbGxvd2VkIGJ5IGFuIGFyaWEtbGl2ZSByZWdpb24uYFxuICAgICk7XG4gIH1cbn07XG5cbi8qKlxuICogVG9nZ2xlIGEgaGVhZGVyJ3Mgc29ydCBzdGF0ZSwgb3B0aW9uYWxseSBwcm92aWRpbmcgYSB0YXJnZXRcbiAqIHN0YXRlLlxuICpcbiAqIEBwYXJhbSB7SFRNTFRhYmxlSGVhZGVyQ2VsbEVsZW1lbnR9IGhlYWRlclxuICogQHBhcmFtIHtib29sZWFuP30gaXNBc2NlbmRpbmcgSWYgbm8gc3RhdGUgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50XG4gKiBzdGF0ZSB3aWxsIGJlIHRvZ2dsZWQgKGZyb20gZmFsc2UgdG8gdHJ1ZSwgYW5kIHZpY2UtdmVyc2EpLlxuICovXG5jb25zdCB0b2dnbGVTb3J0ID0gKGhlYWRlciwgaXNBc2NlbmRpbmcpID0+IHtcbiAgY29uc3QgdGFibGUgPSBoZWFkZXIuY2xvc2VzdChUQUJMRSk7XG4gIGxldCBzYWZlQXNjZW5kaW5nID0gaXNBc2NlbmRpbmc7XG4gIGlmICh0eXBlb2Ygc2FmZUFzY2VuZGluZyAhPT0gXCJib29sZWFuXCIpIHtcbiAgICBzYWZlQXNjZW5kaW5nID0gaGVhZGVyLmdldEF0dHJpYnV0ZShTT1JURUQpID09PSBBU0NFTkRJTkc7XG4gIH1cblxuICBpZiAoIXRhYmxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke1NPUlRBQkxFX0hFQURFUn0gaXMgbWlzc2luZyBvdXRlciAke1RBQkxFfWApO1xuICB9XG5cbiAgc2FmZUFzY2VuZGluZyA9IHNvcnRSb3dzKGhlYWRlciwgaXNBc2NlbmRpbmcpO1xuXG4gIGlmIChzYWZlQXNjZW5kaW5nKSB7XG4gICAgZ2V0Q29sdW1uSGVhZGVycyh0YWJsZSkuZm9yRWFjaCgob3RoZXJIZWFkZXIpID0+IHtcbiAgICAgIGlmIChvdGhlckhlYWRlciAhPT0gaGVhZGVyKSB7XG4gICAgICAgIHVuc2V0U29ydChvdGhlckhlYWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdXBkYXRlTGl2ZVJlZ2lvbih0YWJsZSwgaGVhZGVyKTtcbiAgfVxufTtcblxuLyoqXG4gKiogSW5zZXJ0cyBhIGJ1dHRvbiB3aXRoIGljb24gaW5zaWRlIGEgc29ydGFibGUgaGVhZGVyXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUhlYWRlckNlbGxFbGVtZW50fSBoZWFkZXJcbiAqL1xuXG5jb25zdCBjcmVhdGVIZWFkZXJCdXR0b24gPSAoaGVhZGVyKSA9PiB7XG4gIGNvbnN0IGJ1dHRvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgYnV0dG9uRWwuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCIwXCIpO1xuICBidXR0b25FbC5jbGFzc0xpc3QuYWRkKFNPUlRfQlVUVE9OX0NMQVNTKTtcbiAgLy8gSUNPTl9TT1VSQ0VcbiAgYnV0dG9uRWwuaW5uZXJIVE1MID0gU2FuaXRpemVyLmVzY2FwZUhUTUxgXG4gIDxzdmcgY2xhc3M9XCIke1BSRUZJWH0taWNvblwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgPGcgY2xhc3M9XCJkZXNjZW5kaW5nXCIgZmlsbD1cInRyYW5zcGFyZW50XCI+XG4gICAgICA8cGF0aCBkPVwiTTE3IDE3TDE1LjU5IDE1LjU5TDEyLjk5OTkgMTguMTdWMkgxMC45OTk5VjE4LjE3TDguNDEgMTUuNThMNyAxN0wxMS45OTk5IDIyTDE3IDE3WlwiIC8+XG4gICAgPC9nPlxuICAgIDxnIGNsYXNzPVwiYXNjZW5kaW5nXCIgZmlsbD1cInRyYW5zcGFyZW50XCI+XG4gICAgICA8cGF0aCB0cmFuc2Zvcm09XCJyb3RhdGUoMTgwLCAxMiwgMTIpXCIgZD1cIk0xNyAxN0wxNS41OSAxNS41OUwxMi45OTk5IDE4LjE3VjJIMTAuOTk5OVYxOC4xN0w4LjQxIDE1LjU4TDcgMTdMMTEuOTk5OSAyMkwxNyAxN1pcIiAvPlxuICAgIDwvZz5cbiAgICA8ZyBjbGFzcz1cInVuc29ydGVkXCIgZmlsbD1cInRyYW5zcGFyZW50XCI+XG4gICAgICA8cG9seWdvbiBwb2ludHM9XCIxNS4xNyAxNSAxMyAxNy4xNyAxMyA2LjgzIDE1LjE3IDkgMTYuNTggNy41OSAxMiAzIDcuNDEgNy41OSA4LjgzIDkgMTEgNi44MyAxMSAxNy4xNyA4LjgzIDE1IDcuNDIgMTYuNDEgMTIgMjEgMTYuNTkgMTYuNDEgMTUuMTcgMTVcIi8+XG4gICAgPC9nPlxuICA8L3N2Zz5cbiAgYDtcbiAgaGVhZGVyLmFwcGVuZENoaWxkKGJ1dHRvbkVsKTtcbiAgdXBkYXRlU29ydExhYmVsKGhlYWRlcik7XG59O1xuXG5jb25zdCB0YWJsZSA9IGJlaGF2aW9yKFxuICB7XG4gICAgW0NMSUNLXToge1xuICAgICAgW1NPUlRfQlVUVE9OXShldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0b2dnbGVTb3J0KFxuICAgICAgICAgIGV2ZW50LnRhcmdldC5jbG9zZXN0KFNPUlRBQkxFX0hFQURFUiksXG4gICAgICAgICAgZXZlbnQudGFyZ2V0LmNsb3Nlc3QoU09SVEFCTEVfSEVBREVSKS5nZXRBdHRyaWJ1dGUoU09SVEVEKSA9PT1cbiAgICAgICAgICAgIEFTQ0VORElOR1xuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaW5pdChyb290KSB7XG4gICAgICBjb25zdCBzb3J0YWJsZUhlYWRlcnMgPSBzZWxlY3QoU09SVEFCTEVfSEVBREVSLCByb290KTtcbiAgICAgIHNvcnRhYmxlSGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IGNyZWF0ZUhlYWRlckJ1dHRvbihoZWFkZXIpKTtcblxuICAgICAgY29uc3QgZmlyc3RTb3J0ZWQgPSBzb3J0YWJsZUhlYWRlcnMuZmlsdGVyKFxuICAgICAgICAoaGVhZGVyKSA9PlxuICAgICAgICAgIGhlYWRlci5nZXRBdHRyaWJ1dGUoU09SVEVEKSA9PT0gQVNDRU5ESU5HIHx8XG4gICAgICAgICAgaGVhZGVyLmdldEF0dHJpYnV0ZShTT1JURUQpID09PSBERVNDRU5ESU5HXG4gICAgICApWzBdO1xuICAgICAgaWYgKHR5cGVvZiBmaXJzdFNvcnRlZCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBubyBzb3J0YWJsZSBoZWFkZXJzIGZvdW5kXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNvcnREaXIgPSBmaXJzdFNvcnRlZC5nZXRBdHRyaWJ1dGUoU09SVEVEKTtcbiAgICAgIGlmIChzb3J0RGlyID09PSBBU0NFTkRJTkcpIHtcbiAgICAgICAgdG9nZ2xlU29ydChmaXJzdFNvcnRlZCwgdHJ1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNvcnREaXIgPT09IERFU0NFTkRJTkcpIHtcbiAgICAgICAgdG9nZ2xlU29ydChmaXJzdFNvcnRlZCwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG4gICAgVEFCTEUsXG4gICAgU09SVEFCTEVfSEVBREVSLFxuICAgIFNPUlRfQlVUVE9OLFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlO1xuIiwiY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcbmNvbnN0IHsgQ09NQk9fQk9YX0NMQVNTLCBlbmhhbmNlQ29tYm9Cb3ggfSA9IHJlcXVpcmUoXCIuL2NvbWJvLWJveFwiKTtcblxuY29uc3QgVElNRV9QSUNLRVJfQ0xBU1MgPSBgJHtQUkVGSVh9LXRpbWUtcGlja2VyYDtcbmNvbnN0IFRJTUVfUElDS0VSID0gYC4ke1RJTUVfUElDS0VSX0NMQVNTfWA7XG5jb25zdCBNQVhfVElNRSA9IDYwICogMjQgLSAxO1xuY29uc3QgTUlOX1RJTUUgPSAwO1xuY29uc3QgREVGQVVMVF9TVEVQID0gMzA7XG5jb25zdCBNSU5fU1RFUCA9IDE7XG5cbmNvbnN0IEZJTFRFUl9EQVRBU0VUID0ge1xuICBmaWx0ZXI6XG4gICAgXCIwP3t7IGhvdXJRdWVyeUZpbHRlciB9fTp7e21pbnV0ZVF1ZXJ5RmlsdGVyfX0uKnt7IGFwUXVlcnlGaWx0ZXIgfX1tP1wiLFxuICBhcFF1ZXJ5RmlsdGVyOiBcIihbYXBdKVwiLFxuICBob3VyUXVlcnlGaWx0ZXI6IFwiKFsxLTldWzAtMl0/KVwiLFxuICBtaW51dGVRdWVyeUZpbHRlcjogXCJbXFxcXGRdKzooWzAtOV17MCwyfSlcIixcbn07XG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgb2YgaGg6bW0gaW50byBtaW51dGVzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRpbWVTdHIgdGhlIHRpbWUgc3RyaW5nIHRvIHBhcnNlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIG1pbnV0ZXNcbiAqL1xuY29uc3QgcGFyc2VUaW1lU3RyaW5nID0gKHRpbWVTdHIpID0+IHtcbiAgbGV0IG1pbnV0ZXM7XG5cbiAgaWYgKHRpbWVTdHIpIHtcbiAgICBjb25zdCBbaG91cnMsIG1pbnNdID0gdGltZVN0ci5zcGxpdChcIjpcIikubWFwKChzdHIpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KHN0ciwgMTApO1xuICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkgdmFsdWUgPSBwYXJzZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG5cbiAgICBpZiAoaG91cnMgIT0gbnVsbCAmJiBtaW5zICE9IG51bGwpIHtcbiAgICAgIG1pbnV0ZXMgPSBob3VycyAqIDYwICsgbWlucztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWludXRlcztcbn07XG5cbi8qKlxuICogRW5oYW5jZSBhbiBpbnB1dCB3aXRoIHRoZSBkYXRlIHBpY2tlciBlbGVtZW50c1xuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIFRoZSBpbml0aWFsIHdyYXBwaW5nIGVsZW1lbnQgb2YgdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCB0cmFuc2Zvcm1UaW1lUGlja2VyID0gKGVsKSA9PiB7XG4gIGNvbnN0IHRpbWVQaWNrZXJFbCA9IGVsLmNsb3Nlc3QoVElNRV9QSUNLRVIpO1xuXG4gIGNvbnN0IGluaXRpYWxJbnB1dEVsID0gdGltZVBpY2tlckVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG5cbiAgaWYgKCFpbml0aWFsSW5wdXRFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtUSU1FX1BJQ0tFUn0gaXMgbWlzc2luZyBpbm5lciBpbnB1dGApO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VsZWN0XCIpO1xuXG4gIFtcImlkXCIsIFwibmFtZVwiLCBcInJlcXVpcmVkXCIsIFwiYXJpYS1sYWJlbFwiLCBcImFyaWEtbGFiZWxsZWRieVwiXS5mb3JFYWNoKFxuICAgIChuYW1lKSA9PiB7XG4gICAgICBpZiAoaW5pdGlhbElucHV0RWwuaGFzQXR0cmlidXRlKG5hbWUpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5pdGlhbElucHV0RWwuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgICAgICBzZWxlY3RFbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICBpbml0aWFsSW5wdXRFbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIGNvbnN0IHBhZFplcm9zID0gKHZhbHVlLCBsZW5ndGgpID0+IGAwMDAwJHt2YWx1ZX1gLnNsaWNlKC1sZW5ndGgpO1xuXG4gIGNvbnN0IGdldFRpbWVDb250ZXh0ID0gKG1pbnV0ZXMpID0+IHtcbiAgICBjb25zdCBtaW51dGUgPSBtaW51dGVzICUgNjA7XG4gICAgY29uc3QgaG91cjI0ID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xuICAgIGNvbnN0IGhvdXIxMiA9IGhvdXIyNCAlIDEyIHx8IDEyO1xuICAgIGNvbnN0IGFtcG0gPSBob3VyMjQgPCAxMiA/IFwiYW1cIiA6IFwicG1cIjtcblxuICAgIHJldHVybiB7XG4gICAgICBtaW51dGUsXG4gICAgICBob3VyMjQsXG4gICAgICBob3VyMTIsXG4gICAgICBhbXBtLFxuICAgIH07XG4gIH07XG5cbiAgY29uc3QgbWluVGltZSA9IE1hdGgubWF4KFxuICAgIE1JTl9USU1FLFxuICAgIHBhcnNlVGltZVN0cmluZyh0aW1lUGlja2VyRWwuZGF0YXNldC5taW5UaW1lKSB8fCBNSU5fVElNRVxuICApO1xuICBjb25zdCBtYXhUaW1lID0gTWF0aC5taW4oXG4gICAgTUFYX1RJTUUsXG4gICAgcGFyc2VUaW1lU3RyaW5nKHRpbWVQaWNrZXJFbC5kYXRhc2V0Lm1heFRpbWUpIHx8IE1BWF9USU1FXG4gICk7XG4gIGNvbnN0IHN0ZXAgPSBNYXRoLmZsb29yKFxuICAgIE1hdGgubWF4KE1JTl9TVEVQLCB0aW1lUGlja2VyRWwuZGF0YXNldC5zdGVwIHx8IERFRkFVTFRfU1RFUClcbiAgKTtcblxuICBsZXQgZGVmYXVsdFZhbHVlO1xuICBmb3IgKGxldCB0aW1lID0gbWluVGltZTsgdGltZSA8PSBtYXhUaW1lOyB0aW1lICs9IHN0ZXApIHtcbiAgICBjb25zdCB7IG1pbnV0ZSwgaG91cjI0LCBob3VyMTIsIGFtcG0gfSA9IGdldFRpbWVDb250ZXh0KHRpbWUpO1xuXG4gICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICBvcHRpb24udmFsdWUgPSBgJHtwYWRaZXJvcyhob3VyMjQsIDIpfToke3BhZFplcm9zKG1pbnV0ZSwgMil9YDtcbiAgICBvcHRpb24udGV4dCA9IGAke2hvdXIxMn06JHtwYWRaZXJvcyhtaW51dGUsIDIpfSR7YW1wbX1gO1xuICAgIGlmIChvcHRpb24udGV4dCA9PT0gaW5pdGlhbElucHV0RWwudmFsdWUpIHtcbiAgICAgIGRlZmF1bHRWYWx1ZSA9IG9wdGlvbi52YWx1ZTtcbiAgICB9XG4gICAgc2VsZWN0RWwuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgfVxuXG4gIHRpbWVQaWNrZXJFbC5jbGFzc0xpc3QuYWRkKENPTUJPX0JPWF9DTEFTUyk7XG5cbiAgLy8gY29tYm8gYm94IHByb3BlcnRpZXNcbiAgT2JqZWN0LmtleXMoRklMVEVSX0RBVEFTRVQpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHRpbWVQaWNrZXJFbC5kYXRhc2V0W2tleV0gPSBGSUxURVJfREFUQVNFVFtrZXldO1xuICB9KTtcbiAgdGltZVBpY2tlckVsLmRhdGFzZXQuZGlzYWJsZUZpbHRlcmluZyA9IFwidHJ1ZVwiO1xuICB0aW1lUGlja2VyRWwuZGF0YXNldC5kZWZhdWx0VmFsdWUgPSBkZWZhdWx0VmFsdWU7XG5cbiAgdGltZVBpY2tlckVsLmFwcGVuZENoaWxkKHNlbGVjdEVsKTtcbiAgaW5pdGlhbElucHV0RWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xufTtcblxuY29uc3QgdGltZVBpY2tlciA9IGJlaGF2aW9yKFxuICB7fSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgc2VsZWN0KFRJTUVfUElDS0VSLCByb290KS5mb3JFYWNoKCh0aW1lUGlja2VyRWwpID0+IHtcbiAgICAgICAgdHJhbnNmb3JtVGltZVBpY2tlcih0aW1lUGlja2VyRWwpO1xuICAgICAgICBlbmhhbmNlQ29tYm9Cb3godGltZVBpY2tlckVsKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgRklMVEVSX0RBVEFTRVQsXG4gIH1cbik7XG5cbm1vZHVsZS5leHBvcnRzID0gdGltZVBpY2tlcjtcbiIsIi8vIFRvb2x0aXBzXG5jb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuY29uc3QgaXNFbGVtZW50SW5WaWV3cG9ydCA9IHJlcXVpcmUoXCIuLi91dGlscy9pcy1pbi12aWV3cG9ydFwiKTtcblxuY29uc3QgVE9PTFRJUCA9IGAuJHtQUkVGSVh9LXRvb2x0aXBgO1xuY29uc3QgVE9PTFRJUF9UUklHR0VSX0NMQVNTID0gYCR7UFJFRklYfS10b29sdGlwX190cmlnZ2VyYDtcbmNvbnN0IFRPT0xUSVBfQ0xBU1MgPSBgJHtQUkVGSVh9LXRvb2x0aXBgO1xuY29uc3QgVE9PTFRJUF9CT0RZX0NMQVNTID0gYCR7UFJFRklYfS10b29sdGlwX19ib2R5YDtcbmNvbnN0IFNFVF9DTEFTUyA9IFwiaXMtc2V0XCI7XG5jb25zdCBWSVNJQkxFX0NMQVNTID0gXCJpcy12aXNpYmxlXCI7XG5jb25zdCBUUklBTkdMRV9TSVpFID0gNTtcbmNvbnN0IEFESlVTVF9XSURUSF9DTEFTUyA9IGAke1BSRUZJWH0tdG9vbHRpcF9fYm9keS0td3JhcGA7XG5cbi8qKlxuICogQWRkIG9uZSBvciBtb3JlIGxpc3RlbmVycyB0byBhbiBlbGVtZW50XG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnQgLSBET00gZWxlbWVudCB0byBhZGQgbGlzdGVuZXJzIHRvXG4gKiBAcGFyYW0ge2V2ZW50c30gZXZlbnROYW1lcyAtIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGV2ZW50IG5hbWVzLCBlLmcuICdjbGljayBjaGFuZ2UnXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciAtIGZ1bmN0aW9uIHRvIGF0dGFjaCBmb3IgZWFjaCBldmVudCBhcyBhIGxpc3RlbmVyXG4gKi9cbmNvbnN0IGFkZExpc3RlbmVyTXVsdGkgPSAoZWxlbWVudCwgZXZlbnROYW1lcywgbGlzdGVuZXIpID0+IHtcbiAgY29uc3QgZXZlbnRzID0gZXZlbnROYW1lcy5zcGxpdChcIiBcIik7XG4gIGZvciAobGV0IGkgPSAwLCBpTGVuID0gZXZlbnRzLmxlbmd0aDsgaSA8IGlMZW47IGkgKz0gMSkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudHNbaV0sIGxpc3RlbmVyLCBmYWxzZSk7XG4gIH1cbn07XG5cbi8qKlxuICogU2hvd3MgdGhlIHRvb2x0aXBcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRvb2x0aXBUcmlnZ2VyIC0gdGhlIGVsZW1lbnQgdGhhdCBpbml0aWFsaXplcyB0aGUgdG9vbHRpcFxuICovXG5jb25zdCBzaG93VG9vbFRpcCA9ICh0b29sdGlwQm9keSwgdG9vbHRpcFRyaWdnZXIsIHBvc2l0aW9uKSA9PiB7XG4gIHRvb2x0aXBCb2R5LnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwiZmFsc2VcIik7XG5cbiAgLy8gVGhpcyBzZXRzIHVwIHRoZSB0b29sdGlwIGJvZHkuIFRoZSBvcGFjaXR5IGlzIDAsIGJ1dFxuICAvLyB3ZSBjYW4gYmVnaW4gcnVubmluZyB0aGUgY2FsY3VsYXRpb25zIGJlbG93LlxuICB0b29sdGlwQm9keS5jbGFzc0xpc3QuYWRkKFNFVF9DTEFTUyk7XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9uIHRoZSB0b29sdGlwIGJvZHkgd2hlbiB0aGUgdHJpZ2dlciBpcyBob3ZlcmVkXG4gICAqIFJlbW92ZXMgb2xkIHBvc2l0aW9uaW5nIGNsYXNzbmFtZXMgYW5kIHJlYXBwbGllcy4gVGhpcyBhbGxvd3NcbiAgICogcG9zaXRpb25pbmcgdG8gY2hhbmdlIGluIGNhc2UgdGhlIHVzZXIgcmVzaXplcyBicm93c2VyIG9yIERPTSBtYW5pcHVsYXRpb25cbiAgICogY2F1c2VzIHRvb2x0aXAgdG8gZ2V0IGNsaXBwZWQgZnJvbSB2aWV3cG9ydFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0UG9zIC0gY2FuIGJlIFwidG9wXCIsIFwiYm90dG9tXCIsIFwicmlnaHRcIiwgXCJsZWZ0XCJcbiAgICovXG4gIGNvbnN0IHNldFBvc2l0aW9uQ2xhc3MgPSAoc2V0UG9zKSA9PiB7XG4gICAgdG9vbHRpcEJvZHkuY2xhc3NMaXN0LnJlbW92ZShgJHtUT09MVElQX0JPRFlfQ0xBU1N9LS10b3BgKTtcbiAgICB0b29sdGlwQm9keS5jbGFzc0xpc3QucmVtb3ZlKGAke1RPT0xUSVBfQk9EWV9DTEFTU30tLWJvdHRvbWApO1xuICAgIHRvb2x0aXBCb2R5LmNsYXNzTGlzdC5yZW1vdmUoYCR7VE9PTFRJUF9CT0RZX0NMQVNTfS0tcmlnaHRgKTtcbiAgICB0b29sdGlwQm9keS5jbGFzc0xpc3QucmVtb3ZlKGAke1RPT0xUSVBfQk9EWV9DTEFTU30tLWxlZnRgKTtcbiAgICB0b29sdGlwQm9keS5jbGFzc0xpc3QuYWRkKGAke1RPT0xUSVBfQk9EWV9DTEFTU30tLSR7c2V0UG9zfWApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIG9sZCBwb3NpdGlvbmluZyBzdHlsZXMuIFRoaXMgYWxsb3dzXG4gICAqIHJlLXBvc2l0aW9uaW5nIHRvIGNoYW5nZSB3aXRob3V0IGluaGVyaXRpbmcgb3RoZXJcbiAgICogZHluYW1pYyBzdHlsZXNcbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZSAtIHRoaXMgaXMgdGhlIHRvb2x0aXAgYm9keVxuICAgKi9cbiAgY29uc3QgcmVzZXRQb3NpdGlvblN0eWxlcyA9IChlKSA9PiB7XG4gICAgLy8gd2UgZG9uJ3Qgb3ZlcnJpZGUgYW55dGhpbmcgaW4gdGhlIHN0eWxlc2hlZXQgd2hlbiBmaW5kaW5nIGFsdCBwb3NpdGlvbnNcbiAgICBlLnN0eWxlLnRvcCA9IG51bGw7XG4gICAgZS5zdHlsZS5ib3R0b20gPSBudWxsO1xuICAgIGUuc3R5bGUucmlnaHQgPSBudWxsO1xuICAgIGUuc3R5bGUubGVmdCA9IG51bGw7XG4gICAgZS5zdHlsZS5tYXJnaW4gPSBudWxsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBnZXQgbWFyZ2luIG9mZnNldCBjYWxjdWxhdGlvbnNcbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gdGhpcyBpcyB0aGUgdG9vbHRpcCBib2R5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVZhbHVlIC0gdGhpcyBpcyB0aGUgdG9vbHRpcCBib2R5XG4gICAqL1xuXG4gIGNvbnN0IG9mZnNldE1hcmdpbiA9ICh0YXJnZXQsIHByb3BlcnR5VmFsdWUpID0+XG4gICAgcGFyc2VJbnQoXG4gICAgICB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHlWYWx1ZSksXG4gICAgICAxMFxuICAgICk7XG5cbiAgLy8gb2Zmc2V0TGVmdCA9IHRoZSBsZWZ0IHBvc2l0aW9uLCBhbmQgbWFyZ2luIG9mIHRoZSBlbGVtZW50LCB0aGUgbGVmdFxuICAvLyBwYWRkaW5nLCBzY3JvbGxiYXIgYW5kIGJvcmRlciBvZiB0aGUgb2Zmc2V0UGFyZW50IGVsZW1lbnRcbiAgLy8gb2Zmc2V0V2lkdGggPSBUaGUgb2Zmc2V0V2lkdGggcHJvcGVydHkgcmV0dXJucyB0aGUgdmlld2FibGUgd2lkdGggb2YgYW5cbiAgLy8gZWxlbWVudCBpbiBwaXhlbHMsIGluY2x1ZGluZyBwYWRkaW5nLCBib3JkZXIgYW5kIHNjcm9sbGJhciwgYnV0IG5vdFxuICAvLyB0aGUgbWFyZ2luLlxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgbWFyZ2luIG9mZnNldFxuICAgKiB0b29sdGlwIHRyaWdnZXIgbWFyZ2luKHBvc2l0aW9uKSBvZmZzZXQgKyB0b29sdGlwQm9keSBvZmZzZXRXaWR0aFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWFyZ2luUG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRvb2x0aXBCb2R5T2Zmc2V0XG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRyaWdnZXJcbiAgICovXG5cbiAgY29uc3QgY2FsY3VsYXRlTWFyZ2luT2Zmc2V0ID0gKFxuICAgIG1hcmdpblBvc2l0aW9uLFxuICAgIHRvb2x0aXBCb2R5T2Zmc2V0LFxuICAgIHRyaWdnZXJcbiAgKSA9PiB7XG4gICAgY29uc3Qgb2Zmc2V0ID1cbiAgICAgIG9mZnNldE1hcmdpbih0cmlnZ2VyLCBgbWFyZ2luLSR7bWFyZ2luUG9zaXRpb259YCkgPiAwXG4gICAgICAgID8gdG9vbHRpcEJvZHlPZmZzZXQgLSBvZmZzZXRNYXJnaW4odHJpZ2dlciwgYG1hcmdpbi0ke21hcmdpblBvc2l0aW9ufWApXG4gICAgICAgIDogdG9vbHRpcEJvZHlPZmZzZXQ7XG5cbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBQb3NpdGlvbnMgdG9vbHRpcCBhdCB0aGUgdG9wXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGUgLSB0aGlzIGlzIHRoZSB0b29sdGlwIGJvZHlcbiAgICovXG4gIGNvbnN0IHBvc2l0aW9uVG9wID0gKGUpID0+IHtcbiAgICByZXNldFBvc2l0aW9uU3R5bGVzKGUpOyAvLyBlbnN1cmVzIHdlIHN0YXJ0IGZyb20gdGhlIHNhbWUgcG9pbnRcbiAgICAvLyBnZXQgZGV0YWlscyBvbiB0aGUgZWxlbWVudHMgb2JqZWN0IHdpdGhcblxuICAgIGNvbnN0IHRvcE1hcmdpbiA9IGNhbGN1bGF0ZU1hcmdpbk9mZnNldChcbiAgICAgIFwidG9wXCIsXG4gICAgICBlLm9mZnNldEhlaWdodCxcbiAgICAgIHRvb2x0aXBUcmlnZ2VyXG4gICAgKTtcblxuICAgIGNvbnN0IGxlZnRNYXJnaW4gPSBjYWxjdWxhdGVNYXJnaW5PZmZzZXQoXG4gICAgICBcImxlZnRcIixcbiAgICAgIGUub2Zmc2V0V2lkdGgsXG4gICAgICB0b29sdGlwVHJpZ2dlclxuICAgICk7XG5cbiAgICBzZXRQb3NpdGlvbkNsYXNzKFwidG9wXCIpO1xuICAgIGUuc3R5bGUubGVmdCA9IGA1MCVgOyAvLyBjZW50ZXIgdGhlIGVsZW1lbnRcbiAgICBlLnN0eWxlLnRvcCA9IGAtJHtUUklBTkdMRV9TSVpFfXB4YDsgLy8gY29uc2lkZXIgdGhlIHBzZXVkbyBlbGVtZW50XG4gICAgLy8gYXBwbHkgb3VyIG1hcmdpbnMgYmFzZWQgb24gdGhlIG9mZnNldFxuICAgIGUuc3R5bGUubWFyZ2luID0gYC0ke3RvcE1hcmdpbn1weCAwIDAgLSR7bGVmdE1hcmdpbiAvIDJ9cHhgO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQb3NpdGlvbnMgdG9vbHRpcCBhdCB0aGUgYm90dG9tXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGUgLSB0aGlzIGlzIHRoZSB0b29sdGlwIGJvZHlcbiAgICovXG4gIGNvbnN0IHBvc2l0aW9uQm90dG9tID0gKGUpID0+IHtcbiAgICByZXNldFBvc2l0aW9uU3R5bGVzKGUpO1xuXG4gICAgY29uc3QgbGVmdE1hcmdpbiA9IGNhbGN1bGF0ZU1hcmdpbk9mZnNldChcbiAgICAgIFwibGVmdFwiLFxuICAgICAgZS5vZmZzZXRXaWR0aCxcbiAgICAgIHRvb2x0aXBUcmlnZ2VyXG4gICAgKTtcblxuICAgIHNldFBvc2l0aW9uQ2xhc3MoXCJib3R0b21cIik7XG4gICAgZS5zdHlsZS5sZWZ0ID0gYDUwJWA7XG4gICAgZS5zdHlsZS5tYXJnaW4gPSBgJHtUUklBTkdMRV9TSVpFfXB4IDAgMCAtJHtsZWZ0TWFyZ2luIC8gMn1weGA7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9ucyB0b29sdGlwIGF0IHRoZSByaWdodFxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlIC0gdGhpcyBpcyB0aGUgdG9vbHRpcCBib2R5XG4gICAqL1xuICBjb25zdCBwb3NpdGlvblJpZ2h0ID0gKGUpID0+IHtcbiAgICByZXNldFBvc2l0aW9uU3R5bGVzKGUpO1xuXG4gICAgY29uc3QgdG9wTWFyZ2luID0gY2FsY3VsYXRlTWFyZ2luT2Zmc2V0KFxuICAgICAgXCJ0b3BcIixcbiAgICAgIGUub2Zmc2V0SGVpZ2h0LFxuICAgICAgdG9vbHRpcFRyaWdnZXJcbiAgICApO1xuXG4gICAgc2V0UG9zaXRpb25DbGFzcyhcInJpZ2h0XCIpO1xuICAgIGUuc3R5bGUudG9wID0gYDUwJWA7XG4gICAgZS5zdHlsZS5sZWZ0ID0gYCR7XG4gICAgICB0b29sdGlwVHJpZ2dlci5vZmZzZXRMZWZ0ICsgdG9vbHRpcFRyaWdnZXIub2Zmc2V0V2lkdGggKyBUUklBTkdMRV9TSVpFXG4gICAgfXB4YDtcbiAgICBlLnN0eWxlLm1hcmdpbiA9IGAtJHt0b3BNYXJnaW4gLyAyfXB4IDAgMCAwYDtcbiAgfTtcblxuICAvKipcbiAgICogUG9zaXRpb25zIHRvb2x0aXAgYXQgdGhlIHJpZ2h0XG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGUgLSB0aGlzIGlzIHRoZSB0b29sdGlwIGJvZHlcbiAgICovXG4gIGNvbnN0IHBvc2l0aW9uTGVmdCA9IChlKSA9PiB7XG4gICAgcmVzZXRQb3NpdGlvblN0eWxlcyhlKTtcblxuICAgIGNvbnN0IHRvcE1hcmdpbiA9IGNhbGN1bGF0ZU1hcmdpbk9mZnNldChcbiAgICAgIFwidG9wXCIsXG4gICAgICBlLm9mZnNldEhlaWdodCxcbiAgICAgIHRvb2x0aXBUcmlnZ2VyXG4gICAgKTtcblxuICAgIC8vIHdlIGhhdmUgdG8gY2hlY2sgZm9yIHNvbWUgdXRpbGl0eSBtYXJnaW5zXG4gICAgY29uc3QgbGVmdE1hcmdpbiA9IGNhbGN1bGF0ZU1hcmdpbk9mZnNldChcbiAgICAgIFwibGVmdFwiLFxuICAgICAgdG9vbHRpcFRyaWdnZXIub2Zmc2V0TGVmdCA+IGUub2Zmc2V0V2lkdGhcbiAgICAgICAgPyB0b29sdGlwVHJpZ2dlci5vZmZzZXRMZWZ0IC0gZS5vZmZzZXRXaWR0aFxuICAgICAgICA6IGUub2Zmc2V0V2lkdGgsXG4gICAgICB0b29sdGlwVHJpZ2dlclxuICAgICk7XG5cbiAgICBzZXRQb3NpdGlvbkNsYXNzKFwibGVmdFwiKTtcbiAgICBlLnN0eWxlLnRvcCA9IGA1MCVgO1xuICAgIGUuc3R5bGUubGVmdCA9IGAtJHtUUklBTkdMRV9TSVpFfXB4YDtcbiAgICBlLnN0eWxlLm1hcmdpbiA9IGAtJHt0b3BNYXJnaW4gLyAyfXB4IDAgMCAke1xuICAgICAgdG9vbHRpcFRyaWdnZXIub2Zmc2V0TGVmdCA+IGUub2Zmc2V0V2lkdGggPyBsZWZ0TWFyZ2luIDogLWxlZnRNYXJnaW5cbiAgICB9cHhgOyAvLyBhZGp1c3QgdGhlIG1hcmdpblxuICB9O1xuXG4gIC8qKlxuICAgKiBXZSB0cnkgdG8gc2V0IHRoZSBwb3NpdGlvbiBiYXNlZCBvbiB0aGVcbiAgICogb3JpZ2luYWwgaW50ZW50aW9uLCBidXQgbWFrZSBhZGp1c3RtZW50c1xuICAgKiBpZiB0aGUgZWxlbWVudCBpcyBjbGlwcGVkIG91dCBvZiB0aGUgdmlld3BvcnRcbiAgICogd2UgY29uc3RyYWluIHRoZSB3aWR0aCBvbmx5IGFzIGEgbGFzdCByZXNvcnRcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudChhbGlhcyB0b29sdGlwQm9keSlcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGF0dGVtcHQgKC0tZmxhZylcbiAgICovXG5cbiAgY29uc3QgbWF4QXR0ZW1wdHMgPSAyO1xuXG4gIGZ1bmN0aW9uIGZpbmRCZXN0UG9zaXRpb24oZWxlbWVudCwgYXR0ZW1wdCA9IDEpIHtcbiAgICAvLyBjcmVhdGUgYXJyYXkgb2Ygb3B0aW9uYWwgcG9zaXRpb25zXG4gICAgY29uc3QgcG9zaXRpb25zID0gW1xuICAgICAgcG9zaXRpb25Ub3AsXG4gICAgICBwb3NpdGlvbkJvdHRvbSxcbiAgICAgIHBvc2l0aW9uUmlnaHQsXG4gICAgICBwb3NpdGlvbkxlZnQsXG4gICAgXTtcblxuICAgIGxldCBoYXNWaXNpYmxlUG9zaXRpb24gPSBmYWxzZTtcblxuICAgIC8vIHdlIHRha2UgYSByZWN1cnNpdmUgYXBwcm9hY2hcbiAgICBmdW5jdGlvbiB0cnlQb3NpdGlvbnMoaSkge1xuICAgICAgaWYgKGkgPCBwb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHBvc2l0aW9uc1tpXTtcbiAgICAgICAgcG9zKGVsZW1lbnQpO1xuXG4gICAgICAgIGlmICghaXNFbGVtZW50SW5WaWV3cG9ydChlbGVtZW50KSkge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICAgIHRyeVBvc2l0aW9ucygoaSArPSAxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFzVmlzaWJsZVBvc2l0aW9uID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRyeVBvc2l0aW9ucygwKTtcbiAgICAvLyBpZiB3ZSBjYW4ndCBmaW5kIGEgcG9zaXRpb24gd2UgY29tcHJlc3MgaXQgYW5kIHRyeSBhZ2FpblxuICAgIGlmICghaGFzVmlzaWJsZVBvc2l0aW9uKSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoQURKVVNUX1dJRFRIX0NMQVNTKTtcbiAgICAgIGlmIChhdHRlbXB0IDw9IG1heEF0dGVtcHRzKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICBmaW5kQmVzdFBvc2l0aW9uKGVsZW1lbnQsIChhdHRlbXB0ICs9IDEpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgY2FzZSBcInRvcFwiOlxuICAgICAgcG9zaXRpb25Ub3AodG9vbHRpcEJvZHkpO1xuICAgICAgaWYgKCFpc0VsZW1lbnRJblZpZXdwb3J0KHRvb2x0aXBCb2R5KSkge1xuICAgICAgICBmaW5kQmVzdFBvc2l0aW9uKHRvb2x0aXBCb2R5KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJib3R0b21cIjpcbiAgICAgIHBvc2l0aW9uQm90dG9tKHRvb2x0aXBCb2R5KTtcbiAgICAgIGlmICghaXNFbGVtZW50SW5WaWV3cG9ydCh0b29sdGlwQm9keSkpIHtcbiAgICAgICAgZmluZEJlc3RQb3NpdGlvbih0b29sdGlwQm9keSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwicmlnaHRcIjpcbiAgICAgIHBvc2l0aW9uUmlnaHQodG9vbHRpcEJvZHkpO1xuICAgICAgaWYgKCFpc0VsZW1lbnRJblZpZXdwb3J0KHRvb2x0aXBCb2R5KSkge1xuICAgICAgICBmaW5kQmVzdFBvc2l0aW9uKHRvb2x0aXBCb2R5KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJsZWZ0XCI6XG4gICAgICBwb3NpdGlvbkxlZnQodG9vbHRpcEJvZHkpO1xuICAgICAgaWYgKCFpc0VsZW1lbnRJblZpZXdwb3J0KHRvb2x0aXBCb2R5KSkge1xuICAgICAgICBmaW5kQmVzdFBvc2l0aW9uKHRvb2x0aXBCb2R5KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIHNraXAgZGVmYXVsdCBjYXNlXG4gICAgICBicmVhaztcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3R1YWxseSBzaG93IHRoZSB0b29sdGlwLiBUaGUgVklTSUJMRV9DTEFTU1xuICAgKiB3aWxsIGNoYW5nZSB0aGUgb3BhY2l0eSB0byAxXG4gICAqL1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICB0b29sdGlwQm9keS5jbGFzc0xpc3QuYWRkKFZJU0lCTEVfQ0xBU1MpO1xuICB9LCAyMCk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIHRoZSBwcm9wZXJ0aWVzIHRvIHNob3cgYW5kIHBvc2l0aW9uIHRoZSB0b29sdGlwLFxuICogYW5kIHJlc2V0cyB0aGUgdG9vbHRpcCBwb3NpdGlvbiB0byB0aGUgb3JpZ2luYWwgaW50ZW50aW9uXG4gKiBpbiBjYXNlIHRoZSB3aW5kb3cgaXMgcmVzaXplZCBvciB0aGUgZWxlbWVudCBpcyBtb3ZlZCB0aHJvdWdoXG4gKiBET00gbWFuaXB1bGF0aW9uLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdG9vbHRpcEJvZHkgLSBUaGUgYm9keSBvZiB0aGUgdG9vbHRpcFxuICovXG5jb25zdCBoaWRlVG9vbFRpcCA9ICh0b29sdGlwQm9keSkgPT4ge1xuICB0b29sdGlwQm9keS5jbGFzc0xpc3QucmVtb3ZlKFZJU0lCTEVfQ0xBU1MpO1xuICB0b29sdGlwQm9keS5jbGFzc0xpc3QucmVtb3ZlKFNFVF9DTEFTUyk7XG4gIHRvb2x0aXBCb2R5LmNsYXNzTGlzdC5yZW1vdmUoQURKVVNUX1dJRFRIX0NMQVNTKTtcbiAgdG9vbHRpcEJvZHkuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xufTtcblxuLyoqXG4gKiBTZXR1cCB0aGUgdG9vbHRpcCBjb21wb25lbnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRvb2x0aXBUcmlnZ2VyIFRoZSBlbGVtZW50IHRoYXQgY3JlYXRlcyB0aGUgdG9vbHRpcFxuICovXG5jb25zdCBzZXRVcEF0dHJpYnV0ZXMgPSAodG9vbHRpcFRyaWdnZXIpID0+IHtcbiAgY29uc3QgdG9vbHRpcElEID0gYHRvb2x0aXAtJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA5MDAwMDApICsgMTAwMDAwfWA7XG4gIGNvbnN0IHRvb2x0aXBDb250ZW50ID0gdG9vbHRpcFRyaWdnZXIuZ2V0QXR0cmlidXRlKFwidGl0bGVcIik7XG4gIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgY29uc3QgdG9vbHRpcEJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgY29uc3QgcG9zaXRpb24gPSB0b29sdGlwVHJpZ2dlci5nZXRBdHRyaWJ1dGUoXCJkYXRhLXBvc2l0aW9uXCIpXG4gICAgPyB0b29sdGlwVHJpZ2dlci5nZXRBdHRyaWJ1dGUoXCJkYXRhLXBvc2l0aW9uXCIpXG4gICAgOiBcInRvcFwiO1xuICBjb25zdCBhZGRpdGlvbmFsQ2xhc3NlcyA9IHRvb2x0aXBUcmlnZ2VyLmdldEF0dHJpYnV0ZShcImRhdGEtY2xhc3Nlc1wiKTtcblxuICAvLyBTZXQgdXAgdG9vbHRpcCBhdHRyaWJ1dGVzXG4gIHRvb2x0aXBUcmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZGVzY3JpYmVkYnlcIiwgdG9vbHRpcElEKTtcbiAgdG9vbHRpcFRyaWdnZXIuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCIwXCIpO1xuICB0b29sdGlwVHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBcIlwiKTtcbiAgdG9vbHRpcFRyaWdnZXIuY2xhc3NMaXN0LnJlbW92ZShUT09MVElQX0NMQVNTKTtcbiAgdG9vbHRpcFRyaWdnZXIuY2xhc3NMaXN0LmFkZChUT09MVElQX1RSSUdHRVJfQ0xBU1MpO1xuXG4gIC8vIGluc2VydCB3cmFwcGVyIGJlZm9yZSBlbCBpbiB0aGUgRE9NIHRyZWVcbiAgdG9vbHRpcFRyaWdnZXIucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgdG9vbHRpcFRyaWdnZXIpO1xuXG4gIC8vIHNldCB1cCB0aGUgd3JhcHBlclxuICB3cmFwcGVyLmFwcGVuZENoaWxkKHRvb2x0aXBUcmlnZ2VyKTtcbiAgd3JhcHBlci5jbGFzc0xpc3QuYWRkKFRPT0xUSVBfQ0xBU1MpO1xuICB3cmFwcGVyLmFwcGVuZENoaWxkKHRvb2x0aXBCb2R5KTtcblxuICAvLyBBcHBseSBhZGRpdGlvbmFsIGNsYXNzIG5hbWVzIHRvIHdyYXBwZXIgZWxlbWVudFxuICBpZiAoYWRkaXRpb25hbENsYXNzZXMpIHtcbiAgICBjb25zdCBjbGFzc2VzQXJyYXkgPSBhZGRpdGlvbmFsQ2xhc3Nlcy5zcGxpdChcIiBcIik7XG4gICAgY2xhc3Nlc0FycmF5LmZvckVhY2goKGNsYXNzbmFtZSkgPT4gd3JhcHBlci5jbGFzc0xpc3QuYWRkKGNsYXNzbmFtZSkpO1xuICB9XG5cbiAgLy8gc2V0IHVwIHRoZSB0b29sdGlwIGJvZHlcbiAgdG9vbHRpcEJvZHkuY2xhc3NMaXN0LmFkZChUT09MVElQX0JPRFlfQ0xBU1MpO1xuICB0b29sdGlwQm9keS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0b29sdGlwSUQpO1xuICB0b29sdGlwQm9keS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwidG9vbHRpcFwiKTtcbiAgdG9vbHRpcEJvZHkuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuXG4gIC8vIHBsYWNlIHRoZSB0ZXh0IGluIHRoZSB0b29sdGlwXG4gIHRvb2x0aXBCb2R5LnRleHRDb250ZW50ID0gdG9vbHRpcENvbnRlbnQ7XG5cbiAgcmV0dXJuIHsgdG9vbHRpcEJvZHksIHBvc2l0aW9uLCB0b29sdGlwQ29udGVudCwgd3JhcHBlciB9O1xufTtcblxuLy8gU2V0dXAgb3VyIGZ1bmN0aW9uIHRvIHJ1biBvbiB2YXJpb3VzIGV2ZW50c1xuY29uc3QgdG9vbHRpcCA9IGJlaGF2aW9yKFxuICB7fSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgc2VsZWN0KFRPT0xUSVAsIHJvb3QpLmZvckVhY2goKHRvb2x0aXBUcmlnZ2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdG9vbHRpcEJvZHksIHBvc2l0aW9uLCB0b29sdGlwQ29udGVudCwgd3JhcHBlciB9ID1cbiAgICAgICAgICBzZXRVcEF0dHJpYnV0ZXModG9vbHRpcFRyaWdnZXIpO1xuXG4gICAgICAgIGlmICh0b29sdGlwQ29udGVudCkge1xuICAgICAgICAgIC8vIExpc3RlbmVycyBmb3Igc2hvd2luZyBhbmQgaGlkaW5nIHRoZSB0b29sdGlwXG4gICAgICAgICAgYWRkTGlzdGVuZXJNdWx0aSh0b29sdGlwVHJpZ2dlciwgXCJtb3VzZWVudGVyIGZvY3VzXCIsICgpID0+IHtcbiAgICAgICAgICAgIHNob3dUb29sVGlwKHRvb2x0aXBCb2R5LCB0b29sdGlwVHJpZ2dlciwgcG9zaXRpb24sIHdyYXBwZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gS2V5ZG93biBoZXJlIHByZXZlbnRzIHRvb2x0aXBzIGZyb20gYmVpbmcgcmVhZCB0d2ljZSBieVxuICAgICAgICAgIC8vIHNjcmVlbiByZWFkZXIuIEFsc28gYWxsb3dzIGVzY2FwZSBrZXkgdG8gY2xvc2UgaXRcbiAgICAgICAgICAvLyAoYWxvbmcgd2l0aCBhbnkgb3RoZXIuKVxuICAgICAgICAgIGFkZExpc3RlbmVyTXVsdGkodG9vbHRpcFRyaWdnZXIsIFwibW91c2VsZWF2ZSBibHVyIGtleWRvd25cIiwgKCkgPT4ge1xuICAgICAgICAgICAgaGlkZVRvb2xUaXAodG9vbHRpcEJvZHkpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHRocm93IGVycm9yIG9yIGxldCBvdGhlciB0b29sdGlwcyBvbiBwYWdlIGZ1bmN0aW9uP1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvb2x0aXA7XG4iLCJjb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZShcIi4uL3V0aWxzL3ZhbGlkYXRlLWlucHV0XCIpO1xuXG5mdW5jdGlvbiBjaGFuZ2UoKSB7XG4gIHZhbGlkYXRlKHRoaXMpO1xufVxuXG5jb25zdCB2YWxpZGF0b3IgPSBiZWhhdmlvcih7XG4gIFwia2V5dXAgY2hhbmdlXCI6IHtcbiAgICBcImlucHV0W2RhdGEtdmFsaWRhdGlvbi1lbGVtZW50XVwiOiBjaGFuZ2UsXG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB2YWxpZGF0b3I7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgcHJlZml4OiBcInVzYVwiLFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBUaGlzIHVzZWQgdG8gYmUgY29uZGl0aW9uYWxseSBkZXBlbmRlbnQgb24gd2hldGhlciB0aGVcbiAgLy8gYnJvd3NlciBzdXBwb3J0ZWQgdG91Y2ggZXZlbnRzOyBpZiBpdCBkaWQsIGBDTElDS2Agd2FzIHNldCB0b1xuICAvLyBgdG91Y2hzdGFydGAuICBIb3dldmVyLCB0aGlzIGhhZCBkb3duc2lkZXM6XG4gIC8vXG4gIC8vICogSXQgcHJlLWVtcHRlZCBtb2JpbGUgYnJvd3NlcnMnIGRlZmF1bHQgYmVoYXZpb3Igb2YgZGV0ZWN0aW5nXG4gIC8vICAgd2hldGhlciBhIHRvdWNoIHR1cm5lZCBpbnRvIGEgc2Nyb2xsLCB0aGVyZWJ5IHByZXZlbnRpbmdcbiAgLy8gICB1c2VycyBmcm9tIHVzaW5nIHNvbWUgb2Ygb3VyIGNvbXBvbmVudHMgYXMgc2Nyb2xsIHN1cmZhY2VzLlxuICAvL1xuICAvLyAqIFNvbWUgZGV2aWNlcywgc3VjaCBhcyB0aGUgTWljcm9zb2Z0IFN1cmZhY2UgUHJvLCBzdXBwb3J0ICpib3RoKlxuICAvLyAgIHRvdWNoIGFuZCBjbGlja3MuIFRoaXMgbWVhbnQgdGhlIGNvbmRpdGlvbmFsIGVmZmVjdGl2ZWx5IGRyb3BwZWRcbiAgLy8gICBzdXBwb3J0IGZvciB0aGUgdXNlcidzIG1vdXNlLCBmcnVzdHJhdGluZyB1c2VycyB3aG8gcHJlZmVycmVkXG4gIC8vICAgaXQgb24gdGhvc2Ugc3lzdGVtcy5cbiAgQ0xJQ0s6IFwiY2xpY2tcIixcbn07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBjb25zaXN0ZW50LXJldHVybiAqL1xuLyogZXNsaW50LWRpc2FibGUgZnVuYy1uYW1lcyAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIGZhbHNlO1xuXG4gIGZ1bmN0aW9uIEN1c3RvbUV2ZW50KGV2ZW50LCBfcGFyYW1zKSB7XG4gICAgY29uc3QgcGFyYW1zID0gX3BhcmFtcyB8fCB7XG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgZGV0YWlsOiBudWxsLFxuICAgIH07XG4gICAgY29uc3QgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KFxuICAgICAgZXZlbnQsXG4gICAgICBwYXJhbXMuYnViYmxlcyxcbiAgICAgIHBhcmFtcy5jYW5jZWxhYmxlLFxuICAgICAgcGFyYW1zLmRldGFpbFxuICAgICk7XG4gICAgcmV0dXJuIGV2dDtcbiAgfVxuXG4gIHdpbmRvdy5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50O1xufSkoKTtcbiIsImNvbnN0IGVscHJvdG8gPSB3aW5kb3cuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuY29uc3QgSElEREVOID0gXCJoaWRkZW5cIjtcblxuaWYgKCEoSElEREVOIGluIGVscHJvdG8pKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbHByb3RvLCBISURERU4sIHtcbiAgICBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXNBdHRyaWJ1dGUoSElEREVOKTtcbiAgICB9LFxuICAgIHNldCh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKEhJRERFTiwgXCJcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShISURERU4pO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xufVxuIiwiLy8gcG9seWZpbGxzIEhUTUxFbGVtZW50LnByb3RvdHlwZS5jbGFzc0xpc3QgYW5kIERPTVRva2VuTGlzdFxucmVxdWlyZShcImNsYXNzbGlzdC1wb2x5ZmlsbFwiKTtcbi8vIHBvbHlmaWxscyBIVE1MRWxlbWVudC5wcm90b3R5cGUuaGlkZGVuXG5yZXF1aXJlKFwiLi9lbGVtZW50LWhpZGRlblwiKTtcbi8vIHBvbHlmaWxscyBOdW1iZXIuaXNOYU4oKVxucmVxdWlyZShcIi4vbnVtYmVyLWlzLW5hblwiKTtcbi8vIHBvbHlmaWxscyBDdXN0b21FdmVudFxucmVxdWlyZShcIi4vY3VzdG9tLWV2ZW50XCIpO1xuLy8gcG9seWZpbGxzIHN2ZzRldmVyeWJvZHlcbnJlcXVpcmUoXCIuL3N2ZzRldmVyeWJvZHlcIik7XG5cbiIsIk51bWJlci5pc05hTiA9XG4gIE51bWJlci5pc05hTiB8fFxuICBmdW5jdGlvbiBpc05hTihpbnB1dCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICByZXR1cm4gdHlwZW9mIGlucHV0ID09PSBcIm51bWJlclwiICYmIGlucHV0ICE9PSBpbnB1dDtcbiAgfTtcbiIsIi8qIGVzbGludC1kaXNhYmxlICovXG4hZnVuY3Rpb24oZmFjdG9yeSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbn0oZnVuY3Rpb24oKSB7XG4gIC8qISBzdmc0ZXZlcnlib2R5IHYyLjEuOSB8IGdpdGh1Yi5jb20vam9uYXRoYW50bmVhbC9zdmc0ZXZlcnlib2R5ICovXG4gIGZ1bmN0aW9uIGVtYmVkKHBhcmVudCwgc3ZnLCB0YXJnZXQsIHVzZSkge1xuICAgICAgLy8gaWYgdGhlIHRhcmdldCBleGlzdHNcbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAvLyBjcmVhdGUgYSBkb2N1bWVudCBmcmFnbWVudCB0byBob2xkIHRoZSBjb250ZW50cyBvZiB0aGUgdGFyZ2V0XG4gICAgICAgICAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLCB2aWV3Qm94ID0gIXN2Zy5oYXNBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIpICYmIHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIpO1xuICAgICAgICAgIC8vIGNvbmRpdGlvbmFsbHkgc2V0IHRoZSB2aWV3Qm94IG9uIHRoZSBzdmdcbiAgICAgICAgICB2aWV3Qm94ICYmIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIHZpZXdCb3gpO1xuICAgICAgICAgIC8vIGNvcHkgdGhlIGNvbnRlbnRzIG9mIHRoZSBjbG9uZSBpbnRvIHRoZSBmcmFnbWVudFxuICAgICAgICAgIGZvciAoLy8gY2xvbmUgdGhlIHRhcmdldFxuICAgICAgICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUgPyBkb2N1bWVudC5pbXBvcnROb2RlKHRhcmdldCwgITApIDogdGFyZ2V0LmNsb25lTm9kZSghMCksIGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnLm5hbWVzcGFjZVVSSSB8fCBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiZ1wiKTsgY2xvbmUuY2hpbGROb2Rlcy5sZW5ndGg7ICkge1xuICAgICAgICAgICAgICBnLmFwcGVuZENoaWxkKGNsb25lLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodXNlKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyB1c2UuYXR0cmlidXRlcy5sZW5ndGggPiBpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBhdHRyID0gdXNlLmF0dHJpYnV0ZXNbaV07XG4gICAgICAgICAgICAgICAgICBcInhsaW5rOmhyZWZcIiAhPT0gYXR0ci5uYW1lICYmIFwiaHJlZlwiICE9PSBhdHRyLm5hbWUgJiYgZy5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChnKSwgLy8gYXBwZW5kIHRoZSBmcmFnbWVudCBpbnRvIHRoZSBzdmdcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgfVxuICB9XG4gIGZ1bmN0aW9uIGxvYWRyZWFkeXN0YXRlY2hhbmdlKHhociwgdXNlKSB7XG4gICAgICAvLyBsaXN0ZW4gdG8gY2hhbmdlcyBpbiB0aGUgcmVxdWVzdFxuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIGlmIHRoZSByZXF1ZXN0IGlzIHJlYWR5XG4gICAgICAgICAgaWYgKDQgPT09IHhoci5yZWFkeVN0YXRlKSB7XG4gICAgICAgICAgICAgIC8vIGdldCB0aGUgY2FjaGVkIGh0bWwgZG9jdW1lbnRcbiAgICAgICAgICAgICAgdmFyIGNhY2hlZERvY3VtZW50ID0geGhyLl9jYWNoZWREb2N1bWVudDtcbiAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoZSBjYWNoZWQgaHRtbCBkb2N1bWVudCBiYXNlZCBvbiB0aGUgeGhyIHJlc3BvbnNlXG4gICAgICAgICAgICAgIGNhY2hlZERvY3VtZW50IHx8IChjYWNoZWREb2N1bWVudCA9IHhoci5fY2FjaGVkRG9jdW1lbnQgPSBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoXCJcIiksXG4gICAgICAgICAgICAgIGNhY2hlZERvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dCwgLy8gZW5zdXJlIGRvbWFpbnMgYXJlIHRoZSBzYW1lLCBvdGhlcndpc2Ugd2UnbGwgaGF2ZSBpc3N1ZXMgYXBwZW5kaW5nIHRoZVxuICAgICAgICAgICAgICAvLyBlbGVtZW50IGluIElFIDExXG4gICAgICAgICAgICAgIGNhY2hlZERvY3VtZW50LmRvbWFpbiAhPT0gZG9jdW1lbnQuZG9tYWluICYmIChjYWNoZWREb2N1bWVudC5kb21haW4gPSBkb2N1bWVudC5kb21haW4pLFxuICAgICAgICAgICAgICB4aHIuX2NhY2hlZFRhcmdldCA9IHt9KSwgLy8gY2xlYXIgdGhlIHhociBlbWJlZHMgbGlzdCBhbmQgZW1iZWQgZWFjaCBpdGVtXG4gICAgICAgICAgICAgIHhoci5fZW1iZWRzLnNwbGljZSgwKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBjYWNoZWQgdGFyZ2V0XG4gICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0geGhyLl9jYWNoZWRUYXJnZXRbaXRlbS5pZF07XG4gICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhlIGNhY2hlZCB0YXJnZXRcbiAgICAgICAgICAgICAgICAgIHRhcmdldCB8fCAodGFyZ2V0ID0geGhyLl9jYWNoZWRUYXJnZXRbaXRlbS5pZF0gPSBjYWNoZWREb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtLmlkKSksXG4gICAgICAgICAgICAgICAgICAvLyBlbWJlZCB0aGUgdGFyZ2V0IGludG8gdGhlIHN2Z1xuICAgICAgICAgICAgICAgICAgZW1iZWQoaXRlbS5wYXJlbnQsIGl0ZW0uc3ZnLCB0YXJnZXQsIHVzZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgIH0sIC8vIHRlc3QgdGhlIHJlYWR5IHN0YXRlIGNoYW5nZSBpbW1lZGlhdGVseVxuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSgpO1xuICB9XG4gIGZ1bmN0aW9uIHN2ZzRldmVyeWJvZHkocmF3b3B0cykge1xuICAgICAgZnVuY3Rpb24gb25pbnRlcnZhbCgpIHtcbiAgICAgICAgICAvLyBpZiBhbGwgPHVzZT5zIGluIHRoZSBhcnJheSBhcmUgYmVpbmcgYnlwYXNzZWQsIGRvbid0IHByb2NlZWQuXG4gICAgICAgICAgaWYgKG51bWJlck9mU3ZnVXNlRWxlbWVudHNUb0J5cGFzcyAmJiB1c2VzLmxlbmd0aCAtIG51bWJlck9mU3ZnVXNlRWxlbWVudHNUb0J5cGFzcyA8PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB2b2lkIHJlcXVlc3RBbmltYXRpb25GcmFtZShvbmludGVydmFsLCA2Nyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSA8dXNlPnMgdG8gcHJvY2VzcywgcHJvY2VlZC5cbiAgICAgICAgICAvLyByZXNldCB0aGUgYnlwYXNzIGNvdW50ZXIsIHNpbmNlIHRoZSBjb3VudGVyIHdpbGwgYmUgaW5jcmVtZW50ZWQgZm9yIGV2ZXJ5IGJ5cGFzc2VkIGVsZW1lbnQsXG4gICAgICAgICAgLy8gZXZlbiBvbmVzIHRoYXQgd2VyZSBjb3VudGVkIGJlZm9yZS5cbiAgICAgICAgICBudW1iZXJPZlN2Z1VzZUVsZW1lbnRzVG9CeXBhc3MgPSAwO1xuICAgICAgICAgIC8vIHdoaWxlIHRoZSBpbmRleCBleGlzdHMgaW4gdGhlIGxpdmUgPHVzZT4gY29sbGVjdGlvblxuICAgICAgICAgIGZvciAoLy8gZ2V0IHRoZSBjYWNoZWQgPHVzZT4gaW5kZXhcbiAgICAgICAgICB2YXIgaW5kZXggPSAwOyBpbmRleCA8IHVzZXMubGVuZ3RoOyApIHtcbiAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBjdXJyZW50IDx1c2U+XG4gICAgICAgICAgICAgIHZhciB1c2UgPSB1c2VzW2luZGV4XSwgcGFyZW50ID0gdXNlLnBhcmVudE5vZGUsIHN2ZyA9IGdldFNWR0FuY2VzdG9yKHBhcmVudCksIHNyYyA9IHVzZS5nZXRBdHRyaWJ1dGUoXCJ4bGluazpocmVmXCIpIHx8IHVzZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpO1xuICAgICAgICAgICAgICBpZiAoIXNyYyAmJiBvcHRzLmF0dHJpYnV0ZU5hbWUgJiYgKHNyYyA9IHVzZS5nZXRBdHRyaWJ1dGUob3B0cy5hdHRyaWJ1dGVOYW1lKSksXG4gICAgICAgICAgICAgIHN2ZyAmJiBzcmMpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChwb2x5ZmlsbCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy52YWxpZGF0ZSB8fCBvcHRzLnZhbGlkYXRlKHNyYywgc3ZnLCB1c2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgPHVzZT4gZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQodXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGFyc2UgdGhlIHNyYyBhbmQgZ2V0IHRoZSB1cmwgYW5kIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcmNTcGxpdCA9IHNyYy5zcGxpdChcIiNcIiksIHVybCA9IHNyY1NwbGl0LnNoaWZ0KCksIGlkID0gc3JjU3BsaXQuam9pbihcIiNcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBsaW5rIGlzIGV4dGVybmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cmwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIGNhY2hlZCB4aHIgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhociA9IHJlcXVlc3RzW3VybF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhlIHhociByZXF1ZXN0IGV4aXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyIHx8ICh4aHIgPSByZXF1ZXN0c1t1cmxdID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksIHhoci5vcGVuKFwiR0VUXCIsIHVybCksIHhoci5zZW5kKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuX2VtYmVkcyA9IFtdKSwgLy8gYWRkIHRoZSBzdmcgYW5kIGlkIGFzIGFuIGl0ZW0gdG8gdGhlIHhociBlbWJlZHMgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLl9lbWJlZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBwYXJlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnOiBzdmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgLy8gcHJlcGFyZSB0aGUgeGhyIHJlYWR5IHN0YXRlIGNoYW5nZSBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZHJlYWR5c3RhdGVjaGFuZ2UoeGhyLCB1c2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1iZWQgdGhlIGxvY2FsIGlkIGludG8gdGhlIHN2Z1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1iZWQocGFyZW50LCBzdmcsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSwgdXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIHRoZSBpbmRleCB3aGVuIHRoZSBwcmV2aW91cyB2YWx1ZSB3YXMgbm90IFwidmFsaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICArK2luZGV4LCArK251bWJlck9mU3ZnVXNlRWxlbWVudHNUb0J5cGFzcztcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBpbmNyZWFzZSB0aGUgaW5kZXggd2hlbiB0aGUgcHJldmlvdXMgdmFsdWUgd2FzIG5vdCBcInZhbGlkXCJcbiAgICAgICAgICAgICAgICAgICsraW5kZXg7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY29udGludWUgdGhlIGludGVydmFsXG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG9uaW50ZXJ2YWwsIDY3KTtcbiAgICAgIH1cbiAgICAgIHZhciBwb2x5ZmlsbCwgb3B0cyA9IE9iamVjdChyYXdvcHRzKSwgbmV3ZXJJRVVBID0gL1xcYlRyaWRlbnRcXC9bNTY3XVxcYnxcXGJNU0lFICg/Ojl8MTApXFwuMFxcYi8sIHdlYmtpdFVBID0gL1xcYkFwcGxlV2ViS2l0XFwvKFxcZCspXFxiLywgb2xkZXJFZGdlVUEgPSAvXFxiRWRnZVxcLzEyXFwuKFxcZCspXFxiLywgZWRnZVVBID0gL1xcYkVkZ2VcXC8uKFxcZCspXFxiLywgaW5JZnJhbWUgPSB3aW5kb3cudG9wICE9PSB3aW5kb3cuc2VsZjtcbiAgICAgIHBvbHlmaWxsID0gXCJwb2x5ZmlsbFwiIGluIG9wdHMgPyBvcHRzLnBvbHlmaWxsIDogbmV3ZXJJRVVBLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2gob2xkZXJFZGdlVUEpIHx8IFtdKVsxXSA8IDEwNTQ3IHx8IChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKHdlYmtpdFVBKSB8fCBbXSlbMV0gPCA1MzcgfHwgZWRnZVVBLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgaW5JZnJhbWU7XG4gICAgICAvLyBjcmVhdGUgeGhyIHJlcXVlc3RzIG9iamVjdFxuICAgICAgdmFyIHJlcXVlc3RzID0ge30sIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgc2V0VGltZW91dCwgdXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidXNlXCIpLCBudW1iZXJPZlN2Z1VzZUVsZW1lbnRzVG9CeXBhc3MgPSAwO1xuICAgICAgLy8gY29uZGl0aW9uYWxseSBzdGFydCB0aGUgaW50ZXJ2YWwgaWYgdGhlIHBvbHlmaWxsIGlzIGFjdGl2ZVxuICAgICAgcG9seWZpbGwgJiYgb25pbnRlcnZhbCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFNWR0FuY2VzdG9yKG5vZGUpIHtcbiAgICAgIGZvciAodmFyIHN2ZyA9IG5vZGU7IFwic3ZnXCIgIT09IHN2Zy5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICYmIChzdmcgPSBzdmcucGFyZW50Tm9kZSk7ICkge31cbiAgICAgIHJldHVybiBzdmc7XG4gIH1cbiAgcmV0dXJuIHN2ZzRldmVyeWJvZHk7XG59KTtcbiIsImNvbnN0IGRvbXJlYWR5ID0gcmVxdWlyZShcImRvbXJlYWR5XCIpO1xuXG53aW5kb3cudXN3ZHNQcmVzZW50ID0gdHJ1ZTsgLy8gR0xPQkFMIHZhcmlhYmxlIHRvIGluZGljYXRlIHRoYXQgdGhlIHVzd2RzLmpzIGhhcyBsb2FkZWQgaW4gdGhlIERPTS5cblxuLyoqXG4gKiBUaGUgJ3BvbHlmaWxscycgZGVmaW5lIGtleSBFQ01BU2NyaXB0IDUgbWV0aG9kcyB0aGF0IG1heSBiZSBtaXNzaW5nIGZyb21cbiAqIG9sZGVyIGJyb3dzZXJzLCBzbyBtdXN0IGJlIGxvYWRlZCBmaXJzdC5cbiAqL1xucmVxdWlyZShcIi4vcG9seWZpbGxzXCIpO1xuXG5jb25zdCB1c3dkcyA9IHJlcXVpcmUoXCIuL2NvbmZpZ1wiKTtcblxuY29uc3QgY29tcG9uZW50cyA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHNcIik7XG5jb25zdCBzdmc0ZXZlcnlib2R5ID0gcmVxdWlyZShcIi4vcG9seWZpbGxzL3N2ZzRldmVyeWJvZHlcIik7XG5cbnVzd2RzLmNvbXBvbmVudHMgPSBjb21wb25lbnRzO1xuXG5kb21yZWFkeSgoKSA9PiB7XG4gIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmJvZHk7XG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IGJlaGF2aW9yID0gY29tcG9uZW50c1trZXldO1xuICAgIGJlaGF2aW9yLm9uKHRhcmdldCk7XG4gIH0pO1xuICBzdmc0ZXZlcnlib2R5KCk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB1c3dkczsiLCJtb2R1bGUuZXhwb3J0cyA9IChodG1sRG9jdW1lbnQgPSBkb2N1bWVudCkgPT4gaHRtbERvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4iLCJjb25zdCBhc3NpZ24gPSByZXF1aXJlKFwib2JqZWN0LWFzc2lnblwiKTtcbmNvbnN0IEJlaGF2aW9yID0gcmVxdWlyZShcInJlY2VwdG9yL2JlaGF2aW9yXCIpO1xuXG4vKipcbiAqIEBuYW1lIHNlcXVlbmNlXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBzZXEgYW4gYXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJuIHsgY2xvc3VyZSB9IGNhbGxIb29rc1xuICovXG4vLyBXZSB1c2UgYSBuYW1lZCBmdW5jdGlvbiBoZXJlIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBpbmhlcml0IGl0cyBsZXhpY2FsIHNjb3BlXG4vLyBmcm9tIHRoZSBiZWhhdmlvciBwcm9wcyBvYmplY3QsIG5vdCBmcm9tIHRoZSBtb2R1bGVcbmNvbnN0IHNlcXVlbmNlID0gKC4uLnNlcSkgPT5cbiAgZnVuY3Rpb24gY2FsbEhvb2tzKHRhcmdldCA9IGRvY3VtZW50LmJvZHkpIHtcbiAgICBzZXEuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbbWV0aG9kXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXNbbWV0aG9kXS5jYWxsKHRoaXMsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbi8qKlxuICogQG5hbWUgYmVoYXZpb3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudHNcbiAqIEBwYXJhbSB7b2JqZWN0P30gcHJvcHNcbiAqIEByZXR1cm4ge3JlY2VwdG9yLmJlaGF2aW9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChldmVudHMsIHByb3BzKSA9PlxuICBCZWhhdmlvcihcbiAgICBldmVudHMsXG4gICAgYXNzaWduKFxuICAgICAge1xuICAgICAgICBvbjogc2VxdWVuY2UoXCJpbml0XCIsIFwiYWRkXCIpLFxuICAgICAgICBvZmY6IHNlcXVlbmNlKFwidGVhcmRvd25cIiwgXCJyZW1vdmVcIiksXG4gICAgICB9LFxuICAgICAgcHJvcHNcbiAgICApXG4gICk7XG4iLCJjb25zdCBhc3NpZ24gPSByZXF1aXJlKFwib2JqZWN0LWFzc2lnblwiKTtcbmNvbnN0IHsga2V5bWFwIH0gPSByZXF1aXJlKFwicmVjZXB0b3JcIik7XG5jb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yXCIpO1xuY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4vc2VsZWN0XCIpO1xuY29uc3QgYWN0aXZlRWxlbWVudCA9IHJlcXVpcmUoXCIuL2FjdGl2ZS1lbGVtZW50XCIpO1xuXG5jb25zdCBGT0NVU0FCTEUgPVxuICAnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgW3RhYmluZGV4PVwiMFwiXSwgW2NvbnRlbnRlZGl0YWJsZV0nO1xuXG5jb25zdCB0YWJIYW5kbGVyID0gKGNvbnRleHQpID0+IHtcbiAgY29uc3QgZm9jdXNhYmxlRWxlbWVudHMgPSBzZWxlY3QoRk9DVVNBQkxFLCBjb250ZXh0KTtcbiAgY29uc3QgZmlyc3RUYWJTdG9wID0gZm9jdXNhYmxlRWxlbWVudHNbMF07XG4gIGNvbnN0IGxhc3RUYWJTdG9wID0gZm9jdXNhYmxlRWxlbWVudHNbZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMV07XG5cbiAgLy8gU3BlY2lhbCBydWxlcyBmb3Igd2hlbiB0aGUgdXNlciBpcyB0YWJiaW5nIGZvcndhcmQgZnJvbSB0aGUgbGFzdCBmb2N1c2FibGUgZWxlbWVudCxcbiAgLy8gb3Igd2hlbiB0YWJiaW5nIGJhY2t3YXJkcyBmcm9tIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudFxuICBmdW5jdGlvbiB0YWJBaGVhZChldmVudCkge1xuICAgIGlmIChhY3RpdmVFbGVtZW50KCkgPT09IGxhc3RUYWJTdG9wKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZmlyc3RUYWJTdG9wLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdGFiQmFjayhldmVudCkge1xuICAgIGlmIChhY3RpdmVFbGVtZW50KCkgPT09IGZpcnN0VGFiU3RvcCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhc3RUYWJTdG9wLmZvY3VzKCk7XG4gICAgfVxuICAgIC8vIFRoaXMgY2hlY2tzIGlmIHlvdSB3YW50IHRvIHNldCB0aGUgaW5pdGlhbCBmb2N1cyB0byBhIGNvbnRhaW5lclxuICAgIC8vIGluc3RlYWQgb2YgYW4gZWxlbWVudCB3aXRoaW4sIGFuZCB0aGUgdXNlciB0YWJzIGJhY2suIFxuICAgIC8vIFRoZW4gd2Ugc2V0IHRoZSBmb2N1cyB0byB0aGUgZmlyc3RcbiAgICBlbHNlIGlmICghZm9jdXNhYmxlRWxlbWVudHMuaW5jbHVkZXMoYWN0aXZlRWxlbWVudCgpKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGZpcnN0VGFiU3RvcC5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZmlyc3RUYWJTdG9wLFxuICAgIGxhc3RUYWJTdG9wLFxuICAgIHRhYkFoZWFkLFxuICAgIHRhYkJhY2ssXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChjb250ZXh0LCBhZGRpdGlvbmFsS2V5QmluZGluZ3MgPSB7fSkgPT4ge1xuICBjb25zdCB0YWJFdmVudEhhbmRsZXIgPSB0YWJIYW5kbGVyKGNvbnRleHQpO1xuICBjb25zdCBiaW5kaW5ncyA9IGFkZGl0aW9uYWxLZXlCaW5kaW5ncztcbiAgY29uc3QgeyBFc2MsIEVzY2FwZSB9ID0gYmluZGluZ3M7XG5cbiAgaWYgKEVzY2FwZSAmJiAhRXNjKSBiaW5kaW5ncy5Fc2MgPSBFc2NhcGU7XG5cbiAgLy8gIFRPRE86IEluIHRoZSBmdXR1cmUsIGxvb3Agb3ZlciBhZGRpdGlvbmFsIGtleWJpbmRpbmdzIGFuZCBwYXNzIGFuIGFycmF5XG4gIC8vIG9mIGZ1bmN0aW9ucywgaWYgbmVjZXNzYXJ5LCB0byB0aGUgbWFwIGtleXMuIFRoZW4gcGVvcGxlIGltcGxlbWVudGluZ1xuICAvLyB0aGUgZm9jdXMgdHJhcCBjb3VsZCBwYXNzIGNhbGxiYWNrcyB0byBmaXJlIHdoZW4gdGFiYmluZ1xuICBjb25zdCBrZXlNYXBwaW5ncyA9IGtleW1hcChcbiAgICBhc3NpZ24oXG4gICAgICB7XG4gICAgICAgIFRhYjogdGFiRXZlbnRIYW5kbGVyLnRhYkFoZWFkLFxuICAgICAgICBcIlNoaWZ0K1RhYlwiOiB0YWJFdmVudEhhbmRsZXIudGFiQmFjayxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsS2V5QmluZGluZ3NcbiAgICApXG4gICk7XG5cbiAgY29uc3QgZm9jdXNUcmFwID0gYmVoYXZpb3IoXG4gICAge1xuICAgICAga2V5ZG93bjoga2V5TWFwcGluZ3MsXG4gICAgfSxcbiAgICB7XG4gICAgICBpbml0KCkge1xuICAgICAgICAvLyBUT0RPOiBpcyB0aGlzIGRlc2lyZWFibGUgYmVoYXZpb3I/IFNob3VsZCB0aGUgdHJhcCBhbHdheXMgZG8gdGhpcyBieSBkZWZhdWx0IG9yIHNob3VsZFxuICAgICAgICAvLyB0aGUgY29tcG9uZW50IGdldHRpbmcgZGVjb3JhdGVkIGhhbmRsZSB0aGlzP1xuICAgICAgICBpZiAodGFiRXZlbnRIYW5kbGVyLmZpcnN0VGFiU3RvcCl7XG4gICAgICAgICAgdGFiRXZlbnRIYW5kbGVyLmZpcnN0VGFiU3RvcC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlKGlzQWN0aXZlKSB7XG4gICAgICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgICAgIHRoaXMub24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9mZigpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH1cbiAgKTtcblxuICByZXR1cm4gZm9jdXNUcmFwO1xufTtcbiIsIi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS83NTU3NDMzXG5mdW5jdGlvbiBpc0VsZW1lbnRJblZpZXdwb3J0KFxuICBlbCxcbiAgd2luID0gd2luZG93LFxuICBkb2NFbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuKSB7XG4gIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICByZXR1cm4gKFxuICAgIHJlY3QudG9wID49IDAgJiZcbiAgICByZWN0LmxlZnQgPj0gMCAmJlxuICAgIHJlY3QuYm90dG9tIDw9ICh3aW4uaW5uZXJIZWlnaHQgfHwgZG9jRWwuY2xpZW50SGVpZ2h0KSAmJlxuICAgIHJlY3QucmlnaHQgPD0gKHdpbi5pbm5lcldpZHRoIHx8IGRvY0VsLmNsaWVudFdpZHRoKVxuICApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRWxlbWVudEluVmlld3BvcnQ7XG4iLCIvLyBpT1MgZGV0ZWN0aW9uIGZyb206IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzkwMzk4ODUvMTc3NzEwXG5mdW5jdGlvbiBpc0lvc0RldmljZSgpIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goLyhpUG9kfGlQaG9uZXxpUGFkKS9nKSB8fFxuICAgICAgKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gXCJNYWNJbnRlbFwiICYmIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDEpKSAmJlxuICAgICF3aW5kb3cuTVNTdHJlYW1cbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0lvc0RldmljZTtcbiIsIi8qIGVzbGludC1kaXNhYmxlICovXG4vKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlICovXG5cbi8qKlxuICogQSBzaW1wbGUgbGlicmFyeSB0byBoZWxwIHlvdSBlc2NhcGUgSFRNTCB1c2luZyB0ZW1wbGF0ZSBzdHJpbmdzLlxuICpcbiAqIEl0J3MgdGhlIGNvdW50ZXJwYXJ0IHRvIG91ciBlc2xpbnQgXCJuby11bnNhZmUtaW5uZXJodG1sXCIgcGx1Z2luIHRoYXQgaGVscHMgdXNcbiAqIGF2b2lkIHVuc2FmZSBjb2RpbmcgcHJhY3RpY2VzLlxuICogQSBmdWxsIHdyaXRlLXVwIG9mIHRoZSBIb3dzIGFuZCBXaHlzIGFyZSBkb2N1bWVudGVkXG4gKiBmb3IgZGV2ZWxvcGVycyBhdFxuICogIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL0ZpcmVmb3hfT1MvU2VjdXJpdHkvU2VjdXJpdHlfQXV0b21hdGlvblxuICogd2l0aCBhZGRpdGlvbmFsIGJhY2tncm91bmQgaW5mb3JtYXRpb24gYW5kIGRlc2lnbiBkb2NzIGF0XG4gKiAgaHR0cHM6Ly93aWtpLm1vemlsbGEub3JnL1VzZXI6RmJyYXVuL0dhaWEvU2FmZWlubmVySFRNTFJvYWRtYXBcbiAqXG4gKi9cblxuIShmdW5jdGlvbiAoZmFjdG9yeSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbn0pKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBTYW5pdGl6ZXIgPSB7XG4gICAgX2VudGl0eTogL1smPD5cIicvXS9nLFxuXG4gICAgX2VudGl0aWVzOiB7XG4gICAgICAnJic6ICcmYW1wOycsXG4gICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICc+JzogJyZndDsnLFxuICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICAnXFwnJzogJyZhcG9zOycsXG4gICAgICAnLyc6ICcmI3gyRjsnXG4gICAgfSxcblxuICAgIGdldEVudGl0eTogZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBTYW5pdGl6ZXIuX2VudGl0aWVzW3NdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFc2NhcGVzIEhUTUwgZm9yIGFsbCB2YWx1ZXMgaW4gYSB0YWdnZWQgdGVtcGxhdGUgc3RyaW5nLlxuICAgICAqL1xuICAgIGVzY2FwZUhUTUw6IGZ1bmN0aW9uIChzdHJpbmdzKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gJyc7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgKz0gc3RyaW5nc1tpXTtcbiAgICAgICAgaWYgKGkgKyAxIDwgYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50c1tpICsgMV0gfHwgJyc7XG4gICAgICAgICAgcmVzdWx0ICs9IFN0cmluZyh2YWx1ZSkucmVwbGFjZShTYW5pdGl6ZXIuX2VudGl0eSxcbiAgICAgICAgICAgIFNhbml0aXplci5nZXRFbnRpdHkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFc2NhcGVzIEhUTUwgYW5kIHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0byBiZSB1c2VkIGR1cmluZyBET00gaW5zZXJ0aW9uXG4gICAgICovXG4gICAgY3JlYXRlU2FmZUhUTUw6IGZ1bmN0aW9uIChzdHJpbmdzKSB7XG4gICAgICB2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKTtcbiAgICAgIGZvciAodmFyIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIHZhbHVlc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIHZhciBlc2NhcGVkID0gU2FuaXRpemVyLmVzY2FwZUhUTUwuYXBwbHkoU2FuaXRpemVyLFxuICAgICAgICBbc3RyaW5nc10uY29uY2F0KHZhbHVlcykpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgX19odG1sOiBlc2NhcGVkLFxuICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiAnW29iamVjdCBXcmFwcGVkSFRNTE9iamVjdF0nO1xuICAgICAgICB9LFxuICAgICAgICBpbmZvOiAnVGhpcyBpcyBhIHdyYXBwZWQgSFRNTCBvYmplY3QuIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yJytcbiAgICAgICAgICAnZy9lbi1VUy9GaXJlZm94X09TL1NlY3VyaXR5L1NlY3VyaXR5X0F1dG9tYXRpb24gZm9yIG1vcmUuJ1xuICAgICAgfTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVud3JhcCBzYWZlIEhUTUwgY3JlYXRlZCBieSBjcmVhdGVTYWZlSFRNTCBvciBhIGN1c3RvbSByZXBsYWNlbWVudCB0aGF0XG4gICAgICogdW5kZXJ3ZW50IHNlY3VyaXR5IHJldmlldy5cbiAgICAgKi9cbiAgICB1bndyYXBTYWZlSFRNTDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgdmFyIGh0bWxPYmplY3RzID0gbmV3IEFycmF5KF9sZW4pO1xuICAgICAgZm9yICh2YXIgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgaHRtbE9iamVjdHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIHZhciBtYXJrdXBMaXN0ID0gaHRtbE9iamVjdHMubWFwKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqLl9faHRtbDtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1hcmt1cExpc3Quam9pbignJyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTYW5pdGl6ZXI7XG5cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRTY3JvbGxiYXJXaWR0aCgpIHtcbiAgLy8gQ3JlYXRpbmcgaW52aXNpYmxlIGNvbnRhaW5lclxuICBjb25zdCBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7IC8vIGZvcmNpbmcgc2Nyb2xsYmFyIHRvIGFwcGVhclxuICBvdXRlci5zdHlsZS5tc092ZXJmbG93U3R5bGUgPSAnc2Nyb2xsYmFyJzsgLy8gbmVlZGVkIGZvciBXaW5KUyBhcHBzXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xuXG4gIC8vIENyZWF0aW5nIGlubmVyIGVsZW1lbnQgYW5kIHBsYWNpbmcgaXQgaW4gdGhlIGNvbnRhaW5lclxuICBjb25zdCBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBvdXRlci5hcHBlbmRDaGlsZChpbm5lcik7XG4gIFxuICAvLyBDYWxjdWxhdGluZyBkaWZmZXJlbmNlIGJldHdlZW4gY29udGFpbmVyJ3MgZnVsbCB3aWR0aCBhbmQgdGhlIGNoaWxkIHdpZHRoXG4gIGNvbnN0IHNjcm9sbGJhcldpZHRoID0gYCR7KG91dGVyLm9mZnNldFdpZHRoIC0gaW5uZXIub2Zmc2V0V2lkdGgpfXB4YDtcblxuICAvLyBSZW1vdmluZyB0ZW1wb3JhcnkgZWxlbWVudHMgZnJvbSB0aGUgRE9NXG4gIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xuXG4gIHJldHVybiBzY3JvbGxiYXJXaWR0aDtcbn07XG4iLCIvKipcbiAqIEBuYW1lIGlzRWxlbWVudFxuICogQGRlc2MgcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gYXJndW1lbnQgaXMgYSBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNFbGVtZW50ID0gKHZhbHVlKSA9PlxuICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUubm9kZVR5cGUgPT09IDE7XG5cbi8qKlxuICogQG5hbWUgc2VsZWN0XG4gKiBAZGVzYyBzZWxlY3RzIGVsZW1lbnRzIGZyb20gdGhlIERPTSBieSBjbGFzcyBzZWxlY3RvciBvciBJRCBzZWxlY3Rvci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIFRoZSBzZWxlY3RvciB0byB0cmF2ZXJzZSB0aGUgRE9NIHdpdGguXG4gKiBAcGFyYW0ge0RvY3VtZW50fEhUTUxFbGVtZW50P30gY29udGV4dCAtIFRoZSBjb250ZXh0IHRvIHRyYXZlcnNlIHRoZSBET01cbiAqICAgaW4uIElmIG5vdCBwcm92aWRlZCwgaXQgZGVmYXVsdHMgdG8gdGhlIGRvY3VtZW50LlxuICogQHJldHVybiB7SFRNTEVsZW1lbnRbXX0gLSBBbiBhcnJheSBvZiBET00gbm9kZXMgb3IgYW4gZW1wdHkgYXJyYXkuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKHNlbGVjdG9yLCBjb250ZXh0KSA9PiB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBpZiAoIWNvbnRleHQgfHwgIWlzRWxlbWVudChjb250ZXh0KSkge1xuICAgIGNvbnRleHQgPSB3aW5kb3cuZG9jdW1lbnQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgfVxuXG4gIGNvbnN0IHNlbGVjdGlvbiA9IGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChzZWxlY3Rpb24pO1xufTtcbiIsIi8qKlxuICogRmxpcHMgZ2l2ZW4gSU5QVVQgZWxlbWVudHMgYmV0d2VlbiBtYXNrZWQgKGhpZGluZyB0aGUgZmllbGQgdmFsdWUpIGFuZCB1bm1hc2tlZFxuICogQHBhcmFtIHtBcnJheS5IVE1MRWxlbWVudH0gZmllbGRzIC0gQW4gYXJyYXkgb2YgSU5QVVQgZWxlbWVudHNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbWFzayAtIFdoZXRoZXIgdGhlIG1hc2sgc2hvdWxkIGJlIGFwcGxpZWQsIGhpZGluZyB0aGUgZmllbGQgdmFsdWVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZmllbGQsIG1hc2spID0+IHtcbiAgZmllbGQuc2V0QXR0cmlidXRlKFwiYXV0b2NhcGl0YWxpemVcIiwgXCJvZmZcIik7XG4gIGZpZWxkLnNldEF0dHJpYnV0ZShcImF1dG9jb3JyZWN0XCIsIFwib2ZmXCIpO1xuICBmaWVsZC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIG1hc2sgPyBcInBhc3N3b3JkXCIgOiBcInRleHRcIik7XG59O1xuIiwiY29uc3QgcmVzb2x2ZUlkUmVmcyA9IHJlcXVpcmUoXCJyZXNvbHZlLWlkLXJlZnNcIik7XG5jb25zdCB0b2dnbGVGaWVsZE1hc2sgPSByZXF1aXJlKFwiLi90b2dnbGUtZmllbGQtbWFza1wiKTtcblxuY29uc3QgQ09OVFJPTFMgPSBcImFyaWEtY29udHJvbHNcIjtcbmNvbnN0IFBSRVNTRUQgPSBcImFyaWEtcHJlc3NlZFwiO1xuY29uc3QgU0hPV19BVFRSID0gXCJkYXRhLXNob3ctdGV4dFwiO1xuY29uc3QgSElERV9BVFRSID0gXCJkYXRhLWhpZGUtdGV4dFwiO1xuXG4vKipcbiAqIFJlcGxhY2UgdGhlIHdvcmQgXCJTaG93XCIgKG9yIFwic2hvd1wiKSB3aXRoIFwiSGlkZVwiIChvciBcImhpZGVcIikgaW4gYSBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2hvd1RleHRcbiAqIEByZXR1cm4ge3N0cm9uZ30gaGlkZVRleHRcbiAqL1xuY29uc3QgZ2V0SGlkZVRleHQgPSAoc2hvd1RleHQpID0+XG4gIHNob3dUZXh0LnJlcGxhY2UoL1xcYlNob3dcXGIvaSwgKHNob3cpID0+IGAke3Nob3dbMF0gPT09IFwiU1wiID8gXCJIXCIgOiBcImhcIn1pZGVgKTtcblxuLyoqXG4gKiBDb21wb25lbnQgdGhhdCBkZWNvcmF0ZXMgYW4gSFRNTCBlbGVtZW50IHdpdGggdGhlIGFiaWxpdHkgdG8gdG9nZ2xlIHRoZVxuICogbWFza2VkIHN0YXRlIG9mIGFuIGlucHV0IGZpZWxkIChsaWtlIGEgcGFzc3dvcmQpIHdoZW4gY2xpY2tlZC5cbiAqIFRoZSBpZHMgb2YgdGhlIGZpZWxkcyB0byBiZSBtYXNrZWQgd2lsbCBiZSBwdWxsZWQgZGlyZWN0bHkgZnJvbSB0aGUgYnV0dG9uJ3NcbiAqIGBhcmlhLWNvbnRyb2xzYCBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsICAgIFBhcmVudCBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGZpZWxkcyB0byBiZSBtYXNrZWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGVsKSA9PiB7XG4gIC8vIHRoaXMgaXMgdGhlICp0YXJnZXQqIHN0YXRlOlxuICAvLyAqIGlmIHRoZSBlbGVtZW50IGhhcyB0aGUgYXR0ciBhbmQgaXQncyAhPT0gXCJ0cnVlXCIsIHByZXNzZWQgaXMgdHJ1ZVxuICAvLyAqIG90aGVyd2lzZSwgcHJlc3NlZCBpcyBmYWxzZVxuICBjb25zdCBwcmVzc2VkID1cbiAgICBlbC5oYXNBdHRyaWJ1dGUoUFJFU1NFRCkgJiYgZWwuZ2V0QXR0cmlidXRlKFBSRVNTRUQpICE9PSBcInRydWVcIjtcblxuICBjb25zdCBmaWVsZHMgPSByZXNvbHZlSWRSZWZzKGVsLmdldEF0dHJpYnV0ZShDT05UUk9MUykpO1xuICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHRvZ2dsZUZpZWxkTWFzayhmaWVsZCwgcHJlc3NlZCkpO1xuXG4gIGlmICghZWwuaGFzQXR0cmlidXRlKFNIT1dfQVRUUikpIHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoU0hPV19BVFRSLCBlbC50ZXh0Q29udGVudCk7XG4gIH1cblxuICBjb25zdCBzaG93VGV4dCA9IGVsLmdldEF0dHJpYnV0ZShTSE9XX0FUVFIpO1xuICBjb25zdCBoaWRlVGV4dCA9IGVsLmdldEF0dHJpYnV0ZShISURFX0FUVFIpIHx8IGdldEhpZGVUZXh0KHNob3dUZXh0KTtcblxuICBlbC50ZXh0Q29udGVudCA9IHByZXNzZWQgPyBzaG93VGV4dCA6IGhpZGVUZXh0OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGVsLnNldEF0dHJpYnV0ZShQUkVTU0VELCBwcmVzc2VkKTtcbiAgcmV0dXJuIHByZXNzZWQ7XG59O1xuIiwiY29uc3QgRVhQQU5ERUQgPSBcImFyaWEtZXhwYW5kZWRcIjtcbmNvbnN0IENPTlRST0xTID0gXCJhcmlhLWNvbnRyb2xzXCI7XG5jb25zdCBISURERU4gPSBcImhpZGRlblwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChidXR0b24sIGV4cGFuZGVkKSA9PiB7XG4gIGxldCBzYWZlRXhwYW5kZWQgPSBleHBhbmRlZDtcblxuICBpZiAodHlwZW9mIHNhZmVFeHBhbmRlZCAhPT0gXCJib29sZWFuXCIpIHtcbiAgICBzYWZlRXhwYW5kZWQgPSBidXR0b24uZ2V0QXR0cmlidXRlKEVYUEFOREVEKSA9PT0gXCJmYWxzZVwiO1xuICB9XG5cbiAgYnV0dG9uLnNldEF0dHJpYnV0ZShFWFBBTkRFRCwgc2FmZUV4cGFuZGVkKTtcblxuICBjb25zdCBpZCA9IGJ1dHRvbi5nZXRBdHRyaWJ1dGUoQ09OVFJPTFMpO1xuICBjb25zdCBjb250cm9scyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgaWYgKCFjb250cm9scykge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gdG9nZ2xlIHRhcmdldCBmb3VuZCB3aXRoIGlkOiBcIiR7aWR9XCJgKTtcbiAgfVxuXG4gIGlmIChzYWZlRXhwYW5kZWQpIHtcbiAgICBjb250cm9scy5yZW1vdmVBdHRyaWJ1dGUoSElEREVOKTtcbiAgfSBlbHNlIHtcbiAgICBjb250cm9scy5zZXRBdHRyaWJ1dGUoSElEREVOLCBcIlwiKTtcbiAgfVxuXG4gIHJldHVybiBzYWZlRXhwYW5kZWQ7XG59O1xuIiwiY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxuY29uc3QgQ0hFQ0tFRCA9IFwiYXJpYS1jaGVja2VkXCI7XG5jb25zdCBDSEVDS0VEX0NMQVNTID0gYCR7UFJFRklYfS1jaGVja2xpc3RfX2l0ZW0tLWNoZWNrZWRgO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHZhbGlkYXRlKGVsKSB7XG4gIGNvbnN0IGlkID0gZWwuZGF0YXNldC52YWxpZGF0aW9uRWxlbWVudDtcbiAgY29uc3QgY2hlY2tMaXN0ID1cbiAgICBpZC5jaGFyQXQoMCkgPT09IFwiI1wiXG4gICAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpXG4gICAgICA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuICBpZiAoIWNoZWNrTGlzdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gdmFsaWRhdGlvbiBlbGVtZW50IGZvdW5kIHdpdGggaWQ6IFwiJHtpZH1cImApO1xuICB9XG5cbiAgT2JqZWN0LmVudHJpZXMoZWwuZGF0YXNldCkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgaWYgKGtleS5zdGFydHNXaXRoKFwidmFsaWRhdGVcIikpIHtcbiAgICAgIGNvbnN0IHZhbGlkYXRvck5hbWUgPSBrZXkuc3Vic3RyKFwidmFsaWRhdGVcIi5sZW5ndGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCB2YWxpZGF0b3JQYXR0ZXJuID0gbmV3IFJlZ0V4cCh2YWx1ZSk7XG4gICAgICBjb25zdCB2YWxpZGF0b3JTZWxlY3RvciA9IGBbZGF0YS12YWxpZGF0b3I9XCIke3ZhbGlkYXRvck5hbWV9XCJdYDtcbiAgICAgIGNvbnN0IHZhbGlkYXRvckNoZWNrYm94ID0gY2hlY2tMaXN0LnF1ZXJ5U2VsZWN0b3IodmFsaWRhdG9yU2VsZWN0b3IpO1xuXG4gICAgICBpZiAoIXZhbGlkYXRvckNoZWNrYm94KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gdmFsaWRhdG9yIGNoZWNrYm94IGZvdW5kIGZvcjogXCIke3ZhbGlkYXRvck5hbWV9XCJgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2hlY2tlZCA9IHZhbGlkYXRvclBhdHRlcm4udGVzdChlbC52YWx1ZSk7XG4gICAgICB2YWxpZGF0b3JDaGVja2JveC5jbGFzc0xpc3QudG9nZ2xlKENIRUNLRURfQ0xBU1MsIGNoZWNrZWQpO1xuICAgICAgdmFsaWRhdG9yQ2hlY2tib3guc2V0QXR0cmlidXRlKENIRUNLRUQsIGNoZWNrZWQpO1xuICAgIH1cbiAgfSk7XG59O1xuIl19
