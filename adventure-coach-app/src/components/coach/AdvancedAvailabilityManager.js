import React, { useState, useEffect, useRef } from 'react';
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
import { AuthService } from '../../services/AuthService';
import LoadingSpinner from '../LoadingSpinner';

const AdvancedAvailabilityManager = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week
  const [availability, setAvailability] = useState({});
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  useEffect(() => {
    loadAvailabilityData();
    loadTemplates();
  }, [selectedWeek]);

  const loadAvailabilityData = async () => {
    try {
      setIsLoading(true);
      const weekStart = getWeekStart(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const response = await AuthService.getCoachAvailability(
        user.id,
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );

      setAvailability(response.availability || {});
    } catch (error) {
      console.error('Failed to load availability:', error);
      Alert.alert('Error', 'Failed to load availability data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await AuthService.apiRequest('/coach/availability-templates');
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const getWeekStart = (weekOffset) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const formatWeekRange = (weekOffset) => {
    const start = getWeekStart(weekOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const isTimeSlotAvailable = (day, time) => {
    const date = getDateForDay(day);
    const dateString = date.toISOString().split('T')[0];
    return availability[dateString]?.[time] !== false;
  };

  const getDateForDay = (dayIndex) => {
    const weekStart = getWeekStart(selectedWeek);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    return date;
  };

  const toggleTimeSlot = async (day, time) => {
    const date = getDateForDay(day);
    const dateString = date.toISOString().split('T')[0];

    const newAvailability = { ...availability };
    if (!newAvailability[dateString]) {
      newAvailability[dateString] = {};
    }

    newAvailability[dateString][time] = !isTimeSlotAvailable(day, time);
    setAvailability(newAvailability);

    try {
      await AuthService.apiRequest('/coach/availability', {
        method: 'PUT',
        body: JSON.stringify({
          date: dateString,
          time: time,
          available: newAvailability[dateString][time]
        })
      });
    } catch (error) {
      console.error('Failed to update availability:', error);
      Alert.alert('Error', 'Failed to update availability');
      // Revert the change
      loadAvailabilityData();
    }
  };

  const handleDragSelection = (startDay, startTime, endDay, endTime) => {
    const startTimeIndex = timeSlots.indexOf(startTime);
    const endTimeIndex = timeSlots.indexOf(endTime);

    for (let day = Math.min(startDay, endDay); day <= Math.max(startDay, endDay); day++) {
      for (let timeIndex = Math.min(startTimeIndex, endTimeIndex); timeIndex <= Math.max(startTimeIndex, endTimeIndex); timeIndex++) {
        toggleTimeSlot(day, timeSlots[timeIndex]);
      }
    }
  };

  const applyTemplate = async (template) => {
    try {
      setIsLoading(true);
      const weekStart = getWeekStart(selectedWeek);

      await AuthService.apiRequest('/coach/apply-availability-template', {
        method: 'POST',
        body: JSON.stringify({
          templateId: template.id,
          weekStart: weekStart.toISOString().split('T')[0]
        })
      });

      await loadAvailabilityData();
      setShowTemplateModal(false);
      Alert.alert('Success', 'Template applied successfully!');
    } catch (error) {
      console.error('Failed to apply template:', error);
      Alert.alert('Error', 'Failed to apply template');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAsTemplate = () => {
    Alert.prompt(
      'Save Template',
      'Enter a name for this availability template:',
      async (templateName) => {
        if (templateName) {
          try {
            await AuthService.apiRequest('/coach/availability-templates', {
              method: 'POST',
              body: JSON.stringify({
                name: templateName,
                availability: availability
              })
            });

            await loadTemplates();
            Alert.alert('Success', 'Template saved successfully!');
          } catch (error) {
            console.error('Failed to save template:', error);
            Alert.alert('Error', 'Failed to save template');
          }
        }
      }
    );
  };

  const renderWeekSelector = () => (
    <View style={styles.weekSelector}>
      <TouchableOpacity
        style={styles.weekButton}
        onPress={() => setSelectedWeek(selectedWeek - 1)}
      >
        <Text style={styles.weekButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.weekInfo}>
        <Text style={styles.weekTitle}>
          {selectedWeek === 0 ? 'This Week' :
            selectedWeek === 1 ? 'Next Week' :
            `Week of ${formatWeekRange(selectedWeek)}`}
        </Text>
        <Text style={styles.weekRange}>{formatWeekRange(selectedWeek)}</Text>
      </View>

      <TouchableOpacity
        style={styles.weekButton}
        onPress={() => setSelectedWeek(selectedWeek + 1)}
      >
        <Text style={styles.weekButtonText}>›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeSlot = (day, time, timeIndex) => {
    const isAvailable = isTimeSlotAvailable(day, time);
    const isCurrentHour = new Date().getHours() === parseInt(time.split(':')[0]) &&
      selectedWeek === 0 &&
      day === new Date().getDay() - 1;

    return (
      <TouchableOpacity
        key={`${day}-${time}`}
        style={[
          styles.timeSlot,
          isAvailable && styles.timeSlotAvailable,
          isCurrentHour && styles.timeSlotCurrent,
        ]}
        onPress={() => toggleTimeSlot(day, time)}
        activeOpacity={0.7}
      >
        {timeIndex % 2 === 0 && (
          <Text style={styles.timeLabel}>{time}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderAvailabilityGrid = () => (
    <View style={styles.gridContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Header with days */}
          <View style={styles.gridHeader}>
            <View style={styles.timeColumn} />
            {daysOfWeek.map((day, index) => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayName}>{day.slice(0, 3)}</Text>
                <Text style={styles.dayDate}>
                  {getDateForDay(index).getDate()}
                </Text>
              </View>
            ))}
          </View>

          {/* Time slots grid */}
          <ScrollView style={styles.gridBody} showsVerticalScrollIndicator={false}>
            {timeSlots.map((time, timeIndex) => (
              <View key={time} style={styles.gridRow}>
                <View style={styles.timeColumn}>
                  {timeIndex % 2 === 0 && (
                    <Text style={styles.timeRowLabel}>{time}</Text>
                  )}
                </View>
                {daysOfWeek.map((day, dayIndex) => (
                  <View key={`${day}-${time}`} style={styles.slotColumn}>
                    {renderTimeSlot(dayIndex, time, timeIndex)}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );

  const renderTemplateModal = () => (
    <Modal
      visible={showTemplateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowTemplateModal(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Availability Templates</Text>
          <TouchableOpacity
            onPress={saveAsTemplate}
            style={styles.saveTemplateButton}
          >
            <Text style={styles.saveTemplateText}>Save Current</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {templates.length === 0 ? (
            <View style={styles.emptyTemplates}>
              <Text style={styles.emptyTemplatesText}>No templates saved yet</Text>
              <Text style={styles.emptyTemplatesSubtext}>
                Set your availability and save it as a template for quick reuse
              </Text>
            </View>
          ) : (
            templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => applyTemplate(template)}
              >
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.templatePreview}>
                  <Text style={styles.templatePreviewText}>📅</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setShowTemplateModal(true)}
      >
        <Text style={styles.actionButtonIcon}>📋</Text>
        <Text style={styles.actionButtonText}>Templates</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          Alert.alert(
            'Clear Week',
            'Clear all availability for this week?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: () => {
                  // Clear availability logic
                  const clearedAvailability = {};
                  daysOfWeek.forEach((_, dayIndex) => {
                    const date = getDateForDay(dayIndex);
                    const dateString = date.toISOString().split('T')[0];
                    clearedAvailability[dateString] = {};
                    timeSlots.forEach(time => {
                      clearedAvailability[dateString][time] = false;
                    });
                  });
                  setAvailability(clearedAvailability);
                }
              }
            ]
          );
        }}
      >
        <Text style={styles.actionButtonIcon}>🗑️</Text>
        <Text style={styles.actionButtonText}>Clear Week</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.primaryActionButton]}
        onPress={() => {
          Alert.alert(
            'Copy to Next Week',
            "Copy this week's availability to next week?",
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Copy',
                onPress: () => {
                  // Copy to next week logic
                  setSelectedWeek(selectedWeek + 1);
                }
              }
            ]
          );
        }}
      >
        <Text style={styles.actionButtonIcon}>📋</Text>
        <Text style={styles.actionButtonText}>Copy to Next</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Manage Availability</Text>
        <Text style={styles.headerSubtitle}>
          Tap to toggle • Drag to select multiple slots
        </Text>
      </View>

      {/* Week Selector */}
      {renderWeekSelector()}

      {/* Availability Grid */}
      {renderAvailabilityGrid()}

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Template Modal */}
      {renderTemplateModal()}
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
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.flowcrew.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  weekButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekButtonText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.bold,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  weekRange: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  gridContainer: {
    flex: 1,
    backgroundColor: Colors.flowcrew.white,
  },
  grid: {
    minWidth: 800, // Ensure horizontal scrolling
  },
  gridHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  dayHeader: {
    width: 100,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dayName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  dayDate: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.gradientStart,
  },
  gridBody: {
    maxHeight: 400,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  timeRowLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.medium,
  },
  slotColumn: {
    width: 100,
    alignItems: 'center',
  },
  timeSlot: {
    width: 90,
    height: 30,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    margin: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotAvailable: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  timeSlotCurrent: {
    borderWidth: 2,
    borderColor: Colors.ocean[500],
  },
  timeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.flowcrew.white,
    fontWeight: Typography.fontWeight.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: Colors.flowcrew.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...AdvancedShadows.subtleDepth,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  actionButtonIcon: {
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.xs / 2,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
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
  saveTemplateButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  saveTemplateText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.white,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  emptyTemplates: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyTemplatesText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyTemplatesSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...AdvancedShadows.subtleDepth,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  templateDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  templatePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  templatePreviewText: {
    fontSize: Typography.fontSize.lg,
  },
});

export default AdvancedAvailabilityManager;
