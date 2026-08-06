import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { AuthService } from '../../services/AuthService';
import LoadingSpinner from '../LoadingSpinner';

const EnhancedCalendarScheduler = ({
  coach,
  onBookingConfirm,
  onClose,
  selectedActivity,
  duration = 60 // minutes
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [conflictingBookings, setConflictingBookings] = useState([]);

  useEffect(() => {
    loadAvailability();
  }, [coach?.id]);

  const loadAvailability = async () => {
    if (!coach?.id) return;

    try {
      setIsLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // Load 30 days

      const availabilityData = await AuthService.getCoachAvailability(
        coach.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setAvailability(availabilityData.availability || {});
      setConflictingBookings(availabilityData.bookings || []);
    } catch (error) {
      console.error('Failed to load availability:', error);
      Alert.alert('Error', 'Failed to load coach availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAvailability();
    setIsRefreshing(false);
  };

  // Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots based on coach's schedule
  const generateTimeSlots = (date) => {
    if (!date || !coach?.availability?.weeklySchedule) {
      return [];
    }

    const dayOfWeek = date.getDay();
    const daySchedule = coach.availability.weeklySchedule[dayOfWeek] || [];
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability[dateString] || {};

    const slots = [];

    // Generate slots based on coach's schedule
    daySchedule.forEach(period => {
      const startHour = period === 'morning' ? 8 : period === 'afternoon' ? 14 : 18;
      const endHour = period === 'morning' ? 12 : period === 'afternoon' ? 18 : 20;

      for (let hour = startHour; hour < endHour; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, 0, 0, 0);

        // Check if slot is in the past
        const isPast = slotDateTime < new Date();

        // Check if slot is blocked
        const isBlocked = coach.availability?.blockedDates?.includes(dateString);

        // Check availability from API
        const isAvailable = dayAvailability[timeString] !== false;

        // Check for conflicts
        const hasConflict = conflictingBookings.some(booking => {
          const bookingDate = new Date(booking.date);
          const bookingTime = booking.time;
          return bookingDate.toDateString() === date.toDateString() &&
            bookingTime === timeString;
        });

        slots.push({
          time: timeString,
          label: formatTime(timeString),
          available: !isPast && !isBlocked && isAvailable && !hasConflict,
          isPast,
          isBlocked,
          hasConflict,
          conflictReason: hasConflict ? 'Already booked' : null,
        });
      }
    });

    return slots;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      dayName: days[date.getDay()],
      dayNumber: date.getDate(),
      monthName: months[date.getMonth()],
      fullDate: date.toDateString(),
    };
  };

  const isDateAvailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const isBlocked = coach?.availability?.blockedDates?.includes(dateString);
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    const hasAvailableSlots = generateTimeSlots(date).some(slot => slot.available);

    return !isPast && !isBlocked && hasAvailableSlots;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection
  };

  const handleTimeSelect = (timeSlot) => {
    if (!timeSlot.available) {
      Alert.alert(
        'Time Unavailable',
        timeSlot.conflictReason || 'This time slot is not available'
      );
      return;
    }
    setSelectedTime(timeSlot.time);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Selection Required', 'Please select both date and time');
      return;
    }

    const bookingDetails = {
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      coach: coach,
      activity: selectedActivity,
      duration: duration,
    };

    onBookingConfirm(bookingDetails);
  };

  const dates = generateDates();
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading availability..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Coach Info */}
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{coach?.name}</Text>
        <Text style={styles.activityInfo}>
          {selectedActivity?.name} • {duration} minutes
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesContainer}>
              {dates.map((date, index) => {
                const dateInfo = formatDate(date);
                const isAvailable = isDateAvailable(date);
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardSelected,
                      !isAvailable && styles.dateCardDisabled,
                      isToday && styles.dateCardToday,
                    ]}
                    onPress={() => isAvailable && handleDateSelect(date)}
                    disabled={!isAvailable}
                  >
                    <Text style={[
                      styles.dayName,
                      isSelected && styles.dayNameSelected,
                      !isAvailable && styles.dayNameDisabled,
                    ]}>
                      {dateInfo.dayName}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      isSelected && styles.dayNumberSelected,
                      !isAvailable && styles.dayNumberDisabled,
                    ]}>
                      {dateInfo.dayNumber}
                    </Text>
                    <Text style={[
                      styles.monthName,
                      isSelected && styles.monthNameSelected,
                      !isAvailable && styles.monthNameDisabled,
                    ]}>
                      {dateInfo.monthName}
                    </Text>
                    {isToday && (
                      <View style={styles.todayIndicator}>
                        <Text style={styles.todayText}>Today</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Time Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Times - {formatDate(selectedDate).fullDate}
            </Text>

            {timeSlots.length === 0 ? (
              <View style={styles.noSlotsContainer}>
                <Text style={styles.noSlotsText}>No available time slots</Text>
                <Text style={styles.noSlotsSubtext}>
                  Please select a different date
                </Text>
              </View>
            ) : (
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      selectedTime === slot.time && styles.timeSlotSelected,
                      !slot.available && styles.timeSlotDisabled,
                    ]}
                    onPress={() => handleTimeSelect(slot)}
                    disabled={!slot.available}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === slot.time && styles.timeSlotTextSelected,
                      !slot.available && styles.timeSlotTextDisabled,
                    ]}>
                      {slot.label}
                    </Text>
                    {!slot.available && slot.conflictReason && (
                      <Text style={styles.conflictText}>{slot.conflictReason}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Buffer Time Notice */}
        {coach?.availability?.bufferTime && (
          <View style={styles.bufferNotice}>
            <Text style={styles.bufferNoticeText}>
              ℹ️ {coach.availability.bufferTime} minute buffer between sessions
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      {selectedDate && selectedTime && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>
              Confirm {formatDate(selectedDate).dayName}, {formatDate(selectedDate).monthName} {formatDate(selectedDate).dayNumber} at {formatTime(selectedTime)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  coachInfo: {
    backgroundColor: Colors.flowcrew.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  coachName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  activityInfo: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  datesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  dateCard: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    ...AdvancedShadows.subtleDepth,
  },
  dateCardSelected: {
    borderColor: Colors.flowcrew.gradientStart,
    backgroundColor: Colors.primary[50],
  },
  dateCardDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[300],
  },
  dateCardToday: {
    borderColor: Colors.ocean[400],
  },
  dayName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
  },
  dayNameSelected: {
    color: Colors.flowcrew.gradientStart,
    fontWeight: Typography.fontWeight.semibold,
  },
  dayNameDisabled: {
    color: Colors.text.tertiary,
  },
  dayNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  dayNumberSelected: {
    color: Colors.flowcrew.gradientStart,
  },
  dayNumberDisabled: {
    color: Colors.text.tertiary,
  },
  monthName: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  monthNameSelected: {
    color: Colors.flowcrew.gradientStart,
    fontWeight: Typography.fontWeight.semibold,
  },
  monthNameDisabled: {
    color: Colors.text.tertiary,
  },
  todayIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.ocean[500],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs / 2,
  },
  todayText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.flowcrew.white,
    fontWeight: Typography.fontWeight.bold,
  },
  noSlotsContainer: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...AdvancedShadows.subtleDepth,
  },
  noSlotsText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  noSlotsSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlot: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    minWidth: 100,
    alignItems: 'center',
    ...AdvancedShadows.subtleDepth,
  },
  timeSlotSelected: {
    borderColor: Colors.flowcrew.gradientStart,
    backgroundColor: Colors.primary[50],
  },
  timeSlotDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[300],
  },
  timeSlotText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  timeSlotTextSelected: {
    color: Colors.flowcrew.gradientStart,
    fontWeight: Typography.fontWeight.bold,
  },
  timeSlotTextDisabled: {
    color: Colors.text.tertiary,
  },
  conflictText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error[600],
    marginTop: Spacing.xs / 2,
  },
  bufferNotice: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
  },
  bufferNoticeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[700],
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.flowcrew.white,
    ...AdvancedShadows.subtleDepth,
  },
  confirmButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...AdvancedShadows.floating,
  },
  confirmButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.white,
    textAlign: 'center',
  },
});

export default EnhancedCalendarScheduler;
