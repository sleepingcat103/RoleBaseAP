module.exports = class {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig
    }

    getFeature(featureId) {
        let findObj = {
            where: {
                "FEATURE_ID": featureId
            }
        };

        return this.sqlConfig.FEATURE.findOne(findObj);
    }

    listFeature() {
        let findObj = {
            raw: true,
            where: {
                "ADMIN": {
                    [this.sqlConfig.Op.not]: 1
                }
            },
            order: [
                [ "FEATURE_LEVEL", "ASC" ]
            ]
        };

        return this.sqlConfig.FEATURE.findAll(findObj);
    }
    listAllFeature() {
        let findObj = {
            raw: true,
            order: [
                [ "FEATURE_LEVEL", "ASC" ]
            ]
        };

        return this.sqlConfig.FEATURE.findAll(findObj);
    }

    sortFeature(features) {

        let updates = features.map((featureId, index) => {
            let setObj = {
                "FEATURE_LEVEL": (index + 1) * 10,
            }, whereObj = {
                where: {
                    "FEATURE_ID": featureId
                }
            }
            
            return this.sqlConfig.FEATURE.update(setObj, whereObj);
        })

        return Promise.all(updates);
    }
}

