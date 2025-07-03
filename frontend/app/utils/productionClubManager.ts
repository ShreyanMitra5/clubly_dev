import { ClubData } from './clubDataManager';

export interface ProductionClubData {
  clubId: string;
  userId: string;
  userName: string;
  userRole: string;
  clubName: string;
  description: string;
  mission: string;
  goals: string;
  createdAt: string;
  updatedAt: string;
}

export class ProductionClubManager {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  /**
   * Save club data to production storage (JSON files on server)
   */
  static async saveClubData(userId: string, userName: string, userRole: string, clubs: ClubData[]): Promise<void> {
    try {
      // Fetch existing clubs
      const existingClubs = await this.getUserClubs(userId).catch(() => []);
      const updatedClubs = clubs.map(newClub => {
        const match = existingClubs.find(c => c.clubName === newClub.name || c.clubId === newClub.clubId);
        if (match) {
          // Overwrite existing
          return {
            ...match,
            description: newClub.description,
            mission: newClub.mission,
            goals: newClub.goals,
            updatedAt: new Date().toISOString()
          };
        } else {
          // New club
          return {
            clubId: crypto.randomUUID(),
            userId,
            userName,
            userRole,
            clubName: newClub.name,
            description: newClub.description,
            mission: newClub.mission,
            goals: newClub.goals,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      });
      // Save only the updated clubs
      // (API route should be updated to overwrite files for existing clubs)
      const response = await fetch('/api/clubs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
          userRole,
          clubs: updatedClubs
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save club data: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving club data:', error);
      throw error;
    }
  }

  /**
   * Get all clubs for a user
   */
  static async getUserClubs(userId: string): Promise<ProductionClubData[]> {
    try {
      const response = await fetch('/api/clubs/user/' + userId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user clubs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      throw error;
    }
  }

  /**
   * Get specific club data by clubId
   */
  static async getClubData(clubId: string): Promise<ProductionClubData | null> {
    try {
      const response = await fetch('/api/clubs/' + clubId);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch club data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching club data:', error);
      throw error;
    }
  }

  /**
   * Get club data as JSON string for SlidesGPT
   */
  static async getClubDataForSlidesGPT(clubId: string): Promise<string> {
    try {
      const clubData = await this.getClubData(clubId);
      if (!clubData) {
        throw new Error('Club data not found');
      }

      return JSON.stringify({
        club_name: clubData.clubName,
        description: clubData.description,
        mission: clubData.mission,
        goals: clubData.goals,
        user_role: clubData.userRole,
        user_name: clubData.userName
      }, null, 2);
    } catch (error) {
      console.error('Error getting club data for SlidesGPT:', error);
      throw error;
    }
  }

  /**
   * Create a comprehensive prompt for SlidesGPT using club data
   */
  static async createSlidesGPTPrompt(clubId: string, topic: string, week?: number): Promise<string> {
    try {
      const clubData = await this.getClubData(clubId);
      if (!clubData) {
        throw new Error('Club data not found');
      }

      const weekInfo = week ? ` (Week ${week})` : '';
      
      return `
Create a professional presentation for ${clubData.clubName}${weekInfo} about: ${topic}

Club Information:
- Club Name: ${clubData.clubName}
- Description: ${clubData.description}
- Mission Statement: ${clubData.mission}
- Goals & Objectives: ${clubData.goals}
- User Role: ${clubData.userRole}
- User Name: ${clubData.userName}

Presentation Requirements:
- Topic: ${topic}
- Target Audience: Club members and stakeholders
- Tone: Professional yet engaging
- Structure: Include introduction, main content sections, and conclusion
- Visual Style: Modern and clean design

Please create a presentation that:
1. Aligns with the club's mission and goals
2. Is appropriate for the user's role in the club
3. Provides valuable information about the topic
4. Engages the audience effectively
5. Includes relevant examples and practical applications

Make sure the content is tailored specifically for ${clubData.clubName} and its members.
      `.trim();
    } catch (error) {
      console.error('Error creating SlidesGPT prompt:', error);
      throw error;
    }
  }

  /**
   * Generate presentation using SlidesGPT API
   */
  static async generatePresentation(clubId: string, topic: string, week?: number, theme: string = 'modern'): Promise<any> {
    try {
      const prompt = await this.createSlidesGPTPrompt(clubId, topic, week);
      const response = await fetch('/api/slidesgpt/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId,
          topic,
          week,
          theme,
          prompt
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to generate presentation: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error generating presentation:', error);
      throw error;
    }
  }
} 