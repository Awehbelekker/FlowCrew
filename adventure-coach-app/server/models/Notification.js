module.exports = (sequelize, DataTypes) => {
  // Field shape matches what NotificationService.js already constructs
  // client-side for every notification type it sends (title, body, data,
  // type) - this table is the persistence layer that service is missing.
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM(
        'booking', 'booking_confirmation', 'booking_reminder',
        'payment', 'coach_match', 'weather_alert', 'general'
      ),
      allowNull: false,
      defaultValue: 'general',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'notifications',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['user_id', 'read'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
    ],
  });

  // Instance methods
  Notification.prototype.markRead = async function() {
    this.read = true;
    this.read_at = new Date();
    await this.save();
  };

  // Class methods
  Notification.findUnreadForUser = function(userId) {
    return this.findAll({
      where: { user_id: userId, read: false },
      order: [['created_at', 'DESC']],
    });
  };

  Notification.markAllRead = function(userId) {
    return this.update(
      { read: true, read_at: new Date() },
      { where: { user_id: userId, read: false } }
    );
  };

  return Notification;
};
