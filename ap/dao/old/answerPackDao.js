const sqlConfig = require('../config/sqlConfig');
const { Op } = require("sequelize");

class answerPackDao {
    constructor() {
    }
    async getAnswerPack(ansId) {
        let sqlRes = await sqlConfig.ANSWER_PACK.findAll({
            where: {
                "ANSWER_ID": ansId
            },
            attributes: ["CONTENT"]
        });

        if (!sqlRes[0].dataValues) {
            sqlRes = await sqlConfig.ANSWER_PACK.findAll({
                where: {
                    "ANSWER_ID": "Sys_3"
                },
                attributes: ["CONTENT"]
            });
        }
        return sqlRes[0].dataValues.CONTENT;
    }

    updateAnswerPack(answerPack) {
        let { ANSWER_ID, CONTENT, ON_DUTY, MEMO } = answerPack;
        let setObj = {
            "ANSWER_ID": ANSWER_ID,
            "CONTENT": JSON.stringify(CONTENT),
            "ON_DUTY": ON_DUTY,
            "MEMO": MEMO
        }, whereObj = {
            where: {
                "ANSWER_ID": ANSWER_ID
            }
        };

        return sqlConfig.ANSWER_PACK.update(setObj, whereObj);
    }

    insertAnswerPack(answerPack) {
        let { ANSWER_ID, CONTENT, ON_DUTY, MEMO } = answerPack;

        let rowData = {
            "ANSWER_ID": ANSWER_ID,
            "CONTENT": JSON.stringify(CONTENT),
            "ON_DUTY": ON_DUTY,
            "MEMO": MEMO
        }

        return sqlConfig.ANSWER_PACK.create(rowData);
    }

    findAnswerPackByPattern(pattern) {

        let findByPattern = {
            where: {
                "ANSWER_ID": {
                    [Op.like]: '%' + pattern + '%'
                }
            },
            attributes: ["ANSWER_ID", "CONTENT", "ON_DUTY"]
        }

        return sqlConfig.ANSWER_PACK.findAll(findByPattern);
    }

    findAnswerPackByAnsId(ansId) {

        let findByPattern = {
            where: {
                "ANSWER_ID": ansId
            }
        }

        return sqlConfig.ANSWER_PACK.findAll(findByPattern);
    }
}

module.exports = new answerPackDao();