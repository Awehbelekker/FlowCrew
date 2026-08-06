'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('discount_codes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      organization_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'surf_shops', key: 'id' }, onDelete: 'CASCADE',
      },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING, allowNull: true },
      percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      valid_from: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      valid_until: { type: Sequelize.DATE, allowNull: true },
      usage_limit: { type: Sequelize.INTEGER, allowNull: true },
      times_used: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('discount_codes', ['code'], { unique: true });
    await queryInterface.addIndex('discount_codes', ['organization_id']);
    await queryInterface.addIndex('discount_codes', ['active']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('discount_codes');
  },
};
