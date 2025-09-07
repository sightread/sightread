export function CaptionedImage({
  src,
  width,
  height,
  caption,
  fetchPriority = 'auto',
}: {
  src: string
  width: number
  height: number
  caption: string
  fetchPriority?: 'high' | 'low' | 'auto'
}) {
  return (
    <figure className="mx-auto flex w-3/4 flex-col gap-2">
      <img
        className="rounded-t-lg"
        width={width}
        height={height}
        src={src}
        alt={caption}
        fetchPriority={fetchPriority}
      />
      <figcaption className="text-sm font-thin">{caption}</figcaption>
    </figure>
  )
}
