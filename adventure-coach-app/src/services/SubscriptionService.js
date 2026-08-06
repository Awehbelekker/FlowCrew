import { AuthService } from './AuthService';

/**
 * FlowCrew Subscription Service
 * Handles feature gating, subscription management, and premium feature access
 * Supports hierarchical subscriptions for surf schools/shops and their affiliated coaches
 */
class SubscriptionService {
  constructor() {
    this.subscriptions = new Map();
    this.featureFlags = new Map();
    this.currentUser = null;
    this.affiliatedSchool = null;
    this.initialized = false;
  }

  // Initialize subscription service
  async initialize() {
    if (this.initialized) return;

    try {
      // Load user subscription data
      await this.loadUserSubscription();

      // Load affiliated school data (for coaches)
      await this.loadAffiliatedSchool();

      // Setup feature flags
      this.setupFeatureFlags();

      this.initialized = true;
      console.log('✅ Subscription service initialized');
    } catch (error) {
      console.error('Failed to initialize subscription service:', error);
      throw error;
    }
  }

  // Load user subscription data
  async loadUserSubscription() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return;

      this.currentUser = user;

      // Fetch subscription data from backend
      const response = await AuthService.apiRequest('GET', '/api/subscriptions/current');

      if (response.success) {
        this.subscriptions.set(user.id, response.subscription);
      }
    } catch (error) {
      console.error('Failed to load user subscription:', error);
    }
  }

  // Load affiliated school data for coaches
  async loadAffiliatedSchool() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || user.role !== 'coach') return;

      // Fetch affiliated school data
      const response = await AuthService.apiRequest('GET', '/api/coaches/affiliated-school');

      if (response.success && response.school) {
        this.affiliatedSchool = response.school;
        console.log(`Coach affiliated with school: ${response.school.name} (Tier: ${response.school.subscription?.tier || 'free'})`);
      }
    } catch (error) {
      console.error('Failed to load affiliated school:', error);
    }
  }

  // Setup feature flags based on subscription tiers (hierarchical)
  setupFeatureFlags() {
    const user = this.currentUser;
    const userSubscription = this.subscriptions.get(user?.id);
    const schoolSubscription = this.affiliatedSchool?.subscription;

    // Default features (free tier)
    this.featureFlags.set('basic_chat', true);
    this.featureFlags.set('voice_messages', true);
    this.featureFlags.set('message_reactions', true);
    this.featureFlags.set('file_sharing', true);
    this.featureFlags.set('coach_discovery', true);
    this.featureFlags.set('booking_management', true);
    this.featureFlags.set('weather_intelligence', true);
    this.featureFlags.set('calendar_integration', true);

    // Premium features (paid tiers)
    this.featureFlags.set('whatsapp_integration', false);
    this.featureFlags.set('ai_coach_matching', false);
    this.featureFlags.set('advanced_analytics', false);
    this.featureFlags.set('priority_support', false);
    this.featureFlags.set('custom_branding', false);
    this.featureFlags.set('api_integrations', false);
    this.featureFlags.set('advanced_calendar', false);
    this.featureFlags.set('ecommerce_integration', false);

    // Determine effective subscription tier
    const effectiveTier = this.getEffectiveSubscriptionTier();

    // Apply subscription-based feature access
    if (effectiveTier) {
      switch (effectiveTier) {
        case 'premium':
          this.featureFlags.set('whatsapp_integration', true);
          this.featureFlags.set('ai_coach_matching', true);
          this.featureFlags.set('advanced_analytics', true);
          this.featureFlags.set('priority_support', true);
          break;
        case 'business':
          this.featureFlags.set('whatsapp_integration', true);
          this.featureFlags.set('ai_coach_matching', true);
          this.featureFlags.set('advanced_analytics', true);
          this.featureFlags.set('priority_support', true);
          this.featureFlags.set('custom_branding', true);
          this.featureFlags.set('api_integrations', true);
          this.featureFlags.set('advanced_calendar', true);
          this.featureFlags.set('ecommerce_integration', true);
          break;
        case 'enterprise':
          // All features enabled
          this.featureFlags.forEach((value, key) => {
            this.featureFlags.set(key, true);
          });
          break;
      }
    }
  }

  // Get effective subscription tier (user's tier or school's tier, whichever is higher)
  getEffectiveSubscriptionTier() {
    const user = this.currentUser;
    const userSubscription = this.subscriptions.get(user?.id);
    const schoolSubscription = this.affiliatedSchool?.subscription;

    const userTier = userSubscription?.tier || 'free';
    const schoolTier = schoolSubscription?.tier || 'free';

    // Return the higher tier between user and school
    const tierHierarchy = { 'free': 0, 'premium': 1, 'business': 2, 'enterprise': 3 };
    const userTierLevel = tierHierarchy[userTier] || 0;
    const schoolTierLevel = tierHierarchy[schoolTier] || 0;

    return userTierLevel >= schoolTierLevel ? userTier : schoolTier;
  }

  // Get subscription source (user or school)
  getSubscriptionSource() {
    const user = this.currentUser;
    const userSubscription = this.subscriptions.get(user?.id);
    const schoolSubscription = this.affiliatedSchool?.subscription;

    const userTier = userSubscription?.tier || 'free';
    const schoolTier = schoolSubscription?.tier || 'free';

    const tierHierarchy = { 'free': 0, 'premium': 1, 'business': 2, 'enterprise': 3 };
    const userTierLevel = tierHierarchy[userTier] || 0;
    const schoolTierLevel = tierHierarchy[schoolTier] || 0;

    if (userTierLevel >= schoolTierLevel) {
      return {
        type: 'user',
        tier: userTier,
        subscription: userSubscription
      };
    } else {
      return {
        type: 'school',
        tier: schoolTier,
        subscription: schoolSubscription,
        school: this.affiliatedSchool
      };
    }
  }

  // Check if user has access to a specific feature
  hasFeatureAccess(featureName) {
    return this.featureFlags.get(featureName) || false;
  }

  // Get user's current subscription tier
  getCurrentTier() {
    return this.getEffectiveSubscriptionTier();
  }

  // Get subscription details
  getSubscriptionDetails() {
    const source = this.getSubscriptionSource();
    return source;
  }

  // Get affiliated school details (for coaches)
  getAffiliatedSchool() {
    return this.affiliatedSchool;
  }

  // Check if user is a coach affiliated with a school
  isAffiliatedCoach() {
    return this.currentUser?.role === 'coach' && this.affiliatedSchool;
  }

  // Get feature upgrade prompt
  getFeatureUpgradePrompt(featureName) {
    const featurePrompts = {
      whatsapp_integration: {
        title: 'WhatsApp Integration',
        description: 'Send messages directly to WhatsApp for seamless communication',
        benefits: [
          'Direct WhatsApp messaging',
          'Message templates',
          'Auto-replies',
          'Conversation history'
        ],
        plans: ['premium', 'business', 'enterprise']
      },
      ai_coach_matching: {
        title: 'AI Coach Matching',
        description: 'Advanced AI algorithm for perfect coach-student matching',
        benefits: [
          'Smart matching algorithm',
          'Multi-factor scoring',
          'Personalized recommendations',
          'Performance analytics'
        ],
        plans: ['premium', 'business', 'enterprise']
      },
      advanced_analytics: {
        title: 'Advanced Analytics',
        description: 'Comprehensive insights and performance tracking',
        benefits: [
          'Detailed analytics dashboard',
          'Performance metrics',
          'Revenue tracking',
          'Customer insights'
        ],
        plans: ['premium', 'business', 'enterprise']
      },
      ecommerce_integration: {
        title: 'E-commerce Integration',
        description: 'Connect with Shopify, WooCommerce, and other platforms',
        benefits: [
          'Multi-platform integration',
          'Product synchronization',
          'Order processing',
          'Inventory management'
        ],
        plans: ['business', 'enterprise']
      },
      school_management: {
        title: 'School Management',
        description: 'Complete school management and coach coordination',
        benefits: [
          'Coach invitation system',
          'Performance tracking',
          'Revenue sharing',
          'Centralized billing'
        ],
        plans: ['school_starter', 'school_pro', 'school_enterprise']
      },
      custom_branding: {
        title: 'Custom Branding',
        description: 'White-label solution with your own branding',
        benefits: [
          'Custom logo and colors',
          'Branded mobile app',
          'Custom domain',
          'White-label solution'
        ],
        plans: ['business', 'enterprise', 'school_pro', 'school_enterprise']
      },
      api_integrations: {
        title: 'API Integrations',
        description: 'Connect with your existing systems and tools',
        benefits: [
          'REST API access',
          'Webhook support',
          'Third-party integrations',
          'Custom development'
        ],
        plans: ['business', 'enterprise', 'school_pro', 'school_enterprise']
      },
      priority_support: {
        title: 'Priority Support',
        description: 'Get help when you need it most',
        benefits: [
          '24/7 priority support',
          'Dedicated account manager',
          'Phone and email support',
          'Response time guarantee'
        ],
        plans: ['premium', 'business', 'enterprise', 'school_pro', 'school_enterprise']
      }
    };

    return featurePrompts[featureName] || null;
  }

  // Check if feature requires upgrade
  requiresUpgrade(featureName) {
    return !this.hasFeatureAccess(featureName);
  }

  // Get available subscription plans with enhanced pricing
  async getAvailablePlans() {
    // Enhanced pricing tiers
    const plans = [
      // Individual Plans
      {
        id: 'free',
        name: 'Free',
        tier: 'free',
        price: 0,
        period: 'month',
        features: [
          'Basic in-app chat',
          'Voice messages',
          'Message reactions',
          'Coach discovery',
          'Booking management',
          'Weather intelligence',
          'Basic calendar integration'
        ],
        maxCoaches: 0,
        maxStudents: 10
      },
      {
        id: 'premium',
        name: 'Premium',
        tier: 'premium',
        price: 19.99,
        period: 'month',
        features: [
          'All Free features',
          'WhatsApp integration',
          'AI coach matching',
          'Advanced analytics',
          'Priority support',
          'File sharing',
          'Message templates'
        ],
        maxCoaches: 0,
        maxStudents: 50
      },
      {
        id: 'business',
        name: 'Business',
        tier: 'business',
        price: 49.99,
        period: 'month',
        features: [
          'All Premium features',
          'Custom branding',
          'API integrations',
          'Advanced calendar features',
          'E-commerce integration',
          'Advanced reporting',
          'Custom workflows'
        ],
        maxCoaches: 0,
        maxStudents: 200
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        tier: 'enterprise',
        price: 99.99,
        period: 'month',
        features: [
          'All Business features',
          'Custom integrations',
          'Dedicated support',
          'White-label options',
          'Advanced security',
          'Custom development',
          'SLA guarantee'
        ],
        maxCoaches: 0,
        maxStudents: 1000
      },
      // School Plans
      {
        id: 'school_starter',
        name: 'School Starter',
        tier: 'school_starter',
        price: 79.99,
        period: 'month',
        features: [
          'All Premium features',
          'School management dashboard',
          'Coach invitation system',
          'Up to 5 coaches',
          'Performance tracking',
          'Revenue sharing',
          'Centralized billing'
        ],
        maxCoaches: 5,
        maxStudents: 100
      },
      {
        id: 'school_pro',
        name: 'School Pro',
        tier: 'school_pro',
        price: 149.99,
        period: 'month',
        features: [
          'All School Starter features',
          'Custom branding',
          'API integrations',
          'Advanced analytics',
          'Up to 15 coaches',
          'Priority support',
          'Custom workflows'
        ],
        maxCoaches: 15,
        maxStudents: 500
      },
      {
        id: 'school_enterprise',
        name: 'School Enterprise',
        tier: 'school_enterprise',
        price: 299.99,
        period: 'month',
        features: [
          'All School Pro features',
          'Unlimited coaches',
          'White-label solution',
          'Custom integrations',
          'Dedicated support',
          'Advanced security',
          'SLA guarantee'
        ],
        maxCoaches: -1, // Unlimited
        maxStudents: 2000
      }
    ];

    return plans;
  }

  // Subscribe to a plan
  async subscribeToPlan(planId, paymentMethod = null) {
    try {
      const response = await AuthService.apiRequest('POST', '/api/subscriptions/subscribe', {
        planId,
        paymentMethod
      });

      if (response.success) {
        // Reload subscription data
        await this.loadUserSubscription();
        this.setupFeatureFlags();

        return response;
      }
    } catch (error) {
      console.error('Failed to subscribe to plan:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await AuthService.apiRequest('POST', '/api/subscriptions/cancel');

      if (response.success) {
        // Reload subscription data
        await this.loadUserSubscription();
        this.setupFeatureFlags();

        return response;
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Upgrade subscription
  async upgradeSubscription(newPlanId) {
    try {
      const response = await AuthService.apiRequest('POST', '/api/subscriptions/upgrade', {
        newPlanId
      });

      if (response.success) {
        // Reload subscription data
        await this.loadUserSubscription();
        this.setupFeatureFlags();

        return response;
      }
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  }

  // Get subscription pricing with competitive rates
  async getPricing() {
    const pricing = {
      individual: [
        {
          name: 'Free',
          price: 0,
          period: 'month',
          features: ['Basic features', 'Up to 10 students'],
          popular: false
        },
        {
          name: 'Premium',
          price: 19.99,
          period: 'month',
          features: ['WhatsApp integration', 'AI matching', 'Analytics'],
          popular: true
        },
        {
          name: 'Business',
          price: 49.99,
          period: 'month',
          features: ['Custom branding', 'API access', 'E-commerce'],
          popular: false
        },
        {
          name: 'Enterprise',
          price: 99.99,
          period: 'month',
          features: ['White-label', 'Custom development', 'Dedicated support'],
          popular: false
        }
      ],
      school: [
        {
          name: 'School Starter',
          price: 79.99,
          period: 'month',
          features: ['Up to 5 coaches', 'School dashboard', 'Revenue sharing'],
          popular: false
        },
        {
          name: 'School Pro',
          price: 149.99,
          period: 'month',
          features: ['Up to 15 coaches', 'Custom branding', 'API access'],
          popular: true
        },
        {
          name: 'School Enterprise',
          price: 299.99,
          period: 'month',
          features: ['Unlimited coaches', 'White-label', 'Dedicated support'],
          popular: false
        }
      ]
    };

    return pricing;
  }

  // Refresh subscription data
  async refreshSubscription() {
    await this.loadUserSubscription();
    await this.loadAffiliatedSchool();
    this.setupFeatureFlags();
  }

  // Get hierarchical subscription info for display
  getHierarchicalInfo() {
    const user = this.currentUser;
    const userSubscription = this.subscriptions.get(user?.id);
    const schoolSubscription = this.affiliatedSchool?.subscription;

    const userTier = userSubscription?.tier || 'free';
    const schoolTier = schoolSubscription?.tier || 'free';

    const tierHierarchy = { 'free': 0, 'premium': 1, 'business': 2, 'enterprise': 3 };
    const userTierLevel = tierHierarchy[userTier] || 0;
    const schoolTierLevel = tierHierarchy[schoolTier] || 0;

    return {
      userTier,
      schoolTier,
      effectiveTier: userTierLevel >= schoolTierLevel ? userTier : schoolTier,
      source: userTierLevel >= schoolTierLevel ? 'user' : 'school',
      school: this.affiliatedSchool,
      isAffiliatedCoach: this.isAffiliatedCoach()
    };
  }
}

const SubscriptionServiceInstance = new SubscriptionService();
export default SubscriptionServiceInstance;
