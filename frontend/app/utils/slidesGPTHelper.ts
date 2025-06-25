import { ClubDataManager } from './clubDataManager';

export class SlidesGPTHelper {
  /**
   * Get formatted club data for slidesgpt API prompts
   */
  static getClubPromptData(clubName: string, userId: string): string {
    return ClubDataManager.getClubPromptData(clubName, userId);
  }

  /**
   * Get club data as JSON for API requests
   */
  static getClubDataJSON(clubName: string, userId: string): string {
    return ClubDataManager.getClubDataForSlidesGPT(clubName, userId);
  }

  /**
   * Get club data as structured object for API requests
   */
  static getClubDataObject(clubName: string, userId: string): any {
    const clubData = ClubDataManager.getClubData(clubName, userId);
    if (!clubData) return null;

    return {
      club_name: clubData.clubName,
      description: clubData.description,
      mission: clubData.mission,
      goals: clubData.goals,
      user_role: clubData.userRole,
      user_name: clubData.userName
    };
  }

  /**
   * Create a comprehensive prompt for slidesgpt API
   */
  static createSlidesGPTPrompt(clubName: string, userId: string, presentationType: string = 'general'): string {
    const clubData = ClubDataManager.getClubData(clubName, userId);
    if (!clubData) return '';

    const basePrompt = `
You are creating a presentation for a club called "${clubData.clubName}".

Club Information:
- Description: ${clubData.description}
- Mission: ${clubData.mission}
- Goals: ${clubData.goals}
- User Role: ${clubData.userRole}
- User Name: ${clubData.userName}

Please create a ${presentationType} presentation that aligns with the club's mission and goals.
    `.trim();

    return basePrompt;
  }

  /**
   * Get all clubs for a user (useful for multi-club presentations)
   */
  static getAllUserClubs(userId: string): any[] {
    const userData = ClubDataManager.getUserClubData(userId);
    return userData ? userData.clubs : [];
  }

  /**
   * Create a multi-club prompt for slidesgpt API
   */
  static createMultiClubPrompt(userId: string, presentationType: string = 'general'): string {
    const userData = ClubDataManager.getUserClubData(userId);
    if (!userData) return '';

    let clubsInfo = '';
    userData.clubs.forEach((club, index) => {
      clubsInfo += `
Club ${index + 1}: ${club.name}
- Description: ${club.description}
- Mission: ${club.mission}
- Goals: ${club.goals}
      `;
    });

    const multiClubPrompt = `
You are creating a ${presentationType} presentation for a user who manages multiple clubs.

User Information:
- Name: ${userData.userName}
- Role: ${userData.userRole}

Clubs Information:
${clubsInfo}

Please create a presentation that addresses the needs of all these clubs.
    `.trim();

    return multiClubPrompt;
  }

  /**
   * Export club data for external API usage
   */
  static exportClubDataForAPI(clubName: string, userId: string): any {
    const clubData = ClubDataManager.getClubData(clubName, userId);
    if (!clubData) return null;

    return {
      metadata: {
        club_name: clubData.clubName,
        user_id: userId,
        user_name: clubData.userName,
        user_role: clubData.userRole,
        created_at: clubData.createdAt,
        updated_at: clubData.updatedAt
      },
      content: {
        description: clubData.description,
        mission: clubData.mission,
        goals: clubData.goals
      },
      api_format: 'slidesgpt_v1'
    };
  }
} 