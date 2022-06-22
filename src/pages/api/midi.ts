import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import { MusicFile } from '@/types'
const songManifest = require('@/manifest.json')

const map: Map<string, MusicFile> = new Map(songManifest.map((s: MusicFile) => [s.id, s]))

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { id, source } = req.query
  const path = `public/${map.get(id as string)?.file}`
  res.writeHead(200, {
    'Content-Type': 'audio/midi',
    // 'Content-Length': stat.size
  })
  fs.createReadStream(path).pipe(res)
}
