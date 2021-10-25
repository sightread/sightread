import { Container, Sizer } from '@/utils'
import { GithubIcon } from '@/icons'

export default function Footer() {
  return (
    <Container
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
      <p style={{ fontSize: 16 }}>Check out our repository and stay tuned!</p>
      <Sizer height={16} />
      <a href="https://github.com/sightread" target="_blank" rel="noreferrer">
        <GithubIcon width={50} height={50} style={{ cursor: 'pointer' }} />
      </a>
      <Sizer height={80} />
    </Container>
  )
}
