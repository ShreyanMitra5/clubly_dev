# SlidesGPT Integration Guide

This guide explains how to use the new SlidesGPT API integration with Clubly's stored club data.

## Overview

The system now uses [SlidesGPT API](https://slidesgpt.com/docs/getting-started/introduction) instead of custom Python backend for generating presentations. Club data collected during onboarding is stored in JSON format and can be used to create personalized prompts for the SlidesGPT API.

## File Structure

```
clubly/
├── slidesgpt_generator.py          # Main Python utility for SlidesGPT API
├── requirements.txt                # Python dependencies
├── example_club_data.json          # Example JSON structure
├── frontend/
│   └── app/
│       └── utils/
│           ├── clubDataManager.ts  # Club data management
│           ├── slidesGPTHelper.ts  # SlidesGPT helper functions
│           └── exportClubData.js   # Export utilities
└── SLIDESGPT_INTEGRATION.md        # This file
```

## How It Works

### 1. Data Collection (Frontend)
- Users complete onboarding with club details
- Data is stored in localStorage using `ClubDataManager`
- Each club gets its own JSON structure

### 2. Data Export (Frontend)
- Use `ClubDataExporter` to export club data as JSON files
- Data can be downloaded or converted to strings for API usage

### 3. Presentation Generation (Python)
- Use `SlidesGPTGenerator` to load JSON data and create prompts
- Send requests to SlidesGPT API
- Download generated presentations

## Usage Examples

### Python Usage

```python
from slidesgpt_generator import SlidesGPTGenerator
import os

# Set your SlidesGPT API key
os.environ['SLIDESGPT_API_KEY'] = 'your_api_key_here'

# Initialize generator
generator = SlidesGPTGenerator(os.environ['SLIDESGPT_API_KEY'])

# Generate presentation using club data
result = generator.generate_club_presentation(
    json_file_path="AI_Club_user123.json",
    topic="Introduction to Neural Networks",
    week=1,
    theme="modern",
    slides_count=12,
    output_path="presentation.pptx"
)

print("Presentation generated:", result)
```

### Frontend Usage

```javascript
import { ClubDataExporter } from './utils/exportClubData';

// Export club data as JSON file
const fileName = ClubDataExporter.downloadClubDataAsJSON("AI Club", "user123");

// Get club data as string for API
const clubDataString = ClubDataExporter.getClubDataAsString("AI Club", "user123");

// Create prompt for SlidesGPT
const prompt = ClubDataExporter.createPromptFromClubData(
    "AI Club", 
    "user123", 
    "Introduction to Machine Learning", 
    1
);
```

## JSON Data Structure

Each club's data is stored in this format:

```json
{
  "clubName": "AI Club",
  "userId": "user_123456",
  "userName": "John Doe",
  "userRole": "President",
  "description": "The AI Club is a student organization...",
  "mission": "To foster a community of AI enthusiasts...",
  "goals": "Our primary goals include: 1) Organizing weekly workshops...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## API Integration

### SlidesGPT API Endpoints Used

1. **Generate Presentation**: `POST /generate`
   - Sends club data and topic as prompt
   - Returns presentation ID

2. **Download Presentation**: `GET /download/{presentation_id}`
   - Downloads the generated presentation file

### Prompt Structure

The system creates comprehensive prompts that include:
- Club information (name, description, mission, goals)
- User context (role, name)
- Presentation requirements (topic, audience, tone)
- Specific instructions for SlidesGPT

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export SLIDESGPT_API_KEY="your_api_key_here"
```

### 3. Get SlidesGPT API Key

1. Visit [SlidesGPT](https://slidesgpt.com/docs/getting-started/introduction)
2. Sign up for an account
3. Get your API key from the dashboard

### 4. Export Club Data

Use the frontend utilities to export club data as JSON files, or access the data directly from localStorage.

## Benefits of This Approach

1. **Personalized Content**: Presentations are tailored to each club's mission and goals
2. **Consistent Quality**: Uses SlidesGPT's proven AI presentation generation
3. **Easy Integration**: Simple JSON-based data flow
4. **Scalable**: Can handle multiple clubs and users
5. **Maintainable**: Clean separation between data collection and presentation generation

## Troubleshooting

### Common Issues

1. **API Key Not Set**: Ensure `SLIDESGPT_API_KEY` environment variable is set
2. **JSON File Not Found**: Check that club data has been exported correctly
3. **Network Errors**: Verify internet connection and API endpoint accessibility
4. **Invalid JSON**: Ensure club data is properly formatted

### Error Handling

The Python utility includes comprehensive error handling for:
- File not found errors
- JSON parsing errors
- API request failures
- Network timeouts

## Future Enhancements

1. **Batch Processing**: Generate presentations for multiple clubs at once
2. **Template System**: Pre-defined presentation templates for different club types
3. **Custom Themes**: Club-specific visual themes
4. **Analytics**: Track presentation usage and effectiveness
5. **Collaboration**: Multi-user presentation editing 