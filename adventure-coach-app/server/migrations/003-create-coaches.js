'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coaches', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      surf_shop_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'surf_shops', key: 'id' }, onDelete: 'SET NULL',
      },
      bio: { type: Sequelize.TEXT, allowNull: true },
      specialties: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      experience_level: { type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'), allowNull: false, defaultValue: 'INTERMEDIATE' },
      years_experience: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      certifications: { type: Sequelize.JSONB, defaultValue: [] },
      languages: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: ['en'] },
      hourly_rate: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      location: { type: Sequelize.JSONB, allowNull: true, defaultValue: {} },
      service_radius_km: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 25 },
      availability_schedule: { type: Sequelize.JSONB, defaultValue: {} },
      booking_advance_days: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
      cancellation_policy: { type: Sequelize.ENUM('FLEXIBLE', 'MODERATE', 'STRICT'), allowNull: false, defaultValue: 'MODERATE' },
      instant_booking: { type: Sequelize.BOOLEAN, defaultValue: false },
      status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'), allowNull: false, defaultValue: 'PENDING_APPROVAL' },
      verification_status: { type: Sequelize.ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'), allowNull: false, defaultValue: 'UNVERIFIED' },
      verification_documents: { type: Sequelize.JSONB, defaultValue: {} },
      rating: { type: Sequelize.DECIMAL(3, 2), allowNull: true },
      review_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_bookings: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_earnings: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.00 },
      response_rate: { type: Sequelize.DECIMAL(5, 2), defaultValue: 100.00 },
      response_time_hours: { type: Sequelize.INTEGER, defaultValue: 24 },
      featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      featured_until: { type: Sequelize.DATE, allowNull: true },
      last_active_at: { type: Sequelize.DATE, allowNull: true },
      onboarding_completed: { type: Sequelize.BOOLEAN, defaultValue: false },
      stripe_connect_account_id: { type: Sequelize.STRING, allowNull: true },
      stripe_onboarding_completed: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('coaches', ['user_id']);
    await queryInterface.addIndex('coaches', ['surf_shop_id']);
    await queryInterface.addIndex('coaches', ['status']);
    await queryInterface.addIndex('coaches', ['verification_status']);
    await queryInterface.addIndex('coaches', ['rating']);
    await queryInterface.addIndex('coaches', ['hourly_rate']);
    await queryInterface.addIndex('coaches', ['specialties'], { using: 'gin' });
    await queryInterface.addIndex('coaches', ['featured', 'featured_until']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('coaches');
  },
};
