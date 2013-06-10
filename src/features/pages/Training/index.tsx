import { AppBar } from '@/components'
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
      <div className="flex py-6 flex-grow h-full content-center">
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
      </div>
    </div>
  )
}
