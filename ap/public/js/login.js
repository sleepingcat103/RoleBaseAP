"use strict";

(function () {
  var haveInit;
  var $username = $('#username');
  var $password = $('#password');
  var $warningMsg = $('#warning_msg'); // 初始化頁面動作

  function __init__() {
    sessionStorage.clear(); // 登入

    $('form').on('submit', function (e) {
      e.preventDefault();
      $username.val($username.val().trim());
      var body = {
        username: $username.val(),
        password: $password.val()
      };
      $warningMsg.hide();

      if (!body.username) {
        $warningMsg.html('員編不得為空');
        $warningMsg.show();
        return;
      }

      if (!body.password) {
        $warningMsg.html('密碼不得為空');
        $warningMsg.show();
        return;
      }

      var mask = stableMask('登入中...');
      callBackendAPI('/login', 'POST', body).then(function () {
        window.location = '/backend';
      })["catch"](function (error) {
        $warningMsg.html(error.msg || error);
        $warningMsg.show();
      })["finally"](function () {
        removeMask(mask);
      });
    });
    initPage();
  } // 初始化頁面資訊


  function initPage() {
    // get data
    haveInit = true;
    return 'ok';
  } // private functions
  // function xx() {}
  // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
})();