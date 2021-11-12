import React from 'react'
import { Story, Meta } from '@storybook/react'
import { AppBar } from '@/components'

export default {
  title: 'AppBar',
  component: AppBar,
} as Meta<typeof AppBar>

const Template: Story<typeof AppBar> = (args: any) => <AppBar {...args} />

export const AppBarBasic = Template.bind({})
AppBarBasic.args = {}
