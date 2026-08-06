module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
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
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id',
      },
      onDelete: 'SET NULL',
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
    amount: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    provider: {
      type: DataTypes.ENUM('stripe', 'payfast'),
      allowNull: false,
      defaultValue: 'stripe',
    },
    provider_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refunded_amount: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'payments',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['booking_id'] },
      { fields: ['order_id'] },
      { fields: ['status'] },
      { fields: ['provider_payment_id'] },
    ],
  });

  // Instance methods
  Payment.prototype.markCompleted = async function(providerPaymentId) {
    this.status = 'completed';
    this.provider_payment_id = providerPaymentId;
    this.processed_at = new Date();
    await this.save();
  };

  Payment.prototype.markFailed = async function(reason) {
    this.status = 'failed';
    this.failure_reason = reason;
    await this.save();
  };

  Payment.prototype.refund = async function(amount) {
    this.refunded_amount = amount;
    this.status = 'refunded';
    await this.save();
  };

  // Class methods
  Payment.getEarningsSummary = async function(userId, startDate, endDate) {
    const payments = await this.findAll({
      where: {
        user_id: userId,
        status: 'completed',
        processed_at: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate],
        },
      },
    });

    return {
      total_earned: payments.reduce((sum, p) => sum + p.amount, 0),
      total_bookings: payments.length,
    };
  };

  return Payment;
};
