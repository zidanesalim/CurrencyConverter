import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {Input} from "@/components/ui/input.jsx";
import { currencies } from "@/data/currencies.js"
import { useIsMobile } from "@/hooks/useMobile.js"

function CurrencyButton({ readOnly, onChange, onCurrencyChange, result, currency }) {

    const isMobile = useIsMobile()
    const selectedLabel = currencies.find((c) => c.code === currency)?.label ?? currency

    return (
        <>
            <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-center justify-center w-full">
                {
                    readOnly
                        ?
                        <Input disabled className="bg-white text-black font-bold w-full md:flex-1 md:min-w-0" placeholder="Converted Value..." value={result ?? ""} />
                        :
                        <Input onChange={(e) => onChange(e.target.value)} className="bg-white text-black w-full md:flex-1 md:min-w-0" placeholder="Input Value..."/>
                }
                <Select value={currency} onValueChange={onCurrencyChange}>
                    <SelectTrigger className="bg-white text-black w-full md:w-60 md:shrink-0">
                        <SelectValue>{isMobile ? currency : selectedLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {currencies.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    )
}

export default CurrencyButton
