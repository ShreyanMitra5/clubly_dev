/**
 * Utility to export club data from localStorage to JSON files
 * This can be used to create JSON files for the Python SlidesGPT generator
 */

export class ClubDataExporter {
  /**
   * Export all club data for a user to JSON files
   */
  static exportUserClubData(userId) {
    try {
      const userData = JSON.parse(localStorage.getItem(`clubly_user_data_${userId}`));
      if (!userData) {
        throw new Error('No user data found');
      }

      const exportedData = {
        user: {
          userId: userData.userId,
          userName: userData.userName,
          userRole: userData.userRole,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        },
        clubs: []
      };

      // Export each club's data
      userData.clubs.forEach(club => {
        const clubFileName = `${club.name.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}.json`;
        const clubData = {
          clubName: club.name,
          userId: userData.userId,
          userName: userData.userName,
          userRole: userData.userRole,
          description: club.description,
          mission: club.mission,
          goals: club.goals,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        exportedData.clubs.push({
          fileName: clubFileName,
          data: clubData
        });
      });

      return exportedData;
    } catch (error) {
      console.error('Error exporting club data:', error);
      throw error;
    }
  }

  /**
   * Export specific club data
   */
  static exportClubData(clubName, userId) {
    try {
      const clubFileName = `${clubName.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}.json`;
      const clubData = JSON.parse(localStorage.getItem(`club_${clubFileName}`));
      
      if (!clubData) {
        throw new Error(`No data found for club: ${clubName}`);
      }

      return {
        fileName: clubFileName,
        data: clubData
      };
    } catch (error) {
      console.error('Error exporting club data:', error);
      throw error;
    }
  }

  /**
   * Download club data as JSON file
   */
  static downloadClubDataAsJSON(clubName, userId) {
    try {
      const exportedData = this.exportClubData(clubName, userId);
      
      const blob = new Blob([JSON.stringify(exportedData.data, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportedData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return exportedData.fileName;
    } catch (error) {
      console.error('Error downloading club data:', error);
      throw error;
    }
  }

  /**
   * Download all user club data as ZIP file
   */
  static async downloadAllClubDataAsZIP(userId) {
    try {
      const exportedData = this.exportUserClubData(userId);
      
      // Note: This would require a ZIP library like JSZip
      // For now, we'll just download the first club as an example
      if (exportedData.clubs.length > 0) {
        return this.downloadClubDataAsJSON(exportedData.clubs[0].data.clubName, userId);
      }
      
      throw new Error('No clubs found for user');
    } catch (error) {
      console.error('Error downloading all club data:', error);
      throw error;
    }
  }

  /**
   * Get club data as string for API usage
   */
  static getClubDataAsString(clubName, userId) {
    try {
      const exportedData = this.exportClubData(clubName, userId);
      return JSON.stringify(exportedData.data, null, 2);
    } catch (error) {
      console.error('Error getting club data as string:', error);
      throw error;
    }
  }

  /**
   * Create a prompt-ready string from club data
   */
  static createPromptFromClubData(clubName, userId, topic, week = null) {
    try {
      const exportedData = this.exportClubData(clubName, userId);
      const clubData = exportedData.data;
      
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
      console.error('Error creating prompt from club data:', error);
      throw error;
    }
  }
} 