const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// For now, we'll create a simple version of the scorer in the server
// In production, you'd want to properly handle ES6 modules
class AdventureRelevanceScorer {
  constructor() {
    this.weights = {
      locationProximity: 0.25,
      skillAlignment: 0.20,
      availabilityMatch: 0.15,
      weatherSuitability: 0.15,
      priceMatch: 0.10,
      reviewScore: 0.10,
      experienceLevel: 0.05
    };
  }

  calculateRelevanceScore(coach, userContext) {
    // Simplified scoring for server demo
    let score = 0;

    // Location proximity (mock calculation)
    if (userContext.location && coach.location) {
      const distance = Math.random() * 50; // Mock distance in km
      score += this.weights.locationProximity * Math.max(0, 1 - distance / 50);
    }

    // Skill alignment
    const skillMatch = coach.specialties?.includes(userContext.activity) ? 1 : 0.5;
    score += this.weights.skillAlignment * skillMatch;

    // Price match
    const priceScore = userContext.budget ? Math.max(0, 1 - Math.abs(coach.hourlyRate - userContext.budget) / userContext.budget) : 0.5;
    score += this.weights.priceMatch * priceScore;

    // Review score
    score += this.weights.reviewScore * (coach.rating / 5);

    // Add other factors with default values
    score += this.weights.availabilityMatch * 0.8; // Mock availability
    score += this.weights.weatherSuitability * 0.7; // Mock weather
    score += this.weights.experienceLevel * 0.6; // Mock experience

    return Math.min(1, Math.max(0, score));
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Initialize our AI services
const relevanceScorer = new AdventureRelevanceScorer();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Weather intelligence endpoint
app.get('/api/weather-intelligence', (req, res) => {
  const { lat, lng, activity } = req.query;

  // Simulate weather data retrieval
  const weatherData = getSimulatedWeatherData(activity || 'surfing');

  res.json(weatherData);
});

// Coach matching endpoint
app.post('/api/match-coaches', (req, res) => {
  const { location, userPreferences, coaches } = req.body;

  // Get sample coaches if none provided
  const coachesToScore = coaches || getSampleCoaches();

  // Add weather data to context
  const weatherData = getSimulatedWeatherData(userPreferences.activity || 'surfing');
  const context = {
    ...userPreferences,
    location,
    weatherConditions: weatherData
  };

  // Score and sort coaches
  const scoredCoaches = coachesToScore.map(coach => {
    const relevanceScore = relevanceScorer.calculateRelevanceScore(coach, context);
    return {
      ...coach,
      relevanceScore,
      weatherSuitability: weatherData.suitability.overall
    };
  });

  // Sort by relevance score
  scoredCoaches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  res.json({
    coaches: scoredCoaches,
    weatherIntelligence: weatherData
  });
});

// Helper function to generate weather data
function getSimulatedWeatherData(activity) {
  const now = new Date();

  // Base weather conditions
  const baseConditions = {
    timestamp: now.toISOString(),
    location: {
      name: 'Santa Monica, CA',
      coordinates: {
        latitude: 34.0195,
        longitude: -118.4912
      }
    },
    wind: {
      speed: 12,
      direction: 225,
      directionText: 'Southwest',
      gusts: 15
    },
    temperature: {
      air: 22,
      water: 18
    },
    sun: {
      sunrise: '06:15',
      sunset: '20:05',
    },
    precipitation: {
      probability: 10,
      intensity: 0
    },
    suitability: {
      overall: 85,
      factors: {
        wind: 80,
        waves: 90,
        waterTemperature: 85
      }
    },
    forecasts: []
  };

  // Activity-specific data
  switch(activity.toLowerCase()) {
    case 'surfing':
      baseConditions.waves = {
        height: 1.2,
        period: 8,
        direction: 270,
        directionText: 'West'
      };
      break;

    case 'kitesurfing':
      baseConditions.wind.speed = 18;
      baseConditions.wind.gusts = 22;
      baseConditions.suitability.overall = 92;
      baseConditions.suitability.factors.wind = 95;
      break;

    case 'windsurfing':
      baseConditions.wind.speed = 15;
      baseConditions.wind.gusts = 18;
      baseConditions.suitability.overall = 88;
      baseConditions.suitability.factors.wind = 90;
      break;
  }

  return baseConditions;
}

// Sample coaches data
function getSampleCoaches() {
  return [
    {
      id: 1,
      name: 'Sarah Johnson',
      sport: 'Surfing',
      rating: 4.9,
      price: '$80/hr',
      hourlyRate: 80,
      location: {
        latitude: 34.0195,
        longitude: -118.4912
      },
      skills: [
        {
          activity: 'surfing',
          levels: ['beginner', 'intermediate', 'advanced']
        }
      ],
      specialties: ['surfing'],
      availability: {
        weeklySchedule: [
          [], // Sunday
          ['morning', 'afternoon'], // Monday
          ['morning', 'afternoon'], // Tuesday
          ['morning', 'afternoon'], // Wednesday
          ['morning', 'afternoon'], // Thursday
          ['morning', 'afternoon'], // Friday
          ['morning'] // Saturday
        ],
        blockedDates: ['2025-08-01', '2025-08-02']
      },
      reviewCount: 42,
      yearsExperience: 8
    },
    {
      id: 2,
      name: 'Mike Chen',
      sport: 'Kitesurfing',
      rating: 4.8,
      price: '$90/hr',
      hourlyRate: 90,
      location: {
        latitude: 34.0224,
        longitude: -118.5009
      },
      skills: [
        {
          activity: 'kitesurfing',
          levels: ['beginner', 'intermediate', 'advanced', 'expert']
        },
        {
          activity: 'windsurfing',
          levels: ['beginner', 'intermediate']
        }
      ],
      specialties: ['kitesurfing', 'windsurfing'],
      availability: {
        weeklySchedule: [
          ['morning', 'afternoon'], // Sunday
          [], // Monday
          ['afternoon'], // Tuesday
          ['afternoon'], // Wednesday
          ['morning', 'afternoon'], // Thursday
          ['morning', 'afternoon'], // Friday
          ['morning', 'afternoon'] // Saturday
        ],
        blockedDates: ['2025-07-28']
      },
      reviewCount: 37,
      yearsExperience: 12
    },
    {
      id: 3,
      name: 'Emma Wilson',
      sport: 'Windsurfing',
      rating: 4.7,
      price: '$75/hr',
      hourlyRate: 75,
      location: {
        latitude: 34.0157,
        longitude: -118.5072
      },
      skills: [
        {
          activity: 'windsurfing',
          levels: ['beginner', 'intermediate', 'advanced']
        },
        {
          activity: 'surfing',
          levels: ['beginner']
        }
      ],
      specialties: ['windsurfing', 'surfing'],
      availability: {
        weeklySchedule: [
          ['afternoon'], // Sunday
          ['morning'], // Monday
          ['morning'], // Tuesday
          [], // Wednesday
          ['morning'], // Thursday
          ['morning', 'afternoon'], // Friday
          ['morning', 'afternoon'] // Saturday
        ],
        blockedDates: ['2025-07-29']
      },
      reviewCount: 26,
      yearsExperience: 6
    }
  ];
}

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // In production, this would hash the password and save to database
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      firstName,
      lastName,
      role,
      phone,
      status: role === 'STUDENT' ? 'ACTIVE' : 'PENDING_VERIFICATION',
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    // Generate JWT token (in production, use proper JWT library)
    const token = Buffer.from(JSON.stringify({ userId: user.id, role: user.role })).toString('base64');

    res.json({
      success: true,
      user,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mock user lookup (in production, query database)
    const user = {
      id: 'user123',
      email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: true,
    };

    const token = Buffer.from(JSON.stringify({ userId: user.id, role: user.role })).toString('base64');

    res.json({
      success: true,
      user,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Booking endpoints
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;

    // Mock booking creation
    const booking = {
      id: Math.random().toString(36).substr(2, 9),
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { coach_id, student_id, status, date } = req.query;

    // Mock bookings data
    const mockBookings = [
      {
        id: 'booking1',
        student: { first_name: 'Alice', last_name: 'Johnson' },
        coach_id: 'coach1',
        activity: 'Surfing Lesson',
        booking_date: '2025-08-15',
        start_time: '10:00',
        duration_minutes: 60,
        status: 'confirmed',
        coach_amount: 7500, // $75 in cents
        location_name: 'Main Beach',
      },
      {
        id: 'booking2',
        student: { first_name: 'Bob', last_name: 'Smith' },
        coach_id: 'coach1',
        activity: 'SUP Lesson',
        booking_date: '2025-08-16',
        start_time: '14:00',
        duration_minutes: 90,
        status: 'pending',
        coach_amount: 9000, // $90 in cents
        location_name: 'North Shore',
      }
    ];

    // Filter bookings based on query parameters
    let filteredBookings = mockBookings;

    if (coach_id) {
      filteredBookings = filteredBookings.filter(b => b.coach_id === coach_id);
    }

    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }

    if (date) {
      filteredBookings = filteredBookings.filter(b => b.booking_date === date);
    }

    res.json({
      success: true,
      bookings: filteredBookings,
      total: filteredBookings.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Payment endpoints
app.post('/api/payments/create-connect-account', async (req, res) => {
  try {
    const { type, business_info } = req.body;

    // Mock Stripe Connect account creation
    const account = {
      id: 'acct_' + Math.random().toString(36).substr(2, 16),
      type,
      business_info,
      status: 'pending',
      onboarding_url: 'https://connect.stripe.com/setup/...',
    };

    res.json({
      success: true,
      account,
      message: 'Connect account created successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/payments/earnings', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Mock earnings data
    const earnings = {
      total_earned: 125000, // $1,250 in cents
      available_balance: 50000, // $500 in cents
      total_bookings: 15,
      average_session_value: 8333, // ~$83 in cents
      repeat_customer_rate: 65,
    };

    res.json({
      success: true,
      earnings
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Coach availability endpoints
app.get('/api/coaches/:coachId/availability', async (req, res) => {
  try {
    const { coachId } = req.params;
    const { startDate, endDate } = req.query;

    // Mock availability data
    const availability = {
      '2025-08-15': {
        '10:00': false, // booked
        '11:00': true,
        '14:00': true,
        '15:00': true,
      },
      '2025-08-16': {
        '09:00': true,
        '10:00': true,
        '14:00': false, // booked
        '15:00': true,
      }
    };

    const bookings = [
      {
        date: '2025-08-15',
        time: '10:00',
        student: 'Alice Johnson'
      }
    ];

    res.json({
      success: true,
      availability,
      bookings
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PayFast webhook endpoint
app.post('/api/webhooks/payfast', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('PayFast webhook received:', webhookData);

    // Verify webhook signature (in production, implement proper verification)
    const {
      payment_status,
      custom_str1: orderId,
      amount_gross,
      pf_payment_id,
      signature,
    } = webhookData;

    // Mock webhook processing
    if (payment_status === 'COMPLETE') {
      console.log(`Payment completed for order ${orderId}: ${amount_gross}`);

      // Update order status
      // In production, update database and process bookings

      // Send confirmation notifications
      // In production, trigger email/SMS notifications
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Revenue split configuration endpoints
app.get('/api/revenue-splits/configurations', async (req, res) => {
  try {
    // Mock revenue split configurations
    const configurations = [
      {
        id: 'org1_coach1_surfing',
        organizationId: 'org1',
        coachId: 'coach1',
        activityType: 'surfing',
        coach: 75.0,
        surfShop: 22.5,
        platform: 2.5,
        name: 'Expert Surfer Premium Split',
        description: 'Higher split for experienced surf instructors',
        effectiveDate: '2025-01-01T00:00:00Z',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'org1_all_sup',
        organizationId: 'org1',
        coachId: null,
        activityType: 'sup',
        coach: 72.5,
        surfShop: 25.0,
        platform: 2.5,
        name: 'SUP Instructor Split',
        description: 'Standard split for SUP lessons',
        effectiveDate: '2025-01-01T00:00:00Z',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
    ];

    res.json({
      success: true,
      configurations
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/revenue-splits/configurations', async (req, res) => {
  try {
    const configData = req.body;

    // Mock configuration creation
    const configuration = {
      id: `${configData.organizationId}_${configData.coachId || 'all'}_${configData.activityType || 'all'}`,
      ...configData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      configuration,
      message: 'Revenue split configuration created successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cart and order endpoints
app.post('/api/orders/create', async (req, res) => {
  try {
    const orderData = req.body;

    // Mock order creation
    const order = {
      id: Math.random().toString(36).substr(2, 9),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/orders/:orderId/payment-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentId, paymentAmount } = req.body;

    // Mock order update
    const updatedOrder = {
      id: orderId,
      status,
      paymentId,
      paymentAmount,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Discount code endpoint
app.post('/api/cart/apply-discount', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    // Mock discount codes
    const discountCodes = {
      'WELCOME10': { percentage: 10, description: 'Welcome discount' },
      'SUMMER25': { percentage: 25, description: 'Summer special' },
      'STUDENT15': { percentage: 15, description: 'Student discount' },
    };

    const discount = discountCodes[code.toUpperCase()];

    if (!discount) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid discount code'
      });
    }

    const discountAmount = Math.round((cartTotal * discount.percentage) / 100);

    res.json({
      valid: true,
      discountAmount,
      discountPercentage: discount.percentage,
      description: discount.description,
      message: 'Discount applied successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/bookings');
  console.log('- GET /api/bookings');
  console.log('- POST /api/payments/create-connect-account');
  console.log('- GET /api/payments/earnings');
  console.log('- GET /api/coaches/:coachId/availability');
});

module.exports = app;
