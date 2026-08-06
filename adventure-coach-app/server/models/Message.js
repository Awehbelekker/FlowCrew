module.exports = (sequelize, DataTypes) => {
  // Field shape matches EnhancedChatInterface.js's local message state
  // (content, type, audioUrl/duration for voice notes, imageUrl, reactions)
  // so persisted messages round-trip through the API without reshaping.
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: true, // null for WhatsApp-inbound messages not yet linked to a user
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    type: {
      type: DataTypes.ENUM('text', 'audio', 'image', 'document'),
      allowNull: false,
      defaultValue: 'text',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    reactions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    source: {
      type: DataTypes.ENUM('in_app', 'whatsapp'),
      allowNull: false,
      defaultValue: 'in_app',
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'messages',
    indexes: [
      { fields: ['conversation_id'] },
      { fields: ['sender_id'] },
      { fields: ['created_at'] },
    ],
  });

  // Instance methods
  Message.prototype.addReaction = async function(reaction) {
    this.reactions = [...(this.reactions || []), reaction];
    await this.save();
  };

  Message.prototype.markRead = async function() {
    this.read_at = new Date();
    await this.save();
  };

  return Message;
};
