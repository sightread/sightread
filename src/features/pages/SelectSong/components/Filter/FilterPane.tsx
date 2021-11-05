import { FilterPaneProps } from './types'

export default function FilterPane({ show, children }: React.PropsWithChildren<FilterPaneProps>) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 0 }}>
      <div
        style={{
          position: 'absolute',
          padding: show ? '24px' : '0px 24px',
          height: show ? '' : '0px',
          overflow: show ? '' : 'hidden',
          border: show ? '1px solid' : 'none',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxSizing: 'border-box',
          zIndex: 10,
          transition: '400ms',
          top: '80px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
