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
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/AuthService';
import LoadingSpinner from '../LoadingSpinner';

const BookingManagement = () => {
  const { user, isCoach } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  const filters = [
    { id: 'upcoming', label: 'Upcoming', count: 0 },
    { id: 'today', label: 'Today', count: 0 },
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'completed', label: 'Completed', count: 0 },
    { id: 'cancelled', label: 'Cancelled', count: 0 },
  ];

  useEffect(() => {
    if (isCoach) {
      loadBookings();
    }
  }, [selectedFilter, isCoach]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);

      const filterParams = {
        status: selectedFilter === 'upcoming' ? 'confirmed' : selectedFilter,
        coach_id: user.id,
      };

      if (selectedFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filterParams.date = today;
        delete filterParams.status;
      } else if (selectedFilter === 'upcoming') {
        filterParams.date_from = new Date().toISOString().split('T')[0];
      }

      const response = await AuthService.getBookings(filterParams);
      setBookings(response.bookings || []);

      // Update filter counts
      updateFilterCounts(response.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilterCounts = (allBookings) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    filters.forEach(filter => {
      switch (filter.id) {
        case 'upcoming':
          filter.count = allBookings.filter(b =>
            b.status === 'confirmed' && new Date(b.booking_date) >= now
          ).length;
          break;
        case 'today':
          filter.count = allBookings.filter(b =>
            b.booking_date === today
          ).length;
          break;
        case 'pending':
          filter.count = allBookings.filter(b =>
            b.status === 'pending'
          ).length;
          break;
        case 'completed':
          filter.count = allBookings.filter(b =>
            b.status === 'completed'
          ).length;
          break;
        case 'cancelled':
          filter.count = allBookings.filter(b =>
            b.status === 'cancelled'
          ).length;
          break;
      }
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBookings();
    setIsRefreshing(false);
  };

  const handleBookingAction = async (booking, action) => {
    try {
      let confirmMessage = '';
      let successMessage = '';

      switch (action) {
        case 'confirm':
          confirmMessage = 'Confirm this booking?';
          successMessage = 'Booking confirmed successfully!';
          break;
        case 'cancel':
          confirmMessage = 'Cancel this booking? The student will be notified.';
          successMessage = 'Booking cancelled successfully!';
          break;
        case 'complete':
          confirmMessage = 'Mark this session as completed?';
          successMessage = 'Session marked as completed!';
          break;
        case 'no_show':
          confirmMessage = 'Mark student as no-show?';
          successMessage = 'Booking marked as no-show!';
          break;
      }

      Alert.alert(
        'Confirm Action',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                await AuthService.updateBooking(booking.id, { status: action });
                Alert.alert('Success', successMessage);
                loadBookings();
              } catch (error) {
                Alert.alert('Error', 'Failed to update booking');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process booking action');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: Colors.warning[500],
      confirmed: Colors.flowcrew.gradientStart,
      completed: Colors.success[500],
      cancelled: Colors.error[500],
      no_show: Colors.neutral[500],
    };
    return colors[status] || Colors.neutral[400];
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      completed: '🎉',
      cancelled: '❌',
      no_show: '👻',
    };
    return icons[status] || '❓';
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              selectedFilter === filter.id && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.id && styles.filterTabTextActive,
            ]}>
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filter.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBookingCard = (booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => {
        setSelectedBooking(booking);
        setShowBookingDetails(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingStatus}>
          <Text style={styles.statusIcon}>{getStatusIcon(booking.status)}</Text>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(booking.status) }
          ]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.bookingTime}>
          {formatDate(booking.booking_date)} • {formatTime(booking.start_time)}
        </Text>
      </View>

      <View style={styles.bookingContent}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {booking.student?.first_name} {booking.student?.last_name}
          </Text>
          <Text style={styles.activityName}>{booking.activity}</Text>
          <Text style={styles.duration}>{booking.duration_minutes} minutes</Text>
        </View>

        <View style={styles.bookingAmount}>
          <Text style={styles.amountText}>
            ${(booking.coach_amount / 100).toFixed(2)}
          </Text>
          <Text style={styles.amountLabel}>Your earnings</Text>
        </View>
      </View>

      <View style={styles.locationInfo}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{booking.location_name}</Text>
      </View>

      {booking.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleBookingAction(booking, 'confirm')}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleBookingAction(booking, 'cancel')}
          >
            <Text style={styles.cancelButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'confirmed' && new Date(booking.booking_date) <= new Date() && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleBookingAction(booking, 'complete')}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.noShowButton]}
            onPress={() => handleBookingAction(booking, 'no_show')}
          >
            <Text style={styles.noShowButtonText}>No Show</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📅</Text>
      <Text style={styles.emptyStateTitle}>No bookings found</Text>
      <Text style={styles.emptyStateText}>
        {selectedFilter === 'upcoming'
          ? 'You have no upcoming bookings'
          : `No ${selectedFilter} bookings to show`}
      </Text>
    </View>
  );

  if (!isCoach) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Booking management is only available for coaches
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading bookings..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Bookings List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map(renderBookingCard)}
          </View>
        )}
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={showBookingDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setShowBookingDetails(false)}
            onAction={handleBookingAction}
          />
        )}
      </Modal>
    </View>
  );
};

// Booking Details Modal Component (simplified for space)
const BookingDetailsModal = ({ booking, onClose, onAction }) => (
  <View style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
        <Text style={styles.modalCloseText}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle}>Booking Details</Text>
      <View style={styles.placeholder} />
    </View>

    <ScrollView style={styles.modalContent}>
      <Text style={styles.modalBookingId}>Booking #{booking.id.slice(-8)}</Text>
      {/* Add more booking details here */}
    </ScrollView>
  </View>
);

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
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.flowcrew.white,
    ...AdvancedShadows.subtleDepth,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: Typography.fontSize.lg,
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
  },
  filterTabActive: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  filterTabTextActive: {
    color: Colors.flowcrew.white,
  },
  filterBadge: {
    backgroundColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs / 2,
    marginLeft: Spacing.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.white,
  },
  content: {
    flex: 1,
  },
  bookingsList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  bookingCard: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...AdvancedShadows.floating,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  bookingTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  bookingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
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
  activityName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
  },
  duration: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  bookingAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.gradientStart,
    marginBottom: Spacing.xs / 2,
  },
  amountLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationIcon: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.sm,
  },
  locationText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  confirmButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.white,
  },
  cancelButton: {
    backgroundColor: Colors.error[100],
    borderWidth: 1,
    borderColor: Colors.error[300],
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error[600],
  },
  completeButton: {
    backgroundColor: Colors.success[500],
  },
  completeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.white,
  },
  noShowButton: {
    backgroundColor: Colors.neutral[200],
  },
  noShowButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  modalBookingId: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
});

export default BookingManagement;
