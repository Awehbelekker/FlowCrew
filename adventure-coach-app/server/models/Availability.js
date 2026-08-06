module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true, // set when this slot is claimed by a booking
      references: {
        model: 'bookings',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    // Coach.js already stores a default weekly schedule in availability_schedule
    // (JSONB on the coach itself); this table is for explicit overrides/blocks
    // and confirmed booked slots, not the recurring default.
    reason: {
      type: DataTypes.ENUM('booked', 'blocked', 'vacation'),
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
    tableName: 'availability',
    indexes: [
      { fields: ['coach_id'] },
      { fields: ['date'] },
      { fields: ['coach_id', 'date'] },
      { fields: ['booking_id'] },
    ],
  });

  // Class methods
  Availability.findForCoachOnDate = function(coachId, date) {
    return this.findAll({
      where: { coach_id: coachId, date },
      order: [['start_time', 'ASC']],
    });
  };

  Availability.blockSlot = async function(coachId, date, startTime, endTime, bookingId = null) {
    return this.create({
      coach_id: coachId,
      date,
      start_time: startTime,
      end_time: endTime,
      is_available: false,
      booking_id: bookingId,
      reason: bookingId ? 'booked' : 'blocked',
    });
  };

  return Availability;
};
