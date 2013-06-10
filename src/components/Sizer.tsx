export default function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height, minWidth: width, minHeight: height }} />
}
