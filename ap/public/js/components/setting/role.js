"use strict";

(function () {
  var haveInit;
  var $component = $('[component="role"]');
  var $roleContainer = $component.find('[content="roles"]');
  var $addRole = $component.find('#addRole');
  var $addRoleSidebar = $component.find('#addRoleSidebar'); // 初始化頁面動作

  function __init__() {
    $addRole.on('click', function (e) {
      $addRoleSidebar.toggleClass('active');
    });
    $addRoleSidebar.on('click', '[action="create"]', function (e) {
      var $target = $(e.currentTarget);
      var roleId = $addRoleSidebar.find('#roleId').val();
      var roleName = $addRoleSidebar.find('#roleName').val();
      if (!roleId || !roleName) return;
      $addRoleSidebar.find('#role_alert').hide();
      $target.attr('disabled', true);
      var body = {
        roleId: roleId,
        roleName: roleName
      };
      callBackendAPI('/insertRole', 'POST', body).then(function (response) {
        $roleContainer.prepend(buildRoleHtml(response));
        $addRoleSidebar.toggleClass('active');
        notify.success('新增成功!');
      })["catch"](function (error) {
        $addRoleSidebar.find('#role_alert').html(error.msg).show();
        notify.danger('新增失敗!');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    $roleContainer.on('click', '[action="deleteRole"]', function (e) {
      if (!confirm('確定要刪除? 此動作無法復原')) return;
      var $target = $(e.currentTarget);
      var $block = $target.parent().parent().parent();
      var roleId = $target.parent().parent().attr('roleId');
      $target.attr('disabled', true);
      var body = {
        roleId: roleId
      };
      callBackendAPI('/deleteRole', 'POST', body).then(function (response) {
        $block.remove();
        notify.success('刪除成功!');
      })["catch"](function (error) {
        notify.danger('刪除失敗!');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    callBackendAPI('/listRole', 'GET').then(function (response) {
      var myHtml = response.map(function (role) {
        return buildRoleHtml(role);
      }).join('');
      $roleContainer.prepend(myHtml);
    })["catch"](function (error) {});
    haveInit = true;
  } // private functions


  function buildRoleHtml(role) {
    return "\n        <div class=\"col-xl-3 col-md-4 col-6 px-0\">\n            <div class=\"d-flex justify-content-between align-items-center border rounded px-2 py-2 mt-1 mr-1\" roleId=\"".concat(role.ROLE_ID, "\">\n                <span>").concat(role.ROLE_NAME, "</span>\n                <div>\n                    <a action=\"deleteRole\" href=\"#\" class=\"badge badge-danger\"><i class=\"fas fa-times\"></i></a>\n                </div>\n            </div>\n        </div>");
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
})();