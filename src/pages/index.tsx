import AppBar from '../components/AppBar'
import { Container, Sizer } from '../utils'
import { css, mediaQuery } from '../flakecss'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookIcon,
  CheckMarkIcon,
  FileBoxIcon,
  GithubIcon,
  Logo,
  MenuIcon,
  MusicListIcon,
  ProgressIcon,
  ThumbsUpIcon,
} from '../icons'
import { palette } from '../styles/common'
import clsx from 'clsx'
import { useRouter } from 'next/router'

const classes = css({
  appBarContainer: {
    backgroundColor: palette.purple.primary,
    padding: '15px 30px',
    width: '100%',
  },
  heroOverlay: {
    zIndex: 2,
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: palette.purple.primary + 'aa ',
  },
  heroContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    zIndex: 10,
    position: 'absolute',
  },
  heroButton: {
    fontSize: 32,
    padding: '8px 34px',
  },
  buttonBase: {
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'center',
    filter: 'drop-shadow(1px 7px 11px rgba(0, 0, 0, 0.25))',
  },
  launchButton: {
    color: palette.purple.primary,
    backgroundColor: 'white',
    height: 50,
    width: 120,
    fontSize: 20,
    border: '2px solid transparent',
    transition: '150ms',
    '&:hover': {
      backgroundColor: 'transparent !important',
      borderColor: 'white !important',
      color: 'white',
    },
  },
  orangeButton: {
    color: 'white',
    backgroundColor: palette.orange.primary,
    transition: '150ms',
    border: 'none',
    '&:hover': {
      backgroundColor: palette.orange.dark,
    },
  },
  buttonWrapper: {
    [mediaQuery.up(500)]: {
      width: '360px',
    },
    display: 'block',
    textAlign: 'left',
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingBottom: '72px',
    [mediaQuery.up(901)]: {
      width: '50%',
    },
    [mediaQuery.down(900)]: {
      width: '100%',
      padding: '0px 15px',
    },
  },
  leftSectionTitle: {
    [mediaQuery.up(900)]: {
      width: '360px',
    },
    [mediaQuery.down(600)]: {
      width: '100%',
      justifyContent: 'center',
    },
  },
  rightSection: {
    [mediaQuery.up(901)]: {
      width: '50%',
    },
    [mediaQuery.down(900)]: {
      width: '100%',
    },
  },
  ul: {
    [mediaQuery.up(400)]: {
      width: 380,
    },
    '& li': {
      listStyleType: 'none',
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'flex-start',
    },
    '& li span': { marginLeft: '10px', fontSize: '22px', marginTop: '2px' },
  },
  toolsCard: {
    borderRadius: 8,
    width: 350,
    height: 170,
    padding: 24,
    textAlign: 'left',
    border: '2px solid lightgrey',
    boxSizing: 'border-box',
    transition: '300ms',
    [mediaQuery.up(401)]: {
      margin: '24px 0px 24px 24px',
    },
    [mediaQuery.down(400)]: {
      margin: '24px 0px',
    },
    '& h3': {
      fontSize: 24,
    },
    '& p': {
      fontSize: 18,
      color: 'lightgrey',
      transition: '300ms',
    },
    '&:hover': {
      backgroundColor: 'white',
      boxShadow: '1px 3px 8px 1px lightgrey',
    },
    '&:hover p': {
      color: 'black',
    },
  },
})

const APP_MAX_WIDTH = 'md'
const ICON_SIZE = 45
const WHY_SECTION = [
  {
    icon: <ThumbsUpIcon width={ICON_SIZE} height={ICON_SIZE} />,
    label: 'Quick Start',
    text: 'No account, no installation. Plug in your keyboard and start playing.',
  },
  {
    icon: <ProgressIcon width={ICON_SIZE} height={ICON_SIZE} />,
    label: 'Difficulty Progression',
    text: 'No matter your skill level, we have the songs for you.',
  },
  {
    icon: <FileBoxIcon width={ICON_SIZE} height={ICON_SIZE} />,
    label: 'All in One',
    text: 'We are dedicated to continuously providing features that will help you succeed.',
  },
]

const TOOLS_FOR_LEARNING = [
  {
    title: 'Repeat Section',
    text:
      'While playing a song select a range to repeat so you can focus on small pieces at a time.',
  },
  {
    title: 'Wait',
    text:
      'While playing a song on wait mode. This forces the song to wait for you to play the correct chords before continuing.',
  },
  {
    title: 'Adjust BPM',
    text: "Choose a lower BPM if you're a beginner, or faster if you're looking for a challenge.",
  },
]

