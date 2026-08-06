module.exports = (sequelize, DataTypes) => {
  // Shape matches what CommunicationService.js/WhatsAppIntegrationService.js
  // already send when creating a conversation: participants (join table via
  // belongsToMany in models/index.js), type, and a metadata bag that holds
  // WhatsApp-specific fields like phoneNumber for source:'whatsapp' threads.
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('direct', 'group', 'support', 'whatsapp'),
      allowNull: false,
      defaultValue: 'direct',
    },
    source: {
      type: DataTypes.ENUM('in_app', 'whatsapp'),
      allowNull: false,
      defaultValue: 'in_app',
    },
    // e.g. { phoneNumber, platform } for WhatsApp-sourced conversations
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      allowNull: false,
      defaultValue: 'active',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'conversations',
    indexes: [
      { fields: ['type'] },
      { fields: ['source'] },
      { fields: ['last_message_at'] },
    ],
  });

  // Class methods
  // Note: WhatsAppIntegrationService.js's getOrCreateConversation looks up by
  // phone number - that requires querying the metadata JSONB field, e.g.
  // WHERE metadata->>'phoneNumber' = :phoneNumber, once wired to real routes.
  Conversation.findByPhoneNumber = function(phoneNumber) {
    return this.findOne({
      where: {
        source: 'whatsapp',
        metadata: {
          phoneNumber: phoneNumber,
        },
      },
    });
  };

  return Conversation;
};
