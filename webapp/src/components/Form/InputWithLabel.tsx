import { useState } from "react"
import camelCase from "lodash/camelCase"


interface IInputWithLabelProps {
    title: string
    value: string
    name?: string | null
    required?: boolean
    placeholder?: string
    type?: string
    onChange?: (e) => void
    onClick?: (e) => void
    className?: string
}


export function InputWithLabel({ 
    title,
    value,
    name = null,
    required = false,
    placeholder = "",
    type = "text",
    onChange = null,
    onClick = null,
    className="",
}: IInputWithLabelProps) {
    const id = `entry_row: ${title}`
    const [inputValue, setInputValue] = useState(value)

    function onInputChange(event) {
        setInputValue(event.value)
        onChange?.(event)
    }

    return (
        <div className={`${className}`}>
            <label 
                className="block mb-1"
                htmlFor={id}
            >
                {title}
            </label>
            <input 
                required={required}
                id={id}
                type={type}
                name={name || camelCase(title)} 
                value={inputValue} 
                onChange={onInputChange} 
                onClick={onClick}
                placeholder={placeholder}
                className="w-full" 
            />
        </div>
    )
} // EntryRow
