
import { SupabaseClient } from '@supabase/supabase-js';

// Types
export interface ZoneMapping {
    carrier: string;
    country: string;
    zone: string;
}

export interface CourierRate {
    id: string;
    carrier: string;
    service_type: string;
    location_key: string;
    weight_start: number;
    weight_end: number;
    rate: number;
    is_per_kg: boolean;
}

/**
 * Standardize country names to match common variations in the PDF.
 */
export const normalizeCountry = (country: string): string => {
    const c = country.trim().toUpperCase();
    if (['USA', 'UNITED STATES', 'U.S.A.', 'US'].includes(c)) return 'USA';
    if (['UK', 'UNITED KINGDOM', 'GREAT BRITAIN', 'ENGLAND'].includes(c)) return 'UNITED KINGDOM';
    if (['UAE', 'UNITED ARAB EMIRATES', 'U.A.E.'].includes(c)) return 'U.A.E.';
    if (['SOUTH KOREA', 'KOREA, REPUBLIC OF'].includes(c)) return 'SOUTH KOREA';
    return c;
};

/**
 * Find the applicable Zone Code for a Carrier + Country.
 */
export const resolveZone = (
    carrier: string,
    country: string,
    mappings: ZoneMapping[]
): string | null => {
    const normCountry = normalizeCountry(country);
    const match = mappings.find(m =>
        m.carrier.toLowerCase() === carrier.toLowerCase() &&
        normalizeCountry(m.country) === normCountry
    );
    if (match) return match.zone;
    return null;
};

/**
 * Calculate the Final Price for a specific Carrier query.
 */
export const calculateRate = (
    carrier: string,
    country: string,
    weight: number,
    mappings: ZoneMapping[],
    rates: CourierRate[]
): { price: number; breakdown: string; service_type?: string } | null => {

    // 1. Validate Weight (Ceiling 0.5)
    const lookupWeight = Math.ceil(weight * 2) / 2;

    // 2. Determine Location Key
    const zone = resolveZone(carrier, country, mappings);

    const potentialLocationKeys = [normalizeCountry(country)];
    if (zone) {
        potentialLocationKeys.push(zone);
        // Expand Zone variants to match DB keys like "Zone F"
        if (!zone.toLowerCase().includes('zone')) {
            potentialLocationKeys.push(`ZONE ${zone}`);
            potentialLocationKeys.push(`Zone ${zone}`);
        }
    }

    // 3. Filter Rates
    const carrierRates = rates.filter(r =>
        r.carrier.toLowerCase() === carrier.toLowerCase() &&
        potentialLocationKeys.some(k => k === normalizeCountry(r.location_key))
    );

    if (carrierRates.length === 0) return null;

    // 4. Find Best Weight Match
    const match = carrierRates.find(r =>
        r.weight_start <= lookupWeight &&
        r.weight_end >= lookupWeight
    );

    if (!match) return null;

    // 5. Calculate Final Price
    let finalPrice = match.rate;
    let description = `Base Rate: ₹${match.rate}`;

    if (match.is_per_kg) {
        finalPrice = match.rate * lookupWeight;
        description = `Per Kg Rate: ₹${match.rate} * ${lookupWeight}kg`;
    }

    return {
        price: finalPrice,
        breakdown: description,
        service_type: match.service_type
    };
};
