import { ISource } from "@/src/types"
import { useState, forwardRef, useImperativeHandle, } from "react"
import { FaRegWindowClose } from "react-icons/fa"
import { MdAdd } from "react-icons/md"

interface ISourcesInputProps {
    value?: ISource[]
    placeholder?: string
    requiredName?: boolean
    requiredUrl?: boolean
    placeholderName?: string
    placeholderUrl?: string
    /** Text of the add button, e.g. "Add another author". */
    addLabel?: string
    onChange: (inputs: ISource[]) => void
}


export const SourcesInputField = forwardRef(function SourcesInputField(
    { 
        value = [],
        requiredName = false,
        requiredUrl = false,
        placeholderName = "Name",
        placeholderUrl = "Url path",
        addLabel = "Add another",
        onChange = null,
    }: ISourcesInputProps,
    ref
) {
    const emptyField = { name: "", url: ""}
    const [inputs, setInputs] = useState<ISource[]>(value?.length === 0 ? [emptyField] : value)

    function handleChange(value: string, field: string, index: number) {
        const newInputs = inputs.map(item => ({ ...item }))
        newInputs[index][field] = value

        setInputs(newInputs)
        onChange?.(newInputs)
    } // handleChange


    function removeInputField(index: number) {
        if (index >= inputs.length)
            return

        const newInputs = inputs.filter((_, i) => i !== index); // Create a new array without mutating
        setInputs(newInputs)

        onChange?.(newInputs)
    } // removeInputField


    function addInputField(sign: number) {
        let currInputs = [...inputs]
        if (sign > 0) {
            currInputs = [...currInputs, emptyField ]
        } else {
            currInputs.pop()
        }

        setInputs(currInputs)
    } // addInputField


    useImperativeHandle(ref, () => ({
        getAllInputs: (): ISource[] =>
            inputs.filter(item => item.name !== "" && item.url !== "")
    }))


    return (
        <div className="source-inputs">
            {inputs.map((item, index) => (
                <div key={index} className="source-inputs__row">
                    <div className="source-inputs__field">
                        <label>Name {requiredName ? "*" : ""}</label>
                        <input
                            type="text"
                            required={requiredName}
                            value={item?.name || ""}
                            onChange={(e) => handleChange(e.target.value, "name", index)}
                            placeholder={placeholderName}
                            className="w-full p-2"
                        />
                    </div>
    
                    <div className="source-inputs__field">
                        <label>Url {requiredUrl ? "*" : ""}</label>
                        <input
                            type="url"
                            inputMode="url"
                            autoCapitalize="off"
                            required={requiredUrl}
                            value={item?.url || ""}
                            onChange={(e) => handleChange(e.target.value, "url", index)}
                            placeholder={placeholderUrl}
                            className="w-full p-2"
                        />
                    </div>

                    {inputs?.length > 1 &&
                        <button 
                            type="button"
                            className="source-inputs__remove"
                            aria-label={`Remove row ${index + 1}`}
                            onClick={() => removeInputField(index)}
                        >
                            <FaRegWindowClose size="18px" aria-hidden="true" />
                        </button>
                    }
                </div>
            ))}

            <button
                type="button"
                onClick={() => addInputField(1)}
                className="source-inputs__add"
            >
                <MdAdd size={18} aria-hidden="true" />
                {addLabel}
            </button>
        </div>
    )
})
