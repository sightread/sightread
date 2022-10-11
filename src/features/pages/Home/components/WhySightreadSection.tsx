import { Sizer } from '@/components'

const whySection = [
  {
    label: 'Quick Start',
    text: 'No account, no installation. Plug in your keyboard and start playing.',
  },
  {
    label: 'Difficulty Progression',
    text: 'No matter your skill level, we have the songs for you.',
  },
  {
    label: 'Feature Packed',
    text: 'We are dedicated to continuously providing features that will help you succeed.',
  },
]

export default function WhySightreadSection() {
  return (
    <div style={{ position: 'relative', color: 'black' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {whySection.map((section) => {
          return (
            <div key={section.label}>
              <span role="title" style={{ fontSize: 28 }}>
                {section.label}
              </span>
              <Sizer height={8} />
              <p style={{ fontSize: 16 }}>{section.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
