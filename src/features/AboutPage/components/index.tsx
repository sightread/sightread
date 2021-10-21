import React from 'react'
import { AppBar } from '@/components'
import { Sizer } from '@/utils'
import { css } from '@sightread/flake'
import { palette } from '@/styles/common'
import MissionSection from './MissionSection'
import RoadmapSection from './RoadmapSection'
import ChangelogSection from './ChangelogSection'

const classes = css({
  appBarContainer: {},
  gutter: {
    padding: '0px 54px',
  },
  navItem: {
    '&:hover': {
      color: '#b99af4',
    },
  },
  roadmapList: {
    listStyleType: 'square',
    maxWidth: 720,
    fontSize: 20,
    padding: '0px 25px',
    '& li': {
      marginBottom: 12,
    },
  },
})

export default function About() {
  return (
    <div style={{ position: 'relative' }}>
      <style>{`p{font-size: 19px;}`}</style>
      <AppBar classNames={{ navItem: { lg: classes.navItem } }} />
      <Sizer height={48} />
      <div style={{ maxWidth: 650, margin: 'auto', padding: '0 24px' }}>
        <MissionSection />
        <Sizer height={80} />
        <RoadmapSection />
        <Sizer height={64} />
        <ChangelogSection />
      </div>
      <Sizer height={64} />
      <div style={{ width: '100%', height: 32, backgroundColor: palette.purple.primary }}></div>
    </div>
  )
}
