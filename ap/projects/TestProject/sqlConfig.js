
let { aesEncrypt, aesDecrypt } = require("../../controller/Utils");
const Sequelize = require("sequelize");
// fix nodejs sequalize issue (date comparison) as following url 
// https://github.com/sequelize/sequelize/issues/7879
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  let offset = (-1*new Date().getTimezoneOffset()/60);
  date.setTime(date.getTime() + (offset*60*60*1000));
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

module.exports = class sqlConfig {
  constructor(dbInfo) {
    // console.log(dbInfo.password, aesDecrypt(dbInfo.password));
    const sequelize = new Sequelize(dbInfo.database, dbInfo.account, aesDecrypt(dbInfo.password), {
      host: dbInfo.host,
      port: dbInfo.port,
      dialect: "mssql",
      dialectOptions: {
        options: {
          encrypt: dbInfo.encrypt,
        },
      },
    });

    const ANSWER_PACKAGE = sequelize.define(
      "ANSWER_PACKAGE",
      {
        ANSWER_ID: {
          type: Sequelize.STRING(20),
          allowNull: false,
          primaryKey: true,
        },
        INFORMATION: {
          type: Sequelize.STRING(2000),
          allowNull: false,
        },
        DETAIL: {
          type: Sequelize.STRING(2000),
          allowNull: true,
        },
        ANS_NAME: {
          type: Sequelize.STRING(2000),
          allowNull: true,
        },
      },
      { 
        freezeTableName: true,
        timestamps: false,
        createdAt: false,
        updatedAt: false,
      }
    );
    const SET_LOG = sequelize.define(
      "SET_LOG",
      {
        IDSETLOG: {
          type: Sequelize.INTEGER(18, 0),
          allowNull: false,
          primaryKey: true,
        },
        USER_TYPE: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        USER_SESSION: {
          type: Sequelize.STRING(34),
          allowNull: false,
        },
        SESSION_ID: {
          type: Sequelize.STRING(38),
          allowNull: true,
        },
        USER_SAY: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        INTENT: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        INTENT_CONFIDENCE: {
          type: Sequelize.DECIMAL(6, 5),
          allowNull: true,
        },
        ENTITY: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        ENTITY_CONFIDENCE: {
          type: Sequelize.DECIMAL(6, 5),
          allowNull: true,
        },
        ANSWER_ID: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        ANS_NAME: {
          type: Sequelize.STRING(2000),
          allowNull: true,
        },
        DETAIL: {
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
    const SURVEY = sequelize.define(
      "SURVEY",
      {
        IDSURVEY: {
          type: Sequelize.INTEGER(18),
          allowNull: false,
          primaryKey: true,
        },
        SATISFACTION: {
          type: Sequelize.TINYINT,
          allowNull: false,
        },
        COMMENTS: {
          type: Sequelize.STRING(2000),
          allowNull: false,
        },
        COME_FROM: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        SESSIONID: {
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
    
    // RBBE CONFIG end

    // binding
    this.sequelize = sequelize;
    this.Op = Sequelize.Op;
  
    this.ANSWER_PACKAGE = ANSWER_PACKAGE;
    this.SET_LOG = SET_LOG;
    this.SURVEY = SURVEY;
  }
}