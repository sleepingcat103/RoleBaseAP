const sqlConfig = require('../config/sqlConfig');
const { Op } = require("sequelize");

class feedbackDao {
    constructor() {
    }

    insertFeedback(feedback){
        let rowData = {
            ANSWER_ID: feedback.ansId,
            PROBLEM: feedback.problem,
            SUGGESTION: feedback.suggestion,
            CONTACT: feedback.contact
        }

        return sqlConfig.FEEDBACK.create(rowData);
    }
    

    getFeedback(startDt, endDt, ansId) {

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
            },
            order: [
                ['CREATE_DATE', 'ASC']
            ]
        };

        return sqlConfig.FEEDBACK.findAll(whereObj);
    }

    readFeedback(id) {

        let setObj = {
            ISREAD: 1,
        }, whereObj = {
            where: {
                "id": id
            }
        };

        return sqlConfig.FEEDBACK.update(setObj, whereObj);
    }
}

module.exports = new feedbackDao();