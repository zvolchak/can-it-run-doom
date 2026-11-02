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
    error?: string
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
    error = "",
}: IInputWithLabelProps) {
    const id = `entry-${camelCase(title)}`
    // A trailing "*" in the title marks a required field; it is styled apart from the label text.
    const isRequired = /\s*\*$/.test(title)
    const label = title.replace(/\s*\*$/, "")

    return (
        <div className={`${className}`}>
            <label className="entry-form__label" htmlFor={id}>
                {label}
                {isRequired && <span className="entry-form__required" aria-hidden="true"> *</span>}
            </label>
            <input 
                required={required}
                id={id}
                type={type}
                name={name || camelCase(title)} 
                value={value ?? ""} 
                onChange={onChange} 
                onClick={onClick}
                placeholder={placeholder}
                className="w-full" 
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            {error && <p id={`${id}-error`} role="alert" className="entry-form__error">{error}</p>}
        </div>
    )
} // EntryRow
