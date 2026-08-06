module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    coach_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'coaches',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    activity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: 15,
        max: 480,
      },
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'canceled', 'no_show'),
      allowNull: false,
      defaultValue: 'pending',
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    canceled_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.INTEGER, // cents, matches server/index.js mock (coach_amount in cents)
      allowNull: false,
    },
    coach_amount: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
    },
    platform_fee: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'bookings',
    indexes: [
      { fields: ['student_id'] },
      { fields: ['coach_id'] },
      { fields: ['order_id'] },
      { fields: ['status'] },
      { fields: ['booking_date'] },
    ],
  });

  // Instance methods
  Booking.prototype.isCancelable = function() {
    return ['pending', 'confirmed'].includes(this.status);
  };

  Booking.prototype.cancel = async function(reason, canceledBy) {
    this.status = 'canceled';
    this.cancellation_reason = reason;
    this.canceled_by = canceledBy;
    await this.save();
  };

  Booking.prototype.confirm = async function() {
    this.status = 'confirmed';
    await this.save();
  };

  // Class methods
  Booking.findByCoach = function(coachId, filters = {}) {
    return this.findAll({
      where: { coach_id: coachId, ...filters },
      order: [['booking_date', 'DESC']],
    });
  };

  Booking.findUpcoming = function(userId, role = 'student') {
    const whereField = role === 'coach' ? 'coach_id' : 'student_id';
    return this.findAll({
      where: {
        [whereField]: userId,
        status: ['pending', 'confirmed'],
        booking_date: { [sequelize.Sequelize.Op.gte]: new Date() },
      },
      order: [['booking_date', 'ASC']],
    });
  };

  return Booking;
};
