import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { VisualEffects, EnhancedSpacing } from '../../styles/FlowCrewDesignSystem';
import { Button, Card, Text as FlowCrewText } from '../FlowCrew';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/AuthService';
import LoadingSpinner from '../LoadingSpinner';

const MeetingPerformanceTracker = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'week', label: 'This Week', days: 7 },
    { id: 'month', label: 'This Month', days: 30 },
    { id: 'quarter', label: 'This Quarter', days: 90 },
    { id: 'year', label: 'This Year', days: 365 },
  ];

  useEffect(() => {
    loadMeetingData();
  }, [selectedPeriod]);

  const loadMeetingData = async () => {
    try {
      setIsLoading(true);

      const [meetingsResponse, performanceResponse] = await Promise.all([
        AuthService.apiRequest(`/coach/meetings?period=${selectedPeriod}`),
        AuthService.apiRequest(`/coach/performance?period=${selectedPeriod}`)
      ]);

      setMeetings(meetingsResponse.meetings || []);
      setPerformance(performanceResponse.performance);
    } catch (error) {
      console.error('Failed to load meeting data:', error);
      Alert.alert('Error', 'Failed to load meeting data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return Colors.status.success;
      case 'upcoming': return Colors.status.info;
      case 'cancelled': return Colors.status.error;
      case 'no_show': return Colors.status.warning;
      default: return Colors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'upcoming': return '📅';
      case 'cancelled': return '❌';
      case 'no_show': return '⏰';
      default: return '📋';
    }
  };

  const renderMeetingCard = (meeting) => (
    <Card
      variant="elevated"
      style={styles.meetingCard}
      interactive
      onPress={() => {
        setSelectedMeeting(meeting);
        setShowMeetingDetails(true);
      }}
    >
      <View style={styles.meetingHeader}>
        <View style={styles.meetingInfo}>
          <FlowCrewText variant="subtitle" bold>
            {meeting.studentName}
          </FlowCrewText>
          <FlowCrewText variant="caption" color="secondary">
            {meeting.activity} • {meeting.duration} hours
          </FlowCrewText>
          <FlowCrewText variant="caption" color="secondary">
            {new Date(meeting.scheduledAt).toLocaleDateString()} at {new Date(meeting.scheduledAt).toLocaleTimeString()}
          </FlowCrewText>
        </View>

        <View style={styles.meetingStatus}>
          <Text style={styles.statusIcon}>{getStatusIcon(meeting.status)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(meeting.status) }]}>
            {meeting.status}
          </Text>
        </View>
      </View>

      <View style={styles.meetingFooter}>
        <Text style={styles.priceText}>${meeting.price}</Text>
        {meeting.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {meeting.rating}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderPerformanceMetrics = () => (
    <Card variant="elevated" style={styles.performanceCard}>
      <FlowCrewText variant="h3" bold style={styles.sectionTitle}>
        Performance Overview
      </FlowCrewText>

      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{performance?.totalSessions || 0}</Text>
          <Text style={styles.metricLabel}>Total Sessions</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{performance?.completionRate || 0}%</Text>
          <Text style={styles.metricLabel}>Completion Rate</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{performance?.averageRating || 0}</Text>
          <Text style={styles.metricLabel}>Avg Rating</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>${performance?.totalEarnings || 0}</Text>
          <Text style={styles.metricLabel}>Total Earnings</Text>
        </View>
      </View>
    </Card>
  );

  const renderMeetingDetails = () => (
    <Modal
      visible={showMeetingDetails}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <FlowCrewText variant="h3" bold>
              Meeting Details
            </FlowCrewText>
            <TouchableOpacity onPress={() => setShowMeetingDetails(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedMeeting && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <FlowCrewText variant="body" bold>Student</FlowCrewText>
                <Text style={styles.detailText}>{selectedMeeting.studentName}</Text>
              </View>

              <View style={styles.detailSection}>
                <FlowCrewText variant="body" bold>Activity</FlowCrewText>
                <Text style={styles.detailText}>{selectedMeeting.activity}</Text>
              </View>

              <View style={styles.detailSection}>
                <FlowCrewText variant="body" bold>Date & Time</FlowCrewText>
                <Text style={styles.detailText}>
                  {new Date(selectedMeeting.scheduledAt).toLocaleDateString()} at {new Date(selectedMeeting.scheduledAt).toLocaleTimeString()}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <FlowCrewText variant="body" bold>Duration</FlowCrewText>
                <Text style={styles.detailText}>{selectedMeeting.duration} hours</Text>
              </View>

              <View style={styles.detailSection}>
                <FlowCrewText variant="body" bold>Price</FlowCrewText>
                <Text style={styles.detailText}>${selectedMeeting.price}</Text>
              </View>

              <View style={styles.detailSection}>
                <FlowCrewText variant="body" bold>Status</FlowCrewText>
                <Text style={[styles.detailText, { color: getStatusColor(selectedMeeting.status) }]}>
                  {selectedMeeting.status}
                </Text>
              </View>

              {selectedMeeting.notes && (
                <View style={styles.detailSection}>
                  <FlowCrewText variant="body" bold>Notes</FlowCrewText>
                  <Text style={styles.detailText}>{selectedMeeting.notes}</Text>
                </View>
              )}

              {selectedMeeting.rating && (
                <View style={styles.detailSection}>
                  <FlowCrewText variant="body" bold>Student Rating</FlowCrewText>
                  <Text style={styles.detailText}>⭐ {selectedMeeting.rating}/5</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.id}
          style={[
            styles.periodButton,
            selectedPeriod === period.id && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period.id)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period.id && styles.periodButtonTextActive
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading meeting data..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {renderPeriodSelector()}
      {renderPerformanceMetrics()}

      <View style={styles.meetingsSection}>
        <FlowCrewText variant="h3" bold style={styles.sectionTitle}>
          Recent Meetings
        </FlowCrewText>

        {meetings.length > 0 ? (
          meetings.map((meeting, index) => (
            <View key={meeting.id || index} style={styles.meetingItem}>
              {renderMeetingCard(meeting)}
            </View>
          ))
        ) : (
          <Card variant="filled" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No meetings found for this period</Text>
          </Card>
        )}
      </View>

      {renderMeetingDetails()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
  },

  periodSelector: {
    flexDirection: 'row',
    marginBottom: EnhancedSpacing.sectionGap,
    paddingHorizontal: Spacing.lg,
  },

  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.ui.card,
  },

  periodButtonActive: {
    backgroundColor: Colors.brand.green,
    borderColor: Colors.brand.green,
  },

  periodButtonText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    color: Colors.text.primary,
  },

  periodButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.bold,
  },

  performanceCard: {
    marginBottom: EnhancedSpacing.sectionGap,
  },

  sectionTitle: {
    marginBottom: Spacing.lg,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  metricItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.ui.lightBg,
    borderRadius: BorderRadius.md,
  },

  metricValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.brand.green,
  },

  metricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },

  meetingsSection: {
    paddingHorizontal: Spacing.lg,
  },

  meetingItem: {
    marginBottom: EnhancedSpacing.componentGap,
  },

  meetingCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  meetingInfo: {
    flex: 1,
  },

  meetingStatus: {
    alignItems: 'center',
  },

  statusIcon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },

  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  meetingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },

  priceText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.brand.green,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },

  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },

  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },

  closeButton: {
    fontSize: 24,
    color: Colors.text.secondary,
  },

  modalBody: {
    padding: Spacing.lg,
  },

  detailSection: {
    marginBottom: Spacing.lg,
  },

  detailText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
});

export default MeetingPerformanceTracker;
