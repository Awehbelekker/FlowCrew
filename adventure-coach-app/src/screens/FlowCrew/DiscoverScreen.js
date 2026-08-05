import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, VisualEffects, EnhancedSpacing } from '../../styles/FlowCrewDesignSystem';
import {
  Text,
  Button,
  Header,
  ActivityCard,
  Tabs,
  Card
} from '../../components/FlowCrew';
import { FlowCrewLogo } from '../../components/FlowCrew/Icons';

// Sample data for featured activities
const FEATURED_ACTIVITIES = [
  {
    id: 1,
    title: 'Mountain Biking Adventure',
    subtitle: 'Discover the thrill of downhill trails and beautiful scenery',
    imageSource: require('../../../assets/placeholder-image.jpg'),
    duration: '4 hours',
    difficulty: 'Moderate',
    category: 'Biking',
  },
  {
    id: 2,
    title: 'Rock Climbing Basics',
    subtitle: 'Learn essential skills for safe and fun rock climbing',
    imageSource: require('../../../assets/placeholder-image.jpg'),
    duration: '3 hours',
    difficulty: 'Hard',
    category: 'Climbing',
  },
  {
    id: 3,
    title: 'Kayaking Tour',
    subtitle: 'Paddle through crystal clear waters and explore hidden coves',
    imageSource: require('../../../assets/placeholder-image.jpg'),
    duration: '2 hours',
    difficulty: 'Easy',
    category: 'Water',
  },
];

// Sample data for recommended coaches
const RECOMMENDED_COACHES = [
  {
    id: 1,
    name: 'Sarah Johnson',
    specialty: 'Mountain Biking',
    imageSource: require('../../../assets/placeholder-coach.jpg'),
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: 2,
    name: 'Mike Peterson',
    specialty: 'Rock Climbing',
    imageSource: require('../../../assets/placeholder-coach.jpg'),
    rating: 4.9,
    reviewCount: 36,
  },
  {
    id: 3,
    name: 'Emily Davis',
    specialty: 'Kayaking',
    imageSource: require('../../../assets/placeholder-coach.jpg'),
    rating: 4.7,
    reviewCount: 18,
  },
];

const DiscoverScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('activities');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const tabs = [
    { id: 'activities', label: 'Activities' },
    { id: 'coaches', label: 'Coaches' },
    { id: 'locations', label: 'Locations' },
  ];

  const renderActivityItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.activityItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ActivityCard
        title={item.title}
        subtitle={item.subtitle}
        imageSource={item.imageSource}
        duration={item.duration}
        difficulty={item.difficulty}
        category={item.category}
        onPress={() => {}}
      />
    </Animated.View>
  );

  const renderCoachItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.coachItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card variant="elevated" style={styles.coachCard}>
        <View style={styles.coachContent}>
          <View style={styles.coachInfo}>
            <Text variant="subtitle" bold>
              {item.name}
            </Text>
            <Text variant="caption" color="secondary">
              {item.specialty}
            </Text>
            <View style={styles.ratingContainer}>
              <Text variant="caption" color="brand">
                ⭐ {item.rating}
              </Text>
              <Text variant="caption" color="secondary">
                ({item.reviewCount} reviews)
              </Text>
            </View>
          </View>
          <Button variant="primary" size="sm" onPress={() => {}}>
            Book Now
          </Button>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <Header
        title="Discover"
        showLogo={true}
        rightAction={
          <TouchableOpacity onPress={() => {}} style={styles.headerAction}>
            <Text>💬</Text>
          </TouchableOpacity>
        }
      />

      {/* Hero Section with Enhanced Visual Effects */}
      <Animated.View
        style={[
          styles.hero,
          {
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })}],
          },
        ]}
      >
        <ImageBackground
          source={require('../../../assets/placeholder-image.jpg')}
          style={styles.heroBackground}
        >
          <View style={styles.heroOverlay}>
            <Text variant="h2" color="inverse" style={styles.heroTitle}>
              Find Your Next Adventure
            </Text>
            <Text variant="body" color="inverse" style={styles.heroSubtitle}>
              Discover amazing activities and expert coaches
            </Text>
            <Button variant="primary" size="lg" style={styles.heroButton}>
              Start Exploring
            </Button>
          </View>
        </ImageBackground>
      </Animated.View>

      {/* Enhanced Tabs with Smooth Transitions */}
      <Animated.View
        style={[
          styles.tabsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
      </Animated.View>

      {/* Content with Enhanced Spacing */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'activities' && (
          <FlatList
            data={FEATURED_ACTIVITIES}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {activeTab === 'coaches' && (
          <FlatList
            data={RECOMMENDED_COACHES}
            renderItem={renderCoachItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {activeTab === 'locations' && (
          <Card variant="filled" style={styles.locationCard}>
            <Text variant="subtitle" bold style={styles.locationTitle}>
              Popular Locations
            </Text>
            <Text variant="body" color="secondary">
              Discover amazing locations near you
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
  },

  headerAction: {
    padding: Spacing.sm,
  },

  hero: {
    marginBottom: EnhancedSpacing.sectionGap,
  },

  heroBackground: {
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
  },

  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },

  heroTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  heroSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  heroButton: {
    shadowColor: Colors.brand.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  tabsContainer: {
    marginBottom: EnhancedSpacing.sectionGap,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  activityItem: {
    marginBottom: EnhancedSpacing.componentGap,
  },

  coachItem: {
    marginBottom: EnhancedSpacing.componentGap,
  },

  coachCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  coachContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  coachInfo: {
    flex: 1,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },

  separator: {
    height: EnhancedSpacing.componentGap,
  },

  locationCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },

  locationTitle: {
    marginBottom: Spacing.sm,
  },
});

export default DiscoverScreen;
