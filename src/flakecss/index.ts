import { CSSProperties } from 'react'
import { isBrowser } from '../utils'

type StyleObjectValues = CSSProperties | { [key: string]: CSSProperties }

type StyleObject = {
  [key: string]: StyleObjectValues
}

type StringMap = {
  [key: string]: string
}

let counter: number = 0

export function css(styleObj: StyleObject): StringMap {
  const classes: StringMap = {}

  // if on the server, still calculate the classnames
  if (!isBrowser()) {
    const initialCount = counter
    const deteriminedNames = Object.keys(styleObj).reduce((acc, curr) => {
      const className = `css-${counter.toString()}`
      acc[curr] = className
      counter += 1
      return acc
    }, classes)
    counter = initialCount
    return deteriminedNames
  }

  getStyleEl().innerHTML += Object.keys(styleObj).reduce((acc: string, selector) => {
    const className = `css-${counter.toString()}`
    counter += 1
    classes[selector] = className
    const styles = styleObj[selector]
    acc += getNestedSelectors(styles, className)
    acc += `.${className} { ${rules(styles)} }`
    return acc
  }, '')
  return classes
}

function getNestedSelectors(styleObject: any, className: string): string {
  return Object.keys(styleObject).reduce((acc, key) => {
    if (isNestedSelector(key)) {
      const styles = styleObject[key]
      acc += `.${className}${key.slice(1)} { ${rules(styles)}}`
    }
    return acc
  }, '')
}

function rules(rules: Object): string {
  return Object.entries(rules).reduce((accum, [key, val]) => {
    if (!isNestedSelector(key)) {
      val = transform(key, val)
      accum += ' ' + dashCase(key) + ':' + val + ';'
    }
    return accum
  }, '')
}

function isNestedSelector(key: string) {
  return key.substr(0, 2) === '&:'
}

const excludeRules = new Set(['opacity', 'zIndex', 'fontWeight'])

function transform(attr: string, val: number | string) {
  if (typeof val === 'string') {
    return val
  }
  if (excludeRules.has(attr)) {
    return val
  }
  return `${val}px`
}

const STYLE_EL_ID = 'FLAKE_CSS'
let styleEl: undefined | HTMLStyleElement

function getStyleEl(): HTMLStyleElement {
  if (styleEl) {
    return styleEl
  }

  styleEl = document.createElement('style')
  styleEl.id = STYLE_EL_ID
  document.head.appendChild(styleEl)
  return styleEl
}

function dashCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, (s) => s[0] + '-' + s[1].toLowerCase())
}
