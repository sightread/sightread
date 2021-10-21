import React, { CSSProperties } from 'react'
import { Sizer } from '@/utils'
import { palette } from '@/styles/common'
import { GithubIcon, MailIcon, WarningIcon } from '@/icons'
import { css } from '@sightread/flake'
import MissionSVG from './MissionSVG'
import { centerAll } from './styles'

const classes = css({
  issueHeader: {
    ...centerAll,
    justifyContent: 'flex-start',
    fontSize: 32,
    '& svg': {
      margin: '12px 32px',
    },
    '& svg path': {
      fill: palette.purple.primary,
    },
  },
})

export default function MissionSection() {
  return (
    <>
      <section>
        <div style={centerAll}>
          <h2 style={{ fontSize: 48 }}> Our Mission</h2>
          <MissionSVG width={150} height={100} style={{ margin: '16px 48px' }} />
        </div>
        <Sizer height={32} />
        <p>
          We are developers who decided to learn how to play the piano. This app was born out of
          three things: Our passion for technology. Our desire to understand music from the ground
          up. No platform on the market quite handled everything we wanted for free.
        </p>
        <Sizer height={24} />
        <p>
          Our mission remains simply to grow our musical abilities and yours by growing this
          platform.
        </p>
        <Sizer height={64} />
        <h3 className={classes.issueHeader}>
          Submit an Issue
          <WarningIcon height={32} width={32} />
        </h3>
        <Sizer height={32} />
        <p style={{ maxWidth: '550px' }}>
          If you encounter any problems with the site or if you would like to leave feedback (always
          appreicated), the best way to do so is through:
        </p>
        <Sizer height={24} />
        <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <GithubIcon height={25} width={25} />
          <span style={{ margin: '0px 12px' }}>Github:</span>
          <a
            href="https://github.com/sightread/community"
            target="_blank"
            rel="noreferrer"
            style={{ wordBreak: 'break-all', textDecoration: 'none' }}
          >
            https://github.com/sightread/community
          </a>
        </p>
        <Sizer height={12} />
        <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <MailIcon height={25} width={25} />
          <span style={{ margin: '0px 12px' }}>Email:</span>
          <a
            href="mailto:sightreadllc@gmail.com"
            style={{ wordBreak: 'break-all', textDecoration: 'none' }}
          >
            sightreadllc@gmail.com
          </a>
        </p>
      </section>
    </>
  )
}
