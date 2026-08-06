import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentService } from '../../services/PaymentService';
import LoadingSpinner from '../LoadingSpinner';
import CalendarScheduler from '../CalendarScheduler';
import PaymentMethodSelector from './PaymentMethodSelector';
import BookingConfirmation from './BookingConfirmation';

const BOOKING_STEPS = [
  { id: 'coach_selection', title: 'Select Coach', icon: '👨‍🏫' },
  { id: 'date_time', title: 'Date & Time', icon: '📅' },
  { id: 'activity_details', title: 'Activity Details', icon: '🏄‍♂️' },
  { id: 'payment', title: 'Payment', icon: '💳' },
  { id: 'confirmation', title: 'Confirmation', icon: '✅' },
];

const GuidedBookingFlow = ({
  selectedCoach,
  onComplete,
  onCancel,
  initialStep = 'coach_selection'
}) => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [bookingData, setBookingData] = useState({
    coach: selectedCoach,
    date: null,
    time: null,
    activity: null,
    duration: 60, // minutes
    location: null,
    notes: '',
    paymentMethod: null,
    totalAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (selectedCoach) {
      setBookingData(prev => ({
        ...prev,
        coach: selectedCoach,
        totalAmount: selectedCoach.hourlyRate * 100, // Convert to cents
      }));
    }
  }, [selectedCoach]);

  useEffect(() => {
    if (currentStep === 'payment') {
      loadPaymentMethods();
    }
  }, [currentStep]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await PaymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const getCurrentStepIndex = () => {
    return BOOKING_STEPS.findIndex(step => step.id === currentStep);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 'coach_selection':
        return !!bookingData.coach;
      case 'date_time':
        return !!(bookingData.date && bookingData.time);
      case 'activity_details':
        return !!(bookingData.activity && bookingData.location);
      case 'payment':
        return !!bookingData.paymentMethod;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (!canProceedToNextStep()) return;

    const currentIndex = getCurrentStepIndex();
    if (currentIndex < BOOKING_STEPS.length - 1) {
      setCurrentStep(BOOKING_STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(BOOKING_STEPS[currentIndex - 1].id);
    }
  };

  const updateBookingData = (updates) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const handleDateTimeSelection = (date, time) => {
    updateBookingData({ date, time });
    setShowCalendar(false);
    goToNextStep();
  };

  const handleActivitySelection = (activity, location, duration = 60) => {
    const totalAmount = (bookingData.coach.hourlyRate * (duration / 60)) * 100; // Convert to cents
    updateBookingData({
      activity,
      location,
      duration,
      totalAmount
    });
    goToNextStep();
  };

  const handlePaymentMethodSelection = (paymentMethod) => {
    updateBookingData({ paymentMethod });
    goToNextStep();
  };

  const processBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to complete your booking.');
      return;
    }

    setIsLoading(true);
    try {
      // Create booking
      const booking = await PaymentService.processBookingPayment(
        bookingData.coach.id,
        {
          date: bookingData.date,
          time: bookingData.time,
          activity: bookingData.activity,
          duration: bookingData.duration,
          location: bookingData.location,
          notes: bookingData.notes,
          total_amount: bookingData.totalAmount,
        },
        bookingData.paymentMethod.id
      );

      setCurrentStep('confirmation');
      onComplete?.(booking);
    } catch (error) {
      Alert.alert('Booking Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {BOOKING_STEPS.map((step, index) => {
          const isActive = index <= getCurrentStepIndex();
          const isCurrent = step.id === currentStep;

          return (
            <View key={step.id} style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                isActive && styles.progressDotActive,
                isCurrent && styles.progressDotCurrent,
              ]}>
                <Text style={[
                  styles.progressIcon,
                  isActive && styles.progressIconActive,
                ]}>
                  {step.icon}
                </Text>
              </View>
              <Text style={[
                styles.progressLabel,
                isActive && styles.progressLabelActive,
              ]}>
                {step.title}
              </Text>
              {index < BOOKING_STEPS.length - 1 && (
                <View style={[
                  styles.progressLine,
                  isActive && styles.progressLineActive,
                ]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderCoachSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Selected Coach</Text>
      {bookingData.coach ? (
        <View style={styles.coachCard}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachEmoji}>🏄‍♂️</Text>
          </View>
          <View style={styles.coachInfo}>
            <Text style={styles.coachName}>{bookingData.coach.name}</Text>
            <Text style={styles.coachSpecialty}>
              {bookingData.coach.specialties?.[0] || 'Water Sports Coach'}
            </Text>
            <Text style={styles.coachRate}>
              ${bookingData.coach.hourlyRate}/hour
            </Text>
          </View>
          <View style={styles.coachRating}>
            <Text style={styles.ratingText}>⭐ {bookingData.coach.rating || 4.8}</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.selectCoachButton}>
          <Text style={styles.selectCoachText}>Select a Coach</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDateTimeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      {bookingData.date && bookingData.time ? (
        <View style={styles.selectedDateTime}>
          <Text style={styles.selectedDateText}>
            📅 {new Date(bookingData.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.selectedTimeText}>
            🕐 {bookingData.time}
          </Text>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={styles.selectButtonText}>Select Date & Time</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderActivityDetails = () => {
    const activities = [
      { id: 'surfing', name: 'Surfing Lesson', duration: 60, icon: '🏄‍♂️' },
      { id: 'sup', name: 'SUP Lesson', duration: 60, icon: '🏄‍♀️' },
      { id: 'kitesurfing', name: 'Kitesurfing Lesson', duration: 90, icon: '🪁' },
      { id: 'windsurfing', name: 'Windsurfing Lesson', duration: 90, icon: '⛵' },
    ];

    const locations = [
      { id: 'beach1', name: 'Main Beach', address: '123 Ocean Ave' },
      { id: 'beach2', name: 'North Shore', address: '456 Surf St' },
      { id: 'beach3', name: 'South Bay', address: '789 Wave Rd' },
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Activity Details</Text>

        <Text style={styles.sectionTitle}>Choose Activity</Text>
        <View style={styles.optionsGrid}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.optionCard,
                bookingData.activity?.id === activity.id && styles.optionCardSelected,
              ]}
              onPress={() => updateBookingData({ activity })}
            >
              <Text style={styles.optionIcon}>{activity.icon}</Text>
              <Text style={styles.optionName}>{activity.name}</Text>
              <Text style={styles.optionDuration}>{activity.duration} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Choose Location</Text>
        <View style={styles.locationsList}>
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationCard,
                bookingData.location?.id === location.id && styles.locationCardSelected,
              ]}
              onPress={() => updateBookingData({ location })}
            >
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationAddress}>{location.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPaymentSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment</Text>

      <View style={styles.bookingSummary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Activity:</Text>
          <Text style={styles.summaryValue}>{bookingData.activity?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{bookingData.duration} minutes</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Coach:</Text>
          <Text style={styles.summaryValue}>{bookingData.coach?.name}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            {PaymentService.formatCurrency(bookingData.totalAmount)}
          </Text>
        </View>
      </View>

      <PaymentMethodSelector
        paymentMethods={paymentMethods}
        selectedMethod={bookingData.paymentMethod}
        onSelect={handlePaymentMethodSelection}
        onAddNew={() => {/* Navigate to add payment method */}}
      />
    </View>
  );

  const renderConfirmation = () => (
    <BookingConfirmation
      bookingData={bookingData}
      onComplete={onComplete}
    />
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'coach_selection':
        return renderCoachSelection();
      case 'date_time':
        return renderDateTimeSelection();
      case 'activity_details':
        return renderActivityDetails();
      case 'payment':
        return renderPaymentSelection();
      case 'confirmation':
        return renderConfirmation();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Processing your booking..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      {currentStep !== 'confirmation' && (
        <View style={styles.navigationButtons}>
          {getCurrentStepIndex() > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={goToPreviousStep}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceedToNextStep() && styles.nextButtonDisabled,
            ]}
            onPress={currentStep === 'payment' ? processBooking : goToNextStep}
            disabled={!canProceedToNextStep()}
          >
            <Text style={[
              styles.nextButtonText,
              !canProceedToNextStep() && styles.nextButtonTextDisabled,
            ]}>
              {currentStep === 'payment' ? 'Complete Booking' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <CalendarScheduler
          coach={bookingData.coach}
          onBookingConfirm={(details) => {
            handleDateTimeSelection(details.date, details.time);
          }}
          onClose={() => setShowCalendar(false)}
        />
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.flowcrew.white,
    ...AdvancedShadows.subtleDepth,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    backgroundColor: Colors.flowcrew.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  progressDotActive: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  progressDotCurrent: {
    backgroundColor: Colors.flowcrew.gradientEnd,
  },
  progressIcon: {
    fontSize: Typography.fontSize.base,
  },
  progressIconActive: {
    fontSize: Typography.fontSize.base,
  },
  progressLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: Colors.neutral[200],
    zIndex: -1,
  },
  progressLineActive: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...AdvancedShadows.subtleDepth,
  },
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  coachEmoji: {
    fontSize: Typography.fontSize['2xl'],
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  coachSpecialty: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
  },
  coachRate: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.gradientStart,
  },
  coachRating: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  selectCoachButton: {
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    borderStyle: 'dashed',
  },
  selectCoachText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  selectedDateTime: {
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...AdvancedShadows.subtleDepth,
  },
  selectedDateText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  selectedTimeText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  changeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.lg,
  },
  changeButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.medium,
  },
  selectButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.white,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    width: '48%',
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    ...AdvancedShadows.subtleDepth,
  },
  optionCardSelected: {
    borderColor: Colors.flowcrew.gradientStart,
    backgroundColor: Colors.primary[50],
  },
  optionIcon: {
    fontSize: Typography.fontSize['2xl'],
    marginBottom: Spacing.sm,
  },
  optionName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  optionDuration: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  locationsList: {
    gap: Spacing.sm,
  },
  locationCard: {
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    ...AdvancedShadows.subtleDepth,
  },
  locationCardSelected: {
    borderColor: Colors.flowcrew.gradientStart,
    backgroundColor: Colors.primary[50],
  },
  locationName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  locationAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  bookingSummary: {
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...AdvancedShadows.subtleDepth,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.gradientStart,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.flowcrew.white,
    gap: Spacing.md,
    ...AdvancedShadows.subtleDepth,
  },
  backButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  nextButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  nextButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.white,
  },
  nextButtonTextDisabled: {
    color: Colors.text.tertiary,
  },
});

export default GuidedBookingFlow;
