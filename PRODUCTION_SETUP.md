# Clubly Production Setup Guide

This guide explains how to set up and use the production-ready Clubly system with JSON file storage and SlidesGPT API integration.

## 🏗️ System Architecture

The production system consists of:

1. **Frontend (Next.js)**: User interface for onboarding and presentation generation
2. **API Routes**: Handle JSON file storage and SlidesGPT integration
3. **JSON File Storage**: Persistent club data storage on the server
4. **Python Script**: Standalone tool for generating presentations from JSON files
5. **SlidesGPT API**: External service for presentation generation

## 📁 File Structure

```
clubly/
├── frontend/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── clubs/
│   │   │   │   │   ├── save/route.ts          # Save club data to JSON files
│   │   │   │   │   ├── [clubId]/route.ts      # Get specific club data
│   │   │   │   │   └── user/[userId]/route.ts # Get all user clubs
│   │   │   │   └── slidesgpt/
│   │   │   │       └── generate/route.ts      # SlidesGPT API integration
│   │   │   └── utils/
│   │   │       ├── productionClubManager.ts   # Production club data manager
│   │   │       └── clubDataManager.ts         # Legacy localStorage manager
│   │   │   ├── onboarding/page.tsx            # Multi-step onboarding
│   │   │   ├── generate/page.tsx              # Presentation generation
│   │   │   └── clubs/[clubName]/page.tsx      # Club details page
│   │   └── data/                              # JSON file storage (created automatically)
│   │       └── clubs/
│   │           └── {userId}/
│   │               └── {clubName}_{clubId}.json
│   ├── production_slidesgpt_generator.py      # Standalone Python script
│   └── requirements.txt                       # Python dependencies
```

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# SlidesGPT API Configuration
SLIDESGPT_API_KEY=your_slidesgpt_api_key_here

# Optional: Custom API base URL (defaults to /api)
NEXT_PUBLIC_API_URL=/api
```

### 2. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install uuid @types/uuid

# Python dependencies (for standalone script)
pip install requests
```

### 3. Create Data Directory

The system will automatically create the data directory structure when needed, but you can create it manually:

```bash
mkdir -p frontend/data/clubs
```

## 🔄 How It Works

### 1. Onboarding Flow

1. User completes multi-step onboarding (name, role, clubs)
2. For each club, user provides:
   - Club name
   - Description (1000 chars max)
   - Mission statement (1000 chars max)
   - Goals & objectives (1000 chars max)
3. Data is saved to JSON files in `/data/clubs/{userId}/`
4. Each club gets a unique `clubId` for identification

### 2. Presentation Generation

1. User selects a specific club from their dashboard
2. User enters presentation topic and optional week number
3. System loads the club's JSON data
4. Creates a comprehensive prompt combining:
   - Club information (name, mission, goals, user role)
   - Presentation topic and requirements
5. Sends prompt to SlidesGPT API
6. Returns generated presentation data

### 3. JSON File Structure

Each club is stored as a JSON file with this structure:

```json
{
  "clubId": "uuid-string",
  "userId": "clerk-user-id",
  "userName": "John Doe",
  "userRole": "President",
  "clubName": "AI Club",
  "description": "A club focused on artificial intelligence...",
  "mission": "To educate and inspire students about AI...",
  "goals": "1. Host weekly AI workshops\n2. Organize hackathons...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🐍 Python Script Usage

The standalone Python script can be used independently of the web interface:

### Basic Usage

```bash
python production_slidesgpt_generator.py \
  --club "AI Club" \
  --topic "Introduction to Machine Learning" \
  --week 3 \
  --theme modern \
  --output "ai_club_ml_intro.pptx"
```

### Advanced Usage

```bash
# With custom data directory
python production_slidesgpt_generator.py \
  --club "Biology Club" \
  --topic "Cell Biology Basics" \
  --data-dir "/path/to/custom/data/clubs" \
  --slides 15 \
  --theme nature

# Using environment variable for API key
export SLIDESGPT_API_KEY="your_api_key"
python production_slidesgpt_generator.py \
  --club "Math Club" \
  --topic "Calculus Fundamentals"
```

### Programmatic Usage

```python
from production_slidesgpt_generator import ProductionSlidesGPTGenerator

# Initialize generator
generator = ProductionSlidesGPTGenerator(api_key="your_api_key")

# Generate presentation
result = generator.generate_club_presentation(
    club_name="AI Club",
    topic="Neural Networks",
    week=5,
    theme="modern",
    output_path="presentation.pptx"
)

print(result)
```

## 🔧 API Endpoints

### Save Club Data
```
POST /api/clubs/save
Content-Type: application/json

{
  "userId": "clerk-user-id",
  "userName": "John Doe",
  "userRole": "President",
  "clubs": [
    {
      "name": "AI Club",
      "description": "...",
      "mission": "...",
      "goals": "..."
    }
  ]
}
```

### Get User Clubs
```
GET /api/clubs/user/{userId}
```

### Get Specific Club
```
GET /api/clubs/{clubId}
```

### Generate Presentation
```
POST /api/slidesgpt/generate
Content-Type: application/json

{
  "clubId": "uuid-string",
  "topic": "Introduction to AI",
  "week": 3,
  "theme": "modern",
  "prompt": "Generated prompt..."
}
```

## 🎨 Available Themes

- `modern` - Clean and professional
- `dark` - Sleek dark theme
- `nature` - Fresh and organic
- `coding` - Perfect for tech topics
- `academic` - Traditional and formal
- `creative` - Artistic and vibrant

## 🔒 Security Considerations

1. **API Keys**: Store SlidesGPT API key in environment variables
2. **File Permissions**: Ensure proper file permissions on data directory
3. **User Authentication**: All endpoints require valid Clerk user authentication
4. **Input Validation**: All user inputs are validated and sanitized
5. **Error Handling**: Comprehensive error handling prevents data exposure

## 🚀 Deployment

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. Deploy the frontend directory
3. The API routes will be automatically deployed

### Local Development

```bash
cd frontend
npm run dev
```

### Production Python Script

```bash
# Make script executable
chmod +x production_slidesgpt_generator.py

# Run with proper permissions
python production_slidesgpt_generator.py --help
```

## 🐛 Troubleshooting

### Common Issues

1. **"Club not found" error**
   - Check if the club name matches exactly
   - Verify the data directory structure
   - Ensure JSON files are properly formatted

2. **"SlidesGPT API key not configured"**
   - Set `SLIDESGPT_API_KEY` environment variable
   - Restart the development server

3. **"Failed to save club data"**
   - Check file permissions on data directory
   - Ensure sufficient disk space
   - Verify user authentication

4. **"Network error"**
   - Check internet connection
   - Verify SlidesGPT API endpoint accessibility
   - Check firewall settings

### Debug Mode

Enable debug logging by setting:

```bash
export DEBUG=true
```

## 📈 Performance Optimization

1. **File Caching**: Consider implementing file caching for frequently accessed club data
2. **Batch Operations**: For multiple clubs, consider batch API calls
3. **Compression**: Implement gzip compression for large JSON files
4. **CDN**: Use CDN for static assets in production

## 🔄 Migration from Legacy System

If migrating from the localStorage system:

1. Export existing data using the export utility
2. Use the Python script to convert to new JSON format
3. Place files in the appropriate data directory structure
4. Update frontend to use production manager

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review API documentation
3. Check SlidesGPT API status
4. Verify environment configuration

## 📝 License

This system is part of the Clubly project. Please refer to the main project license for usage terms. 