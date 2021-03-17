const Sequelize = require("sequelize");
const config = require("./configRouter");
const { aesEncrypt, aesDecrypt } = require("../controller/Utils");

// fix nodejs sequalize issue (date comparison) as following url 
// https://github.com/sequelize/sequelize/issues/7879
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  // let offset = (-1*new Date().getTimezoneOffset()/60);
  // date.setTime(date.getTime() + (offset*60*60*1000));
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class RBBE_SqlConfig {
  constructor() {
    const dbInfo = Object.assign(config.dbInfo);
    const sequelize = new Sequelize(dbInfo.database, dbInfo.account, aesDecrypt(dbInfo.pwd), {
      host: dbInfo.host,
      port: dbInfo.port,
      dialect: "mssql",
      dialectOptions: {
        options: {
          encrypt: dbInfo.encrypt,
        },
      },
    });

    // RBBE CONFIG start
    const USER = sequelize.define(
      "USER",
      {
        USER_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
          primaryKey: true,
        },
        PASSWORD: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        DIRECT_LOGIN: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0
        },
        ACTIVE: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 1
        },
        ADMIN: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0
        },
        MEMO: {
          type: Sequelize.STRING(1500),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATE_TIME",
        updatedAt: "LAST_UPDATE_TIME",
      }
    );
    const PROJECT = sequelize.define(
      "PROJECT",
      {
        PROJECT_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
          primaryKey: true,
        },
        PROJECT_NAME: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        ACTIVE: {
          type: Sequelize.TINYINT,
          allowNull: true,
          defaultValue: 1
        },
        MEMO: {
          type: Sequelize.STRING(1500),
          allowNull: true,
        },
        AI_CONFIG: {
          type: Sequelize.STRING(1500),
          allowNull: true,
        },
        DB_CONFIG: {
          type: Sequelize.STRING(1500),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATE_TIME",
        updatedAt: "LAST_UPDATE_TIME",
      }
    );
    const ROLE = sequelize.define(
      "ROLE",
      {
        ROLE_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
          primaryKey: true,
        },
        ROLE_NAME: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        EDITABLE: {
          type: Sequelize.TINYINT,
          allowNull: true,
          defaultValue: 0
        },
        MEMO: {
          type: Sequelize.STRING(1500),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATE_TIME",
        updatedAt: "LAST_UPDATE_TIME",
      }
    );
    const FEATURE = sequelize.define(
      "FEATURE",
      {
        FEATURE_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
          primaryKey: true,
        },
        FEATURE_NAME: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        FEATURE_LEVEL: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        ADMIN: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0
        },
        MEMO: {
          type: Sequelize.STRING(1500),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        // timestamps: true,
        createdAt: false,
        updatedAt: false,
      }
    );
    const AUTHORITY = sequelize.define(
      "AUTHORITY",
      {
        ID: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        USER_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        PROJECT_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        ROLE_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        ACTIVE: {
          type: Sequelize.TINYINT,
          allowNull: true,
          defaultValue: 1
        },
        MEMO: {
          type: Sequelize.STRING(1500),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        timestamps: true,
        createdAt: false,
        updatedAt: "LAST_UPDATE_TIME",
      }
    );
    const ACCESS_RIGHT = sequelize.define(
      "ACCESS_RIGHT",
      {
        ID: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        PROJECT_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        ROLE_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        FEATURE_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        ACCESS_LAYER: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATE_TIME",
        updatedAt: "LAST_UPDATE_TIME",
      }
    );
    const USER_PERFERENCE = sequelize.define(
      "USER_PERFERENCE",
      {
        ID: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        USER_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        PERFERENCE_NAME: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        PERFERENCE_VALUE: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      { 
        freezeTableName: true,
        timestamps: true,
        createdAt: false,
        updatedAt: "LAST_UPDATE_TIME",
      }
    );
    const TRACE = sequelize.define(
      "TRACE",
      {
        ID: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        USER_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        PROJECT_ID: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        TYPE: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        ACTION: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        TARGET: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        NEW_DATA: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        OLD_DATA: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        MEMO: {
          type: Sequelize.STRING(2000),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATE_TIME",
        updatedAt: false,
      }
    );

    USER.hasMany(AUTHORITY, { foreignKey: 'USER_ID' }); 
      AUTHORITY.belongsTo(USER, { foreignKey: 'USER_ID' });
    USER.hasMany(USER_PERFERENCE, { foreignKey: 'USER_ID' }); 
      USER_PERFERENCE.belongsTo(USER, { foreignKey: 'USER_ID' });

    PROJECT.hasMany(AUTHORITY, { foreignKey: 'PROJECT_ID' }); 
      AUTHORITY.belongsTo(PROJECT, { foreignKey: 'PROJECT_ID' });
    PROJECT.hasMany(ACCESS_RIGHT, { foreignKey: 'PROJECT_ID' }); 
      ACCESS_RIGHT.belongsTo(PROJECT, { foreignKey: 'PROJECT_ID' });

    ROLE.hasMany(ACCESS_RIGHT, { foreignKey: 'ROLE_ID' }); 
      ACCESS_RIGHT.belongsTo(ROLE, { foreignKey: 'ROLE_ID' });
    ROLE.hasMany(AUTHORITY, { foreignKey: 'ROLE_ID' }); 
      AUTHORITY.belongsTo(ROLE, { foreignKey: 'ROLE_ID' });

    FEATURE.hasMany(ACCESS_RIGHT, { foreignKey: 'FEATURE_ID' }); 
      ACCESS_RIGHT.belongsTo(FEATURE, { foreignKey: 'FEATURE_ID' });
    // RBBE CONFIG end

    // binding
    this.sequelize = sequelize;
    this.Op = Sequelize.Op;
  
    this.USER = USER;
    this.PROJECT = PROJECT;
    this.ROLE = ROLE;
    this.FEATURE = FEATURE;
    this.AUTHORITY = AUTHORITY;
    this.ACCESS_RIGHT = ACCESS_RIGHT;
    this.USER_PERFERENCE = USER_PERFERENCE;
    this.TRACE = TRACE;
    
  }
}

module.exports = new RBBE_SqlConfig();




// module.exports = {
//   sequelize,
//   Op: Sequelize.Op,

//   USER,
//   PROJECT,
//   ROLE,
//   FEATURE,
//   AUTHORITY,
//   ACCESS_RIGHT,
//   USER_PERFERENCE
// };



