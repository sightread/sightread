const gotXmlUrl = '%PUBLIC_URL%/music/GoT.xml'
export async function parseMusicXML() {
  /*
   * TODO:
   * - Handle alternative time signatures
   * - Handle non Trebl/Bass clefs
   */

  const txt = await (await fetch('/music/got.xml')).text()
  const xml = new DOMParser().parseFromString(txt, 'application/xml')
  const walker = xml.createTreeWalker(xml, NodeFilter.SHOW_ALL, nodeFilter)

  let curr: HTMLElement | null = walker.currentNode as HTMLElement
  let staffs: any = {}
  while (curr) {
    if (curr.tagName === 'clef') {
      let number = Number(curr.getAttribute('number'))
      staffs[number] = staffs[number] || {}
      staffs[number].clef = { sign: curr.querySelector('sign')?.textContent }
    } else if (curr.tagName === 'note') {
      const step = curr.querySelector('step')?.textContent?.trim()
      const octave = curr.querySelector('octave')?.textContent?.trim()
      const duration = curr.querySelector('duration')?.textContent?.trim()
      const staff = curr.querySelector('staff')?.textContent?.trim() ?? ''
      staffs[staff].notes = staffs[staff].notes ?? []
      ;(staffs[staff].notes as any).push({ pitch: { step, octave }, duration })
    }
    curr = walker.nextNode() as HTMLElement
  }

  return { staffs }
}

const nodeFilter = {
  acceptNode(node: HTMLElement) {
    const acceptable = [
      'note', // grab pitch/octave/duration
      'clef', // sign, id
      'measure',
      'key',
      'time',
      'backup',
      'meter',
    ]
    return acceptable.some((name) => name === node.tagName)
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP
  },
}
