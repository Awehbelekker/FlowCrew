import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, VisualEffects, EnhancedSpacing } from '../../styles/FlowCrewDesignSystem';
import {
  Text,
  Button,
  Header,
  Card,
  SelectionGroup
} from '../../components/FlowCrew';
import { FlowCrewLogo } from '../../components/FlowCrew/Icons';

const CheckoutScreen = ({ navigation }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const orderSummary = [
    { label: 'Lesson', value: 'Surfing' },
    { label: 'Gear', value: 'Wetsuit' },
    { label: 'Trip', value: '2 Hours' },
  ];

  const paymentMethods = [
    { id: 'credit', label: 'Credit Card' },
    { id: 'paypal', label: 'PayPal' },
  ];

  const renderOrderItem = (item, index) => (
    <Animated.View
      key={index}
      style={[
        styles.orderItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text variant="body" color="primary">
        {item.label}
      </Text>
      <Text variant="body" bold>
        {item.value}
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <Header
        title="Checkout"
        showLogo={true}
        leftAction={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>←</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Order Summary with Enhanced Visual Effects */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card variant="elevated" style={styles.summaryCard}>
            <Text variant="h3" bold style={styles.sectionTitle}>
              Order Summary
            </Text>
            <View style={styles.orderItems}>
              {orderSummary.map((item, index) => renderOrderItem(item, index))}
            </View>
            <View style={styles.totalContainer}>
              <Text variant="subtitle" bold>
                Total
              </Text>
              <Text variant="h3" bold color="brand">
                $120
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Payment Method Selection */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text variant="h3" bold style={styles.sectionTitle}>
            Payment
          </Text>
          <SelectionGroup
            options={paymentMethods}
            selectedValue={selectedPaymentMethod}
            onSelectionChange={setSelectedPaymentMethod}
            variant="cards"
          />
        </Animated.View>
      </ScrollView>

      {/* Enhanced Complete Booking Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Button
          variant="primary"
          size="lg"
          onPress={() => {}}
          style={styles.completeButton}
        >
          Complete Booking
        </Button>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  section: {
    marginBottom: EnhancedSpacing.sectionGap,
  },

  summaryCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  sectionTitle: {
    marginBottom: Spacing.lg,
  },

  orderItems: {
    marginBottom: Spacing.lg,
  },

  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.border.subtle,
  },

  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  completeButton: {
    shadowColor: Colors.brand.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CheckoutScreen;
