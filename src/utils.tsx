import React from 'react'
import { parseMusicXML, parseMidi } from './parsers'

function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height }} />
}

async function getSong(url: string) {
  return fetch('generated' + url).then((res) => res.json())
}
function formatTime(seconds: number) {
  let min = String(Math.floor(seconds / 60))
  if (min.length === 1) {
    min = '0' + min
  }
  let sec = String(Math.floor(seconds % 60))
  if (sec.length === 1) {
    sec = '0' + sec
  }
  return `${min}:${sec}`
}

export { Sizer, getSong, formatTime }
