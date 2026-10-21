# Technical Architecture & Implementation Guide
**Project:** Civic Road Hazard Reporting & AI Prioritisation System  
**Event:** UTP Codefest 2026

---

## 1. Executive Summary
This document provides the technical specification and data payload contracts for the four architecture layers outlined in the UTP Codefest 2026 System Architecture Design (SAD).

---

## 2. System Layers & Data Flow

```
[ Citizen (Telegram) ] 
       │ 
       ▼ Photo + Location Pin
[ Layer 1: Ingestion API (Telegram Webhook) ]
       │ 
       ▼ Image URL / Base64 + Coordinates
[ Layer 2: Processing & AI (Express + Gemini 3.5 Flash) ]
       │ 
       ▼ Structured JSON (Severity 1-5, Justification)
[ Layer 3: Persistence & Auth (Supabase PostgreSQL) ]
       │ 
       ▼ Realtime WebSockets Push
[ Layer 4: Presentation (JKR Web Dashboard - React + Leaflet) ]
```

---

## 3. Data Contracts & Interfaces

### 3.1 Telegram Payload Contract (Adika)
```typescript
interface TelegramIngestionPayload {
  chat_id: number;
  message_id: number;
  photo_url: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}
```

### 3.2 Gemini 3.5 Flash Response Contract (Nizam)
```json
{
  "issueType": "Deep Pothole",
  "severityScore": 5,
  "description": "Crater depth exceeds ~5cm in active traffic lane, posing an immediate hazard to motorcyclists.",
  "riskLevel": "CRITICAL"
}
```

### 3.3 Database Table Schema (Abrar)
See [`supabase/schema.sql`](file:///c:/Users/nizam/OneDrive%20-%20pinschoolo.pinschoolo/Documents/UTP/Misc/codefest/JKR%20Dashboard/CodeFest/supabase/schema.sql) for full DDL with RLS policies and PostGIS geometry.

---

## 4. Frontend Component Architecture (Sapik)

All components are organized into feature domains:
- **`src/components/common/`**: Reusable primitives (`PriorityBadge`, `StatusBadge`, `Panel`, `Brand`, `Toast`)
- **`src/components/layout/`**: Application shell (`Header`, `Sidebar`)
- **`src/components/map/`**: Geospatial visualization (`RoadMap` with dynamic Leaflet SVG marker anchors)
- **`src/components/cases/`**: Case handling (`CaseTable`, `CaseFilters`, `CaseDetailView`)
- **`src/components/analytics/`**: Executive metrics (`MetricCards`, `AnalyticsCharts`)
- **`src/components/staff/`**: Role-based access control (`StaffManagement`)
- **`src/context/`**: State management (`LanguageContext` [BM/EN], `AuthContext` [RBAC], `CaseContext` [realtime])
- **`src/services/`**: API adapters (`gemini.ts`, `supabase.ts`, `telegram.ts`)

