import { ISource } from "@/src/types"
import { useState, forwardRef, useImperativeHandle, } from "react"
import { FaRegWindowClose } from "react-icons/fa"

interface ISourcesInputProps {
    value?: ISource[]
    placeholder?: string
    requiredName?: boolean
    requiredUrl?: boolean
    placeholderName?: string
    placeholderUrl?: string
    onChange: (inputs: ISource[]) => void
}


export const SourcesInputField = forwardRef(function SourcesInputField(
    { 
        value = [],
        requiredName = false,
        requiredUrl = false,
        placeholderName = "Name",
        placeholderUrl = "Url path",
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
        <div className="w-full p-4 border border-gray-500 rounded-sm">
            {inputs.map((item, index) => (
                <div key={index}
                    className="flex flex-row gap-2 my-2 items-stretch"
                >
                    <div className="w-full">
                        <label>Name {requiredName ? "*" : ""}</label>
                        <input
                            type="text"
                            required={requiredName}
                            value={item?.name || ""}
                            onChange={(e) => handleChange(e.target.value, "name", index)}
                            placeholder={placeholderName}
                            className="w-full p-2 mb-2"
                        />
                    </div>
    
                    <div className="w-full">
                        <label>Url {requiredUrl ? "*" : ""}</label>
                        <input
                            type="text"
                            required={requiredUrl}
                            value={item?.url || ""}
                            onChange={(e) => handleChange(e.target.value, "url", index)}
                            placeholder={placeholderUrl}
                            className="w-full p-2 mb-2"
                        />
                    </div>

                    <div className="pt-3">
                        {   inputs?.length > 1 &&
                            <button 
                                className="doom-color-danger pt-4"
                                onClick={() => removeInputField(index)}
                            >
                                <FaRegWindowClose size="20px" />
                            </button>
                        }
                    </div>
                </div>
            ))}

            <div className="flex flex-row justify-between">
                <button
                    type="button"
                    onClick={() => addInputField(1)}
                    className="doom-secondary-btn mt-2 w-24"
                >
                    Add
                </button>
            </div>
        </div>
    )
})
