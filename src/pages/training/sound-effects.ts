import { isBrowser } from '@/utils'
import { assetUrl } from '@/utils/assets'

let failSound: HTMLAudioElement | null = null
if (isBrowser()) {
  failSound = new Audio(assetUrl('effects/wrong-sound-effect.mp3'))
  failSound.playbackRate = 6
  failSound.volume = 0.08
}

export function playFailSound() {
  failSound?.play()
}
