# 🚚 Majithia International Courier

A comprehensive, serverless courier management system designed to streamline international shipping operations. Features real-time rate calculation, booking management, and shipment tracking using a modern React + Supabase architecture.

![Majithia International Courier Banner](https://via.placeholder.com/1200x400/1e40af/ffffff?text=Majithia+International+Courier)

## 🌟 Features

- **Intelligent Rate Finder**: Real-time shipping rate calculation (~10,000 rates indexed).
- **Multi-Carrier Support**: FedEx, UPS, Purolator, Aramex, SkyNet, DPD, and more.
- **Automated Booking System**: Streamlined process for customer data & shipment details.
- **Admin Dashboard**: Comprehensive tracking, search, and management of shipments.
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and Shadcn/ui.
- **Secure Authentication**: Role-based access control (Admin/Staff) via Supabase Auth.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend / Database**: Supabase (PostgreSQL, Auth)
- **Architecture**: 100% Serverless (Zero python backend required)

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project

### 1. Environment Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/KeshavMajithia/m.git
cd majithia-courier
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: Service Role Key required ONLY for seeding the database
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup (Supabase)

1.  **Create Tables**: handling schemas for `courier_rates`, `zone_mappings`, `bookings`, `inquiries`.
    - Run the contents of `supabase/schema.sql` in your Supabase SQL Editor.
2.  **Seed Data**: Populate the database with the latest carrier rates.
    ```bash
    node scripts/seed_supabase.js
    ```
    *(Note: This uses `extracted_rates.json` generated from source CSVs/PDFs).*

### 4. Start Development Server

```bash
npm run dev
```
The application will launch at `http://localhost:8080`.

## 📦 Deployment

### Vercel (Recommended)

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add your Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel Dashboard.
4.  Deploy! 🚀

## 📂 Project Structure

```
src/
├── components/      # React UI components
├── pages/           # Route pages (Index, Admin, etc.)
├── utils/
│   ├── rateMatching.ts  # Core logic for rate calculation (Client-side)
│   └── rateService.ts   # Supabase data fetching service
├── lib/             # Supabase client configuration
└── App.tsx          # Main router and layout
scripts/
├── migrate_csv.js   # Script to parse source CSVs into JSON
└── seed_supabase.js # Script to upload JSON data to Supabase
```

## 📊 Supported Carriers

- **FedEx**: Global Zone-based pricing.
- **UPS**: Comprehensive Zone & Country pricing.
- **Purolator**: Canada specialization.
- **Aramex**: Europe, Middle East, & Asia coverage.
- **SkyNet**: Europe & Australia/NZ coverage.
- **DPD**: European road networks.

## 🔒 Security

- **Row Level Security (RLS)**: Enabled on Supabase to protect customer data.
- **Authentication**: Secure login required for Admin/Staff areas.
- **Environment**: API keys are separated for client (Anon) and admin (Service Role) usage.

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Developed with ❤️ by Keshav Majithia</p>
</div>
