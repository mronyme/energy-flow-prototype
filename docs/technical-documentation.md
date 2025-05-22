
# Technical Documentation

This document provides a detailed technical overview of the ENGIE Energy Data Platform's architecture, components, and implementation details.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Model](#data-model)
- [Authentication and Authorization](#authentication-and-authorization)
- [Key Components](#key-components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Internationalization](#internationalization)

## Architecture Overview

The ENGIE Energy Data Platform is built as a single-page application (SPA) using React for the frontend and Supabase for backend services. This architecture provides:

- **Real-time data updates**: Using Supabase's real-time capabilities
- **Role-based access control**: Implemented at both application and database level
- **Scalable data storage**: PostgreSQL database through Supabase
- **Secure authentication**: Powered by Supabase Auth

### Technology Stack

- **Frontend**:
  - React (with TypeScript)
  - Vite (build tool)
  - Tailwind CSS (styling)
  - shadcn/ui (UI component library)
  - Tanstack React Query (data fetching and caching)
  - Recharts (data visualization)
  - React Router (routing)

- **Backend**:
  - Supabase (Backend as a Service)
  - PostgreSQL (database)
  - Row Level Security (data access control)

## Frontend Architecture

The frontend follows a component-based architecture with a focus on reusability and separation of concerns:

### Directory Structure

```
src/
├── components/        # Reusable UI components
│   ├── admin/         # Admin-specific components
│   ├── common/        # Shared components
│   ├── dashboard/     # Dashboard components
│   ├── data-load/     # Data import components
│   ├── data-quality/  # Data quality components
│   └── ui/            # Basic UI components
├── contexts/          # React contexts
├── data/              # Static data and mock data
├── hooks/             # Custom React hooks
├── integrations/      # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility libraries
├── pages/             # Page components
│   ├── admin/         # Admin pages
│   ├── data-load/     # Data loading pages
│   └── data-quality/  # Data quality pages
├── services/          # Service layer for API calls
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Backend Architecture

The backend is powered by Supabase, which provides:

- **PostgreSQL Database**: For data storage
- **Authentication**: User management and session handling
- **Row Level Security**: For fine-grained access control
- **Real-time Subscriptions**: For live data updates
- **Storage**: For file uploads and management

### Database Structure

The database consists of the following tables:

- `site`: Sites/locations being monitored
- `meter`: Energy meters installed at sites
- `reading`: Individual meter readings
- `kpi_daily`: Daily key performance indicators
- `anomaly`: Detected anomalies in readings
- `import_log`: Records of data imports
- `audit_log`: System audit trail
- `profiles`: User profiles with roles

See [Data Model](#data-model) for more details.

## Data Model

### Entity Relationship Diagram

```
site (1) --- (n) meter (1) --- (n) reading (1) --- (0,n) anomaly
  |
  | (1)
  |
 (n)
kpi_daily
```

### Key Tables

#### site
- `id`: UUID (primary key)
- `name`: Text (site name)
- `country`: Text (country code)

#### meter
- `id`: UUID (primary key)
- `site_id`: UUID (foreign key to site)
- `type`: Text (meter type: ELEC, GAS, WATER)

#### reading
- `id`: UUID (primary key)
- `meter_id`: UUID (foreign key to meter)
- `ts`: Timestamp (reading timestamp)
- `value`: Numeric (reading value)

#### kpi_daily
- `id`: UUID (primary key)
- `site_id`: UUID (foreign key to site)
- `day`: Date (day for KPI)
- `kwh`: Numeric (energy consumption)
- `co2`: Numeric (CO2 emissions)
- `cost_eur`: Numeric (cost in EUR)

#### anomaly
- `id`: UUID (primary key)
- `reading_id`: UUID (foreign key to reading)
- `type`: Text (anomaly type: SPIKE, FLAT)
- `delta`: Numeric (deviation value)
- `comment`: Text (optional comment)

#### profiles
- `id`: UUID (primary key, references auth.users)
- `role`: app_role (user role enum: Admin, Manager, DataManager, Operator)
- `created_at`: Timestamp

## Authentication and Authorization

The application uses Supabase Authentication with a custom role-based access control system:

### Roles

- **Admin**: Full access to all features
- **Manager**: Access to dashboards and reports
- **DataManager**: Access to data quality tools and import features
- **Operator**: Access to data entry and basic import features

### Implementation

Authentication is implemented using:

- **Supabase Auth**: For user authentication
- **AuthContext**: React context that provides authentication state
- **Layout Component**: Checks required roles for route access
- **Row Level Security**: Database-level access control

## Key Components

### Dashboard Components

- **KpiCard**: Displays KPI metrics
- **TrendLineChart**: Shows trends over time
- **ExportPanel**: Handles data export functionality

### Data Loading Components

- **ManualEntryForm**: Form for manual data entry
- **UploadDropZone**: File upload component for CSV imports
- **PreviewTable**: Data preview before import
- **ValidationResultSummary**: Validates imported data

### Data Quality Components

- **AnomalyBadge**: Visual indicator for anomalies
- **CorrectionModal**: Interface for correcting anomalies
- **LogTable**: Display of import/audit logs

### Admin Components

- **UserForm**: User management interface
- **EmissionFactorForm**: Configuration for emission factors
- **AuditLogViewer**: Administrative audit trail

## State Management

The application uses a combination of:

- **React Context**: For global state (auth, themes)
- **React Query**: For server state management
- **Local Component State**: For UI-specific state

## API Integration

API calls are managed through:

- **Supabase Client**: For database operations
- **Custom Hooks**: Wrapping Supabase calls
- **React Query**: For data fetching, caching, and synchronization

## Internationalization

The application is currently in English with structure prepared for localization:

- Text is extracted in components for easy translation
- Date/number formatting uses locale-aware functions
