export const currencies = [
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

const displayNames = (() => {
    try {
        return new Intl.DisplayNames(["en"], { type: "currency" })
    } catch {
        return null
    }
})()

/** Human-readable name for an ISO code, falling back to the code itself. */
export function labelFor(code) {
    const known = currencies.find((c) => c.code === code)
    if (known) return known.label
    try {
        // Throws RangeError for the non-ISO-4217 codes (crypto, metals) that
        // CurrencyAPI mixes into its list.
        const name = displayNames?.of(code)
        return name && name !== code ? name : code
    } catch {
        return code
    }
}

/**
 * Builds the selectable currency list from whatever the live rate table
 * offers — ~170 currencies with a key, ~30 on the keyless fallback — so the
 * dropdown never lists a pair the API cannot actually convert.
 */
export function currenciesFrom(table) {
    if (!table) return currencies
    return Object.keys(table.rates)
        .map((code) => ({ code, label: labelFor(code) }))
        .sort((a, b) => a.label.localeCompare(b.label))
}
