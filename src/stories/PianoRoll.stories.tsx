import React from 'react'
import { Story, Meta } from '@storybook/react'

import { PianoRoll } from '@/features/SongInputControls/PianoRoll'

export default {
  title: 'Piano',
  component: PianoRoll,
  argTypes: {
    onNoteUp: { action: 'Note Up' },
    onNoteDown: { action: 'Note Down' },
    startNote: {
      control: { type: 'range', min: 21, max: 108, step: 1 },
    },
    endNote: {
      control: { type: 'range', min: 21, max: 108, step: 1 },
    },
  },
  parameters: {
    handles: ['click'],
  },
} as Meta<typeof PianoRoll>

const Template: Story<typeof PianoRoll> = (args: any) => <PianoRoll {...args} />

export const PianoRollBasic = Template.bind({})
PianoRollBasic.args = {}
