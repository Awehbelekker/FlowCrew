'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reviews', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      student_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      coach_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'coaches', key: 'id' }, onDelete: 'CASCADE',
      },
      booking_id: {
        type: Sequelize.UUID, allowNull: false, unique: true,
        references: { model: 'bookings', key: 'id' }, onDelete: 'CASCADE',
      },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: true },
      coach_response: { type: Sequelize.TEXT, allowNull: true },
      coach_response_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('reviews', ['student_id']);
    await queryInterface.addIndex('reviews', ['coach_id']);
    await queryInterface.addIndex('reviews', ['booking_id'], { unique: true });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('reviews');
  },
};
