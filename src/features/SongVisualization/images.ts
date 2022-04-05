import { isBrowser } from '@/utils'

let loadImage
if (isBrowser()) {
  loadImage = (src: string) => {
    const img = new Image()
    img.src = src
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = () => reject(img)
    })
  }
} else {
  loadImage = (src: string) => require('skia-canvas').loadImage(`../../../public/images${src}`)
}

let blackKeyRaisedImg: HTMLImageElement
let blackKeyPressedImg: HTMLImageElement
const blackKeyRaisedPromise = loadImage('/images/black-key-raised.png').then(
  (img: HTMLImageElement) => {
    blackKeyRaisedImg = img
  },
)
const blackKeyPressedPromise = loadImage('/images/black-key-pressed.png').then(
  (img: HTMLImageElement) => {
    blackKeyPressedImg = img
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
    blackKeyRaised: blackKeyRaisedImg,
    blackKeyPressed: blackKeyPressedImg,
  }
}
