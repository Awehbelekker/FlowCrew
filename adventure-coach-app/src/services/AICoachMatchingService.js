import { AuthService } from './AuthService';

class AICoachMatchingService {
  constructor() {
    this.matchingWeights = {
      location: 0.25,
      activity: 0.20,
      experience: 0.15,
      rating: 0.15,
      availability: 0.10,
      price: 0.10,
      language: 0.05
    };

    this.activityPreferences = {
      surfing: {
        experienceLevels: ['beginner', 'intermediate', 'advanced'],
        waveTypes: ['beach_break', 'reef_break', 'point_break'],
        boardTypes: ['longboard', 'shortboard', 'fish', 'gun']
      },
      kitesurfing: {
        windConditions: ['light', 'moderate', 'strong'],
        kiteSizes: ['small', 'medium', 'large'],
        boardTypes: ['twin_tip', 'directional', 'foil']
      },
      sup: {
        waterTypes: ['flat_water', 'ocean', 'river'],
        boardTypes: ['all_around', 'touring', 'racing', 'surf']
      }
    };
  }

  /**
   * Get AI-powered coach recommendations for a student
   * @param {Object} studentProfile - Student preferences and requirements
   * @param {Array} availableCoaches - List of available coaches
   * @returns {Promise<Array>} Ranked list of recommended coaches
   */
  async getCoachRecommendations(studentProfile, availableCoaches = []) {
    try {
      // If no coaches provided, fetch from API
      if (availableCoaches.length === 0) {
        const response = await AuthService.apiRequest('/coaches/available', {
          method: 'POST',
          body: JSON.stringify({
            location: studentProfile.location,
            activity: studentProfile.preferredActivity,
            experienceLevel: studentProfile.experienceLevel,
            budget: studentProfile.budget
          })
        });
        availableCoaches = response.coaches || [];
      }

      // Calculate match scores for each coach
      const scoredCoaches = availableCoaches.map(coach => ({
        ...coach,
        matchScore: this.calculateMatchScore(studentProfile, coach),
        matchFactors: this.analyzeMatchFactors(studentProfile, coach)
      }));

      // Sort by match score (highest first)
      const rankedCoaches = scoredCoaches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Return top 10 matches

      // Add AI insights
      const enhancedRecommendations = rankedCoaches.map(coach => ({
        ...coach,
        aiInsights: this.generateAIInsights(studentProfile, coach),
        compatibilityScore: this.calculateCompatibilityScore(studentProfile, coach)
      }));

      return enhancedRecommendations;
    } catch (error) {
      console.error('Failed to get coach recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate match score between student and coach
   * @param {Object} student - Student profile
   * @param {Object} coach - Coach profile
   * @returns {number} Match score (0-100)
   */
  calculateMatchScore(student, coach) {
    let totalScore = 0;
    const factors = {};

    // Location proximity (25% weight)
    const locationScore = this.calculateLocationScore(student.location, coach.location);
    factors.location = locationScore;
    totalScore += locationScore * this.matchingWeights.location;

    // Activity match (20% weight)
    const activityScore = this.calculateActivityScore(student.preferredActivity, coach.specialties);
    factors.activity = activityScore;
    totalScore += activityScore * this.matchingWeights.activity;

    // Experience level match (15% weight)
    const experienceScore = this.calculateExperienceScore(student.experienceLevel, coach.experienceYears);
    factors.experience = experienceScore;
    totalScore += experienceScore * this.matchingWeights.experience;

    // Rating and reviews (15% weight)
    const ratingScore = this.calculateRatingScore(coach.rating, coach.reviewCount);
    factors.rating = ratingScore;
    totalScore += ratingScore * this.matchingWeights.rating;

    // Availability match (10% weight)
    const availabilityScore = this.calculateAvailabilityScore(student.availability, coach.availability);
    factors.availability = availabilityScore;
    totalScore += availabilityScore * this.matchingWeights.availability;

    // Price compatibility (10% weight)
    const priceScore = this.calculatePriceScore(student.budget, coach.hourlyRate);
    factors.price = priceScore;
    totalScore += priceScore * this.matchingWeights.price;

    // Language compatibility (5% weight)
    const languageScore = this.calculateLanguageScore(student.languages, coach.languages);
    factors.language = languageScore;
    totalScore += languageScore * this.matchingWeights.language;

    return Math.round(totalScore);
  }

  /**
   * Calculate location proximity score
   */
  calculateLocationScore(studentLocation, coachLocation) {
    if (!studentLocation || !coachLocation) return 50;

    const distance = this.calculateDistance(
      studentLocation.latitude, studentLocation.longitude,
      coachLocation.latitude, coachLocation.longitude
    );

    // Score based on distance (0-50km)
    if (distance <= 5) return 100; // Very close
    if (distance <= 15) return 90; // Close
    if (distance <= 25) return 75; // Moderate
    if (distance <= 35) return 60; // Far
    if (distance <= 50) return 40; // Very far
    return 20; // Too far
  }

  /**
   * Calculate activity compatibility score
   */
  calculateActivityScore(studentActivity, coachSpecialties) {
    if (!studentActivity || !coachSpecialties) return 50;

    const normalizedStudentActivity = studentActivity.toLowerCase();
    const normalizedSpecialties = coachSpecialties.map(s => s.toLowerCase());

    // Exact match
    if (normalizedSpecialties.includes(normalizedStudentActivity)) {
      return 100;
    }

    // Partial match (e.g., "surfing" matches "longboard surfing")
    const hasPartialMatch = normalizedSpecialties.some(specialty =>
      specialty.includes(normalizedStudentActivity) ||
      normalizedStudentActivity.includes(specialty)
    );

    if (hasPartialMatch) return 85;

    // Related activities
    const relatedActivities = this.getRelatedActivities(normalizedStudentActivity);
    const hasRelatedMatch = normalizedSpecialties.some(specialty =>
      relatedActivities.includes(specialty)
    );

    if (hasRelatedMatch) return 70;

    return 30; // No match
  }

  /**
   * Calculate experience level compatibility
   */
  calculateExperienceScore(studentLevel, coachYears) {
    if (!studentLevel || !coachYears) return 50;

    const levelScores = {
      beginner: { min: 0, max: 5, optimal: 2 },
      intermediate: { min: 2, max: 10, optimal: 5 },
      advanced: { min: 5, max: 20, optimal: 10 },
      expert: { min: 8, max: 30, optimal: 15 }
    };

    const level = studentLevel.toLowerCase();
    const requirements = levelScores[level] || levelScores.intermediate;

    if (coachYears >= requirements.min && coachYears <= requirements.max) {
      // Calculate how close to optimal
      const distanceFromOptimal = Math.abs(coachYears - requirements.optimal);
      const maxDistance = (requirements.max - requirements.min) / 2;
      return Math.max(60, 100 - (distanceFromOptimal / maxDistance) * 40);
    }

    return 30; // Outside preferred range
  }

  /**
   * Calculate rating score with review count consideration
   */
  calculateRatingScore(rating, reviewCount) {
    if (!rating || rating === 0) return 50;

    // Base score from rating (0-5 scale)
    let score = (rating / 5) * 100;

    // Boost score based on number of reviews
    if (reviewCount >= 50) score += 10;
    else if (reviewCount >= 20) score += 5;
    else if (reviewCount >= 5) score += 2;

    return Math.min(100, score);
  }

  /**
   * Calculate availability compatibility
   */
  calculateAvailabilityScore(studentAvailability, coachAvailability) {
    if (!studentAvailability || !coachAvailability) return 50;

    // Simple overlap calculation
    let overlapCount = 0;
    let totalSlots = 0;

    // Check weekly schedule overlap
    for (let day = 0; day < 7; day++) {
      const studentSlots = studentAvailability.weeklySchedule[day] || [];
      const coachSlots = coachAvailability.weeklySchedule[day] || [];

      for (const studentSlot of studentSlots) {
        for (const coachSlot of coachSlots) {
          if (this.timeSlotsOverlap(studentSlot, coachSlot)) {
            overlapCount++;
          }
        }
        totalSlots++;
      }
    }

    return totalSlots > 0 ? (overlapCount / totalSlots) * 100 : 50;
  }

  /**
   * Calculate price compatibility
   */
  calculatePriceScore(studentBudget, coachRate) {
    if (!studentBudget || !coachRate) return 50;

    const budgetRange = studentBudget.max - studentBudget.min;
    const budgetCenter = (studentBudget.max + studentBudget.min) / 2;

    // Calculate how well the coach's rate fits the budget
    if (coachRate <= studentBudget.max && coachRate >= studentBudget.min) {
      // Within budget range
      const distanceFromCenter = Math.abs(coachRate - budgetCenter);
      const maxDistance = budgetRange / 2;
      return Math.max(70, 100 - (distanceFromCenter / maxDistance) * 30);
    } else if (coachRate <= studentBudget.max * 1.2) {
      // Slightly over budget but acceptable
      return 60;
    }

    return 30; // Too expensive
  }

  /**
   * Calculate language compatibility
   */
  calculateLanguageScore(studentLanguages, coachLanguages) {
    if (!studentLanguages || !coachLanguages) return 50;

    const studentLangSet = new Set(studentLanguages.map(l => l.toLowerCase()));
    const coachLangSet = new Set(coachLanguages.map(l => l.toLowerCase()));

    // Check for common languages
    const commonLanguages = [...studentLangSet].filter(lang => coachLangSet.has(lang));

    if (commonLanguages.length > 0) {
      return 100; // Perfect language match
    }

    return 50; // No common languages
  }

  /**
   * Analyze match factors for detailed insights
   */
  analyzeMatchFactors(student, coach) {
    return {
      location: {
        score: this.calculateLocationScore(student.location, coach.location),
        details: this.getLocationDetails(student.location, coach.location)
      },
      activity: {
        score: this.calculateActivityScore(student.preferredActivity, coach.specialties),
        details: this.getActivityDetails(student.preferredActivity, coach.specialties)
      },
      experience: {
        score: this.calculateExperienceScore(student.experienceLevel, coach.experienceYears),
        details: this.getExperienceDetails(student.experienceLevel, coach.experienceYears)
      },
      rating: {
        score: this.calculateRatingScore(coach.rating, coach.reviewCount),
        details: this.getRatingDetails(coach.rating, coach.reviewCount)
      },
      availability: {
        score: this.calculateAvailabilityScore(student.availability, coach.availability),
        details: this.getAvailabilityDetails(student.availability, coach.availability)
      },
      price: {
        score: this.calculatePriceScore(student.budget, coach.hourlyRate),
        details: this.getPriceDetails(student.budget, coach.hourlyRate)
      },
      language: {
        score: this.calculateLanguageScore(student.languages, coach.languages),
        details: this.getLanguageDetails(student.languages, coach.languages)
      }
    };
  }

  /**
   * Generate AI insights for coach recommendations
   */
  generateAIInsights(student, coach) {
    const insights = [];

    // Location insights
    const distance = this.calculateDistance(
      student.location.latitude, student.location.longitude,
      coach.location.latitude, coach.location.longitude
    );

    if (distance <= 5) {
      insights.push("Very close to your location - perfect for regular sessions");
    } else if (distance <= 15) {
      insights.push("Conveniently located for your sessions");
    } else if (distance <= 25) {
      insights.push("Moderate travel distance - consider session frequency");
    }

    // Experience insights
    if (student.experienceLevel === 'beginner' && coach.experienceYears >= 3) {
      insights.push("Great for beginners - experienced with teaching fundamentals");
    } else if (student.experienceLevel === 'advanced' && coach.experienceYears >= 8) {
      insights.push("Perfect for advanced training - deep technical knowledge");
    }

    // Rating insights
    if (coach.rating >= 4.5 && coach.reviewCount >= 20) {
      insights.push("Highly rated by many students - proven track record");
    } else if (coach.rating >= 4.0) {
      insights.push("Well-rated coach with good student feedback");
    }

    // Price insights
    if (coach.hourlyRate <= student.budget.max && coach.hourlyRate >= student.budget.min) {
      insights.push("Fits your budget perfectly");
    } else if (coach.hourlyRate <= student.budget.max * 1.1) {
      insights.push("Slightly above budget but excellent value");
    }

    return insights;
  }

  /**
   * Calculate compatibility score for relationship potential
   */
  calculateCompatibilityScore(student, coach) {
    // This would use more sophisticated algorithms in production
    // For now, use a combination of factors
    const factors = this.analyzeMatchFactors(student, coach);

    const weightedScore = Object.values(factors).reduce((total, factor) => {
      return total + factor.score;
    }, 0) / Object.keys(factors).length;

    // Add bonus for exceptional matches
    let bonus = 0;
    if (factors.location.score >= 90) bonus += 5;
    if (factors.activity.score >= 90) bonus += 5;
    if (factors.rating.score >= 90) bonus += 5;

    return Math.min(100, weightedScore + bonus);
  }

  /**
   * Get related activities for better matching
   */
  getRelatedActivities(activity) {
    const relatedMap = {
      surfing: ['longboarding', 'shortboarding', 'bodyboarding'],
      kitesurfing: ['windsurfing', 'wakeboarding'],
      sup: ['paddleboarding', 'kayaking'],
      windsurfing: ['kitesurfing', 'sailing'],
      bodyboarding: ['surfing', 'body surfing']
    };

    return relatedMap[activity] || [];
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Check if two time slots overlap
   */
  timeSlotsOverlap(slot1, slot2) {
    const [start1, end1] = slot1.split('-').map(t => this.parseTime(t));
    const [start2, end2] = slot2.split('-').map(t => this.parseTime(t));

    return start1 < end2 && start2 < end1;
  }

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper methods for detailed insights
  getLocationDetails(studentLocation, coachLocation) {
    const distance = this.calculateDistance(
      studentLocation.latitude, studentLocation.longitude,
      coachLocation.latitude, coachLocation.longitude
    );
    return `${distance.toFixed(1)}km away`;
  }

  getActivityDetails(studentActivity, coachSpecialties) {
    const match = coachSpecialties.some(s =>
      s.toLowerCase().includes(studentActivity.toLowerCase())
    );
    return match ? 'Perfect match' : 'Partial match';
  }

  getExperienceDetails(studentLevel, coachYears) {
    return `${coachYears} years experience for ${studentLevel} level`;
  }

  getRatingDetails(rating, reviewCount) {
    return `${rating}/5 stars from ${reviewCount} reviews`;
  }

  getAvailabilityDetails(studentAvailability, coachAvailability) {
    return 'Availability overlap calculated';
  }

  getPriceDetails(studentBudget, coachRate) {
    const avgBudget = (studentBudget.max + studentBudget.min) / 2;
    const diff = ((coachRate - avgBudget) / avgBudget) * 100;
    return diff > 0 ? `${diff.toFixed(0)}% above average` : `${Math.abs(diff).toFixed(0)}% below average`;
  }

  getLanguageDetails(studentLanguages, coachLanguages) {
    const common = studentLanguages.filter(l => coachLanguages.includes(l));
    return common.length > 0 ? `Common languages: ${common.join(', ')}` : 'No common languages';
  }
}

// Create singleton instance
const AICoachMatchingServiceInstance = new AICoachMatchingService();

export default AICoachMatchingServiceInstance;
