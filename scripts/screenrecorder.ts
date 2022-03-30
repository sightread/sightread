import puppeteer from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const file = 'All_Eyes_On_Me__Bo_Burnham_Easy_Piano.mid'

  const viewport = { width: 1920, height: 1080 }
  const browser = await puppeteer.launch({ defaultViewport: viewport })
  const page = await browser.newPage()
  const recorder = new PuppeteerScreenRecorder(page, { fps: 60, videoFrame: viewport })

  await page.goto(`http://localhost:3000/play/music/songs/${file}?recording=true`)
  await sleep(3000)
  await recorder.start(`/Users/jakefried/Movies/sightread-recordings/${file}.mp4`) // supports extension - mp4, avi, webm and mov
  await page.keyboard.down('Space')
  await sleep(1000 * 5)
  await recorder.stop()
  await browser.close()
}

main()
