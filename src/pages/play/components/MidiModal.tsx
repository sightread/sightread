import { Modal, Switch } from '@/components'
import {
  disableInputMidiDevice,
  disableOutputMidiDevice,
  enabledInputIdsAtom,
  enabledOutputIdsAtom,
  enableInputMidiDevice,
  enableOutputMidiDevice,
} from '@/features/midi'
import {
  audioContextEnabledAtom,
  disableAudioContext,
  enableAudioContext,
} from '@/features/synth/utils'
import { useMidiInputs, useMidiOutputs } from '@/hooks'
import { KeyboardMusic, RefreshCw, Speaker } from '@/icons'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { useState, type ReactNode } from 'react'

interface MidiModalProps {
  isOpen: boolean
  onClose: () => void
}

// TODO: reduce duplication between the inputs and the outputs.
export function MidiModal(props: MidiModalProps) {
  const { isOpen, onClose } = props
  const { inputs, refreshInput } = useMidiInputs()
  const { outputs, refreshOutput } = useMidiOutputs()
  const [refreshing, setRefreshing] = useState(false)
  const refreshMidiDevices = () => {
    refreshInput()
    refreshOutput()
  }
  const audioContextEnabled = useAtomValue(audioContextEnabledAtom)
  const enabledInputIds = useAtomValue(enabledInputIdsAtom)
  const enabledOutputIds = useAtomValue(enabledOutputIdsAtom)

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      className="w-[min(100vw,560px)] rounded-2xl bg-[#231e29] text-white/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)] [&>button]:hidden"
      modalClassName="bg-transparent border-none shadow-none"
      overlayClassName="bg-black/45 backdrop-blur-[2px]"
    >
      <div className="relative flex flex-col text-base">
        <MidiModalHeader
          refreshing={refreshing}
          onRefresh={() => {
            refreshMidiDevices()
            setRefreshing(true)
          }}
          onRefreshEnd={() => {
            setRefreshing(false)
          }}
        />
        <div className="flex flex-col gap-6 px-6 pt-5 pb-6">
          <MidiSection label="Inputs" icon={<KeyboardMusic className="h-4 w-4 text-white/40" />}>
            <DeviceList
              emptyState={{
                icon: <KeyboardMusic className="h-5 w-5 text-white/45" />,
                title: 'No MIDI Input Devices Found',
                body: 'Ensure devices are connected and powered on, then refresh.',
              }}
              devices={
                inputs
                  ? Array.from(inputs.values()).map((device: MIDIInput) => ({
                      id: device.id,
                      name: device.name ?? 'Unknown device',
                      sublabel: device.manufacturer ? device.manufacturer : 'USB Connection',
                      enabled: enabledInputIds.has(device.id),
                      onToggle: async () => {
                        if (enabledInputIds.has(device.id)) {
                          disableInputMidiDevice(device)
                        } else {
                          enableInputMidiDevice(device)
                        }
                      },
                    }))
                  : []
              }
            />
          </MidiSection>
          <MidiSection label="Outputs" icon={<Speaker className="h-4 w-4 text-white/40" />}>
            <DeviceList
              emptyState={{
                icon: <Speaker className="h-5 w-5 text-white/45" />,
                title: 'No MIDI Output Devices Detected',
                body: 'Verify connections or check device drivers.',
              }}
              devices={
                outputs
                  ? [
                      {
                        id: 'local',
                        name: 'This Device',
                        sublabel: 'Internal Synth',
                        enabled: audioContextEnabled,
                        onToggle: async () => {
                          if (audioContextEnabled) {
                            disableAudioContext()
                          } else {
                            enableAudioContext()
                          }
                        },
                      },
                      ...Array.from(outputs.values()).map((device) => ({
                        id: device.id,
                        name: device.name ?? 'Unknown device',
                        sublabel: device.manufacturer ? device.manufacturer : 'Hardware Port',
                        enabled: enabledOutputIds.has(device.id),
                        onToggle: async () => {
                          if (enabledOutputIds.has(device.id)) {
                            disableOutputMidiDevice(device as any)
                          } else {
                            enableOutputMidiDevice(device as any)
                          }
                        },
                      })),
                    ]
                  : []
              }
            />
          </MidiSection>
        </div>
        <ModalFooter onClose={onClose} />
      </div>
    </Modal>
  )
}

function MidiModalHeader({
  refreshing,
  onRefresh,
  onRefreshEnd,
}: {
  refreshing: boolean
  onRefresh: () => void
  onRefreshEnd: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
      <h1 className="text-2xl font-semibold text-white">MIDI Settings</h1>
      <button
        className="group flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white/80"
        onClick={onRefresh}
      >
        <RefreshCw
          style={{ animationIterationCount: 0.5 }}
          onAnimationEnd={onRefreshEnd}
          className={clsx('h-4 w-4', refreshing && 'animate-spin')}
        />
        Refresh Devices
      </button>
    </div>
  )
}

function MidiSection({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">
        <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
        {label}
      </div>
      {children}
    </section>
  )
}

type DeviceItem = {
  id: string
  name: string
  sublabel: string
  enabled: boolean
  onToggle: () => void
}

function DeviceList({
  devices,
  emptyState,
}: {
  devices: DeviceItem[]
  emptyState: { icon: ReactNode; title: string; body: string }
}) {
  if (!devices.length) {
    return <NoDeviceFound icon={emptyState.icon} title={emptyState.title} body={emptyState.body} />
  }

  return (
    <div className="flex flex-col gap-2">
      {devices.map((device) => (
        <DeviceRow key={device.id} device={device} />
      ))}
    </div>
  )
}

function DeviceRow({ device }: { device: DeviceItem }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className="text-base font-medium text-white/90">{device.name}</span>
        <span className="text-xs text-white/40">{device.sublabel}</span>
      </div>
      <Switch
        isSelected={device.enabled}
        onChange={() => {
          device.onToggle()
        }}
        size="lg"
        className="text-white/60"
      >
        <span className="sr-only">Toggle {device.name}</span>
      </Switch>
    </div>
  )
}

function NoDeviceFound({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-6 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
        {icon}
      </div>
      <p className="text-sm font-medium text-white/80">{title}</p>
      <p className="text-xs text-white/45">{body}</p>
    </div>
  )
}

function ModalFooter({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-t border-white/5 px-6 py-4">
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/20"
        >
          Close
        </button>
      </div>
    </div>
  )
}
