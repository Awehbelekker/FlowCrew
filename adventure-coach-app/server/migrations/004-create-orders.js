'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      subtotal: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      discount_amount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      discount_code: { type: Sequelize.STRING, allowNull: true },
      total_amount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: { type: Sequelize.ENUM('pending', 'paid', 'completed', 'canceled', 'refunded'), allowNull: false, defaultValue: 'pending' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['discount_code']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
  },
};
