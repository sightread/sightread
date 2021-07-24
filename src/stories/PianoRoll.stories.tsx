import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { PianoRoll } from '../PlaySongPage/PianoRoll'

export default {
  title: 'Piano',
  component: PianoRoll,
  argTypes: {
    onNoteUp: { action: 'Note Up' },
    onNoteDown: { action: 'Note Down' },
  },
  parameters: {
    handles: ['click'],
  },
} as ComponentMeta<typeof PianoRoll>

const Template: ComponentStory<typeof PianoRoll> = (args: any) => <PianoRoll {...args} />

export const PianoRollBasic = Template.bind({})
PianoRollBasic.args = {
}
