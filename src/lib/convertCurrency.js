const ROBUX_DEVEX_USD_RATE = 0.0038

export async function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount
    }

    if (fromCurrency === "RBX") {
        const usdAmount = amount * ROBUX_DEVEX_USD_RATE

        if (toCurrency === "USD") {
            return usdAmount
        }

        return fetchConversion(usdAmount, "USD", toCurrency)
    }

    if (toCurrency === "RBX") {
        const usdAmount =
            fromCurrency === "USD"
                ? amount
                : await fetchConversion(amount, fromCurrency, "USD")

        return usdAmount / ROBUX_DEVEX_USD_RATE
    }

    return fetchConversion(amount, fromCurrency, toCurrency)
}

async function fetchConversion(amount, fromCurrency, toCurrency) {
    const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
    )

    if (!response.ok) {
        throw new Error(`Frankfurter API error: ${response.status}`)
    }

    const data = await response.json()

    return data.rates[toCurrency]
}