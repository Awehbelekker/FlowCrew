module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sessions_included: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.INTEGER, // cents, total for the whole package
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
    validity_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'packages',
    indexes: [
      { fields: ['coach_id'] },
      { fields: ['active'] },
    ],
  });

  // Instance methods
  Package.prototype.pricePerSession = function() {
    return Math.round(this.price / this.sessions_included);
  };

  // Class methods
  Package.findActiveForCoach = function(coachId) {
    return this.findAll({
      where: { coach_id: coachId, active: true },
      order: [['price', 'ASC']],
    });
  };

  return Package;
};
