
// DB schema: [ IDSETLOG, CREATE_TIME, USER_TYPE, USER_SESSION, SESSION_ID, USER_SAY, INTENT, INTENT_CONFIDENCE, ENTITY, ENTITY_CONFIDENCE, ANSWER_ID, ANS_NAME, DETAIL ]
// SET_LOG
module.exports = class {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }

    findSurvey(startDt, endDt, sessionId, limit, offset) {
        let findObj = {
            raw: true,
            where: {
                [this.sqlConfig.Op.and]: (() => {
                    let querys = [];
                    if(startDt) {
                        querys.push({
                            "CREATE_TIME": {
                                [this.sqlConfig.Op.gte]: new Date(startDt)
                            }
                        })
                    }
                    if(endDt) {
                        querys.push({
                            "CREATE_TIME": {
                                [this.sqlConfig.Op.lte]: new Date(endDt)
                            }
                        })
                    }
                    if(sessionId) {
                        querys.push({
                            "SESSIONID": sessionId
                        })
                    }
                    return querys;
                })()
            },
            // order: [
            //     ['CREATE_TIME', 'ASC']
            // ],
            limit: limit || 500,
            offset: offset || 0,
            // attributes: ["ANSWER_ID", "DETAIL"]
        }

        return this.sqlConfig.SURVEY.findAll(findObj);
    }

}