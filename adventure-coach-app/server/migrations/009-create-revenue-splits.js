'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('revenue_splits', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      organization_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'surf_shops', key: 'id' }, onDelete: 'CASCADE',
      },
      coach_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'coaches', key: 'id' }, onDelete: 'CASCADE',
      },
      activity_type: { type: Sequelize.STRING, allowNull: true },
      coach_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      surf_shop_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      platform_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      effective_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('revenue_splits', ['organization_id']);
    await queryInterface.addIndex('revenue_splits', ['coach_id']);
    await queryInterface.addIndex('revenue_splits', ['activity_type']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('revenue_splits');
  },
};
