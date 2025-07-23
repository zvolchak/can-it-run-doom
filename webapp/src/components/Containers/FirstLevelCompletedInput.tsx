interface IProps {
    value?: string | null
    onChange?: (value: boolean | null) => void
}


export function FirstLevelCompletedInput({
    value = null,
    onChange = null
}: IProps) {
    const incomingValue = value === null ? -1 : Number(value.toLocaleLowerCase() === "true" ? 1 : -1)

    function onSelected(e: any) {
        const targetValue = Number(e.target.value)
        let nextState = null
        if (targetValue === 1)
            nextState = true
        if (targetValue === 0)
            nextState = false
        onChange?.(nextState)
    } // onChange


    return (
        <div className="my-4 w-full">
            <label className="flex items-center justify-center">
                <div className="w-full text-left pl-10">
                    First Level Completed
                </div>
                <div className="flex flex-row w-1/2 justify-start">
                    <select
                        className="doom-select"
                        id="max_value_select"
                        name="max_value"
                        value={incomingValue}
                        onChange={onSelected}
                    >
                        <option value={-1}>
                            All
                        </option>
                        <option value={1}>
                            Yes
                        </option>
                        <option value={0}>
                            No
                        </option>
                    </select>
                </div>
            </label>
        </div>   
    ) // return
} 
