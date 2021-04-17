import { useSize } from '../hooks/size'

export function RuleLines() {
  const { width, height, measureRef } = useSize()
  const widthOfWhiteKey = width / 52
  const getRuleLines = () => {
    const baseStyle = {
      position: 'fixed',
      height,
      width: 1,
      backgroundColor: '#fff',
    }
    return Array.from({ length: 12 }).map((_n, i) => (
      <div key={i}>
        <div
          style={
            {
              ...baseStyle,
              left: widthOfWhiteKey * i * 7 + 5 * widthOfWhiteKey,
              opacity: 0.15,
            } as any
          }
        ></div>
        <div
          style={
            {
              ...baseStyle,
              opacity: 0.3,
              left: widthOfWhiteKey * i * 7 + 2 * widthOfWhiteKey,
            } as any
          }
        ></div>
      </div>
    ))
  }
  return (
    <div
      id="rule-lines"
      style={{ position: 'absolute', width: '100%', height: '100%' }}
      ref={measureRef}
    >
      {getRuleLines()}
    </div>
  )
}
