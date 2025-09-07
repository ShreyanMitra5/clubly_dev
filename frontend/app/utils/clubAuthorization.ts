import { supabaseServer } from './supabaseServer';
import { auth } from '@clerk/nextjs/server';

export interface ClubMembership {
  club_id: string;
  user_id: string;
  role: string;
}

/**
 * Check if a user is a member of a specific club
 */
export async function isUserClubMember(userId: string, clubId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from('memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .single();

    if (error) {
      console.error('Error checking club membership:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isUserClubMember:', error);
    return false;
  }
}

/**
 * Check if a user is the owner of a specific club
 */
export async function isUserClubOwner(userId: string, clubId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from('clubs')
      .select('owner_id')
      .eq('id', clubId)
      .single();

    if (error) {
      console.error('Error checking club ownership:', error);
      return false;
    }

    return data?.owner_id === userId;
  } catch (error) {
    console.error('Error in isUserClubOwner:', error);
    return false;
  }
}

/**
 * Check if a user has access to a club (either as member or owner)
 */
export async function hasUserClubAccess(userId: string, clubId: string): Promise<boolean> {
  const [isMember, isOwner] = await Promise.all([
    isUserClubMember(userId, clubId),
    isUserClubOwner(userId, clubId)
  ]);

  return isMember || isOwner;
}

/**
 * Get user's role in a club
 */
export async function getUserClubRole(userId: string, clubId: string): Promise<string | null> {
  try {
    // Check if user is owner
    const isOwner = await isUserClubOwner(userId, clubId);
    if (isOwner) {
      return 'Owner';
    }

    // Check membership role
    const { data, error } = await supabaseServer
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .single();

    if (error) {
      console.error('Error getting user club role:', error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error('Error in getUserClubRole:', error);
    return null;
  }
}

/**
 * Get all clubs a user has access to
 */
export async function getUserClubs(userId: string): Promise<ClubMembership[]> {
  try {
    // Get clubs where user is owner
    const { data: ownedClubs, error: ownedError } = await supabaseServer
      .from('clubs')
      .select('id')
      .eq('owner_id', userId);

    if (ownedError) {
      console.error('Error getting owned clubs:', ownedError);
    }

    // Get clubs where user is member
    const { data: memberships, error: membershipError } = await supabaseServer
      .from('memberships')
      .select('club_id, role')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error getting memberships:', membershipError);
    }

    const clubs: ClubMembership[] = [];

    // Add owned clubs
    if (ownedClubs) {
      ownedClubs.forEach(club => {
        clubs.push({
          club_id: club.id,
          user_id: userId,
          role: 'Owner'
        });
      });
    }

    // Add member clubs (avoid duplicates)
    if (memberships) {
      memberships.forEach(membership => {
        if (!clubs.some(c => c.club_id === membership.club_id)) {
          clubs.push({
            club_id: membership.club_id,
            user_id: userId,
            role: membership.role
          });
        }
      });
    }

    return clubs;
  } catch (error) {
    console.error('Error in getUserClubs:', error);
    return [];
  }
}

/**
 * Middleware function to check authorization for S3 operations
 */
export async function authorizeS3Operation(
  userId: string,
  clubId: string,
  operation: 'upload' | 'download'
): Promise<{ authorized: boolean; error?: string }> {
  try {
    const hasAccess = await hasUserClubAccess(userId, clubId);
    
    if (!hasAccess) {
      return {
        authorized: false,
        error: `User ${userId} does not have access to club ${clubId}`
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Error in authorizeS3Operation:', error);
    return {
      authorized: false,
      error: 'Authorization check failed'
    };
  }
}

/**
 * Extract and validate user from request
 */
export async function getAuthenticatedUser(): Promise<{ userId: string | null; error?: string }> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        userId: null,
        error: 'User not authenticated'
      };
    }

    return { userId };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return {
      userId: null,
      error: 'Authentication failed'
    };
  }
}
