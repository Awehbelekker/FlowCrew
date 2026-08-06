// Enhanced Achievement System for Coaches
// Gamification with badges, progress tracking, and milestones

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FlowCrewDesignSystem } from '../../styles/FlowCrewDesignSystem';
import { advancedVisualEffects } from '../../styles/advancedVisualEffects';

const { Colors, Typography, Spacing, Shadows, BorderRadius } = FlowCrewDesignSystem;

export const AchievementSystem = ({ coachId }) => {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animatedValues] = useState({});

  // Achievement definitions
  const achievementCategories = {
    sessions: {
      title: 'Session Mastery',
      icon: '🏄‍♂️',
      color: Colors.brand?.blue || '#007AFF',
      achievements: [
        {
          id: 'first_session',
          title: 'First Wave',
          description: 'Complete your first coaching session',
          icon: '🌊',
          requirement: 1,
          type: 'sessions_completed',
          rarity: 'common',
          points: 10
        },
        {
          id: 'session_milestone_10',
          title: 'Rising Tide',
          description: 'Complete 10 coaching sessions',
          icon: '🌊',
          requirement: 10,
          type: 'sessions_completed',
          rarity: 'common',
          points: 50
        },
        {
          id: 'session_milestone_50',
          title: 'Wave Rider',
          description: 'Complete 50 coaching sessions',
          icon: '🏄‍♂️',
          requirement: 50,
          type: 'sessions_completed',
          rarity: 'uncommon',
          points: 200
        },
        {
          id: 'session_milestone_100',
          title: 'Surf Master',
          description: 'Complete 100 coaching sessions',
          icon: '🏆',
          requirement: 100,
          type: 'sessions_completed',
          rarity: 'rare',
          points: 500
        },
        {
          id: 'session_milestone_500',
          title: 'Ocean Legend',
          description: 'Complete 500 coaching sessions',
          icon: '👑',
          requirement: 500,
          type: 'sessions_completed',
          rarity: 'legendary',
          points: 2000
        }
      ]
    },
    ratings: {
      title: 'Excellence Awards',
      icon: '⭐',
      color: Colors.warning || '#FF9500',
      achievements: [
        {
          id: 'first_5_star',
          title: 'Shining Star',
          description: 'Receive your first 5-star rating',
          icon: '⭐',
          requirement: 1,
          type: 'five_star_ratings',
          rarity: 'common',
          points: 25
        },
        {
          id: 'rating_master',
          title: '5-Star Master',
          description: 'Maintain 4.8+ average rating with 20+ reviews',
          icon: '🌟',
          requirement: 4.8,
          type: 'average_rating',
          rarity: 'rare',
          points: 300
        },
        {
          id: 'perfect_month',
          title: 'Perfect Month',
          description: 'Receive only 5-star ratings for a full month',
          icon: '💫',
          requirement: 30,
          type: 'consecutive_five_stars',
          rarity: 'epic',
          points: 750
        }
      ]
    },
    weather: {
      title: 'Weather Warrior',
      icon: '🌊',
      color: Colors.info || '#5AC8FA',
      achievements: [
        {
          id: 'weather_warrior',
          title: 'Weather Warrior',
          description: 'Coach in 5 different weather conditions',
          icon: '⛈️',
          requirement: 5,
          type: 'weather_conditions',
          rarity: 'uncommon',
          points: 150
        },
        {
          id: 'storm_rider',
          title: 'Storm Rider',
          description: 'Successfully coach during challenging conditions',
          icon: '🌪️',
          requirement: 3,
          type: 'challenging_weather',
          rarity: 'rare',
          points: 400
        },
        {
          id: 'dawn_patrol',
          title: 'Dawn Patrol',
          description: 'Coach 10 sunrise sessions',
          icon: '🌅',
          requirement: 10,
          type: 'sunrise_sessions',
          rarity: 'uncommon',
          points: 200
        }
      ]
    },
    special: {
      title: 'Special Achievements',
      icon: '🎖️',
      color: Colors.success || '#34C759',
      achievements: [
        {
          id: 'student_progression',
          title: 'Progression Master',
          description: 'Help 5 students advance to the next level',
          icon: '📈',
          requirement: 5,
          type: 'student_progressions',
          rarity: 'rare',
          points: 350
        },
        {
          id: 'safety_champion',
          title: 'Safety Champion',
          description: 'Complete 100 sessions with zero incidents',
          icon: '🛡️',
          requirement: 100,
          type: 'safe_sessions',
          rarity: 'epic',
          points: 600
        },
        {
          id: 'community_builder',
          title: 'Community Builder',
          description: 'Refer 5 new coaches to the platform',
          icon: '🤝',
          requirement: 5,
          type: 'coach_referrals',
          rarity: 'legendary',
          points: 1000
        }
      ]
    }
  };

  // Mock coach progress data
  const mockProgress = {
    sessions_completed: 127,
    five_star_ratings: 89,
    average_rating: 4.8,
    consecutive_five_stars: 15,
    weather_conditions: 7,
    challenging_weather: 2,
    sunrise_sessions: 8,
    student_progressions: 3,
    safe_sessions: 127,
    coach_referrals: 2,
    total_points: 2450,
    level: 8,
    next_level_points: 2750
  };

  useEffect(() => {
    setProgress(mockProgress);

    // Calculate achieved badges
    const allAchievements = Object.values(achievementCategories)
      .flatMap(category => category.achievements);

    const achievedBadges = allAchievements.filter(achievement => {
      const currentValue = mockProgress[achievement.type] || 0;
      return currentValue >= achievement.requirement;
    });

    setAchievements(achievedBadges);

    // Initialize animations
    allAchievements.forEach(achievement => {
      animatedValues[achievement.id] = new Animated.Value(0);
    });
  }, []);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#8E8E93';
      case 'uncommon': return '#34C759';
      case 'rare': return '#007AFF';
      case 'epic': return '#AF52DE';
      case 'legendary': return '#FF9500';
      default: return Colors.text.secondary;
    }
  };

  const getRarityGlow = (rarity) => {
    const color = getRarityColor(rarity);
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
    };
  };

  const calculateProgress = (achievement) => {
    const currentValue = progress[achievement.type] || 0;
    return Math.min(currentValue / achievement.requirement, 1);
  };

  const isAchieved = (achievement) => {
    return achievements.some(a => a.id === achievement.id);
  };

  const renderAchievementCard = (achievement, category) => {
    const achieved = isAchieved(achievement);
    const progressValue = calculateProgress(achievement);

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementCard,
          achieved ? styles.achievedCard : styles.unachievedCard,
          achieved && getRarityGlow(achievement.rarity),
          advancedVisualEffects.glassmorphism.light
        ]}
        onPress={() => {
          // Animate achievement card
          Animated.sequence([
            Animated.timing(animatedValues[achievement.id], {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValues[achievement.id], {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            })
          ]).start();
        }}
      >
        <Animated.View style={{
          transform: [{
            scale: animatedValues[achievement.id]?.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05],
            }) || 1
          }]
        }}>
          <View style={styles.achievementHeader}>
            <View style={[
              styles.achievementIcon,
              { backgroundColor: achieved ? getRarityColor(achievement.rarity) : Colors.background.secondary }
            ]}>
              <Text style={[
                styles.achievementIconText,
                { opacity: achieved ? 1 : 0.5 }
              ]}>
                {achievement.icon}
              </Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                { color: achieved ? Colors.text.primary : Colors.text.secondary }
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                styles.achievementRarity,
                { color: getRarityColor(achievement.rarity) }
              ]}>
                {achievement.rarity.toUpperCase()}
              </Text>
            </View>
            <View style={styles.achievementPoints}>
              <Text style={styles.pointsText}>{achievement.points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </View>

          <Text style={[
            styles.achievementDescription,
            { color: achieved ? Colors.text.secondary : Colors.text.tertiary }
          ]}>
            {achievement.description}
          </Text>

          {!achieved && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${progressValue * 100}%`,
                    backgroundColor: category.color
                  }
                ]} />
              </View>
              <Text style={styles.progressText}>
                {progress[achievement.type] || 0} / {achievement.requirement}
              </Text>
            </View>
          )}

          {achieved && (
            <View style={styles.achievedBadge}>
              <Text style={styles.achievedText}>✅ ACHIEVED</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderLevelProgress = () => (
    <View style={[styles.levelContainer, advancedVisualEffects.glassmorphism.ocean]}>
      <View style={styles.levelHeader}>
        <Text style={styles.levelTitle}>Coach Level {progress.level}</Text>
        <Text style={styles.totalPoints}>{progress.total_points} Points</Text>
      </View>

      <View style={styles.levelProgressBar}>
        <View style={[
          styles.levelProgressFill,
          {
            width: `${((progress.total_points % 500) / 500) * 100}%`
          }
        ]} />
      </View>

      <Text style={styles.nextLevelText}>
        {progress.next_level_points - progress.total_points} points to Level {progress.level + 1}
      </Text>
    </View>
  );

  const categories = Object.entries(achievementCategories);
  const filteredCategories = selectedCategory === 'all'
    ? categories
    : categories.filter(([key]) => key === selectedCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Achievements</Text>

      {renderLevelProgress()}

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.activeCategoryButton
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={styles.categoryIcon}>🎯</Text>
          <Text style={[
            styles.categoryText,
            selectedCategory === 'all' && styles.activeCategoryText
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {categories.map(([key, category]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoryButton,
              selectedCategory === key && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(key)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === key && styles.activeCategoryText
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievement Grid */}
      <ScrollView style={styles.achievementList} showsVerticalScrollIndicator={false}>
        {filteredCategories.map(([key, category]) => (
          <View key={key} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: category.color }]}>
              {category.icon} {category.title}
            </Text>

            <View style={styles.achievementGrid}>
              {category.achievements.map(achievement =>
                renderAchievementCard(achievement, category)
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background?.primary || '#FFFFFF',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginVertical: Spacing.lg,
    color: Colors.text?.primary || '#000000',
  },
  levelContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  levelTitle: {
    ...Typography.h2,
    color: Colors.text?.inverse || '#FFFFFF',
    fontWeight: 'bold',
  },
  totalPoints: {
    ...Typography.h3,
    color: Colors.text?.inverse || '#FFFFFF',
  },
  levelProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: Colors.text?.inverse || '#FFFFFF',
    borderRadius: 4,
  },
  nextLevelText: {
    ...Typography.body,
    color: Colors.text?.inverse || '#FFFFFF',
    opacity: 0.8,
  },
  categoryFilter: {
    marginBottom: Spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background?.secondary || '#F5F5F5',
    alignItems: 'center',
    minWidth: 100,
  },
  activeCategoryButton: {
    backgroundColor: Colors.brand?.blue || '#007AFF',
    ...Shadows.sm,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.text?.secondary || '#666666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: Colors.text?.inverse || '#FFFFFF',
    fontWeight: 'bold',
  },
  achievementList: {
    flex: 1,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
    fontWeight: 'bold',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  achievedCard: {
    borderWidth: 2,
    borderColor: Colors.success || '#34C759',
  },
  unachievedCard: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  achievementIconText: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...Typography.h4,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  achievementRarity: {
    ...Typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsText: {
    ...Typography.h4,
    color: Colors.warning || '#FF9500',
    fontWeight: 'bold',
  },
  pointsLabel: {
    ...Typography.caption,
    color: Colors.text?.tertiary || '#999999',
  },
  achievementDescription: {
    ...Typography.body,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background?.secondary || '#F5F5F5',
    borderRadius: 3,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.text?.tertiary || '#999999',
    textAlign: 'center',
  },
  achievedBadge: {
    backgroundColor: Colors.success || '#34C759',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  achievedText: {
    ...Typography.caption,
    color: Colors.text?.inverse || '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AchievementSystem;
