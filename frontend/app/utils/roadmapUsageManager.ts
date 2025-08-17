export class RoadmapUsageManager {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  private static readonly MONTHLY_LIMIT = 2; // 2 roadmaps per month per club

  /**
   * Check if a club has reached their monthly roadmap limit
   */
  static async checkUsageLimit(clubId: string): Promise<{
    canGenerate: boolean;
    currentUsage: number;
    remainingSlots: number;
    monthYear: string;
  }> {
    try {
      console.log('RoadmapUsageManager: Checking usage for clubId:', clubId);
      console.log('RoadmapUsageManager: API URL:', `${this.API_BASE_URL}/roadmaps/check-usage`);
      
      const response = await fetch(`${this.API_BASE_URL}/roadmaps/check-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clubId }),
      });

      console.log('RoadmapUsageManager: Response status:', response.status);
      console.log('RoadmapUsageManager: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RoadmapUsageManager: Response error:', errorText);
        throw new Error(`Failed to check usage: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('RoadmapUsageManager: Response data:', data);
      return data;
    } catch (error) {
      console.error('Error checking roadmap usage:', error);
      // If we can't check usage, allow generation to avoid blocking users
      return {
        canGenerate: true,
        currentUsage: 0,
        remainingSlots: this.MONTHLY_LIMIT,
        monthYear: this.getCurrentMonthYear(),
      };
    }
  }

  /**
   * Get current month-year string in YYYY-MM format
   */
  static getCurrentMonthYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get the monthly limit constant
   */
  static getMonthlyLimit(): number {
    return this.MONTHLY_LIMIT;
  }

  /**
   * Format usage information for display
   */
  static formatUsageInfo(currentUsage: number, remainingSlots: number): string {
    if (remainingSlots === 0) {
      return `Monthly limit reached (${currentUsage}/${this.MONTHLY_LIMIT})`;
    }
    return `${currentUsage}/${this.MONTHLY_LIMIT} roadmaps used this month (${remainingSlots} remaining)`;
  }

  /**
   * Check if usage is at critical level (80% or more)
   */
  static isUsageCritical(currentUsage: number): boolean {
    return currentUsage >= this.MONTHLY_LIMIT * 0.8;
  }

  /**
   * Get usage percentage
   */
  static getUsagePercentage(currentUsage: number): number {
    return Math.round((currentUsage / this.MONTHLY_LIMIT) * 100);
  }
}
