import { isBrowser } from '@/utils'

let failSound: HTMLAudioElement | null = null
if (isBrowser()) {
  failSound = new Audio('/effects/wrong-sound-effect.mp3')
  failSound.playbackRate = 6
  failSound.volume = 0.08
}

export function playFailSound() {
  failSound?.play()
}
