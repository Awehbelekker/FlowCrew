const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50],
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50],
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[\+]?[1-9][\d]{0,15}$/,
      },
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    profile_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    role: {
      type: DataTypes.ENUM('STUDENT', 'INDEPENDENT_COACH', 'AFFILIATED_COACH', 'SURF_SHOP_ADMIN', 'PLATFORM_ADMIN'),
      allowNull: false,
      defaultValue: 'STUDENT',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'),
      allowNull: false,
      defaultValue: 'PENDING_VERIFICATION',
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emergency_contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        privacy: {
          profile_visibility: 'public',
          show_phone: false,
          show_email: false,
        },
        language: 'en',
        timezone: 'UTC',
      },
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_account_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    login_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    terms_accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    privacy_policy_accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    marketing_consent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_at'],
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
    },
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.generateJWT = function() {
    const payload = {
      id: this.id,
      email: this.email,
      role: this.role,
      status: this.status,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  };

  User.prototype.generateRefreshToken = function() {
    const payload = {
      id: this.id,
      type: 'refresh',
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  User.prototype.isCoach = function() {
    return ['INDEPENDENT_COACH', 'AFFILIATED_COACH'].includes(this.role);
  };

  User.prototype.isAdmin = function() {
    return ['SURF_SHOP_ADMIN', 'PLATFORM_ADMIN'].includes(this.role);
  };

  User.prototype.canManageCoaches = function() {
    return ['SURF_SHOP_ADMIN', 'PLATFORM_ADMIN'].includes(this.role);
  };

  User.prototype.updateLastLogin = async function() {
    this.last_login_at = new Date();
    this.login_count += 1;
    await this.save();
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() },
    });
  };

  User.findActiveUsers = function(limit = 50, offset = 0) {
    return this.findAndCountAll({
      where: { status: 'ACTIVE' },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  };

  User.findByRole = function(role, limit = 50, offset = 0) {
    return this.findAndCountAll({
      where: { role },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  };

  User.searchUsers = function(query, limit = 20) {
    const searchTerm = `%${query}%`;
    return this.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { first_name: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
          { last_name: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
          { email: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        ],
        status: 'ACTIVE',
      },
      limit,
      order: [['first_name', 'ASC']],
    });
  };

  User.getRegistrationStats = function(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        'role',
      ],
      where: {
        created_at: {
          [sequelize.Sequelize.Op.gte]: startDate,
        },
      },
      group: [
        sequelize.fn('DATE', sequelize.col('created_at')),
        'role',
      ],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    });
  };

  return User;
};
