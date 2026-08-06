module.exports = (sequelize, DataTypes) => {
  // Mirrors the shape server/index.js's mock /api/revenue-splits/configurations
  // endpoint already returns (coach/surfShop/platform percentages), so a real
  // implementation can drop straight in without changing the response shape
  // the frontend expects.
  const RevenueSplit = sequelize.define('RevenueSplit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'surf_shops',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    coach_id: {
      type: DataTypes.UUID,
      allowNull: true, // null = applies to all coaches at this organization
      references: {
        model: 'coaches',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    activity_type: {
      type: DataTypes.STRING,
      allowNull: true, // null = applies to all activity types
    },
    coach_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    surf_shop_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    platform_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    effective_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'revenue_splits',
    indexes: [
      { fields: ['organization_id'] },
      { fields: ['coach_id'] },
      { fields: ['activity_type'] },
    ],
    validate: {
      percentagesSumToHundred() {
        const sum = parseFloat(this.coach_percentage) + parseFloat(this.surf_shop_percentage) + parseFloat(this.platform_percentage);
        if (Math.abs(sum - 100) > 0.01) {
          throw new Error('coach_percentage + surf_shop_percentage + platform_percentage must sum to 100');
        }
      },
    },
  });

  // Class methods
  RevenueSplit.findApplicable = function(organizationId, coachId, activityType) {
    // Most specific match first: coach+activity, then coach only, then activity only, then org default
    return this.findOne({
      where: {
        organization_id: organizationId,
        [sequelize.Sequelize.Op.or]: [
          { coach_id: coachId, activity_type: activityType },
          { coach_id: coachId, activity_type: null },
          { coach_id: null, activity_type: activityType },
          { coach_id: null, activity_type: null },
        ],
      },
      order: [
        [sequelize.literal(`CASE WHEN coach_id IS NOT NULL AND activity_type IS NOT NULL THEN 0
                             WHEN coach_id IS NOT NULL THEN 1
                             WHEN activity_type IS NOT NULL THEN 2
                             ELSE 3 END`), 'ASC'],
      ],
    });
  };

  return RevenueSplit;
};
