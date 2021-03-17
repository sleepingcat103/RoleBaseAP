const sqlConfig = require('../config/sqlConfig');
const { Op } = require("sequelize");

class dislikeDao {
    constructor() {
    }

    getDislike(startDt, endDt, ansId) {

        let conditions = [
            {
                "CREATE_DATE": {
                    [Op.gte]: new Date(startDt)
                }
            },
            {
                "CREATE_DATE": {
                    [Op.lte]: new Date(endDt)
                }
            },
            {
                "ANSWER_ID": {
                    [Op.not]: 'Menu'
                }
            },
            {
                "ANSWER_ID": {
                    [Op.not]: 'Suggestion_Ans'
                }
            }
        ]

        if(ansId) conditions.push({ ANSWER_ID: ansId });

        let whereObj = {
            where: {
                [Op.and]: conditions
            }
        };

        return sqlConfig.DISLIKE.findAll(whereObj);
    }
}

module.exports = new dislikeDao();