require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'flowcrew_dev',
    password: process.env.DB_PASSWORD || 'flowcrew_dev_password',
    database: process.env.DB_NAME || 'flowcrew_development',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  },

  test: {
    username: process.env.TEST_DB_USERNAME || 'flowcrew_test',
    password: process.env.TEST_DB_PASSWORD || 'flowcrew_test_password',
    database: process.env.TEST_DB_NAME || 'flowcrew_test',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  },

  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      ssl: process.env.PROD_DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  },
};

// Database connection URL format for migrations
const getConnectionUrl = (env = 'development') => {
  const config = module.exports[env];
  const sslParam = config.dialectOptions?.ssl ? '?ssl=true' : '';

  return `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${sslParam}`;
};

module.exports.getConnectionUrl = getConnectionUrl;
