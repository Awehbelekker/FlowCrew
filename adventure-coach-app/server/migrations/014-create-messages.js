'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      conversation_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'users', key: 'id' }, onDelete: 'SET NULL',
      },
      type: { type: Sequelize.ENUM('text', 'audio', 'image', 'document'), allowNull: false, defaultValue: 'text' },
      content: { type: Sequelize.TEXT, allowNull: true },
      attachments: { type: Sequelize.JSONB, defaultValue: [] },
      reactions: { type: Sequelize.JSONB, defaultValue: [] },
      source: { type: Sequelize.ENUM('in_app', 'whatsapp'), allowNull: false, defaultValue: 'in_app' },
      read_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('messages', ['conversation_id']);
    await queryInterface.addIndex('messages', ['sender_id']);
    await queryInterface.addIndex('messages', ['created_at']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('messages');
  },
};
