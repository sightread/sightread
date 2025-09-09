import { LucideProps } from '@/icons'

export function StartRecord(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      {...props}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
    </svg>
  )
}
