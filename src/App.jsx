import CurrencyButton from "./components/CurrencyButton";
import Footer from "@/components/Footer.jsx";
import ConvertButton from "@/components/ConvertButton.jsx";
import DevexConverter from "@/components/DevexConverter.jsx";
import { socialLinks } from "@/data/socialLinks.js";
import { currenciesFrom } from "@/data/currencies.js";
import { useRateTable } from "@/hooks/useRateTable.js";
import { useState } from 'react'
import SwitchButton from "./components/SwitchButton";



function App() {

    const [amount, setAmount] = useState("")
    const [fromCurrency, setFromCurrency] = useState("USD")
    const [toCurrency, setToCurrency] = useState("EUR")
    const [result, setResult] = useState(null)

    function handleSwitch() {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
        setResult(null)
    }

    const { table, loading, error } = useRateTable()
    const currencies = currenciesFrom(table)

    return (
        <>
            <div
                className="relative overflow-x-hidden min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#3C87B1] to-[#0B3D91]">

                {/* Background artwork, with a scrim so the controls stay legible. */}
                <div
                    aria-hidden="true"
                    className="fixed inset-0 bg-[url(/background.webp)] bg-cover bg-center bg-no-repeat"
                />
                <div
                    aria-hidden="true"
                    className="fixed inset-0 bg-gradient-to-b from-[#3C87B1]/70 via-[#0B3D91]/60 to-black/80"
                />

                <div className="relative z-10 w-full max-w-2xl flex flex-col flex-1 items-center">

                    <main className="w-full flex flex-col flex-1 justify-center items-center gap-6 px-4 sm:px-6 py-8">

                        <img src="/CurrencyConvertIcon.png" className="h-28 md:h-44 w-auto drop-shadow-lg"
                             alt="Currency Converter icon"/>

                        <div className="w-full rounded-2xl bg-black/30 ring-1 ring-white/20 backdrop-blur-md p-5 flex flex-col justify-center items-center gap-4">
                            <CurrencyButton
                                readOnly={false}
                                onChange={setAmount}
                                onCurrencyChange={setFromCurrency}
                                currency={fromCurrency}
                                currencies={currencies}
                            />
                            <div className="flex items-center gap-4">
                                <ConvertButton
                                    amount={amount}
                                    fromCurrency={fromCurrency}
                                    toCurrency={toCurrency}
                                    onResult={setResult}
                                />

                                <SwitchButton onSwitch={handleSwitch} />
                            </div>

                            <CurrencyButton
                                readOnly={true}
                                result={result}
                                onCurrencyChange={setToCurrency}
                                currency={toCurrency}
                                currencies={currencies}
                            />
                        </div>

                        <DevexConverter table={table}/>

                        <p className="text-xs text-white/60 h-4">
                            {loading && "Loading exchange rates..."}
                            {error && "Live rates unavailable — check your connection or API key."}
                            {table && `${currencies.length} currencies · rates from ${table.source} · updated ${new Date(table.updatedAt ?? table.fetchedAt).toLocaleDateString()}`}
                        </p>

                    </main>

                    <Footer name="Salim Zidane" socialLinks={socialLinks}/>

                </div>

            </div>
        </>
    )
}

export default App
