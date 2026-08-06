import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/designSystem';
import { VisualEffects, EnhancedSpacing } from '../styles/FlowCrewDesignSystem';
import { Button, Card, Text as FlowCrewText } from './FlowCrew';
import SubscriptionService from '../services/SubscriptionService';
import LoadingSpinner from './LoadingSpinner';

const SubscriptionUpgradeModal = ({
  visible,
  onClose,
  featureName,
  onUpgradeSuccess
}) => {
  const [plans, setPlans] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hierarchicalInfo, setHierarchicalInfo] = useState(null);

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    if (visible) {
      loadSubscriptionData();
      startAnimation();
    }
  }, [visible]);

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansData, pricingData] = await Promise.all([
        SubscriptionService.getAvailablePlans(),
        SubscriptionService.getPricing()
      ]);

      setPlans(plansData);
      setPricing(pricingData);

      // Load hierarchical subscription info
      const hierarchicalData = SubscriptionService.getHierarchicalInfo();
      setHierarchicalInfo(hierarchicalData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a plan to upgrade');
      return;
    }

    try {
      setLoading(true);
      const result = await SubscriptionService.subscribeToPlan(selectedPlan.id);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your subscription has been upgraded successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                onUpgradeSuccess && onUpgradeSuccess();
                onClose();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      Alert.alert('Error', 'Failed to upgrade subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFeaturePrompt = () => {
    return SubscriptionService.getFeatureUpgradePrompt(featureName);
  };

  const renderFeatureBenefits = (benefits) => {
    return benefits.map((benefit, index) => (
      <View key={index} style={styles.benefitItem}>
        <Text style={styles.benefitIcon}>✓</Text>
        <Text style={styles.benefitText}>{benefit}</Text>
      </View>
    ));
  };

  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan?.id === plan.id;
    const isPopular = plan.tier === 'premium';

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isPopular && styles.popularPlanCard
        ]}
        onPress={() => setSelectedPlan(plan)}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planPrice}>
          ${plan.price}
          <Text style={styles.planPeriod}>/{plan.period}</Text>
        </Text>

        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <Text key={index} style={styles.planFeature}>
              • {feature}
            </Text>
          ))}
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHierarchicalInfo = () => {
    if (!hierarchicalInfo || !hierarchicalInfo.isAffiliatedCoach) return null;

    return (
      <Card style={styles.hierarchicalCard}>
        <Text style={styles.hierarchicalTitle}>Affiliated School Access</Text>
        <Text style={styles.hierarchicalDescription}>
          You're affiliated with {hierarchicalInfo.school?.name || 'a surf school'}
          (Tier: {hierarchicalInfo.schoolTier})
        </Text>

        <View style={styles.hierarchicalDetails}>
          <Text style={styles.hierarchicalDetail}>
            • Your tier: {hierarchicalInfo.userTier}
          </Text>
          <Text style={styles.hierarchicalDetail}>
            • School tier: {hierarchicalInfo.schoolTier}
          </Text>
          <Text style={styles.hierarchicalDetail}>
            • Effective tier: {hierarchicalInfo.effectiveTier}
          </Text>
          <Text style={styles.hierarchicalDetail}>
            • Source: {hierarchicalInfo.source === 'user' ? 'Your subscription' : 'School subscription'}
          </Text>
        </View>

        {hierarchicalInfo.source === 'school' && (
          <Text style={styles.hierarchicalNote}>
            💡 You have access to premium features through your school's subscription!
          </Text>
        )}
      </Card>
    );
  };

  const featurePrompt = getFeaturePrompt();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <ScrollView style={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Upgrade Your Plan</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Hierarchical Subscription Info */}
            {renderHierarchicalInfo()}

            {/* Feature Description */}
            {featurePrompt && (
              <Card style={styles.featureCard}>
                <Text style={styles.featureTitle}>{featurePrompt.title}</Text>
                <Text style={styles.featureDescription}>
                  {featurePrompt.description}
                </Text>

                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>What you'll get:</Text>
                  {renderFeatureBenefits(featurePrompt.benefits)}
                </View>
              </Card>
            )}

            {/* Subscription Plans */}
            <View style={styles.plansContainer}>
              <Text style={styles.plansTitle}>Choose Your Plan</Text>

              {loading ? (
                <LoadingSpinner />
              ) : (
                <View style={styles.plansGrid}>
                  {plans.map(renderPlanCard)}
                </View>
              )}
            </View>

            {/* Upgrade Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Upgrade Now"
                onPress={handleUpgrade}
                disabled={!selectedPlan || loading}
                style={styles.upgradeButton}
                textStyle={styles.upgradeButtonText}
              />

              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    margin: Spacing.large,
    maxHeight: '90%',
    width: '90%',
    maxWidth: 500,
    ...VisualEffects.shadows.elevation,
  },
  scrollContent: {
    padding: Spacing.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.large,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.primary,
  },
  closeButton: {
    padding: Spacing.small,
  },
  closeText: {
    fontSize: 24,
    color: Colors.gray,
  },
  featureCard: {
    marginBottom: Spacing.large,
    padding: Spacing.large,
  },
  featureTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.small,
  },
  featureDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.medium,
  },
  benefitsContainer: {
    marginTop: Spacing.medium,
  },
  benefitsTitle: {
    ...Typography.subtitle,
    color: Colors.primary,
    marginBottom: Spacing.small,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  benefitIcon: {
    fontSize: 16,
    color: Colors.success,
    marginRight: Spacing.small,
    fontWeight: 'bold',
  },
  benefitText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  plansContainer: {
    marginBottom: Spacing.large,
  },
  plansTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.medium,
  },
  plansGrid: {
    gap: Spacing.medium,
  },
  planCard: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.medium,
    padding: Spacing.large,
    marginBottom: Spacing.small,
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  popularPlanCard: {
    borderColor: Colors.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.small,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
  },
  popularText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  planName: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: Spacing.small,
  },
  planPrice: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.medium,
  },
  planPeriod: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  planFeatures: {
    marginBottom: Spacing.medium,
  },
  planFeature: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.small,
  },
  selectedIndicator: {
    position: 'absolute',
    top: Spacing.medium,
    right: Spacing.medium,
  },
  selectedText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: Spacing.large,
  },
  upgradeButton: {
    marginBottom: Spacing.medium,
  },
  upgradeButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Spacing.medium,
  },
  cancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  hierarchicalCard: {
    marginBottom: Spacing.large,
    padding: Spacing.large,
    backgroundColor: Colors.primaryLight,
  },
  hierarchicalTitle: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: Spacing.small,
  },
  hierarchicalDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.medium,
  },
  hierarchicalDetails: {
    marginBottom: Spacing.medium,
  },
  hierarchicalDetail: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.small,
  },
  hierarchicalNote: {
    ...Typography.body,
    color: Colors.success,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});

export default SubscriptionUpgradeModal;
