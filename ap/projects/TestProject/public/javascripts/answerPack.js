"use strict";

var answerPackController = function () {
  var haveInit;
  var $tab = $('[tab="answerPack"]');
  var $answerpacksField = $tab.find('#answerpacksField');
  var $ansId = $tab.find('#ansId');
  var $style = $tab.find('#style');
  var $detail = $tab.find('#detail');
  var $ansName = $tab.find('#ansName');
  var $editArea = $tab.find('#editArea');
  var $previewBtn = $tab.find('#preview');
  var $clearBtn = $tab.find('#clear');
  var $logBtn = $tab.find('#log');
  var $createBtn = $tab.find('#create');
  var $saveBtn = $tab.find('#save');
  var $searchAnswerpackInput = $tab.find('#searchAnswerpackInput');
  var $searchAnswerpackBtn = $tab.find('#searchAnswerpack');
  var $changeLogSidebar = $tab.find('#changeLogSidebar');
  var $fileSystemSidebar = $tab.find('#fileSystemSidebar');
  var $searchParam = $changeLogSidebar.find('#searchParam');
  var $searchChangeLog = $changeLogSidebar.find('#searchChangeLog');
  var $accordionChangeLog = $changeLogSidebar.find('#accordionChangeLog');
  var $moreChangeLog = $changeLogSidebar.find('#moreChangeLog');
  var $fileUpload = $fileSystemSidebar.find('#fileUpload');
  var $documentFiles = $fileSystemSidebar.find('[content="documentFiles"]');
  var $mediaFiles = $fileSystemSidebar.find('[content="mediaFiles"]'); // 初始化頁面動作

  function __init__() {
    $changeLogSidebar.find('#startDt, #endDt').datepicker({
      format: "yyyy/mm/dd",
      autoclose: true,
      calendarWeeks: true,
      todayHighlight: true,
      language: 'zh-TW'
    }); // 清除

    $clearBtn.on('click', function (e) {
      confirmAndClear();
    }); // 預覽

    $previewBtn.on('click', function (e) {
      var _getDbInformation = getDbInformation(),
          output = _getDbInformation.output;

      mainController.preview(output);
    }); // 新增答案包
    // $createBtn.on('click', e => {
    //     let $target = $(e.currentTarget);
    //     let ansId = $ansId.val()
    //     if(!ansId) { notify.danger('請填寫答案包ID'); return; }
    //     if($editArea.contents().length == 0) { notify.danger('答案包內沒有回覆'); return; }
    //     let body = {
    //         projectId: mainController.getProjectId(),
    //         ansId,
    //         information: JSON.stringify(getDbInformation()),
    //         detail: $detail.val(),
    //         ansName: $ansName.val(),
    //     }
    //     $target.attr('disabled', true);
    //     callBackendAPI('/insertAnswerpack', 'POST', body)
    //     .then(response => {
    //         notify.success('新增答案包成功')
    //         $answerpacksField.append(buildAnswerpackButtons({ ANSWER_ID: body.ansId, DETAIL: body.detail }));
    //     })
    //     .catch(error => {
    //         notify.danger('新增答案包失敗')
    //     })
    //     .finally(() => {
    //         $target.attr('disabled', false);
    //     })
    // })
    // 儲存編輯

    $saveBtn.on('click', function (e) {
      var $target = $(e.currentTarget);
      var ansId = $ansId.val();
      var ansIds = $answerpacksField.find('div[content="answerpack"]').toArray().map(function (obj) {
        return $(obj).text().trim();
      });

      if (!ansId) {
        notify.danger('請填寫答案包ID');
        return;
      }

      if ($editArea.contents().length == 0) {
        notify.danger('答案包內沒有回覆');
        return;
      }

      var body = {
        projectId: mainController.getProjectId(),
        ansId: ansId,
        information: JSON.stringify(getDbInformation()),
        detail: $detail.val(),
        ansName: $ansName.val()
      }; // 現有ID 走編輯流程

      if (ansIds.indexOf(ansId) > -1) {
        if (!confirm("\u76EE\u524D\u5DF2\u7D93\u6709 ".concat(ansId, " \u7684\u7B54\u6848\u5305\uFF0C\u78BA\u8A8D\u8981\u8986\u84CB\u55CE?"))) return;
        $target.attr('disabled', true);
        callBackendAPI('/updateAnswerpack', 'POST', body).then(function (response) {
          notify.success('編輯答案包成功');
        })["catch"](function (error) {
          notify.danger('編輯答案包失敗');
        })["finally"](function () {
          $target.attr('disabled', false);
        }); // 新的ID 走新增流程
      } else {
        if (!confirm("\u78BA\u5B9A\u8981\u65B0\u589E\u7B54\u6848\u5305 ".concat(ansId, " \u55CE?"))) return;
        $target.attr('disabled', true);
        callBackendAPI('/insertAnswerpack', 'POST', body).then(function (response) {
          notify.success('新增答案包成功');
          $answerpacksField.append(buildAnswerpackButtons({
            ANSWER_ID: body.ansId,
            DETAIL: body.detail
          }));
        })["catch"](function (error) {
          notify.danger('新增答案包失敗');
        })["finally"](function () {
          $target.attr('disabled', false);
        });
      }
    });
    $logBtn.on('click', function (e) {
      $changeLogSidebar.toggleClass('active');
    }); // 搜尋變更紀錄

    $searchChangeLog.on('click', function (e) {
      searchChangeLog();
    });
    $moreChangeLog.on('click', function (e) {
      var body = JSON.parse($searchParam.val());
      searchChangeLog(body);
    }); // 放入編輯區

    $changeLogSidebar.on('click', '[action="setEditArea"]', function (e) {
      if (!confirmAndClear()) return;
      var content = $(e.currentTarget).parent().find('pre').html();
      $changeLogSidebar.toggleClass('active');
      setEditArea(JSON.parse(content));
    }); // 搜尋答案包ID

    $searchAnswerpackInput.on('change input keyup', function (e) {
      var text = $(e.currentTarget).val();

      if (text == '') {
        $answerpacksField.find('[content="answerpack"]').show();
      } else {
        $answerpacksField.find('[content="answerpack"]').toArray().forEach(function (btn) {
          var btnText = $(btn).text().trim();

          if (btnText.toUpperCase().indexOf(text.toUpperCase()) > -1) {
            $(btn).show();
          } else {
            $(btn).hide();
          }
        });
      }
    }); // 搜尋答案包內文

    $searchAnswerpackBtn.on('click', function (e) {
      var $target = $(e.currentTarget);
      var pattern = $searchAnswerpackInput.val();
      if (!pattern) return;
      var body = {
        projectId: mainController.getProjectId(),
        pattern: pattern
      };
      $target.attr('disabled', true);
      callBackendAPI('/findAnswerpack', 'POST', body).then(function (response) {
        if (!response || response.lecgth == 0) {
          $answerpacksField.find('[content="answerpack"]').hide();
        } else {
          $answerpacksField.find('[content="answerpack"]').toArray().forEach(function (btn) {
            var buttonText = $(btn).text().trim();

            if (response.find(function (ansPack) {
              return buttonText == ansPack.ANSWER_ID;
            })) {
              $(btn).show();
            } else {
              $(btn).hide();
            }
          });
        }
      })["catch"](function (error) {
        console.error(error);
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    }); // 選擇答案包，開始編輯

    $answerpacksField.on('click', '[action="show"]', function (e) {
      if (e.target != e.currentTarget) return;
      var $target = $(e.currentTarget);
      var ansId = $target.text().trim();
      if (!ansId) return;
      if (!confirmAndClear()) return;
      showAnswerpack(ansId);

      function showAnswerpack(ansId) {
        if (!confirmAndClear()) return;
        var body = {
          projectId: mainController.getProjectId(),
          ansId: ansId
        };
        callBackendAPI('/getAnswerpack', 'POST', body).then(function (response) {
          setEditArea(response);
          notify.success('取得資料成功');
        })["catch"](function (error) {
          console.error(error);
          notify.danger('取得資料失敗');
        });
      }
    });
    $answerpacksField.on('click', '[action="delete"]', function (e) {
      var $target = $(e.currentTarget).parent();
      var ansId = $target.text().trim();
      if (!ansId) return;
      deleteAnswerpack(ansId);

      function deleteAnswerpack(ansId) {
        if (confirm("\u78BA\u8A8D\u8981\u522A\u9664\u7B54\u6848\u5305 ".concat(ansId, " \uFF0C\u6B64\u52D5\u4F5C\u7121\u6CD5\u5FA9\u539F"))) {
          var body = {
            projectId: mainController.getProjectId(),
            ansId: ansId
          };
          callBackendAPI('/deleteAnswerpack', 'POST', body).then(function (res) {
            $target.remove();
            notify.success('刪除成功');
          })["catch"](function (error) {
            notify.danger('刪除失敗');
          });
        }
      }
    }); // 增加板塊(所有)

    $tab.find('#add_card_buttons').on('click', 'button', function (e) {
      var target = $(e.currentTarget).attr('target');
      generateBlocks(target);
    }); // 上移板塊

    $editArea.on('click', '.move-up-card', function (e) {
      var $card = $(e.currentTarget).closest('.card');
      moveBlock($card);
      checkAfterInsertBlock($card.parent());
    }); // 移除板塊

    $editArea.on('click', '.remove-card', function (e) {
      var $card = $(e.currentTarget).closest('.card');
      var $parent = $card.parent();
      $card.remove();
      checkAfterInsertBlock($parent);
    }); // 增加子板塊

    $editArea.on('click', '[action="addSubCard"]', function (e) {
      console.log(e);
      var $target = $(e.currentTarget);
      var targetCard = $target.attr('target');

      var newCard = function () {
        switch (targetCard) {
          case 'button':
            return generateButtonBlock();

          case 'card':
            return generateCardBlock();

          default:
            return '';
        }
      }();

      $(e.currentTarget).before(newCard);
      checkAfterInsertBlock($target.parent());
    }); // 按鈕動作選到寄出信件時，變成他專屬的value欄位

    $editArea.on('change', '.card[type="button"] select[content="button_block_type"]', function (e) {
      var $target = $(e.currentTarget);
      var $container = $target.closest('.card-body');

      if ($target.val() == 'mailto') {
        $container.find('[field="value-normal"]').hide();
        $container.find('[field="value-mailto"]').show();
      } else {
        $container.find('[field="value-normal"]').show();
        $container.find('[field="value-mailto"]').hide();

        if ($target.val() == 'download') {
          $container.find('[field="value-download"]').show();
        } else {
          $container.find('[field="value-download"]').hide();
        }
      }
    }); // 選擇檔案

    $editArea.on('click', '[field="value-download"] button', function (e) {
      $fileSystemSidebar.toggleClass('active');
      $fileSystemSidebar.attr('targetCardId', $(e.currentTarget).closest('.card').attr('id'));
      $fileSystemSidebar.attr('targetContent', $(e.currentTarget).closest('.input-group').find('input').attr('content'));
    }); // 上傳檔案

    $fileUpload.on('click', function (e) {
      var file = $fileSystemSidebar.find('[name="uploadFile"]')[0].files[0];
      if (!file) return;
      var fileNameSplit = file.name.split('.');
      var extension = fileNameSplit.length > 1 ? fileNameSplit[fileNameSplit.length - 1] : '';
      extension = extension.toLowerCase();

      var fileType = function () {
        var documents = ['pdf'];
        var medias = ['png', 'jpg', 'jpeg', 'gif'];

        if (documents.indexOf(extension) > -1) {
          return 'document';
        } else if (medias.indexOf(extension) > -1) {
          return 'image';
        } else {
          return '';
        }
      }();

      if (!fileType) {
        notify.danger('不接受的檔案類型');
        return;
      }

      var formData = new FormData();
      formData.append('uploadFile', file);
      formData.append('projectId', mainController.getProjectId());
      formData.append('fileType', fileType);
      callBackendAPI_Multipart('/uploadFile', 'POST', formData).then(function (response) {
        notify.success('上傳成功'); // 重整資料區

        if (fileType == 'document') loadDocuments();
        if (fileType == 'media') loadMedias();
      })["catch"](function (error) {
        console.error(error);
        notify.danger('上傳失敗');
      });
    }); // 重整檔案列表

    $documentFiles.on('click', 'button[action="reload"]', function (e) {
      loadDocuments();
    });
    $mediaFiles.on('click', 'button[action="reload"]', function (e) {
      loadMedias();
    }); // 選用檔案

    $fileSystemSidebar.on('click', '[action="selectFile"]', function (e) {
      var filePath = $(e.currentTarget).attr('filePath');
      var targetCardId = $fileSystemSidebar.attr('targetCardId');
      var targetContent = $fileSystemSidebar.attr('targetContent');
      $('#' + targetCardId).find('.card-body').first().find("[content=\"".concat(targetContent, "\"]")).val(filePath);
      $fileSystemSidebar.toggleClass('active');
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    var projectId = mainController.getProjectId();
    var body = {
      projectId: projectId
    };
    var maskId = stableMask('資料載入中<div class="loadind"></div>');
    callBackendAPI('/listAnswerpack', 'POST', body).then(function (response) {
      $answerpacksField.html(response.map(function (answerpack) {
        return buildAnswerpackButtons(answerpack);
      }).join(''));
    }).then(function () {
      var ansId = $searchAnswerpackInput.val();
      var target = $answerpacksField.find('button').toArray().find(function (btn) {
        if (ansId == $(btn).text().trim()) return true;
      });
      if (target) $(target).trigger('click');
      $searchAnswerpackInput.trigger('change'); // 載入文件清單

      loadDocuments();
      loadMedias();
      haveInit = true;
    })["catch"](function (error) {
      console.error(error);
      notify.danger('資料載入失敗，請洽管理人員');
    })["finally"](function () {
      removeMask(maskId);
    });
  } // private functions


  function searchChangeLog(body) {
    var endDt = $changeLogSidebar.find('#endDt').val();
    body = body || {
      projectId: mainController.getProjectId(),
      startDt: $changeLogSidebar.find('#startDt').val(),
      endDt: endDt ? dayjs(endDt).add(1, 'day').format('YYYY/MM/DD') : endDt,
      userId: $changeLogSidebar.find('#userId').val(),
      target: $changeLogSidebar.find('#ansId').val(),
      type: 'answerpack'
    };
    $searchChangeLog.attr('disabled', true);
    $accordionChangeLog.html('');
    $searchParam.val('');
    callBackendAPI('/filterTrace', 'POST', body).then(function (response) {
      var myHtml = response.map(function (trace) {
        var badge = trace.ACTION == 'update' ? '<span class="badge badge-pill badge-info mr-1"><i class="fas fa-pen"></i> 編輯</span>' : trace.ACTION == 'insert' ? '<span class="badge badge-pill badge-success mr-1"><i class="fas fa-plus"></i> 新增</span>' : trace.ACTION == 'delete' ? '<span class="badge badge-pill badge-danger mr-1"><i class="fas fa-trash-alt"></i> 刪除</span>' : '';
        return "\n                <div class=\"card\">\n                    <div class=\"card-header px-0 py-0\">\n                        <h2 class=\"mb-0\">\n                            <button class=\"btn btn-block d-flex justify-content-between px-3\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapse".concat(trace.ID, "\">\n                                <div>\n                                    ").concat(badge, " ").concat(trace.TARGET, "\n                                </div>\n                                <span>").concat(localeTimeTW(trace.CREATE_TIME), "</span>\n                            </button>\n                        </h2>\n                    </div>\n                    <div id=\"collapse").concat(trace.ID, "\" class=\"collapse\" data-parent=\"#accordionChangeLog\">\n                        <div class=\"card-body p-0\">\n                            <div class=\"mx-3 my-2\">\n                                <div>\u7DE8\u8F2F\u4EBA: ").concat(trace.USER_ID, "</div>\n                                <div class=\"mt-2\">\n                                    \u7DE8\u8F2F\u524D: <a href=\"#\" action=\"setEditArea\">\uD83E\uDC78\u653E\u5165\u7DE8\u8F2F\u5340</a>\n                                    <pre class=\"bg_grey_lighter rounded px-2 py-1 mb-0\">").concat(trace.OLD_DATA ? JSON.stringify(JSON.parse(trace.OLD_DATA), null, 2) : '', "</pre>\n                                </div>\n                                <div class=\"mt-2\">\n                                    \u7DE8\u8F2F\u5F8C: <a href=\"#\" action=\"setEditArea\">\uD83E\uDC78\u653E\u5165\u7DE8\u8F2F\u5340</a>\n                                    <pre class=\"bg_grey_lighter rounded px-2 py-1 mb-0\">").concat(trace.NEW_DATA ? JSON.stringify(JSON.parse(trace.NEW_DATA), null, 2) : '', "</pre>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>");
      });
      $accordionChangeLog.append(myHtml);

      if (response.length == mainController.pageLimit) {
        $moreChangeLog.show();
      } else {
        body.offset += mainController.pageLimit;
        $searchParam.val(JSON.stringify(body));
        $moreChangeLog.hide();
      }
    })["catch"](function (error) {
      console.error(error);
    })["finally"](function () {
      $searchChangeLog.attr('disabled', false);
    });
  }

  function setEditArea(row) {
    $ansId.val(row.ANSWER_ID);
    $detail.val(row.DETAIL);
    $ansName.val(row.ANS_NAME);
    var answerPack = JSON.parse(row.INFORMATION);
    $style.val(answerPack.output.style);
    answerPack.output.generic.forEach(function (message) {
      // console.log(message);
      generateBlocks(message.response_type, message);
    });
  } // 載入檔案列表


  function loadDocuments() {
    var body = {
      projectId: mainController.getProjectId(),
      fileType: 'document'
    };
    $documentFiles.find('ol').html('');
    callBackendAPI('/listFiles', 'POST', body).then(function (response) {
      var myHtml = response.result.map(function (file) {
        return "\n                <li>\n                    <div>\n                        <button type=\"button\" class=\"btn btn-sm btn-outline-info\" action=\"selectFile\" filePath=\"".concat(file.filePath, "\">\n                            <i class=\"fas fa-check\"></i>\n                        </button>\n                        ").concat(file.fileName, "\n                    </div>\n                </li>");
      });
      $documentFiles.find('ol').html(myHtml);
    })["catch"](function (error) {
      console.error(error);
    });
  }

  function loadMedias() {
    var body = {
      projectId: mainController.getProjectId(),
      fileType: 'image'
    };
    $mediaFiles.find('ol').html('');
    callBackendAPI('/listFiles', 'POST', body).then(function (response) {
      var myHtml = response.result.map(function (file) {
        return "\n                <li>\n                    <div>\n                        <button type=\"button\" class=\"btn btn-sm btn-outline-info\" action=\"selectFile\" filePath=\"".concat(file.filePath, "\">\n                            <i class=\"fas fa-check\"></i>\n                        </button>\n                        ").concat(file.fileName, "\n                    </div>\n                </li>");
      });
      $mediaFiles.find('ol').html(myHtml);
    })["catch"](function (error) {
      console.error(error);
    });
  }

  function cardId() {
    return 'card-' + uuid();
  }

  function generateBlocks(type, msg) {
    var newCard = function () {
      switch (type) {
        // 基本
        case 'text':
          return generateTextBlock(msg);

        case 'option':
          return generateOptionBlock(msg);

        case 'image':
          return generateImageBlock(msg);
        // 進階

        case 'card':
          return generateCardBlock(msg);

        case 'slider':
          return generateSliderBlock(msg);
        // 複合

        case 'wb':
          return generateTextBlock() + generateOptionBlock();

        case 'wp':
          return generateTextBlock() + generateImageBlock();

        case 'wpb':
          return generateTextBlock() + generateImageBlock() + generateOptionBlock();

        default:
          return '';
      }
    }();

    $editArea.append(newCard);
    checkAfterInsertBlock($editArea);
  }

  function generateTextBlock(msg) {
    msg = msg || {
      // "response_type": "text",
      "text": ""
    };

    var _cardId = cardId();

    return "<div class=\"card shadow-sm mb-2\" type=\"text\" id=\"".concat(_cardId, "\">\n            <div class=\"card-header bg_blue_light  py-2 px-3\">\n                <div class=\"d-flex justify-content-between align-items-center\">\n                    <a class=\"card-title mb-0\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(_cardId, "\">\u6587\u5B57</a>\n                    <div>\n                        <a class=\"btn-link move-up-card\" style=\"display: none;\"><i class=\"fas fa-arrow-up fa-fw mr-2\"></i></a>\n                        <a class=\"btn-link remove-card\"><i class=\"fas fa-times fa-fw\"></i></a>\n                    </div>\n                </div>\n            </div>\n            <div id=\"collapse-").concat(_cardId, "\" class=\"collapse show\">\n                <div class=\"card-body\">\n                    <div class=\"input-group\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u8A0A\u606F\u5167\u5BB9</span>\n                        </div>\n                        <textarea content=\"text_block_text\" class=\"form-control col\" rows=\"2\">").concat(msg.text || '', "</textarea>\n                    </div>\n                </div>\n            </div>\n        </div>");
  }

  function generateImageBlock(msg) {
    msg = msg || {
      // "response_type": "image",
      "title": "",
      "source": ""
    };

    var _cardId = cardId();

    return "<div class=\"card shadow-sm mb-2\" type=\"image\" id=\"".concat(_cardId, "\">\n            <div class=\"card-header bg_blue_light  py-2 px-3\">\n                <div class=\"d-flex justify-content-between align-items-center\">\n                    <a class=\"card-title mb-0\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(_cardId, "\">\u5716\u7247</a>\n                    <div>\n                        <a class=\"btn-link move-up-card\" style=\"display: none;\"><i class=\"fas fa-arrow-up fa-fw mr-2\"></i></a>\n                        <a class=\"btn-link remove-card\"><i class=\"fas fa-times fa-fw\"></i></a>\n                    </div>\n                </div>\n            </div>\n            <div id=\"collapse-").concat(_cardId, "\" class=\"collapse show\">\n                <div class=\"card-body\">\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u5716\u7247\u6587\u5B57</span>\n                        </div>\n                        <input content=\"image_block_title\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.title || '', "\">\n                    </div>\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u5716\u7247\u4F4D\u5740</span>\n                        </div>\n                        <input content=\"image_block_source\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.source || '', "\">\n                    </div>\n                </div>\n            </div>\n        </div>");
  }

  function generateOptionBlock(msg) {
    msg = msg || {
      // "response_type": "option",
      "title": "",
      "DETAIL": "",
      "button": [undefined]
    };

    var _cardId = cardId();

    return "<div class=\"card shadow-sm mb-2\" type=\"option\" id=\"".concat(_cardId, "\">\n            <div class=\"card-header bg_blue_light  py-2 px-3\">\n                <div class=\"d-flex justify-content-between align-items-center\">\n                    <a class=\"card-title mb-0\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(_cardId, "\">\u9078\u9805</a>\n                    <div>\n                        <a class=\"btn-link move-up-card\" style=\"display: none;\"><i class=\"fas fa-arrow-up fa-fw mr-2\"></i></a>\n                        <a class=\"btn-link remove-card\"><i class=\"fas fa-times fa-fw\"></i></a>\n                    </div>\n                </div>\n            </div>\n            <div id=\"collapse-").concat(_cardId, "\" class=\"collapse show\">\n                <div class=\"card-body\">\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u9078\u9805\u6A19\u984C</span>\n                        </div>\n                        <input content=\"option_block_title\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.title || '', "\">\n                    </div>\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u9078\u9805\u6558\u8FF0</span>\n                        </div>\n                        <input content=\"option_block_detail\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.DETAIL || '', "\">\n                    </div>\n                    ").concat(msg.button.map(function (btn) {
      return generateButtonBlock(btn);
    }).join(''), "\n                    <button type=\"button\" class=\"btn btn-block btn-sm btn_outline_blue bg_white\" action=\"addSubCard\" target=\"button\">\u65B0\u589E\u6309\u9215</button>\n                </div>\n            </div>\n        </div>");
  }

  function generateCardBlock(msg) {
    msg = msg || {
      // "response_type": "card",
      "card": {
        "picSrc": "",
        "title": "",
        "info": "",
        "button": [undefined]
      }
    };

    var _cardId = cardId();

    return "<div class=\"card shadow-sm mb-2\" type=\"card\" id=\"".concat(_cardId, "\">\n            <div class=\"card-header bg_blue_light  py-2 px-3\">\n                <div class=\"d-flex justify-content-between align-items-center\">\n                    <a class=\"card-title mb-0\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(_cardId, "\">\u4E00\u89BD</a>\n                    <div>\n                        <a class=\"btn-link move-up-card\" style=\"display: none;\"><i class=\"fas fa-arrow-up fa-fw mr-2\"></i></a>\n                        <a class=\"btn-link remove-card\"><i class=\"fas fa-times fa-fw\"></i></a>\n                    </div>\n                </div>\n            </div>\n            <div id=\"collapse-").concat(_cardId, "\" class=\"collapse show\">\n                <div class=\"card-body\">\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u5716\u7247\u4F4D\u5740</span>\n                        </div>\n                        <input content=\"card_block_picSrc\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.card.picSrc || '', "\">\n                    </div>\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u4E00\u89BD\u6A19\u984C</span>\n                        </div>\n                        <input content=\"card_block_title\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.card.title || '', "\">\n                    </div>\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u4E00\u89BD\u6558\u8FF0</span>\n                        </div>\n                        <input content=\"card_block_info\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.card.info || '', "\">\n                    </div>\n                    ").concat(msg.card.button.map(function (btn) {
      return generateButtonBlock(btn);
    }).join(''), "\n                    <button type=\"button\" class=\"btn btn-block btn-sm btn_outline_blue bg_white\" action=\"addSubCard\" target=\"button\">\u65B0\u589E\u6309\u9215</button>\n                </div>\n            </div>\n        </div>");
  }

  function generateSliderBlock(msg) {
    msg = msg || {
      // "response_type": "slider",
      "sliders": [undefined] // put cards

    };

    var _cardId = cardId();

    return "<div class=\"card shadow-sm mb-2\" type=\"slider\" id=\"".concat(_cardId, "\">\n            <div class=\"card-header bg_blue_light  py-2 px-3\">\n                <div class=\"d-flex justify-content-between align-items-center\">\n                    <a class=\"card-title mb-0\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(_cardId, "\">\u8F2A\u64AD</a>\n                    <div>\n                        <a class=\"btn-link move-up-card\" style=\"display: none;\"><i class=\"fas fa-arrow-up fa-fw mr-2\"></i></a>\n                        <a class=\"btn-link remove-card\"><i class=\"fas fa-times fa-fw\"></i></a>\n                    </div>\n                </div>\n            </div>\n            <div id=\"collapse-").concat(_cardId, "\" class=\"collapse show\">\n                <div class=\"card-body\">\n                    ").concat(msg.sliders.map(function (slider) {
      return generateCardBlock(slider ? {
        card: slider
      } : slider);
    }).join(''), "\n                    <button type=\"button\" class=\"btn btn-block btn-sm btn_outline_blue bg_white\" action=\"addSubCard\" target=\"card\">\u65B0\u589E\u8F2A\u64AD\u677F\u584A</button>\n                </div>\n            </div>\n        </div>");
  } // subcard: card in cards


  function generateButtonBlock(action) {
    var msg = action || {
      "btnType": "nextto",
      //nextto, url, download, mailto
      "btnLabel": "",
      "btnText": "",
      "btnValue": ""
    }; // when type = "mailto", value became
    // {
    //     "mailName": "",
    //     "mailTitle": "",
    //     "mailBody": ""
    // }

    var type = msg.btnType || 'nextto';

    var _cardId = cardId();

    return "<div class=\"card shadow-sm mb-2\" type=\"button\" id=\"".concat(_cardId, "\">\n            <div class=\"card-header bg_blue_light  py-2 px-3\">\n                <div class=\"d-flex justify-content-between align-items-center\">\n                    <a class=\"card-title mb-0\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(_cardId, "\">\u6309\u9215</a>\n                    <div>\n                        <a class=\"btn-link move-up-card\" style=\"display: none;\"><i class=\"fas fa-arrow-up fa-fw mr-2\"></i></a>\n                        <a class=\"btn-link remove-card\"><i class=\"fas fa-times fa-fw\"></i></a>\n                    </div>\n                </div>\n            </div>\n            <div id=\"collapse-").concat(_cardId, "\" class=\"collapse show\">\n                <div class=\"card-body\">\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u6309\u9215\u6587\u5B57</span>\n                        </div>\n                        <input content=\"button_block_label\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.btnLabel || '', "\">\n                    </div>\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u6309\u4E0B\u767C\u8A71</span>\n                        </div>\n                        <input content=\"button_block_text\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.btnText || '', "\">\n                    </div>\n                    <div class=\"input-group input-group-sm mb-2\">\n                        <div class=\"input-group-prepend\">\n                            <span class=\"input-group-text\">\u6309\u9215\u52D5\u4F5C</span>\n                        </div>\n                        <select class=\"custom-select\" content=\"button_block_type\">\n                            <option value=\"nextto\" ").concat(type == 'nextto' ? 'selected' : '', ">\u5230\u7B54\u6848\u5305</option>\n                            <option value=\"url\" ").concat(type == 'url' ? 'selected' : '', ">\u6253\u958B\u7DB2\u9801</option>\n                            <option value=\"download\" ").concat(type == 'download' ? 'selected' : '', ">\u4E0B\u8F09\u6A94\u6848</option>\n                            <option value=\"mailto\" ").concat(type == 'mailto' ? 'selected' : '', ">\u5BC4\u51FA\u4FE1\u4EF6</option>\n                        </select>\n                    </div>\n                    <div field=\"value-normal\" ").concat(type == 'mailto' ? 'style="display: none;"' : '', ">\n                        <div class=\"input-group input-group-sm mb-2\">\n                            <div class=\"input-group-prepend\">\n                                <span class=\"input-group-text\">\u503C</span>\n                            </div>\n                            <input content=\"button_block_value\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.btnValue || '', "\">\n                            <div class=\"input-group-append\" field=\"value-download\" ").concat(type == 'download' ? '' : 'style="display: none;"', ">\n                                <button class=\"btn btn-outline-secondary\" type=\"button\">\u700F\u89BD</button>\n                            </div>\n                        </div>\n                    </div>\n                    <div field=\"value-mailto\" ").concat(type == 'mailto' ? '' : 'style="display: none;"', ">\n                        <div class=\"border-top mb-2\"></div>\n                        <div class=\"input-group input-group-sm mb-2\">\n                            <div class=\"input-group-prepend\">\n                                <span class=\"input-group-text\">\u767C\u9001\u5C0D\u8C61</span>\n                            </div>\n                            <input content=\"button_block_mail_name\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.mailName || '', "\">\n                        </div>\n                        <div class=\"input-group input-group-sm mb-2\">\n                            <div class=\"input-group-prepend\">\n                                <span class=\"input-group-text\">\u4FE1\u4EF6\u6A19\u984C</span>\n                            </div>\n                            <input content=\"button_block_mail_title\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.mailTitle || '', "\">\n                        </div>\n                        <div class=\"input-group input-group-sm mb-2\">\n                            <div class=\"input-group-prepend\">\n                                <span class=\"input-group-text\">\u4FE1\u4EF6\u5167\u6587</span>\n                            </div>\n                            <input content=\"button_block_mail_body\" type=\"text\" class=\"form-control col\" placeholder=\"\" value=\"").concat(msg.mailBody || '', "\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>");
  }

  function buildAnswerpackButtons(answerpack) {
    return "\n            <div content=\"answerpack\" action=\"show\" class=\"btn btn-sm btn-light border mb-2\" ansId=\"".concat(answerpack.ANSWER_ID, "\" title=\"").concat(answerpack.DETAIL, "\">\n                ").concat(answerpack.ANSWER_ID, "\n                <span action=\"delete\" class=\"badge btn-outline-danger border\"><i class=\"fas fa-times\"></i></span>\n            </div>");
  } // 板塊上移


  function moveBlock($card) {
    var $parent = $card.parent();
    $card.prev().before($card);
    checkAfterInsertBlock($parent);
  } // 移動後檢查移動按鈕是否應該存在


  function checkAfterInsertBlock($parent) {
    var cards = $parent.children('.card').toArray(); // let subcards = $parent.children('.card').toArray();

    cards.forEach(function (card, index) {
      if (cards.length == 1) {
        $(card).children('.card-header bg_blue_light ').find('.move-up-card').hide(); // $(card).children('.card-header bg_blue_light ').find('.remove-card').hide();
      } else if (index == 0) {
        $(card).children('.card-header bg_blue_light ').find('.move-up-card').hide(); // $(card).children('.card-header bg_blue_light ').find('.remove-card').show();
      } else {
        $(card).children('.card-header bg_blue_light ').find('.move-up-card').show(); // $(card).children('.card-header bg_blue_light ').find('.remove-card').show();
      }
    }); // 編號 
    // if(subcards.length > 0){
    //     if($(subcards).attr('type') == 'button_sub_card'){
    //         $(subcards).children('.card-header bg_blue_light ').children('div').children('.card-title')
    //             .toArray().forEach(function(title, index) {
    //                 $(title).html('按鈕 ' + ( index+1 ))
    //             });
    //     }
    //     if($(subcards).attr('type') == 'carousel_tab_sub_card'){
    //         $(subcards).children('.card-header bg_blue_light ').children('div').children('.card-title')
    //             .toArray().forEach(function(title, index) {
    //                 $(title).html('板塊 ' + ( index+1 ))
    //             });
    //     }
    //     if($(subcards).attr('type') == 'image_carousel_tab_sub_card'){
    //         $(subcards).children('.card-header bg_blue_light ').children('div').children('.card-title')
    //             .toArray().forEach(function(title, index) {
    //                 $(title).html('圖板 ' + ( index+1 ))
    //             });
    //     }
    // }
    // 重畫目錄
    // $('#navbar').html(drawIndex($editArea.children('.card').toArray()));
  } // 取得記錄進DB的格式


  function getDbInformation() {
    return {
      "output": {
        "answerID": $ansId.val().toString(),
        "style": $style.val().toString(),
        "generic": getMessageJson()
      }
    };
  } // 取得訊息json


  function getMessageJson() {
    return $editArea.children('.card').toArray().map(function (block) {
      var response_type = $(block).attr('type');
      return Object.assign({
        response_type: response_type
      }, parseMessaages(response_type, $(block)));
    });

    function parseMessaages(response_type, $block) {
      var $content = $block.find('.card-body').first();
      var message;

      if (response_type == 'text') {
        message = {
          "text": $content.find('[content="text_block_text"]').val()
        };
      } else if (response_type == 'option') {
        message = {
          "title": $content.find('[content="option_block_title"]').val(),
          "DETAIL": $content.find('[content="option_block_detail"]').val(),
          "button": $content.children('.card[type="button"]').toArray().map(function (b) {
            return parseMessaages('button', $(b));
          })
        };
      } else if (response_type == 'image') {
        message = {
          "title": $content.find('[content="image_block_title"]').val(),
          "source": $content.find('[content="image_block_source"]').val()
        };
      } else if (response_type == 'card') {
        message = {
          "card": {
            "picSrc": $content.find('[content="card_block_picSrc"]').val(),
            "title": $content.find('[content="card_block_title"]').val(),
            "info": $content.find('[content="card_block_info"]').val(),
            "button": $content.children('.card[type="button"]').toArray().map(function (b) {
              return parseMessaages('button', $(b));
            })
          }
        };
      } else if (response_type == 'slider') {
        message = {
          "sliders": $content.children('.card[type="card"]').toArray().map(function (b) {
            return parseMessaages('card', $(b));
          }).map(function (msg) {
            return msg.card;
          })
        };
      } else if (response_type == 'button') {
        var btnType = $content.find('[content="button_block_type"]').val();
        message = {
          "btnType": btnType,
          "btnLabel": $content.find('[content="button_block_label"]').val(),
          "btnText": $content.find('[content="button_block_text"]').val(),
          "btnValue": function () {
            if (btnType == "mailto") {
              return {
                "mailName": $content.find('[content="button_block_mail_name"]').val(),
                "mailTitle": $content.find('[content="button_block_mail_title"]').val(),
                "mailBody": $content.find('[content="button_block_mail_body"]').val()
              };
            } else {
              return $content.find('[content="button_block_value"]').val();
            }
          }()
        };
      }

      return message;
    }
  } // 防呆 確認清除當前編輯內容


  function confirmAndClear() {
    var msg = "是否放棄編輯中的內容";
    var result = $editArea.contents().length == 0 || confirm(msg);

    if (result) {
      $editArea.html('');
      $ansId.val('');
      $style.val('1');
      $detail.val('');
      $ansName.val('');
      $editArea.val('');
    }

    return result;
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
}();