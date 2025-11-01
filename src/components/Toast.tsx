import * as RadixToast from '@radix-ui/react-toast'

interface props {
  open: boolean
  title: string
  description?: string
  toastKey: string
  onOpenChange: (open: boolean) => void
}

export default function Toast({ open, description, title, toastKey, onOpenChange}: props) {
  return (
    <RadixToast.Root
      open={open}
      onOpenChange={onOpenChange}
      className="flex flex-col gap-1 rounded-lg bg-[#292929] p-4 text-white shadow-lg"
      key={toastKey}
    >
      <RadixToast.Title className="font-semibold">{title}</RadixToast.Title>
      <RadixToast.Description className="text-xs text-gray-300">
        {description}
      </RadixToast.Description>
    </RadixToast.Root>
  )
}
