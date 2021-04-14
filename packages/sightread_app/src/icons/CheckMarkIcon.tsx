import { IconInput } from './types'

export default function CheckMarkIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 36 37"
    >
      <path
        d="M16.6155 25.6153C16.4333 25.6164 16.2526 25.5805 16.0839 25.5096C15.9152 25.4388 15.7618 25.3345 15.6324 25.2026L10.094 19.5103C9.83324 19.2423 9.68677 18.8789 9.68677 18.4999C9.68677 18.1209 9.83324 17.7575 10.094 17.4895C10.3547 17.2215 10.7083 17.071 11.077 17.071C11.4458 17.071 11.7994 17.2215 12.0601 17.4895L16.6155 22.1857L25.3247 13.2203C25.5855 12.9523 25.9391 12.8018 26.3078 12.8018C26.6765 12.8018 27.0302 12.9523 27.2909 13.2203C27.5516 13.4882 27.6981 13.8517 27.6981 14.2307C27.6981 14.6096 27.5516 14.9731 27.2909 15.241L17.5986 25.2026C17.4692 25.3345 17.3158 25.4388 17.1471 25.5096C16.9784 25.5805 16.7977 25.6164 16.6155 25.6153Z"
        fill="#7029FB"
      />
      <path
        d="M18 37C14.4399 37 10.9598 35.915 7.99974 33.8822C5.03966 31.8494 2.73255 28.9601 1.37018 25.5796C0.00779912 22.1992 -0.348661 18.4795 0.345873 14.8908C1.04041 11.3022 2.75474 8.0058 5.27208 5.41853C7.78943 2.83126 10.9967 1.06931 14.4884 0.355481C17.98 -0.358346 21.5992 0.00801576 24.8883 1.40824C28.1774 2.80846 30.9886 5.17965 32.9665 8.22196C34.9443 11.2643 36 14.8411 36 18.5C36 23.4065 34.1036 28.1121 30.7279 31.5815C27.3523 35.0509 22.7739 37 18 37ZM18 2.84616C14.9876 2.84616 12.0429 3.76424 9.53824 5.48431C7.03356 7.20438 5.08139 9.64917 3.92861 12.5095C2.77583 15.3699 2.47421 18.5174 3.06189 21.5539C3.64958 24.5905 5.10017 27.3797 7.23023 29.5689C9.36029 31.7582 12.0742 33.2491 15.0286 33.8531C17.9831 34.4571 21.0455 34.1471 23.8286 32.9623C26.6116 31.7775 28.9903 29.7711 30.6639 27.1968C32.3375 24.6226 33.2308 21.596 33.2308 18.5C33.2308 14.3483 31.6261 10.3667 28.7698 7.43107C25.9135 4.4954 22.0395 2.84616 18 2.84616Z"
        fill="#7029FB"
      />
    </svg>
  )
}