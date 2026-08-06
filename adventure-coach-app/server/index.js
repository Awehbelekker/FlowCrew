require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const { sequelize, connectDatabase, models } = require('./models');
const { User, Coach, SurfShop, Booking, Payment, Order, OrderItem,
        RevenueSplit, Availability, Notification, DiscountCode } = models;

// Adventure relevance scorer (unchanged - pure computation, no DB dependency)
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
    let score = 0;

    if (userContext.location && coach.location) {
      const distance = Math.random() * 50; // TODO: real haversine distance
      score += this.weights.locationProximity * Math.max(0, 1 - distance / 50);
    }

    const skillMatch = coach.specialties?.includes(userContext.activity) ? 1 : 0.5;
    score += this.weights.skillAlignment * skillMatch;

    const priceScore = userContext.budget
      ? Math.max(0, 1 - Math.abs(coach.hourly_rate - userContext.budget) / userContext.budget)
      : 0.5;
    score += this.weights.priceMatch * priceScore;

    score += this.weights.reviewScore * ((coach.rating || 0) / 5);
    score += this.weights.availabilityMatch * 0.8;
    score += this.weights.weatherSuitability * 0.7;
    score += this.weights.experienceLevel * 0.6;

    return Math.min(1, Math.max(0, score));
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const relevanceScorer = new AdventureRelevanceScorer();

// --- Auth middleware ---
// Verifies the JWT that User.prototype.generateJWT() issues and attaches
// the decoded payload to req.user. Routes that touch a specific user's data
// use this instead of trusting a userId passed in the request body.
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- Health check ---
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }
  res.json({ status: 'online', database: dbStatus, timestamp: new Date().toISOString() });
});

// --- Weather intelligence (unchanged - compute-only) ---
app.get('/api/weather-intelligence', (req, res) => {
  const { activity } = req.query;
  res.json(getSimulatedWeatherData(activity || 'surfing'));
});

// --- Coach matching (now queries real coaches instead of hardcoded array) ---
app.post('/api/match-coaches', async (req, res) => {
  try {
    const { location, userPreferences } = req.body;

    const coaches = await Coach.findAll({
      where: { status: 'ACTIVE', verification_status: 'VERIFIED' },
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'profile_image_url'] }],
      limit: 50,
    });

    const weatherData = getSimulatedWeatherData(userPreferences?.activity || 'surfing');
    const context = { ...userPreferences, location, weatherConditions: weatherData };

    const scoredCoaches = coaches.map(coach => {
      const relevanceScore = relevanceScorer.calculateRelevanceScore(coach, context);
      return {
        ...coach.toJSON(),
        relevanceScore,
        weatherSuitability: weatherData.suitability.overall,
      };
    });

    scoredCoaches.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({ coaches: scoredCoaches, weatherIntelligence: weatherData });
  } catch (error) {
    console.error('match-coaches error:', error);
    res.status(500).json({ error: 'Failed to match coaches' });
  }
});

