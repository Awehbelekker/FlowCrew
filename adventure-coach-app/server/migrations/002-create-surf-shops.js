'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('surf_shops', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      owner_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      logo_url: { type: Sequelize.STRING, allowNull: true },
      website: { type: Sequelize.STRING, allowNull: true },
      contact_email: { type: Sequelize.STRING, allowNull: true },
      contact_phone: { type: Sequelize.STRING, allowNull: true },
      location: { type: Sequelize.JSONB, defaultValue: {} },
      subscription: { type: Sequelize.JSONB, allowNull: false, defaultValue: { tier: 'free', status: 'active', current_period_end: null } },
      max_coaches: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      verification_status: { type: Sequelize.ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'), allowNull: false, defaultValue: 'UNVERIFIED' },
      status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'), allowNull: false, defaultValue: 'ACTIVE' },
      stripe_connect_account_id: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('surf_shops', ['owner_id']);
    await queryInterface.addIndex('surf_shops', ['status']);
    await queryInterface.addIndex('surf_shops', ['verification_status']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('surf_shops');
  },
};
