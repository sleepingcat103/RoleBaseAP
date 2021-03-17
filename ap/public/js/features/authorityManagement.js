"use strict";

var authorityManagementController = function () {
  var haveInit;
  var authorities, roles;
  var $tab = $('[tab="authorityManagement"]');
  var $table = $tab.find('table');
  var $editAuthority = $tab.find('#editAuthority');
  var $insertAuthority = $tab.find('#insertAuthority'); // 初始化頁面動作

  function __init__() {
    var $editSidebar = sidebar($editAuthority, '', true);
    $editSidebar.on('click', 'button[action="update"]', updateAuthority);
    $editSidebar.on('click', 'button[action="cancel"]', cancelEditAuthority);
    $editSidebar.on('click', 'button[action="delete"]', deleteAuthority);
    var $insertSidebar = sidebar($insertAuthority, '', true);
    $insertSidebar.on('click', 'button[action="insert"]', insertAuthority);
    $insertSidebar.on('click', 'button[action="cancel"]', cancelInsertAuthority); // 編輯權限

    $table.on('click', 'button', function (e) {
      var userId = $(e.currentTarget).attr('userId');
      ;
      var authority = authorities.find(function (au) {
        return au.USER_ID === userId;
      });
      $editAuthority.find('#user_id').val(authority.USER_ID);
      $editAuthority.find('#user_role').val(authority.ROLE_ID);
      $editAuthority.find('#user_active').attr('checked', authority.ACTIVE === 1);
      $editAuthority.find('#user_memo').val(authority.MEMO);
      $editSidebar.toggleClass('active');
    }); // 新增權限

    $tab.on('click', '#add_authority', function (e) {
      $insertSidebar.toggleClass('active');
    });

    function insertAuthority() {
      var body = {
        userId: $insertSidebar.find('#user_id').val(),
        projectId: mainController.getProjectId(),
        roleId: $insertSidebar.find('#user_role').val(),
        active: $insertSidebar.find('#user_active:checked').length,
        memo: $insertSidebar.find('#user_memo').val()
      };
      var $insertButton = $insertSidebar.find('button[action="insert"]');
      var $alert = $insertSidebar.find('#user_alert');
      $insertButton.attr('disabled', true);
      $alert.hide();
      callBackendAPI('/insertAuthority', 'POST', body).then(function (response) {
        console.log(response);
        $insertSidebar.find('#user_id').val('');
        $insertSidebar.find('#user_role').val('');
        $insertSidebar.find('#user_active:checked').trigger('click');
        $insertSidebar.find('#user_memo').val('');
        $insertSidebar.toggleClass('active');
        authorities.push(response);
        insertRow(response);
      })["catch"](function (error) {
        $alert.html(error.msg);
        $alert.show();
      })["finally"](function () {
        $insertButton.attr('disabled', false);
      });
    }

    ;

    function updateAuthority() {
      var confirmMsg = '確認編輯？';

      if (confirm(confirmMsg)) {
        var userId = $editSidebar.find('#user_id').val();
        var $updateButton = $editSidebar.find('button[action="update"]');
        var $alert = $editSidebar.find('#user_alert');
        var targetAuthority = authorities.find(function (authority) {
          return authority.USER_ID == userId;
        });

        if (!targetAuthority) {
          $alert.html('資訊錯誤，不存在的使用者');
          $alert.show();
          return;
        }

        var body = {
          userId: userId,
          projectId: mainController.getProjectId(),
          roleId: $editSidebar.find('#user_role').val(),
          active: $editSidebar.find('#user_active:checked').length,
          memo: $editSidebar.find('#user_memo').val()
        };
        $updateButton.attr('disabled', true);
        $alert.hide();
        callBackendAPI('/updateAuthority', 'POST', body).then(function (response) {
          updateRow(response);
          $editSidebar.toggleClass('active');
        })["catch"](function (error) {
          $alert.html(error.msg);
          $alert.show();
        })["finally"](function () {
          $updateButton.attr('disabled', false);
        });
      }
    }

    ;

    function cancelEditAuthority() {
      $editSidebar.toggleClass('active');
    }

    ;

    function cancelInsertAuthority() {
      $insertSidebar.toggleClass('active');
    }

    function deleteAuthority() {
      var confirmMsg = '將刪除授權，是否確認？';

      if (confirm(confirmMsg)) {
        var userId = $editSidebar.find('#user_id').val();
        var $deleteButton = $editSidebar.find('button[action="delete"]');
        var $alert = $editSidebar.find('#user_alert');
        var targetIndex = authorities.findIndex(function (authority) {
          return authority.USER_ID == userId;
        });

        if (targetIndex < 0) {
          $alert.html('資訊錯誤，不存在的使用者');
          $alert.show();
          return;
        }

        var body = {
          userId: userId,
          projectId: mainController.getProjectId(),
          roleId: $editSidebar.find('#user_role').val()
        };
        $deleteButton.attr('disabled', true);
        $alert.hide();
        callBackendAPI('/deleteAuthority', 'POST', body).then(function (response) {
          authorities.splice(targetIndex, 1);
          deleteRow(userId);
          $editSidebar.toggleClass('active');
        })["catch"](function (error) {
          $alert.html(error.msg);
          $alert.show();
        })["finally"](function () {
          $deleteButton.attr('disabled', false);
        });
      }
    }

    ;
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    // 取得所有用戶組與使用者列表
    var requests = function () {
      var body = {
        projectId: mainController.getProjectId()
      };
      return [callBackendAPI('/listUsersByProjectId', 'POST', body), callBackendAPI('/listRole', 'GET', {})];
    }();

    Promise.all(requests).then(function (response) {
      authorities = response[0];
      roles = response[1];
      var tableRows = authorities.map(function (authority) {
        authority.ROLE_NAME = (roles.find(function (role) {
          return role.ROLE_ID === authority.ROLE_ID;
        }) || {}).ROLE_NAME;
        return generateRow(authority);
      }).join('');
      $table.find('tbody').html(tableRows);
      $editAuthority.find('#user_role').html(generateRoleOptions(roles));
      $insertAuthority.find('#user_role').html(generateRoleOptions(roles));
      haveInit = true;
    })["catch"](function (error) {
      tempMask('頁面初始化失敗，請洽開發人員');
      console.log('頁面初始化失敗，請洽開發人員');
      console.error(error);
    });
  } // private functions


  function generateRow(authority) {
    return "\n        <tr userId=".concat(authority.USER_ID, ">\n            <td>").concat(authority.USER_ID, "</td>\n            <td>").concat(authority.ACTIVE == 1 ? '<div class="badge badge-info">啟用</div>' : '<div class="badge badge-secondary">停用</div>', "</td>\n            <td>").concat(getRoleNameById(authority.ROLE_ID), "</td>\n            <td>").concat(authority.MEMO || '-', "</td>\n            <td><button type=\"button\" class=\"btn btn-success btn-sm\" userId=\"").concat(authority.USER_ID, "\">\u7DE8\u8F2F</button></td>\n        </tr>");
  }

  function getRow(userId) {
    return $table.find("[userId=\"".concat(userId, "\"]"));
  }

  function updateRow(authority) {
    var $targetRow = getRow(authority.USER_ID);
    $targetRow.after(generateRow(authority));
    $targetRow.remove();
  }

  function insertRow(authority) {
    // console.log(authority);
    $table.find('tbody').append(generateRow(authority));
  }

  function deleteRow(userId) {
    var $targetRow = getRow(userId);
    $targetRow.remove();
  }

  function generateRoleOptions(roles) {
    return roles.map(function (role) {
      return '<option value="' + role.ROLE_ID + '">' + role.ROLE_NAME + '</option>';
    }).join('\n');
  }

  function getRoleNameById(roleId) {
    return (roles.find(function (role) {
      return role.ROLE_ID == roleId;
    }) || {}).ROLE_NAME;
  } // do page init


  __init__();

  return {};
}();