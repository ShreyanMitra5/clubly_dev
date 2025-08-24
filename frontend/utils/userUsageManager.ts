import { auth } from '@clerk/nextjs/server';

// Usage limits for free tier only (for now)
export const TIER_LIMITS = {
  free: {
    titleGeneration: { monthly: 2, tokens: 50 },
    topicGeneration: { monthly: 2, tokens: 3000 },
    advisorChat: { monthly: 60, tokens: 500 },
    emailGeneration: { monthly: 0, tokens: 1000 },
    meetingSummarization: { monthly: 0, tokens: 1024 },
    slidesGeneration: { monthly: 0, tokens: 3000 },
  }
} as const;

// User usage tracking interface
interface UserUsage {
  userId: string;
  tier: 'free';
  usage: {
    titleGeneration: { count: number; resetDate: string };
    topicGeneration: { count: number; resetDate: string };
    advisorChat: { count: number; resetDate: string };
    emailGeneration: { count: number; resetDate: string };
    meetingSummarization: { count: number; resetDate: string };
    slidesGeneration: { count: number; resetDate: string };
  };
  totalTokens: { count: number; resetDate: string };
}

// In-memory storage (replace with database in production)
const userUsageStore = new Map<string, UserUsage>();

// Get user's current tier (always free for now)
export async function getUserTier(userId: string): Promise<'free'> {
  // TODO: Integrate with Clerk/Stripe to get actual subscription status
  // For now, return 'free' - implement this based on your Stripe integration
  return 'free';
}

// Get user usage data
export async function getUserUsage(userId: string): Promise<UserUsage> {
  const tier = await getUserTier(userId);
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  if (!userUsageStore.has(userId)) {
    userUsageStore.set(userId, {
      userId,
      tier,
      usage: {
        titleGeneration: { count: 0, resetDate },
        topicGeneration: { count: 0, resetDate },
        advisorChat: { count: 0, resetDate },
        emailGeneration: { count: 0, resetDate },
        meetingSummarization: { count: 0, resetDate },
        slidesGeneration: { count: 0, resetDate },
      },
      totalTokens: { count: 0, resetDate }
    });
  }

  const usage = userUsageStore.get(userId)!;
  
  // Reset monthly counters if needed
  if (new Date() > new Date(usage.usage.titleGeneration.resetDate)) {
    Object.keys(usage.usage).forEach(key => {
      usage.usage[key as keyof typeof usage.usage] = { count: 0, resetDate };
    });
    usage.totalTokens = { count: 0, resetDate };
  }

  return usage;
}

// Check if user can use a feature
export async function canUseFeature(
  userId: string, 
  feature: keyof typeof TIER_LIMITS.free
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  const usage = await getUserUsage(userId);
  const limits = TIER_LIMITS[usage.tier][feature];
  
  if (usage.usage[feature].count >= limits.monthly) {
    return {
      allowed: false,
      reason: `Monthly limit exceeded for ${feature}.`,
      remaining: 0
    };
  }

  return {
    allowed: true,
    remaining: limits.monthly - usage.usage[feature].count
  };
}

// Record feature usage
export async function recordFeatureUsage(
  userId: string, 
  feature: keyof typeof TIER_LIMITS.free,
  tokensUsed: number
): Promise<void> {
  const usage = await getUserUsage(userId);
  
  usage.usage[feature].count++;
  usage.totalTokens.count += tokensUsed;
  
  userUsageStore.set(userId, usage);
}

// Get user usage summary
export async function getUserUsageSummary(userId: string) {
  const usage = await getUserUsage(userId);
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];

  const summary = {
    tier,
    features: {} as Record<string, { used: number; limit: number; remaining: number }>,
    totalTokens: {
      used: usage.totalTokens.count,
      limit: Object.values(limits).reduce((sum, feature) => sum + (feature.monthly * feature.tokens), 0)
    }
  };

  Object.keys(limits).forEach(feature => {
    const featureKey = feature as keyof typeof limits;
    summary.features[feature] = {
      used: usage.usage[featureKey].count,
      limit: limits[featureKey].monthly,
      remaining: Math.max(0, limits[featureKey].monthly - usage.usage[featureKey].count)
    };
  });

  return summary;
}

// Middleware to check feature access
export function withFeatureCheck(feature: keyof typeof TIER_LIMITS.free) {
  return async (request: any, ...args: any[]) => {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureCheck = await canUseFeature(userId, feature);
    
    if (!featureCheck.allowed) {
      return NextResponse.json({
        error: 'Feature limit exceeded',
        details: featureCheck.reason,
        upgradeUrl: '/upgrade' // Add your upgrade page URL
      }, { status: 429 });
    }

    return handler(request, ...args);
  };
} 