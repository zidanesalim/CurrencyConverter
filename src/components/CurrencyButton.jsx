import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {Input} from "@/components/ui/input.jsx";

function CurrencyButton({ readOnly, onChange, onCurrencyChange, result }) {
    return (
        <>
            <div className="flex flex-row gap-5 items-center justify-center w-full">
                {
                    readOnly
                        ?
                        <Input disabled className="bg-white text-black" placeholder="Converted Value..." value={result ?? ""} />
                        :
                        <Input onChange={(e) => onChange(e.target.value)} className="bg-white text-black" placeholder="Input Value..."/>
                }
                <Select onValueChange={onCurrencyChange}>
                    <SelectTrigger className="bg-white text-black w-26">
                        <SelectValue placeholder="CUR"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                        <SelectItem value="GBP">£ GBP</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    )
}

export default CurrencyButton
