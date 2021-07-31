import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { SelectSongTable } from 'src/SelectSongPage'
import songManifest from 'src/manifest.json'
import { formatTime } from 'src/utils'

export default {
  title: 'SelectSongTable',
  component: SelectSongTable,
} as ComponentMeta<typeof SelectSongTable>

const Template: ComponentStory<typeof SelectSongTable> = (args: any) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: 500,
    }}
  >
    <SelectSongTable {...args} />
  </div>
)

export const SelectSongTableBasic = Template.bind({})

const rows = songManifest.filter((s) => s.type === 'song')
SelectSongTableBasic.args = {
  columns: [
    { label: 'Title', id: 'name', keep: true },
    { label: 'Artist', id: 'artist', keep: true },
    { label: 'Difficult', id: 'difficulty', format: () => 'Easy' },
    { label: 'Length', id: 'duration', format: formatTime },
  ],
  rows,
  filter: ['name', 'artist'],
}

export const SelectSongTableOnDelete = Template.bind({})

SelectSongTableOnDelete.args = {
  columns: [
    { label: 'Title', id: 'name' },
    { label: 'Artist', id: 'artist' },
    { label: 'Difficult', id: 'difficulty', format: () => 'Easy' },
    { label: 'Length', id: 'duration', format: formatTime },
  ],
  rows,
  filter: ['name', 'artist'],
  onDelete: (row) => console.log(`Deleting: ${row}`),
}
