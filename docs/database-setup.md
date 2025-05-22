
# Database Setup Guide

This guide provides detailed instructions for setting up the database locally using Supabase for the ENGIE Energy Data Platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installing Supabase CLI](#installing-supabase-cli)
- [Local Supabase Setup](#local-supabase-setup)
- [Database Schema](#database-schema)
- [Data Migration](#data-migration)
- [Seed Data](#seed-data)
- [Row Level Security Policies](#row-level-security-policies)
- [Database Functions](#database-functions)
- [Authentication Configuration](#authentication-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the database, ensure you have:

- PostgreSQL installed locally
- Docker installed (required for Supabase CLI)
- Node.js v16+ installed
- npm or yarn installed

## Installing Supabase CLI

The Supabase CLI allows you to run Supabase locally and manage migrations.

```bash
# Using npm
npm install -g supabase

# Using yarn
yarn global add supabase

# Verify installation
supabase --version
```

## Local Supabase Setup

### Initialize Supabase

```bash
# Create a directory for your Supabase project
mkdir supabase-local
cd supabase-local

# Initialize Supabase
supabase init

# Start Supabase locally
supabase start
```

This will start a local Supabase instance with PostgreSQL, Auth, Storage, and other services. You'll receive a local URL and credentials to connect to your local Supabase instance.

### Connect to Local Supabase

Update the `src/integrations/supabase/client.ts` file with your local Supabase URL and anonymous key:

```typescript
// For local development
const SUPABASE_URL = "http://localhost:54321";
const SUPABASE_PUBLISHABLE_KEY = "your-local-anon-key";

// For production
// const SUPABASE_URL = "https://pxxrjrfmrrrwhwzkjxdx.supabase.co";
// const SUPABASE_PUBLISHABLE_KEY = "production-anon-key";
```

## Database Schema

The application uses the following database schema:

### Core Tables

1. **site** - Sites/locations being monitored
2. **meter** - Energy meters installed at sites
3. **reading** - Individual meter readings
4. **kpi_daily** - Daily key performance indicators
5. **anomaly** - Detected anomalies in readings
6. **import_log** - Records of data imports
7. **audit_log** - System audit trail
8. **profiles** - User profiles with roles

### Schema Creation

Run the following SQL to create the database schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role type
CREATE TYPE app_role AS ENUM ('Operator', 'DataManager', 'Manager', 'Admin');

-- Create site table
CREATE TABLE public.site (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country CHAR(2) NOT NULL
);

-- Create meter table
CREATE TABLE public.meter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.site(id),
  type TEXT NOT NULL
);

-- Create reading table
CREATE TABLE public.reading (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meter_id UUID REFERENCES public.meter(id),
  ts TIMESTAMP WITH TIME ZONE NOT NULL,
  value NUMERIC NOT NULL
);

-- Create kpi_daily table
CREATE TABLE public.kpi_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.site(id),
  day DATE NOT NULL,
  kwh NUMERIC NOT NULL,
  co2 NUMERIC NOT NULL,
  cost_eur NUMERIC NOT NULL
);

-- Create anomaly table
CREATE TABLE public.anomaly (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_id UUID REFERENCES public.reading(id),
  type TEXT,
  delta NUMERIC,
  comment TEXT
);

-- Create import_log table
CREATE TABLE public.import_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_email TEXT NOT NULL,
  rows_ok INTEGER NOT NULL,
  rows_err INTEGER NOT NULL,
  file_name TEXT NOT NULL
);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_email TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  description TEXT
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'Operator',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

## Data Migration

To migrate existing data from a production Supabase instance:

1. **Export data** from the production instance:

   ```bash
   # Export tables
   supabase db dump -f data_dump.sql --db-url your-production-db-url
   ```

2. **Import data** to your local instance:

   ```bash
   # Import dump file
   supabase db reset --db-url your-local-db-url < data_dump.sql
   ```

## Seed Data

For development, you can use the seed data provided in the project:

```bash
# Navigate to your project directory
cd your-project-directory

# Start the application with seeding enabled
npm run dev
```

The application includes a data seeding mechanism that will automatically populate the database with sample data if tables are empty.

### Seed Data Source

The seed data is defined in `src/data/seed.json` and includes:
- Sample sites
- Sample meters
- Sample readings
- Sample KPIs
- Sample anomalies

## Row Level Security Policies

To secure your data, implement the following Row Level Security (RLS) policies:

```sql
-- Enable RLS on all tables
ALTER TABLE public.site ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing site data
CREATE POLICY "Anyone can read sites" ON public.site FOR SELECT USING (true);
CREATE POLICY "Only admins can modify sites" ON public.site FOR ALL USING (get_user_role() = 'Admin');

-- Similar policies for other tables...
```

## Database Functions

Create the following database functions to support authentication and authorization:

```sql
-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS app_role
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select role from profiles where id = auth.uid()
$function$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, role)
  values (new.id, 'Operator');
  return new;
end;
$function$;

-- Trigger to create profile when user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Authentication Configuration

Configure authentication in the Supabase dashboard:

1. Enable the Email provider
2. Set password requirements
3. Configure redirect URLs

For development, it's recommended to disable email confirmation to simplify testing.

## Troubleshooting

### Common Issues and Solutions

1. **Connection Issues**:
   - Verify that the Supabase local instance is running
   - Check if the URL and key are correctly configured

2. **Migration Failures**:
   - Ensure PostgreSQL is running on the correct port
   - Check for syntax errors in SQL scripts

3. **Authentication Problems**:
   - Verify that email confirmation is disabled for development
   - Check that RLS policies are correctly implemented

4. **Data Seeding Issues**:
   - Make sure tables are created before seeding
   - Check for foreign key constraints that might block insertion
