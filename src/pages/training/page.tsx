import { AppBar, Sizer } from '@/components'
import { Link } from 'react-router'

export default function TrainingPage() {
  const links = [
    { label: 'Speed', url: '/training/speed' },
    { label: 'Infinite', url: '/training/phrases' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar />
      <Sizer height={48} />
      <div className="flex h-full grow content-center justify-center gap-5 py-6">
        {links.map(({ label, url }) => (
          <Link to={url} key={url} className="text-white no-underline">
            <div className="flex h-[200px] w-[200px] items-center justify-center bg-gray-500">
              {label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
