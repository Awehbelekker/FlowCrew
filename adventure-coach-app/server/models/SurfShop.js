module.exports = (sequelize, DataTypes) => {
  const SurfShop = sequelize.define('SurfShop', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        address: null,
        city: null,
        state: null,
        country: null,
        postal_code: null,
        latitude: null,
        longitude: null,
      },
    },
    // Mirrors SubscriptionService.js's hierarchical tier concept: a school's
    // subscription.tier can raise an affiliated coach's effective tier.
    subscription: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        tier: 'free',
        status: 'active',
        current_period_end: null,
      },
    },
    max_coaches: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    verification_status: {
      type: DataTypes.ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'UNVERIFIED',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    stripe_connect_account_id: {
      type: DataTypes.STRING,
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
    tableName: 'surf_shops',
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['status'] },
      { fields: ['verification_status'] },
    ],
  });

  // Instance methods
  SurfShop.prototype.getSubscriptionTier = function() {
    return this.subscription?.tier || 'free';
  };

  SurfShop.prototype.hasActiveSubscription = function() {
    return this.subscription?.status === 'active';
  };

  SurfShop.prototype.canAddCoach = async function() {
    if (this.max_coaches === -1) return true; // unlimited
    const currentCount = await sequelize.models.Coach.count({
      where: { surf_shop_id: this.id, status: 'ACTIVE' },
    });
    return currentCount < this.max_coaches;
  };

  // Class methods
  SurfShop.findByOwner = function(ownerId) {
    return this.findOne({ where: { owner_id: ownerId } });
  };

  return SurfShop;
};
