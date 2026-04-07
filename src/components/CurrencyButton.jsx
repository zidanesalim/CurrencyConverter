import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {Input} from "@/components/ui/input.jsx";

function CurrencyButton({ readOnly, onChange, onCurrencyChange, result, currency }) {

    const currencies = [
        { code: "AUD", label: "Australian Dollar" },
        { code: "BRL", label: "Brazilian Real" },
        { code: "CAD", label: "Canadian Dollar" },
        { code: "CHF", label: "Swiss Franc" },
        { code: "CNY", label: "Chinese Renminbi Yuan" },
        { code: "CZK", label: "Czech Koruna" },
        { code: "DKK", label: "Danish Krone" },
        { code: "EUR", label: "Euro" },
        { code: "GBP", label: "British Pound" },
        { code: "HKD", label: "Hong Kong Dollar" },
        { code: "HUF", label: "Hungarian Forint" },
        { code: "IDR", label: "Indonesian Rupiah" },
        { code: "ILS", label: "Israeli New Shekel" },
        { code: "INR", label: "Indian Rupee" },
        { code: "ISK", label: "Icelandic Króna" },
        { code: "JPY", label: "Japanese Yen" },
        { code: "KRW", label: "South Korean Won" },
        { code: "MXN", label: "Mexican Peso" },
        { code: "MYR", label: "Malaysian Ringgit" },
        { code: "NOK", label: "Norwegian Krone" },
        { code: "NZD", label: "New Zealand Dollar" },
        { code: "PHP", label: "Philippine Peso" },
        { code: "PLN", label: "Polish Złoty" },
        { code: "RON", label: "Romanian Leu" },
        { code: "SEK", label: "Swedish Krona" },
        { code: "SGD", label: "Singapore Dollar" },
        { code: "THB", label: "Thai Baht" },
        { code: "TRY", label: "Turkish Lira" },
        { code: "USD", label: "United States Dollar" },
        { code: "ZAR", label: "South African Rand" },
    ]


    return (
        <>
            <div className="flex flex-row gap-5 items-center justify-center w-full">
                {
                    readOnly
                        ?
                        <Input disabled className="bg-white text-black font-bold" placeholder="Converted Value..." value={result ?? ""} />
                        :
                        <Input onChange={(e) => onChange(e.target.value)} className="bg-white text-black" placeholder="Input Value..."/>
                }
                <Select value={currency} onValueChange={onCurrencyChange}>
                    <SelectTrigger className="bg-white text-black w-60">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectContent>
                            {currencies.map((c) => (
                                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </SelectContent>
                </Select>
            </div>
        </>
    )
}

export default CurrencyButton
