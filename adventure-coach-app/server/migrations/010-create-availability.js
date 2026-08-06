'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('availability', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      coach_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'coaches', key: 'id' }, onDelete: 'CASCADE',
      },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      start_time: { type: Sequelize.STRING, allowNull: false },
      end_time: { type: Sequelize.STRING, allowNull: false },
      is_available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      booking_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'bookings', key: 'id' }, onDelete: 'SET NULL',
      },
      reason: { type: Sequelize.ENUM('booked', 'blocked', 'vacation'), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('availability', ['coach_id']);
    await queryInterface.addIndex('availability', ['date']);
    await queryInterface.addIndex('availability', ['coach_id', 'date']);
    await queryInterface.addIndex('availability', ['booking_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('availability');
  },
};
