import { AppBar, Sizer } from '@/components'
import Link from 'next/link'

export default function TrainingPage() {
  const links = [
    { label: 'Speed', url: '/training/speed' },
    { label: 'Infinite', url: '/training/infinite' },
    { label: 'Teacher', url: '/training/teacher' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar />
      <Sizer height={48} />
      <div className="flex py-6 flex-grow h-full content-center justify-center gap-5">
        {links.map(({ label, url }) => (
          <Link href={url} key={url} className="no-underline text-white">
            <div className="w-[200px] h-[200px] bg-gray-500 flex items-center justify-center">
              {label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
