import React from 'react'
import { Select } from '@/components'
import { formatInstrumentName } from '@/utils'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { ArrowLeft } from 'react-feather'
import { useRouter } from 'next/router'

type TopBarProps = {
  isError: boolean
  isLoading: boolean
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
}

export default function TopBar({ isError, isLoading, value, onChange }: TopBarProps) {
  const router = useRouter()

  return (
    <div className="px-2 color-white transition text-2xl h-[50px] min-h-[50px] w-full bg-[#292929] flex items-center">
      <ArrowLeft
        className="text-white hover:text-purple-hover cursor-pointer transition"
        width={50}
        height={40}
        onClick={() => router.back()}
      />
      <Select
        className="ml-auto max-w-fit h-3/4 text-base"
        loading={isLoading}
        error={isError}
        value={value}
        onChange={onChange}
        options={gmInstruments as any}
        format={formatInstrumentName}
        display={formatInstrumentName}
      />
    </div>
  )
}
