
// DB schema: [ IDSETLOG, CREATE_TIME, USER_TYPE, USER_SESSION, SESSION_ID, USER_SAY, INTENT, INTENT_CONFIDENCE, ENTITY, ENTITY_CONFIDENCE, ANSWER_ID, ANS_NAME, DETAIL ]
// SET_LOG
module.exports = class {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }

    findSetLog(startDt, endDt, sessionId, action, limit, offset) {
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
                            "SESSION_ID": sessionId
                        })
                    }
                    if(action) {
                        querys.push({
                            "USER_TYPE": action
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

        return this.sqlConfig.SET_LOG.findAll(findObj);
    }
    // insertSetLog() {
    //     let row = {
    //         USER_TYPE: "text",
    //         USER_SESSION: "USER_SESSION",
    //         USER_SAY: "hi",
    //         ANSWER_ID: "AA-123"
    //     }
    //     this.sqlConfig.SET_LOG.create(row);
    // }

}