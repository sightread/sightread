import clsx from 'clsx'

type TextInputProps = {
  type: string
  onChange: any
  name?: string
  className?: string
  error?: boolean
  placeholder?: string
}
export function TextInput(props: TextInputProps) {
  const { onChange, name, className, error, type, placeholder } = props
  return (
    <input
      type={type}
      name={name}
      onChange={onChange}
      className={clsx(
        className,
        'text-base rounded-md p-2 shadow-[inset_0px_1px_4px_rgba(0,0,0,0.25)]',
        error && 'outline outline-red-600',
      )}
      placeholder={placeholder}
    />
  )
}