function LandingPage() {
  const router = useRouter()

  return (
    <div style={{ position: 'relative' }}>
      <Container
        maxWidth={APP_MAX_WIDTH}
        className={classes.appBarContainer}
        style={{ position: 'fixed', top: 0, zIndex: 12, height: 60 }}
      >
        <AppBar />
      </Container>
      <div style={{ padding: 20 }}></div>
      <div style={{ minHeight: '600px', position: 'relative' }}>
        <div className={classes.heroOverlay}></div>
        <Image priority src="/images/paino_keys_close.jpg" layout="fill" />
        <div className={classes.heroContent}>
          <h1 style={{ fontSize: 48, textAlign: 'center' }}>Learn to play piano</h1>
          <Sizer height={42} />
          <p style={{ fontSize: 24, width: 280, textAlign: 'center' }}>
            You bring the keyboard, and we bring everything else.
          </p>
          <Sizer height={50} />
          <Link href="/songs">
            <a>
              <button
                className={clsx(classes.orangeButton, classes.buttonBase, classes.heroButton)}
              >
                Launch
              </button>
            </a>
          </Link>
        </div>
      </div>
      <Container maxWidth={APP_MAX_WIDTH} style={{ textAlign: 'center' }} component="section">
        <Sizer height={80} />
        <h2 style={{ fontSize: '40px' }}>Why Sightread?</h2>
        <Sizer height={24} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {WHY_SECTION.map((section) => {
            return (
              <div key={section.label} style={{ width: 350, padding: 45, boxSizing: 'border-box' }}>
                <div style={{ minHeight: 88 }}>{section.icon}</div>
                <span role="title" style={{ display: 'block', fontSize: 28 }}>
                  {section.label}
                </span>
                <Sizer height={24} />
                <p style={{ fontSize: 19 }}>{section.text}</p>
              </div>
            )
          })}
        </div>
        <Sizer height={60} />
      </Container>
      <Container
        maxWidth={APP_MAX_WIDTH}
        style={{
          textAlign: 'center',
          background:
            'linear-gradient(109.68deg, rgba(112, 41, 251, 0.15) -33.47%, rgba(255, 255, 255, 0.18) 56.36%, rgba(112, 41, 251, 0.15) 154.01%), linear-gradient(106.97deg, #FFFFFF 50.03%, rgba(255, 255, 255, 0) 195.17%), #DACBF9',
        }}
        component="section"
      >
        <Sizer height={72} />
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className={classes.leftSection}>
            <span
              style={{ display: 'flex', alignItems: 'center' }}
              className={classes.leftSectionTitle}
            >
              <BookIcon width={65} height={55} />
              <h2 style={{ marginLeft: '20px', fontSize: '40px' }}>The Library</h2>
            </span>
            <Sizer height={60} />
            <ul className={classes.ul}>
              <li>
                <CheckMarkIcon width={25} height={25} />
                <span>Thousands of songs to choose from</span>
              </li>
              <li>
                <CheckMarkIcon width={25} height={25} />
                <span>Over one hundred instruments</span>
              </li>
              <li>
                <CheckMarkIcon width={25} height={25} />
                <span>Upload your own midi files</span>
              </li>
            </ul>
            <span className={classes.buttonWrapper}>
              <Link href="/songs">
                <a>
                  <button
                    className={clsx(classes.buttonBase, classes.orangeButton)}
                    style={{ fontSize: 20, padding: '8px 24px' }}
                  >
                    View Library
                  </button>
                </a>
              </Link>
            </span>
          </div>
          <div className={classes.rightSection}>{LIBRARY_SVG}</div>
        </div>
      </Container>
      <Container
        maxWidth={APP_MAX_WIDTH}
        style={{
          textAlign: 'center',
        }}
        component="section"
      >
        <Sizer height={60} />
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className={classes.leftSection} style={{ paddingTop: 20 }}>
            <span
              style={{ display: 'flex', alignItems: 'center' }}
              className={classes.leftSectionTitle}
            >
              <MusicListIcon width={65} height={55} />
              <h2 style={{ marginLeft: '20px', fontSize: '40px' }}>Playing Modes</h2>
            </span>
            <Sizer height={60} />
            <ul className={classes.ul}>
              <li>
                <CheckMarkIcon width={40} height={35} />
                <span>Play a song as sheet music or falling notes colored by hand</span>
              </li>
              <li>
                <CheckMarkIcon width={25} height={25} />
                <span>Free play with any instrument</span>
              </li>
            </ul>
          </div>
          <div
            className={classes.rightSection}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                width: '100%',
                height: '100%',
                maxWidth: 420,
                maxHeight: 300,
                boxShadow: '0px 0px 15px 0px lightgrey',
              }}
            >
              <Image src="/images/falling_notes.PNG" width={420} height={300} />
            </div>
          </div>
        </div>
        <Sizer height={50} />
      </Container>
      <Container
        maxWidth={APP_MAX_WIDTH}
        style={{
          textAlign: 'center',
          background:
            'linear-gradient(252.43deg, #FF6825 -35.81%, rgba(255, 255, 255, 0.18) 44.97%, rgba(112, 41, 251, 0.15) 132.77%), linear-gradient(106.97deg, #FFFFFF 50.03%, rgba(255, 255, 255, 0) 195.17%), #DACBF9',
        }}
        component="section"
      >
        <Sizer height={60} />
        <h2 style={{ fontSize: 40 }}>Tools for Learning</h2>
        <Sizer height={8} />
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {TOOLS_FOR_LEARNING.map((section, i) => {
            return (
              <div className={classes.toolsCard} key={i}>
                <h3>{section.title}</h3>
                <Sizer height={20} />
                <p>{section.text}</p>
              </div>
            )
          })}
        </div>
        <Sizer height={20} />
        <Link href="/songs">
          <a>
            <button
              className={clsx(classes.buttonBase, classes.orangeButton)}
              style={{ fontSize: 20, padding: '8px 24px' }}
            >
              Launch
            </button>
          </a>
        </Link>
        <Sizer height={40} />
      </Container>
      <Container
        maxWidth={APP_MAX_WIDTH}
        style={{
          textAlign: 'center',
        }}
        component="section"
      >
        <Sizer height={80} />
        <h2 style={{ fontSize: 24 }}>
          <span style={{ maxWidth: 360, display: 'inline-block' }}>
            We will be continuously working on improvements and new features
          </span>
        </h2>
        <Sizer height={40} />
        <p style={{ fontSize: 16 }}>Check out our repository and stay stuned!</p>
        <Sizer height={16} />
        <a href="https://github.com/sightread" target="_blank">
          <GithubIcon width={50} height={50} style={{ cursor: 'pointer' }} />
        </a>
        <Sizer height={80} />
      </Container>
      <div style={{ backgroundColor: palette.purple.primary, height: 24, width: '100%' }}></div>
    </div>
  )
}

