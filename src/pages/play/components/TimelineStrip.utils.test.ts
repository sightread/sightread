import { describe, expect, test } from 'bun:test'
import { getTimelineMeasureMarks } from './TimelineStrip.utils'

const widthSweep = [120, 200, 320, 480, 640, 900, 1200]
const measureSweep = [1, 2, 4, 8, 16, 32, 64, 128, 256]

describe('getTimelineMeasureMarks', () => {
  test('width sweep with fixed measureCount', () => {
    const results = widthSweep.map((width) => ({
      input: { measureCount: 64, width },
      output: (() => {
        const { step, tickEvery } = getTimelineMeasureMarks({ measureCount: 64, width })
        return { step, tickEvery }
      })(),
    }))
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "input": {
            "measureCount": 64,
            "width": 120,
          },
          "output": {
            "step": 40,
            "tickEvery": 10,
          },
        },
        {
          "input": {
            "measureCount": 64,
            "width": 200,
          },
          "output": {
            "step": 20,
            "tickEvery": 5,
          },
        },
        {
          "input": {
            "measureCount": 64,
            "width": 320,
          },
          "output": {
            "step": 10,
            "tickEvery": 2,
          },
        },
        {
          "input": {
            "measureCount": 64,
            "width": 480,
          },
          "output": {
            "step": 10,
            "tickEvery": 2,
          },
        },
        {
          "input": {
            "measureCount": 64,
            "width": 640,
          },
          "output": {
            "step": 5,
            "tickEvery": 1,
          },
        },
        {
          "input": {
            "measureCount": 64,
            "width": 900,
          },
          "output": {
            "step": 5,
            "tickEvery": 1,
          },
        },
        {
          "input": {
            "measureCount": 64,
            "width": 1200,
          },
          "output": {
            "step": 5,
            "tickEvery": 1,
          },
        },
      ]
    `)
  })

  test('measure sweep with fixed width', () => {
    const results = measureSweep.map((measureCount) => ({
      input: { measureCount, width: 640 },
      output: (() => {
        const { step, tickEvery } = getTimelineMeasureMarks({ measureCount, width: 640 })
        return { step, tickEvery }
      })(),
    }))
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "input": {
            "measureCount": 1,
            "width": 640,
          },
          "output": {
            "step": 1,
            "tickEvery": undefined,
          },
        },
        {
          "input": {
            "measureCount": 2,
            "width": 640,
          },
          "output": {
            "step": 1,
            "tickEvery": undefined,
          },
        },
        {
          "input": {
            "measureCount": 4,
            "width": 640,
          },
          "output": {
            "step": 1,
            "tickEvery": undefined,
          },
        },
        {
          "input": {
            "measureCount": 8,
            "width": 640,
          },
          "output": {
            "step": 1,
            "tickEvery": undefined,
          },
        },
        {
          "input": {
            "measureCount": 16,
            "width": 640,
          },
          "output": {
            "step": 1,
            "tickEvery": undefined,
          },
        },
        {
          "input": {
            "measureCount": 32,
            "width": 640,
          },
          "output": {
            "step": 5,
            "tickEvery": 1,
          },
        },
        {
          "input": {
            "measureCount": 64,
            "width": 640,
          },
          "output": {
            "step": 5,
            "tickEvery": 1,
          },
        },
        {
          "input": {
            "measureCount": 128,
            "width": 640,
          },
          "output": {
            "step": 10,
            "tickEvery": 2,
          },
        },
        {
          "input": {
            "measureCount": 256,
            "width": 640,
          },
          "output": {
            "step": 20,
            "tickEvery": 5,
          },
        },
      ]
    `)
  })

  test('edge cases', () => {
    const empty = getTimelineMeasureMarks({ measureCount: 0, width: 0 })
    expect(empty).toEqual({
      step: 1,
      tickEvery: undefined,
      labels: [],
      ticks: [],
    })
    const single = getTimelineMeasureMarks({ measureCount: 1, width: 200 })
    expect(single).toEqual({
      step: 1,
      tickEvery: undefined,
      labels: [1],
      ticks: [],
    })
  })
})
