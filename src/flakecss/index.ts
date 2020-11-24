import { CSSProperties } from 'react'

/**
 * A super basic css-in-js implementation.
 * No advanced features. Only accepts strings as args.
 * Ensures it gets added to the head.
 *
 */
const seen = new Set()
export function css(styleObj: { [key: string]: CSSProperties }, component: string): void {
  if (seen.has(component)) {
    return
  }
  seen.add(component)
  let styleText = ''
  Object.keys(styleObj).forEach((selector) => {
    styleText += `${selector} { ${getRuleBlock(styleObj[selector])} }`
  })
  getStyleEl().innerHTML += styleText
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

function getRuleBlock(rules: Object): string {
  return Object.entries(rules).reduce((accum, [key, val]) => {
    val = typeof val === 'number' ? `${val}px` : val // add px to bare numbers.
    return accum + ' ' + dashCase(key) + ':' + val + ';'
  }, '')
}
