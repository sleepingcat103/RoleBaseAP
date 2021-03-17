"use strict";

var environmentSettingController = function () {
  var haveInit;
  var $tab = $('[tab="environmentSetting"]');
  var $componentProject = $('[component="project"]');
  var $componentFeature = $('[component="feature"]');
  var $componentAdmin = $('[component="admin"]');
  var $componentRole = $('[component="role"]');
  var $componentUser = $('[component="user"]'); // 初始化頁面動作

  function __init__() {
    mainController.getPage('/components/setting-project').then(function (page) {
      $componentProject.html(page);
    })["catch"](function (e) {});
    mainController.getPage('/components/setting-feature').then(function (page) {
      $componentFeature.html(page);
    })["catch"](function (e) {});
    mainController.getPage('/components/setting-admin').then(function (page) {
      $componentAdmin.html(page);
    })["catch"](function (e) {});
    mainController.getPage('/components/setting-role').then(function (page) {
      $componentRole.html(page);
    })["catch"](function (e) {});
    mainController.getPage('/components/setting-user').then(function (page) {
      $componentUser.html(page);
    })["catch"](function (e) {});
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    haveInit = true;
  } // private functions
  // function xx() {}
  // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
}();