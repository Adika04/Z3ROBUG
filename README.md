# JKR Road Hazard Reporting & AI Prioritisation System
**Event:** UTP Codefest 2026  
**Track:** Civic Tech / Smart Municipal Solutions  
**Client:** Jabatan Kerja Raya Malaysia (JKR)

---

## 🏛️ Project Overview
The **Civic Road Hazard Reporting & AI Prioritisation System** bridges Malaysian road users and municipal authorities (JKR). Instead of requiring citizens to download a dedicated app or risking platform blocks with web scrapers, citizens submit road hazard photos and native GPS location pins via **Telegram**. Incoming photos are analyzed in real time by **Google Gemini 3.5 Flash**, scored on a 1–5 severity scale with actionable technical justifications, stored in **Supabase PostgreSQL**, and rendered instantly on an interactive **Leaflet/OpenStreetMap** municipal command dashboard.

---

## 🏗️ 4-Layer System Architecture

```
┌────────────────────────────────────────────────────────┐
│  LAYER 1: CITIZEN INGESTION (Telegram Bot API)          │
│  - @AduanPotholeBot (Bilingual: BM & English)          │
│  - Captures photo upload + native GPS location pin     │
└──────────────────────────┬─────────────────────────────┘
                           │ Webhook POST (Image + Geotag)
                           ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 2: PROCESSING & AI VISION (Node / Express)       │
│  - Webhook validation & payload extraction             │
│  - Google Gemini 3.5 Flash Multimodal Vision API       │
│  - Formats structured JSON: severity score (1-5)       │
└──────────────────────────┬─────────────────────────────┘
                           │ SQL Insert (Report + AI Score)
                           ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 3: PERSISTENCE & AUTH (Supabase PostgreSQL)      │
│  - PostGIS geospatial coordinates                      │
│  - Storage bucket for road damage photos               │
│  - Realtime WebSockets replication channel             │
│  - Role-Based Access Control (Admin / Officer / Viewer)│
└──────────────────────────┬─────────────────────────────┘
                           │ Realtime WebSocket Sync
                           ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 4: PRESENTATION (JKR Municipal Dashboard)       │
│  - React 19 + Tailwind CSS + OpenStreetMap (Leaflet)   │
│  - Color-coded severity pins (P5 Critical to P1 Minor) │
│  - Realtime incident table & priority queue            │
│  - Status updates & automated Telegram feedback loop   │
└────────────────────────────────────────────────────────┘
```

---

## 👥 Team Responsibilities & Ownership

| Member | Focus Area | Technical Stack | Deliverables |
| :--- | :--- | :--- | :--- |
| **Adika** | Ingestion & Backend Logic | Node.js / Express, Telegram Bot API | Webhook server, location pin validator, Telegram feedback notifier |
| **Nizam** | AI Vision Integration | Gemini 3.5 Flash API, Multimodal Prompts | Image severity assessment function returning JSON score (1-5) & justification |
| **Abrar** | Database & Authentication | Supabase PostgreSQL, Storage, RBAC | Database schema (`schema.sql`), image bucket, realtime subscriptions |
| **Sapik** | JKR Web Dashboard UI | React 19, Tailwind CSS, Leaflet | Bilingual command center, interactive GIS map, case resolution workflow |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+

### 2. Install & Start Frontend Dev Server
```bash
# Navigate into the project folder
cd CodeFest

# Install dependencies
npm install

# Start development server
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

---

## 📂 Project Directory Structure

```
CodeFest/
├── backend/                  # Layer 2: Express webhook server template (Adika & Nizam)
│   └── server.js             # Telegram webhook handler + Gemini AI scoring pipeline
├── docs/                     # Project specifications & architecture diagrams
│   ├── ARCHITECTURE.md       # Full architecture specification & contracts
│   ├── FR_NFR_Requirement.pdf
│   ├── System_Architecture_Design__SAD_.pdf
│   └── UTP_Codefest_2026_System_Architecture.pdf
├── supabase/                 # Layer 3: Database schema & seeds (Abrar)
│   └── schema.sql            # PostgreSQL DDL, PostGIS, RLS, and realtime publication
├── src/                      # Layer 4: JKR Municipal Dashboard (Sapik)
│   ├── assets/               # Logos & imagery
│   │   ├── jkr-logo.png
│   │   └── kuala-lumpur-road.jpg
│   ├── components/
│   │   ├── analytics/        # Recharts area & bar charts, metric cards
│   │   ├── cases/            # CaseTable, CaseFilters, CaseDetailView
│   │   ├── common/           # PriorityBadge, StatusBadge, Panel, Brand, Toast
│   │   ├── layout/           # Header, Sidebar (with mobile drawer)
│   │   ├── map/              # RoadMap (OpenStreetMap Leaflet with color-coded pins)
│   │   └── staff/            # StaffManagement & RBAC administration
│   ├── context/
│   │   ├── AuthContext.tsx   # Staff login & RBAC role switcher (Admin / Officer / Viewer)
│   │   ├── CaseContext.tsx   # Reactive cases store, filters, simulated Telegram ingestion
│   │   └── LanguageContext.tsx # Bilingual support (Bahasa Melayu & English)
│   ├── data/
│   │   └── initialCases.ts   # Baseline Kuala Lumpur & Klang Valley seed records
│   ├── pages/
│   │   ├── DashboardPage.tsx # Executive overview & quick queue
│   │   ├── CasesPage.tsx     # Filterable cases grid & detailed case view
│   │   ├── MapViewPage.tsx   # Fullscreen GIS map
│   │   ├── AnalyticsPage.tsx # Performance & district resolution rate
│   │   ├── ReportsPage.tsx   # Official audit summary & CSV export
│   │   ├── StaffPage.tsx     # JKR staff access control
│   │   ├── SettingsPage.tsx  # Pipeline connectors & language preference
│   │   └── LoginPage.tsx     # Staff sign-in authentication screen
│   ├── services/
│   │   ├── gemini.ts         # Nizam's Gemini 3.5 Flash structured AI vision client
│   │   ├── supabase.ts       # Abrar's Supabase REST/Realtime database adapter
│   │   └── telegram.ts       # Adika's Telegram Bot payload parser & notifications
│   ├── types/
│   │   └── index.ts          # Centralized TypeScript definitions
│   ├── App.tsx               # App router & layout shell
│   ├── index.css             # Tailwind CSS v4 & theme variables
│   └── main.tsx              # React DOM entry point
├── index.html                # HTML entry point with JKR metadata
├── package.json              # Cleaned dependency tree
└── vite.config.ts            # High-performance Vite 8 + Tailwind CSS v4 config
```
