import CurrencyButton from "./components/CurrencyButton";
import Footer from "@/components/Footer.jsx";
import ConvertButton from "@/components/ConvertButton.jsx";
import { useState } from 'react'



function App() {

    const [amount, setAmount] = useState("")
    const [fromCurrency, setFromCurrency] = useState("USD")
    const [toCurrency, setToCurrency] = useState("EUR")
    const [result, setResult] = useState(null)

    return (
        <>
            <div
                className="overflow-x-hidden min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#3C87B1] to-[#0B3D91]">

                <main className="flex flex-col flex-1 items-center">

                    <img src="/CurrencyConvertIcon.png" className="h-40 md:h-80 lg:h-100 w-auto"
                         alt="Currency Converter icon"/>
                    <div className="flex flex-col justify-center items-center gap-4">
                        <CurrencyButton
                            readOnly={false}
                            onChange={setAmount}
                            onCurrencyChange={setFromCurrency}
                        />
                        <ConvertButton
                            amount={amount}
                            fromCurrency={fromCurrency}
                            toCurrency={toCurrency}
                            onResult={setResult}
                        />
                        <CurrencyButton
                            readOnly={true}
                            result={result}
                            onCurrencyChange={setToCurrency}
                        />
                    </div>

                </main>

                <Footer/>

            </div>
        </>
    )
}

export default App
