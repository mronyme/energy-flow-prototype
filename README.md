
# ENGIE Energy Data Platform

## Project Overview

This web application provides an energy data management platform designed for ENGIE teams to monitor, analyze, and manage energy consumption data across multiple sites. The platform includes features for data visualization, anomaly detection, manual data entry, CSV imports, PI system integration, and administrative functions.

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Documentation](#documentation)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Local Development](#local-development)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [Contributing](#contributing)

## Quick Start

Follow these steps to get the application running locally:

```sh
# 1. Clone the repository
git clone <your-repository-url>

# 2. Navigate to the project directory
cd <project-directory>

# 3. Install dependencies
npm install

# 4. Set up local Supabase (see docs/database-setup.md)
# Follow the Database Setup guide

# 5. Start the development server
npm run dev
```

## Features

- **Interactive Dashboard**: Visualize key performance indicators (KPIs) and energy consumption trends
- **Data Management**: Import, validate, and manage energy consumption data
- **Anomaly Detection**: Identify and manage anomalies in energy data
- **Role-based Access Control**: Different permissions for Operators, Data Managers, Managers, and Admins
- **Data Export**: Export data in various formats (CSV, JSON)
- **Multi-site Support**: Manage data across multiple geographical locations

## Documentation

Detailed documentation is available in the `docs` directory:

- [Technical Documentation](docs/technical-documentation.md): Architecture, components, and data flow
- [Database Setup](docs/database-setup.md): Setting up and configuring Supabase locally
- [User Guide](docs/user-guide.md): Detailed guide for using the application by role
- [Maintenance Guide](docs/maintenance-guide.md): Instructions for maintaining and extending the platform

## Prerequisites

- Node.js (v16+)
- npm (v7+) or yarn
- Supabase CLI
- PostgreSQL (if running Supabase locally)

## Installation

See [Installation Guide](docs/installation.md) for detailed instructions.

## Local Development

```sh
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Database Setup

The application uses Supabase for database and authentication. See [Database Setup](docs/database-setup.md) for detailed instructions on setting up Supabase locally.

## Authentication

The application uses Supabase Authentication for user management. By default, there are four roles:

- **Admin**: Full access to all features and settings
- **Manager**: Access to dashboards and reports
- **DataManager**: Responsible for data quality and management
- **Operator**: Can enter and import data

See the [User Guide](docs/user-guide.md) for more information on roles and permissions.

## Contributing

Please refer to [Contributing Guidelines](docs/contributing.md) for details on our code of conduct and the process for submitting pull requests.
