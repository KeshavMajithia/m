
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// Use Service Role Key if available for bypassing RLS, otherwise try Anon Key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase credentials missing in .env');
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) are set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DATA_FILE = path.resolve(__dirname, '../extracted_rates.json');

async function seedDatabase() {
  console.log('🚀 Starting Database Seed...');

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`);
    return;
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(rawData);

  console.log(`📦 Loaded ${data.zone_mappings.length} zone mappings and ${data.rates.length} rates.`);

  // 1. Insert Zone Mappings
  if (data.zone_mappings.length > 0) {
    console.log('🌍 Seeding Zone Mappings...');

    // DEDUPLICATE Mappings based on Carrier + Country
    const uniqueMappings = [];
    const seen = new Set();
    data.zone_mappings.forEach(m => {
      const key = `${m.carrier.toLowerCase()}|${m.country.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMappings.push(m);
      }
    });
    console.log(`   Deduplicated Mappings: ${data.zone_mappings.length} -> ${uniqueMappings.length}`);

    // Batch Insert
    const BATCH_SIZE = 1000;
    for (let i = 0; i < uniqueMappings.length; i += BATCH_SIZE) {
      const batch = uniqueMappings.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('zone_mappings')
        .upsert(batch, { onConflict: 'carrier, country' }); // Ensure unique constraint exists in SQL

      if (error) {
        console.error('❌ Error inserting zone_mappings batch:', error);
      } else {
        console.log(`  ✅ Inserted zone_mappings ${i + 1} to ${Math.min(i + BATCH_SIZE, data.zone_mappings.length)}`);
      }
    }
  }

  // 2. Insert Rates
  if (data.rates.length > 0) {
    console.log('💰 Seeding Rates...');

    const BATCH_SIZE = 1000;
    for (let i = 0; i < data.rates.length; i += BATCH_SIZE) {
      const batch = data.rates.slice(i, i + BATCH_SIZE);

      // Clean up float precision issues if any, ensuring numeric types
      const cleanBatch = batch.map(r => ({
        ...r,
        rate: parseFloat(r.rate),
        weight_start: parseFloat(r.weight_start),
        weight_end: parseFloat(r.weight_end)
      }));

      const { error } = await supabase
        .from('courier_rates')
        .insert(cleanBatch);
      // Note: 'upsert' requires a unique constraint. Since rates don't have a clear unique key (ranges overlap in theory, though shouldn't), simple insert might duplicate if run twice. 
      // Best practice: Truncate table first or use specific IDs. 
      // validation: user should clean table if re-running.

      if (error) {
        console.error('❌ Error inserting courier_rates batch:', error);
      } else {
        console.log(`  ✅ Inserted rates ${i + 1} to ${Math.min(i + BATCH_SIZE, data.rates.length)}`);
      }
    }
  }

  console.log('🎉 Seeding Complete!');
}

seedDatabase().catch(err => console.error('Unexpected error:', err));
