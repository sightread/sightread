import React, { CSSProperties } from 'react'
import AppBar from '../components/AppBar'
import { Container, Sizer } from '../utils'
import { css, mediaQuery } from '@sightread/flake'
import { palette } from '../styles/common'
import { GithubIcon, MailIcon, WarningIcon } from '../icons'

const centerAll: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center',
}

const section1BP = 900
const section2BP = 900
const classes = css({
  appBarContainer: {
    backgroundColor: 'black',
    padding: '15px 30px',
    width: '100%',
  },
  gutter: {
    padding: '0px 54px',
  },
  navItem: {
    '&:hover': {
      color: '#b99af4',
    },
  },
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

const APP_MAX_WIDTH = 'sm'

export default function About() {
  return (
    <div style={{ position: 'relative' }}>
      <style>{`p{font-size: 19px;}`}</style>
      <Container
        maxWidth="md"
        className={classes.appBarContainer}
        style={{ position: 'fixed', top: 0, zIndex: 12, height: 60 }}
      >
        <AppBar classNames={{ navItem: { lg: classes.navItem } }} current="/about" />
      </Container>
      <div style={{ padding: 20 }}></div>
      <Sizer height={104} />
      <div style={{ maxWidth: 650, margin: 'auto', padding: '0 24px' }}>
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
            If you encounter any problems with the site or if you would like to leave feedback
            (always appreicated), the best way to do so is through:
          </p>
          <Sizer height={24} />
          <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <GithubIcon height={25} width={25} />
            <span style={{ margin: '0px 12px' }}>Github:</span>
            <a
              href="https://github.com/sightread/community"
              target="_blank"
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
        <Sizer height={80} />
        <section>
          <div style={centerAll}>
            <h2 style={{ fontSize: 48 }}> Roadmap</h2>
            <RoadMapSVG height={100} width={150} style={{ margin: '16px 48px' }} />
          </div>
          <Sizer height={24} />
          <div>
            <ul className={classes.roadmapList}>
              <li>
                Difficulty adjustment of songs based on user input. For example: adjust max number
                of notes to play a chord, minimum time between notes, etc.
              </li>
              <Sizer height={20} />
              <li>Expand free play mode with looping and song sharing</li>
              <Sizer height={20} />
              <li>Expand lessons with more instructional components</li>
              <Sizer height={20} />
              <li>
                Ability to create an account in order to access personal progress tracking and
                leaderboard stats
              </li>
              <Sizer height={20} />
              <li>
                Addition play mode with a small currated list of songs to play in order and must
                achieve a certain accuracy percent before playing next song.
              </li>
              <Sizer height={20} />
            </ul>
          </div>
        </section>
        <Sizer height={64} />
        <div>
          <h2 style={{ fontSize: 48, textAlign: 'center' }}>Major Changes</h2>
          <Sizer height={48} />
          <p style={{ maxWidth: '650px' }}>
            Signifcant updates can be found as a timeline here. The best way to stay up to date on
            all updates, small to large, is through the github repository.{' '}
          </p>
          <Sizer height={32} />
          <ul style={{ listStyleType: 'square', maxWidth: 720, fontSize: 20, padding: '0px 25px' }}>
            <li>No Major changes yet</li>
          </ul>
        </div>
      </div>
      <Sizer height={64} />
      <div style={{ width: '100%', height: 32, backgroundColor: palette.purple.primary }}></div>
    </div>
  )
}

function MissionSVG({
  width,
  height,
  style,
}: {
  width: number
  height: number
  style?: CSSProperties
}) {
  return (
    <svg width={width} height={height} style={style} viewBox="0 0 396 258" fill="none">
      <path
        d="M220.986 8.44966C223.415 6.55109 223.279 0.822253 198.635 2.81723V26.7578C217.834 24.5281 220.321 27.4619 217.977 29.5732C215.634 31.6845 214.968 34.5009 239.899 31.6845L243.767 11.2653C226.144 12.9082 215.583 12.6735 220.986 8.44966Z"
        fill="#FF6825"
      />
      <path
        d="M146.625 193.773V33.0938L243.767 193.773L146.625 222.499V193.773Z"
        fill="#383838"
        fillOpacity="0.2"
      />
      <path
        d="M146.625 193.773V33.0938L49.4822 193.773L146.625 222.499V193.773Z"
        fill="#CCCCCC"
        fillOpacity="0.2"
      />
      <path
        d="M251.074 196.975V54.2158L331.453 196.975L251.074 222.498V196.975Z"
        fill="#383838"
        fillOpacity="0.2"
      />
      <path
        d="M251.074 196.975V54.2158L170.695 196.975L251.074 222.498V196.975Z"
        fill="#CCCCCC"
        fillOpacity="0.2"
      />
      <path d="M287.386 214.859V84L395.5 214.859L287.386 238.5V214.859Z" fill="#7029FB" />
      <path d="M287.386 214.643V84L178.168 214.643L287.386 238V214.643Z" fill="#EEE5FF" />
      <path d="M107.563 214.402V87L238.844 214.402L107.563 237V214.402Z" fill="#7029FB" />
      <path
        d="M107.939 213.835L107.563 87L-5.34058e-05 215.5L107.011 237.5L107.939 213.835Z"
        fill="#EEE5FF"
      />
      <path d="M198.026 225.196V46L329.859 229.5L198.026 257.233V225.196Z" fill="#7029FB" />
      <path d="M198.205 224.962V45.7666L70.9738 230.243L198.205 256.999V224.962Z" fill="#EEE5FF" />
      <rect x="197.345" width="1.71934" height="47.1753" fill="#A52A2A" />
    </svg>
  )
}

function RoadMapSVG({
  width,
  height,
  style,
}: {
  width: number
  height: number
  style?: CSSProperties
}) {
  return (
    <svg width={width} height={height} style={style} viewBox="0 0 589 300" fill="none">
      <rect width="589" height="300" rx="8" fill="#EEE5FF" />
      <path
        d="M0 133.5V112.5L2 111.5L18 106L42 98L63 91.5L78.5 87L100.5 81L121 76L140.5 71.5L187 62.5L211 59L229 56.5L246.5 54.5L272 52.5L299 51L321 50.5H335.5L359 51L377 52L395 53.5L410.5 55L429.5 57.5L439.5 59L450 61V8L422.5 0H470V65L474 65.5L478.5 66.5L486.5 68.5L502.5 72.5L519.5 77.5L534 82L549.5 87.5L566 94L577.5 98.5L589 104V126L578.5 121L567.5 116L558.5 112.5L551 109.5L543 106.5L524.5 100L509 95L488.5 89.5L465 84L446.5 80.5L428.5 77.5L410 75L396.5 73.5L376 72L357.5 71L339.5 70.5H316.5L289 71.5L278 72L265 73L254 74L249 74.5L240 75.5L231 76.5L222.5 77.5L214 78.5L205 80L198 81L186 83L175 85L168.5 86V163.5L183 161L197 158.5L213.5 156L228.5 154L252.5 151L267.5 149.5L278 148.5L286.5 148L300.5 147L313 146.5L338 146H355.5H368L377 146.5L390 147L403.5 148L423 150L433 151L443.5 152.5L454 154L467.5 156.5L476 158L494 162L508 165.5L524 170L534 173L547 177.5L559 182L569 186L576 189L582 191.5L589 194.5V217L581 213L574 210L565 206L555.5 202L547 199L539 196L533 194L524 191L518 189L511 187L504 185L495.5 183L487 181L479 179L469 177L463 176L458 175L446 173L438.5 172L430 171L423 170L412.5 169L402 168L397 167.5L389 167L366 166H330H324L313 166.5V300H293V168L252 171.164V253.804H189.5V300H169.5V254H137.5V300H117.5V254H86V300H66V209L59 211L51 213.5L46 215L33 219L15 225L0 230V209L6 207L21 202L32 198.5L50 193L69.5 187L97.5 179.5L131 171.5L148.5 167.739V90L140 92L118.5 97L79 107.5L51.5 116L36 121L0 133.5Z"
        fill="#7029FB"
      />
      <path
        d="M371.5 234V300H391.5V254H450V300H470V254H546.267V300H566V254H589V234H371.5Z"
        fill="#7029FB"
      />
      <path
        d="M6.5 57.5L0 59.5V39L64.5 19.5L60.5 0H81.5L84 13.5L129 0H198L188 3L181.5 5L171.5 8L163 10.5L155 13L143 16.5L126.5 21.5L120 23.5L107 27.5L95 31L82 35L72 38L63.5 40.5L50 44.5L40 47.5L30 50.5L18 54L6.5 57.5Z"
        fill="#7029FB"
      />
      <path
        d="M536 0H515L516.5 4.5L518.5 9.5L520.5 13L521.5 14.5L523 17L525.5 20L530 25L537 31L543.5 35.5L548.5 38.5L555 42L562.5 45.5L572.5 49.5L589 54.5V34L588 33.5L583 32L575 29L566.5 25.5L557 20.5L553 18L549 15L546 12.5L541.5 8L538.5 4L536 0Z"
        fill="#7029FB"
      />
      <path
        d="M124.87 129.136C120.356 131.654 116.739 135.95 114.652 141.275C112.578 146.143 111.693 151.588 112.094 157.008C112.495 162.429 114.167 167.614 116.925 171.991L136.551 205L156.157 171.991C159.331 167.009 161.031 160.95 161 154.733C161 134.441 143.212 119.153 124.87 129.136ZM136.887 164.346C135.123 164.351 133.398 163.742 131.93 162.597C130.461 161.452 129.316 159.822 128.638 157.913C127.96 156.005 127.781 153.903 128.122 151.875C128.464 149.847 129.312 147.984 130.557 146.52C131.803 145.057 133.391 144.06 135.121 143.655C136.851 143.25 138.644 143.455 140.274 144.245C141.904 145.035 143.297 146.374 144.277 148.093C145.258 149.811 145.781 151.832 145.781 153.899C145.781 156.666 144.845 159.32 143.177 161.278C141.51 163.237 139.248 164.34 136.887 164.346V164.346Z"
        fill="#FF6825"
      />
      <path
        d="M38.8704 26.1365C34.3557 28.6536 30.739 32.9499 28.6522 38.2747C26.5784 43.1425 25.6931 48.5876 26.0942 54.0082C26.4953 59.4288 28.1672 64.614 30.9251 68.9907L50.5511 102L70.1573 68.9907C73.3309 64.0092 75.031 57.95 74.9996 51.7332C74.9996 31.4411 57.2117 16.1526 38.8704 26.1365ZM50.8871 61.3464C49.1233 61.351 47.398 60.7422 45.9295 59.597C44.4611 58.4519 43.3155 56.8219 42.6378 54.9133C41.9601 53.0047 41.7808 50.9034 42.1225 48.8754C42.4642 46.8473 43.3116 44.9836 44.5574 43.5202C45.8032 42.0569 47.3914 41.0596 49.1211 40.6546C50.8507 40.2496 52.644 40.4551 54.2739 41.2452C55.9038 42.0352 57.2971 43.3742 58.2774 45.0927C59.2578 46.8113 59.781 48.832 59.781 50.8993C59.781 53.666 58.8446 56.3198 57.1773 58.2783C55.5099 60.2369 53.2477 61.3403 50.8871 61.3464V61.3464Z"
        fill="#FF6825"
      />
      <path
        d="M447.87 186.136C443.356 188.654 439.739 192.95 437.652 198.275C435.578 203.143 434.693 208.588 435.094 214.008C435.495 219.429 437.167 224.614 439.925 228.991L459.551 262L479.157 228.991C482.331 224.009 484.031 217.95 484 211.733C484 191.441 466.212 176.153 447.87 186.136ZM459.887 221.346C458.123 221.351 456.398 220.742 454.93 219.597C453.461 218.452 452.316 216.822 451.638 214.913C450.96 213.005 450.781 210.903 451.122 208.875C451.464 206.847 452.312 204.984 453.557 203.52C454.803 202.057 456.391 201.06 458.121 200.655C459.851 200.25 461.644 200.455 463.274 201.245C464.904 202.035 466.297 203.374 467.277 205.093C468.258 206.811 468.781 208.832 468.781 210.899C468.781 213.666 467.845 216.32 466.177 218.278C464.51 220.237 462.248 221.34 459.887 221.346V221.346Z"
        fill="#FF6825"
      />
      <path
        d="M345.87 81.1365C341.356 83.6536 337.739 87.9499 335.652 93.2747C333.578 98.1425 332.693 103.588 333.094 109.008C333.495 114.429 335.167 119.614 337.925 123.991L357.551 157L377.157 123.991C380.331 119.009 382.031 112.95 382 106.733C382 86.4411 364.212 71.1526 345.87 81.1365ZM357.887 116.346C356.123 116.351 354.398 115.742 352.93 114.597C351.461 113.452 350.316 111.822 349.638 109.913C348.96 108.005 348.781 105.903 349.122 103.875C349.464 101.847 350.312 99.9836 351.557 98.5202C352.803 97.0569 354.391 96.0596 356.121 95.6546C357.851 95.2496 359.644 95.4551 361.274 96.2452C362.904 97.0352 364.297 98.3742 365.277 100.093C366.258 101.811 366.781 103.832 366.781 105.899C366.781 108.666 365.845 111.32 364.177 113.278C362.51 115.237 360.248 116.34 357.887 116.346V116.346Z"
        fill="#FF6825"
      />
    </svg>
  )
}
