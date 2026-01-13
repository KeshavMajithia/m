import { supabase } from '../lib/supabase';
import { ZoneMapping, CourierRate, calculateRate, normalizeCountry } from './rateMatching';

export interface RateResult {
    carrier: string;
    service_type: string;
    rate: string;
    zone?: string;
    rawPrice: number;
}


/**
 * Optimized fetch for specific country and weight.
 * Avoids fetching all 5000+ rates to client.
 */
export async function getRatesForCountry(
    country: string,
    weight: number
): Promise<{
    results: RateResult[];
    zone_mappings: Record<string, string>;
    country: string;
    weight: number;
}> {
    const normCountry = normalizeCountry(country);

    // 1. Fetch ALL zone mappings (Small dataset, ~700 rows, safe to fetch all for simplicity)
    // Or we could filter, but normalization makes SQL filtering tricky.
    const { data: allMappings, error: mapError } = await supabase
        .from('zone_mappings')
        .select('*');

    if (mapError) {
        console.error('Error fetching mappings:', mapError);
        throw new Error('Failed to fetch zone mappings');
    }

    // 2. Identify potential location keys (Zones + Country Name)
    const validKeys = new Set<string>();
    validKeys.add(normCountry); // Direct match (e.g. "CANADA")

    // Add common aliases for carriers that use raw codes (e.g. Aramex uses "UK")
    if (normCountry === 'UNITED KINGDOM') {
        validKeys.add('UK');
        validKeys.add('GREAT BRITAIN');
    }
    if (normCountry === 'USA') {
        validKeys.add('UNITED STATES');
        validKeys.add('US');
    }
    if (normCountry === 'U.A.E.') {
        validKeys.add('UAE');
        validKeys.add('UNITED ARAB EMIRATES');
    }

    // Find zones for this country in the mappings
    // We do this locally to handle case-insensitive/normalization logic reliably
    const relevantMappings = allMappings.filter(m => normalizeCountry(m.country) === normCountry);
    relevantMappings.forEach(m => validKeys.add(m.zone));

    // 3. Fetch Rates from Supabase with Server-Side Filtering
    // We want rates where:
    // location_key IN (validKeys) AND weight_start <= weight AND weight_end >= weight
    // Note: weight_end >= weight handled by filtering or logic.
    // Since weight ranges can be "20+" (end=999), we must ensure we get multiple matches if ranges overlap?
    // Usually ranges don't overlap for same service/carrier.

    const lookupWeight = Math.ceil(weight * 2) / 2; // Ceil to nearest 0.5

    const zoneKeys = Array.from(relevantMappings).map(m => m.zone);

    // EXPAND ZONES: Map "F" -> ["F", "Zone F", "ZONE F"] to match DB keys
    const expandedZones = new Set<string>(zoneKeys);
    zoneKeys.forEach(z => {
        if (!z.toLowerCase().includes('zone')) {
            expandedZones.add(`Zone ${z}`);
            expandedZones.add(`ZONE ${z}`);
        }
    });

    let orQuery = `location_key.ilike.${normCountry}%`; // Matches "AUSTRALIA", "AUSTRALIA - METRO"

    if (expandedZones.size > 0) {
        // location_key.in.(Z1,Z2)
        const zArr = Array.from(expandedZones);
        const zStr = `(${zArr.map(z => `"${z}"`).join(',')})`;
        orQuery += `,location_key.in.${zStr}`;
    }

    // Also include strict aliases (UK, USA) if they are not covered by ilike (e.g. "UNITED KINGDOM" vs "UK")
    const aliases = Array.from(validKeys).filter(k => !k.startsWith(normCountry) && !zoneKeys.includes(k));
    if (aliases.length > 0) {
        const aStr = `(${aliases.map(a => `"${a}"`).join(',')})`;
        orQuery += `,location_key.in.${aStr}`;
    }

    const { data: rates, error: rateError } = await supabase
        .from('courier_rates')
        .select('*')
        .or(orQuery)
        .lte('weight_start', lookupWeight);

    if (rateError) {
        console.error('Error fetching rates:', rateError);
        throw new Error('Failed to fetch rates');
    }

    // 4. Calculate Results locally
    // (We still use calculateRate logic but with valid subset of rates)
    const results: RateResult[] = [];
    const zoneInfo: Record<string, string> = {};

    const carriers = Array.from(new Set(rates.map(r => r.carrier)));

    for (const carrier of carriers) {
        const result = calculateRate(carrier, country, weight, allMappings, rates);

        if (result) {
            // Find specific zone for this carrier to display
            const zoneMap = relevantMappings.find(m => m.carrier.toLowerCase() === carrier.toLowerCase());
            if (zoneMap) {
                zoneInfo[`${carrier.toLowerCase()}_zone`] = zoneMap.zone;
            }

            results.push({
                carrier: carrier,
                service_type: result.service_type || 'Standard',
                rate: `₹${Math.round(result.price).toLocaleString('en-IN')}`,
                zone: zoneMap?.zone,
                rawPrice: result.price
            });
        }
    }

    // Sort by price (lowest first)
    results.push(...manualFixesForDisplay(country, weight)); // Optional hacks if needed
    results.sort((a, b) => a.rawPrice - b.rawPrice);

    return {
        results,
        zone_mappings: zoneInfo,
        country,
        weight
    };
}

// Temporary manual fix hook if needed (currently empty as we rely on DB)
function manualFixesForDisplay(country: string, weight: number): RateResult[] {
    return [];
}
