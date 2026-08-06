/**
 * Enhanced Weather Intelligence Service
 * AI-powered weather analysis for adventure sports
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIChatService from './AIChatService';

class WeatherIntelligenceService {
  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY || 'your-openweather-api-key';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes

    this.activityWeatherRequirements = {
      surfing: {
        idealWind: { min: 0, max: 15, direction: 'offshore' },
        idealWaves: { min: 2, max: 8 },
        visibility: { min: 5 }
      },
      kitesurfing: {
        idealWind: { min: 12, max: 30 },
        idealWaves: { min: 0, max: 4 },
        visibility: { min: 3 }
      },
      sup: {
        idealWind: { min: 0, max: 10 },
        idealWaves: { min: 0, max: 3 },
        visibility: { min: 5 }
      },
      windsurfing: {
        idealWind: { min: 8, max: 25 },
        idealWaves: { min: 0, max: 6 },
        visibility: { min: 3 }
      }
    };
  }

  /**
   * Get comprehensive weather analysis for adventure sports
   */
  async getWeatherIntelligence(location, activity = 'surfing') {
    try {
      const cacheKey = `weather_${location.lat}_${location.lon}_${activity}`;

      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Get current weather data
      const currentWeather = await this.getCurrentWeather(location);
      const forecast = await this.getWeatherForecast(location);
      const waveData = await this.getWaveData(location);
      const tideData = await this.getTideData(location);

      // Analyze conditions for the specific activity
      const activityAnalysis = this.analyzeConditionsForActivity(
        currentWeather,
        waveData,
        tideData,
        activity
      );

      // Get AI-powered insights
      const aiInsights = await this.getAIWeatherInsights({
        current: currentWeather,
        waves: waveData,
        tides: tideData,
        activity: activity
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations(activityAnalysis, forecast);

      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        location: location,
        activity: activity,
        current: currentWeather,
        forecast: forecast,
        waves: waveData,
        tides: tideData,
        analysis: activityAnalysis,
        aiInsights: aiInsights,
        recommendations: recommendations,
        alerts: this.generateWeatherAlerts(currentWeather, waveData)
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error getting weather intelligence:', error);
      return this.getSimulatedWeatherIntelligence(location, activity);
    }
  }

  /**
   * Get current weather conditions
   */
  async getCurrentWeather(location) {
    if (!this.openWeatherApiKey || this.openWeatherApiKey === 'your-openweather-api-key') {
      return this.getSimulatedCurrentWeather();
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: location.lat,
            lon: location.lon,
            appid: this.openWeatherApiKey,
            units: 'metric'
          }
        }
      );

      const data = response.data;
      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert to km/h
        windDirection: data.wind.deg,
        windGust: data.wind.gust ? Math.round(data.wind.gust * 3.6) : null,
        visibility: data.visibility ? data.visibility / 1000 : null, // Convert to km
        cloudCover: data.clouds.all,
        uvIndex: null, // Need separate API call
        conditions: data.weather[0].main,
        description: data.weather[0].description,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getSimulatedCurrentWeather();
    }
  }

  /**
   * Get weather forecast
   */
  async getWeatherForecast(location) {
    if (!this.openWeatherApiKey || this.openWeatherApiKey === 'your-openweather-api-key') {
      return this.getSimulatedForecast();
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat: location.lat,
            lon: location.lon,
            appid: this.openWeatherApiKey,
            units: 'metric'
          }
        }
      );

      return response.data.list.slice(0, 8).map(item => ({
        time: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        windSpeed: Math.round(item.wind.speed * 3.6),
        windDirection: item.wind.deg,
        conditions: item.weather[0].main,
        description: item.weather[0].description,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0
      }));
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      return this.getSimulatedForecast();
    }
  }

  /**
   * Get wave data (simulated - would integrate with surf APIs)
   */
  async getWaveData(location) {
    // In production, integrate with APIs like:
    // - Stormglass.io
    // - WorldWeatherOnline Marine
    // - Magic Seaweed API

    return this.getSimulatedWaveData();
  }

  /**
   * Get tide data (simulated - would integrate with tide APIs)
   */
  async getTideData(location) {
    // In production, integrate with APIs like:
    // - NOAA Tides API
    // - WorldTides API

    return this.getSimulatedTideData();
  }

  /**
   * Analyze conditions for specific activity
   */
  analyzeConditionsForActivity(weather, waves, tides, activity) {
    const requirements = this.activityWeatherRequirements[activity] || this.activityWeatherRequirements.surfing;

    let score = 0;
    const factors = {};

    // Wind analysis
    const windScore = this.analyzeWind(weather, requirements.idealWind);
    factors.wind = windScore;
    score += windScore.score * 0.3;

    // Wave analysis
    const waveScore = this.analyzeWaves(waves, requirements.idealWaves);
    factors.waves = waveScore;
    score += waveScore.score * 0.3;

    // Weather conditions
    const conditionsScore = this.analyzeGeneralConditions(weather);
    factors.conditions = conditionsScore;
    score += conditionsScore.score * 0.2;

    // Tide analysis
    const tideScore = this.analyzeTides(tides, activity);
    factors.tides = tideScore;
    score += tideScore.score * 0.2;

    return {
      overallScore: Math.round(score),
      rating: this.getConditionRating(score),
      factors: factors,
      recommendation: this.getActivityRecommendation(score, activity)
    };
  }

  /**
   * Analyze wind conditions
   */
  analyzeWind(weather, idealWind) {
    const windSpeed = weather.windSpeed || 0;
    const windDirection = weather.windDirection || 0;

    let score = 0;
    let analysis = '';

    // Speed analysis
    if (windSpeed >= idealWind.min && windSpeed <= idealWind.max) {
      score += 70;
      analysis = 'Wind speed is ideal';
    } else if (windSpeed < idealWind.min) {
      score += Math.max(0, 50 - (idealWind.min - windSpeed) * 5);
      analysis = 'Wind is light';
    } else {
      score += Math.max(0, 50 - (windSpeed - idealWind.max) * 3);
      analysis = 'Wind is strong';
    }

    // Direction analysis (simplified)
    if (idealWind.direction === 'offshore' && windDirection >= 270 && windDirection <= 90) {
      score += 30;
      analysis += ' with good direction';
    } else if (idealWind.direction === 'onshore' && windDirection >= 90 && windDirection <= 270) {
      score += 30;
      analysis += ' with good direction';
    } else {
      score += 15;
      analysis += ' with moderate direction';
    }

    return {
      score: Math.min(100, score),
      analysis: analysis,
      speed: windSpeed,
      direction: this.getWindDirectionText(windDirection),
      suitability: score > 70 ? 'excellent' : score > 50 ? 'good' : score > 30 ? 'fair' : 'poor'
    };
  }

  /**
   * Analyze wave conditions
   */
  analyzeWaves(waves, idealWaves) {
    const waveHeight = waves.height || 0;
    let score = 0;
    let analysis = '';

    if (waveHeight >= idealWaves.min && waveHeight <= idealWaves.max) {
      score = 100;
      analysis = 'Wave height is perfect';
    } else if (waveHeight < idealWaves.min) {
      score = Math.max(0, 60 - (idealWaves.min - waveHeight) * 20);
      analysis = 'Waves are small';
    } else {
      score = Math.max(0, 60 - (waveHeight - idealWaves.max) * 15);
      analysis = 'Waves are large';
    }

    // Period analysis
    if (waves.period >= 8) {
      score += Math.min(20, waves.period - 8);
      analysis += ' with good period';
    }

    return {
      score: Math.min(100, score),
      analysis: analysis,
      height: waveHeight,
      period: waves.period || 0,
      suitability: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor'
    };
  }

  /**
   * Analyze general weather conditions
   */
  analyzeGeneralConditions(weather) {
    let score = 80; // Base score
    let analysis = 'Generally good conditions';

    // Temperature consideration
    if (weather.temperature < 10) {
      score -= 20;
      analysis = 'Cold conditions';
    } else if (weather.temperature > 35) {
      score -= 10;
      analysis = 'Hot conditions';
    }

    // Precipitation
    if (weather.conditions === 'Rain') {
      score -= 30;
      analysis = 'Rainy conditions';
    } else if (weather.conditions === 'Thunderstorm') {
      score -= 50;
      analysis = 'Dangerous conditions - thunderstorm';
    }

    // Visibility
    if (weather.visibility && weather.visibility < 3) {
      score -= 25;
      analysis += ' with low visibility';
    }

    return {
      score: Math.max(0, score),
      analysis: analysis,
      suitability: score > 70 ? 'good' : score > 50 ? 'fair' : 'poor'
    };
  }

  /**
   * Analyze tide conditions
   */
  analyzeTides(tides, activity) {
    // Simplified tide analysis
    const currentTide = tides.current || 'mid';
    let score = 70; // Base score

    if (activity === 'surfing') {
      if (currentTide === 'incoming' || currentTide === 'outgoing') {
        score += 20;
      }
    }

    return {
      score: score,
      analysis: `Tide is ${currentTide}`,
      current: currentTide,
      next: tides.next || 'unknown',
      suitability: 'good'
    };
  }

  /**
   * Get AI-powered weather insights
   */
  async getAIWeatherInsights(weatherData) {
    try {
      const prompt = `Analyze these weather conditions for ${weatherData.activity}:

Current: ${JSON.stringify(weatherData.current)}
Waves: ${JSON.stringify(weatherData.waves)}
Tides: ${JSON.stringify(weatherData.tides)}

Provide specific insights about:
1. Session timing recommendations
2. Safety considerations
3. Skill level suitability
4. Equipment suggestions based on conditions`;

      const response = await AIChatService.chatWithAI(prompt);

      if (response.success) {
        return {
          insights: response.response,
          aiPowered: response.aiPowered
        };
      }
    } catch (error) {
      console.error('Error getting AI insights:', error);
    }

    return {
      insights: "Conditions analyzed. Check individual factors for detailed assessment.",
      aiPowered: false
    };
  }

  /**
   * Generate weather alerts
   */
  generateWeatherAlerts(weather, waves) {
    const alerts = [];

    if (weather.windSpeed > 30) {
      alerts.push({
        type: 'wind',
        severity: 'high',
        message: 'Strong winds - advanced riders only'
      });
    }

    if (waves.height > 8) {
      alerts.push({
        type: 'waves',
        severity: 'high',
        message: 'Large waves - experienced surfers only'
      });
    }

    if (weather.conditions === 'Thunderstorm') {
      alerts.push({
        type: 'weather',
        severity: 'danger',
        message: 'Thunderstorm - avoid water activities'
      });
    }

    if (weather.visibility && weather.visibility < 2) {
      alerts.push({
        type: 'visibility',
        severity: 'medium',
        message: 'Low visibility - use caution'
      });
    }

    return alerts;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis, forecast) {
    const recommendations = [];

    if (analysis.overallScore > 80) {
      recommendations.push("Excellent conditions! Perfect time for a session.");
    } else if (analysis.overallScore > 60) {
      recommendations.push("Good conditions with minor considerations.");
    } else if (analysis.overallScore > 40) {
      recommendations.push("Marginal conditions - suitable for experienced riders.");
    } else {
      recommendations.push("Poor conditions - consider waiting for improvement.");
    }

    // Add timing recommendations
    const bestHours = this.findBestConditionHours(forecast);
    if (bestHours.length > 0) {
      recommendations.push(`Best conditions expected around ${bestHours.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Find best condition hours from forecast
   */
  findBestConditionHours(forecast) {
    return forecast
      .filter(item => item.windSpeed < 20 && !item.conditions.includes('Rain'))
      .slice(0, 3)
      .map(item => item.time.getHours() + ':00');
  }

  // Helper methods
  getConditionRating(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getActivityRecommendation(score, activity) {
    if (score >= 80) return `Perfect conditions for ${activity}!`;
    if (score >= 60) return `Good conditions for ${activity}`;
    if (score >= 40) return `Marginal conditions - suitable for experienced ${activity} enthusiasts`;
    return `Poor conditions for ${activity} - consider waiting`;
  }

  getWindDirectionText(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Simulation methods
  getSimulatedCurrentWeather() {
    return {
      temperature: 22 + Math.random() * 8,
      humidity: 60 + Math.random() * 30,
      pressure: 1013 + Math.random() * 20 - 10,
      windSpeed: Math.random() * 25,
      windDirection: Math.random() * 360,
      windGust: null,
      visibility: 5 + Math.random() * 15,
      cloudCover: Math.random() * 100,
      uvIndex: Math.random() * 10,
      conditions: 'Clear',
      description: 'clear sky',
      sunrise: new Date(),
      sunset: new Date()
    };
  }

  getSimulatedForecast() {
    const forecast = [];
    for (let i = 0; i < 8; i++) {
      const time = new Date();
      time.setHours(time.getHours() + i * 3);

      forecast.push({
        time: time,
        temperature: 20 + Math.random() * 10,
        windSpeed: Math.random() * 20,
        windDirection: Math.random() * 360,
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
        description: 'simulated forecast',
        precipitation: Math.random() * 2
      });
    }
    return forecast;
  }

  getSimulatedWaveData() {
    return {
      height: 1 + Math.random() * 4,
      period: 6 + Math.random() * 8,
      direction: 180 + Math.random() * 180,
      energy: Math.random() * 1000
    };
  }

  getSimulatedTideData() {
    const states = ['low', 'incoming', 'high', 'outgoing'];
    return {
      current: states[Math.floor(Math.random() * states.length)],
      next: states[Math.floor(Math.random() * states.length)],
      height: Math.random() * 2
    };
  }

  getSimulatedWeatherIntelligence(location, activity) {
    const current = this.getSimulatedCurrentWeather();
    const waves = this.getSimulatedWaveData();
    const tides = this.getSimulatedTideData();

    return {
      success: true,
      timestamp: new Date().toISOString(),
      location: location,
      activity: activity,
      current: current,
      forecast: this.getSimulatedForecast(),
      waves: waves,
      tides: tides,
      analysis: {
        overallScore: 60 + Math.random() * 30,
        rating: 'good',
        factors: {
          wind: { score: 70, suitability: 'good' },
          waves: { score: 80, suitability: 'excellent' },
          conditions: { score: 75, suitability: 'good' },
          tides: { score: 70, suitability: 'good' }
        },
        recommendation: 'Good conditions for your session!'
      },
      aiInsights: {
        insights: "Simulated weather analysis - conditions look favorable for your activity.",
        aiPowered: false
      },
      recommendations: ["Good conditions for a session!", "Perfect for skill development"],
      alerts: [],
      note: "Simulated data - real weather APIs not configured"
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
const WeatherIntelligenceServiceInstance = new WeatherIntelligenceService();

export default WeatherIntelligenceServiceInstance;
