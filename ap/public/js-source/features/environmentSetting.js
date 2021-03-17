var environmentSettingController = (function() {
    
    let haveInit;
    let $tab = $('[tab="environmentSetting"]');
    let $componentProject = $('[component="project"]');
    let $componentFeature = $('[component="feature"]');
    let $componentAdmin = $('[component="admin"]');
    let $componentRole = $('[component="role"]');
    let $componentUser = $('[component="user"]');
    
    // 初始化頁面動作
    function __init__() {

        mainController.getPage('/components/setting-project')
        .then(page => { $componentProject.html(page); }).catch(e => {}) 
        mainController.getPage('/components/setting-feature')
        .then(page => { $componentFeature.html(page); }).catch(e => {}) 
        mainController.getPage('/components/setting-admin')
        .then(page => { $componentAdmin.html(page); }).catch(e => {}) 
        mainController.getPage('/components/setting-role')
        .then(page => { $componentRole.html(page); }).catch(e => {}) 
        mainController.getPage('/components/setting-user')
        .then(page => { $componentUser.html(page); }).catch(e => {}) 

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        haveInit = true;
    }

    // private functions
    // function xx() {}

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();