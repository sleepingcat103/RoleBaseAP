"use strict";

(function () {
  var haveInit;
  var $component = $('[component="admin"]');
  var $addAdmin = $component.find('#addAdmin');
  var $addAdminSidebar = $component.find('#addAdminSidebar');
  var datatable;
  var datatableConfig = {
    dom: "<\"d-flex justify-content-between align-items-center\" f\n                <\"d-flex align-items-center\" \n                    <i>\n                    <\"ml-2\" l>\n                    <\"ml-2\" p>\n                >>t<\"d-flex justify-content-end\"p>",
    responsive: true,
    language: {
      url: "/backend/static/plugin/datatable-traditional-chonese.json"
    }
  }; // 初始化頁面動作

  function __init__() {
    datatable = $component.find('table').DataTable(datatableConfig);
    $addAdmin.on('click', function (e) {
      $addAdminSidebar.toggleClass('active');
    });
    $component.find('table').on('click', '[action="toggle"]', function (e) {
      var $target = $(e.currentTarget);
      var oriColorClass = mainController.getBgClassByActive($target.attr('active'));
      var oriActive = $target.attr('active');
      var newActive = (oriActive - 0 + 1) % 2;
      var body = {
        active: newActive,
        userId: $target.closest('tr').find('td').first().text().trim()
      };
      callBackendAPI('/toggleAdminUser', 'POST', body).then(function (response) {
        $target.attr('active', newActive);
        $target.html(generateActiveHtml(newActive));
        $target.removeClass(oriColorClass);
        $target.addClass(mainController.getBgClassByActive(newActive));
        checkButtons();
      })["catch"](function (error) {});
    });
    $component.find('table').on('click', '[action="delete"]', function (e) {
      if (!confirm('確定要刪除? 此動作無法復原')) return;
      var $target = $(e.currentTarget);
      var $row = $target.closest('tr');
      var body = {
        userId: $row.find('td').first().text().trim()
      };
      callBackendAPI('/deleteAdminUser', 'POST', body).then(function (response) {
        datatable.row($row[0]).remove().draw();
        notify.success('刪除成功');
        checkButtons();
      })["catch"](function (error) {
        notify.danger('刪除失敗');
      });
    });
    $addAdminSidebar.on('click', '[action="create"]', function (e) {
      var $target = $(e.currentTarget);
      var $alert = $addAdminSidebar.find('#admin_alert');
      var userId = $addAdminSidebar.find('#userId').val(),
          password = $addAdminSidebar.find('#password').val(),
          passwordAgain = $addAdminSidebar.find('#passwordAgain').val();
      $alert.hide();
      if (!userId || !password) return;

      if (password != passwordAgain) {
        $alert.html('兩次輸入密碼不同').show();
        return;
      }

      var body = {
        userId: userId,
        password: password
      };
      $target.attr('disabled', true);
      callBackendAPI('/insertAdminUser', 'POST', body).then(function (response) {
        datatable.row.add(generateRow(response)).draw();
        $addAdminSidebar.toggleClass('active');
        notify.success('新增成功');
        checkButtons();
      })["catch"](function (error) {
        console.log(error);
        $alert.html(error.msg).show();
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    callBackendAPI('/listAdminUsers', 'GET').then(function (response) {
      datatable.rows.add(response.map(function (admin) {
        return generateRow(admin);
      })).draw();
      checkButtons();
    })["catch"](function (error) {});
    haveInit = true;
  } // private functions


  function generateRow(admin) {
    return [admin.USER_ID, generateButtonByActive(admin.ACTIVE), localeTimeTW(admin.CREATE_TIME), localeTimeTW(admin.LAST_UPDATE_TIME), '<button action="delete" class="btn btn-sm btn-danger"><i class="fas fa-times mr-1"></i> 刪除</a>'];
  }

  function generateButtonByActive(active) {
    return "<button action=\"toggle\" class=\"btn-sm btn ".concat(mainController.getBgClassByActive(active), "\" active=\"").concat(active, "\">\n            ").concat(generateActiveHtml(active), "\n        </a>");
  }

  function generateActiveHtml(active) {
    return active == '1' ? '<i class="fas fa-check mr-1"></i> 啟用中' : active == '0' ? '<i class="fas fa-ban mr-1"></i> 停用中' : '';
  }

  function checkButtons() {
    var $activeRows = $component.find('table').find('tr').toArray().filter(function (row) {
      $(row).find('[action="delete"]').show();
      $(row).find('[action="toggle"]').show();
      return $(row).find('[action="toggle"]').attr('active') == '1';
    });
    var $deleteButtons = $component.find('table').find('[action="delete"]');
    $deleteButtons.show();

    if ($activeRows.length > 1) {// nothing
    } else {
      $activeRows.map(function (row) {
        $(row).find('[action="delete"]').hide();
        $(row).find('[action="toggle"]').hide();
      });
    }
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
})();