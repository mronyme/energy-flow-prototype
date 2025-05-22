
# User Guide

This document provides a comprehensive guide to using the ENGIE Energy Data Platform. It is organized by user role to help you understand the features available to you.

## Table of Contents

- [Common Features](#common-features)
- [Operator Guide](#operator-guide)
- [Data Manager Guide](#data-manager-guide)
- [Manager Guide](#manager-guide)
- [Administrator Guide](#administrator-guide)
- [Troubleshooting](#troubleshooting)

## Common Features

### Logging In

1. Navigate to the login page
2. Enter your email address and password
3. Click "Sign In"

### Navigation

The sidebar on the left provides access to different sections of the application. Available sections depend on your role.

### Dashboard

The dashboard displays key energy consumption metrics and trends. It includes:

- KPI cards showing energy usage, costs, and CO2 emissions
- Trend charts showing consumption patterns over time
- Filters for date range and site selection

### Signing Out

Click on your profile icon in the top-right corner and select "Sign Out".

## Operator Guide

Operators are responsible for data entry and basic data management.

### Data Entry

#### Manual Data Entry

1. Navigate to **Data Load > Manual Entry**
2. Select the site and meter
3. Enter the date, time, and reading value
4. Click "Save" to store the reading

#### CSV Import

1. Navigate to **Data Load > CSV Import**
2. Click "Upload" or drag and drop your CSV file
3. Review the data preview
4. Click "Import" to save the data

#### PI System Integration

1. Navigate to **Data Load > PI Preview**
2. Configure the PI connection parameters
3. Select tags to import
4. Review the data preview
5. Click "Import" to save the data

## Data Manager Guide

Data Managers are responsible for data quality and advanced data management.

### All Operator Features

Data Managers have access to all features available to Operators.

### Data Quality Management

#### Anomaly Detection

1. Navigate to **Data Quality > Anomalies**
2. Review detected anomalies
3. Select an anomaly to examine details
4. Choose to accept, reject, or correct the anomaly

#### Bulk Correction

1. Navigate to **Data Quality > Anomalies**
2. Select multiple anomalies using checkboxes
3. Click "Bulk Correct"
4. Choose a correction method
5. Apply corrections

### Import Journal

1. Navigate to **Data Quality > Journal**
2. Review the history of data imports
3. Filter by date, user, or status
4. Click on an entry to see details

## Manager Guide

Managers have access to dashboards and reports for monitoring and analysis.

### Dashboard Analysis

1. Navigate to the **Dashboard**
2. Use filters to select date ranges and sites
3. Analyze trends and KPIs
4. Export data for further analysis

### Data Export

1. Navigate to the **Dashboard** or any data view
2. Click "Export"
3. Select export format (CSV or JSON)
4. Download the exported file

## Administrator Guide

Administrators have full access to all features and settings.

### All Features

Administrators have access to all features available to Operators, Data Managers, and Managers.

### User Management

1. Navigate to **Admin > Users**
2. View all users
3. Click "Add User" to create a new user
4. Set email, password, and role
5. Click "Save" to create the user

### Emission Factors Management

1. Navigate to **Admin > Units & Factors**
2. View current emission factors
3. Click "Edit" to modify a factor
4. Enter the new value
5. Click "Save" to update

### Audit Logs

1. Navigate to **Admin > Audit Logs** (accessible via the system)
2. Review system activity
3. Filter by user, action, or date
4. Export logs as needed

## Troubleshooting

### Common Issues

1. **Cannot log in**:
   - Verify your email address and password
   - Check if your account has been activated
   - Contact an administrator if issues persist

2. **Missing features**:
   - Verify your user role with an administrator
   - Check if you have the necessary permissions

3. **Data not showing**:
   - Check your selected filters
   - Verify that data exists for the selected time period
   - Ensure you have permission to view the data

4. **Import errors**:
   - Check the CSV format matches the expected format
   - Ensure data types are correct
   - Review validation errors in the import preview

### Getting Help

For additional assistance:

1. Check this documentation
2. Contact your system administrator
3. Refer to technical documentation for developer-related issues
