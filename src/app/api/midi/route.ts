import type { NextRequest } from 'next/server'
import fs from 'fs'
import { SongMetadata } from '@/types'

const songManifest = require('@/manifest.json')
const map: Map<string, SongMetadata> = new Map(songManifest.map((s: SongMetadata) => [s.id, s]))

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const { id, source } = Object.fromEntries(searchParams)
  const supportedSources = new Set(['builtin', 'midishare'])

  if (!id || !source) {
    return new Response('Must provide both a a source and an id.', { status: 400 })
  } else if (Array.isArray(id) || Array.isArray(source)) {
    return new Response('Must only provide a single id and source.', { status: 400 })
  } else if (!supportedSources.has(source)) {
    return new Response(`Received invalid source: ${source}`, { status: 400 })
  }

  if (source === 'midishare') {
    // TODO(samouri): determine why the former URL is blocked by CF.
    // stream = await get(`https://midishare.dev/api/midi?id=${id}`)
    // const response = await fetch(`https://midishare.dev/api/midi?id=${id}`)
    // stream = dStream.fromWeb(response.body!)
    return fetch(`https://assets.midishare.dev/scores/${id}/${id}.mid`)
  }

  // else source === builtin
  const path = map.get(id)?.file
  if (!path) {
    return new Response(`Could not find midi with id: "${id}"`, { status: 404 })
  }

  // TODO: can we simplify this now that Next.js supports https in local dev w/ 14.1?

  // In development we have access to the filesystem but can't hit localhost with https.
  // When deployed we don't have access to fs, but can proxy to the hosted /public.
  if (process.env.NODE_ENV === 'development') {
    const body = fs.readFileSync(`public/${path}`)
    const basename = path.substring(path.lastIndexOf('/') + 1)
    return new Response(body, {
      headers: {
        'Content-Type': 'audio/midi',
        'Content-Disposition': `attachment; filename="${basename}"`,
      },
    })
  } else {
    console.log(`Requesting URL: https://${process.env.VERCEL_URL}/${path}`)
    return fetch(`https://${process.env.VERCEL_URL}/${path}`)
  }
}
