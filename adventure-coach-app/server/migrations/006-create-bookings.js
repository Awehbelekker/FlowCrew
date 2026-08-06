'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      student_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      coach_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'coaches', key: 'id' }, onDelete: 'CASCADE',
      },
      order_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'orders', key: 'id' }, onDelete: 'SET NULL',
      },
      activity: { type: Sequelize.STRING, allowNull: false },
      booking_date: { type: Sequelize.DATEONLY, allowNull: false },
      start_time: { type: Sequelize.STRING, allowNull: false },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 60 },
      location_name: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'canceled', 'no_show'), allowNull: false, defaultValue: 'pending' },
      cancellation_reason: { type: Sequelize.TEXT, allowNull: true },
      canceled_by: { type: Sequelize.UUID, allowNull: true },
      total_amount: { type: Sequelize.INTEGER, allowNull: false },
      coach_amount: { type: Sequelize.INTEGER, allowNull: false },
      platform_fee: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('bookings', ['student_id']);
    await queryInterface.addIndex('bookings', ['coach_id']);
    await queryInterface.addIndex('bookings', ['order_id']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['booking_date']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('bookings');
  },
};
