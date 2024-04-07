import { isBrowser } from '@/utils'

let loadImage: (src: string) => Promise<HTMLImageElement | void>
if (isBrowser()) {
  loadImage = (src: string) => {
    const img = new Image()
    img.src = src
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = () => reject(img)
    })
  }
} else if (process.env.RENDER) {
  // TODO: fix this before merge.
  // loadImage = (src: string) => require('skia-canvas').loadImage(`${process.cwd()}/public${src}`)
  loadImage = () => Promise.resolve()
} else {
  loadImage = () => Promise.resolve()
}

let blackKeyRaisedImg: HTMLImageElement | null
let blackKeyPressedImg: HTMLImageElement | null
const blackKeyRaisedPromise = loadImage('/images/black-key-raised.png').then(
  (img: HTMLImageElement | void) => {
    blackKeyRaisedImg = img as any
  },
)
const blackKeyPressedPromise = loadImage('/images/black-key-pressed.png').then(
  (img: HTMLImageElement | void) => {
    blackKeyPressedImg = img as any
  },
)

export async function waitForImages() {
  await Promise.all([blackKeyRaisedPromise, blackKeyPressedPromise])
}

export function getImages(): {
  blackKeyRaised: HTMLImageElement
  blackKeyPressed: HTMLImageElement
} {
  return {
    blackKeyRaised: blackKeyRaisedImg!,
    blackKeyPressed: blackKeyPressedImg!,
  }
}
