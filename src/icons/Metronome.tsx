import { LucideProps } from '@/icons'

export function Metronome(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      {...props}
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M12 11.344V8.992" />
      <path d="m12 17 6.582-6.582" />
      <path d="m15.02 5.693-.228-.7a3 3 0 0 0-5.663 0L4.418 19.695A1 1 0 0 0 5.37 21h13.253a1 1 0 0 0 .951-1.31l-1.131-3.477" />
      <circle cx="20" cy="9" r="2" />
    </svg>
  )
}
