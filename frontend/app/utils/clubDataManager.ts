export interface ClubData {
  name: string;
  description: string;
  mission: string;
  goals: string;
}

export interface UserClubData {
  userId: string;
  userName: string;
  userRole: string;
  clubs: ClubData[];
  createdAt: string;
  updatedAt: string;
}

export class ClubDataManager {
  private static readonly STORAGE_KEY = 'clubly_user_data';

  /**
   * Save club data to localStorage and create JSON file structure
   */
  static saveClubData(userId: string, userName: string, userRole: string, clubs: ClubData[]): void {
    const userData: UserClubData = {
      userId,
      userName,
      userRole,
      clubs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(userData));

    // Create individual JSON files for each club
    clubs.forEach(club => {
      const clubFileName = `${club.name.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}.json`;
      const clubData = {
        clubName: club.name,
        userId,
        userName,
        userRole,
        description: club.description,
        mission: club.mission,
        goals: club.goals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store in localStorage with a specific key for each club
      localStorage.setItem(`club_${clubFileName}`, JSON.stringify(clubData));
    });
  }

  /**
   * Get all club data for a user
   */
  static getUserClubData(userId: string): UserClubData | null {
    const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get specific club data
   */
  static getClubData(clubName: string, userId: string): any {
    const clubFileName = `${clubName.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}.json`;
    const data = localStorage.getItem(`club_${clubFileName}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get club data formatted for slidesgpt API
   */
  static getClubDataForSlidesGPT(clubName: string, userId: string): string {
    const clubData = this.getClubData(clubName, userId);
    if (!clubData) return '';

    return JSON.stringify({
      club_name: clubData.clubName,
      description: clubData.description,
      mission: clubData.mission,
      goals: clubData.goals,
      user_role: clubData.userRole
    }, null, 2);
  }

  /**
   * Update specific club data
   */
  static updateClubData(clubName: string, userId: string, updatedData: Partial<ClubData>): void {
    const existingData = this.getClubData(clubName, userId);
    if (!existingData) return;

    const updatedClubData = {
      ...existingData,
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    const clubFileName = `${clubName.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}.json`;
    localStorage.setItem(`club_${clubFileName}`, JSON.stringify(updatedClubData));

    // Also update the main user data
    const userData = this.getUserClubData(userId);
    if (userData) {
      const updatedClubs = userData.clubs.map(club => 
        club.name === clubName ? { ...club, ...updatedData } : club
      );
      
      const updatedUserData = {
        ...userData,
        clubs: updatedClubs,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(updatedUserData));
    }
  }

  /**
   * Delete club data
   */
  static deleteClubData(clubName: string, userId: string): void {
    const clubFileName = `${clubName.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}.json`;
    localStorage.removeItem(`club_${clubFileName}`);

    // Also remove from main user data
    const userData = this.getUserClubData(userId);
    if (userData) {
      const updatedClubs = userData.clubs.filter(club => club.name !== clubName);
      const updatedUserData = {
        ...userData,
        clubs: updatedClubs,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(updatedUserData));
    }
  }

  /**
   * Export all club data as JSON string
   */
  static exportAllClubData(userId: string): string {
    const userData = this.getUserClubData(userId);
    return userData ? JSON.stringify(userData, null, 2) : '';
  }

  /**
   * Get club data in a format ready for API prompts
   */
  static getClubPromptData(clubName: string, userId: string): string {
    const clubData = this.getClubData(clubName, userId);
    if (!clubData) return '';

    return `
Club: ${clubData.clubName}
Description: ${clubData.description}
Mission: ${clubData.mission}
Goals: ${clubData.goals}
User Role: ${clubData.userRole}
    `.trim();
  }
} 