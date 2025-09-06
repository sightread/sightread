import { AppBar, MarketingFooter, Sizer } from '@/components'
import React from 'react'
import { FeaturedSongsPreview } from './FeaturedSongsPreview'
import { Link } from 'react-router'

export default function Home() {
  const overlappingHeight = 250
  return (
    <>
      <div className="relative flex min-h-[800px,100vh] w-full flex-col text-white">
        <AppBar />
        <div className="bg-purple-primary flex flex-col items-center p-8 text-center">
          <h1 className="text-responsive-xxl font-bold">Your Piano Journey Begins Here</h1>
          <Sizer height={8} />
          <h3 className="text-responsive-xl">
            Plug in your keyboard and learn, right in your browser
          </h3>
          <Sizer height={overlappingHeight} />
        </div>
        <FeaturedSongsPreview marginTop={-overlappingHeight} />
        <div className="bg-background mt-auto flex min-h-[200px] flex-col items-center gap-6 pt-[42px]">
          <h3 className="text-black" style={{ fontSize: 'clamp(1rem, 1rem + 1vw, 2rem)' }}>
            Start learning
          </h3>
          <div
            className="grid w-full justify-center gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min-content, 150px))' }}
          >
            <Link to={'/songs'}>
              <Button className="bg-purple-primary hover:bg-purple-hover text-white">
                Learn a song
              </Button>
            </Link>
            <Link to={'/freeplay'}>
              <Button className="border-purple-primary text-purple-primary hover:bg-purple-light border bg-white">
                Free play
              </Button>
            </Link>
          </div>
        </div>
        <Sizer height={16} />
        <MarketingFooter />
      </div>
    </>
  )
}

function Button({
  children,
  style,
  className,
}: {
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <button
      className={className}
      style={{
        transition: 'background-color 150ms',
        cursor: 'pointer',
        fontSize: 'clamp(0.875rem, 0.875rem + 0.5vw, 1.2rem)',
        padding: '10px 16px',
        borderRadius: 15,
        fontWeight: 700,
        minWidth: 'max-content',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
