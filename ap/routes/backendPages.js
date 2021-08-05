let express = require('express');
let router = express.Router();
let xss = require('xss');

// 以下主頁面
// middlewares
router.get('*', function(req, res, next) {
    let session = req.session;
    let loginUser = xss(session.loginUser);

    if('/login' != req._parsedUrl.path && !loginUser) {
        req.session.redirect = true;
        res.redirect('/backend/login');
        return;
    }

    next();
});

// 登入
router.get('/login', function(req, res, next) {
    let redirect = xss(req.session.redirect);
    if(xss(req.session.loginUser)) {
        res.redirect('/backend');
    } else {
        res.status(redirect ? 401 : 200).render('pages/login');
    }
});

// 一般路徑
router.get('/', function(req, res, next) {
    let { projectId, featureId, queryString } = req.session;

    delete req.session.projectId;
    delete req.session.featureId;
    delete req.session.queryString;

    let authorities = JSON.parse(xss(JSON.stringify(req.session.authorities)));

    if(!authorities) {
        return res.render('pages/error');
    }

    console.log(projectId, featureId)

    res.render('pages/main', { 
        // data: {},
        authorities: authorities,
        redirect: {
            projectId: xss(projectId),
            featureId: xss(featureId),
            queryString: xss(queryString)
        },
    });
});
// 跳轉頁面
router.get('/newPage/:projectId/:featureId', function(req, res, next) {
    let { projectId, featureId } = req.params;

    req.session.projectId = xss(projectId);
    req.session.featureId = xss(featureId);
    req.session.queryString = xss(JSON.stringify(req.query));

    res.redirect('/backend');
});
// 預覽
router.get('/preview', function(req, res, next) {
    let projectId = xss(req.query.projectId);

    if(!projectId) return res.render('pages/error');

    res.render(`../projects/${ projectId }/views/preview`, { projectId });
});

// 以下子頁面
router.get('*', function(req, res, next) {
    if (req.headers['asdiuvhai'] != 'akwelfhkwea') {
        res.redirect('/backend');
        return ;
    }

    next();
});

// 子頁面範例 
router.get('/example', function(req, res, next) {
    res.render('pages/example');
});
router.get('/authorityManagement', function(req, res, next) {
    res.render('pages/authorityManagement');
});
router.get('/projectManagement', function(req, res, next) {
    res.render('pages/projectManagement');
});
router.get('/environmentSetting', function(req, res, next) {
    res.render('pages/environmentSetting');
});
router.get('/watsonTraining', function(req, res, next) {
    res.render(`pages/watsonTraining`);
});

// 得區分專案的功能
router.get('/mindMap', function(req, res, next) {
    let projectId = xss(req.query.projectId);
    if(!projectId) return res.render('pages/error');

    res.render(`../projects/${ projectId }/views/mindMap`, { projectId });
});
router.get('/answerPack', function(req, res, next) {
    let projectId = xss(req.query.projectId);
    let ansId = xss(req.query.ansId);
    
    if(!projectId) return res.render('pages/error');

    ansId = htmlEscape(ansId);
    
    res.render(`../projects/${ projectId }/views/answerPack`, { projectId, ansId });
});
router.get('/report', function(req, res, next) {
    let projectId = xss(req.query.projectId);
    if(!projectId) return res.render('pages/error');

    res.render(`../projects/${ projectId }/views/report`, { projectId });
});
router.get('/traceLog', function(req, res, next) {
    let projectId = xss(req.query.projectId);
    if(!projectId) return res.render('pages/error');

    res.render(`../projects/${ projectId }/views/traceLog`, { projectId });
});
router.get('/userComment', function(req, res, next) {
    let projectId = xss(req.query.projectId);
    if(!projectId) return res.render('pages/error');

    res.render(`../projects/${ projectId }/views/userComment`, { projectId });
});

// 以下小元件
router.get('/components/setting-project', function(req, res, next) {
    res.render('components/setting/project');
});
router.get('/components/setting-feature', function(req, res, next) {
    res.render('components/setting/feature');
});
router.get('/components/setting-admin', function(req, res, next) {
    res.render('components/setting/admin');
});
router.get('/components/setting-role', function(req, res, next) {
    res.render('components/setting/role');
});
router.get('/components/setting-user', function(req, res, next) {
    res.render('components/setting/user');
});
// 以上小元件

// 不存在的頁面
router.use('*', function(req, res, next) {
    res.render('pages/error');
});
router.use((err, req, res, next) => {
    console.error('== pageError ==', err, '== pageError ==');
    res.render('pages/error');
});

// 以上子頁面

module.exports = router;

function htmlEscape(text) {
    return text.replace(/&/g, '&amp;').
      replace(/</g, '&lt;').  // it's not neccessary to escape >
      replace(/"/g, '&quot;').
      replace(/'/g, '&#039;');
 }