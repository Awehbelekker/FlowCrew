// Enhanced Session Management View for Coaches
// Comprehensive session overview with management capabilities

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FlowCrewDesignSystem } from '../../styles/FlowCrewDesignSystem';
import { advancedVisualEffects } from '../../styles/advancedVisualEffects';

const { Colors, Typography, Spacing, Shadows, BorderRadius } = FlowCrewDesignSystem;

export const SessionManagementView = ({ coachId }) => {
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [analytics, setAnalytics] = useState({});

  // Mock session data
  const mockSessions = {
    upcoming: [
      {
        id: 'session-1',
        student: { name: 'Sarah Johnson', avatar: '👩‍🦱', level: 'Beginner' },
        date: '2025-01-15',
        time: '10:00 AM',
        duration: 60,
        activity: 'Surfing',
        location: 'Malibu Beach',
        status: 'confirmed',
        amount: 75.00,
        weather: { condition: 'Perfect', waves: '3-4ft', wind: '5mph' }
      },
      {
        id: 'session-2',
        student: { name: 'Mike Chen', avatar: '👨‍💼', level: 'Intermediate' },
        date: '2025-01-15',
        time: '2:00 PM',
        duration: 90,
        activity: 'SUP',
        location: 'Santa Monica',
        status: 'pending',
        amount: 95.00,
        weather: { condition: 'Good', waves: '2-3ft', wind: '8mph' }
      }
    ],
    inProgress: [
      {
        id: 'session-3',
        student: { name: 'Emma Wilson', avatar: '👩‍🎓', level: 'Advanced' },
        date: '2025-01-14',
        time: '11:00 AM',
        duration: 120,
        activity: 'Surfing',
        location: 'Venice Beach',
        status: 'in-progress',
        amount: 120.00,
        startedAt: '11:05 AM'
      }
    ],
    completed: [
      {
        id: 'session-4',
        student: { name: 'Alex Rodriguez', avatar: '👨‍🎨', level: 'Beginner' },
        date: '2025-01-13',
        time: '9:00 AM',
        duration: 60,
        activity: 'Surfing',
        location: 'Huntington Beach',
        status: 'completed',
        amount: 75.00,
        rating: 5,
        feedback: 'Amazing session! Learned so much about wave reading.'
      }
    ]
  };

  useEffect(() => {
    setSessions(mockSessions);
    setAnalytics({
      totalSessions: 127,
      thisWeek: 8,
      avgRating: 4.8,
      totalEarnings: 9540.00,
      thisMonth: 2280.00
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return Colors.success;
      case 'pending': return Colors.warning;
      case 'in-progress': return Colors.info;
      case 'completed': return Colors.success;
      case 'cancelled': return Colors.error;
      default: return Colors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'in-progress': return '🏄‍♂️';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  const handleSessionAction = (sessionId, action) => {
    console.log(`${action} session ${sessionId}`);
    // Implement session management logic
  };

  const renderSessionCard = (session) => (
    <TouchableOpacity
      key={session.id}
      style={[styles.sessionCard, advancedVisualEffects.glassmorphism.light]}
      onPress={() => {
        setSelectedSession(session);
        setShowSessionModal(true);
      }}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentAvatar}>{session.student.avatar}</Text>
          <View>
            <Text style={styles.studentName}>{session.student.name}</Text>
            <Text style={styles.studentLevel}>{session.student.level}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusIcon}>{getStatusIcon(session.status)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
            {session.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{session.date} at {session.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🏄‍♂️</Text>
          <Text style={styles.detailText}>{session.activity} • {session.duration} min</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{session.location}</Text>
        </View>
        {session.weather && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🌊</Text>
            <Text style={styles.detailText}>
              {session.weather.condition} • {session.weather.waves} • {session.weather.wind}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sessionFooter}>
        <Text style={styles.sessionAmount}>${session.amount.toFixed(2)}</Text>
        {session.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>{'⭐'.repeat(session.rating)}</Text>
            <Text style={styles.ratingText}>({session.rating}/5)</Text>
          </View>
        )}
      </View>

      {session.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleSessionAction(session.id, 'confirm')}
          >
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={() => handleSessionAction(session.id, 'reschedule')}
          >
            <Text style={styles.actionButtonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAnalytics = () => (
    <View style={[styles.analyticsContainer, advancedVisualEffects.glassmorphism.ocean]}>
      <Text style={styles.analyticsTitle}>📊 Session Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticCard}>
          <Text style={styles.analyticNumber}>{analytics.totalSessions}</Text>
          <Text style={styles.analyticLabel}>Total Sessions</Text>
        </View>
        <View style={styles.analyticCard}>
          <Text style={styles.analyticNumber}>{analytics.thisWeek}</Text>
          <Text style={styles.analyticLabel}>This Week</Text>
        </View>
        <View style={styles.analyticCard}>
          <Text style={styles.analyticNumber}>{analytics.avgRating}</Text>
          <Text style={styles.analyticLabel}>Avg Rating</Text>
        </View>
        <View style={styles.analyticCard}>
          <Text style={styles.analyticNumber}>${analytics.totalEarnings?.toFixed(0)}</Text>
          <Text style={styles.analyticLabel}>Total Earnings</Text>
        </View>
      </View>
    </View>
  );

  const renderSessionModal = () => (
    <Modal
      visible={showSessionModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSessionModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Session Details</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSessionModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedSession && (
          <ScrollView style={styles.modalContent}>
            <View style={[styles.modalCard, advancedVisualEffects.glassmorphism.light]}>
              <Text style={styles.modalSectionTitle}>Student Information</Text>
              <View style={styles.studentDetailRow}>
                <Text style={styles.studentDetailAvatar}>{selectedSession.student.avatar}</Text>
                <View>
                  <Text style={styles.studentDetailName}>{selectedSession.student.name}</Text>
                  <Text style={styles.studentDetailLevel}>{selectedSession.student.level} Level</Text>
                </View>
              </View>
            </View>

            <View style={[styles.modalCard, advancedVisualEffects.glassmorphism.light]}>
              <Text style={styles.modalSectionTitle}>Session Details</Text>
              <View style={styles.modalDetailGrid}>
                <Text style={styles.modalDetailItem}>📅 {selectedSession.date}</Text>
                <Text style={styles.modalDetailItem}>⏰ {selectedSession.time}</Text>
                <Text style={styles.modalDetailItem}>⏱️ {selectedSession.duration} minutes</Text>
                <Text style={styles.modalDetailItem}>🏄‍♂️ {selectedSession.activity}</Text>
                <Text style={styles.modalDetailItem}>📍 {selectedSession.location}</Text>
                <Text style={styles.modalDetailItem}>💰 ${selectedSession.amount.toFixed(2)}</Text>
              </View>
            </View>

            {selectedSession.feedback && (
              <View style={[styles.modalCard, advancedVisualEffects.glassmorphism.light]}>
                <Text style={styles.modalSectionTitle}>Student Feedback</Text>
                <Text style={styles.feedbackText}>{selectedSession.feedback}</Text>
                {selectedSession.rating && (
                  <View style={styles.modalRating}>
                    <Text style={styles.modalRatingStars}>
                      {'⭐'.repeat(selectedSession.rating)}
                    </Text>
                    <Text style={styles.modalRatingText}>
                      {selectedSession.rating}/5 Stars
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const tabs = [
    { id: 'upcoming', title: 'Upcoming', icon: '📅', count: sessions.upcoming?.length || 0 },
    { id: 'inProgress', title: 'In Progress', icon: '🏄‍♂️', count: sessions.inProgress?.length || 0 },
    { id: 'completed', title: 'Completed', icon: '✅', count: sessions.completed?.length || 0 }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏄‍♂️ Session Management</Text>

      {renderAnalytics()}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
            {tab.count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Session List */}
      <ScrollView style={styles.sessionList} showsVerticalScrollIndicator={false}>
        {sessions[activeTab]?.map(renderSessionCard)}

        {(!sessions[activeTab] || sessions[activeTab].length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateText}>No {activeTab} sessions</Text>
            <Text style={styles.emptyStateSubtext}>
              {activeTab === 'upcoming'
                ? 'New bookings will appear here'
                : `No ${activeTab} sessions to display`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {renderSessionModal()}
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
  analyticsContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  analyticsTitle: {
    ...Typography.h3,
    color: Colors.text?.inverse || '#FFFFFF',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  analyticNumber: {
    ...Typography.h2,
    color: Colors.text?.inverse || '#FFFFFF',
    fontWeight: 'bold',
  },
  analyticLabel: {
    ...Typography.caption,
    color: Colors.text?.inverse || '#FFFFFF',
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background?.secondary || '#F5F5F5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: Colors.brand?.blue || '#007AFF',
    ...Shadows.sm,
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.text?.secondary || '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.text?.inverse || '#FFFFFF',
    fontWeight: 'bold',
  },
  tabBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.error || '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    ...Typography.caption,
    color: Colors.text?.inverse || '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionList: {
    flex: 1,
  },
  sessionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  studentName: {
    ...Typography.h4,
    color: Colors.text?.primary || '#000000',
  },
  studentLevel: {
    ...Typography.caption,
    color: Colors.text?.secondary || '#666666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background?.secondary || '#F5F5F5',
  },
  statusIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: 'bold',
  },
  sessionDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
    width: 20,
  },
  detailText: {
    ...Typography.body,
    color: Colors.text?.secondary || '#666666',
    flex: 1,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sessionAmount: {
    ...Typography.h4,
    color: Colors.success || '#34C759',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  ratingText: {
    ...Typography.caption,
    color: Colors.text?.secondary || '#666666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  confirmButton: {
    backgroundColor: Colors.success || '#34C759',
  },
  rescheduleButton: {
    backgroundColor: Colors.warning || '#FF9500',
  },
  actionButtonText: {
    ...Typography.button,
    color: Colors.text?.inverse || '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyStateText: {
    ...Typography.h3,
    color: Colors.text?.secondary || '#666666',
    marginBottom: Spacing.sm,
  },
  emptyStateSubtext: {
    ...Typography.body,
    color: Colors.text?.tertiary || '#999999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background?.primary || '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E5E5E5',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text?.primary || '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background?.secondary || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.text?.secondary || '#666666',
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  modalCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  modalSectionTitle: {
    ...Typography.h3,
    color: Colors.text?.primary || '#000000',
    marginBottom: Spacing.md,
  },
  studentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentDetailAvatar: {
    fontSize: 48,
    marginRight: Spacing.lg,
  },
  studentDetailName: {
    ...Typography.h3,
    color: Colors.text?.primary || '#000000',
  },
  studentDetailLevel: {
    ...Typography.body,
    color: Colors.text?.secondary || '#666666',
  },
  modalDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalDetailItem: {
    ...Typography.body,
    color: Colors.text?.secondary || '#666666',
    width: '50%',
    marginBottom: Spacing.sm,
  },
  feedbackText: {
    ...Typography.body,
    color: Colors.text?.secondary || '#666666',
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingStars: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  modalRatingText: {
    ...Typography.body,
    color: Colors.text?.primary || '#000000',
    fontWeight: 'bold',
  },
});

export default SessionManagementView;
