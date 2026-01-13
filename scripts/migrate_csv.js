import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = 'extracted_rates.json';

// Configuration for file mapping
const MAPPINGS = {
    // Zones Files
    zones: [
        { file: 'fedex zones.csv', carrier: 'FedEx' },
        { file: 'dhl zones.csv', carrier: 'DHL' },
        { file: 'ups zones.csv', carrier: 'UPS' }
    ],
    // Rates Files
    rates: [
        { file: 'fedex rates jan.csv', carrier: 'FedEx' },
        { file: 'aramex rates jan.csv', carrier: 'Aramex' },
        { file: 'ups rates jan.csv', carrier: 'UPS' },
        { file: 'purolator rates jan.csv', carrier: 'Purolator' },
        { file: 'dhl rates jan.csv', carrier: 'DHL' }, // Might be missing
        { file: 'skynet nz rates jan.csv', carrier: 'Skynet', region: 'NZ' },
        { file: 'skynet aus rates jan.csv', carrier: 'Skynet', region: 'AU' },
        { file: 'skynet europe rates jan.csv', carrier: 'Skynet', region: 'EU' },
        { file: 'dpd eu rates jan.csv', carrier: 'DPD' }
    ]
};

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Remove quotes
    const data = lines.slice(1).map(line => {
        // Handle comma inside quotes slightly better
        // This regex splits on comma BUT ignores commas inside double quotes
        // It's a standard simple CSV regex
        const values = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
                continue;
            }
            current += char;
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        return values;
    });
    return { headers, data };
}

function processZones() {
    const allMappings = [];
    console.log('🌍 Processing Zones...');

    MAPPINGS.zones.forEach(m => {
        if (!fs.existsSync(m.file)) {
            console.warn(`⚠️  Zone file missing: ${m.file}`);
            return;
        }
        const content = fs.readFileSync(m.file, 'utf-8');
        const { headers, data } = parseCSV(content);

        // Find columns
        const countryIdx = headers.findIndex(h => h.toLowerCase().includes('country'));
        const zoneIdx = headers.findIndex(h => h.toLowerCase().includes('zone'));

        if (countryIdx === -1 || zoneIdx === -1) {
            console.error(`❌ Invalid headers in ${m.file}: ${headers}`);
            return;
        }

        data.forEach(row => {
            if (row.length < 2) return;
            let country = row[countryIdx];
            let zone = row[zoneIdx];
            if (country && zone) {
                allMappings.push({
                    carrier: m.carrier,
                    country: country.trim(),
                    zone: zone.trim()
                });
            }
        });
    });
    console.log(`✅ Extracted ${allMappings.length} zone mappings.`);
    return allMappings;
}

