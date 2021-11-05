import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Toggle } from '../components'

export default {
  title: 'Toggle',
  component: Toggle,
} as ComponentMeta<typeof Toggle>

const Template: ComponentStory<typeof Toggle> = (args: any) => <Toggle {...args} />

export const ToggleUncontrolled = Template.bind({})
ToggleUncontrolled.args = {}

export const ToggleControlled = () => {
  const [checked, setChecked] = useState(false)
  return <Toggle checked={checked} onChange={setChecked} />
}
