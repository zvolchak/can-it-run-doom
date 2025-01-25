import React from "react"

interface FilterProps {
  minOptions: { value: string, label: string }[]
  maxOptions: { value: string, label: string }[]
  minLabel?: string
  maxLabel?: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  className?: string
  minValue?: string
  maxValue?: string
}

export const RangePicker: React.FC<FilterProps> = ({
  minOptions,
  maxOptions,
  onMinChange,
  onMaxChange,
  minLabel = "Min",
  maxLabel = "Max",
  className = "",
  minValue = null,
  maxValue = null,
}) => {
  return (
    <div className={`p-4 doom-color-slate ${className}`}>
      <div className="flex space-x-4" role="group">
        <div className="w-full">
          <label htmlFor="min_value_select" className="block text-sm font-medium  mb-1">
            {minLabel}
          </label>
          <select
            className="doom-select w-full p-2"
            id="min_value_select"
            name="min_value"
            value={minValue ? minValue : minOptions[0].value}
            onClick={(e: any) => onMinChange(e.target.value)}
          >
            {minOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label htmlFor="max_value_select" className="block text-sm font-medium mb-1">
            {maxLabel}
          </label>

          <select
            className="doom-select w-full p-2"
            id="max_value_select"
            name="max_value"
            value={maxValue ? maxValue : maxOptions[0].value}
            onChange={(e: any) => onMaxChange(e.target.value)}
          >
            {maxOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

        </div>
      </div>
    </div>
  )
}
