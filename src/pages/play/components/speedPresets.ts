export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export type SpeedPresetOption = {
  id: string
  label: string
  value: number
}

export function getSpeedPresetOptions(bpmModifier: number): SpeedPresetOption[] {
  const options = SPEED_PRESETS.map((value) => ({
    id: value.toString(),
    label: `${Math.round(value * 100)}%`,
    value,
  }))

  if (!SPEED_PRESETS.some((value) => Math.abs(bpmModifier - value) < 0.001)) {
    options.push({
      id: bpmModifier.toString(),
      label: `${Math.round(bpmModifier * 100)}%`,
      value: bpmModifier,
    })
  }

  return options
}
