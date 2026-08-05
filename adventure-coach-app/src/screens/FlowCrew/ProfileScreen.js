import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../styles/FlowCrewDesignSystem';
import {
  Text,
  Button,
  Header,
  Avatar,
  Card,
  Badge,
  Tabs
} from '../../components/FlowCrew';

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('activities');

  // Sample user data
  const user = {
    name: 'Alex Johnson',
    username: '@alexadventures',
    bio: 'Outdoor enthusiast and adventure seeker. Always looking for the next mountain to climb or trail to hike.',
    location: 'Denver, CO',
    stats: {
      activities: 24,
      followers: 183,
      following: 97,
    },
    achievements: [
      { id: 1, title: 'Summit Conqueror', description: 'Reached 5 mountain summits', icon: '🏔️' },
      { id: 2, title: 'Water Master', description: 'Completed 10 water activities', icon: '🌊' },
      { id: 3, title: 'Trail Explorer', description: 'Hiked over 50 miles of trails', icon: '🥾' },
    ],
    upcomingActivities: [
      { id: 1, title: 'Mountain Biking at Red Rocks', date: 'Aug 15', category: 'Biking' },
      { id: 2, title: 'Rock Climbing Class', date: 'Aug 22', category: 'Climbing' },
    ],
    pastActivities: [
      { id: 1, title: 'Kayaking Tour', date: 'Jul 30', category: 'Water', completed: true },
      { id: 2, title: 'Hiking at Bear Mountain', date: 'Jul 22', category: 'Hiking', completed: true },
    ],
  };

  // Tab configuration
  const tabs = [
    { id: 'activities', label: 'Activities' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'stats', label: 'Stats' },
  ];

  // Render an activity item
  const renderActivityItem = (activity) => (
    <Card
      key={activity.id}
      variant="filled"
      style={styles.activityCard}
      interactive
      onPress={() => {}}
    >
      <View style={styles.activityContent}>
        <View style={styles.activityMain}>
          <Text variant="body" bold>
            {activity.title}
          </Text>
          <Text variant="caption" color={Colors.text.secondary}>
            {activity.date}
          </Text>
        </View>
        <View style={styles.activityMeta}>
          <Badge variant="info" size="sm">
            {activity.category}
          </Badge>
          {activity.completed && (
            <Text variant="caption" color={Colors.feedback.success} style={styles.completedText}>
              ✓ Completed
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  // Render an achievement item
  const renderAchievementItem = (achievement) => (
    <Card
      key={achievement.id}
      variant="elevated"
      style={styles.achievementCard}
    >
      <View style={styles.achievementIcon}>
        <Text variant="h3">{achievement.icon}</Text>
      </View>
      <Text variant="body" bold style={styles.achievementTitle}>
        {achievement.title}
      </Text>
      <Text variant="caption" color={Colors.text.secondary} center>
        {achievement.description}
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Profile"
        rightAction={
          <TouchableOpacity onPress={() => {}}>
            <Text variant="body" color={Colors.brand.blue}>Edit</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <Avatar
            size="xl"
            name={user.name}
            src={require('../../../assets/placeholder-avatar.jpg')}
          />
          <View style={styles.userInfo}>
            <Text variant="h3" style={styles.userName}>{user.name}</Text>
            <Text variant="body-sm" color={Colors.text.secondary}>{user.username}</Text>
            <Text variant="body" style={styles.userBio}>{user.bio}</Text>
            <Text variant="body-sm" color={Colors.text.secondary} style={styles.userLocation}>📍 {user.location}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="h4">{user.stats.activities}</Text>
            <Text variant="label">Activities</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4">{user.stats.followers}</Text>
            <Text variant="label">Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4">{user.stats.following}</Text>
            <Text variant="label">Following</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            style={styles.followButton}
          >
            Follow
          </Button>
          <Button
            variant="outline"
            style={styles.messageButton}
          >
            Message
          </Button>
        </View>

        {/* Tabs Section */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
          variant="underlined"
          style={styles.tabs}
        />

        {/* Tab Content */}
        {activeTab === 'activities' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text variant="h5">Upcoming Activities</Text>
              <Button variant="tertiary" onPress={() => {}}>
                See All
              </Button>
            </View>
            {user.upcomingActivities.map(renderActivityItem)}

            <View style={[styles.sectionHeader, styles.secondSection]}>
              <Text variant="h5">Past Activities</Text>
              <Button variant="tertiary" onPress={() => {}}>
                See All
              </Button>
            </View>
            {user.pastActivities.map(renderActivityItem)}
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text variant="h5">Earned Achievements</Text>
            </View>
            <View style={styles.achievementsGrid}>
              {user.achievements.map(renderAchievementItem)}
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <Text variant="body">Stats content will go here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  userBio: {
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  userLocation: {
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border.subtle,
  },
  statItem: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    justifyContent: 'space-between',
  },
  followButton: {
    flex: 1,
    marginRight: Spacing.md,
  },
  messageButton: {
    flex: 1,
  },
  tabs: {
    paddingHorizontal: Spacing.lg,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  secondSection: {
    marginTop: Spacing.xl,
  },
  activityCard: {
    marginBottom: Spacing.sm,
  },
  activityContent: {
    flexDirection: 'column',
  },
  activityMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedText: {
    fontWeight: Typography.fontWeight.medium,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    marginBottom: Spacing.md,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  achievementIcon: {
    marginBottom: Spacing.sm,
  },
  achievementTitle: {
    marginBottom: Spacing.xs,
  },
});

export default ProfileScreen;
