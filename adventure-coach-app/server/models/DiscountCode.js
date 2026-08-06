module.exports = (sequelize, DataTypes) => {
  // server/index.js's mock /api/cart/apply-discount hardcodes three codes
  // (WELCOME10, SUMMER25, STUDENT15) with percentage + description - this
  // table is what that endpoint should actually query once wired to Sequelize.
  const DiscountCode = sequelize.define('DiscountCode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: true, // null = platform-wide code, not scoped to one surf shop
      references: {
        model: 'surf_shops',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('code', value.toUpperCase());
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = unlimited
    },
    times_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'discount_codes',
    indexes: [
      { unique: true, fields: ['code'] },
      { fields: ['organization_id'] },
      { fields: ['active'] },
    ],
  });

  // Instance methods
  DiscountCode.prototype.isValid = function() {
    const now = new Date();
    if (!this.active) return false;
    if (this.valid_until && now > this.valid_until) return false;
    if (now < this.valid_from) return false;
    if (this.usage_limit !== null && this.times_used >= this.usage_limit) return false;
    return true;
  };

  DiscountCode.prototype.calculateDiscount = function(cartTotal) {
    return Math.round((cartTotal * parseFloat(this.percentage)) / 100);
  };

  DiscountCode.prototype.recordUsage = async function() {
    this.times_used += 1;
    await this.save();
  };

  // Class methods
  DiscountCode.findValidByCode = async function(code) {
    const discount = await this.findOne({ where: { code: code.toUpperCase() } });
    if (!discount || !discount.isValid()) return null;
    return discount;
  };

  return DiscountCode;
};
