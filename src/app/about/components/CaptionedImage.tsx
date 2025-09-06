export function CaptionedImage({
  src,
  width,
  height,
  caption,
}: {
  src: string
  width: number
  height: number
  caption: string
}) {
  return (
    <figure className="mx-auto flex w-3/4 flex-col gap-2">
      <img className="rounded-t-lg" width={width} height={height} src={src} alt={caption} />
      <figcaption className="text-sm font-thin">{caption}</figcaption>
    </figure>
  )
}
