'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_items', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE',
      },
      coach_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'coaches', key: 'id' }, onDelete: 'SET NULL',
      },
      package_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'packages', key: 'id' }, onDelete: 'SET NULL',
      },
      item_type: { type: Sequelize.ENUM('lesson', 'package', 'gear_rental'), allowNull: false, defaultValue: 'lesson' },
      description: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: Sequelize.INTEGER, allowNull: false },
      subtotal: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('order_items', ['coach_id']);
    await queryInterface.addIndex('order_items', ['package_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('order_items');
  },
};
