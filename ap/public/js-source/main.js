const mainController = (function() {
    
    let haveInit;
    let _projectId, _featureId, assistantConfig = {};
    let $redirect = $('#redirect');
    let $sidebar = $('section#layoutSidenav_nav');
    let $content = $('section#layoutSidenav_content');
    let $sidebarToggle = $('#sidebarToggle');
    let $logout = $('#logout');
    let $mainPage = $('.main-page');
    let $previewSidebar = $('#preview')

    const BG_ACTIVE_CLASS = 'bg_green_light';
    const BG_INACTIVE_CLASS = 'bg_grey_light';
    const BG_EDITING_CLASS = 'bg_blue_light';

    // 每次搜尋數
    const pageLimit = 500;

    // 替換字串設定
    let replaceConfig = {
        data: {
            name: /[$][{]domain_data[}]/g,
            value:"https://hqsaplu83.hotains.com.tw/file/helpdesk/document"
        },
        img: {
            name: /[$][{]domain_img[}]/g,
            value:"https://hqsaplu83.hotains.com.tw/file/helpdesk/image"
        }
    }
    
    // 初始化頁面動作
    function __init__() {
        
        // 功能列收合
        $sidebarToggle.on('click', e => {
            $sidebar.toggleClass('active');
            // $sidebar.find('.input-group').toggleClass('d-none')
            $content.toggleClass('active');
        });
    
        // 切換環境
        $sidebar.find('select').on('change', e => {
            let $target = $(e.currentTarget);
            let projectId = $target.find('option:selected').attr('projectId');
            let $nowMenu = $sidebar.find(`.sb-sidenav-menu[projectId="${ projectId }"]`);

            _projectId = projectId;
            callBackendAPI('/setSession', 'POST', { key: 'projectId', value: projectId }).catch(e => {})
    
            $sidebar.find('.sb-sidenav-menu').addClass('d-none');
            $nowMenu.removeClass('d-none');
            
            let redirectfeatureId = $redirect.attr('featureId');
            $redirect.removeAttr('featureId');
            
            if(redirectfeatureId) {
                let $targetNav = $nowMenu.find(`.nav-link[featureId=${ redirectfeatureId }]`);
                $targetNav.trigger('click');
            } else {
                $nowMenu.find('.nav-link:first').trigger('click');
            }
        });

        // 切換功能
        $sidebar.on('click', '.nav-link:not(.active)', e => {
            let $target = $(e.currentTarget);
            let featureId = $(e.currentTarget).attr('featureId');

            let redirectData = JSON.parse($redirect.val() || '{}');
            $redirect.removeAttr('value');
            $redirect.val('');

            _featureId = featureId;
            callBackendAPI('/setSession', 'POST', { key: 'featureId', value: featureId }).catch(e => {})
            
            $sidebar.find('.nav-link.active').removeClass('active');
            $target.addClass('active');

            $previewSidebar.removeClass('active');

            changePage(`/${featureId}`, $mainPage, redirectData)
            .catch(error => {
                console.error(error);
            })
            
        })
        
        // 登出
        $logout.on('click', function(e) {
            logout();
        });

        initPage();
    }
    function changeNavStatus(featureId) {
        $sidebar.find('.nav-link.active').removeClass('active');
        $sidebar.find(`[featureid="${ featureId }"]`).addClass('active');

        $previewSidebar.removeClass('active');
    }

    // 初始化頁面資訊
    function initPage() {
        let redirectProjectId = $redirect.attr('projectId');
        $redirect.removeAttr('projectId');

        if(redirectProjectId) {
            $sidebar.find('select').val(redirectProjectId);
        } else {
            _projectId = $sidebar.find('select').find('option:selected').attr('projectId');
        }

        $sidebar.find('select').trigger('change');
        haveInit = true;

        // trigger change projectId

        return 'ok';
    }

    // 登出動作
    function logout() {
        return callBackendAPI('/logout', 'POST', {})
        .then(response => {
            window.location = '/backend/login';
        })
        .catch(error => {
            console.error('[logout fail]', error);
        });
    }
    function getProjectId() {
        return _projectId;
    }
    function getFeatureId() {
        return _featureId;
    }
    function getPage(path, data) {

        console.log('[get page]', path, data);

        let maskId = tempMask('頁面跳轉中請稍後');
        let headers = { asdiuvhai: 'akwelfhkwea' };
        let params = '?' + new URLSearchParams({ 
            projectId: getProjectId(),
            ...data
        }).toString();
        return callBackend('/backend' + path + params, 'GET', undefined, headers)
        .then(res => {
            console.log('[success]', path);
            return res;
        })
        .catch(err => {
            console.log('[fail]', path, err);
            let { status, desc } = err;
            if(status == 401) {
                tempMask('登入逾時，需要重新登入');
                setTimeout(function() {
                    window.location = '/backend/login';
                }, 2000);
            }else if(status == 500) {
                return Promise.reject({ msg: '連線異常，請稍後再試' });
            }else{
                return Promise.reject(desc);
            }
        })
        .finally(() => {
            removeMask(maskId);
        })
        
    }
    function changePage(path, target, data) {
        let $target;
        if(typeof(target) === 'string') {
            $target = $(target);
        }else{
            $target = target || $mainPage;
        }
        return getPage(path, data)
        .then(page => {
            $target.html(page);
        })
    }

    function rollingSearch(searchParam, searchFunc, searchHandler) {
        searchParam.limit = searchParam.limit || pageLimit;
        searchParam.offset = searchParam.offset || 0;

        return searchFunc(searchParam)
        .then(response => {
            searchHandler(response);
            
            if(response.length == pageLimit) {
                searchParam.offset += pageLimit;
                return rollingSearch(searchParam, searchFunc, searchHandler);
            }
        })
    }

    async function getAssistantConfig() {
        let body = {
            projectId: getProjectId()
        }
        if(assistantConfig[body.projectId]) {
            return assistantConfig[body.projectId];
        } else {
            return callBackendAPI('/getWatsonConfig', 'POST', body)
            .then(response => {
                assistantConfig[body.projectId] = response;
                return response;
            })
        }
    }
    function getBgClassByActive(active) {
        if(active) {
            return BG_ACTIVE_CLASS;
        } else {
            return BG_INACTIVE_CLASS;
        }
    }
    function newPage(path) {
        window.open(`${ window.location.origin }${ window.location.pathname }/newPage${ path }`)
    }
    function location(url) {
        window.location = url;   
    }
    function preview(message) {
        let projectId = getProjectId();

        // 替換pattern
        message = JSON.parse(replacePatterns(JSON.stringify( message )));

        let iframe = $previewSidebar.find('iframe')[0];
        iframe.onload = () => { iframe.contentWindow.displayMessage(message); }
        let params = new URLSearchParams({ projectId }).toString();
        iframe.src = `/backend/preview?${ params }`;
        $previewSidebar.addClass('active');
    }

    // 替換網址中pattern供預覽使用
    function replacePatterns(text, target) {
        let targetConfigs;
        
        // 傳入目標為字串?
        if(target && typeof(target) == 'string') {
            targetConfigs = [replaceConfig[target]];
        
        // 傳入目標為陣列
        } else if(target && Array.isArray(target) && target.length > 0) {
            targetConfigs = Object.keys(replaceConfig).filter(configType => {
                return target.indexOf(configType) > -1;
            }).map(configType => replaceConfig[configType] );
        
        // 無目標
        } else {
            targetConfigs = Object.values(replaceConfig);
        }
        for(let config of targetConfigs) {
            let regExp = new RegExp(config.name);
            text = text.replace(regExp, config.value);
        }
    
        return text;
    }
    // 替換網址為pattern以存入資料庫
    function toPatterns(text, target) {
        let targetConfigs;
        
        // 傳入目標為字串?
        if(target && typeof(target) == 'string') {
            targetConfigs = [replaceConfig[target]];
        
        // 傳入目標為陣列
        } else if(target && Array.isArray(target) && target.length > 0) {
            targetConfigs = Object.keys(replaceConfig).filter(configType => {
                return target.indexOf(configType) > -1;
            }).map(configType => replaceConfig[configType] );
        
        // 無目標
        } else {
            targetConfigs = Object.values(replaceConfig);
        }

        for(let config of targetConfigs) {
            let regExp = new RegExp(config.value);
            text = text.replace(regExp, config.name);
        }
    
        return text;
    }

    __init__();

    return {
        haveInit,
        pageLimit,
        
        color: {
            active: BG_ACTIVE_CLASS,
            inactive: BG_INACTIVE_CLASS,
            editing: BG_EDITING_CLASS
        },
        
        initPage,
        
        getPage,
        changePage,
        changeNavStatus,
        location,
        newPage,
        preview,

        logout,

        getProjectId,
        getFeatureId,
        replacePatterns,
        toPatterns,

        getAssistantConfig,
        getBgClassByActive,

        rollingSearch,
    }

})();