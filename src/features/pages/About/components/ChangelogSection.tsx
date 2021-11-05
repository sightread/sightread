import { Sizer } from '@/utils'

export default function ChangelogSection() {
  return (
    <div>
      <h2 style={{ fontSize: 48, textAlign: 'center' }}>Changelog</h2>
      <Sizer height={48} />
      <p style={{ maxWidth: '650px' }}>
        Signifcant updates can be found as a timeline here. The best way to stay up to date on all
        updates, small to large, is through the github repository.{' '}
      </p>
      <Sizer height={32} />
      <ul style={{ listStyleType: 'square', maxWidth: 720, fontSize: 20, padding: '0px 25px' }}>
        <li>No Major changes yet</li>
      </ul>
    </div>
  )
}
