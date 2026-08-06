'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('packages', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      coach_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'coaches', key: 'id' }, onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      sessions_included: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.INTEGER, allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      validity_days: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 90 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('packages', ['coach_id']);
    await queryInterface.addIndex('packages', ['active']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('packages');
  },
};
