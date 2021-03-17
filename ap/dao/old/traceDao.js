const sqlConfig = require('../config/sqlConfig');
const { Op } = require("sequelize");

class traceDao {
    constructor() {
    }

    findWatsonTrace(startDt, endDt) {
        
        let whereObj = {
            where: {
                [Op.and]: [
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
                        "ACTION": "watson_assistant"
                    }
                ]
            },
            order: [
                ['CREATE_DATE', 'ASC']
            ]
        };

        return sqlConfig.TRACE.findAll(whereObj);
    }

    findTraceBySessionId(sessionId) {
        
        let whereObj = {
            where: {
                "SESSION_ID": sessionId
            },
            order: [
                ['CREATE_DATE', 'ASC']
            ]
        };

        return sqlConfig.TRACE.findAll(whereObj);
    }

    findTraceByPeriodAndAnsIds(startDt, endDt, ansIds = []) {

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
                "ANS_ID": {
                    [Op.not]: 'Menu'
                }
            },
            {
                "ANS_ID": {
                    [Op.not]: 'Suggestion_Ans'
                }
            }
        ]

        if(ansIds.length > 0) conditions.push({
            [Op.or]: [
                ansIds.map(ansId => {
                    return {
                        "ANS_ID": ansId
                    }
                })
            ]
        });

        let whereObj = {
            where: {
                [Op.and]: conditions
            },
            order: [
                ['CREATE_DATE', 'ASC']
            ]
        };

        return sqlConfig.TRACE.findAll(whereObj);
    }
}

module.exports = new traceDao();