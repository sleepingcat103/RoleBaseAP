
let fs = require('fs');
let path = require('path');

let sqlConfig = {
    RBBE: require('../config/sqlConfig')
}

let userDao = new (require('../dao/userDao'))(sqlConfig.RBBE);
let projectDao = new (require('../dao/projectDao'))(sqlConfig.RBBE);
let roleDao = new (require('../dao/roleDao'))(sqlConfig.RBBE);
let featureDao = new (require('../dao/featureDao'))(sqlConfig.RBBE);
let authorityDao = new (require('../dao/authorityDao'))(sqlConfig.RBBE);
let accessRightDao = new (require('../dao/accessRightDao'))(sqlConfig.RBBE);
let userPerferenceDao = new (require('../dao/userPerferenceDao'))(sqlConfig.RBBE);
let traceDao = new (require('../dao/traceDao'))(sqlConfig.RBBE);

let logService = require('../services/logService');
let ldapService = require('../services/ldapService');
let assistantService = require('../services/WasonAssistantV1');
let fileService = require('../services/fileService');

let { aesEncrypt, aesDecrypt } = require("./Utils");

const RESERVE_SYSTEM_PROJECT_ID = "SYSTEM";
const needAuth = process.env.BACKEND_AUTH || 'Y';
const sessionTime = 1000 * 60 * 1000;

sqlConfig.RBBE.sequelize
    .sync()
    .then(() => {
        console.log('Connect to Backstage DB ----------------------------------');
        
        let findObj = {
            raw: true,
        };

        return sqlConfig.RBBE.PROJECT.findAll(findObj);
    })
    .then(response => {
        return Promise.all[ response.map(project => {
            let projectId = project.PROJECT_ID;
            
            let dir = path.join(__dirname , `../projects/${ projectId }`, `sqlConfig.js`);
            
            if(fs.existsSync(dir)) {
                let dbInfo = JSON.parse(project.DB_CONFIG);
                sqlConfig[projectId] = new (require(dir))(dbInfo);

                return sqlConfig[projectId].sequelize
                .sync()
                .then(() => {
                    console.log('Connect to ' + projectId + ' DB ----------------------------------');
                })
                .catch(err => {
                    console.log('Fail to connect ' + projectId + ' DB -----------------------------', err);
                });
            } else {
                console.log('Fail to connect ' + projectId + ' DB -----------------------------', 'no such path');
            }
        })]
    })
    .catch(err => {
        console.log(err);
    });

class BackendController {
    constructor() {
    }

    /**
     * user login
     * body:
     *  ad_account
     *  ad_password
     */
    login(req, res, next) {

        let { username, password } = req.body;
        let adAuthSuccess = false;
        let result = {
            success: false
        };

        if(!username || !password) {
            res.status(400).send({ msg: '缺乏必要的參數' });
            return;
        }

        return (needAuth === 'N' ? Promise.resolve() : ldapService.authenticate(username, password)
        .then(response => {
            // AD驗證成功，接著驗證DB有無USER資料
            // AD驗證失敗，檢查DB中有無USER資料以及密碼正確
            adAuthSuccess = response;
            // console.log('[VARIFY AD]', username, adAuthSuccess);
        }))
        .then(() => {
            return userDao.getUser(username);
        })
        .then(response => {
            // console.log('[USER LOGIN]', username);

            if(!response || response.length == 0) {
                return Promise.reject({ status: 400, msg: '未註冊的使用者' });

            } else if(response.ACTIVE === 0) {
                return Promise.reject({ status: 400, msg: '帳戶已停用，請洽管理員' });

            } else if(adAuthSuccess === true) {
                // login
                return Promise.resolve({ msg: 'AD驗證成功登入.', user: response });

            } else if(adAuthSuccess === false) {
                if(response.DIRECT_LOGIN === false) {
                    return Promise.reject({ status: 400, msg: 'AD驗證失敗，亦非直接登入之使用者' });

                } else if(aesDecrypt(response.PASSWORD) != password) {
                    return Promise.reject({ status: 400, msg: 'AD驗證失敗，直接登入密碼驗證失敗' });

                } else {
                    // login
                    return Promise.resolve({ msg: 'AD驗證失敗，DB密碼驗證登入', user: response });
                }
            }
        })
        .then(response => {
            // console.log('[LOGIN SUCCESS]', username, response);
            let { user } = response;

            // console.log('[user]', response)

            if(user.ADMIN === 1) {
                return adminLoginProcess(username);
            } else {
                return normalLoginProcess(username);
            }
        })
        .then(authorities => {
            // console.log('[GET ACCESS_RIGHT]', username, JSON.stringify(authorities, null, 2));

            return userPerferenceDao.getUserPerference(username)
            .then(perference => {
                return {
                    perference,
                    authorities
                }
            })
        })
        .then(response => {

            req.session.loginUser = username;
            req.session.perference = response.perference;
            req.session.authorities = response.authorities;
            req.session.cookie.expires = sessionTime;

            res.status(200).send({ msg: '登入成功' });

        })
        .catch(error => {
            logService.error(error, '[login error]');
            result.success = false;
            
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
                result.msg = error.msg;
            } else {
                res.status(500).send({ msg: error });
                result.msg = '連線錯誤';
            }
        })
        .finally(() => {
            let trace = {
                userId: username,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: RESERVE_SYSTEM_PROJECT_ID,
                action: 'login',
                target: result.success,
                newData: result.msg,
                oldData: ''
            };
            traceDao.insertTrace(trace)
        })

