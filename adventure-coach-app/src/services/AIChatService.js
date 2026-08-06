/**
 * AI Chat Service
 * Provides OpenAI-powered conversational AI for adventure coaching
 */

import OpenAI from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AIChatService {
  constructor() {
    this.openai = null;
    this.isInitialized = false;
    this.conversationHistory = [];
    this.userProfile = null;

    // Initialize with environment variable or fallback
    this.apiKey = process.env.OPENAI_API_KEY || 'your-openai-api-key';

    this.systemPrompt = `You are an expert adventure sports coach AI assistant for FlowCrew, specializing in surfing, kitesurfing, SUP, and water sports. Your role is to:

1. Provide personalized coaching recommendations based on user skill level, preferences, and conditions
2. Analyze weather and water conditions for optimal session planning
3. Suggest appropriate coaches based on user needs
4. Offer safety advice and equipment recommendations
5. Help users improve their technique and progress their skills

Always respond in a friendly, encouraging, and professional manner. Consider factors like:
- Current weather and water conditions
- User's experience level and goals
- Safety considerations
- Equipment needs
- Local spot knowledge
- Progression pathways

Keep responses concise but informative, and always prioritize safety.`;
  }

  /**
   * Initialize the OpenAI client
   */
  async initialize() {
    try {
      if (!this.apiKey || this.apiKey === 'your-openai-api-key') {
        console.warn('OpenAI API key not set. AI features will be simulated.');
        this.isInitialized = false;
        return false;
      }

      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });

      // Test the connection
      const test = await this.openai.models.list();
      console.log('OpenAI connection successful');

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Set user profile for personalized responses
   */
  setUserProfile(profile) {
    this.userProfile = profile;
    this.conversationHistory = [{
      role: 'system',
      content: `${this.systemPrompt}\n\nUser Profile: ${JSON.stringify(profile)}`
    }];
  }

  /**
   * Get AI-powered coach recommendations
   */
  async getCoachRecommendations(userQuery, availableCoaches = []) {
    try {
      if (!this.isInitialized) {
        return this.simulateCoachRecommendations(userQuery, availableCoaches);
      }

      const prompt = `Based on the user's request: "${userQuery}"

Available coaches: ${JSON.stringify(availableCoaches.slice(0, 5))}

Please recommend the best coaches and explain why they're suitable. Consider:
- User's skill level and goals
- Current conditions
- Coach specialties and experience
- Location and availability

Provide specific, actionable recommendations.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        success: true,
        recommendation: response.choices[0].message.content,
        suggestedCoaches: availableCoaches.slice(0, 3),
        aiPowered: true
      };
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return this.simulateCoachRecommendations(userQuery, availableCoaches);
    }
  }

  /**
   * Get AI-powered session planning advice
   */
  async getSessionAdvice(conditions, userProfile) {
    try {
      if (!this.isInitialized) {
        return this.simulateSessionAdvice(conditions, userProfile);
      }

      const prompt = `Current conditions:
- Weather: ${conditions.weather}
- Wind: ${conditions.wind}
- Water: ${conditions.water}
- Waves: ${conditions.waves}

User profile:
- Experience: ${userProfile.experienceLevel}
- Preferred activity: ${userProfile.activity}
- Goals: ${userProfile.goals}

Should they book a session today? What should they focus on? Any safety considerations?`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.6,
      });

      return {
        success: true,
        advice: response.choices[0].message.content,
        recommendation: this.analyzeConditionsRecommendation(conditions),
        aiPowered: true
      };
    } catch (error) {
      console.error('Error getting session advice:', error);
      return this.simulateSessionAdvice(conditions, userProfile);
    }
  }

  /**
   * Chat with AI coach assistant
   */
  async chatWithAI(message) {
    try {
      if (!this.isInitialized) {
        return this.simulateAIChat(message);
      }

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0].message.content;

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Keep conversation history manageable
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-19) // Keep last 19 messages
        ];
      }

      return {
        success: true,
        response: aiResponse,
        aiPowered: true
      };
    } catch (error) {
      console.error('Error in AI chat:', error);
      return this.simulateAIChat(message);
    }
  }

  /**
   * Get equipment recommendations
   */
  async getEquipmentRecommendations(activity, userProfile, conditions) {
    try {
      if (!this.isInitialized) {
        return this.simulateEquipmentRecommendations(activity, userProfile, conditions);
      }

      const prompt = `Recommend equipment for:
Activity: ${activity}
User level: ${userProfile.experienceLevel}
Conditions: ${JSON.stringify(conditions)}
Budget: ${userProfile.budget || 'Not specified'}

What equipment would be best for today's session?`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.6,
      });

      return {
        success: true,
        recommendations: response.choices[0].message.content,
        equipment: this.parseEquipmentFromResponse(response.choices[0].message.content),
        aiPowered: true
      };
    } catch (error) {
      console.error('Error getting equipment recommendations:', error);
      return this.simulateEquipmentRecommendations(activity, userProfile, conditions);
    }
  }

  /**
   * Analyze progression and suggest next steps
   */
  async analyzeProgression(userStats, recentSessions) {
    try {
      const prompt = `Analyze user progression:
Stats: ${JSON.stringify(userStats)}
Recent sessions: ${JSON.stringify(recentSessions)}

What areas should they focus on next? What goals should they set?`;

      if (!this.isInitialized) {
        return this.simulateProgressionAnalysis(userStats, recentSessions);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.6,
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
        nextSteps: this.parseNextStepsFromResponse(response.choices[0].message.content),
        aiPowered: true
      };
    } catch (error) {
      console.error('Error analyzing progression:', error);
      return this.simulateProgressionAnalysis(userStats, recentSessions);
    }
  }

  // Simulation methods for when OpenAI is not available
  simulateCoachRecommendations(userQuery, availableCoaches) {
    const recommendations = [
      "Based on your request, I'd recommend starting with our experienced beginner-friendly coaches.",
      "For your skill level, consider coaches who specialize in technique refinement and safety.",
      "Given current conditions, these coaches have excellent local knowledge for today's session."
    ];

    return {
      success: true,
      recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
      suggestedCoaches: availableCoaches.slice(0, 3),
      aiPowered: false,
      note: "Simulated response - OpenAI integration pending"
    };
  }

  simulateSessionAdvice(conditions, userProfile) {
    const advice = [
      "Perfect conditions for a session! Focus on technique and have fun.",
      "Conditions are moderate - great for skill building with proper guidance.",
      "Challenging conditions today - consider waiting for calmer weather if you're a beginner."
    ];

    return {
      success: true,
      advice: advice[Math.floor(Math.random() * advice.length)],
      recommendation: 'suitable',
      aiPowered: false,
      note: "Simulated response - OpenAI integration pending"
    };
  }

  simulateAIChat(message) {
    const responses = [
      "That's a great question! I'd be happy to help you with your adventure sports journey.",
      "Based on your message, I recommend focusing on safety and gradual progression.",
      "I can help you find the perfect coach and conditions for your next session!",
      "Remember, consistent practice and good instruction are key to improvement.",
      "Safety first! Make sure you're prepared for current conditions."
    ];

    return {
      success: true,
      response: responses[Math.floor(Math.random() * responses.length)],
      aiPowered: false,
      note: "Simulated response - OpenAI integration pending"
    };
  }

  simulateEquipmentRecommendations(activity, userProfile, conditions) {
    const equipment = {
      surfing: ["9ft longboard (beginner)", "Wetsuit (appropriate thickness)", "Leash", "Wax"],
      kitesurfing: ["12m kite (moderate wind)", "Twin-tip board", "Harness", "Helmet"],
      sup: ["10'6\" all-around board", "Adjustable paddle", "Leash", "PFD"]
    };

    return {
      success: true,
      recommendations: `For ${activity}, I recommend starting with versatile, forgiving equipment.`,
      equipment: equipment[activity] || ["Basic safety gear", "Appropriate board/equipment"],
      aiPowered: false,
      note: "Simulated response - OpenAI integration pending"
    };
  }

  simulateProgressionAnalysis(userStats, recentSessions) {
    return {
      success: true,
      analysis: "You're making great progress! Focus on consistency and technique refinement.",
      nextSteps: [
        "Practice basic maneuvers in calmer conditions",
        "Work on balance and stance",
        "Book regular sessions with a qualified instructor"
      ],
      aiPowered: false,
      note: "Simulated response - OpenAI integration pending"
    };
  }

  // Helper methods
  analyzeConditionsRecommendation(conditions) {
    // Simple logic for condition analysis
    if (conditions.wind && conditions.wind.speed > 25) return 'challenging';
    if (conditions.waves && conditions.waves.height > 8) return 'advanced';
    return 'suitable';
  }

  parseEquipmentFromResponse(response) {
    // Simple parsing logic - in production, use more sophisticated NLP
    const equipment = [];
    if (response.includes('board')) equipment.push('Board');
    if (response.includes('wetsuit')) equipment.push('Wetsuit');
    if (response.includes('leash')) equipment.push('Leash');
    if (response.includes('helmet')) equipment.push('Helmet');
    return equipment;
  }

  parseNextStepsFromResponse(response) {
    // Simple parsing logic
    return [
      "Continue regular practice",
      "Focus on technique improvement",
      "Set progressive goals"
    ];
  }

  /**
   * Clear conversation history
   */
  clearConversation() {
    this.conversationHistory = [{
      role: 'system',
      content: `${this.systemPrompt}${this.userProfile ? `\n\nUser Profile: ${JSON.stringify(this.userProfile)}` : ''}`
    }];
  }

  /**
   * Save conversation to storage
   */
  async saveConversation() {
    try {
      await AsyncStorage.setItem('ai_conversation_history', JSON.stringify(this.conversationHistory));
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return false;
    }
  }

  /**
   * Load conversation from storage
   */
  async loadConversation() {
    try {
      const stored = await AsyncStorage.getItem('ai_conversation_history');
      if (stored) {
        this.conversationHistory = JSON.parse(stored);
        return true;
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
    return false;
  }
}

// Create singleton instance
const AIChatServiceInstance = new AIChatService();

export default AIChatServiceInstance;