function processRates() {
    const allRates = [];
    console.log('💰 Processing Rates...');

    MAPPINGS.rates.forEach(m => {
        if (!fs.existsSync(m.file)) {
            console.warn(`⚠️  Rate file missing: ${m.file}`);
            return;
        }
        const content = fs.readFileSync(m.file, 'utf-8');
        const { headers, data } = parseCSV(content);

        // Identify Weight Column
        // 1. Try Standard Format (Row = Weight, Col = Location)
        const weightIdx = headers.findIndex(h => {
            const lower = h.toLowerCase();
            return lower.includes('weight') || lower === 'dox' || lower === 'kg';
        });

        if (weightIdx !== -1) {
            // Standard Processing
            // Process Columns (Locations)
            // Skip Weight column
            const locationCols = headers.map((h, i) => ({ header: h, index: i })).filter(c => c.index !== weightIdx);

            data.forEach(row => {
                if (row.length < 2) return;
                const weightRaw = row[weightIdx];
                if (!weightRaw) return;

                // Parse Weight & Service Type
                let weight = 0;
                let type = 'Standard';
                let isDoc = false;

                if (weightRaw.toLowerCase().includes('dox')) {
                    type = 'Document';
                    isDoc = true;
                    weight = 0.5;
                } else if (weightRaw.toLowerCase().includes('spx')) {
                    type = 'Non-Document';
                    weight = 0.5;
                } else if (weightRaw.toLowerCase().includes('+')) {
                    weight = parseFloat(weightRaw.replace(/[^\d.]/g, ''));
                } else {
                    weight = parseFloat(weightRaw);
                }

                if (isNaN(weight)) return;

                // Iterate Location Columns
                locationCols.forEach(col => {
                    const rawRate = row[col.index];
                    if (!rawRate) return;
                    const rate = parseFloat(rawRate.replace(/,/g, ''));
                    if (isNaN(rate) || rate === 0) return;

                    // Handle Header Splitting (e.g. "EGYPT/JORDAN")
                    // Be careful on split char. Default '/'
                    const locations = col.header.split('/').map(l => l.trim());

                    locations.forEach(loc => {
                        allRates.push({
                            carrier: m.carrier,
                            service_type: type,
                            location_key: loc,
                            weight_start: weight,
                            weight_end: weight, // Point weight
                            rate: rate,
                            is_per_kg: false
                        });
                    });
                });
            });
            return; // Done with Standard
        }

        // 2. Try Transposed Format (Row = Country, Col = Weight)
        // SkyNet files have headers like "1 KG", "2 PKG"...
        const weightHeaders = headers.filter(h => /kg|pkg/i.test(h));
        const isTransposed = weightHeaders.length > 5; // Heuristic

        if (isTransposed) {
            console.log(`🔄 Detected Transposed Format for ${m.file}`);
            const countryIdx = headers.findIndex(h => /country/i.test(h));
            if (countryIdx === -1) {
                console.error(`❌ No 'Country' column in transposed file ${m.file}`);
                return;
            }

            // Iterate Rows (Countries)
            data.forEach(row => {
                const country = row[countryIdx];
                if (!country) return;

                // Iterate Columns (Weights)
                headers.forEach((h, colIdx) => {
                    if (colIdx === countryIdx) return;

                    // Parse Weight from Header (e.g. "1 KG", "2 PKG")
                    const weightMatch = h.match(/(\d+(\.\d+)?)/);
                    if (!weightMatch) return;
                    const weight = parseFloat(weightMatch[0]);

                    const rateRaw = row[colIdx];
                    if (!rateRaw) return;
                    const rate = parseFloat(rateRaw.replace(/,/g, '')); // Handle commas

                    if (isNaN(rate) || rate === 0) return;

                    allRates.push({
                        carrier: m.carrier,
                        service_type: 'Standard',
                        location_key: country.trim(),
                        weight_start: weight,
                        weight_end: weight,
                        rate: rate,
                        is_per_kg: false
                    });
                });
            });
            return; // Done with this file
        }

        // Skip Weight column
        const locationCols = headers.map((h, i) => ({ header: h, index: i })).filter(c => c.index !== weightIdx);

        data.forEach(row => {
            if (row.length < 2) return;
            const weightRaw = row[weightIdx];
            if (!weightRaw) return;

            // Parse Weight & Service Type
            let weight = 0;
            let type = 'Standard';
            let isDoc = false;

            if (weightRaw.toLowerCase().includes('dox')) {
                type = 'Document';
                isDoc = true;
                weight = 0.5; // "Dox 500 Gm"
            } else if (weightRaw.toLowerCase().includes('spx')) {
                type = 'Non-Document';
                weight = 0.5;
            } else if (weightRaw.toLowerCase().includes('+')) {
                weight = parseFloat(weightRaw.replace(/[^\d.]/g, ''));
            } else {
                weight = parseFloat(weightRaw);
            }

            if (isNaN(weight)) return;

            // Iterate Location Columns
            locationCols.forEach(col => {
                const rawRate = row[col.index];
                if (!rawRate) return;
                const rate = parseFloat(rawRate);
                if (isNaN(rate) || rate === 0) return;

                // Handle Header Splitting (e.g. "EGYPT/JORDAN")
                // Be careful on split char. Default '/'
                const locations = col.header.split('/').map(l => l.trim());

                locations.forEach(loc => {
                    allRates.push({
                        carrier: m.carrier,
                        service_type: type,
                        location_key: loc,
                        weight_start: weight,
                        weight_end: weight, // Point weight
                        rate: rate,
                        is_per_kg: false
                    });
                });
            });
        });
    });
    console.log(`✅ Extracted ${allRates.length} rates.`);
    return allRates;
}

const zones = processZones();
const rates = processRates();

const output = {
    zone_mappings: zones,
    rates: rates
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log(`🎉 Done! Saved to ${OUTPUT_FILE}`);
