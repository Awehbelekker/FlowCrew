const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with environment-specific config
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: env === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Coach = require('./Coach')(sequelize, Sequelize.DataTypes);
const SurfShop = require('./SurfShop')(sequelize, Sequelize.DataTypes);
const Booking = require('./Booking')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const Order = require('./Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);
const RevenueSplit = require('./RevenueSplit')(sequelize, Sequelize.DataTypes);
const Availability = require('./Availability')(sequelize, Sequelize.DataTypes);
const StudentNote = require('./StudentNote')(sequelize, Sequelize.DataTypes);
const Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const Conversation = require('./Conversation')(sequelize, Sequelize.DataTypes);
const Review = require('./Review')(sequelize, Sequelize.DataTypes);
const Package = require('./Package')(sequelize, Sequelize.DataTypes);
const DiscountCode = require('./DiscountCode')(sequelize, Sequelize.DataTypes);

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasOne(Coach, { foreignKey: 'user_id', as: 'coachProfile' });
  User.hasOne(SurfShop, { foreignKey: 'owner_id', as: 'ownedSurfShop' });
  User.hasMany(Booking, { foreignKey: 'student_id', as: 'studentBookings' });
  User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  User.hasMany(Review, { foreignKey: 'student_id', as: 'givenReviews' });

  // Coach associations
  Coach.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Coach.belongsTo(SurfShop, { foreignKey: 'surf_shop_id', as: 'surfShop' });
  Coach.hasMany(Booking, { foreignKey: 'coach_id', as: 'coachBookings' });
  Coach.hasMany(Availability, { foreignKey: 'coach_id', as: 'availability' });
  Coach.hasMany(StudentNote, { foreignKey: 'coach_id', as: 'studentNotes' });
  Coach.hasMany(Review, { foreignKey: 'coach_id', as: 'receivedReviews' });
  Coach.hasMany(Package, { foreignKey: 'coach_id', as: 'packages' });
  Coach.hasMany(RevenueSplit, { foreignKey: 'coach_id', as: 'revenueSplits' });

  // SurfShop associations
  SurfShop.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
  SurfShop.hasMany(Coach, { foreignKey: 'surf_shop_id', as: 'coaches' });
  SurfShop.hasMany(RevenueSplit, { foreignKey: 'organization_id', as: 'revenueSplits' });

  // Booking associations
  Booking.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
  Booking.belongsTo(Coach, { foreignKey: 'coach_id', as: 'coach' });
  Booking.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });
  Booking.hasOne(Review, { foreignKey: 'booking_id', as: 'review' });

  // Payment associations
  Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
  Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  // Order associations
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  Order.hasMany(Booking, { foreignKey: 'order_id', as: 'bookings' });
  Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Coach, { foreignKey: 'coach_id', as: 'coach' });
  OrderItem.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });

  // RevenueSplit associations
  RevenueSplit.belongsTo(Coach, { foreignKey: 'coach_id', as: 'coach' });
  RevenueSplit.belongsTo(SurfShop, { foreignKey: 'organization_id', as: 'organization' });

  // Availability associations
  Availability.belongsTo(Coach, { foreignKey: 'coach_id', as: 'coach' });

  // StudentNote associations
  StudentNote.belongsTo(Coach, { foreignKey: 'coach_id', as: 'coach' });
  StudentNote.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Message and Conversation associations
  Conversation.belongsToMany(User, {
    through: 'conversation_participants',
    foreignKey: 'conversation_id',
    as: 'participants'
  });

  Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
  Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

  Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });

  // Review associations
  Review.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
  Review.belongsTo(Coach, { foreignKey: 'coach_id', as: 'coach' });
  Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

  // Package associations
  Package.belongsTo(Coach, { foreignKey: 'coach_id', as: 'coach' });
  Package.hasMany(OrderItem, { foreignKey: 'package_id', as: 'orderItems' });

  // DiscountCode associations
  DiscountCode.belongsTo(SurfShop, { foreignKey: 'organization_id', as: 'organization' });
};

// Initialize associations
defineAssociations();

// Database connection and sync
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    if (process.env.NODE_ENV === 'development') {
      // Sync database in development
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Export models and sequelize instance
module.exports = {
  sequelize,
  connectDatabase,
  models: {
    User,
    Coach,
    SurfShop,
    Booking,
    Payment,
    Order,
    OrderItem,
    RevenueSplit,
    Availability,
    StudentNote,
    Notification,
    Message,
    Conversation,
    Review,
    Package,
    DiscountCode,
  },
};
