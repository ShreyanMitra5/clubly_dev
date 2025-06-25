import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userRole, clubs } = body;

    if (!userId || !clubs || !Array.isArray(clubs)) {
      return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
    }

    const results = [];

    for (const club of clubs) {
      // Generate unique club ID
      const clubId = uuidv4();
      
      // Create club data structure
      const clubData = {
        clubId,
        userId,
        userName,
        userRole,
        clubName: club.name,
        description: club.description,
        mission: club.mission,
        goals: club.goals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create directory structure: /data/clubs/{userId}/
      const userDir = join(process.cwd(), 'data', 'clubs', userId);
      await mkdir(userDir, { recursive: true });

      // Save club data as JSON file
      const fileName = `${club.name.replace(/[^a-zA-Z0-9]/g, '_')}_${clubId}.json`;
      const filePath = join(userDir, fileName);
      
      await writeFile(filePath, JSON.stringify(clubData, null, 2));

      results.push({
        clubId,
        clubName: club.name,
        fileName
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${clubs.length} club(s) saved successfully`,
      clubs: results
    });

  } catch (error) {
    console.error('Error saving club data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 