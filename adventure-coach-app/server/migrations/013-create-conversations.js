'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      type: { type: Sequelize.ENUM('direct', 'group', 'support', 'whatsapp'), allowNull: false, defaultValue: 'direct' },
      source: { type: Sequelize.ENUM('in_app', 'whatsapp'), allowNull: false, defaultValue: 'in_app' },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      last_message_at: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.ENUM('active', 'archived'), allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('conversations', ['type']);
    await queryInterface.addIndex('conversations', ['source']);
    await queryInterface.addIndex('conversations', ['last_message_at']);

    // Join table for Conversation.belongsToMany(User) / User.belongsToMany(Conversation)
    // as declared in models/index.js's defineAssociations()
    await queryInterface.createTable('conversation_participants', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      conversation_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('conversation_participants', ['conversation_id']);
    await queryInterface.addIndex('conversation_participants', ['user_id']);
    await queryInterface.addIndex('conversation_participants', ['conversation_id', 'user_id'], { unique: true });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('conversation_participants');
    await queryInterface.dropTable('conversations');
  },
};
