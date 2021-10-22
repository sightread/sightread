import { Sizer, Container } from '@/utils'
import { FileBoxIcon, ProgressIcon, ThumbsUpIcon } from '@/icons'

const iconSize = 45
const whySection = [
  {
    icon: <ThumbsUpIcon width={iconSize} height={iconSize} />,
    label: 'Quick Start',
    text: 'No account, no installation. Plug in your keyboard and start playing.',
  },
  {
    icon: <ProgressIcon width={iconSize} height={iconSize} />,
    label: 'Difficulty Progression',
    text: 'No matter your skill level, we have the songs for you.',
  },
  {
    icon: <FileBoxIcon width={iconSize} height={iconSize} />,
    label: 'All in One',
    text: 'We are dedicated to continuously providing features that will help you succeed.',
  },
]

export default function WhySightreadSection() {
  return (
    <Container style={{ textAlign: 'center' }} component="section">
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
        {whySection.map((section) => {
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
  )
}
