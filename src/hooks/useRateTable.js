import { useEffect, useState } from "react"
import { getRateTable } from "@/lib/currencyApi.js"

/**
 * Loads the shared USD-based rate table once per session. Both converters read
 * from the same result, so switching currencies costs no extra requests.
 */
export function useRateTable() {
    const [state, setState] = useState({ table: null, loading: true, error: null })

    useEffect(() => {
        let cancelled = false

        getRateTable()
            .then((table) => {
                if (!cancelled) setState({ table, loading: false, error: null })
            })
            .catch((error) => {
                console.error("Failed to load exchange rates:", error)
                if (!cancelled) setState({ table: null, loading: false, error })
            })

        return () => {
            cancelled = true
        }
    }, [])

    return state
}
