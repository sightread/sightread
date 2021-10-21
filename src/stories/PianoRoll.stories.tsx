import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { PianoRoll } from '@/features/PlaySongPage/PianoRoll'

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
} as ComponentMeta<typeof PianoRoll>

const Template: ComponentStory<typeof PianoRoll> = (args: any) => <PianoRoll {...args} />

export const PianoRollBasic = Template.bind({})
PianoRollBasic.args = {}
