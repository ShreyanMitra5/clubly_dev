import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userDir = join(process.cwd(), 'data', 'clubs', userId);
    
    try {
      const files = await readdir(userDir);
      const clubs = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(userDir, file);
          const fileContent = await readFile(filePath, 'utf-8');
          const clubData = JSON.parse(fileContent);
          clubs.push(clubData);
        }
      }

      return NextResponse.json(clubs);
      
    } catch (error) {
      // If user directory doesn't exist, return empty array
      return NextResponse.json([]);
    }

  } catch (error) {
    console.error('Error fetching user clubs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 