import { AppBar } from '@/components'
import HeroBanner from './components/HeroBanner'
import { palette } from '@/styles/common'
import LibrarySection from './components/LibrarySection'
import ToolsForLearningSection from './components/ToolsForLearningSection'
import WhySightreadSection from './components/WhySightreadSection'
import Footer from './components/Footer'

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
      <ToolsForLearningSection />
      <Footer />
      <div style={{ backgroundColor: palette.purple.primary, height: 24, width: '100%' }}></div>
    </div>
  )
}
