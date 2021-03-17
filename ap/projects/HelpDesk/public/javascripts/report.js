"use strict";

var reportController = function () {
  var haveInit;
  var $tab = $('[tab="report"]');
  var $startDt = $('#startDt');
  var $endDt = $('#endDt');
  var $search = $tab.find('[action="search"]');
  var $download = $tab.find('[action="download"]');
  var datatableConfig = {
    dom: "<\"d-flex justify-content-between align-items-center\" f\n                <\"d-flex align-items-center\" \n                    <i>\n                    <\"ml-2\" l>\n                    <\"ml-2\" p>\n                >>t<\"d-flex justify-content-end\"p>",
    responsive: true,
    language: {
      url: "/backend/static/plugin/datatable-traditional-chonese.json"
    }
  }; // 初始化頁面動作

  function __init__() {
    // datatable
    interactions.datatable = interactions.$.DataTable(datatableConfig);
    chats.datatable = chats.$.DataTable(datatableConfig);
    questionRank.datatable = questionRank.$.DataTable(datatableConfig);
    answerRank.datatable = answerRank.$.DataTable(datatableConfig); // 篩選信心功能

    $(chats.datatable.table().container()).on('click focus', '#chatsFilterIntent', function (e) {
      console.log(e);
      e.preventDefault();
    }); // 日期區間初始化

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
    }); // 搜尋按鈕

    $search.on('click', function (e) {
      var $target = $(e.currentTarget);
      var no = $tab.find('#myTab a.active').attr('no');
      var handler = [interactions, chats, questionRank, answerRank][no];
      var body = handler.getBody();
      if (!body) return;
      $target.attr('disabled', true);
      handler.datatable.clear().draw();
      handler.doSearch(body).then(function () {
        notify.success('搜尋成功');
      })["catch"](function (error) {
        console.error(error);
        notify.danger('搜尋失敗');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    }); // 下載按鈕

    $download.on('click', function (e) {
      var no = $tab.find('#myTab a.active').attr('no');
      var handler = [interactions, chats, questionRank, answerRank][no];
      DownloadGreatCSV(handler.$, handler.name); // let header = handler.datatable.columns().header().toArray().map(th => $(th).text())
      // let data = [header].concat(handler.datatable.rows().data().toArray());
      // let sheet = XLSX.utils.aoa_to_sheet(data);
      // openDownloadDialog(sheet2blob(sheet), handler.name + '.xlsx');
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    haveInit = true;
  } // private functions


  function findSetLog(body) {
    return callBackendAPI('/findSetLog', 'POST', body);
  }

  var interactions = {
    $: $tab.find('#interactions'),
    name: '互動總表',
    getBody: function getBody() {
      // 防呆
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
        offset: 0
      };
      return body;
    },
    doSearch: function doSearch(body) {
      var searchHandler = function searchHandler(response) {
        interactions.datatable.rows.add(response.map(function (row) {
          var CREATE_TIME = row.CREATE_TIME,
              SESSION_ID = row.SESSION_ID,
              USER_TYPE = row.USER_TYPE,
              USER_SAY = row.USER_SAY,
              INTENT = row.INTENT,
              INTENT_CONFIDENCE = row.INTENT_CONFIDENCE,
              ENTITY = row.ENTITY,
              ANSWER_ID = row.ANSWER_ID,
              ANS_NAME = row.ANS_NAME,
              DETAIL = row.DETAIL;
          return [localeTimeTW(CREATE_TIME), SESSION_ID, USER_TYPE, htmlEncode(USER_SAY), INTENT, INTENT_CONFIDENCE || 0, ENTITY, ANSWER_ID, ANS_NAME, DETAIL];
        })).draw();
      };

      return mainController.rollingSearch(body, findSetLog, searchHandler)["catch"](function (error) {
        console.error(error);
      });
    }
  };
  var chats = {
    $: $tab.find('#chats'),
    name: '自然發話',
    getBody: function getBody() {
      // 防呆
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
        action: 'text',
        offset: 0
      };
      return body;
    },
    doSearch: function doSearch(body) {
      var searchHandler = function searchHandler(response) {
        chats.datatable.rows.add(response.map(function (row) {
          var CREATE_TIME = row.CREATE_TIME,
              SESSION_ID = row.SESSION_ID,
              USER_SAY = row.USER_SAY,
              INTENT = row.INTENT,
              INTENT_CONFIDENCE = row.INTENT_CONFIDENCE,
              ENTITY = row.ENTITY,
              ANSWER_ID = row.ANSWER_ID,
              ANS_NAME = row.ANS_NAME,
              DETAIL = row.DETAIL;
          return [localeTimeTW(CREATE_TIME), SESSION_ID, htmlEncode(USER_SAY), INTENT, INTENT_CONFIDENCE, ENTITY, ANSWER_ID, ANS_NAME, DETAIL];
        })).draw();
      };

      return mainController.rollingSearch(body, findSetLog, searchHandler)["catch"](function (error) {
        console.error(error);
      });
    }
  };
  var questionRank = {
    $: $tab.find('#questionRank'),
    name: '詢問排行',
    getBody: function getBody() {
      // 防呆
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
        offset: 0
      };
      return body;
    },
    doSearch: function doSearch(body) {
      var searchHandler = function searchHandler(response) {
        var sortedData = [];
        response.filter(function (row) {
          return row.USER_SAY.trim();
        }).forEach(function (row) {
          var USER_TYPE = row.USER_TYPE,
              USER_SAY = row.USER_SAY,
              INTENT = row.INTENT,
              INTENT_CONFIDENCE = row.INTENT_CONFIDENCE;
          var target = sortedData.find(function (obj) {
            return obj.text == USER_SAY;
          });

          if (!target) {
            sortedData.push({
              text: USER_SAY,
              action: {
                button: USER_TYPE == 'buttons' ? 1 : 0,
                text: USER_TYPE == 'text' ? 1 : 0
              },
              intent: INTENT,
              confidences: [INTENT_CONFIDENCE]
            });
          } else {
            target.action[USER_TYPE]++;
            target.confidences.push(INTENT_CONFIDENCE);
          }
        });
        var rows = sortedData.sort(function (a, b) {
          var A = a.action.button + a.action.text;
          var B = b.action.button + b.action.text;
          return A > b ? -1 : A < B ? -1 : 0;
        }).map(function (row, index) {
          var confidences = row.confidences.filter(function (c) {
            return c > 0;
          });
          console.log('confidences', confidences);
          var averageConfidence = confidences.length == 0 ? 0 : (confidences.reduce(function (a, b) {
            return a + b;
          }, 0) || 0) / confidences.length;
          return [index + 1, htmlEncode(row.text), row.intent, averageConfidence, row.action.button, row.action.text];
        });
        questionRank.datatable.rows.add(rows).draw();
      };

      return mainController.rollingSearch(body, findSetLog, searchHandler)["catch"](function (error) {
        console.error(error);
      });
    }
  };
  var answerRank = {
    $: $tab.find('#answerRank'),
    name: '回答排行',
    getBody: function getBody() {
      // 防呆
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
        offset: 0
      };
      return body;
    },
    doSearch: function doSearch(body) {
      var searchHandler = function searchHandler(response) {
        var sortedData = {};
        response.forEach(function (row) {
          var ANSWER_ID = row.ANSWER_ID,
              ANS_NAME = row.ANS_NAME,
              DETAIL = row.DETAIL;
          var target = sortedData.hasOwnProperty(ANSWER_ID);

          if (!target) {
            sortedData[ANSWER_ID] = {
              ansId: ANSWER_ID,
              count: 1,
              ansName: ANS_NAME,
              datail: DETAIL
            };
          } else {
            sortedData[ANSWER_ID].count++;
          }
        });
        var rows = Object.values(sortedData).sort(function (a, b) {
          var A = a.count;
          var B = b.count;
          return A > b ? -1 : A < B ? -1 : 0;
        }).map(function (row, index) {
          return [index + 1, row.ansId, row.count, row.ansName, row.datail];
        });
        answerRank.datatable.rows.add(rows).draw();
      };

      return mainController.rollingSearch(body, findSetLog, searchHandler)["catch"](function (error) {
        console.error(error);
      });
    }
  }; // do page init

  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
}();