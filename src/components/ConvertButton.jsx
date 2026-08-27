import { useState } from "react"
import { Button } from "@/components/ui/button.jsx"
import { convertCurrency } from "@/lib/convertCurrency.js"

function ConvertButton({ amount, fromCurrency, toCurrency, onResult }) {
    const [loading, setLoading] = useState(false)

    async function handleConvert() {
        setLoading(true)

        try {
            const result = await convertCurrency(
                Number(amount),
                fromCurrency,
                toCurrency
            )

            onResult(result)
        } catch (error) {
            console.error("Conversion failed:", error)
            onResult(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center w-35 h-30 bg-[url(/gears.png)] bg-contain">
            <Button
                onClick={handleConvert}
                disabled={loading}
                variant="outline"
                size="lg"
            >
                <span>{loading ? "Converting..." : "Convert"}</span>
            </Button>
        </div>
    )
}

export default ConvertButton