        function normalLoginProcess (username) {
            return authorityDao.getAuthorityByUserId(username)
            .then(response => {
                // console.log('[GET AUTHORITY]', username, JSON.stringify(response, null, 2));
                
                if(!response || response.length == 0) {
                    return Promise.reject({ status: 400, msg: 'AP: 沒有被賦予專案角色' });

                } else {
                    return Promise.all(response.filter(au => {
                        return au["PROJECT.ACTIVE"] === 1;
                    }).map(au => {
                        
                        return accessRightDao.listAccessRight(au.PROJECT_ID, au.ROLE_ID);
                    }))
                    .then(accessRights => {
                        let result = accessRights.map((accessRight, index) => {
                            return {
                                PROJECT_ID: response[index].PROJECT_ID,
                                PROJECT_NAME: response[index]["PROJECT.PROJECT_NAME"],
                                ROLE_NAME: response[index]["ROLE.ROLE_NAME"],
                                ROLE_ID: response[index].ROLE_ID,
                                ACCESS_RIGHT: accessRight.sort((ar1, ar2) => {
                                    return ar1['FEATURE.FEATURE_LEVEL'] < ar2['FEATURE.FEATURE_LEVEL'] ? -1 :
                                        ar1['FEATURE.FEATURE_LEVEL'] > ar2['FEATURE.FEATURE_LEVEL'] ? 1 : 0;
                                })
                            }
                        })
                        return Promise.resolve(result)
                    })
                }
            })
        }
        function adminLoginProcess () {
            return Promise.all([ projectDao.listProject(), featureDao.listAllFeature() ])
            .then(response => {
                let [ projects, features ] = response;

                // console.log('[projects]', projects)
                // console.log('[features]', features)

                return projects.map(project => {
                    project["ACCESS_RIGHT"] = features;
                    project["ROLE_NAME"] = 'Administrator';
                    project["ROLE_ID"] = 'ADMIN';
                    return project;
                })
            })
        }

    }

    /**
     * user logout
     */
    logout(req, res, next) {

        // console.log('[USER LOGOUT] Bye,', req.session)

        req.session.destroy(function(err) {
            // console.log(err);
        });
        res.status(200).send({
            msg: `user logout`
        });
    }

    // 列出專案使用者
    listUsersByProjectId(req, res, next) {
        let { projectId } = req.body;

        authorityDao.listAuthorityByProjectId(projectId)
        .then(response => {
            // console.log('[listUsersByProjectId]', response);
            
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
    }
    listUsers(req, res, next) {
        userDao.listUsers()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
    }
    listAdminUsers(req, res, next) {
        userDao.listAdminUsers()
        .then(response => {
            // console.log('[listUsersByProjectId]', response);
            
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
    }
    insertAdminUser(req, res, next) {
        let { userId, password } = req.body;
        password = aesEncrypt(password);
        userDao.insertAdminUser({ userId, password })
        .then(response => {
            // console.log('[insertAdminUser]', response);
            res.status(200).send(response);
            
            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'user',
                action: 'insertAdmin',
                target: userId,
                newData: '',
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[insertAdminUser error]');
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
        })
    }
    toggleUser(req, res, next) {
        let { userId, active } = req.body;
        let body = {
            userId,
            active: active ? 1 : 0
        }
        
        userDao.toggleUser(body)
        .then(response => {
            // console.log('[toggleUser]', response);
            res.status(200).send(response);
            
            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'user',
                action: 'toggle',
                target: body.userId,
                newData: body.active,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[toggleUser error]');
            res.status(500).send();
        })
    }
    toggleAdminUser(req, res, next) {
        let { userId, active } = req.body;
        let body = {
            userId,
            active: active ? 1 : 0
        }
        
        userDao.toggleAdminUser(body)
        .then(response => {
            // console.log('[toggleAdminUser]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'user',
                action: 'toggleAdmin',
                target: body.userId,
                newData: body.active,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[toggleAdminUser error]');
            res.status(500).send();
        })
    }
    deleteUser(req, res, next) {
        let { userId } = req.body;

        authorityDao.deleteAuthorityByUserId(userId)
        .then(response => {
            return userDao.deleteUser(userId)
        })
        .then(response => {
            // console.log('[deleteUser]', response);
            res.status(200).send();
            
            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'user',
                action: 'delete',
                target: userId,
                newData: '',
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[deleteUser error]');
            res.status(500).send();
        })
    }
    deleteAdminUser(req, res, next) {
        let { userId } = req.body;
        
        userDao.deleteAdminUser(userId)
        .then(response => {
            // console.log('[deleteAdminUser]', response);
            res.status(200).send();

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'user',
                action: 'deleteAdmin',
                target: userId,
                newData: '',
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[deleteAdminUser error]');
            res.status(500).send();
        })
    }

    // 更新使用者授權
    updateAuthority(req, res, next) {
        // let { userId, projectId, roleId, active, memo, lastUpdateTime } = req.body;

        authorityDao.updateAuthority(req.body)
        .then(response => {
            // console.log('[updateAuthority]', response);
            res.status(200).send(response);
            
            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'user',
                action: 'deleteAdmin',
                target: req.body.userId,
                newData: '',
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[updateAuthority error]');
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
            res.status(500).send();
        })
    }
    // 新增使用者授權
    insertAuthority(req, res, next) {
        // let { userId, projectId, roleId, active, memo, lastUpdateTime } = req.body;

        let user = { 
            userId: req.body.userId, 
            password: '', 
            active: 1,
            directLogin: 0, 
            memo: ''
        }
        userDao.insertUser(user, false)
        .then(response => {
            // console.log('[insertUser]', response)

            return authorityDao.insertAuthority(req.body, true);
        })
        .then(response => {
            // console.log('[insertAuthority]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: req.body.projectId,
                type: 'anthority',
                action: 'insert',
                target: req.body.userId,
                newData: req.body.roleId,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[insertAuthority error]');
            
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
        })
    }
    // 刪除使用者授權
    deleteAuthority(req, res, next) {
        // let { userId, projectId, roleId } = req.body;

        authorityDao.deleteAuthority(req.body)
        .then(response => {
            // console.log('[deleteAuthority]', response);
            res.status(200).send();

            let trace = {
                userId: req.session.loginUser,
                projectId: req.body.projectId,
                type: 'anthority',
                action: 'delete',
                target: req.body.userId,
                newData: req.body.roleId,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[deleteAuthority error]');
            res.status(500).send();
        })
    }
    // 列出專案某身分組成員
    listAuthorityByProjectIdAndRoleId(req, res, next) {
        let { projectId, roleId } = req.body;

        authorityDao.listAuthorityByProjectIdAndRoleId(projectId, roleId)
        .then(response => {
            // console.log('[listAuthorityByProjectIdAndRoleId]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[listAuthorityByProjectIdAndRoleId error]');
            res.status(500).send(error);
        })
    }

    // 新增用戶組
    insertRole(req, res, next) {
        // let { roleId, roleName } = req.body;

        roleDao.insertRole(req.body)
        .then(response => {
            // console.log('[insertRole]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'role',
                action: 'insert',
                target: req.body.roleId,
                newData: req.body.roleName,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[insertRole error]');
            
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
        })
    }
    // 刪除用戶組
    deleteRole(req, res, next) {
        let { roleId } = req.body;
        
        authorityDao.deleteAuthorityByRoleId(roleId)
        .then(response => {
            return accessRightDao.deleteAccessRightByRoleId(roleId)
        })
        .then(response => {
            return roleDao.deleteRole(roleId)
        })
        .then(response => {
            // console.log('[deleteAccessRight]', response);
            res.status(200).send();

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: 'role',
                action: 'delete',
                target: req.body.roleId,
                newData: '',
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[deleteAccessRight error]');
            res.status(500).send();
        })
    }
    // 列出所有身分組
    listRole(req, res, next) {

        roleDao.listRole()
        .then(response => {
            // console.log('[listRole]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[listRole error]');
            res.status(500).send();
        })
    }
    // 列出功能 (不含管理員功能)
    listFeature(req, res, next) {

        featureDao.listFeature()
        .then(response => {
            // console.log('[listFeature]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[listFeature error]');
            res.status(500).send();
        })
    }
    // 列出授權
    listAccessRight(req, res, next) {
        let { projectId, roleId } = req.body;

        accessRightDao.listAccessRight(projectId, roleId)
        .then(response => {
            // console.log('[listAccessRight]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[listAccessRight error]');
            res.status(500).send();
        })
    }
    // 新增授權
    insertAccessRight(req, res, next) {
        // let { projectId, roleId, featureId, accessLayer } = req.body;

        accessRightDao.insertAccessRight(req.body)
        .then(response => {
            // console.log('[insertAccessRight]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: req.body.projectId,
                type: 'accessRight',
                action: 'insert',
                target: req.body.roleId,
                newData: req.body.featureId,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[insertAccessRight error]');
            res.status(500).send();
        })
    }
    // 刪除授權
    deleteAccessRight(req, res, next) {
        // let { projectId, roleId, featureId } = req.body;

        accessRightDao.deleteAccessRight(req.body)
        .then(response => {
            // console.log('[deleteAccessRight]', response);
            res.status(200).send();

            let trace = {
                userId: req.session.loginUser,
                projectId: req.body.projectId,
                type: 'accessRight',
                action: 'delete',
                target: req.body.roleId,
                newData: req.body.featureId,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[deleteAccessRight error]');
            res.status(500).send();
        })
    }

    // 列出專案
    listProject(req, res, next) {

        projectDao.listProject()
        .then(response => {
            // console.log('[listProject]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[listProject error]');
            res.status(500).send();
        })
    }
    // 列出所有功能 (包含管理員功能)
    listAllFeature(req, res, next) {

        featureDao.listAllFeature()
        .then(response => {
            // console.log('[listAllFeature]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[listAllFeature error]');
            res.status(500).send();
        })
    }
    // 排列功能顯示
    sortFeature(req, res, next) {

        featureDao.sortFeature(req.body)
        .then(response => {
            // console.log('[sortFeature]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: RESERVE_SYSTEM_PROJECT_ID,
                action: 'sortFeature',
                target: '',
                newData: JSON.stringify(features),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[sortFeature error]');
            res.status(500).send();
        })
    }

    // 開關專案
    toggleProject(req, res, next) {
        let { projectId, active } = req.body;
        let body = {
            projectId,
            active: active ? 1 : 0
        }
        
        projectDao.updateProject(body)
        .then(response => {
            // console.log('[toggleProject]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: RESERVE_SYSTEM_PROJECT_ID,
                action: 'toggleProject',
                target: projectId,
                newData: active,
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[toggleProject error]');
            res.status(500).send();
        })
    }
    // 更新專案config
    updateProject(req, res, next) {
        let body = {
            projectId: req.body.projectId,
            projectName: req.body.projectName,
            memo: req.body.memo,
            aiConfig: JSON.stringify({
                url: req.body.aiConfig_url,
                apikey: req.body.aiConfig_apikey,
                skillId: req.body.aiConfig_skillId,
                version: req.body.aiConfig_version,
            }),
            dbConfig: JSON.stringify({
                database: req.body.dbConfig_database,
                account: req.body.dbConfig_account,
                password: req.body.dbConfig_password,
                host: req.body.dbConfig_host,
                port: req.body.dbConfig_port,
            })
        }

        let origin;
        
        projectDao.getProject(body.projectId)
        .then(response => {
            origin = response;
            return projectDao.updateProject(body)
        })
        .then(response => {
            // console.log('[updateProject]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: RESERVE_SYSTEM_PROJECT_ID,
                action: 'updateProject',
                target: projectId,
                newData: JSON.stringify(body),
                oldData: JSON.stringify(origin),
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[editProject error]');
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
        })
    }
    // 新增專案
    insertProject(req, res, next) {

        if(RESERVE_SYSTEM_PROJECT_ID == req.body.projectId) {
            res.status(400).send({ msg: `${ RESERVE_SYSTEM_PROJECT_ID } 為系統保留字` });
        }

        let body = {
            projectId: req.body.projectId,
            projectName: req.body.projectName,
            memo: req.body.memo,
            aiConfig: JSON.stringify({
                url: req.body.aiConfig_url,
                apikey: req.body.aiConfig_apikey,
                skillId: req.body.aiConfig_skillId,
                version: req.body.aiConfig_version,
            }),
            dbConfig: JSON.stringify({
                database: req.body.dbConfig_database,
                account: req.body.dbConfig_account,
                password: req.body.dbConfig_password,
                host: req.body.dbConfig_host,
                port: req.body.dbConfig_port,
            })
        }
        
        projectDao.insertProject(body)
        .then(response => {
            // console.log('[insertProject]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: RESERVE_SYSTEM_PROJECT_ID,
                type: RESERVE_SYSTEM_PROJECT_ID,
                action: 'insertProject',
                target: projectId,
                newData: JSON.stringify(body),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[insertProject error]');
            
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
        })
    }

    // 搜尋篩選的trace log
    filterTrace(req, res, next) {
        let { id, userId, projectId, startDt, endDt, type, action, target } = req.body;
        traceDao.filterTrace(id, userId, projectId, startDt, endDt, type, action, target)
        .then(response => {
            // console.log('[filterTrace]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[filterTrace error]');
            res.status(500).send({ msg: error });
        })
    }

    getWatsonConfig(req, res, next) {
        let { projectId } = req.body;
        
        projectDao.getProject(projectId)
        .then(response => {
            let config = JSON.parse(response.AI_CONFIG);
            let body = {
                version: config.version,
                apikey: config.apikey,
                url: config.url,
                skillId: config.skillId
            }
            // console.log('[getWatsonConfig]', body);
            res.status(200).send(body);
        })
        .catch(error => {
            logService.error(error, '[getWatsonConfig error]');
            res.status(500).send();
        })
    }

    // 區分專案 要 try/catch
    listAnswerpack(req, res, next) {
        let { projectId } = req.body;
        let answerPackageDao
        try {
            if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }
            answerPackageDao = new (require(`../projects/${ projectId }/dao/answerPackageDao`))(sqlConfig[projectId]);
        } catch(error) {
            logService.error(error, '[listAnswerpack error]');
            res.status(500).send();
            return;
        }

        answerPackageDao.listAnswerpack()
        .then(response => {
            // console.log('[listAnswerpack]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[listAnswerpack error]');
            res.status(500).send();
        })
    }
    getAnswerpack(req, res, next) {
        let { projectId, ansId } = req.body;
        let answerPackageDao;
        
        try{
            if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }
            answerPackageDao = new (require(`../projects/${ projectId }/dao/answerPackageDao`))(sqlConfig[projectId]);
        } catch(error) {
            logService.error(error, '[getAnswerpack error]');
            res.status(500).send();
            return;
        }

        answerPackageDao.getAnswerpack(ansId)
        .then(response => {
            // console.log('[getAnswerpack]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[getAnswerpack error]');
            res.status(500).send();
        })
    }
    findAnswerpack(req, res, next) {
        let { projectId, pattern } = req.body;
        let answerPackageDao;

        try{
            if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }

            answerPackageDao = new (require(`../projects/${ projectId }/dao/answerPackageDao`))(sqlConfig[projectId]);
        } catch(error) {
            logService.error(error, '[findAnswerpack error]');
            res.status(500).send();
            return;
        }

        answerPackageDao.findAnswerpack(pattern)
        .then(response => {
            // console.log('[findAnswerpack]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[findAnswerpack error]');
            res.status(500).send();
        })
    }
    insertAnswerpack(req, res, next) {
        let { projectId, ansId, information, detail, ansName } = req.body;
        let answerPackageDao;
           
        if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }

        try{
            answerPackageDao = new (require(`../projects/${ projectId }/dao/answerPackageDao`))(sqlConfig[projectId]);
        } catch(error) {
            logService.error(error, '[insertAnswerpack error]');
            res.status(400).send({ msg: '沒有該路徑' });
            return;
        };

        let newData = { ansId, information, detail, ansName };
        answerPackageDao.insertAnswerpack(newData)
        .then(response => {
            // console.log('[insertAnswerpack]', response);
            res.status(200).send(response);
            
            newData = {
                "ANSWER_ID": newData.ansId,
                "INFORMATION": newData.information,
                "DETAIL": newData.detail,
                "ANS_NAME": newData.ansName
            }
            let trace = {
                userId: req.session.loginUser,
                projectId,
                type: 'answerpack',
                action: 'insert',
                target: newData.ANSWER_ID,
                newData: JSON.stringify(newData),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[insertAnswerpack error]');
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
        })
    }
    updateAnswerpack(req, res, next) {
        let { projectId, ansId, information, detail, ansName } = req.body;
        let answerPackageDao;

        if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }

        try {
            answerPackageDao = new (require(`../projects/${ projectId }/dao/answerPackageDao`))(sqlConfig[projectId]);
        } catch(error) {
            logService.error(error, '[updateAnswerpack error]');
            res.status(400).send({ msg: '沒有該路徑' });
            return;
        }

        let oldData;
        let newData = { ansId, information, detail, ansName }
        answerPackageDao.getAnswerpack(ansId)
        .then(response => {
            oldData = response;
            return answerPackageDao.updateAnswerpack(newData);
        })
        .then(response => {
            // console.log('[updateAnswerpack]', response);
            let [ result ] = response;
            if(result) {
                res.status(200).send(response);
            } else {
                return Promise.reject({ msg: '答案包不存在' });
            }

            newData = {
                "ANSWER_ID": newData.ansId,
                "INFORMATION": newData.information,
                "DETAIL": newData.detail,
                "ANS_NAME": newData.ansName
            }
            let trace = {
                userId: req.session.loginUser,
                projectId,
                type: 'answerpack',
                action: 'update',
                target: newData.ANSWER_ID,
                newData: JSON.stringify(newData),
                oldData: JSON.stringify(oldData),
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[updateAnswerpack error]');
            if(error.msg) {
                res.status(error.status || 400).send({ msg: error.msg });
            } else {
                res.status(500).send({ msg: error });
            }
        })
    }
    deleteAnswerpack(req, res, next) {
        let { projectId, ansId } = req.body;
        let answerPackageDao;
        
        try{
            if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }
            answerPackageDao = new (require(`../projects/${ projectId }/dao/answerPackageDao`))(sqlConfig[projectId]);
        } catch(error) {
            logService.error(error, '[deleteAnswerpack error]');
            res.status(500).send();
            return;
        }

        let oldData;
        answerPackageDao.getAnswerpack(ansId)
        .then(response => {
            oldData = response;
            return answerPackageDao.deleteAnswerpack(ansId)
        })
        .then(response => {
            // console.log('[deleteAnswerpack]', response);
            res.status(200).send();
            
            let trace = {
                userId: req.session.loginUser,
                projectId,
                type: 'answerpack',
                action: 'delete',
                target: oldData.ANSWER_ID,
                newData: '',
                oldData: JSON.stringify(oldData),
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[deleteAnswerpack error]');
            res.status(500).send();
        })
    }

    findSetLog(req, res, next) {
        let { projectId, startDt, endDt, sessionId, action, limit, offset } = req.body;
        let setLogDao;

        try{
            if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }
            setLogDao = new (require(`../projects/${ projectId }/dao/setLogDao`))(sqlConfig[ projectId ]);
        } catch(error) {
            logService.error(error, '[findSetLog error]');
            res.status(500).send();
            return;
        }
            
        setLogDao.findSetLog(startDt, endDt, sessionId, action, limit, offset)
        .then(response => {
            // console.log('[findSetLog]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[findSetLog error]');
            res.status(500).send();
        })
    }

    findSurvey(req, res, next) {
        let { projectId, startDt, endDt, sessionId, limit, offset } = req.body;
        let surveyDao;

        try{
            if(!projectId) { res.status(400).send({ msg: '沒有專案ID' }); return; }
            surveyDao = new (require(`../projects/${ projectId }/dao/surveyDao`))(sqlConfig[projectId]);
        } catch(error) {
            logService.error(error, '[findSurvey error]');
            res.status(500).send();
            return;
        }
            
        surveyDao.findSurvey(startDt, endDt, sessionId, limit, offset)
        .then(response => {
            // console.log('[findSurvey]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[findSurvey error]');
            res.status(500).send();
        })
    }

    uploadFile(req, res, next) {
        // => pass multipart request from one server to another
        // https://stackoverflow.com/questions/52963648/how-to-pass-multipart-request-from-one-server-to-another-in-nodejs
        let fileRecievedFromClient = req.file;

        let { projectId, fileType } = req.body;

        return fileService.uploadFile(fileRecievedFromClient, projectId, fileType)
        .then(response => {
            if(response.status == 'success') {
                // console.log('[uploadFile]', response);
                res.status(200).send(response);

                let trace = {
                    userId: req.session.loginUser,
                    projectId: projectId,
                    type: file,
                    action: 'upload',
                    target: fileRecievedFromClient.originalname,
                    newData: '',
                    oldData: '',
                };
                traceDao.insertTrace(trace)
            } else {
                logService.error(response.errorMsg, '[uploadFile error]');
                res.status(400).send({ msg: response.errorMsg });
            }
        })
        .catch(error => {
            logService.error(error, '[uploadFile error]');
            res.status(500).send();
        })
    }
    listFiles(req, res, next) {
        let { projectId, fileType } = req.body;
        return fileService.listFiles(projectId, fileType)
        .then(response => {
            if(response.status == 'success') {
                // console.log('[listFiles]', response);
                res.status(200).send(response);
            } else {
                logService.error(response.errorMsg, '[listFiles error]');
                res.status(400).send({ msg: response.errorMsg });
            }
        })
        .catch(error => {
            logService.error(error, '[listFiles error]');
            res.status(500).send();
        })
    }

    // watsonAssistant
    updateWorkspace(req, res, next) {
        let { projectId, version, apikey, url, skillId, newWorkspace } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...newWorkspace
            }
        }
        
        assistantService.updateWorkspace(params)
        .then(response => {
            // console.log('[assistant/updateWorkspace]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'updateWorkspace',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/updateWorkspace error]');
            res.status(500).send();
        })
    }

    listDialogNodes(req, res, next) {
        let { version, apikey, url, skillId } = req.body;
        let params = {
            version,
            apikey,
            url,
            data: {
                workspaceId: skillId,
                pageLimit: 1000
            }
        }
        assistantService.listDialogNodes(params)
        .then(response => {
            // console.log('[assistant/listDialogNodes]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/listDialogNodes error]');
            res.status(500).send();
        })
    }
    getDialogNode(req, res, next) {
        let { version, apikey, url, skillId, nodeId } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                dialogNode: nodeId
            }
        }
        assistantService.getDialogNode(params)
        .then(response => {
            // console.log('[assistant/getDialogNode]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/getDialogNode error]');
            res.status(500).send();
        })
    }
    updateDialogNode(req, res, next) {
        let { projectId, version, apikey, url, skillId, nodeId, newNode } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                dialogNode: nodeId,
                ...newNode
            }
        }
        // console.log(params)
        assistantService.updateDialogNode(params)
        .then(response => {
            // console.log('[assistant/updateDialogNode]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'updateDialogNode',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/updateDialogNode error]');
            res.status(500).send();
        })
    }

    listIntents(req, res, next) {
        let { version, apikey, url, skillId, properties } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...properties
            }
        }
        // console.log(params)
        assistantService.listIntents(params)
        .then(response => {
            // console.log('[assistant/listIntents]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/listIntents error]');
            res.status(500).send();
        })
    }
    createIntent(req, res, next) {
        let { projectId, version, apikey, url, skillId, intent } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                intent
            }
        }
        // console.log(params)
        assistantService.createIntent(params)
        .then(response => {
            // console.log('[assistant/createIntent]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'createIntent',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/createIntent error]');
            res.status(500).send();
        })
    }
    updateIntent(req, res, next) {
        let { projectId, version, apikey, url, skillId, intent, newIntent } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                intent,
                newIntent
            }
        }
        // console.log(params)
        assistantService.updateIntent(params)
        .then(response => {
            // console.log('[assistant/updateIntent]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'updateIntent',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/updateIntent error]');
            res.status(500).send();
        })
    }
    deleteIntent(req, res, next) {
        let { projectId, version, apikey, url, skillId, intent } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                intent
            }
        }
        // console.log(params)
        assistantService.deleteIntent(params)
        .then(response => {
            // console.log('[assistant/deleteIntent]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'deleteIntent',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/deleteIntent error]');
            res.status(500).send();
        })
    }

    listExamples(req, res, next) {
        let { version, apikey, url, skillId, intent } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                intent
            }
        }
        // console.log(params)
        assistantService.listExamples(params)
        .then(response => {
            // console.log('[assistant/listExamples]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/listExamples error]');
            res.status(500).send();
        })
    }
    deleteExample(req, res, next) {
        let { projectId, version, apikey, url, skillId, deleteExample } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...deleteExample
            }
        }
        // console.log(params)
        assistantService.deleteExample(params)
        .then(response => {
            // console.log('[assistant/deleteExample]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'deleteExample',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/deleteExample error]');
            res.status(500).send();
        })
    }
    updateExample(req, res, next) {
        let { projectId, version, apikey, url, skillId, newExample } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...newExample
            }
        }
        // console.log(params)
        assistantService.updateExample(params)
        .then(response => {
            // console.log('[assistant/updateExample]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'updateExample',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/updateExample error]');
            res.status(500).send();
        })
    }
    createExample(req, res, next) {
        let { projectId, version, apikey, url, skillId, newExample } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...newExample
            }
        }
        // console.log(params)
        assistantService.createExample(params)
        .then(response => {
            // console.log('[assistant/createExample]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'createExample',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/createExample error]');
            res.status(500).send();
        })
    }

    listEntities(req, res, next) {
        let { version, apikey, url, skillId, properties } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...properties
            }
        }
        // console.log(params)
        assistantService.listEntities(params)
        .then(response => {
            // console.log('[assistant/listEntities]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/listEntities error]');
            res.status(500).send();
        })
    }
    getEntity(req, res, next) {
        let { version, apikey, url, skillId, entity } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                _export: true,
                entity
            }
        }
        // console.log(params)
        assistantService.getEntity(params)
        .then(response => {
            // console.log('[assistant/getEntity]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/getEntity error]');
            res.status(500).send();
        })
    }
    createEntity(req, res, next) {
        let { version, apikey, url, skillId, entity } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                entity
            }
        }
        
        assistantService.createEntity(params)
        .then(response => {
            // console.log('[assistant/createEntity]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'createEntity',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/createEntity error]');
            res.status(500).send();
        })
    }
    deleteEntity(req, res, next) {
        let { projectId, version, apikey, url, skillId, entity } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                entity
            }
        }
        
        assistantService.deleteEntity(params)
        .then(response => {
            // console.log('[assistant/deleteEntity]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'deleteEntity',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/deleteEntity error]');
            res.status(500).send();
        })
    }
    updateEntity(req, res, next) {
        let { projectId, version, apikey, url, skillId, newEntity } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...newEntity
            }
        }
        
        assistantService.updateEntity(params)
        .then(response => {
            // console.log('[assistant/updateEntity]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'updateEntity',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/updateEntity error]');
            res.status(500).send();
        })
    }
    
    deleteValue(req, res, next) {
        let { projectId, version, apikey, url, skillId, targetValue } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...targetValue
            }
        }
        
        assistantService.deleteValue(params)
        .then(response => {
            // console.log('[assistant/deleteValue]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'deleteValue',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/deleteValue error]');
            res.status(500).send();
        })
    }
    createValue(req, res, next) {
        let { projectId, version, apikey, url, skillId, targetValue } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...targetValue
            }
        }
        
        assistantService.createValue(params)
        .then(response => {
            // console.log('[assistant/createValue]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'createValue',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/createValue error]');
            res.status(500).send();
        })
    }
    updateValue(req, res, next) {
        let { projectId, version, apikey, url, skillId, newValue } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                ...newValue
            }
        }
        
        assistantService.updateValue(params)
        .then(response => {
            // console.log('[assistant/updateValue]', response);
            res.status(200).send(response);

            let trace = {
                userId: req.session.loginUser,
                projectId: projectId,
                type: 'assistant',
                action: 'updateValue',
                target: projectId,
                newData: JSON.stringify(params),
                oldData: '',
            };
            traceDao.insertTrace(trace)
        })
        .catch(error => {
            logService.error(error, '[assistant/updateValue error]');
            res.status(500).send();
        })
    }

    listSynonyms(req, res, next) {
        let { version, apikey, url, skillId, targetValue } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
                pageLimit: 1000,
                ...targetValue
            }
        }
        // console.log(params)
        assistantService.listSynonyms(params)
        .then(response => {
            // console.log('[assistant/listSynonyms]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/listSynonyms error]');
            res.status(500).send();
        })
    }

    listCounterexamples(req, res, next) {
        let { version, apikey, url, skillId } = req.body;
        
        let params = {
            version: version,
            apikey: apikey,
            url: url,
            data: {
                workspaceId: skillId,
            }
        }
        // console.log(params)
        assistantService.listCounterexamples(params)
        .then(response => {
            // console.log('[assistant/listCounterexamples]', response);
            res.status(200).send(response);
        })
        .catch(error => {
            logService.error(error, '[assistant/listCounterexamples error]');
            res.status(500).send();
        })
    }

}

module.exports = new BackendController();
