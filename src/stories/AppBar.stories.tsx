import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import AppBar from '../components/AppBar'

export default {
  title: 'AppBar',
  component: AppBar,
} as ComponentMeta<typeof AppBar>

const Template: ComponentStory<typeof AppBar> = (args: any) => <AppBar {...args} />

export const AppBarBasic = Template.bind({})
AppBarBasic.args = {}
