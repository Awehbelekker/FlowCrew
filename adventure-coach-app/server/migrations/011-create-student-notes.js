'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_notes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      coach_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'coaches', key: 'id' }, onDelete: 'CASCADE',
      },
      student_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      booking_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'bookings', key: 'id' }, onDelete: 'SET NULL',
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      tags: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      visible_to_student: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('student_notes', ['coach_id']);
    await queryInterface.addIndex('student_notes', ['student_id']);
    await queryInterface.addIndex('student_notes', ['coach_id', 'student_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('student_notes');
  },
};
