const sqlConfig = require('../config/sqlConfig');

class skillPoolDao {
    constructor() {
    }

    getSkills() {

        let findPattern = {}

        return sqlConfig.SKILL_POOL.findAll();
    }

    updateSkill(config) {
        let { SKILL_ID, SKILL_NAME, ON_DUTY, PROVIDER, MEMO, SKILL_CONFIG } = config;
        let setObj = {
            SKILL_NAME: SKILL_NAME,
            ON_DUTY: ON_DUTY,
            PROVIDER: PROVIDER,
            MEMO: MEMO,
            SKILL_CONFIG: SKILL_CONFIG
        }, whereObj = {
            where: {
                "SKILL_ID": SKILL_ID
            }
        };

        return sqlConfig.SKILL_POOL.update(setObj, whereObj);
    }
}

module.exports = new skillPoolDao();