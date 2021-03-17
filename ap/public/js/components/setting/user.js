"use strict";

(function () {
  var haveInit;
  var $component = $('[component="user"]'); // let $userContainer = $component.find('[content="users"]');

  var datatable;
  var datatableConfig = {
    dom: "<\"d-flex justify-content-between align-items-center\" f\n                <\"d-flex align-items-center\" \n                    <i>\n                    <\"ml-2\" l>\n                    <\"ml-2\" p>\n                >>t<\"d-flex justify-content-end\"p>",
    responsive: true,
    language: {
      url: "/backend/static/plugin/datatable-traditional-chonese.json"
    }
  }; // 初始化頁面動作

  function __init__() {
    datatable = $component.find('table').DataTable(datatableConfig); // $component.find('table').on('click', '[action="delete"]', e => {
    //     if(!confirm('確定要刪除? 此動作無法復原')) return;
    //     let $target = $(e.currentTarget);
    //     let $block = $target.parent().parent().parent();
    //     let body = {
    //         userId: $block.text().trim()
    //     }
    //     callBackendAPI('/deleteUser', 'POST', body)
    //     .then(response => {
    //         notify.success('刪除成功!');
    //         $block.remove();
    //     })
    //     .catch(error => {
    //         notify.danger('刪除失敗!');
    //     })
    // })

    $component.find('table').on('click', '[action="toggle"]', function (e) {
      var $target = $(e.currentTarget);
      var oriColorClass = mainController.getBgClassByActive($target.attr('active'));
      var oriActive = $target.attr('active');
      var newActive = (oriActive - 0 + 1) % 2;
      var body = {
        active: newActive,
        userId: $target.closest('tr').find('td').first().text().trim()
      };
      callBackendAPI('/toggleUser', 'POST', body).then(function (response) {
        $target.attr('active', newActive);
        $target.html(generateActiveHtml(newActive));
        $target.removeClass(oriColorClass);
        $target.addClass(mainController.getBgClassByActive(newActive));
      })["catch"](function (error) {});
    });
    $component.find('table').on('click', '[action="delete"]', function (e) {
      if (!confirm('確定要刪除? 此動作無法復原')) return;
      var $target = $(e.currentTarget);
      var $row = $target.closest('tr');
      var body = {
        userId: $row.find('td').first().text().trim()
      };
      callBackendAPI('/deleteUser', 'POST', body).then(function (response) {
        datatable.row($row[0]).remove().draw();
        notify.success('刪除成功');
      })["catch"](function (error) {
        notify.danger('刪除失敗');
      });
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    callBackendAPI('/listUsers', 'GET').then(function (response) {
      datatable.rows.add(response.map(function (user) {
        return generateRow(user);
      })).draw();
    })["catch"](function (error) {});
    haveInit = true;
  } // private functions


  function generateRow(user) {
    return [user.USER_ID, generateButtonByActive(user.ACTIVE), localeTimeTW(user.CREATE_TIME), localeTimeTW(user.LAST_UPDATE_TIME), '<button action="delete" class="btn btn-sm btn-danger"><i class="fas fa-times mr-1"></i> 刪除</a>'];
  }

  function generateButtonByActive(active) {
    return "<button action=\"toggle\" class=\"btn-sm btn ".concat(mainController.getBgClassByActive(active), "\" active=\"").concat(active, "\">\n            ").concat(generateActiveHtml(active), "\n        </a>");
  }

  function generateActiveHtml(active) {
    return active == '1' ? '<i class="fas fa-check mr-1"></i> 啟用中' : active == '0' ? '<i class="fas fa-ban mr-1"></i> 停用中' : '';
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
})();