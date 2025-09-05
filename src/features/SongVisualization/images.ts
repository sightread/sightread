export type ImageLoader = (src: string) => Promise<HTMLImageElement>

let loadImage: ImageLoader = (src: string) => {
  const img = new Image()
  img.src = src
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img)
    img.onerror = () => reject(img)
  })
}

/**
 * Set a runtime image loader. Used by non-browser environments
 */
export function setImageLoader(loader: ImageLoader) {
  loadImage = loader
}

let images: null | {
  blackKeyRaised: HTMLImageElement
  blackKeyPressed: HTMLImageElement
} = null

let imagesReadyPromise: Promise<void> | null = null

export function waitForImages(): Promise<void> {
  if (!imagesReadyPromise) {
    imagesReadyPromise = (async () => {
      const [blackKeyRaised, blackKeyPressed] = await Promise.all([
        loadImage('/images/black-key-raised.png'),
        loadImage('/images/black-key-pressed.png'),
      ])
      images = { blackKeyRaised, blackKeyPressed }
    })()
  }
  return imagesReadyPromise
}

/**
 * Synchronous accessor for render loop. Call waitForImages() before starting render.
 * Throws if called before images are ready — forces the caller to await preload.
 */
export function getImages(): {
  blackKeyRaised: HTMLImageElement
  blackKeyPressed: HTMLImageElement
} {
  if (!images) {
    throw new Error('Images not loaded — call await waitForImages() before rendering')
  }
  return images
}
