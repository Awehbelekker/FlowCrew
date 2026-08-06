module.exports = (sequelize, DataTypes) => {
  const Coach = sequelize.define('Coach', {
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
    surf_shop_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'surf_shops',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specialties: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isValidSpecialties(value) {
          const validSpecialties = [
            'surfing', 'sup', 'kitesurfing', 'windsurfing',
            'bodyboarding', 'longboarding', 'shortboarding',
            'beginner_lessons', 'advanced_coaching', 'competition_prep'
          ];

          if (value && value.some(specialty => !validSpecialties.includes(specialty))) {
            throw new Error('Invalid specialty provided');
          }
        },
      },
    },
    experience_level: {
      type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
      allowNull: false,
      defaultValue: 'INTERMEDIATE',
    },
    years_experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 50,
      },
    },
    certifications: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['en'],
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 10.00,
        max: 500.00,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
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
    service_radius_km: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 25,
      validate: {
        min: 1,
        max: 100,
      },
    },
    availability_schedule: {
      type: DataTypes.JSONB,
      defaultValue: {
        monday: { available: true, start: '09:00', end: '17:00' },
        tuesday: { available: true, start: '09:00', end: '17:00' },
        wednesday: { available: true, start: '09:00', end: '17:00' },
        thursday: { available: true, start: '09:00', end: '17:00' },
        friday: { available: true, start: '09:00', end: '17:00' },
        saturday: { available: true, start: '08:00', end: '18:00' },
        sunday: { available: true, start: '08:00', end: '18:00' },
      },
    },
    booking_advance_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 1,
        max: 365,
      },
    },
    cancellation_policy: {
      type: DataTypes.ENUM('FLEXIBLE', 'MODERATE', 'STRICT'),
      allowNull: false,
      defaultValue: 'MODERATE',
    },
    instant_booking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'),
      allowNull: false,
      defaultValue: 'PENDING_APPROVAL',
    },
    verification_status: {
      type: DataTypes.ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'UNVERIFIED',
    },
    verification_documents: {
      type: DataTypes.JSONB,
      defaultValue: {
        id_document: null,
        certifications: [],
        insurance: null,
        background_check: null,
      },
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0.00,
        max: 5.00,
      },
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_bookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_earnings: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    response_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 100.00,
      validate: {
        min: 0.00,
        max: 100.00,
      },
    },
    response_time_hours: {
      type: DataTypes.INTEGER,
      defaultValue: 24,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    featured_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_active_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    onboarding_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    stripe_connect_account_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_onboarding_completed: {
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
    tableName: 'coaches',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['surf_shop_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['verification_status'],
      },
      {
        fields: ['rating'],
      },
      {
        fields: ['hourly_rate'],
      },
      {
        fields: ['specialties'],
        using: 'gin',
      },
      {
        fields: ['location'],
        using: 'gin',
      },
      {
        fields: ['featured', 'featured_until'],
      },
    ],
  });

  // Instance methods
  Coach.prototype.isAvailable = function(date, time) {
    const dayOfWeek = new Date(date).toLocaleLowerCase();
    const schedule = this.availability_schedule[dayOfWeek];

    if (!schedule || !schedule.available) {
      return false;
    }

    const requestTime = new Date(`${date} ${time}`);
    const startTime = new Date(`${date} ${schedule.start}`);
    const endTime = new Date(`${date} ${schedule.end}`);

    return requestTime >= startTime && requestTime <= endTime;
  };

  Coach.prototype.calculateEarnings = function(amount, revenueSplit = null) {
    if (revenueSplit) {
      return Math.round((amount * revenueSplit.coach_percentage) / 100);
    }

    // Default split based on affiliation
    const defaultPercentage = this.surf_shop_id ? 70 : 97.5;
    return Math.round((amount * defaultPercentage) / 100);
  };

  Coach.prototype.updateRating = async function(newRating) {
    const currentTotal = this.rating * this.review_count;
    this.review_count += 1;
    this.rating = (currentTotal + newRating) / this.review_count;
    await this.save();
  };

  Coach.prototype.incrementBookings = async function() {
    this.total_bookings += 1;
    this.last_active_at = new Date();
    await this.save();
  };

  Coach.prototype.addEarnings = async function(amount) {
    this.total_earnings = parseFloat(this.total_earnings) + parseFloat(amount);
    await this.save();
  };

  Coach.prototype.getExperienceModifier = function() {
    const modifiers = {
      BEGINNER: -2.5,
      INTERMEDIATE: 0,
      ADVANCED: 2.5,
      EXPERT: 5.0,
    };
    return modifiers[this.experience_level] || 0;
  };

  // Class methods
  Coach.findAvailableCoaches = function(date, time, specialty = null, location = null) {
    const whereClause = {
      status: 'ACTIVE',
      verification_status: 'VERIFIED',
    };

    if (specialty) {
      whereClause.specialties = {
        [sequelize.Sequelize.Op.contains]: [specialty],
      };
    }

    return this.findAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'profile_image_url'],
        },
      ],
      order: [
        ['featured', 'DESC'],
        ['rating', 'DESC'],
        ['response_rate', 'DESC'],
      ],
    });
  };

  Coach.findFeaturedCoaches = function(limit = 10) {
    return this.findAll({
      where: {
        featured: true,
        featured_until: {
          [sequelize.Sequelize.Op.gt]: new Date(),
        },
        status: 'ACTIVE',
        verification_status: 'VERIFIED',
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'profile_image_url'],
        },
      ],
      limit,
      order: [['rating', 'DESC']],
    });
  };

  Coach.searchCoaches = function(filters = {}) {
    const {
      specialty,
      location,
      minRating,
      maxRate,
      experienceLevel,
      instantBooking,
      limit = 20,
      offset = 0,
    } = filters;

    const whereClause = {
      status: 'ACTIVE',
      verification_status: 'VERIFIED',
    };

    if (specialty) {
      whereClause.specialties = {
        [sequelize.Sequelize.Op.contains]: [specialty],
      };
    }

    if (minRating) {
      whereClause.rating = {
        [sequelize.Sequelize.Op.gte]: minRating,
      };
    }

    if (maxRate) {
      whereClause.hourly_rate = {
        [sequelize.Sequelize.Op.lte]: maxRate,
      };
    }

    if (experienceLevel) {
      whereClause.experience_level = experienceLevel;
    }

    if (instantBooking) {
      whereClause.instant_booking = true;
    }

    return this.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'profile_image_url'],
        },
      ],
      limit,
      offset,
      order: [
        ['featured', 'DESC'],
        ['rating', 'DESC'],
        ['response_rate', 'DESC'],
      ],
    });
  };

  Coach.getPerformanceStats = function(coachId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return sequelize.query(`
      SELECT
        c.id,
        c.total_bookings,
        c.total_earnings,
        c.rating,
        c.review_count,
        COUNT(b.id) as recent_bookings,
        AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END) as recent_rating
      FROM coaches c
      LEFT JOIN bookings b ON c.id = b.coach_id AND b.created_at >= :startDate
      LEFT JOIN reviews r ON b.id = r.booking_id AND r.created_at >= :startDate
      WHERE c.id = :coachId
      GROUP BY c.id
    `, {
      replacements: { coachId, startDate },
      type: sequelize.QueryTypes.SELECT,
    });
  };

  return Coach;
};
