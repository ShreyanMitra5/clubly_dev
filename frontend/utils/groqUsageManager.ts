import { NextRequest, NextResponse } from 'next/server';

// Groq Free Tier Limits for llama-3.3-70b-versatile
export const GROQ_LIMITS = {
  RPM: 1000,        // Requests per minute
  RPD: 500000,      // Requests per day
  TPM: 300000,      // Tokens per minute
  TPD: 1000000000,  // Tokens per day (1B - conservative estimate)
} as const;

// Usage tracking interface
interface UsageData {
  requests: {
    minute: { count: number; timestamp: number };
    day: { count: number; timestamp: number };
  };
  tokens: {
    minute: { count: number; timestamp: number };
    day: { count: number; timestamp: number };
  };
}

// In-memory usage tracking (for production, use Redis or database)
let usageData: UsageData = {
  requests: {
    minute: { count: 0, timestamp: Date.now() },
    day: { count: 0, timestamp: Date.now() },
  },
  tokens: {
    minute: { count: 0, timestamp: Date.now() },
    day: { count: 0, timestamp: Date.now() },
  },
};

// Reset counters if time period has passed
function resetCountersIfNeeded() {
  const now = Date.now();
  const minuteMs = 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;

  // Reset minute counters
  if (now - usageData.requests.minute.timestamp > minuteMs) {
    usageData.requests.minute = { count: 0, timestamp: now };
    usageData.tokens.minute = { count: 0, timestamp: now };
  }

  // Reset day counters
  if (now - usageData.requests.day.timestamp > dayMs) {
    usageData.requests.day = { count: 0, timestamp: now };
    usageData.tokens.day = { count: 0, timestamp: now };
  }
}

// Check if usage is within limits
export function checkUsageLimits(estimatedTokens: number = 0): {
  allowed: boolean;
  reason?: string;
  currentUsage: {
    requests: { minute: number; day: number };
    tokens: { minute: number; day: number };
  };
} {
  resetCountersIfNeeded();

  const currentUsage = {
    requests: {
      minute: usageData.requests.minute.count,
      day: usageData.requests.day.count,
    },
    tokens: {
      minute: usageData.tokens.minute.count,
      day: usageData.tokens.day.count,
    },
  };

  // Check request limits
  if (currentUsage.requests.minute >= GROQ_LIMITS.RPM) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${currentUsage.requests.minute}/${GROQ_LIMITS.RPM} requests per minute`,
      currentUsage,
    };
  }

  if (currentUsage.requests.day >= GROQ_LIMITS.RPD) {
    return {
      allowed: false,
      reason: `Daily limit exceeded: ${currentUsage.requests.day}/${GROQ_LIMITS.RPD} requests per day`,
      currentUsage,
    };
  }

  // Check token limits
  if (currentUsage.tokens.minute + estimatedTokens > GROQ_LIMITS.TPM) {
    return {
      allowed: false,
      reason: `Token limit exceeded: ${currentUsage.tokens.minute + estimatedTokens}/${GROQ_LIMITS.TPM} tokens per minute`,
      currentUsage,
    };
  }

  if (currentUsage.tokens.day + estimatedTokens > GROQ_LIMITS.TPD) {
    return {
      allowed: false,
      reason: `Daily token limit exceeded: ${currentUsage.tokens.day + estimatedTokens}/${GROQ_LIMITS.TPD} tokens per day`,
      currentUsage,
    };
  }

  return { allowed: true, currentUsage };
}

// Record usage after successful API call
export function recordUsage(actualTokens: number) {
  resetCountersIfNeeded();

  usageData.requests.minute.count++;
  usageData.requests.day.count++;
  usageData.tokens.minute.count += actualTokens;
  usageData.tokens.day.count += actualTokens;
}

// Get current usage statistics
export function getUsageStats() {
  resetCountersIfNeeded();
  
  return {
    limits: GROQ_LIMITS,
    current: {
      requests: {
        minute: usageData.requests.minute.count,
        day: usageData.requests.day.count,
      },
      tokens: {
        minute: usageData.tokens.minute.count,
        day: usageData.tokens.day.count,
      },
    },
    remaining: {
      requests: {
        minute: Math.max(0, GROQ_LIMITS.RPM - usageData.requests.minute.count),
        day: Math.max(0, GROQ_LIMITS.RPD - usageData.requests.day.count),
      },
      tokens: {
        minute: Math.max(0, GROQ_LIMITS.TPM - usageData.tokens.minute.count),
        day: Math.max(0, GROQ_LIMITS.TPD - usageData.tokens.day.count),
      },
    },
  };
}

// Middleware to check usage before API calls
export function withUsageCheck(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const estimatedTokens = getEstimatedTokens(request);
    const usageCheck = checkUsageLimits(estimatedTokens);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: usageCheck.reason,
          usage: usageCheck.currentUsage,
        },
        { status: 429 }
      );
    }

    return handler(request, ...args);
  };
}

// Estimate tokens based on request type
function getEstimatedTokens(request: NextRequest): number {
  const url = request.url;
  
  if (url.includes('/generate-title')) {
    return 50; // Small prompt + 32 max tokens
  } else if (url.includes('/generate-content')) {
    return 1000; // Email generation
  } else if (url.includes('/generate-topics')) {
    return 3000; // Topic generation
  } else if (url.includes('/summarize')) {
    return 1024; // Meeting summarization
  } else if (url.includes('/advisor')) {
    return 500; // Advisor chat
  }
  
  return 1000; // Default estimate
}

// Reset usage data (for testing)
export function resetUsageData() {
  usageData = {
    requests: {
      minute: { count: 0, timestamp: Date.now() },
      day: { count: 0, timestamp: Date.now() },
    },
    tokens: {
      minute: { count: 0, timestamp: Date.now() },
      day: { count: 0, timestamp: Date.now() },
    },
  };
} 