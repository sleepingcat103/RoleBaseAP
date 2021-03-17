
// DB schema: [ ANSWER_ID, INFORMATION , DETAIL, ANS_NAME]
// ANSWER_PACKAGE
module.exports = class {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }

    listAnswerpack () {
        let findObj = {
            raw: true,
            where: {},
            attributes: ["ANSWER_ID", "DETAIL"]
        }

        return this.sqlConfig.ANSWER_PACKAGE.findAll(findObj);
    }

    findAnswerpack (pattern) {
        let findObj = {
            raw: true,
            where: { 
                [this.sqlConfig.Op.or]: [
                    {
                        "ANSWER_ID": {
                            [this.sqlConfig.Op.like]: '%' + pattern + '%'
                        },
                    },
                    {
                        "INFORMATION": {
                            [this.sqlConfig.Op.like]: '%' + pattern + '%'
                        },
                    },
                    {
                        "DETAIL": {
                            [this.sqlConfig.Op.like]: '%' + pattern + '%'
                        }
                    },
                    {
                        "ANS_NAME": {
                            [this.sqlConfig.Op.like]: '%' + pattern + '%'
                        }
                    }
                ]
            },
            attributes: ["ANSWER_ID", "DETAIL"]
        }

        return this.sqlConfig.ANSWER_PACKAGE.findAll(findObj);
    }

    getAnswerpack (ansId) {
        let findObj = {
            raw: true,
            where: { 
                "ANSWER_ID": ansId
            }
        }

        return this.sqlConfig.ANSWER_PACKAGE.findOne(findObj)
        // key 不同時轉 key
        // .then(response => {
        //     return {
        //         ANSWER_ID: response.ANSWER_ID
        //     }
        // });
    }

    insertAnswerpack (answerpack) {
        let { ansId, information, detail, ansName } = answerpack;

        let findOrCreateObj = {
            where: {
                "ANSWER_ID": ansId
            },
            defaults: {
                "ANSWER_ID": ansId,
                "INFORMATION": information,
                "DETAIL": detail,
                "ANS_NAME": ansName
            }
        }

        return this.sqlConfig.ANSWER_PACKAGE.findOrCreate(findOrCreateObj)
        .then(result => {
            let anspack = result[0];
            let created = result[1];

            if (!created) { 
                console.log('Answerpack already exists');
                return Promise.reject({ msg: 'Answerpack already exists' })

            } else {
                return anspack.get({ plain: true });
            }
        
        })
    }

    updateAnswerpack (answerpack) {
        let { ansId, information, detail, ansName } = answerpack;
        let setObj = {
            "INFORMATION": information,
            "DETAIL": detail,
            "ANS_NAME": ansName
        }, whereObj = {
            where: {
                "ANSWER_ID": ansId
            }
        };

        return this.sqlConfig.ANSWER_PACKAGE.update(setObj, whereObj);
    }

    deleteAnswerpack (ansId) {
        let findObj = {
            where: {
                "ANSWER_ID": ansId,
            }
        };

        return this.sqlConfig.ANSWER_PACKAGE.destroy(findObj);
    }

}