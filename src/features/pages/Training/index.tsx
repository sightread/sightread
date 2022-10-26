import { AppBar, Container } from '@/components'
import Link from 'next/link'

export default function TrainingPage() {
  const links = [
    { label: 'Speed', url: '/training/speed' },
    { label: 'Ear', url: '/training/ear' },
    { label: 'Teacher', url: '/training/teacher' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar style={{ backgroundColor: '#292929', display: 'flex' }} />
      <Container
        style={{
          display: 'flex',
          padding: '0 24px',
          height: '100%',
          flexGrow: 1,
          alignContent: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignContent: 'center' }}>
          {links.map(({ label, url }) => (
            <Link
              href={url}
              key={url}
              style={{
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <div
                style={{
                  width: 200,
                  height: 200,
                  backgroundColor: 'grey',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {label}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  )
}
