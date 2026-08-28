/**
 * Roblox Developer Exchange (DevEx) payout rates, expressed the way Roblox
 * quotes them: USD per 100 Robux.
 */
export const devexTiers = [
    {
        id: "standard",
        label: "Standard",
        description: "$0.38 per 100 Robux",
        usdPer100: 0.38,
    },
    {
        id: "us18plus",
        label: "18+ (US)",
        description: "$0.54 per 100 Robux",
        usdPer100: 0.54,
    },
]

export const defaultTier = devexTiers[0]

/** Roblox will not process a DevEx payout below this balance. */
export const minPayoutRobux = 30_000

export function tierById(id) {
    return devexTiers.find((tier) => tier.id === id) ?? defaultTier
}

export function robuxToUsd(robux, tier) {
    return (robux / 100) * tier.usdPer100
}

export function usdToRobux(usd, tier) {
    return (usd / tier.usdPer100) * 100
}
