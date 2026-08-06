module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
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
    subtotal: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
      defaultValue: 0,
    },
    discount_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'completed', 'canceled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
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
    tableName: 'orders',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['discount_code'] },
    ],
  });

  // Instance methods
  Order.prototype.recalculateTotal = function() {
    this.total_amount = Math.max(0, this.subtotal - this.discount_amount);
  };

  Order.prototype.markPaid = async function() {
    this.status = 'paid';
    await this.save();
  };

  return Order;
};
