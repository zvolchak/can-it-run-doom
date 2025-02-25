import { useState, forwardRef, useImperativeHandle, } from "react"
import { FaRegWindowClose } from "react-icons/fa"

interface ISourcesInputProps {
    value?: string[][]
    placeholder?: string
    requiredName?: boolean
    requiredUrl?: boolean
    placeholderName?: string
    placeholderUrl?: string
    onChange: (inputs: string[][]) => void
}


export const SourcesInputField = forwardRef(function SourcesInputField(
    { 
        value = [["", ""]],
        requiredName = false,
        requiredUrl = false,
        placeholderName = "Name",
        placeholderUrl = "Url path",
        onChange = null,
    }: ISourcesInputProps,
    ref
) {
    const [inputs, setInputs] = useState(value?.length === 0 ? [["", ""]] : value)

    function handleChange(value: string, field: string, index: number, subIndex: number) {
        const newInputs = [...inputs]
        newInputs[index][subIndex] = value
        setInputs(newInputs)

        onChange?.(inputs)
    } // handleChange


    function removeInputField(index: number) {
        if (index >= inputs.length)
            return
        setInputs(inputs.splice(index, 1))

        onChange?.(inputs)
    } // removeInputField


    function addInputField(sign: number) {
        let currInputs = [...inputs]
        if (sign > 0) {
            currInputs = [...currInputs, ["", ""]]
        } else {
            currInputs.pop()
        }

        setInputs(currInputs)
    } // addInputField


    // Expose this function to parent component via "ref"
    useImperativeHandle(ref, () => ({
        getAllInputs: (): string[][] =>
            inputs.filter(item => item[0] !== "" && item[1] !== "")
    }))


    return (
        <div className="w-full p-4 border border-gray-600 rounded-md">
            {inputs.map((input, index) => (
                <div key={index}
                    className="flex flex-row gap-2 my-2 items-stretch"
                >
                    <div className="w-full">
                        <label>Name {requiredName ? "*" : ""}</label>
                        <input
                            type="text"
                            required={requiredName}
                            value={input[0]}
                            onChange={(e) => handleChange(e.target.value, "name", index, 0)}
                            placeholder={placeholderName}
                            className="w-full p-2 mb-2 border rounded"
                        />
                    </div>
    
                    <div className="w-full">
                        <label>Url {requiredUrl ? "*" : ""}</label>
                        <input
                            type="text"
                            required={requiredUrl}
                            value={input[1]}
                            onChange={(e) => handleChange(e.target.value, "url", index, 1)}
                            placeholder={placeholderUrl}
                            className="w-full p-2 mb-2 border rounded"
                        />
                    </div>

                    <div className="pt-3">
                        {   inputs?.length > 1 &&
                            <button 
                                className="doom-color-danger pt-2"
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
                    className="doom-action-btn mt-2 w-24"
                >
                    Add
                </button>
            </div>
        </div>
    )
})
