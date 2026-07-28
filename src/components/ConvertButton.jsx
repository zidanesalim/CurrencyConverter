import { useState } from "react";
import {Button} from "@/components/ui/button.jsx";

function ConvertButton({ amount, fromCurrency, toCurrency, onResult }) {

    const [loading, setLoading] = useState(false)

    async function handleConvert() {
        setLoading(true)
        try {
            const response = await fetch(`https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`)
            if (!response.ok) {
                throw new Error(`Frankfurter API error: ${response.status}`)
            }
            const data = await response.json()
            onResult(data.rates[toCurrency])
        } catch (error) {
            console.error("Conversion failed:", error)
            onResult(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center w-35 h-30 bg-[url(/gears.png)] bg-contain">
            <Button onClick={handleConvert} disabled={loading} variant="outline" size="lg">
                <span className="">{loading ? "Converting..." : "Convert"}</span>
            </Button>
        </div>
    )
}

export default ConvertButton
