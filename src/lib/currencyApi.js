const API_KEY = import.meta.env.VITE_CURRENCY_API_KEY

const CURRENCY_API_URL = "https://api.currencyapi.com/v3/latest"
const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest"

// Every rate is stored against USD, so a single request covers every pair the
// app can offer. CurrencyAPI's free tier allows 300 requests/month, so we cache
// the table for an hour rather than hitting the network per conversion.
export const BASE_CURRENCY = "USD"
const CACHE_KEY = "currency-converter:rates"
const CACHE_TTL_MS = 60 * 60 * 1000

let inFlight = null

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const table = JSON.parse(raw)
        if (Date.now() - table.fetchedAt > CACHE_TTL_MS) return null
        return table
    } catch {
        // Private mode, disabled storage, or a stale shape from an older build.
        return null
    }
}

function writeCache(table) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(table))
    } catch {
        // Caching is an optimisation, never a requirement.
    }
}

async function fetchFromCurrencyApi() {
    const url = `${CURRENCY_API_URL}?base_currency=${BASE_CURRENCY}`
    const response = await fetch(url, { headers: { apikey: API_KEY } })
    if (!response.ok) {
        throw new Error(`CurrencyAPI error: ${response.status}`)
    }
    const { data, meta } = await response.json()
    const rates = Object.fromEntries(
        Object.entries(data).map(([code, entry]) => [code, entry.value])
    )
    return { rates, updatedAt: meta?.last_updated_at ?? null, source: "currencyapi" }
}

async function fetchFromFrankfurter() {
    const response = await fetch(`${FRANKFURTER_URL}?base=${BASE_CURRENCY}`)
    if (!response.ok) {
        throw new Error(`Frankfurter API error: ${response.status}`)
    }
    const { rates, date } = await response.json()
    return { rates, updatedAt: date, source: "frankfurter" }
}

/**
 * Resolves the USD-based rate table, preferring CurrencyAPI (≈170 currencies)
 * and falling back to the keyless Frankfurter API (≈30) when no key is
 * configured or the request fails.
 */
export function getRateTable() {
    const cached = readCache()
    if (cached) return Promise.resolve(cached)
    if (inFlight) return inFlight

    inFlight = (async () => {
        let table
        try {
            table = API_KEY ? await fetchFromCurrencyApi() : await fetchFromFrankfurter()
        } catch (error) {
            if (!API_KEY) throw error
            console.warn("CurrencyAPI unavailable, falling back to Frankfurter:", error)
            table = await fetchFromFrankfurter()
        }

        // The base is implicit in both APIs' responses but needed for cross-rates.
        table.rates[BASE_CURRENCY] = 1
        table.fetchedAt = Date.now()
        writeCache(table)
        return table
    })().finally(() => {
        inFlight = null
    })

    return inFlight
}

/**
 * Cross-rate between two currencies, derived from the USD-based table, or null
 * when the table is missing either side. Safe to call during render.
 */
export function rateBetweenOrNull(table, from, to) {
    const fromRate = table?.rates?.[from]
    const toRate = table?.rates?.[to]
    if (!fromRate || !toRate) return null
    return toRate / fromRate
}

/** Cross-rate between two currencies. Throws when the pair is unavailable. */
export function rateBetween(table, from, to) {
    const rate = rateBetweenOrNull(table, from, to)
    if (rate === null) {
        throw new Error(`No rate available for ${from} → ${to}`)
    }
    return rate
}

export async function convert(amount, from, to) {
    const table = await getRateTable()
    return {
        value: amount * rateBetween(table, from, to),
        rate: rateBetween(table, from, to),
        updatedAt: table.updatedAt,
        source: table.source,
    }
}
