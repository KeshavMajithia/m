-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: zone_mappings
-- Usage: Maps a Country (e.g., "Germany") to a Zone (e.g., "G" or "5") for a specific Carrier.
-- Example: FedEx | Germany | 5
create table public.zone_mappings (
    id uuid default uuid_generate_v4() primary key,
    carrier text not null,
    country text not null,
    zone text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Composite unique constraint to prevent duplicates
    unique(carrier, country)
);

create index idx_zone_mappings_carrier_country on public.zone_mappings(carrier, country);

-- Table: courier_rates
-- Usage: Stores the actual price for a specific Carrier -> Zone/Location -> Weight.
-- The 'location_key' is usually the Zone (e.g., "5" or "G"), but could be a direct Country name if no zone exists.
create table public.courier_rates (
    id uuid default uuid_generate_v4() primary key,
    carrier text not null,
    service_type text not null default 'Standard', -- e.g., 'Express', 'Economy'
    location_key text not null, -- The Zone code (e.g., "G") or Country Name
    weight_start numeric not null, -- Inclusive start of weight tier
    weight_end numeric not null, -- Inclusive end of weight tier
    rate numeric not null,
    is_per_kg boolean default false, -- If true, rate is multiplier. If false, rate is flat price.
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookups
create index idx_courier_rates_lookup on public.courier_rates(carrier, location_key);
create index idx_courier_rates_weight on public.courier_rates(weight_start, weight_end);

-- RLS Policies (Optional but recommended)
alter table public.zone_mappings enable row level security;
alter table public.courier_rates enable row level security;

-- Allow read access to everyone (public)
create policy "Allow public read access" on public.zone_mappings for select using (true);
create policy "Allow public read access" on public.courier_rates for select using (true);

-- Allow write access only to authenticated users (admins) or service roles
-- For now, we might want to allow anon insertions if running migration from a script without auth, 
-- but better to use service_role key.
