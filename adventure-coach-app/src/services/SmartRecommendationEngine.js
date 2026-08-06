/**
 * Smart Recommendation Engine
 * AI-powered recommendations for coaches, sessions, and activities
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import AICoachMatchingService from './AICoachMatchingService';
import AIChatService from './AIChatService';
import WeatherIntelligenceService from './WeatherIntelligenceService';

class SmartRecommendationEngine {
  constructor() {
    this.userBehaviorData = null;
    this.sessionHistory = [];
    this.preferences = {};
    this.learningModel = {
      coachPreferences: {},
      activityPatterns: {},
      timePreferences: {},
      weatherSensitivity: {}
    };
  }

  /**
   * Initialize the recommendation engine with user data
   */
  async initialize(userId) {
    try {
      this.userId = userId;

      // Load user behavior data
      await this.loadUserBehaviorData();
      await this.loadSessionHistory();
      await this.loadUserPreferences();

      return true;
    } catch (error) {
      console.error('Error initializing recommendation engine:', error);
      return false;
    }
  }

  /**
   * Get comprehensive recommendations for the user
   */
  async getSmartRecommendations(userLocation, currentConditions = null) {
    try {
      // Get weather intelligence if not provided
      if (!currentConditions) {
        currentConditions = await WeatherIntelligenceService.getWeatherIntelligence(
          userLocation,
          this.preferences.preferredActivity || 'surfing'
        );
      }

      // Get AI-powered coach recommendations
      const coachRecommendations = await this.getAICoachRecommendations(
        userLocation,
        currentConditions
      );

      // Get optimal session timing
      const sessionTiming = await this.getOptimalSessionTiming(currentConditions);

      // Get activity recommendations
      const activityRecommendations = await this.getActivityRecommendations(currentConditions);

      // Get equipment suggestions
      const equipmentSuggestions = await this.getEquipmentSuggestions(currentConditions);

      // Get location recommendations
      const locationRecommendations = await this.getLocationRecommendations(
        userLocation,
        currentConditions
      );

      // Get personalized insights
      const personalizedInsights = await this.getPersonalizedInsights(
        currentConditions,
        this.sessionHistory
      );

      return {
        success: true,
        timestamp: new Date().toISOString(),
        userLocation: userLocation,
        conditions: currentConditions,
        recommendations: {
          coaches: coachRecommendations,
          timing: sessionTiming,
          activities: activityRecommendations,
          equipment: equipmentSuggestions,
          locations: locationRecommendations,
          insights: personalizedInsights
        },
        confidence: this.calculateRecommendationConfidence(),
        aiPowered: true
      };
    } catch (error) {
      console.error('Error getting smart recommendations:', error);
      return this.getBasicRecommendations(userLocation);
    }
  }

  /**
   * Get AI-powered coach recommendations
   */
  async getAICoachRecommendations(userLocation, conditions) {
    try {
      // Create user profile for matching
      const userProfile = {
        location: userLocation,
        preferredActivity: this.preferences.preferredActivity || 'surfing',
        experienceLevel: this.preferences.experienceLevel || 'intermediate',
        budget: this.preferences.budget || { min: 50, max: 150 },
        availability: this.preferences.availability || {},
        languages: this.preferences.languages || ['English'],
        goals: this.preferences.goals || ['improve technique']
      };

      // Get coaches from AI matching service
      const matchingResults = await AICoachMatchingService.getCoachRecommendations(
        userProfile,
        [] // Will fetch from API
      );

      // Enhance with weather-specific insights
      const enhancedCoaches = await Promise.all(
        matchingResults.slice(0, 5).map(async coach => {
          const weatherSuitability = this.calculateWeatherSuitability(coach, conditions);
          const aiInsights = await this.getCoachWeatherInsights(coach, conditions);

          return {
            ...coach,
            weatherSuitability: weatherSuitability,
            weatherInsights: aiInsights,
            recommendationScore: coach.matchScore + weatherSuitability.bonus
          };
        })
      );

      return {
        coaches: enhancedCoaches.sort((a, b) => b.recommendationScore - a.recommendationScore),
        explanation: "Coaches ranked by compatibility, experience, and current conditions",
        aiPowered: true
      };
    } catch (error) {
      console.error('Error getting AI coach recommendations:', error);
      return {
        coaches: [],
        explanation: "Unable to load coach recommendations",
        aiPowered: false
      };
    }
  }

  /**
   * Calculate weather suitability for a coach
   */
  calculateWeatherSuitability(coach, conditions) {
    let suitability = 0;
    let bonus = 0;
    let reasoning = [];

    // Check if coach specializes in current conditions
    if (conditions.analysis.overallScore > 80) {
      if (coach.specialties.includes('advanced') || coach.experienceYears > 5) {
        suitability = 90;
        bonus = 10;
        reasoning.push("Excellent conditions match coach's expertise");
      } else {
        suitability = 85;
        reasoning.push("Good conditions suitable for this coach");
      }
    } else if (conditions.analysis.overallScore > 60) {
      suitability = 75;
      reasoning.push("Moderate conditions - good teaching opportunity");
    } else {
      if (coach.specialties.includes('beginner') || coach.specialties.includes('safety')) {
        suitability = 70;
        bonus = 5;
        reasoning.push("Coach experienced with challenging conditions");
      } else {
        suitability = 50;
        reasoning.push("Conditions may not be ideal for this coach's style");
      }
    }

    // Local knowledge bonus
    if (coach.localAreas && coach.localAreas.includes(conditions.location)) {
      bonus += 5;
      reasoning.push("Local area expertise");
    }

    return {
      score: suitability,
      bonus: bonus,
      reasoning: reasoning
    };
  }

  /**
   * Get coach-specific weather insights
   */
  async getCoachWeatherInsights(coach, conditions) {
    try {
      const prompt = `Coach ${coach.name} specializes in ${coach.specialties.join(', ')} with ${coach.experienceYears} years experience.

Current conditions: ${conditions.analysis.rating} (${conditions.analysis.overallScore}/100)
Weather: ${conditions.current.conditions}
Wind: ${conditions.current.windSpeed}mph
Waves: ${conditions.waves.height}ft

What specific advice would this coach likely give for today's session?`;

      const response = await AIChatService.chatWithAI(prompt);

      return {
        advice: response.success ? response.response : "Standard coaching advice for current conditions",
        aiPowered: response.aiPowered || false
      };
    } catch (error) {
      console.error('Error getting coach weather insights:', error);
      return {
        advice: "Coach will provide guidance based on current conditions",
        aiPowered: false
      };
    }
  }

  /**
   * Get optimal session timing recommendations
   */
  async getOptimalSessionTiming(conditions) {
    try {
      const forecast = conditions.forecast || [];
      const currentScore = conditions.analysis.overallScore;

      // Analyze forecast for best timing
      const timingAnalysis = forecast.map((hour, index) => {
        const score = this.scoreHourlyConditions(hour, conditions.activity);
        return {
          time: hour.time,
          score: score,
          conditions: hour.conditions,
          windSpeed: hour.windSpeed,
          recommendation: this.getHourlyRecommendation(score)
        };
      });

      // Find best times
      const sortedTimes = timingAnalysis
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // Get AI insights for timing
      const timingInsights = await this.getAITimingInsights(timingAnalysis, conditions);

      return {
        now: {
          score: currentScore,
          recommendation: conditions.analysis.recommendation,
          suitable: currentScore > 60
        },
        upcoming: sortedTimes,
        insights: timingInsights,
        bestTime: sortedTimes[0],
        aiPowered: true
      };
    } catch (error) {
      console.error('Error getting session timing:', error);
      return {
        now: { score: 70, recommendation: "Current conditions analyzed", suitable: true },
        upcoming: [],
        insights: { advice: "Session timing analysis unavailable", aiPowered: false },
        bestTime: null,
        aiPowered: false
      };
    }
  }

  /**
   * Score hourly conditions
   */
  scoreHourlyConditions(hourData, activity) {
    let score = 70; // Base score

    // Wind scoring
    if (activity === 'surfing') {
      if (hourData.windSpeed < 15) score += 20;
      else if (hourData.windSpeed < 25) score += 10;
      else score -= 10;
    } else if (activity === 'kitesurfing') {
      if (hourData.windSpeed >= 12 && hourData.windSpeed <= 25) score += 20;
      else score -= 15;
    }

    // Weather conditions scoring
    if (hourData.conditions === 'Clear') score += 15;
    else if (hourData.conditions === 'Partly Cloudy') score += 10;
    else if (hourData.conditions === 'Rain') score -= 30;

    // Precipitation scoring
    if (hourData.precipitation > 5) score -= 25;
    else if (hourData.precipitation > 2) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get AI timing insights
   */
  async getAITimingInsights(timingAnalysis, conditions) {
    try {
      const bestHours = timingAnalysis
        .filter(t => t.score > 70)
        .map(t => `${t.time.getHours()}:00 (${t.score}/100)`)
        .join(', ');

      const prompt = `Analyze the best session timing for ${conditions.activity}:

Best hours: ${bestHours || 'None ideal'}
Current conditions: ${conditions.analysis.overallScore}/100

Provide specific timing advice considering:
1. Optimal wind/wave patterns
2. Tide influences
3. Weather progression
4. Safety considerations`;

      const response = await AIChatService.chatWithAI(prompt);

      return {
        advice: response.success ? response.response : "Choose timing based on wind and weather patterns",
        aiPowered: response.aiPowered || false
      };
    } catch (error) {
      console.error('Error getting AI timing insights:', error);
      return {
        advice: "Plan your session during the most favorable conditions",
        aiPowered: false
      };
    }
  }

  /**
   * Get activity recommendations based on conditions
   */
  async getActivityRecommendations(conditions) {
    const activities = ['surfing', 'kitesurfing', 'sup', 'windsurfing'];
    const recommendations = [];

    for (const activity of activities) {
      const suitability = this.calculateActivitySuitability(activity, conditions);
      recommendations.push({
        activity: activity,
        suitability: suitability,
        score: suitability.score,
        explanation: suitability.explanation
      });
    }

    // Sort by suitability score
    recommendations.sort((a, b) => b.score - a.score);

    // Get AI insights for activity selection
    const aiInsights = await this.getActivitySelectionInsights(recommendations, conditions);

    return {
      activities: recommendations,
      recommended: recommendations[0],
      insights: aiInsights,
      aiPowered: true
    };
  }

  /**
   * Calculate activity suitability for conditions
   */
  calculateActivitySuitability(activity, conditions) {
    const requirements = WeatherIntelligenceService.activityWeatherRequirements[activity];
    if (!requirements) {
      return { score: 50, explanation: "Activity requirements not defined" };
    }

    let score = 0;
    let explanation = [];

    // Wind analysis
    const windSpeed = conditions.current.windSpeed || 0;
    if (windSpeed >= requirements.idealWind.min && windSpeed <= requirements.idealWind.max) {
      score += 40;
      explanation.push("Perfect wind conditions");
    } else if (windSpeed < requirements.idealWind.min) {
      score += Math.max(0, 30 - (requirements.idealWind.min - windSpeed) * 2);
      explanation.push("Light wind conditions");
    } else {
      score += Math.max(0, 30 - (windSpeed - requirements.idealWind.max) * 1.5);
      explanation.push("Strong wind conditions");
    }

    // Wave analysis
    const waveHeight = conditions.waves.height || 0;
    if (waveHeight >= requirements.idealWaves.min && waveHeight <= requirements.idealWaves.max) {
      score += 30;
      explanation.push("Ideal wave size");
    } else {
      score += Math.max(0, 20 - Math.abs(waveHeight - (requirements.idealWaves.max + requirements.idealWaves.min) / 2) * 5);
      explanation.push("Moderate wave conditions");
    }

    // Weather conditions
    if (conditions.current.conditions === 'Clear') {
      score += 20;
      explanation.push("Clear weather");
    } else if (conditions.current.conditions === 'Partly Cloudy') {
      score += 15;
      explanation.push("Partly cloudy");
    } else {
      score += 10;
      explanation.push("Overcast conditions");
    }

    // Safety considerations
    if (conditions.alerts.length > 0) {
      score -= 20;
      explanation.push("Safety concerns present");
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      explanation: explanation.join(', '),
      rating: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor'
    };
  }

  /**
   * Get equipment suggestions based on conditions
   */
  async getEquipmentSuggestions(conditions) {
    try {
      const userProfile = {
        experienceLevel: this.preferences.experienceLevel || 'intermediate',
        preferredActivity: this.preferences.preferredActivity || 'surfing',
        budget: this.preferences.budget
      };

      const equipmentRecommendations = await AIChatService.getEquipmentRecommendations(
        userProfile.preferredActivity,
        userProfile,
        conditions
      );

      return {
        recommendations: equipmentRecommendations.recommendations,
        equipment: equipmentRecommendations.equipment || [],
        aiPowered: equipmentRecommendations.aiPowered
      };
    } catch (error) {
      console.error('Error getting equipment suggestions:', error);
      return {
        recommendations: "Standard equipment for current conditions",
        equipment: ["Board", "Wetsuit", "Safety gear"],
        aiPowered: false
      };
    }
  }

  /**
   * Get location recommendations
   */
  async getLocationRecommendations(userLocation, conditions) {
    // This would integrate with a spots database in production
    const nearbySpots = this.getNearbySpots(userLocation);

    const recommendations = nearbySpots.map(spot => ({
      ...spot,
      suitability: this.calculateSpotSuitability(spot, conditions),
      distance: this.calculateDistance(userLocation, spot.location)
    }));

    recommendations.sort((a, b) => b.suitability.score - a.suitability.score);

    return {
      spots: recommendations.slice(0, 5),
      aiPowered: false
    };
  }

  /**
   * Get personalized insights based on user history
   */
  async getPersonalizedInsights(conditions, sessionHistory) {
    try {
      const recentSessions = sessionHistory.slice(-10);
      const userStats = this.calculateUserStats(recentSessions);

      const progressionAnalysis = await AIChatService.analyzeProgression(
        userStats,
        recentSessions
      );

      return {
        progression: progressionAnalysis.analysis,
        nextSteps: progressionAnalysis.nextSteps || [],
        personalizedAdvice: this.generatePersonalizedAdvice(userStats, conditions),
        aiPowered: progressionAnalysis.aiPowered
      };
    } catch (error) {
      console.error('Error getting personalized insights:', error);
      return {
        progression: "Continue regular practice for improvement",
        nextSteps: ["Book regular sessions", "Focus on fundamentals"],
        personalizedAdvice: "Based on your activity, focus on consistent practice",
        aiPowered: false
      };
    }
  }

  // Helper methods
  async getActivitySelectionInsights(recommendations, conditions) {
    try {
      const topActivities = recommendations.slice(0, 3).map(r => `${r.activity} (${r.score}/100)`).join(', ');

      const prompt = `Best activities for current conditions: ${topActivities}

Weather: ${conditions.current.conditions}
Wind: ${conditions.current.windSpeed}mph
Waves: ${conditions.waves.height}ft

Which activity would you recommend and why?`;

      const response = await AIChatService.chatWithAI(prompt);

      return {
        advice: response.success ? response.response : "Choose activity based on current conditions and skill level",
        aiPowered: response.aiPowered || false
      };
    } catch (error) {
      return {
        advice: "Select the activity that best matches current conditions",
        aiPowered: false
      };
    }
  }

  getHourlyRecommendation(score) {
    if (score > 80) return 'Excellent';
    if (score > 60) return 'Good';
    if (score > 40) return 'Fair';
    return 'Poor';
  }

  calculateRecommendationConfidence() {
    const hasHistory = this.sessionHistory.length > 5;
    const hasPreferences = Object.keys(this.preferences).length > 3;
    const hasWeatherData = true; // We always have weather data

    let confidence = 0.5; // Base confidence

    if (hasHistory) confidence += 0.2;
    if (hasPreferences) confidence += 0.2;
    if (hasWeatherData) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  calculateUserStats(sessions) {
    return {
      totalSessions: sessions.length,
      averageRating: sessions.reduce((sum, s) => sum + (s.rating || 3), 0) / sessions.length,
      preferredConditions: 'varied',
      skillProgression: 'improving'
    };
  }

  generatePersonalizedAdvice(userStats, conditions) {
    const advice = [];

    if (userStats.totalSessions < 5) {
      advice.push("Focus on building consistent practice habits");
    } else if (userStats.averageRating > 4) {
      advice.push("You're progressing well - consider challenging yourself");
    }

    if (conditions.analysis.overallScore > 80) {
      advice.push("Perfect conditions to push your limits safely");
    }

    return advice.join('. ');
  }

  getNearbySpots(location) {
    // Mock data - would fetch from spots database
    return [
      { name: "Main Beach", location: location, exposure: "S", difficulty: "beginner" },
      { name: "North Point", location: location, exposure: "N", difficulty: "intermediate" },
      { name: "The Reef", location: location, exposure: "E", difficulty: "advanced" }
    ];
  }

  calculateSpotSuitability(spot, conditions) {
    let score = 70;

    // Simple suitability calculation
    if (spot.difficulty === 'beginner' && conditions.analysis.overallScore > 60) {
      score += 20;
    } else if (spot.difficulty === 'advanced' && conditions.analysis.overallScore > 80) {
      score += 25;
    }

    return { score: score, explanation: `Suitable for ${spot.difficulty} level` };
  }

  calculateDistance(location1, location2) {
    // Simple distance calculation - would use proper geolocation
    return Math.random() * 10; // Mock distance in km
  }

  getBasicRecommendations(userLocation) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      userLocation: userLocation,
      recommendations: {
        coaches: { coaches: [], explanation: "Basic coach list", aiPowered: false },
        timing: { now: { suitable: true }, upcoming: [], aiPowered: false },
        activities: { activities: [], recommended: null, aiPowered: false },
        equipment: { recommendations: "Basic equipment", equipment: [], aiPowered: false },
        locations: { spots: [], aiPowered: false },
        insights: { progression: "Keep practicing", nextSteps: [], aiPowered: false }
      },
      confidence: 0.3,
      aiPowered: false,
      note: "Basic recommendations - full AI features unavailable"
    };
  }

  // Data persistence methods
  async loadUserBehaviorData() {
    try {
      const data = await AsyncStorage.getItem(`behavior_${this.userId}`);
      this.userBehaviorData = data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading user behavior data:', error);
    }
  }

  async loadSessionHistory() {
    try {
      const data = await AsyncStorage.getItem(`sessions_${this.userId}`);
      this.sessionHistory = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  }

  async loadUserPreferences() {
    try {
      const data = await AsyncStorage.getItem(`preferences_${this.userId}`);
      this.preferences = data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  async saveUserBehaviorData() {
    try {
      await AsyncStorage.setItem(`behavior_${this.userId}`, JSON.stringify(this.userBehaviorData));
    } catch (error) {
      console.error('Error saving user behavior data:', error);
    }
  }

  async updateUserPreferences(newPreferences) {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      await AsyncStorage.setItem(`preferences_${this.userId}`, JSON.stringify(this.preferences));
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }
}

// Create singleton instance
const SmartRecommendationEngineInstance = new SmartRecommendationEngine();

export default SmartRecommendationEngineInstance;
