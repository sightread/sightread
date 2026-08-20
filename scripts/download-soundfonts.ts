import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DEST = join(process.cwd(), 'public', 'soundfonts')
const VERSION_FILE = join(DEST, '.version')

interface Font {
  name: string
  url: string
  sha256: string
}

const FONTS: Font[] = [
  {
    name: 'FluidR3_GM',
    url: 'https://github.com/sightread/soundfonts/releases/download/fluidr3_gm-v1.2.0/FluidR3_GM-mp3-js-v1.2.0.tar.gz',
    sha256: '772cd0b9a216c6bebef2632c7188b54fbe0d00a0bc7b90d6191e0552bf9193b6',
  },
  {
    name: 'SalC5Light2',
    url: 'https://github.com/sightread/soundfonts/releases/download/salc5light2-v1.2.0/SalC5Light2-mp3-js-v1.2.0.tar.gz',
    sha256: 'e66444f44094fcaa364d22319840772d099d54a014d5a784c9df4e9f6d7dc175',
  },
]

function sha256File(filePath: string): string {
  const data = readFileSync(filePath)
  return createHash('sha256').update(data).digest('hex')
}

function readVersionFile(): Record<string, string> | null {
  try {
    return JSON.parse(readFileSync(VERSION_FILE, 'utf-8'))
  } catch {
    return null
  }
}

function writeVersionFile(versionMap: Record<string, string>) {
  writeFileSync(VERSION_FILE, JSON.stringify(versionMap, null, 2) + '\n')
}

function isUpToDate(): boolean {
  const versionMap = readVersionFile()
  if (!versionMap) return false
  return FONTS.every((f) => versionMap[f.name] === f.sha256)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderProgressBar(current: number, total: number): string {
  const pct = total > 0 ? current / total : 0
  const width = 30
  const filled = Math.round(pct * width)
  const bar =
    '='.repeat(filled) + (filled < width ? '>' : '') + ' '.repeat(Math.max(0, width - filled - 1))
  const pctStr = `${Math.round(pct * 100)}%`
  return `[${bar}] ${pctStr}  ${formatBytes(current)} / ${formatBytes(total)}`
}

async function download(font: Font): Promise<void> {
  const tmpFile = join(tmpdir(), `soundfont-${font.name}.tar.gz`)
  try {
    process.stdout.write(`  Downloading ${font.name}...\n`)
    const resp = await fetch(font.url)
    if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${font.url}`)

    const total = Number(resp.headers.get('content-length') ?? 0)
    const reader = resp.body!.getReader()
    const chunks: Uint8Array[] = []
    let received = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.length
      process.stdout.write(`\r  ${renderProgressBar(received, total)}`)
    }
    process.stdout.write('\n')

    const data = new Uint8Array(received)
    let offset = 0
    for (const chunk of chunks) {
      data.set(chunk, offset)
      offset += chunk.length
    }
    writeFileSync(tmpFile, data)

    process.stdout.write(`  Verifying checksum...\n`)
    const actual = sha256File(tmpFile)
    if (actual !== font.sha256) {
      throw new Error(`Checksum mismatch for ${font.name}: expected ${font.sha256}, got ${actual}`)
    }

    process.stdout.write(`  Extracting to public/soundfonts/...\n`)
    mkdirSync(DEST, { recursive: true })
    const proc = Bun.spawnSync(['tar', '-xzf', tmpFile, '-C', DEST])
    if (!proc.success) {
      throw new Error(`tar failed: ${new TextDecoder().decode(proc.stderr)}`)
    }

    process.stdout.write(`  Done: ${font.name}\n`)
  } finally {
    rmSync(tmpFile, { force: true })
  }
}

async function main() {
  if (isUpToDate()) {
    return
  }

  process.stdout.write('Downloading soundfonts...\n')
  for (const font of FONTS) {
    await download(font)
  }

  const versionMap: Record<string, string> = {}
  for (const font of FONTS) {
    versionMap[font.name] = font.sha256
  }
  writeVersionFile(versionMap)

  process.stdout.write('All soundfonts ready.\n')
}

main()
