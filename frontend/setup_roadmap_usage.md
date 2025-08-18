# Roadmap Usage Tracking Setup

## Overview
This feature adds a monthly limit of 2 roadmap generations per club with a beautiful usage tracking display that matches the AI SaaS theme.

## Database Setup

1. **Run the SQL file to create the usage tracking table:**
   ```sql
   -- Execute frontend/create_roadmap_usage_table.sql in your Supabase database
   ```

## Features Added

### Backend
- **`roadmap_usage` table**: Tracks roadmap generations per club per month
- **API endpoint**: `/api/clubs/[clubId]/roadmap-usage` for checking and recording usage
- **Enhanced roadmap API**: Checks usage limits before generating roadmaps

### Frontend
- **`RoadmapUsageDisplay` component**: Beautiful UI showing usage stats with AI SaaS theme
- **Usage integration**: Shows usage in both setup and main roadmap views
- **Real-time updates**: Updates usage count after generation

### Design Features
- **AI SaaS theme colors**: Orange gradients matching the app's design
- **Progress indicators**: Visual progress bars and status badges
- **Motion animations**: Smooth Framer Motion animations
- **Responsive design**: Works on all screen sizes
- **Status messages**: Clear messaging about usage limits

## Usage Flow

1. **Check Usage**: Page loads and displays current usage (X/2 used)
2. **Generate Button**: Disabled if limit reached, shows status
3. **Generation**: Records usage and updates display
4. **Monthly Reset**: Usage resets automatically each month

## Monthly Limits
- **Limit**: 2 roadmap generations per club per month
- **Reset**: Automatic on the 1st of each month
- **Tracking**: By `month_year` field (format: "YYYY-MM")

## Colors & Theme
- **Primary**: Orange gradients (`from-orange-500 to-orange-600`)
- **Success**: Green for available generations
- **Warning**: Yellow/Orange for near limit
- **Error**: Red for limit reached
- **Background**: White/backdrop-blur with subtle transparency
- **Text**: Light font weights matching AI SaaS aesthetic
