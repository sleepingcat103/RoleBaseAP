let express = require('express');
let router = express.Router();
let xss = require('xss');
let multer = require('multer')();
let BackendService = require('../controller/BackendController');

// middlewares
router.use('/*', function(req, res, next) {
    let session = req.session;
    let loginUser = xss(session.loginUser);

    // to prevent session timeout
    if('/login' != req._parsedUrl.path && '/logout' != req._parsedUrl.path && !loginUser){
        res.status(401).send({ msg: 'session timeout' });
        return;
    }

    next();
});

// 後台通用
router.post('/login', BackendService.login);
router.post('/logout', BackendService.logout);

router.post('/setSession', BackendService.setSession);

router.post('/listUsersByProjectId', BackendService.listUsersByProjectId);
router.get('/listUsers', BackendService.listUsers);
router.get('/listAdminUsers', BackendService.listAdminUsers);
router.post('/insertAdminUser', BackendService.insertAdminUser);
router.post('/deleteUser', BackendService.deleteUser);
router.post('/deleteAdminUser', BackendService.deleteAdminUser);
router.post('/toggleUser', BackendService.toggleUser);
router.post('/toggleAdminUser', BackendService.toggleAdminUser);

router.post('/updateAuthority', BackendService.updateAuthority);
router.post('/insertAuthority', BackendService.insertAuthority);
router.post('/deleteAuthority', BackendService.deleteAuthority);
router.post('/listAuthorityByProjectIdAndRoleId', BackendService.listAuthorityByProjectIdAndRoleId);

router.post('/insertRole', BackendService.insertRole);
router.post('/deleteRole', BackendService.deleteRole);
router.get('/listRole', BackendService.listRole);

router.post('/listAccessRight', BackendService.listAccessRight);
router.post('/insertAccessRight', BackendService.insertAccessRight);
router.post('/deleteAccessRight', BackendService.deleteAccessRight);

router.get('/listProject', BackendService.listProject);
router.post('/toggleProject', BackendService.toggleProject);
router.post('/updateProject', BackendService.updateProject);
router.post('/insertProject', BackendService.insertProject);

router.get('/listFeature', BackendService.listFeature);
router.get('/listAllFeature', BackendService.listAllFeature);
router.post('/sortFeature', BackendService.sortFeature);

router.post('/uploadFile', multer.single('uploadFile'), BackendService.uploadFile);
router.post('/listFiles', BackendService.listFiles);

// 區分專案
router.post('/filterTrace', BackendService.filterTrace);

router.post('/getWatsonConfig', BackendService.getWatsonConfig);

router.post('/listAnswerpack', BackendService.listAnswerpack);
router.post('/getAnswerpack', BackendService.getAnswerpack);
router.post('/findAnswerpack', BackendService.findAnswerpack);
router.post('/insertAnswerpack', BackendService.insertAnswerpack);
router.post('/updateAnswerpack', BackendService.updateAnswerpack);
router.post('/deleteAnswerpack', BackendService.deleteAnswerpack);

router.post('/findSetLog', BackendService.findSetLog);
router.post('/findSurvey', BackendService.findSurvey);

// watson Assistant
router.use('/watson/assistant', require('./api/watsonAssistant'));


module.exports = router;
