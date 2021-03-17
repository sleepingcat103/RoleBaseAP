"use strict";

var traceLogController = function () {
  var haveInit;
  var $tab = $('[tab="traceLog"]');
  var $startDt = $('#startDt');
  var $endDt = $('#endDt');
  var $sessionId = $('#sessionId');
  var $search = $tab.find('[action="search"]');
  var $download = $tab.find('[action="download"]');
  var traceLogDatatable;
  var datatableConfig = {
    order: [[0, 'asc']],
    dom: "<\"d-flex justify-content-between align-items-center\" f\n                <\"d-flex align-items-center\" \n                    <i>\n                    <\"ml-2\" l>\n                    <\"ml-2\" p>\n                >>t<\"d-flex justify-content-end\"p>",
    responsive: true,
    language: {
      url: "/backend/static/plugin/datatable-traditional-chonese.json"
    }
  }; // 初始化頁面動作

  function __init__() {
    traceLogDatatable = $tab.find('table').DataTable(datatableConfig); // 日期區間初始化

    $tab.find('[input-content="datepicker"]').datepicker({
      format: "yyyy/mm/dd",
      autoclose: true,
      calendarWeeks: true,
      todayHighlight: true,
      language: 'zh-TW'
    });
    $startDt.val(dayjs().add(-1, 'day').format('YYYY/MM/DD'));
    $endDt.val(dayjs().format('YYYY/MM/DD')); // 快速選擇區間

    $tab.find('#range_Mondh').on('click', function (e) {
      $startDt.val(dayjs().add(-1, 'month').format('YYYY/MM/DD'));
      $endDt.val(dayjs().format('YYYY/MM/DD'));
    });
    $tab.find('#range_Week').on('click', function (e) {
      $startDt.val(dayjs().add(-7, 'day').format('YYYY/MM/DD'));
      $endDt.val(dayjs().format('YYYY/MM/DD'));
    });
    $tab.find('#range_Day').on('click', function (e) {
      $startDt.val(dayjs().add(-1, 'day').format('YYYY/MM/DD'));
      $endDt.val(dayjs().format('YYYY/MM/DD'));
    });
    $search.on('click', function (e) {
      var $target = $(e.currentTarget); // 防呆

      var startDt = $startDt.val(),
          endDt = $endDt.val();

      if (!startDt || !endDt) {
        notify.danger('請填寫起迄日');
        return false;
      }

      endDt = dayjs(endDt).add(1, 'day').format('YYYY/MM/DD');

      if (startDt > endDt) {
        notify.danger('起日需早於迄日');
        return false;
      }

      var body = {
        projectId: mainController.getProjectId(),
        startDt: startDt,
        endDt: endDt,
        sessionId: $sessionId.val(),
        offset: 0
      };

      var setLogSearchHandler = function setLogSearchHandler(response) {
        traceLogDatatable.rows.add(response.map(function (row) {
          var CREATE_TIME = row.CREATE_TIME,
              USER_TYPE = row.USER_TYPE,
              SESSION_ID = row.SESSION_ID,
              USER_SAY = row.USER_SAY,
              INTENT = row.INTENT,
              INTENT_CONFIDENCE = row.INTENT_CONFIDENCE,
              ENTITY = row.ENTITY,
              ANSWER_ID = row.ANSWER_ID,
              ANS_NAME = row.ANS_NAME,
              DETAIL = row.DETAIL;
          return [localeTimeTW(CREATE_TIME), SESSION_ID, USER_TYPE, htmlEncode(USER_SAY), "[".concat(ANSWER_ID, "] ").concat(ANS_NAME)];
        })).draw();
      };

      var surveySearchHandler = function surveySearchHandler(response) {
        traceLogDatatable.rows.add(response.map(function (row) {
          var CREATE_TIME = row.CREATE_TIME,
              SATISFACTION = row.SATISFACTION,
              SESSIONID = row.SESSIONID,
              COMMENTS = row.COMMENTS,
              COME_FROM = row.COME_FROM;
          return [localeTimeTW(CREATE_TIME), SESSIONID, 'survey', "[".concat(SATISFACTION, "] ").concat(htmlEncode(COMMENTS)), ''];
        })).draw();
      };

      $target.attr('disabled', true);
      traceLogDatatable.clear().draw();
      return mainController.rollingSearch(body, function (body) {
        return callBackendAPI('/findSetLog', 'POST', body);
      }, setLogSearchHandler).then(function () {
        return mainController.rollingSearch(body, function (body) {
          return callBackendAPI('/findSurvey', 'POST', body);
        }, surveySearchHandler);
      }).then(function () {
        notify.success('搜尋成功');
      })["catch"](function (error) {
        console.error(error);
        notify.danger('搜尋失敗');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    }); // 下載按鈕

    $download.on('click', function (e) {
      DownloadGreatCSV($tab.find('table'), '意見回覆'); // let header = traceLogDatatable.columns().header().toArray().map(th => $(th).text())
      // let data = [header].concat(traceLogDatatable.rows().data().toArray());
      // let sheet = XLSX.utils.aoa_to_sheet(data);
      // openDownloadDialog(sheet2blob(sheet), '意見回覆' + '.xlsx');
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    haveInit = true;
  } // private functions
  // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
}();