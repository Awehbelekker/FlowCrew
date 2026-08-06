import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { PaymentService } from '../../services/PaymentService';
import FormInput from '../common/FormInput';
import LoadingSpinner from '../LoadingSpinner';

const AddPaymentMethodModal = ({ onAdd, onCancel, isLoading }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');

    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }

    return cleaned;
  };

  const formatCVC = (text) => {
    // Remove all non-digits and limit to 4 characters
    return text.replace(/\D/g, '').substring(0, 4);
  };

  const validateCardData = () => {
    const newErrors = {};

    // Card number validation
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.number = 'Card number is required';
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.number = 'Invalid card number';
    } else if (!PaymentService.validateCardNumber(cardNumber)) {
      newErrors.number = 'Invalid card number';
    }

    // Expiry validation
    if (!cardData.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else {
      const [month, year] = cardData.expiry.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (!month || !year || month < 1 || month > 12) {
        newErrors.expiry = 'Invalid expiry date';
      } else if (parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }

    // CVC validation
    if (!cardData.cvc) {
      newErrors.cvc = 'CVC is required';
    } else if (cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      newErrors.cvc = 'Invalid CVC';
    }

    // Name validation
    if (!cardData.name.trim()) {
      newErrors.name = 'Cardholder name is required';
    }

    // Billing address validation
    if (!billingAddress.line1.trim()) {
      newErrors.line1 = 'Address is required';
    }
    if (!billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!billingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!billingAddress.postal_code.trim()) {
      newErrors.postal_code = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPaymentMethod = async () => {
    if (!validateCardData()) return;

    setIsProcessing(true);
    try {
      const [month, year] = cardData.expiry.split('/');

      const paymentMethodData = {
        card: {
          number: cardData.number.replace(/\s/g, ''),
          exp_month: parseInt(month),
          exp_year: parseInt(`20${year}`),
          cvc: cardData.cvc,
        },
        billing_details: {
          name: cardData.name,
          address: billingAddress,
        },
      };

      await onAdd(paymentMethodData);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCardData = (field, value) => {
    let formattedValue = value;

    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = formatCVC(value);
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateBillingAddress = (field, value) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getCardBrand = () => {
    const cardNumber = cardData.number.replace(/\s/g, '');
    return PaymentService.getCardBrand(cardNumber);
  };

  if (isLoading || isProcessing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Adding payment method..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Information</Text>

          <View style={styles.cardPreview}>
            <View style={styles.cardPreviewContent}>
              <Text style={styles.cardBrandText}>
                {getCardBrand().toUpperCase() || 'CARD'}
              </Text>
              <Text style={styles.cardNumberPreview}>
                {cardData.number || '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardPreviewBottom}>
                <Text style={styles.cardNamePreview}>
                  {cardData.name.toUpperCase() || 'CARDHOLDER NAME'}
                </Text>
                <Text style={styles.cardExpiryPreview}>
                  {cardData.expiry || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>

          <FormInput
            label="Card Number"
            value={cardData.number}
            onChangeText={(value) => updateCardData('number', value)}
            error={errors.number}
            keyboardType="numeric"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />

          <View style={styles.cardRow}>
            <FormInput
              label="Expiry Date"
              value={cardData.expiry}
              onChangeText={(value) => updateCardData('expiry', value)}
              error={errors.expiry}
              keyboardType="numeric"
              placeholder="MM/YY"
              maxLength={5}
              style={styles.halfInput}
            />
            <FormInput
              label="CVC"
              value={cardData.cvc}
              onChangeText={(value) => updateCardData('cvc', value)}
              error={errors.cvc}
              keyboardType="numeric"
              placeholder="123"
              maxLength={4}
              style={styles.halfInput}
            />
          </View>

          <FormInput
            label="Cardholder Name"
            value={cardData.name}
            onChangeText={(value) => updateCardData('name', value)}
            error={errors.name}
            placeholder="John Doe"
            autoCapitalize="words"
          />
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Address</Text>

          <FormInput
            label="Address"
            value={billingAddress.line1}
            onChangeText={(value) => updateBillingAddress('line1', value)}
            error={errors.line1}
            placeholder="123 Main Street"
          />

          <View style={styles.addressRow}>
            <FormInput
              label="City"
              value={billingAddress.city}
              onChangeText={(value) => updateBillingAddress('city', value)}
              error={errors.city}
              placeholder="San Francisco"
              style={styles.halfInput}
            />
            <FormInput
              label="State"
              value={billingAddress.state}
              onChangeText={(value) => updateBillingAddress('state', value)}
              error={errors.state}
              placeholder="CA"
              maxLength={2}
              autoCapitalize="characters"
              style={styles.quarterInput}
            />
          </View>

          <FormInput
            label="ZIP Code"
            value={billingAddress.postal_code}
            onChangeText={(value) => updateBillingAddress('postal_code', value)}
            error={errors.postal_code}
            keyboardType="numeric"
            placeholder="94105"
            maxLength={10}
          />
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityDescription}>
              Your payment information is encrypted and secure. We never store your card details.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  cancelButton: {
    paddingVertical: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  cardPreview: {
    backgroundColor: Colors.flowcrew.gradientStart,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...AdvancedShadows.floating,
  },
  cardPreviewContent: {
    minHeight: 100,
    justifyContent: 'space-between',
  },
  cardBrandText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.white,
    alignSelf: 'flex-end',
  },
  cardNumberPreview: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.flowcrew.white,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardNamePreview: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.flowcrew.white,
    flex: 1,
  },
  cardExpiryPreview: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.flowcrew.white,
    fontFamily: 'monospace',
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  quarterInput: {
    flex: 0.3,
  },
  addressRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
    marginBottom: Spacing.lg,
  },
  securityIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.md,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
    marginBottom: Spacing.xs / 2,
  },
  securityDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.flowcrew.white,
    ...AdvancedShadows.subtleDepth,
  },
  addButton: {
    backgroundColor: Colors.flowcrew.gradientStart,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...AdvancedShadows.floating,
  },
  addButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.white,
  },
});

export default AddPaymentMethodModal;
