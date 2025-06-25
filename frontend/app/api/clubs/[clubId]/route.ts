import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { clubId } = params;

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    // Search for the club file in all user directories
    const dataDir = join(process.cwd(), 'data', 'clubs');
    
    try {
      const userDirs = await readdir(dataDir);
      
      for (const userId of userDirs) {
        const userDir = join(dataDir, userId);
        const files = await readdir(userDir);
        
        for (const file of files) {
          if (file.includes(clubId)) {
            const filePath = join(userDir, file);
            const fileContent = await readFile(filePath, 'utf-8');
            const clubData = JSON.parse(fileContent);
            
            return NextResponse.json(clubData);
          }
        }
      }
      
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
      
    } catch (error) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error fetching club data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 