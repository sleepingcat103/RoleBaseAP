module.exports = class {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    } 

    insertProject(project) {
        let { projectId, projectName, active, memo, aiConfig, dbConfig } = project;

        let findOrCreateObj = {
            where: {
                "PROJECT_ID": projectId
            },
            defaults: {
                "PROJECT_ID": projectId,
                "PROJECT_NAME": projectName,
                "ACTIVE": 1,
                "MEMO": memo == 'null' ? undefined : memo,
                "AI_CONFIG": aiConfig,
                "DB_CONFIG": dbConfig
            }
        }

        return this.sqlConfig.PROJECT.findOrCreate(findOrCreateObj)
        .then(result => {
            let project = result[0];
            let created = result[1];

            if (!created) { 
                console.log('Project already exists');
                return Promise.reject({ msg: 'Project already exists' })

            } else {
                return project.get({ plain: true });
            }
        })
    }

    updateProject(project) {
        let { projectId, projectName, active, memo, aiConfig, dbConfig } = project;
        let setObj = {
            "PROJECT_NAME": projectName,
            "ACTIVE": active,
            "MEMO": memo == 'null' ? undefined : memo,
            "AI_CONFIG": aiConfig,
            "DB_CONFIG": dbConfig
        }, whereObj = {
            where: {
                "PROJECT_ID": projectId
            }
        };

        return this.sqlConfig.PROJECT.update(setObj, whereObj)
        .then(response => {
            return this.sqlConfig.PROJECT.findOne(whereObj);
        })
        .then(response => {
            return response.get({ plain: true });
        })
    }

    deleteProject(projectId) {
        let findObj = {
            where: {
                "PROJECT_ID": projectId
            }
        };

        return this.sqlConfig.PROJECT.destroy(findObj);
    }

    getProject(projectId) {
        let findObj = {
            where: {
                "PROJECT_ID": projectId
            },
            raw: true
        };

        return this.sqlConfig.PROJECT.findOne(findObj);
    }

    listProject() {
        let findObj = {
            raw: true,
        };

        return this.sqlConfig.PROJECT.findAll(findObj);
    }
}
