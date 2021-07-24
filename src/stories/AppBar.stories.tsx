import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import AppBar from '../components/AppBar'

export default {
  title: 'AppBar',
  component: AppBar,
} as ComponentMeta<typeof AppBar>

const Template: ComponentStory<typeof AppBar> = (args: any) => (
  <div style={{ height: 60, backgroundColor: 'black', display: 'flex' }}>
    <AppBar {...args} />
  </div>
)

export const AppBarBasic = Template.bind({})
AppBarBasic.args = {}
