type MeasureFormat = {
  step: number
  tickEvery?: number
}

type TimelineMeasureMarks = {
  step: number
  tickEvery?: number
  labels: number[]
  ticks: number[]
}

const MEASURE_LABEL_SPACING = 40

const getMeasureFormat = (measureCount: number, width: number): MeasureFormat => {
  if (!measureCount || !width) {
    return { step: 1 }
  }
  const maxLabels = Math.max(1, Math.floor(width / MEASURE_LABEL_SPACING))
  const steps = [1, 5, 10, 20, 40, 80]
  for (const step of steps) {
    const labelCount = step === 1 ? measureCount : 1 + Math.floor(measureCount / step)
    if (labelCount <= maxLabels) {
      if (step === 1) {
        return { step }
      }
      if (step === 5) {
        return { step, tickEvery: 1 }
      }
      return { step, tickEvery: Math.max(2, Math.floor(step / 5)) }
    }
  }
  const step = steps[steps.length - 1]
  return { step }
}

const getTickEvery = (step: number): number | undefined => {
  if (step <= 1) {
    return undefined
  }
  if (step % 4 === 0) {
    return step / 4
  }
  if (step % 5 === 0) {
    return step / 5
  }
  if (step % 2 === 0) {
    return step / 2
  }
  return undefined
}

export function getTimelineMeasureMarks({
  measureCount,
  width,
}: {
  measureCount: number
  width: number
}): TimelineMeasureMarks {
  const { step } = getMeasureFormat(measureCount, width)
  const tickEvery = getTickEvery(step)
  const labels: number[] = []
  if (measureCount > 0) {
    const firstLabel = step <= 1 ? 1 : step
    for (let measure = firstLabel; measure <= measureCount; measure += step) {
      labels.push(measure)
    }
    if (labels[labels.length - 1] !== measureCount) {
      labels.push(measureCount)
    }
  }

  const ticks: number[] = []
  if (tickEvery) {
    const boundaries = [1, ...labels]
    if (boundaries[boundaries.length - 1] !== measureCount) {
      boundaries.push(measureCount)
    }
    const uniqueBoundaries = Array.from(new Set(boundaries)).sort((a, b) => a - b)
    for (let i = 0; i < uniqueBoundaries.length - 1; i++) {
      const start = uniqueBoundaries[i]
      const end = uniqueBoundaries[i + 1]
      for (let measure = start + tickEvery; measure < end; measure += tickEvery) {
        ticks.push(measure)
      }
    }
  }
  return { step, tickEvery, labels, ticks }
}
