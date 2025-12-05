import { useAtom } from 'jotai'
import { MidiModal } from '@/pages/play/components/MidiModal'
import { midiModalOpenAtom } from './state'

export function GlobalModals() {
  const [isMidiModalOpen, setMidiModalOpen] = useAtom(midiModalOpenAtom)

  return (
    <>
      <MidiModal
        isOpen={isMidiModalOpen}
        onClose={() => {
          setMidiModalOpen(false)
        }}
      />
    </>
  )
}
