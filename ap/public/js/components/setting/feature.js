"use strict";

(function () {
  var haveInit;
  var $featureList = $('#featureList');
  var $saveFeatureSort = $('#saveFeatureSort');
  var nowList;
  var edited = false; // 初始化頁面動作

  function __init__() {
    Sortable.create($featureList[0], {
      animation: 150,
      ghostClass: 'bg_green_light',
      onUpdate: sortableOnUpdateHandler
    });
    $saveFeatureSort.on('click', function (e) {
      sortableOnUpdateHandler();
      if (!edited) return;
      var featuresSort = getList();
      $saveFeatureSort.attr('disabled', true);
      callBackendAPI('/sortFeature', 'POST', featuresSort).then(function (response) {
        notify.success('變更成功，重新登入以看到你的變更');
        nowList = getList();
        edited = true;
      })["catch"](function (error) {
        $saveFeatureSort.attr('disabled', false);
      });
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    callBackendAPI('/listAllFeature', 'GET').then(function (response) {
      var myHtml = response.map(function (feature) {
        return "\n                    <div class=\"list-group-item py-1\" featureId=\"".concat(feature.FEATURE_ID, "\">\n                        <i class=\"fas fa-arrows-alt-v mr-3\"></i> ").concat(feature.FEATURE_NAME, " \n                    </div>");
      }).join('\n');
      $featureList.html(myHtml);
      nowList = getList();
    })["catch"](function (error) {}); // get data

    haveInit = true;
  } // private functions


  function getList() {
    return $featureList.find('.list-group-item').toArray().map(function (li) {
      return $(li).attr('featureId');
    });
  } // handler


  function sortableOnUpdateHandler(e) {
    var newList = getList();
    edited = !deepCompare(nowList, newList);

    if (edited) {
      $saveFeatureSort.attr('disabled', false);
    } else {
      $saveFeatureSort.attr('disabled', true);
    }
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    edited: edited,
    initPage: initPage
  };
})();