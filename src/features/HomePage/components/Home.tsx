import { AppBar } from '@/components'
import HeroBanner from './HeroBanner'
import { palette } from '@/styles/common'
import LibrarySection from './LibrarySection'
import ToolsForLearningSection from './ToolsForLearningSection'
import WhySightreadSection from './WhySightreadSection'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div style={{ position: 'relative' }}>
      <AppBar
        style={{
          width: '100%',
          position: 'fixed',
          zIndex: 3,
        }}
      />
      <div style={{ padding: 20 }}></div>
      <HeroBanner />
      <WhySightreadSection />
      <LibrarySection />
      <WhySightreadSection />
      <ToolsForLearningSection />
      <Footer />
      <div style={{ backgroundColor: palette.purple.primary, height: 24, width: '100%' }}></div>
    </div>
  )
}
