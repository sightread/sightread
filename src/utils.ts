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

  let currTime = 0
  let curr: HTMLElement | null = walker.currentNode as HTMLElement
  let staffs: any = {}
  while (curr) {
    if (curr.tagName === 'clef') {
      let number = Number(curr.getAttribute('number'))
      staffs[number] = staffs[number] || {}
      staffs[number].clef = { sign: curr.querySelector('sign')?.textContent }
    } else if (curr.tagName === 'note') {
      const isRest = !!curr.querySelector('rest')
      const step = curr.querySelector('step')?.textContent?.trim()
      const octave = Number(curr.querySelector('octave')?.textContent?.trim())
      const duration = Number(curr.querySelector('duration')?.textContent?.trim())
      const staff = curr.querySelector('staff')?.textContent?.trim() ?? ''
      const accidental = curr.querySelector('accidental')?.textContent?.trim()
      const isChord = !!curr.querySelector('chord')
      let time = isChord ? staffs[staff].notes[staffs[staff].notes.length - 1].time : currTime

      if (isRest) {
        currTime += duration
        break
      }
      let note: any = { pitch: { step, octave }, duration, time }
      if (accidental) {
        note.accidental = accidental
      }

      staffs[staff].notes = staffs[staff].notes ?? []
      ;(staffs[staff].notes as any).push(note)
      // TODO: - is there proper handling of `<chord/>`s ?
      if (!isChord) {
        currTime += duration
      } else {
        if (duration === 6 && staff == '2') {
          console.error(curr.innerHTML)
        }
      }
    } else if (curr.tagName === 'backup') {
      const duration = Number(curr.querySelector('duration')?.textContent?.trim())
      currTime -= duration
    } else if (curr.tagName === 'forward') {
      const duration = Number(curr.querySelector('duration')?.textContent?.trim())
      currTime += duration
    }
    curr = walker.nextNode() as HTMLElement
  }

  return { staffs }
}

const nodeFilter = {
  acceptNode(node: HTMLElement) {
    const acceptable = ['note', 'clef', 'measure', 'key', 'time', 'backup', 'forward', 'meter']
    return acceptable.some((name) => name === node.tagName)
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP
  },
}
