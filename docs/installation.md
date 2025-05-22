
# Installation Guide

This guide provides detailed instructions for installing and setting up the ENGIE Energy Data Platform for local development or production deployment.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

Before installing, ensure you have:

- **Node.js**: Version 16.x or higher
- **npm**: Version 7.x or higher (or yarn)
- **Git**: For version control
- **Docker**: For running Supabase locally
- **PostgreSQL**: Basic knowledge (for database operations)

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd <project-directory>
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Set Up Local Supabase

Follow the steps in [Database Setup](./database-setup.md) to:
1. Install the Supabase CLI
2. Start a local Supabase instance
3. Create the necessary database tables
4. Configure authentication

### Step 4: Configure Application

Create a local configuration by updating the Supabase client configuration:

1. Open `src/integrations/supabase/client.ts`
2. Update the Supabase URL and key to point to your local instance:

```typescript
const SUPABASE_URL = "http://localhost:54321";
const SUPABASE_PUBLISHABLE_KEY = "your-local-anon-key"; // From Supabase local setup
```

### Step 5: Start Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application will be available at `http://localhost:3000` by default.

### Step 6: Seed Initial Data

The application will automatically seed initial data when it detects empty tables. You can monitor this process in the console logs.

## Production Deployment

### Option 1: Traditional Web Hosting

#### Step 1: Build the Application

```bash
# Using npm
npm run build

# Or using yarn
yarn build
```

This creates a `dist` directory with optimized production build.

#### Step 2: Deploy the Build

Upload the contents of the `dist` directory to your web server.

#### Step 3: Configure Server

Ensure your web server:
- Serves the `index.html` for all routes
- Has proper CORS configuration
- Handles HTTPS correctly

### Option 2: Cloud Deployment (Netlify/Vercel)

#### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Configure environment variables (see Environment Configuration)
4. Deploy

#### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. The build settings should be auto-detected
3. Configure environment variables (see Environment Configuration)
4. Deploy

### Production Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Execute the SQL scripts from [Database Setup](./database-setup.md)
3. Configure authentication providers
4. Set Row Level Security policies
5. Update the application's Supabase URL and key in `src/integrations/supabase/client.ts`

## Environment Configuration

For production environments, consider configuring the following:

### Critical Settings

- **Supabase URL and Key**: Update with production values
- **Authentication Settings**: Configure email templates and redirect URLs
- **CORS Settings**: Ensure proper Cross-Origin Resource Sharing configuration

### Optional Settings

- **Analytics Integration**: Add tracking code if needed
- **Error Monitoring**: Integrate with services like Sentry
- **Performance Monitoring**: Set up real user monitoring

## Troubleshooting

### Build Issues

**Issue**: Build fails with dependency errors
**Solution**: Clear npm cache and reinstall dependencies
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**Issue**: TypeScript errors during build
**Solution**: Check that types are correctly defined and imported

### Deployment Issues

**Issue**: API requests failing in production
**Solution**: Check CORS configuration and API endpoints

**Issue**: Authentication not working in production
**Solution**: Verify Supabase auth settings and redirect URLs

### Local Development Issues

**Issue**: Supabase local instance not starting
**Solution**: Check Docker is running and ports are available

**Issue**: Seed data not loading
**Solution**: Check database connection and console for errors
