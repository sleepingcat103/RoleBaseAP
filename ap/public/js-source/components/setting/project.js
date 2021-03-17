(function() {
    
    let haveInit;
    let $component = $('[component="project"]');
    let $projectContainer = $component.find('[content="projects"]');
    let $newProjectForm = $component.find('#collapse-newProject').find('form');
    
    // 初始化頁面動作
    function __init__() {

        // add new project
        $component.on('click', '[action="addProject"]', e => {
            let $projectAlert = $newProjectForm.find('#project_alert');
            let body = getFormDataJson($newProjectForm);

            $projectAlert.hide();

            if(Object.values(body).indexOf("") > -1) {
                $projectAlert.html('請填妥所有欄位').show();
                notify.danger('請填妥所有欄位');
                return;
            }

            $component.find('[action="addProject"]').attr('disabled', true);
            callBackendAPI('/insertProject', 'POST', body, {})
            .then(response => {
                notify.success('新增成功，需重啟後台系統以讀取新專案的資料');

                let myHtml = buildProjectBlock(response);
                $projectContainer.prepend(myHtml);

            }).catch(error => {
                console.error(error);
                $projectAlert.html('新增失敗 ' + error.msg).show();
                notify.danger('新增失敗 ' + error.msg);
            })
            .finally(() => {
                $component.find('[action="addProject"]').attr('disabled', false);
            })
        })

        // do not trigger add project form
        $projectContainer.on('submit', 'form', e => {
            let $form = $(e.currentTarget);
            let $target = $form.find('button[type="submit"]');
            let $card = $form.closest('.card');
            e.preventDefault();

            let body = getFormDataJson($form);

            $target.attr('disabled', true);
            callBackendAPI('/updateProject', 'POST', body, {})
            .then(response => {
                $card.find('[name="lastUpdateTime"]').html(localeTimeTW(response.LAST_UPDATE_TIME));
                notify.success('更新成功');

            }).catch(error => {
                console.error(error);
                notify.danger('更新失敗');
            })
            .finally(() => {
                $target.attr('disabled', false);
            })
        })
        $projectContainer.on('click', '.card button[name="active"]', e => {
            let $target = $(e.currentTarget);
            let $card = $target.closest('.card');
            let projectId = $card.attr("projectId");
            let active = !$target.hasClass('active');
            let body = {
                projectId: projectId,
                active: !active
            }

            callBackendAPI('/toggleProject', 'POST', body, {})
            .then(response => {
                
                $target.toggleClass('active');
                let oriClass = mainController.getBgClassByActive(active);
                let newClass = mainController.getBgClassByActive(!active);

                $card.find('.card-header').removeClass(oriClass).addClass(newClass);

                $card.find('[name="lastUpdateTime"]').html(localeTimeTW(response.LAST_UPDATE_TIME));

                notify.success('停用/啟用成功');

            }).catch(error => {
                console.error(error);
            })
        })

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        callBackendAPI('/listProject', 'GET')
        .then(response => {
            
            let myHtml = response.map(project => {
                return buildProjectBlock(project);
            }).join('\n');

            $projectContainer.prepend(myHtml);
        })
        .catch(error => {

        })

        haveInit = true;
    }

    // private functions
    function buildProjectBlock(project) {
        let aiConfig = JSON.parse(project.AI_CONFIG || '{}');
        let dbConfig = JSON.parse(project.DB_CONFIG || '{}');
        let bgClass = mainController.getBgClassByActive(project.ACTIVE);

        return `
        <div class="col-lg-6 col-md-12 mt-1 px-0">
            <div class="card mr-1" projectId="${ project.PROJECT_ID }"> 
                <h5 class="card-header py-1 ${ bgClass }">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="py-2" data-toggle="collapse" data-target="#collapse-${ project.PROJECT_ID }" aria-expanded="true">
                            <i class="fas fa-chevron-down mr-3"></i>${ project.PROJECT_NAME }
                        </div>
                        <div>
                            <button name="active" type="button" class="btn btn-sm btn-outline-secondary ${ project.ACTIVE ? '' : 'active' }">停用專案</button>
                            <button type="button" class="btn btn-sm btn-outline-danger d-none">移除專案</button>
                        </div>
                    </div>
                </h5>
                <div class="collapse" id="collapse-${ project.PROJECT_ID }">
                    <div class="card-body">
                        <form projectId="${ project.PROJECT_ID }" autocomplete="off">
                            <h4>基本設定</h4>
                            <div class="form-row">
                                <div class="form-group col-md-6 mb-2">
                                    <label class="col-form-label-sm" for="projectName">PROJECT_NAME</label>
                                    <input class="form-control form-control-sm" name="projectName" value="${ project.PROJECT_NAME }">
                                </div>
                                <div class="form-group col-md-6 mb-2">
                                    <label class="col-form-label-sm" for="projectId">PROJECT_ID</label>
                                    <input type="text" class="form-control form-control-sm" name="projectId" value="${ project.PROJECT_ID }" disabled>
                                </div>
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="url">MEMO</label>
                                <input type="text" class="form-control form-control-sm" name="memo" value="${ project.MEMO }">
                            </div>

                            <div class="border-top my-4"></div>
                            <h4>watson設定</h4>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="aiConfig_url">URL</label>
                                <input type="text" class="form-control form-control-sm" name="aiConfig_url" value="${ aiConfig.url || '' }">
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="aiConfig_apikey">APIKEY</label>
                                <input type="password" class="form-control form-control-sm" name="aiConfig_apikey" value="${ aiConfig.apikey || '' }">
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="aiConfig_skillId">SKILLID</label>
                                <input type="text" class="form-control form-control-sm" name="aiConfig_skillId" value="${ aiConfig.skillId || '' }">
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="aiConfig_version">VERSION</label>
                                <input class="form-control form-control-sm" name="aiConfig_version" value="${ aiConfig.version || '' }">
                            </div>

                            <div class="border-top my-4"></div>
                            <h4>資料庫連線設定</h4>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="dbConfig_dbName">Database</label>
                                <input type="text" class="form-control form-control-sm" name="dbConfig_database" value="${ dbConfig.database || '' }">
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="dbConfig_account">Account</label>
                                <input type="text" class="form-control form-control-sm" name="dbConfig_account" value="${ dbConfig.account || '' }">
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="dbConfig_password">Password</label>
                                <input type="password" class="form-control form-control-sm" name="dbConfig_password" value="${ dbConfig.password || '' }">
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="dbConfig_host">Host</label>
                                <input type="text" class="form-control form-control-sm" name="dbConfig_host" value="${ dbConfig.host || '' }">
                            </div>
                            <div class="form-group mb-2">
                                <label class="col-form-label-sm" for="dbConfig_port">Port</label>
                                <input type="text" class="form-control form-control-sm" name="dbConfig_port" value="${ dbConfig.port || '' }">
                            </div>


                            <div class="form-group d-none">
                                <!-- hidden values -->
                                <input type="text" class="form-control form-control-sm" value="${ project.LAST_UPDATE_TIME }">
                            </div>
                            <div class="form-row flex-row-reverse px-1">
                                <button type="submit" class="btn btn-sm btn-primary">儲存</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="card-footer py-1">
                    <div class="d-flex justify-content-between align-items-center">
                        <small>建立時間: <span name="createTime">${ localeTimeTW(project.CREATE_TIME) }</span></small>
                        <small>最後編輯: <span name="lastUpdateTime">${ localeTimeTW(project.LAST_UPDATE_TIME) }</span></small>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();