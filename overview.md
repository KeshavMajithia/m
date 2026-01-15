# 🚚 Majithia International Courier - System Overview

**Majithia International Courier (MIC)** is a modern, serverless shipping management platform designed to provide real-time international courier rates, booking management, and shipment tracking. It replaces legacy manual processes and Python-based backends with a robust, scalable **React + Supabase** architecture.

---

## 🏗️ Architecture

The application follows a **Serverless Architecture**, eliminating the need for a dedicated backend server (e.g., Python/Flask). All business logic resides in the Frontend (Client-side) or within the Database (Supabase).

```mermaid
graph TD
    User[Clients] -->|HTTPS| Vercel[Vercel Edge Network]
    Vercel -->|Serves| SPA[React SPA (Vite)]
    
    subgraph Frontend Logic
        SPA -->|Rate Lookup| RateEngine[RateMatching.ts]
        RateEngine -->|Query| SupabaseClient
    end
    
    subgraph Backend Services [Supabase]
        SupabaseClient -->|Auth| Auth[Supabase Auth]
        SupabaseClient -->|Data| DB[(PostgreSQL Database)]
        DB -->|Tables| T1[courier_rates]
        DB -->|Tables| T2[zone_mappings]
        DB -->|Tables| T3[bookings]
    end
    
    subgraph Data Pipeline
        CSV[User CSVs (12 Files)] -->|Node.js Script| Script[migrate_csv.js]
        Script -->|JSON| MasterJSON[extracted_rates.json]
        MasterJSON -->|Seed Script| Seeder[seed_supabase.js]
        Seeder -->|Upsert| DB
    end
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) (High-performance build tool).
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing for reliability).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/ui](https://ui.shadcn.com/) components.
- **Routing**: Client-side routing for seamless SPA experience.

### Backend & Database (Serverless)
- **Platform**: [Supabase](https://supabase.com/) (Open source Firebase alternative).
- **Database**: PostgreSQL.
- **Authentication**: Native Supabase Auth (Email/Password) with Role-Based Access Control (RBAC).

### Infrastructure
- **Deployment**: [Vercel](https://vercel.com/) (Zero-config React hosting).
- **Configuration**:
    - `vite.config.ts`: Optimized for root-level deployment.
    - `vercel.json`: Handles SPA routing rewrites (prevents 404s).

---

## ⚙️ Core Systems

### 1. The Rate Engine (`migrate_csv.js` → `RateFinder.tsx`)
The heart of the system is the ability to calculate accurate shipping rates across 10+ carriers (DHL, FedEx, UPS, Aramex, etc.) instantly.

#### **Data Ingestion Pipeline**
1.  **Source**: 12 CSV files provided by the user (e.g., `dhl rates jan.csv`, `fedex zones.csv`).
2.  **Processing** (`scripts/migrate_csv.js`):
    - Parses "Standard" formats (Weight rows x Zone columns).
    - Parses "Transposed" formats (Country rows x Weight columns, e.g., SkyNet).
    - Handles complex weight ranges (e.g., `30.1 to 50`).
3.  **Consolidation**: Generates `extracted_rates.json` containing **~10,600 rates** and **~650 zone mappings**.
4.  **Seeding** (`scripts/seed_supabase.js`): Uploads this massive dataset to Supabase efficiently.

#### **Rate Calculation Mechanism**
When a user searches for a rate (e.g., "5kg to Germany"):
1.  **Zone Lookup**: The system queries `zone_mappings` for "Germany".
    - *Example*: FedEx = "Zone R", DHL = "Zone 7".
2.  **Fuzzy Matching**: Logic in `rateService.ts` handles variations (e.g., "USA" vs "United States", "Zone F" vs "F").
3.  **Rate Retrieval**: Fetches all matching rows from `courier_rates` where the weight falls within the range.
4.  **Display**: Results are sorted by price and displayed with service types (Priority, Economy, Document).

### 2. Booking Management
- **Public**: Users can submit bookings directly from the rate result page.
- **Admin**: A protected dashboard (`/admin`) allows staff to view, search, and export bookings.
- **Security**: Row Level Security (RLS) ensures only authorized staff can modify booking records.

---

## 📂 Project Directory Structure

```
majithia-courier/
├── scripts/                  # Data Engineering Tools
│   ├── migrate_csv.js        # Parses CSVs -> JSON
│   └── seed_supabase.js      # Uploads JSON -> Database
├── src/
│   ├── components/           # UI Building Blocks (RateFinder, Dashboard)
│   ├── lib/                  # Supabase Client Config
│   ├── utils/                # Business Logic
│   │   ├── rateMatching.ts   # Client-side rate calculation
│   │   └── rateService.ts    # Data fetching service
│   └── pages/                # Application Routes
├── public/
│   ├── _redirects            # Routing rules
│   └── favicon.ico           # (Cleaned of branding)
├── *.csv                     # Source Data (The 11-12 Rate Sheets)
├── extracted_rates.json      # The Master Data File
├── vercel.json               # Deployment Config
└── vite.config.ts            # Build Config
```

---

## 🚀 Deployment Status

- **Ready for Production**: Yes.
- **Current State**:
    - **Build**: Passes `npm run build`.
    - **Database**: Seeded with Jan 2026 rates (including DHL).
    - **Config**: Assets optimized, branding removed, Vercel ready.

## 📝 Future Maintenance
To update rates in the future:
1.  Replace the relevant `.csv` file in the root directory.
2.  Run `node scripts/migrate_csv.js` (Rebuilds the JSON).
3.  Run `node scripts/seed_supabase.js` (Updates the Cloud DB).
