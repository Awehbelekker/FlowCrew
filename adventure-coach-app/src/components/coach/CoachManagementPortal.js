import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { useAuth } from '../../contexts/AuthContext';
import AdvancedAvailabilityManager from './AdvancedAvailabilityManager';
import StudentRelationshipManager from './StudentRelationshipManager';
import PerformanceMetricsDashboard from './PerformanceMetricsDashboard';
import BookingManagement from './BookingManagement';
import EarningsDashboard from '../dashboard/EarningsDashboard';

const CoachManagementPortal = () => {
  const { user, isCoach } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      component: PerformanceMetricsDashboard,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: '📅',
      component: BookingManagement,
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: '⏰',
      component: AdvancedAvailabilityManager,
    },
    {
      id: 'students',
      label: 'Students',
      icon: '👥',
      component: StudentRelationshipManager,
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: '💰',
      component: EarningsDashboard,
    },
  ];

  if (!isCoach) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🚫</Text>
        <Text style={styles.errorTitle}>Access Restricted</Text>
        <Text style={styles.errorText}>
          Coach Management Portal is only available for coaches
        </Text>
      </View>
    );
  }

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.tabIcon,
                activeTab === tab.id && styles.tabIconActive,
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderActiveComponent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (!activeTabData) return null;

    const Component = activeTabData.component;
    return <Component />;
  };

  const renderWelcomeHeader = () => (
    <View style={styles.welcomeHeader}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>
          Welcome back, {user?.firstName}! 👋
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Manage your coaching business with ease
        </Text>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>12</Text>
          <Text style={styles.quickStatLabel}>Today's Sessions</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>$450</Text>
          <Text style={styles.quickStatLabel}>Today's Earnings</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Welcome Header - only show on dashboard */}
      {activeTab === 'dashboard' && renderWelcomeHeader()}

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Active Component */}
      <View style={styles.content}>
        {renderActiveComponent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.flowcrew.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.background,
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: Typography.fontSize['3xl'],
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  welcomeHeader: {
    backgroundColor: Colors.flowcrew.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    ...AdvancedShadows.subtleDepth,
  },
  welcomeContent: {
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  quickStat: {
    flex: 1,
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.gradientStart,
    marginBottom: Spacing.xs / 2,
  },
  quickStatLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: Colors.flowcrew.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    ...AdvancedShadows.subtleDepth,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    minWidth: 100,
  },
  tabActive: {
    backgroundColor: Colors.flowcrew.gradientStart,
    ...AdvancedShadows.floating,
  },
  tabIcon: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.sm,
  },
  tabIconActive: {
    // Icon color doesn't change for emojis
  },
  tabLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.flowcrew.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
});

export default CoachManagementPortal;
