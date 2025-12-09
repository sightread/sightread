import { Slider } from '@/components'
import Toggle from '@/components/Toggle'
import { enableOutputMidiDevice, isOutputMidiDeviceEnabled } from '@/features/midi'
import { usePlayer } from '@/features/player'
import useMidiOutputs from '@/hooks/useMidiOutputs'
import { ChevronDown, ChevronUp } from '@/icons'
import clsx from 'clsx'
import { useAtom, useAtomValue } from 'jotai'

const MULTIPLIERS = [0.25, 0.5, 1, 2, 4]
const fractionDisplay = (val: number) => (val < 1 ? `1/${1 / val}×` : `${val}×`)
const iconSize = 24

export default function MetronomeSettings() {
  const player = usePlayer()
  const [emphasizeFirst, setEmphasizeFirst] = useAtom(player.metronomeEmphasizeFirst)
  const [metronomeSpeed, setMetronomeSpeed] = useAtom(player.metronomeSpeed)
  const [volume, setVolume] = useAtom(player.metronomeVolume)
  const metronomeOutputId = useAtomValue(player.metronomeOutputDeviceId)
  const usePercussionChannel = useAtomValue(player.metronomeUsePercussionChannel)
  const { outputs } = useMidiOutputs()

  const speedIndex = MULTIPLIERS.findIndex((m) => m === metronomeSpeed)
  const isDisabled = volume === 0
  const midiOptions = outputs ? Array.from(outputs.values()) : []
  const availableOutputs = midiOptions.map((output) => ({
    id: output.id,
    label: output.name ?? output.id,
    device: output,
  }))
  const hasSelectedOutput =
    Boolean(metronomeOutputId) && availableOutputs.some((option) => option.id === metronomeOutputId)

  const handleOutputChange = (nextValue: string | null) => {
    if (nextValue) {
      const option = availableOutputs.find((opt) => opt.id === nextValue)
      if (option) {
        const device = option.device
        if (!isOutputMidiDeviceEnabled(device as any)) {
          enableOutputMidiDevice(device as any)
        }
      }
    }
    player.setMetronomeOutputDevice(nextValue)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center">
        <span className="mr-4 whitespace-nowrap text-gray-700">Volume</span>
        <div className="flex-1">
          <Slider
            orientation="horizontal"
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(val) => setVolume(val[0])}
            onClick={(e) => e.stopPropagation()}
            className="h-2 w-full"
          />
        </div>
      </div>

      <div
        className={clsx(
          'flex w-full items-center justify-between',
          isDisabled && 'pointer-events-none opacity-50',
        )}
      >
        <span>Speed</span>
        <div className="flex flex-col items-center justify-between">
          <ChevronUp
            size={iconSize}
            className="hover:text-purple-hover cursor-pointer text-black"
            onClick={() =>
              setMetronomeSpeed(MULTIPLIERS[Math.min(speedIndex + 1, MULTIPLIERS.length - 1)])
            }
          />
          <span className="text-sm">{fractionDisplay(metronomeSpeed)}</span>
          <ChevronDown
            size={iconSize}
            className="hover:text-purple-hover cursor-pointer text-black"
            onClick={() => setMetronomeSpeed(MULTIPLIERS[Math.max(speedIndex - 1, 0)])}
          />
        </div>
      </div>

      <div
        className={clsx(
          'flex w-full items-center justify-between',
          isDisabled && 'pointer-events-none opacity-50',
        )}
      >
        <span>Emphasize 1st Beat</span>
        <Toggle checked={emphasizeFirst} onChange={setEmphasizeFirst} />
      </div>

      <div
        className={clsx(
          'flex w-full items-center justify-between',
          (isDisabled || availableOutputs.length === 0) && 'pointer-events-none opacity-50',
        )}
      >
        <span>Output</span>
        {availableOutputs.length > 0 ? (
          <select
            className="w-[200px] border bg-white px-2 py-1"
            disabled={isDisabled}
            value={metronomeOutputId ?? ''}
            onChange={(event) => {
              const nextValue = event.target.value || null
              handleOutputChange(nextValue)
            }}
          >
            <option value="">This Device</option>
            {availableOutputs.map((output) => (
              <option key={output.id} value={output.id}>
                {output.label}
              </option>
            ))}
            {metronomeOutputId && !hasSelectedOutput && (
              <option value={metronomeOutputId}>{`${metronomeOutputId} (Unavailable)`}</option>
            )}
          </select>
        ) : (
          <span className="text-sm text-gray-500">This Device</span>
        )}
      </div>

      {availableOutputs.length > 0 && metronomeOutputId && (
        <div
          className={clsx(
            'flex w-full items-center justify-between',
            (isDisabled || !metronomeOutputId) && 'pointer-events-none opacity-50',
          )}
          title="Enable this if your device doesn't support channel 10 (percussion); the metronome will use channel 1 (piano voice) instead."
        >
          <span>Use piano channel</span>
          <Toggle
            checked={!usePercussionChannel}
            onChange={(next) => player.setMetronomePercussionEnabled(!next)}
          />
        </div>
      )}
    </div>
  )
}
