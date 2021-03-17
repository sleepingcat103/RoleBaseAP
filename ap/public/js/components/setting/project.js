"use strict";

(function () {
  var haveInit;
  var $component = $('[component="project"]');
  var $projectContainer = $component.find('[content="projects"]');
  var $newProjectForm = $component.find('#collapse-newProject').find('form'); // 初始化頁面動作

  function __init__() {
    // add new project
    $component.on('click', '[action="addProject"]', function (e) {
      var $projectAlert = $newProjectForm.find('#project_alert');
      var body = getFormDataJson($newProjectForm);
      $projectAlert.hide();

      if (Object.values(body).indexOf("") > -1) {
        $projectAlert.html('請填妥所有欄位').show();
        notify.danger('請填妥所有欄位');
        return;
      }

      $component.find('[action="addProject"]').attr('disabled', true);
      callBackendAPI('/insertProject', 'POST', body, {}).then(function (response) {
        notify.success('新增成功，需重啟後台系統以讀取新專案的資料');
        var myHtml = buildProjectBlock(response);
        $projectContainer.prepend(myHtml);
      })["catch"](function (error) {
        console.error(error);
        $projectAlert.html('新增失敗 ' + error.msg).show();
        notify.danger('新增失敗 ' + error.msg);
      })["finally"](function () {
        $component.find('[action="addProject"]').attr('disabled', false);
      });
    }); // do not trigger add project form

    $projectContainer.on('submit', 'form', function (e) {
      var $form = $(e.currentTarget);
      var $target = $form.find('button[type="submit"]');
      var $card = $form.closest('.card');
      e.preventDefault();
      var body = getFormDataJson($form);
      $target.attr('disabled', true);
      callBackendAPI('/updateProject', 'POST', body, {}).then(function (response) {
        $card.find('[name="lastUpdateTime"]').html(localeTimeTW(response.LAST_UPDATE_TIME));
        notify.success('更新成功');
      })["catch"](function (error) {
        console.error(error);
        notify.danger('更新失敗');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    $projectContainer.on('click', '.card button[name="active"]', function (e) {
      var $target = $(e.currentTarget);
      var $card = $target.closest('.card');
      var projectId = $card.attr("projectId");
      var active = !$target.hasClass('active');
      var body = {
        projectId: projectId,
        active: !active
      };
      callBackendAPI('/toggleProject', 'POST', body, {}).then(function (response) {
        $target.toggleClass('active');
        var oriClass = mainController.getBgClassByActive(active);
        var newClass = mainController.getBgClassByActive(!active);
        $card.find('.card-header').removeClass(oriClass).addClass(newClass);
        $card.find('[name="lastUpdateTime"]').html(localeTimeTW(response.LAST_UPDATE_TIME));
        notify.success('停用/啟用成功');
      })["catch"](function (error) {
        console.error(error);
      });
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    callBackendAPI('/listProject', 'GET').then(function (response) {
      var myHtml = response.map(function (project) {
        return buildProjectBlock(project);
      }).join('\n');
      $projectContainer.prepend(myHtml);
    })["catch"](function (error) {});
    haveInit = true;
  } // private functions


  function buildProjectBlock(project) {
    var aiConfig = JSON.parse(project.AI_CONFIG || '{}');
    var dbConfig = JSON.parse(project.DB_CONFIG || '{}');
    var bgClass = mainController.getBgClassByActive(project.ACTIVE);
    return "\n        <div class=\"col-lg-6 col-md-12 mt-1 px-0\">\n            <div class=\"card mr-1\" projectId=\"".concat(project.PROJECT_ID, "\"> \n                <h5 class=\"card-header py-1 ").concat(bgClass, "\">\n                    <div class=\"d-flex justify-content-between align-items-center\">\n                        <div class=\"py-2\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(project.PROJECT_ID, "\" aria-expanded=\"true\">\n                            <i class=\"fas fa-chevron-down mr-3\"></i>").concat(project.PROJECT_NAME, "\n                        </div>\n                        <div>\n                            <button name=\"active\" type=\"button\" class=\"btn btn-sm btn-outline-secondary ").concat(project.ACTIVE ? '' : 'active', "\">\u505C\u7528\u5C08\u6848</button>\n                            <button type=\"button\" class=\"btn btn-sm btn-outline-danger d-none\">\u79FB\u9664\u5C08\u6848</button>\n                        </div>\n                    </div>\n                </h5>\n                <div class=\"collapse\" id=\"collapse-").concat(project.PROJECT_ID, "\">\n                    <div class=\"card-body\">\n                        <form projectId=\"").concat(project.PROJECT_ID, "\" autocomplete=\"off\">\n                            <h4>\u57FA\u672C\u8A2D\u5B9A</h4>\n                            <div class=\"form-row\">\n                                <div class=\"form-group col-md-6 mb-2\">\n                                    <label class=\"col-form-label-sm\" for=\"projectName\">PROJECT_NAME</label>\n                                    <input class=\"form-control form-control-sm\" name=\"projectName\" value=\"").concat(project.PROJECT_NAME, "\">\n                                </div>\n                                <div class=\"form-group col-md-6 mb-2\">\n                                    <label class=\"col-form-label-sm\" for=\"projectId\">PROJECT_ID</label>\n                                    <input type=\"text\" class=\"form-control form-control-sm\" name=\"projectId\" value=\"").concat(project.PROJECT_ID, "\" disabled>\n                                </div>\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"url\">MEMO</label>\n                                <input type=\"text\" class=\"form-control form-control-sm\" name=\"memo\" value=\"").concat(project.MEMO, "\">\n                            </div>\n\n                            <div class=\"border-top my-4\"></div>\n                            <h4>watson\u8A2D\u5B9A</h4>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"aiConfig_url\">URL</label>\n                                <input type=\"text\" class=\"form-control form-control-sm\" name=\"aiConfig_url\" value=\"").concat(aiConfig.url || '', "\">\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"aiConfig_apikey\">APIKEY</label>\n                                <input type=\"password\" class=\"form-control form-control-sm\" name=\"aiConfig_apikey\" value=\"").concat(aiConfig.apikey || '', "\">\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"aiConfig_skillId\">SKILLID</label>\n                                <input type=\"text\" class=\"form-control form-control-sm\" name=\"aiConfig_skillId\" value=\"").concat(aiConfig.skillId || '', "\">\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"aiConfig_version\">VERSION</label>\n                                <input class=\"form-control form-control-sm\" name=\"aiConfig_version\" value=\"").concat(aiConfig.version || '', "\">\n                            </div>\n\n                            <div class=\"border-top my-4\"></div>\n                            <h4>\u8CC7\u6599\u5EAB\u9023\u7DDA\u8A2D\u5B9A</h4>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"dbConfig_dbName\">Database</label>\n                                <input type=\"text\" class=\"form-control form-control-sm\" name=\"dbConfig_database\" value=\"").concat(dbConfig.database || '', "\">\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"dbConfig_account\">Account</label>\n                                <input type=\"text\" class=\"form-control form-control-sm\" name=\"dbConfig_account\" value=\"").concat(dbConfig.account || '', "\">\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"dbConfig_password\">Password</label>\n                                <input type=\"password\" class=\"form-control form-control-sm\" name=\"dbConfig_password\" value=\"").concat(dbConfig.password || '', "\">\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"dbConfig_host\">Host</label>\n                                <input type=\"text\" class=\"form-control form-control-sm\" name=\"dbConfig_host\" value=\"").concat(dbConfig.host || '', "\">\n                            </div>\n                            <div class=\"form-group mb-2\">\n                                <label class=\"col-form-label-sm\" for=\"dbConfig_port\">Port</label>\n                                <input type=\"text\" class=\"form-control form-control-sm\" name=\"dbConfig_port\" value=\"").concat(dbConfig.port || '', "\">\n                            </div>\n\n\n                            <div class=\"form-group d-none\">\n                                <!-- hidden values -->\n                                <input type=\"text\" class=\"form-control form-control-sm\" value=\"").concat(project.LAST_UPDATE_TIME, "\">\n                            </div>\n                            <div class=\"form-row flex-row-reverse px-1\">\n                                <button type=\"submit\" class=\"btn btn-sm btn-primary\">\u5132\u5B58</button>\n                            </div>\n                        </form>\n                    </div>\n                </div>\n                <div class=\"card-footer py-1\">\n                    <div class=\"d-flex justify-content-between align-items-center\">\n                        <small>\u5EFA\u7ACB\u6642\u9593: <span name=\"createTime\">").concat(localeTimeTW(project.CREATE_TIME), "</span></small>\n                        <small>\u6700\u5F8C\u7DE8\u8F2F: <span name=\"lastUpdateTime\">").concat(localeTimeTW(project.LAST_UPDATE_TIME), "</span></small>\n                    </div>\n                </div>\n            </div>\n        </div>");
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
})();