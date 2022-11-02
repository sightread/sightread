import type { Stream } from 'stream'
import type { IncomingMessage } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'

import fs from 'fs'
import { SongMetadata } from '@/types'
import https from 'https'

const songManifest = require('@/manifest.json')
const map: Map<string, SongMetadata> = new Map(songManifest.map((s: SongMetadata) => [s.id, s]))

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { id, source } = req.query
  if (!id || !source) {
    res.status(400).send('Must provide both a source and an id.')
    return
  } else if (Array.isArray(id) || Array.isArray(source)) {
    res.status(400).send('Must only provide a single id and source.')
    return
  } else if (!['builtin', 'midishare'].includes(source)) {
    res.status(400).send(`Received invalid source: ${source}`)
    return
  }

  let stream: Stream
  if (source === 'builtin') {
    const path = map.get(id)?.file
    if (!path) {
      res.status(404).send(`Could not find midi with id: "${id}"`)
    }
    res.writeHead(200, { 'Content-Type': 'audio/midi' })

    // In development we have access to the filesystem but can't hit localhost with https.
    // When deployed we don't have access to fs, but can proxy to the hosted /public.
    if (process.env.NODE_ENV === 'development') {
      stream = fs.createReadStream(`public/${path}`)
    } else {
      console.error(`Requesting URL: https://${process.env.VERCEL_URL}/${path}`)
      stream = await get(`https://${process.env.VERCEL_URL}/${path}`)
    }
  } else {
    stream = await get(`https://midishare.dev/api/midi?id=${id}`)
  }
  return proxy(stream, res)
}

async function get(url: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = https.get(url)
    req.on('response', (response) => resolve(response))
    req.on('error', (err) => reject(err))
  })
}

async function proxy(stream: Stream, res: NextApiResponse<any>) {
  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(undefined))
    stream.on('error', (e) => reject(e))
    stream.pipe(res)
  })
}
