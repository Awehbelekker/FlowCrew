import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { PaymentService } from '../../services/PaymentService';
import LoadingSpinner from '../LoadingSpinner';
import AddPaymentMethodModal from './AddPaymentMethodModal';

const PaymentMethodSelector = ({
  paymentMethods = [],
  selectedMethod,
  onSelect,
  onAddNew,
  showAddButton = true,
}) => {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getCardBrandIcon = (brand) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      unknown: '💳',
    };
    return icons[brand?.toLowerCase()] || icons.unknown;
  };

  const getCardBrandColor = (brand) => {
    const colors = {
      visa: Colors.ocean[500],
      mastercard: Colors.error[500],
      amex: Colors.primary[600],
      discover: Colors.warning[500],
      unknown: Colors.neutral[400],
    };
    return colors[brand?.toLowerCase()] || colors.unknown;
  };

  const handleRemovePaymentMethod = async (paymentMethodId) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await PaymentService.removePaymentMethod(paymentMethodId);
              // Refresh payment methods list
              onAddNew?.(); // This should trigger a refresh in parent component
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAddPaymentMethod = async (paymentMethodData) => {
    try {
      setIsLoading(true);
      await PaymentService.addPaymentMethod(paymentMethodData);
      setIsAddingPayment(false);
      onAddNew?.(); // Trigger refresh in parent
      Alert.alert('Success', 'Payment method added successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod?.id === method.id;
    const brandColor = getCardBrandColor(method.card?.brand);

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.paymentMethodCardSelected,
        ]}
        onPress={() => onSelect(method)}
        activeOpacity={0.8}
      >
        <View style={styles.paymentMethodContent}>
          <View style={styles.cardInfo}>
            <View style={[styles.cardIcon, { backgroundColor: brandColor }]}>
              <Text style={styles.cardIconText}>
                {getCardBrandIcon(method.card?.brand)}
              </Text>
            </View>

            <View style={styles.cardDetails}>
              <Text style={styles.cardBrand}>
                {method.card?.brand?.toUpperCase() || 'CARD'}
              </Text>
              <Text style={styles.cardNumber}>
                •••• •••• •••• {method.card?.last4}
              </Text>
              <Text style={styles.cardExpiry}>
                Expires {method.card?.exp_month?.toString().padStart(2, '0')}/
                {method.card?.exp_year?.toString().slice(-2)}
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePaymentMethod(method.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {method.card?.funding === 'debit' && (
          <View style={styles.debitBadge}>
            <Text style={styles.debitBadgeText}>DEBIT</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAddPaymentButton = () => {
    if (!showAddButton) return null;

    return (
      <TouchableOpacity
        style={styles.addPaymentButton}
        onPress={() => setIsAddingPayment(true)}
        activeOpacity={0.8}
      >
        <View style={styles.addPaymentContent}>
          <View style={styles.addPaymentIcon}>
            <Text style={styles.addPaymentIconText}>+</Text>
          </View>
          <Text style={styles.addPaymentText}>Add New Payment Method</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💳</Text>
      <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
      <Text style={styles.emptyStateText}>
        Add a payment method to complete your booking
      </Text>
      {showAddButton && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => setIsAddingPayment(true)}
        >
          <Text style={styles.emptyStateButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="small" message="Processing..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      {paymentMethods.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.paymentMethodsList}>
          {paymentMethods.map(renderPaymentMethod)}
          {renderAddPaymentButton()}
        </View>
      )}

      <Modal
        visible={isAddingPayment}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddPaymentMethodModal
          onAdd={handleAddPaymentMethod}
          onCancel={() => setIsAddingPayment(false)}
          isLoading={isLoading}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  paymentMethodsList: {
    gap: Spacing.sm,
  },
  paymentMethodCard: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    ...AdvancedShadows.subtleDepth,
  },
  paymentMethodCardSelected: {
    borderColor: Colors.flowcrew.gradientStart,
    backgroundColor: Colors.primary[50],
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardIconText: {
    fontSize: Typography.fontSize.lg,
  },
  cardDetails: {
    flex: 1,
  },
  cardBrand: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  cardNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
    fontFamily: 'monospace',
  },
  cardExpiry: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.flowcrew.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.flowcrew.white,
    fontWeight: Typography.fontWeight.bold,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error[600],
    fontWeight: Typography.fontWeight.bold,
  },
  debitBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.warning[100],
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  debitBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning[700],
  },
  addPaymentButton: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    borderStyle: 'dashed',
    ...AdvancedShadows.subtleDepth,
  },
  addPaymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPaymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  addPaymentIconText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.bold,
  },
  addPaymentText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  emptyState: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...AdvancedShadows.subtleDepth,
  },
  emptyStateIcon: {
    fontSize: Typography.fontSize['3xl'],
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  emptyStateButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyStateButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.flowcrew.white,
  },
});

export default PaymentMethodSelector;
