import * as RadixSlider from '@radix-ui/react-slider'
import clsx from 'clsx'

export function Slider(props: RadixSlider.SliderProps) {
  const isHorizontal = props.orientation === 'horizontal'

  return (
    <RadixSlider.Root
      {...props}
      className={clsx(
        props.className,
        'relative flex h-full w-full cursor-pointer items-center',
        isHorizontal ? 'flex-row' : 'flex-col',
      )}
    >
      <RadixSlider.Track
        className={clsx(
          'relative flex items-center overflow-hidden rounded-md bg-gray-300',
          isHorizontal ? 'h-2 w-full flex-row' : 'h-full w-2 flex-col',
        )}
      >
        <RadixSlider.Range
          className={clsx('bg-purple-primary absolute flex', isHorizontal ? 'h-full' : 'w-2')}
        />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="bg-purple-hover hover:bg-purple-light flex h-3 w-3 rounded-full transition hover:scale-125 focus:outline-hidden" />
    </RadixSlider.Root>
  )
}
