import Image from 'next/image'

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
    <figure className="w-3/4 mx-auto flex flex-col gap-2">
      <Image className="rounded-t-lg" width={width} height={height} src={src} alt={caption} />
      <figcaption className="border px-2 text-sm font-thin">{caption}</figcaption>
    </figure>
  )
}
