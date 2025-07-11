import { ClubData } from './clubDataManager';
import { supabase } from '../../utils/supabaseClient';

export interface ProductionClubData {
  clubId: string;
  userId: string;
  userName: string;
  userRole: string;
  clubName: string;
  description: string;
  mission: string;
  goals: string;
  audience: string;
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
    // Fetch clubs for this user from Supabase
    const { data, error } = await supabase
      .from('memberships')
      .select('club_id, role, clubs (id, name, description, mission, goals, audience, owner_id, created_at, updated_at)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user clubs from Supabase:', error);
      return [];
    }

    // Map the data to ProductionClubData[]
    return (data || []).map((m: any) => ({
      clubId: m.club_id,
      userId,
      userName: '', // Optionally fetch or pass this if needed
      userRole: m.role,
      clubName: m.clubs?.name,
      description: m.clubs?.description,
      mission: m.clubs?.mission,
      goals: m.clubs?.goals,
      audience: m.clubs?.audience || '',
      createdAt: m.clubs?.created_at,
      updatedAt: m.clubs?.updated_at,
    })).filter(c => c.clubName);
  }

  /**
   * Get specific club data by clubId
   */
  static async getClubData(clubId: string): Promise<ProductionClubData | null> {
    // First get the club data
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .select('*, memberships!inner(*)')
      .eq('id', clubId)
      .single();

    if (clubError || !clubData) {
      console.error('Error fetching club data from Supabase:', clubError);
      return null;
    }

    // Map to ProductionClubData
    return {
      clubId: clubData.id,
      userId: clubData.owner_id,
      userName: '', // Optionally fetch or pass this if needed
      userRole: clubData.memberships?.[0]?.role || '',
      clubName: clubData.name,
      description: clubData.description,
      mission: clubData.mission,
      goals: clubData.goals,
      audience: clubData.audience || '',
      createdAt: clubData.created_at,
      updatedAt: clubData.updated_at,
    };
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
- Target Audience: ${clubData.audience}

Presentation Requirements:
- Topic: ${topic}
- Target Audience: ${clubData.audience || 'Club members and stakeholders'}
- Tone: Professional yet engaging
- Structure: Include introduction, main content sections, and conclusion
- Visual Style: Modern and clean design

Please create a presentation that:
1. Aligns with the club's mission and goals
2. Is appropriate for the user's role in the club
3. Provides valuable information about the topic
4. Engages the target audience effectively
5. Includes relevant examples and practical applications

Make sure the content is tailored specifically for ${clubData.clubName} and its target audience: ${clubData.audience}.
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