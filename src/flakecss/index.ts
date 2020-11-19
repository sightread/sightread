let id = 0

/**
 * A super basic css-in-js implementation.
 * No advanced features. No nesting. Just maintains a style tag
 * in the head.
 *
 * Should only be called in module scope, or in some way that we know it'll only be done once per
 * style object.
 * @param styles
 */
export function css(styles: Object): { [key: string]: string } {
  let styleText = ''
  let cxs: { [key: string]: string } = {}
  Object.entries(styles).forEach(([key, val]) => {
    let className = key + id++
    cxs[key] = className
    let block = getRuleBlock(val)
    styleText += `.${className} { ${block} }`
  })
  getStyleEl().innerHTML += styleText
  return cxs
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
