module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
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
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // one review per booking
      references: {
        model: 'bookings',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coach_response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coach_response_at: {
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
    tableName: 'reviews',
    indexes: [
      { fields: ['student_id'] },
      { fields: ['coach_id'] },
      { unique: true, fields: ['booking_id'] },
    ],
    hooks: {
      // Keeps Coach.rating/review_count in sync - Coach.prototype.updateRating
      // already implements the running-average math, this just calls it.
      afterCreate: async (review, options) => {
        const Coach = sequelize.models.Coach;
        const coach = await Coach.findByPk(review.coach_id, { transaction: options.transaction });
        if (coach) {
          await coach.updateRating(review.rating);
        }
      },
    },
  });

  // Instance methods
  Review.prototype.addCoachResponse = async function(response) {
    this.coach_response = response;
    this.coach_response_at = new Date();
    await this.save();
  };

  return Review;
};
