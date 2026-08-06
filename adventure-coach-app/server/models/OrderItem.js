module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    coach_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'coaches',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    package_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'packages',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    item_type: {
      type: DataTypes.ENUM('lesson', 'package', 'gear_rental'),
      allowNull: false,
      defaultValue: 'lesson',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.INTEGER, // cents
      allowNull: false,
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
    tableName: 'order_items',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['coach_id'] },
      { fields: ['package_id'] },
    ],
  });

  return OrderItem;
};
