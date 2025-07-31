import Groq from 'groq-sdk';

// Initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is missing');
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
};

// Enhanced Groq client with usage tracking
export class GroqClient {
  private client: Groq;

  constructor() {
    this.client = getGroqClient();
  }

  async createChatCompletion(params: {
    messages: any[];
    model: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
  }) {
    try {
      const completion = await this.client.chat.completions.create(params);
      return completion;
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }



  // Convenience method for common completion patterns
  async generateText(prompt: string, options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}) {
    const messages = [];
    
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const completion = await this.createChatCompletion({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: false
    });

    return completion.choices[0]?.message?.content || '';
  }
}

// Export singleton instance
export const groqClient = new GroqClient();

// Legacy function for backward compatibility
export const getGroqClientLegacy = () => {
  return getGroqClient();
}; 