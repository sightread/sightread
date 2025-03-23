'use client'

import * as RadixSlider from '@radix-ui/react-slider'
import clsx from 'clsx'

export function Slider(props: RadixSlider.SliderProps) {
  return (
    <RadixSlider.Root
      {...props}
      className={clsx(
        props.className,
        'relative flex h-full w-full cursor-pointer flex-col items-center',
      )}
    >
      <RadixSlider.Track className="relative flex h-full w-2 flex-col items-center overflow-hidden rounded-md bg-gray-300">
        <RadixSlider.Range className="bg-purple-primary absolute flex h-full w-2" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="bg-purple-hover hover:bg-purple-light flex h-3 w-3 rounded-full transition hover:scale-125 focus:outline-hidden" />
    </RadixSlider.Root>
  )
}
