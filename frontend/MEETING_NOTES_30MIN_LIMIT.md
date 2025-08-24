# Meeting Notes Recording Limit Feature

## Overview
Users can now record meeting notes for a maximum of 30 minutes per session, with unlimited sessions per month.

## Key Changes

### 1. Removed Monthly Limits
- **Before**: Users were limited to 1 meeting note per club per month
- **After**: Users can record unlimited 30-minute meetings per month
- **Usage tracking**: Still maintained for analytics purposes only

### 2. 30-Minute Session Limit
- **Hard cap**: No recording session can exceed 30 minutes (1800 seconds)
- **Auto-stop**: Recording automatically stops at 30:00 and proceeds to transcription
- **Manual stop**: Users can still manually stop before 30 minutes

### 3. User Experience Improvements
- **Real-time timer**: Shows current recording duration in MM:SS format
- **Progress bar**: Visual indicator of how close to the 30-minute limit
- **Warning system**: Orange warning when approaching the limit (last 60 seconds)
- **Visual feedback**: Recording bars turn orange when approaching the limit

## Technical Implementation

### Frontend Changes
- Added `recordingDuration` state to track elapsed time
- Added `maxDurationReached` state for auto-stop detection
- Implemented interval timer that updates every second
- Auto-stop logic triggers at 1800 seconds (30 minutes)
- Visual indicators for time remaining and progress

### Backend Changes
- Removed monthly limit checks from transcribe API
- Updated usage tracking to remove limit enforcement
- Usage recording maintained for analytics purposes

### Database
- `meeting_notes_usage` table still tracks usage but no longer enforces limits
- Table comment updated to reflect new unlimited system

## User Flow

1. **Start Recording**: User clicks record button
2. **Timer Starts**: 30-minute countdown begins
3. **Visual Feedback**: Progress bar and timer show current status
4. **Warning Period**: Last 60 seconds show orange warning
5. **Auto-Stop**: At 30:00, recording automatically stops
6. **Continue Process**: Transcription and summarization proceed as usual

## Benefits

- **Unlimited meetings**: Users can record as many meetings as needed
- **Consistent quality**: 30-minute limit ensures manageable file sizes
- **Better UX**: Clear visual feedback and warnings
- **No interruptions**: Seamless transition from recording to processing

## Notes

- All existing meeting summary rules remain the same
- Quota system has been completely removed
- Users can still manually stop recordings before 30 minutes
- The system automatically handles the transition to transcription
