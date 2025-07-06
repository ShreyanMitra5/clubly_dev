import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { userId, clubId, clubName, roadmapData } = await request.json();
    if (!userId || !clubId || !clubName || !roadmapData) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    // Find the file for this club
    const userDir = join(process.cwd(), 'data', 'clubs', userId);
    await mkdir(userDir, { recursive: true });
    const clubFileName = `${clubName.replace(/[^a-zA-Z0-9]/g, '_')}_${clubId}.json`;
    const filePath = join(userDir, clubFileName);
    let clubData = {};
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      clubData = JSON.parse(fileContent);
    } catch {
      // File may not exist yet
      clubData = { clubId, clubName, userId };
    }
    // Update roadmap section
    clubData.roadmap = roadmapData;
    clubData.updatedAt = new Date().toISOString();
    await writeFile(filePath, JSON.stringify(clubData, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving roadmap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 