import { InstrumentName } from '@/features/synth/types'
import {
  convertHexColorToIntArr,
  diffKeys,
  formatInstrumentName,
  formatTime,
  getHands,
  pickHex,
} from './index'

describe('formatTime', () => {
  it('should throw an error if seconds is a string or undefined', () => {
    // @ts-expect-error An argument for "seconds" was not provided.
    expect(() => formatTime()).toThrow('An argument for "seconds" was not provided for formatTime.')
  })

  it('should return a formatted time string if seconds is a number', () => {
    expect(formatTime(90)).toBe('01:30')
    expect(formatTime(600)).toBe('10:00')
  })
})

describe('formatInstrumentName', () => {
  it('should return an empty string if given a falsy instrument', () => {
    expect(formatInstrumentName(undefined as any)).toBe('')
    expect(formatInstrumentName(null as any)).toBe('')
    expect(formatInstrumentName('' as any)).toBe('')
  })

  it.each([
    ['acoustic_grand_piano', 'Acoustic Grand Piano'],
    ['acoustic_guitar_steel', 'Acoustic Guitar Steel'],
    ['fx_2_soundtrack', 'Fx 2 Soundtrack'],
  ])('should format instrument %s as title case', (instrumentSnakeCase, instrumentTitleCase) => {
    expect(formatInstrumentName(instrumentSnakeCase as InstrumentName)).toBe(instrumentTitleCase)
  })
})

describe('convertHexColorToIntArr', () => {
  it('should return an empty array for input with greater than 7 chars', () => {
    const inputHex = '#fffffff'
    expect(convertHexColorToIntArr(inputHex)).toEqual([])
  })

  it('should return an empty array for input with fewer than 7 chars', () => {
    const inputHex = '#ffff'
    expect(convertHexColorToIntArr(inputHex)).toEqual([])
  })

  it('should return an empty array if first char from hexString is not a #', () => {
    expect(convertHexColorToIntArr('fffffff')).toEqual([])
  })

  it('should return an array of integers for a valid hexString', () => {
    expect(convertHexColorToIntArr('#ff0000')).toEqual([255, 0, 0])
    expect(convertHexColorToIntArr('#00ff00')).toEqual([0, 255, 0])
    expect(convertHexColorToIntArr('#0000ff')).toEqual([0, 0, 255])
  })
})

describe('pickHex', () => {
  it('should return a valid hex color', () => {
    expect(pickHex('#8147EB', '#000000', 0.5)).toBe('#412476')
    expect(pickHex('#00ff00', '#0000ff', 0.25)).toBe('#0040bf')
  })

  it('should return the first color if weight is 1', () => {
    expect(pickHex('#ff0000', '#0000ff', 1)).toBe('#ff0000')
  })

  it('should return the second color if weight is 0', () => {
    expect(pickHex('#ff0000', '#0000ff', 0)).toBe('#0000ff')
  })
})

describe('diffKeys', () => {
  it('should return keys that are in one object but not the other', () => {
    const obj1 = { a: 1, b: 2, c: 3 }
    const obj2 = { b: 2, c: 3, d: 4 }
    expect(diffKeys(obj1, obj2 as any)).toEqual(['a', 'd'])
  })
})

describe('getHands', () => {
  it('should return the left and right hand from the song config', () => {
    const songConfig = {
      tracks: {
        '1': { hand: 'left' },
        '2': { hand: 'right' },
        '3': { hand: 'none' },
      },
    }
    expect(getHands(songConfig as any)).toEqual({ left: 1, right: 2 })
  })
})