function getSimulatedWeatherData(activity) {
  const baseConditions = {
    timestamp: new Date().toISOString(),
    location: { name: 'Santa Monica, CA', coordinates: { latitude: 34.0195, longitude: -118.4912 } },
    wind: { speed: 12, direction: 225, directionText: 'Southwest', gusts: 15 },
    temperature: { air: 22, water: 18 },
    sun: { sunrise: '06:15', sunset: '20:05' },
    precipitation: { probability: 10, intensity: 0 },
    suitability: { overall: 85, factors: { wind: 80, waves: 90, waterTemperature: 85 } },
    forecasts: [],
  };

  switch ((activity || '').toLowerCase()) {
    case 'surfing':
      baseConditions.waves = { height: 1.2, period: 8, direction: 270, directionText: 'West' };
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

// --- Auth: register ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'email, password, firstName, and lastName are required' });
    }

    const existing = await User.findByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // password_hash column receives the plaintext here deliberately - the
    // model's beforeCreate hook (see models/User.js) hashes it with bcrypt.
    const user = await User.create({
      email: email.toLowerCase(),
      password_hash: password,
      first_name: firstName,
      last_name: lastName,
      role: role || 'STUDENT',
      phone: phone || null,
      status: (role === 'STUDENT' || !role) ? 'ACTIVE' : 'PENDING_VERIFICATION',
    });

    const token = user.generateJWT();

    res.json({ success: true, user, token, message: 'Registration successful' });
  } catch (error) {
    console.error('register error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// --- Auth: login ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await user.updateLastLogin();
    const token = user.generateJWT();

    res.json({ success: true, user, token, message: 'Login successful' });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Bookings: create ---
app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const { coachId, activity, bookingDate, startTime, durationMinutes, locationName, totalAmount, coachAmount, platformFee } = req.body;

    if (!coachId || !activity || !bookingDate || !startTime) {
      return res.status(400).json({ error: 'coachId, activity, bookingDate, and startTime are required' });
    }

    const booking = await Booking.create({
      student_id: req.user.id,
      coach_id: coachId,
      activity,
      booking_date: bookingDate,
      start_time: startTime,
      duration_minutes: durationMinutes || 60,
      location_name: locationName || null,
      total_amount: totalAmount || 0,
      coach_amount: coachAmount || 0,
      platform_fee: platformFee || 0,
      status: 'pending',
    });

    res.json({ success: true, booking, message: 'Booking created successfully' });
  } catch (error) {
    console.error('create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// --- Bookings: list ---
app.get('/api/bookings', requireAuth, async (req, res) => {
  try {
    const { coach_id, status, date } = req.query;

    const where = {};
    // Scope to the requesting user unless they're looking up a specific
    // coach_id they own (coaches querying their own bookings).
    if (coach_id) {
      where.coach_id = coach_id;
    } else {
      where.student_id = req.user.id;
    }
    if (status) where.status = status;
    if (date) where.booking_date = date;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['first_name', 'last_name'] },
        { model: Coach, as: 'coach' },
      ],
      order: [['booking_date', 'DESC']],
    });

    res.json({ success: true, bookings, total: bookings.length });
  } catch (error) {
    console.error('list bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// --- Payments: Stripe Connect account creation ---
// NOTE: this still does not call the real Stripe API - that integration
// (stripe npm package is a dependency but unused here) is a separate task.
// What changed: it now persists the account id against the real User record
// instead of returning a value nothing stores.
app.post('/api/payments/create-connect-account', requireAuth, async (req, res) => {
  try {
    const { type } = req.body;

    const mockAccountId = 'acct_' + Math.random().toString(36).substr(2, 16);

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.stripe_account_id = mockAccountId;
    await user.save();

    res.json({
      success: true,
      account: { id: mockAccountId, type, status: 'pending', onboarding_url: 'https://connect.stripe.com/setup/...' },
      message: 'Connect account created successfully (Stripe API integration still pending - see comment)',
    });
  } catch (error) {
    console.error('create-connect-account error:', error);
    res.status(500).json({ error: 'Failed to create connect account' });
  }
});

// --- Payments: earnings ---
app.get('/api/payments/earnings', requireAuth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = end_date ? new Date(end_date) : new Date();

    const coach = await Coach.findOne({ where: { user_id: req.user.id } });
    if (!coach) {
      return res.status(404).json({ error: 'No coach profile found for this user' });
    }

    const summary = await Payment.getEarningsSummary(req.user.id, startDate, endDate);

    res.json({
      success: true,
      earnings: {
        total_earned: summary.total_earned,
        available_balance: coach.total_earnings,
        total_bookings: summary.total_bookings,
        average_session_value: summary.total_bookings > 0 ? Math.round(summary.total_earned / summary.total_bookings) : 0,
        repeat_customer_rate: null, // TODO: real calculation needs booking history grouped by student
      },
    });
  } catch (error) {
    console.error('earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// --- Coach availability ---
app.get('/api/coaches/:coachId/availability', async (req, res) => {
  try {
    const { coachId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { coach_id: coachId };
    if (startDate && endDate) {
      where.date = { [sequelize.Sequelize.Op.between]: [startDate, endDate] };
    }

    const slots = await Availability.findAll({ where, order: [['date', 'ASC'], ['start_time', 'ASC']] });

    const bookedSlots = await Booking.findAll({
      where: { coach_id: coachId, status: ['confirmed', 'pending'] },
      include: [{ model: User, as: 'student', attributes: ['first_name', 'last_name'] }],
    });

    res.json({
      success: true,
      availability: slots,
      bookings: bookedSlots.map(b => ({
        date: b.booking_date,
        time: b.start_time,
        student: b.student ? `${b.student.first_name} ${b.student.last_name}` : 'Unknown',
      })),
    });
  } catch (error) {
    console.error('availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// --- PayFast webhook ---
app.post('/api/webhooks/payfast', async (req, res) => {
  try {
    const { payment_status, custom_str1: orderId, amount_gross, pf_payment_id } = req.body;
    console.log('PayFast webhook received:', req.body);

    // TODO: verify webhook signature against PayFast's documented scheme
    // before trusting any of this payload - currently unverified.

    if (payment_status === 'COMPLETE' && orderId) {
      const order = await Order.findByPk(orderId);
      if (order) {
        await order.markPaid();

        await Payment.create({
          user_id: order.user_id,
          order_id: order.id,
          amount: Math.round(parseFloat(amount_gross) * 100),
          provider: 'payfast',
          provider_payment_id: pf_payment_id,
          status: 'completed',
          processed_at: new Date(),
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// --- Revenue split configurations ---
app.get('/api/revenue-splits/configurations', async (req, res) => {
  try {
    const { organizationId } = req.query;
    const where = organizationId ? { organization_id: organizationId } : {};

    const configurations = await RevenueSplit.findAll({ where, order: [['effective_date', 'DESC']] });
    res.json({ success: true, configurations });
  } catch (error) {
    console.error('revenue-splits error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue split configurations' });
  }
});

app.post('/api/revenue-splits/configurations', requireAuth, async (req, res) => {
  try {
    const configuration = await RevenueSplit.create(req.body);
    res.json({ success: true, configuration, message: 'Revenue split configuration created successfully' });
  } catch (error) {
    console.error('create revenue-split error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to create revenue split configuration' });
  }
});

// --- Orders ---
app.post('/api/orders/create', requireAuth, async (req, res) => {
  try {
    const { subtotal, discountAmount, discountCode, totalAmount, currency } = req.body;

    const order = await Order.create({
      user_id: req.user.id,
      subtotal: subtotal || 0,
      discount_amount: discountAmount || 0,
      discount_code: discountCode || null,
      total_amount: totalAmount || subtotal || 0,
      currency: currency || 'USD',
      status: 'pending',
    });

    res.json({ success: true, order, message: 'Order created successfully' });
  } catch (error) {
    console.error('create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:orderId/payment-status', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentId, paymentAmount } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    await order.save();

    if (paymentId) {
      await Payment.create({
        user_id: order.user_id,
        order_id: order.id,
        amount: paymentAmount || order.total_amount,
        provider_payment_id: paymentId,
        status: status === 'paid' ? 'completed' : 'pending',
        processed_at: status === 'paid' ? new Date() : null,
      });
    }

    res.json({ success: true, order, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// --- Discount codes ---
app.post('/api/cart/apply-discount', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, message: 'Discount code is required' });
    }

    const discount = await DiscountCode.findValidByCode(code);

    if (!discount) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired discount code' });
    }

    const discountAmount = discount.calculateDiscount(cartTotal || 0);

    res.json({
      valid: true,
      discountAmount,
      discountPercentage: parseFloat(discount.percentage),
      description: discount.description,
      message: 'Discount applied successfully',
    });
  } catch (error) {
    console.error('apply-discount error:', error);
    res.status(500).json({ error: 'Failed to apply discount code' });
  }
});

// --- Start server ---
const start = async () => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('⚠️  Starting without a verified database connection - routes touching the DB will fail until this is fixed.');
    console.error(error.message);
  }

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('Now backed by Sequelize models (see server/models/) instead of in-memory mocks.');
    console.log('Available endpoints:');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    console.log('- POST /api/bookings (auth required)');
    console.log('- GET  /api/bookings (auth required)');
    console.log('- POST /api/payments/create-connect-account (auth required)');
    console.log('- GET  /api/payments/earnings (auth required)');
    console.log('- GET  /api/coaches/:coachId/availability');
    console.log('- POST /api/webhooks/payfast');
    console.log('- GET  /api/revenue-splits/configurations');
    console.log('- POST /api/revenue-splits/configurations (auth required)');
    console.log('- POST /api/orders/create (auth required)');
    console.log('- PUT  /api/orders/:orderId/payment-status (auth required)');
    console.log('- POST /api/cart/apply-discount');
    console.log('- GET  /api/weather-intelligence');
    console.log('- POST /api/match-coaches');
  });
};

start();

module.exports = app;
