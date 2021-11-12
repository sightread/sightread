import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Table } from '@/components'
import songManifest from '@/manifest.json'
import { formatTime } from '@/utils'

export default {
  title: 'Table',
  component: Table,
} as Meta<typeof Table>

const Template: Story<typeof Table> = (args: any) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: 500,
    }}
  >
    <Table {...args} />
  </div>
)

export const TableBasic = Template.bind({})

const rows = songManifest.filter((s) => s.type === 'song')
TableBasic.args = {
  columns: [
    { label: 'Title', id: 'name', keep: true },
    { label: 'Artist', id: 'artist', keep: true },
    { label: 'Difficult', id: 'difficulty', format: () => 'Easy' },
    { label: 'Length', id: 'duration', format: formatTime },
  ],
  rows,
  filter: ['name', 'artist'],
  onDelete: null,
}

export const TableOnDelete = Template.bind({})

TableOnDelete.args = {
  columns: [
    { label: 'Title', id: 'name' },
    { label: 'Artist', id: 'artist' },
    { label: 'Difficult', id: 'difficulty', format: () => 'Easy' },
    { label: 'Length', id: 'duration', format: formatTime },
  ],
  rows,
  filter: ['name', 'artist'],
  onDelete: (row: any) => console.log(`Deleting: ${row}`),
}
