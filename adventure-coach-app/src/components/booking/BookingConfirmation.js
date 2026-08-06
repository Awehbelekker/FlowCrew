import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { PaymentService } from '../../services/PaymentService';
import { useAuth } from '../../contexts/AuthContext';

const BookingConfirmation = ({ bookingData, onComplete }) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Send confirmation notifications
    sendConfirmationNotifications();
  }, []);

  const sendConfirmationNotifications = async () => {
    try {
      // This would typically be handled by the backend
      console.log('Sending confirmation notifications...');
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  };

  const handleShareBooking = async () => {
    try {
      const shareContent = {
        message: `🏄‍♂️ Booked a ${bookingData.activity?.name} session with ${bookingData.coach?.name}!\n\n📅 ${formatDate(bookingData.date)} at ${bookingData.time}\n📍 ${bookingData.location?.name}\n\nSee you on the water! 🌊`,
        title: 'FlowCrew Booking Confirmation',
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Failed to share booking:', error);
    }
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Add to Calendar',
      'This feature will integrate with your device calendar to add the booking.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => console.log('Adding to calendar...') }
      ]
    );
  };

  const handleContactCoach = () => {
    Alert.alert(
      'Contact Coach',
      'Would you like to send a message to your coach?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message', onPress: () => console.log('Opening chat...') }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const renderSuccessHeader = () => (
    <View style={styles.successHeader}>
      <View style={styles.successIcon}>
        <Text style={styles.successEmoji}>🎉</Text>
      </View>
      <Text style={styles.successTitle}>Booking Confirmed!</Text>
      <Text style={styles.successSubtitle}>
        Your session has been booked successfully
      </Text>
    </View>
  );

  const renderBookingDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Booking Details</Text>

      <View style={styles.detailsCard}>
        {/* Activity */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailEmoji}>🏄‍♂️</Text>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Activity</Text>
            <Text style={styles.detailValue}>{bookingData.activity?.name}</Text>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailEmoji}>📅</Text>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {formatDate(bookingData.date)}
            </Text>
            <Text style={styles.detailSubvalue}>
              {formatTime(bookingData.time)} ({bookingData.duration} minutes)
            </Text>
          </View>
        </View>

        {/* Coach */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailEmoji}>👨‍🏫</Text>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Coach</Text>
            <Text style={styles.detailValue}>{bookingData.coach?.name}</Text>
            <Text style={styles.detailSubvalue}>
              ⭐ {bookingData.coach?.rating || 4.8} • {bookingData.coach?.reviewCount || 0} reviews
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailEmoji}>📍</Text>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{bookingData.location?.name}</Text>
            <Text style={styles.detailSubvalue}>{bookingData.location?.address}</Text>
          </View>
        </View>

        {/* Payment */}
        <View style={[styles.detailRow, styles.paymentRow]}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailEmoji}>💳</Text>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Total Paid</Text>
            <Text style={[styles.detailValue, styles.paymentValue]}>
              {PaymentService.formatCurrency(bookingData.totalAmount)}
            </Text>
            <Text style={styles.detailSubvalue}>
              Paid with {bookingData.paymentMethod?.card?.brand?.toUpperCase()}
              •••• {bookingData.paymentMethod?.card?.last4}
            </Text>
          </View>
        </View>
      </View>

      {/* Expandable Details */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setShowDetails(!showDetails)}
      >
        <Text style={styles.expandButtonText}>
          {showDetails ? 'Hide' : 'Show'} Additional Details
        </Text>
        <Text style={styles.expandIcon}>
          {showDetails ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.additionalDetails}>
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Booking ID:</Text>
            <Text style={styles.additionalDetailValue}>
              #{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </Text>
          </View>
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Booked by:</Text>
            <Text style={styles.additionalDetailValue}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Booking time:</Text>
            <Text style={styles.additionalDetailValue}>
              {new Date().toLocaleString()}
            </Text>
          </View>
          {bookingData.notes && (
            <View style={styles.additionalDetailRow}>
              <Text style={styles.additionalDetailLabel}>Notes:</Text>
              <Text style={styles.additionalDetailValue}>{bookingData.notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddToCalendar}
        >
          <Text style={styles.actionEmoji}>📅</Text>
          <Text style={styles.actionText}>Add to Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleContactCoach}
        >
          <Text style={styles.actionEmoji}>💬</Text>
          <Text style={styles.actionText}>Message Coach</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareBooking}
        >
          <Text style={styles.actionEmoji}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImportantInfo = () => (
    <View style={styles.infoContainer}>
      <Text style={styles.sectionTitle}>Important Information</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Text style={styles.infoEmoji}>⏰</Text>
          <Text style={styles.infoText}>
            Please arrive 15 minutes early for equipment setup and safety briefing.
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoEmoji}>🌊</Text>
          <Text style={styles.infoText}>
            Check weather conditions before your session. We'll notify you of any changes.
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoEmoji}>📱</Text>
          <Text style={styles.infoText}>
            You'll receive SMS and email reminders 24 hours and 2 hours before your session.
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoEmoji}>🔄</Text>
          <Text style={styles.infoText}>
            Free cancellation up to 24 hours before your session starts.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderSuccessHeader()}
      {renderBookingDetails()}
      {renderActionButtons()}
      {renderImportantInfo()}

      <TouchableOpacity
        style={styles.doneButton}
        onPress={onComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.flowcrew.background,
  },
  successHeader: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.flowcrew.white,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successEmoji: {
    fontSize: Typography.fontSize['3xl'],
  },
  successTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  detailsContainer: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  detailsCard: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...AdvancedShadows.subtleDepth,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  paymentRow: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  detailEmoji: {
    fontSize: Typography.fontSize.lg,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  paymentValue: {
    color: Colors.flowcrew.gradientStart,
  },
  detailSubvalue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  expandButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.medium,
    marginRight: Spacing.sm,
  },
  expandIcon: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
  },
  additionalDetails: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  additionalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  additionalDetailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  additionalDetailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  actionsContainer: {
    padding: Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...AdvancedShadows.subtleDepth,
  },
  actionEmoji: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  infoContainer: {
    padding: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...AdvancedShadows.subtleDepth,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  infoEmoji: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.md,
    marginTop: Spacing.xs / 2,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  doneButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...AdvancedShadows.floating,
  },
  doneButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.white,
  },
});

export default BookingConfirmation;
