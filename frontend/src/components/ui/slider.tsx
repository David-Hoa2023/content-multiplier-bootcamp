'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min: number
  max: number
  step: number
  className?: string
}

export function Slider({ value, onValueChange, min, max, step, className }: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(e.target.value)])
  }

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={cn(
        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider",
        className
      )}
      style={{
        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
          ((value[0] - min) / (max - min)) * 100
        }%, #E5E7EB ${((value[0] - min) / (max - min)) * 100}%, #E5E7EB 100%)`
      }}
    />
  )
}