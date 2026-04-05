import {Button} from "@/components/ui/button.jsx";

function ConvertButton({ amount, fromCurrency, toCurrency, onResult }) {

    async function handleConvert() {
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`)
        const data = await response.json()
        onResult(data.rates[toCurrency])
    }

    return (
        <div className="flex flex-col justify-center items-center w-35 h-30 bg-[url(/gears.png)] bg-contain">
            <Button onClick={handleConvert} variant="outline" size="lg">
                <span className="">Convert</span>
            </Button>
        </div>
    )
}

export default ConvertButton
