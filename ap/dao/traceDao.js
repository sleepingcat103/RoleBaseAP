module.exports = class trace {

    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }

    insertTrace(trace) {
        let { userId, projectId, type, action, target, newData, oldData, memo } = trace;

        let rowData = {
            "USER_ID": userId,
            "PROJECT_ID": projectId,
            "TYPE": type,
            "ACTION": action,
            "TARGET": target,
            "NEW_DATA": newData,
            "OLD_DATA": oldData,
            "MEMO": memo,
        }
        
        this.sqlConfig.TRACE.create(rowData)
        .then(() => {
            console.error('[insert trace]', 'success');
        })
        .catch((error) => { 
            console.error('[insert trace fail]', error);
        })
    }

    filterTrace(id, userId, projectId, startDt, endDt, type, action, target, limit, offset) {
        let findObj = {
            raw: true,
            where: {
                [this.sqlConfig.Op.and]: (() => {
                    let querys = [];
                    if(action) {
                        querys.push({
                            "ID": id
                        })
                    }
                    if(userId) {
                        querys.push({
                            "USER_ID": userId
                        })
                    }
                    if(projectId) {
                        querys.push({
                            "PROJECT_ID": projectId
                        })
                    }
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
                    if(type) {
                        querys.push({
                            "TYPE": type
                        })
                    }
                    if(action) {
                        querys.push({
                            "ACTION": action
                        })
                    }
                    if(target) {
                        querys.push({
                            "TARGET": target
                        })
                    }
                    
                    return querys;
                })()
            },
            order: [
                ['CREATE_TIME', 'DESC']
            ],
            limit: limit || 500,
            offset: offset || 0,
        };

        return this.sqlConfig.TRACE.findAll(findObj);
    }   
}