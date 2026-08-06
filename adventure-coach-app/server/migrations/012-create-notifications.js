'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('booking', 'booking_confirmation', 'booking_reminder', 'payment', 'coach_match', 'weather_alert', 'general'),
        allowNull: false, defaultValue: 'general',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.STRING, allowNull: false },
      data: { type: Sequelize.JSONB, defaultValue: {} },
      read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      read_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['user_id', 'read']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['created_at']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('notifications');
  },
};
