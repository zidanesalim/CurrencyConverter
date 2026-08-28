import { useState } from "react"
import { Button } from "@/components/ui/button.jsx"
import { convert } from "@/lib/currencyApi.js"

function ConvertButton({ amount, fromCurrency, toCurrency, onResult }) {
    const [loading, setLoading] = useState(false)

    async function handleConvert() {
        const parsed = Number.parseFloat(amount)
        if (!Number.isFinite(parsed)) {
            onResult(null)
            return
        }

        setLoading(true)

        try {
            const { value } = await convert(parsed, fromCurrency, toCurrency)
            // Sub-unit precision for tiny results, cents for everything else.
            onResult(Number(value.toFixed(value !== 0 && Math.abs(value) < 1 ? 6 : 2)))
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