'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      profile_image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('STUDENT', 'INDEPENDENT_COACH', 'AFFILIATED_COACH', 'SURF_SHOP_ADMIN', 'PLATFORM_ADMIN'),
        allowNull: false,
        defaultValue: 'STUDENT',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'),
        allowNull: false,
        defaultValue: 'PENDING_VERIFICATION',
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      phone_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      emergency_contact_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emergency_contact_phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      preferences: {
        type: Sequelize.JSONB,
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
        type: Sequelize.STRING,
        allowNull: true,
      },
      stripe_account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      login_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      terms_accepted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      privacy_policy_accepted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      marketing_consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};
