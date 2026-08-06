import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/AuthService';
import LoadingSpinner from '../LoadingSpinner';

const StudentRelationshipManager = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Students', icon: '👥' },
    { id: 'active', label: 'Active', icon: '🟢' },
    { id: 'frequent', label: 'Frequent', icon: '⭐' },
    { id: 'new', label: 'New', icon: '🆕' },
    { id: 'inactive', label: 'Inactive', icon: '😴' },
  ];

  useEffect(() => {
    loadStudents();
  }, [filterType]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);

      const response = await AuthService.apiRequest('/coach/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let filteredStudents = response.students || [];

      // Apply filters
      switch (filterType) {
        case 'active':
          filteredStudents = filteredStudents.filter(s => s.lastBooking &&
            new Date(s.lastBooking) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
          break;
        case 'frequent':
          filteredStudents = filteredStudents.filter(s => s.totalBookings >= 5);
          break;
        case 'new':
          filteredStudents = filteredStudents.filter(s => s.totalBookings <= 2);
          break;
        case 'inactive':
          filteredStudents = filteredStudents.filter(s => !s.lastBooking ||
            new Date(s.lastBooking) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));
          break;
      }

      setStudents(filteredStudents);
    } catch (error) {
      console.error('Failed to load students:', error);
      Alert.alert('Error', 'Failed to load student data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStudents();
    setIsRefreshing(false);
  };

  const addStudentNote = async () => {
    if (!newNote.trim() || !selectedStudent) return;

    try {
      await AuthService.apiRequest('/coach/student-notes', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.id,
          note: newNote.trim(),
        }),
      });

      // Refresh student data
      const updatedStudent = { ...selectedStudent };
      if (!updatedStudent.notes) updatedStudent.notes = [];
      updatedStudent.notes.unshift({
        id: Date.now().toString(),
        content: newNote.trim(),
        createdAt: new Date().toISOString(),
      });

      setSelectedStudent(updatedStudent);
      setNewNote('');
      setShowNoteModal(false);

      Alert.alert('Success', 'Note added successfully!');
    } catch (error) {
      console.error('Failed to add note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const sendMessage = (student) => {
    Alert.alert(
      'Send Message',
      `Send a message to ${student.firstName} ${student.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Message',
          onPress: () => {
            // Navigate to chat or open messaging interface
            console.log('Opening chat with student:', student.id);
          }
        }
      ]
    );
  };

  const getStudentStatus = (student) => {
    if (!student.lastBooking) return { status: 'new', color: Colors.primary[500], icon: '🆕' };

    const daysSinceLastBooking = Math.floor(
      (new Date() - new Date(student.lastBooking)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastBooking <= 7) return { status: 'active', color: Colors.success[500], icon: '🟢' };
    if (daysSinceLastBooking <= 30) return { status: 'recent', color: Colors.warning[500], icon: '🟡' };
    return { status: 'inactive', color: Colors.neutral[400], icon: '😴' };
  };

  const getStudentLevel = (totalBookings) => {
    if (totalBookings >= 20) return { level: 'Expert', color: Colors.purple[500], icon: '🏆' };
    if (totalBookings >= 10) return { level: 'Advanced', color: Colors.ocean[500], icon: '⭐' };
    if (totalBookings >= 5) return { level: 'Intermediate', color: Colors.flowcrew.gradientStart, icon: '📈' };
    return { level: 'Beginner', color: Colors.neutral[400], icon: '🌱' };
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              filterType === filter.id && styles.filterTabActive,
            ]}
            onPress={() => setFilterType(filter.id)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterTabText,
              filterType === filter.id && styles.filterTabTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStudentCard = (student) => {
    const status = getStudentStatus(student);
    const level = getStudentLevel(student.totalBookings);

    return (
      <TouchableOpacity
        key={student.id}
        style={styles.studentCard}
        onPress={() => {
          setSelectedStudent(student);
          setShowStudentDetails(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.studentHeader}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentInitials}>
              {student.firstName?.[0]}{student.lastName?.[0]}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {student.firstName} {student.lastName}
            </Text>
            <Text style={styles.studentEmail}>{student.email}</Text>

            <View style={styles.studentBadges}>
              <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
                <Text style={styles.badgeIcon}>{status.icon}</Text>
                <Text style={[styles.badgeText, { color: status.color }]}>
                  {status.status}
                </Text>
              </View>

              <View style={[styles.badge, { backgroundColor: level.color + '20' }]}>
                <Text style={styles.badgeIcon}>{level.icon}</Text>
                <Text style={[styles.badgeText, { color: level.color }]}>
                  {level.level}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.studentStats}>
            <Text style={styles.statNumber}>{student.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>

        <View style={styles.studentFooter}>
          <View style={styles.lastBooking}>
            <Text style={styles.lastBookingLabel}>Last session:</Text>
            <Text style={styles.lastBookingDate}>
              {student.lastBooking
                ? new Date(student.lastBooking).toLocaleDateString()
                : 'Never'
              }
            </Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => sendMessage(student)}
            >
              <Text style={styles.quickActionIcon}>💬</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setSelectedStudent(student);
                setShowNoteModal(true);
              }}
            >
              <Text style={styles.quickActionIcon}>📝</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStudentDetailsModal = () => (
    <Modal
      visible={showStudentDetails}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowStudentDetails(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Student Details</Text>
          <TouchableOpacity
            onPress={() => sendMessage(selectedStudent)}
            style={styles.messageButton}
          >
            <Text style={styles.messageButtonText}>💬 Message</Text>
          </TouchableOpacity>
        </View>

        {selectedStudent && (
          <ScrollView style={styles.modalContent}>
            {/* Student Overview */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.overviewCard}>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewNumber}>{selectedStudent.totalBookings || 0}</Text>
                  <Text style={styles.overviewLabel}>Total Sessions</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewNumber}>
                    ${((selectedStudent.totalSpent || 0) / 100).toFixed(0)}
                  </Text>
                  <Text style={styles.overviewLabel}>Total Spent</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewNumber}>
                    {selectedStudent.averageRating || 'N/A'}
                  </Text>
                  <Text style={styles.overviewLabel}>Avg Rating</Text>
                </View>
              </View>
            </View>

            {/* Recent Bookings */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              {selectedStudent.recentBookings?.length > 0 ? (
                selectedStudent.recentBookings.map((booking) => (
                  <View key={booking.id} style={styles.bookingItem}>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingActivity}>{booking.activity}</Text>
                      <Text style={styles.bookingDate}>
                        {new Date(booking.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.bookingStatus}>{booking.status}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No recent sessions</Text>
              )}
            </View>

            {/* Notes */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TouchableOpacity
                  style={styles.addNoteButton}
                  onPress={() => setShowNoteModal(true)}
                >
                  <Text style={styles.addNoteText}>+ Add Note</Text>
                </TouchableOpacity>
              </View>

              {selectedStudent.notes?.length > 0 ? (
                selectedStudent.notes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Text style={styles.noteContent}>{note.content}</Text>
                    <Text style={styles.noteDate}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No notes yet</Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderNoteModal = () => (
    <Modal
      visible={showNoteModal}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <View style={styles.noteModalContainer}>
        <View style={styles.noteModalHeader}>
          <TouchableOpacity
            onPress={() => {
              setShowNoteModal(false);
              setNewNote('');
            }}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Note</Text>
          <TouchableOpacity
            onPress={addStudentNote}
            style={styles.saveNoteButton}
            disabled={!newNote.trim()}
          >
            <Text style={[
              styles.saveNoteText,
              !newNote.trim() && styles.saveNoteTextDisabled
            ]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noteModalContent}>
          <Text style={styles.noteModalLabel}>
            Note for {selectedStudent?.firstName} {selectedStudent?.lastName}
          </Text>
          <TextInput
            style={styles.noteInput}
            value={newNote}
            onChangeText={setNewNote}
            placeholder="Add a note about this student..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            autoFocus
          />
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading students..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Students</Text>
        <Text style={styles.headerSubtitle}>
          {students.length} student{students.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Students List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateTitle}>No students found</Text>
            <Text style={styles.emptyStateText}>
              Students will appear here after they book sessions with you
            </Text>
          </View>
        ) : (
          <View style={styles.studentsList}>
            {students.map(renderStudentCard)}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderStudentDetailsModal()}
      {renderNoteModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.flowcrew.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.background,
  },
  header: {
    backgroundColor: Colors.flowcrew.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    ...AdvancedShadows.subtleDepth,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  filterContainer: {
    backgroundColor: Colors.flowcrew.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
  },
  filterTabActive: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  filterIcon: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.xs,
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  filterTabTextActive: {
    color: Colors.flowcrew.white,
  },
  content: {
    flex: 1,
  },
  studentsList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  studentCard: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...AdvancedShadows.floating,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.flowcrew.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  studentInitials: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.white,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  studentEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  studentBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
  badgeIcon: {
    fontSize: Typography.fontSize.sm,
    marginRight: Spacing.xs / 2,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  studentStats: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.gradientStart,
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  studentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastBooking: {
    flex: 1,
  },
  lastBookingLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
  },
  lastBookingDate: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: Typography.fontSize.base,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: Typography.fontSize['3xl'],
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.flowcrew.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.flowcrew.white,
    ...AdvancedShadows.subtleDepth,
  },
  modalCloseButton: {
    paddingVertical: Spacing.sm,
  },
  modalCloseText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  messageButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  messageButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.white,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  detailSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addNoteButton: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  addNoteText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...AdvancedShadows.subtleDepth,
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.gradientStart,
    marginBottom: Spacing.xs / 2,
  },
  overviewLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...AdvancedShadows.subtleDepth,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingActivity: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  bookingDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  bookingStatus: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.gradientStart,
  },
  noteItem: {
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...AdvancedShadows.subtleDepth,
  },
  noteContent: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  noteDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  noDataText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: Spacing.lg,
  },
  noteModalContainer: {
    flex: 1,
    backgroundColor: Colors.flowcrew.background,
  },
  noteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.flowcrew.white,
    ...AdvancedShadows.subtleDepth,
  },
  saveNoteButton: {
    paddingVertical: Spacing.sm,
  },
  saveNoteText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.gradientStart,
  },
  saveNoteTextDisabled: {
    color: Colors.text.tertiary,
  },
  noteModalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  noteModalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  noteInput: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    minHeight: 120,
    ...AdvancedShadows.subtleDepth,
  },
});

export default StudentRelationshipManager;
