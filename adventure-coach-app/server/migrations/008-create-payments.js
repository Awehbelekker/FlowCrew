'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      booking_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'bookings', key: 'id' }, onDelete: 'SET NULL',
      },
      order_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'orders', key: 'id' }, onDelete: 'SET NULL',
      },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      provider: { type: Sequelize.ENUM('stripe', 'payfast'), allowNull: false, defaultValue: 'stripe' },
      provider_payment_id: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
      payment_method: { type: Sequelize.STRING, allowNull: true },
      failure_reason: { type: Sequelize.TEXT, allowNull: true },
      processed_at: { type: Sequelize.DATE, allowNull: true },
      refunded_amount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['booking_id']);
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['provider_payment_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('payments');
  },
};