export default LandingPage

const LIBRARY_SVG = (
  <svg
    width="360"
    height="360"
    viewBox="0 0 432 431"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="216" cy="369.5" rx="216" ry="61.5" fill="url(#paint0_radial)" />
    <path
      d="M340.031 157.678L313.781 165.389C312.715 165.799 311.977 166.783 311.977 167.932V189.342C311.074 189.178 310.254 189.096 309.352 189.014C305.004 189.014 301.477 191.393 301.477 194.264C301.477 197.217 305.004 199.514 309.352 199.514C313.699 199.514 317.227 197.217 317.227 194.264V175.15L338.227 168.998V184.092C337.324 183.928 336.504 183.846 335.602 183.764C331.254 183.764 327.727 186.143 327.727 189.014C327.727 191.967 331.254 194.264 335.602 194.264C339.949 194.264 343.477 191.967 343.477 189.014V160.139C343.395 158.744 342.246 157.596 340.852 157.596C340.524 157.596 340.278 157.596 340.031 157.678Z"
      fill="#7029FA"
    />
    <path
      d="M373.284 68.2566L161.48 1.90186V223.577L373.498 289.932L373.284 68.2566Z"
      fill="#EEE5FF"
    />
    <path d="M378 65.2979L373.284 68.2563L373.498 289.932L378 286.973V65.2979Z" fill="#E3D6FC" />
    <path d="M168.34 0L378 65.2981L373.284 68.2566L161.48 1.8957L168.34 0Z" fill="#F6F1FF" />
    <path
      d="M174.129 16.9058L353.561 72.9058L349.274 75.4416L170.056 19.4416L174.129 16.9058Z"
      fill="white"
    />
    <path d="M353.561 72.9053L349.273 75.4408V118.551L353.561 115.381V72.9053Z" fill="#D9D7D7" />
    <path d="M170.055 62.5508V19.4414L349.274 75.4414V118.551L170.055 62.5508Z" fill="#F1F1F1" />
    <path
      d="M334.181 87.21C336.872 100.472 329.464 108.132 317.245 104.961C313.172 103.904 302.882 97.9905 300.31 87.21C298.279 78.7014 305.455 66.0547 317.245 69.459C323.63 71.3024 332.466 78.7596 334.181 87.21Z"
      fill="white"
    />
    <path
      d="M174.129 171.17L353.561 227.17L349.274 229.706L170.056 173.706L174.129 171.17Z"
      fill="white"
    />
    <path d="M353.561 227.17L349.273 229.705V272.815L353.561 269.645V227.17Z" fill="#D9D7D7" />
    <path d="M170.055 216.815V173.706L349.274 229.706V272.815L170.055 216.815Z" fill="#F1F1F1" />
    <path
      d="M334.181 241.474C336.872 254.736 329.464 262.395 317.245 259.225C313.172 258.168 302.882 252.254 300.31 241.474C298.279 232.965 305.455 220.318 317.245 223.723C323.63 225.566 332.466 233.023 334.181 241.474Z"
      fill="white"
    />
    <path
      d="M174.129 120.03L353.561 176.03L349.274 178.566L170.056 122.566L174.129 120.03Z"
      fill="white"
    />
    <path d="M353.561 176.03L349.273 178.566V221.676L353.561 218.506V176.03Z" fill="#D9D7D7" />
    <path d="M170.055 165.676V122.566L349.274 178.566V221.676L170.055 165.676Z" fill="#F1F1F1" />
    <path
      d="M334.181 189.489C336.872 202.752 329.464 210.411 317.245 207.24C313.172 206.183 302.882 200.27 300.31 189.489C298.279 180.981 305.455 168.334 317.245 171.738C323.63 173.582 332.466 181.039 334.181 189.489Z"
      fill="white"
    />
    <path
      d="M153.12 64.6641L337.483 122.143L332.338 125.102L148.189 67.4112L153.12 64.6641Z"
      fill="#B18CF8"
    />
    <path d="M337.269 122.144L332.338 125.102V175.396L337.269 172.438V122.144Z" fill="#2C0E65" />
    <path d="M148.189 117.705V67.4111L332.338 125.102V175.396L148.189 117.705Z" fill="#7029FB" />
    <path
      d="M318.746 139.618C321.437 152.881 314.029 160.54 301.81 157.369C297.737 156.312 287.447 150.399 284.875 139.618C282.844 131.11 290.02 118.463 301.81 121.867C308.195 123.711 317.031 131.168 318.746 139.618Z"
      fill="white"
    />
    <path
      d="M243.562 246.855L217.312 254.566C216.246 254.977 215.508 255.961 215.508 257.109V278.52C214.605 278.355 213.785 278.273 212.883 278.191C208.535 278.191 205.008 280.57 205.008 283.441C205.008 286.395 208.535 288.691 212.883 288.691C217.23 288.691 220.758 286.395 220.758 283.441V264.328L241.758 258.176V273.27C240.855 273.105 240.035 273.023 239.133 272.941C234.785 272.941 231.258 275.32 231.258 278.191C231.258 281.145 234.785 283.441 239.133 283.441C243.48 283.441 247.008 281.145 247.008 278.191V249.316C246.926 247.922 245.777 246.773 244.383 246.773C244.054 246.773 243.808 246.773 243.562 246.855Z"
      fill="#7029FA"
    />
    <path
      d="M243.562 246.855L243.844 247.815L243.861 247.81L243.878 247.804L243.562 246.855ZM217.312 254.566L217.03 253.607L216.991 253.618L216.953 253.633L217.312 254.566ZM215.508 278.52L215.329 279.503L216.508 279.718V278.52H215.508ZM212.883 278.191L212.973 277.196L212.928 277.191H212.883V278.191ZM220.758 264.328L220.476 263.368L219.758 263.579V264.328H220.758ZM241.758 258.176H242.758V256.841L241.476 257.216L241.758 258.176ZM241.758 273.27L241.579 274.253L242.758 274.468V273.27H241.758ZM239.133 272.941L239.223 271.946L239.178 271.941H239.133V272.941ZM247.008 249.316H248.008V249.287L248.006 249.258L247.008 249.316ZM243.28 245.896L217.03 253.607L217.594 255.526L243.844 247.815L243.28 245.896ZM216.953 253.633C215.536 254.178 214.508 255.511 214.508 257.109H216.508C216.508 256.411 216.956 255.775 217.671 255.5L216.953 253.633ZM214.508 257.109V278.52H216.508V257.109H214.508ZM215.686 277.536C214.737 277.363 213.879 277.278 212.973 277.196L212.792 279.187C213.691 279.269 214.473 279.348 215.329 279.503L215.686 277.536ZM212.883 277.191C210.536 277.191 208.368 277.832 206.759 278.909C205.158 279.98 204.008 281.566 204.008 283.441H206.008C206.008 282.446 206.621 281.407 207.871 280.571C209.111 279.741 210.881 279.191 212.883 279.191V277.191ZM204.008 283.441C204.008 285.353 205.153 286.942 206.763 288.008C208.376 289.075 210.544 289.691 212.883 289.691V287.691C210.874 287.691 209.104 287.159 207.867 286.34C206.626 285.519 206.008 284.483 206.008 283.441H204.008ZM212.883 289.691C215.222 289.691 217.389 289.075 219.002 288.008C220.612 286.942 221.758 285.353 221.758 283.441H219.758C219.758 284.483 219.139 285.519 217.898 286.34C216.661 287.159 214.891 287.691 212.883 287.691V289.691ZM221.758 283.441V264.328H219.758V283.441H221.758ZM221.039 265.288L242.039 259.135L241.476 257.216L220.476 263.368L221.039 265.288ZM240.758 258.176V273.27H242.758V258.176H240.758ZM241.936 272.286C240.987 272.113 240.129 272.028 239.223 271.946L239.042 273.937C239.941 274.019 240.723 274.098 241.579 274.253L241.936 272.286ZM239.133 271.941C236.786 271.941 234.618 272.582 233.009 273.659C231.408 274.73 230.258 276.316 230.258 278.191H232.258C232.258 277.196 232.871 276.157 234.121 275.321C235.361 274.491 237.131 273.941 239.133 273.941V271.941ZM230.258 278.191C230.258 280.103 231.403 281.692 233.013 282.758C234.626 283.825 236.794 284.441 239.133 284.441V282.441C237.124 282.441 235.354 281.909 234.117 281.09C232.876 280.269 232.258 279.233 232.258 278.191H230.258ZM239.133 284.441C241.472 284.441 243.639 283.825 245.252 282.758C246.862 281.692 248.008 280.103 248.008 278.191H246.008C246.008 279.233 245.389 280.269 244.148 281.09C242.911 281.909 241.141 282.441 239.133 282.441V284.441ZM248.008 278.191V249.316H246.008V278.191H248.008ZM248.006 249.258C247.895 247.369 246.34 245.773 244.383 245.773V247.773C245.214 247.773 245.956 248.475 246.009 249.375L248.006 249.258ZM244.383 245.773C244.09 245.773 243.674 245.764 243.246 245.907L243.878 247.804C243.943 247.783 244.019 247.773 244.383 247.773V245.773Z"
      fill="#898989"
    />
    <path
      d="M261.38 114.323L49.5764 47.9688V269.644L261.594 335.999L261.38 114.323Z"
      fill="#EEE5FF"
    />
    <path
      d="M266.096 111.365L261.379 114.324L261.594 335.999L266.096 333.041V111.365Z"
      fill="#E3D6FC"
    />
    <path
      d="M56.4364 46.0674L266.096 111.365L261.38 114.324L49.5764 47.9631L56.4364 46.0674Z"
      fill="#F6F1FF"
    />
    <path
      d="M62.2245 62.9727L241.657 118.973L237.37 121.509L58.1514 65.5085L62.2245 62.9727Z"
      fill="white"
    />
    <path d="M241.657 118.973L237.37 121.508V164.618L241.657 161.448V118.973Z" fill="#D9D7D7" />
    <path d="M58.1514 108.618V65.5088L237.37 121.509V164.618L58.1514 108.618Z" fill="#F1F1F1" />
    <path
      d="M62.2245 114.112L241.657 170.112L237.37 172.648L58.1514 116.648L62.2245 114.112Z"
      fill="white"
    />
    <path d="M241.657 170.112L237.37 172.648V215.758L241.657 212.588V170.112Z" fill="#D9D7D7" />
    <path d="M58.1514 159.758V116.648L237.37 172.648V215.758L58.1514 159.758Z" fill="#F1F1F1" />
    <path
      d="M62.2245 217.237L241.657 273.237L237.37 275.773L58.1514 219.773L62.2245 217.237Z"
      fill="white"
    />
    <path d="M241.657 273.237L237.37 275.773V318.883L241.657 315.713V273.237Z" fill="#D9D7D7" />
    <path d="M58.1514 262.883V219.773L237.37 275.773V318.883L58.1514 262.883Z" fill="#F1F1F1" />
    <path
      d="M222.235 133.27C224.956 146.528 217.465 154.184 205.107 151.015C200.988 149.958 190.582 144.047 187.98 133.27C185.927 124.765 193.184 112.123 205.107 115.526C211.564 117.369 220.5 124.823 222.235 133.27Z"
      fill="white"
    />
    <path
      d="M222.277 287.541C224.968 300.803 217.56 308.463 205.341 305.292C201.268 304.235 190.978 298.322 188.405 287.541C186.375 279.032 193.55 266.386 205.341 269.79C211.725 271.633 220.562 279.091 222.277 287.541Z"
      fill="white"
    />
    <path
      d="M221.848 183.572C224.539 196.835 217.131 204.494 204.912 201.323C200.839 200.266 190.549 194.353 187.977 183.572C185.946 175.064 193.122 162.417 204.912 165.821C211.297 167.665 220.133 175.122 221.848 183.572Z"
      fill="white"
    />
    <path
      d="M42.9306 164.407L227.294 221.886L222.149 224.845L38 167.154L42.9306 164.407Z"
      fill="#B18CF8"
    />
    <path d="M227.079 221.887L222.149 224.845V275.14L227.079 272.181V221.887Z" fill="#2C0E65" />
    <path d="M38 217.45V167.155L222.149 224.846V275.14L38 217.45Z" fill="#7029FB" />
    <path
      d="M208.557 239.36C211.248 252.623 203.84 260.282 191.621 257.111C187.548 256.054 177.258 250.141 174.685 239.36C172.655 230.852 179.83 218.205 191.621 221.609C198.005 223.453 206.842 230.91 208.557 239.36Z"
      fill="white"
    />
    <path
      d="M181.632 227.804V246.2L202.212 251.894V233.033L181.632 227.804ZM186.777 237.841V230.418L188.492 230.88V238.338L186.777 237.841ZM189.992 239.995V231.28L193.637 232.299V240.956L195.352 241.436V248.331L188.492 246.442V239.569L189.992 239.995ZM195.352 240.216V232.786L197.067 233.271V240.689L195.352 240.216ZM183.347 229.484L185.062 229.972L185.276 238.635L186.777 239.09V245.953L183.347 244.985V229.484ZM200.497 249.749L197.067 248.793V241.886L198.782 242.37V233.707L200.497 234.205V249.749Z"
      fill="black"
    />
    <path
      d="M213.949 284.291H198.192C197.592 284.291 197.067 283.756 197.067 283.145C197.067 282.534 197.592 281.999 198.192 281.999H213.949C214.549 281.999 215.074 282.534 215.074 283.145C215.074 283.756 214.549 284.291 213.949 284.291Z"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M201.569 284.292V298.808H198.567V284.368"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M198.567 281.999V278.943H201.569V281.999"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M201.569 281.999V278.943H204.57V281.999"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M204.57 284.292V296.516H201.569V284.292"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M204.57 281.999V278.943H207.571V281.999"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M207.571 284.292V294.224H204.57V284.292"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M207.571 281.999V278.943H210.573V281.999"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M210.573 284.292V291.932H207.571V284.292"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M210.573 281.999V278.943H213.574V281.999"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M213.574 284.292V289.64H210.573V284.292"
      stroke="#A176F4"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M311.364 76.4269C310.997 76.2375 310.599 76.395 310.599 76.7766V94.8155C310.599 95.1971 310.997 95.3546 311.364 95.1652L327.836 92.5585C328.204 92.7479 328.205 92.3691 327.836 92.5585L311.364 76.4269Z"
      fill="#A176F4"
    />
    <path
      d="M311.05 95.9401C310.353 95.9401 309.829 95.4565 309.829 94.8162V76.7773C309.829 76.1369 310.353 75.6533 311.05 75.6533C311.288 75.6533 311.528 75.7123 311.746 75.8254L328.694 91.7137C329.122 92.3477 329.337 92.7703 329.337 93.6156C329.337 93.8269 328.479 94.0382 328.479 94.0382L311.972 95.9401C311.758 95.9401 311.288 95.9401 311.05 95.9401ZM311.369 77.2289V94.3645L327.836 92.559L311.369 77.2289Z"
      fill="#A176F4"
    />
    <path
      d="M295.928 129.258C295.561 129.069 295.164 129.226 295.164 129.608V147.647C295.164 148.028 295.561 148.186 295.928 147.996L312.401 145.39C312.768 145.579 312.769 145.2 312.401 145.39L295.928 129.258Z"
      fill="black"
    />
    <path
      d="M295.614 148.77C294.918 148.77 294.394 148.287 294.394 147.646V129.607C294.394 128.967 294.918 128.483 295.614 128.483C295.852 128.483 296.093 128.542 296.311 128.655L313.259 144.544C313.687 145.178 313.902 145.6 313.902 146.446C313.902 146.657 313.044 146.868 313.044 146.868L296.537 148.77C296.323 148.77 295.852 148.77 295.614 148.77ZM295.934 130.059V147.195L312.401 145.389L295.934 130.059Z"
      fill="black"
    />
    <path
      d="M311.364 179.551C310.997 179.362 310.599 179.519 310.599 179.901V197.94C310.599 198.321 310.997 198.479 311.364 198.289L327.836 195.683C328.204 195.872 328.205 195.493 327.836 195.683L311.364 179.551Z"
      fill="#A176F4"
    />
    <path
      d="M311.05 199.064C310.353 199.064 309.829 198.581 309.829 197.94V179.901C309.829 179.261 310.353 178.777 311.05 178.777C311.288 178.777 311.528 178.836 311.746 178.949L328.694 194.838C329.122 195.472 329.337 195.894 329.337 196.74C329.337 196.951 328.479 197.162 328.479 197.162L311.972 199.064C311.758 199.064 311.288 199.064 311.05 199.064ZM311.369 180.353V197.489L327.836 195.683L311.369 180.353Z"
      fill="#A176F4"
    />
    <path
      d="M311.364 230.691C310.997 230.501 310.599 230.659 310.599 231.04V249.079C310.599 249.461 310.997 249.618 311.364 249.429L327.836 246.822C328.204 247.012 328.205 246.633 327.836 246.822L311.364 230.691Z"
      fill="#A176F4"
    />
    <path
      d="M311.05 250.204C310.353 250.204 309.829 249.72 309.829 249.08V231.041C309.829 230.401 310.353 229.917 311.05 229.917C311.288 229.917 311.528 229.976 311.746 230.089L328.694 245.977C329.122 246.611 329.337 247.034 329.337 247.879C329.337 248.091 328.479 248.302 328.479 248.302L311.972 250.204C311.758 250.204 311.288 250.204 311.05 250.204ZM311.369 231.493V248.628L327.836 246.823L311.369 231.493Z"
      fill="#A176F4"
    />
    <path
      d="M209.728 191.103C209.727 191.102 209.727 191.101 209.727 191.101C209.342 190.605 208.656 189.827 208.495 189.645C208.474 189.622 208.464 189.611 208.463 189.609C208.154 189.037 207.881 188.325 207.812 187.523C207.813 186.867 208.2 186.214 208.2 186.214L208.19 186.211C208.379 185.848 208.492 185.45 208.492 185.029C208.492 183.638 207.371 182.477 205.856 182.153V174.674C205.856 173.992 205.996 173.789 206.078 173.727C206.092 173.721 206.104 173.711 206.117 173.704C206.128 173.699 206.137 173.697 206.137 173.697L206.137 173.69C206.32 173.581 206.448 173.385 206.448 173.15V170.535C206.448 170.185 206.174 169.901 205.838 169.901H204.16C203.823 169.901 203.55 170.186 203.55 170.535V173.15C203.55 173.388 203.682 173.588 203.869 173.695L203.867 173.701C203.867 173.701 203.878 173.704 203.894 173.712C203.901 173.716 203.906 173.722 203.914 173.725C203.992 173.785 204.141 173.995 204.141 174.733V182.152C202.625 182.476 201.504 183.638 201.504 185.028C201.504 185.452 201.617 185.851 201.806 186.214L201.797 186.22C201.797 186.22 202.231 187.151 202.086 188.068C201.957 188.693 201.715 189.238 201.457 189.696C201.335 189.839 200.575 190.726 200.271 191.101C200.269 191.103 200.27 191.104 200.269 191.106C199.604 191.84 199.21 192.737 199.21 193.704C199.21 196.192 201.801 198.218 204.999 198.218C208.194 198.218 210.787 196.193 210.787 193.704C210.787 192.734 210.395 191.838 209.728 191.103Z"
      fill="#A176F4"
    />
    <path
      d="M210.572 132.336C209.118 132.72 207.357 132.95 205.213 132.95C203.069 132.95 201.308 132.72 199.854 132.336V133.871C201.538 134.255 203.375 134.485 205.213 134.485C207.05 134.485 208.888 134.255 210.572 133.871V132.336Z"
      fill="#A176F4"
    />
    <path
      d="M205.213 125.273C200.007 125.273 194.494 126.886 194.494 129.88C194.494 131.492 196.102 132.643 198.322 133.488V131.876C196.868 131.261 196.025 130.57 196.025 129.956C196.025 128.651 199.547 126.886 205.213 126.886C210.879 126.886 214.4 128.651 214.4 129.956C214.4 130.57 213.558 131.338 212.104 131.876V133.488C214.324 132.72 215.932 131.492 215.932 129.88C215.932 126.886 210.419 125.273 205.213 125.273Z"
      fill="#A176F4"
    />
    <path
      d="M198.322 131.799C196.868 131.185 196.025 130.494 196.025 129.88C196.025 129.65 196.179 129.343 196.408 129.112H195.26C194.8 129.112 194.494 129.419 194.494 129.88V139.092C194.494 140.704 196.102 141.856 198.322 142.7V131.799Z"
      fill="#A176F4"
    />
    <path
      d="M210.572 132.337C209.118 132.721 207.357 132.951 205.213 132.951C203.069 132.951 201.308 132.721 199.854 132.337V143.085C201.538 143.468 203.375 143.699 205.213 143.699C207.05 143.699 208.888 143.468 210.572 143.085V132.337ZM207.586 140.398C207.663 140.705 207.586 141.089 207.28 141.242C207.127 141.319 206.974 141.396 206.821 141.396C206.668 141.396 206.514 141.319 206.361 141.242C205.672 140.705 204.677 140.705 203.988 141.242C203.682 141.472 203.375 141.472 203.069 141.242C202.763 141.012 202.686 140.705 202.763 140.398C203.069 139.553 202.763 138.632 201.997 138.095C201.691 137.864 201.614 137.557 201.691 137.25C201.768 136.943 202.074 136.713 202.457 136.713C203.375 136.713 204.141 136.175 204.371 135.331C204.447 135.024 204.754 134.794 205.136 134.794C205.519 134.794 205.749 135.024 205.902 135.331C206.208 136.175 206.974 136.713 207.816 136.713C208.122 136.713 208.429 136.943 208.582 137.25C208.658 137.557 208.582 137.941 208.275 138.095C207.586 138.632 207.28 139.553 207.586 140.398Z"
      fill="#A176F4"
    />
    <path
      d="M215.063 129H213.914C214.144 129.23 214.297 129.537 214.297 129.768C214.297 130.382 213.455 131.15 212 131.687V142.511C214.22 141.744 215.828 140.515 215.828 138.903V129.768C215.828 129.307 215.522 129 215.063 129Z"
      fill="#A176F4"
    />
    <path
      d="M203.682 129.88C203.376 129.88 203.146 129.726 202.993 129.419C202.84 129.035 202.993 128.574 203.376 128.421L214.86 123.047C215.243 122.894 215.702 123.047 215.855 123.431C216.008 123.815 215.855 124.275 215.472 124.429L203.988 129.803C203.912 129.88 203.758 129.88 203.682 129.88Z"
      fill="#A176F4"
    />
    <path
      d="M202.15 132.182C200.849 132.182 199.854 131.184 199.854 129.879C199.854 128.574 200.849 127.576 202.15 127.576C203.452 127.576 204.447 128.574 204.447 129.879C204.447 131.184 203.452 132.182 202.15 132.182Z"
      fill="#A176F4"
    />
    <defs>
      <radialGradient
        id="paint0_radial"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(216 369.5) rotate(90) scale(61.5 216)"
      >
        <stop stopColor="#EEEEEE" stopOpacity="0.646903" />
        <stop offset="0.0001" stopColor="#D0D0D0" stopOpacity="0.77" />
        <stop offset="0.807292" stopColor="#656363" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)
