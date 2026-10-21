import { useState } from "react"
import { Button } from "../ui/primitives";
type TableFilterProps = {
    value?: string
    options: string[];
    onSelect: (value: string) => void;
}
export function TableColumnFilter({
    onSelect,
    options,
    value
}: TableFilterProps) {
    const [open, setOpen] = useState<Boolean>(false);
    return <div>
        <Button className="border-none p-0 m-0 bg-none size-3" onClick={() => setOpen((v) => !v)}>F</Button>
        {open && <div className="absolute">
            <div className=" bg-white border rounded-lg p-2">
                <select onChange={(event) => { onSelect(event.currentTarget.value);  setOpen(false) }} value={value}>
                    <option value="">All</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </div>}

    </div>
}