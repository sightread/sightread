import { IconInput } from './types'

export default function GithubIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 60 56"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.9906 0C13.4287 0 0 12.7573 0 28.4947C0 41.0827 8.59125 51.7631 20.5125 55.5322C22.0125 55.7923 22.485 54.948 22.485 54.1927C22.485 53.5159 22.5 51.6242 22.485 49.2462C14.1431 50.9687 12.4144 45.4931 12.4144 45.4931C11.0513 42.2014 9.08625 41.325 9.08625 41.325C6.36375 39.558 9.29062 39.5918 9.29062 39.5918C12.3 39.7931 13.8863 42.5291 13.8863 42.5291C16.5619 46.8807 20.9044 45.6232 22.6125 44.8964C22.8862 43.0546 23.6625 41.7988 24.5194 41.0863C17.8594 40.3667 10.8581 37.9228 10.8581 27.0037C10.8581 23.8919 12.0263 21.3501 13.9444 19.3586C13.635 18.639 12.6038 15.7409 14.2388 11.8168C14.2388 11.8168 16.7569 11.0509 22.485 14.7398C24.8775 14.1075 27.4444 13.7922 29.9944 13.7815C32.5425 13.7922 35.1075 14.1075 37.5037 14.7398C43.2319 11.0527 45.7463 11.8168 45.7463 11.8168C47.3813 15.7409 46.3519 18.639 46.0444 19.3586C47.9625 21.3501 49.1269 23.8919 49.1269 27.0037C49.1269 37.9513 42.1144 40.3596 35.4319 41.0632C36.5081 41.9449 37.485 43.6549 37.485 46.3125C37.485 49.875 37.485 53.2629 37.485 54.1999C37.485 54.9622 37.9688 55.8048 39.4912 55.5287C51.4013 51.7542 59.985 41.0792 59.985 28.4947C59.985 12.7573 46.5563 0 29.9906 0Z"
      />
    </svg>
  )
}
