import { CSSProperties } from 'react'
import { isBrowser } from '../utils'

type StyleObjectValues = CSSProperties | { [selectorKey: string]: CSSProperties }

type StyleObject = {
  [selectorKey: string]: StyleObjectValues
}

type StringMap = {
  [selectorKey: string]: string
}

let counter: number = 0
let globalStyle = ''

// TODO: create babel plugin that processes all of the CSS into a single bundle
// and removes all css() calls from the source in favor of inlining classname map
// that would enable complete removal of flake from client.
const DETERMINISTIC_CLASSNAMES = false

/**
 * style object expected in the shape of
 * {
 *    class1: {
 *        attr1: val1,
 *        attr2: val2,
 *        '&:pseudoclass': {
 *            ...
 *        },
 *        "@media(...)": {
 *            ...
 *        },
 *    },
 *    class2: {
 *        ...
 *    },
 * }
 */
export function css(styleObject: StyleObject) {
  const parsed = compileCss(styleObject)
  if (!isBrowser()) {
    globalStyle += parsed.styleHtml
  } else {
    getStyleEl().innerHTML += parsed.styleHtml
  }

  return parsed.classes
}

export function extractCss() {
  return globalStyle
}

export function compileCss(styleObj: StyleObject): { classes: StringMap; styleHtml: string } {
  const classes: StringMap = {}
  let styleHtml = ''

  Object.entries(styleObj).forEach(([selector, styles]) => {
    const suffix = DETERMINISTIC_CLASSNAMES ? getDeterministicClassnameSuffix(styles) : counter++
    const className = `${selector}-${suffix}`
    counter++

    classes[selector] = className
    styleHtml += getNestedSelectors(styles, className)
    const directRules = rules(getDirectProperties(styles))
    if (directRules) {
      styleHtml += `.${className}{${directRules}}`
    }
  })

  if (process.env.NODE_ENV === 'development') {
    styleHtml =
      '\n' +
      styleHtml
        .replace(/(\{)/g, ' $&\n')
        .replace(/(\})/g, '$&\n')
        .replace(/([^;]*;)/g, '$&\n')
  }

  return { classes, styleHtml }
}

function getDeterministicClassnameSuffix(obj: StyleObjectValues) {
  return hash(JSON.stringify(obj))
}

function getDirectProperties(styleObject: StyleObjectValues): CSSProperties {
  const extractedProps: StringMap = {}
  for (let [propKey, propVal] of Object.entries(styleObject)) {
    if (typeof propVal === 'object') {
      continue
    }
    extractedProps[propKey] = propVal
  }
  return extractedProps as CSSProperties
}

function getNestedSelectors(styleObject: StyleObjectValues, className: string): string {
  return Object.entries(styleObject).reduce((acc, [key, styles]) => {
    if (isNestedSelector(key)) {
      acc += `.${className}${key.slice(1)}{${rules(styles)}}`
    } else if (isMediaQuery(key)) {
      acc += `${key}{.${className} {${rules(styles)}}}`
    }
    return acc
  }, '')
}

function rules(rules: CSSProperties): string {
  return Object.entries(rules)
    .map(([prop, val]) => {
      val = maybeAddPx(prop, val)
      return dashCase(prop) + ':' + val + ';'
    })
    .join('')
}

function isNestedSelector(key: string) {
  return key.startsWith('&')
}

function isMediaQuery(key: string): boolean {
  return key.startsWith('@media')
}

const unitlessProperties = new Set(['opacity', 'zIndex', 'fontWeight'])
function maybeAddPx(attr: string, val: number | string) {
  if (typeof val === 'string' || unitlessProperties.has(attr)) {
    return val
  }
  return `${val}px`
}

function dashCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, (s) => s[0] + '-' + s[1].toLowerCase())
}

export const FLAKE_STYLE_ID = 'FLAKE_CSS'
let styleEl: null | HTMLStyleElement =
  (isBrowser() && (document.getElementById(FLAKE_STYLE_ID) as HTMLStyleElement)) || null

function getStyleEl(): HTMLStyleElement {
  if (styleEl) {
    return styleEl
  }

  styleEl = document.createElement('style')
  styleEl.id = FLAKE_STYLE_ID
  document.head.appendChild(styleEl)
  return styleEl
}

// Stolen from stackoverflow: https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
function hash(str: string) {
  if (str.length == 0) {
    return 0
  }

  let hash = 0
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}
