import { useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input.jsx"
import { Button } from "@/components/ui/button.jsx"
import { currenciesFrom, labelFor } from "@/data/currencies.js"
import { devexTiers, tierById, defaultTier, robuxToUsd, usdToRobux, minPayoutRobux } from "@/data/devex.js"
import { BASE_CURRENCY, rateBetweenOrNull } from "@/lib/currencyApi.js"
import { useIsMobile } from "@/hooks/useMobile.js"

const robuxFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

function formatMoney(value, currency) {
    try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value)
    } catch {
        // Intl rejects non-ISO codes such as the crypto pairs CurrencyAPI returns.
        return `${value.toFixed(2)} ${currency}`
    }
}

/** Fixed-width trailing slot so the Robux and cash rows line up. */
const SLOT = "w-full md:w-60 md:shrink-0"

function RobuxSlot() {
    return (
        <div className={`${SLOT} h-8 flex items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 text-sm text-white`}>
            Robux
        </div>
    )
}

function DevexConverter({ table }) {

    const isMobile = useIsMobile()
    const [amount, setAmount] = useState("")
    const [tierId, setTierId] = useState(defaultTier.id)
    const [currency, setCurrency] = useState(BASE_CURRENCY)
    const [robuxFirst, setRobuxFirst] = useState(true)

    const tier = tierById(tierId)
    const currencies = currenciesFrom(table)

    // USD needs no rate, so the DevEx maths works before the table has loaded.
    const perUsd = currency === BASE_CURRENCY
        ? 1
        : rateBetweenOrNull(table, BASE_CURRENCY, currency)

    const parsed = Number.parseFloat(amount)
    const hasAmount = Number.isFinite(parsed) && parsed >= 0 && perUsd !== null

    // Robux → USD at the DevEx rate, then USD → the chosen currency (or back).
    const robux = robuxFirst ? parsed : usdToRobux(parsed / perUsd, tier)
    const cash = robuxFirst ? robuxToUsd(parsed, tier) * perUsd : parsed

    const result = !hasAmount
        ? ""
        : robuxFirst
            ? formatMoney(cash, currency)
            : robuxFormat.format(robux)

    const belowMinimum = hasAmount && robux > 0 && robux < minPayoutRobux

    const currencySlot = (
        <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className={`bg-white text-black ${SLOT}`}>
                <SelectValue>{isMobile ? currency : labelFor(currency)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )

    return (
        <div className="w-full rounded-2xl bg-black/30 ring-1 ring-white/20 backdrop-blur-md p-5 flex flex-col gap-4">

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-white font-bold text-lg">DevEx Calculator</h2>
                <Select value={tierId} onValueChange={setTierId}>
                    <SelectTrigger className="bg-white text-black w-full sm:w-64">
                        <SelectValue>{tier.label} — {tier.description}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {devexTiers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.label} — {t.description}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-center justify-center w-full">
                <Input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white text-black w-full md:flex-1 md:min-w-0"
                    placeholder={robuxFirst ? "Robux amount..." : "Cash amount..."}
                />
                {robuxFirst ? <RobuxSlot /> : currencySlot}
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={() => setRobuxFirst((previous) => !previous)}
                    aria-label="Swap conversion direction"
                    variant="outline"
                    size="icon"
                >
                    <ArrowUpDown />
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-center justify-center w-full">
                <Input
                    disabled
                    value={result}
                    className="bg-white text-black font-bold w-full md:flex-1 md:min-w-0"
                    placeholder={robuxFirst ? "Cash value..." : "Robux value..."}
                />
                {robuxFirst ? currencySlot : <RobuxSlot />}
            </div>

            {belowMinimum && (
                <p className="text-xs text-amber-200">
                    Roblox requires at least {robuxFormat.format(minPayoutRobux)} Robux to cash out.
                </p>
            )}

        </div>
    )
}

export default DevexConverter
