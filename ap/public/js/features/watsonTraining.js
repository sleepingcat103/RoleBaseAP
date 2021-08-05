"use strict";

var watsonTrainingController = function () {
  var haveInit;
  var context = {};
  var workspace;
  var selectIntent, selectEntity, selectValue;
  var $tab = $('[tab="watsonTraining"]');
  var $intentEditor = $tab.find('.training_list[content="intent"]');
  var $entityEditor = $tab.find('.training_list[content="entity"]');
  var $intentSelector = $intentEditor.find('#intent_selector');
  var $entitySelector = $entityEditor.find('#entity_selector');
  var $intentContent = $intentEditor.find('.training_list_body[content="examples"]');
  var $entityContent = $entityEditor.find('.training_list_body[content="values"]');
  var $addIntentEntitySidebar = $tab.find('#addIntentEntity');
  var $editValueAndSynonymsSidebar = $tab.find('#editValueAndSynonyms');
  var $importDataSidebar = $tab.find('#importData'); // 初始化頁面動作

  function __init__() {
    // intent list
    $intentSelector.on('change', function (e) {
      var target = $(e.target).val();
      if (!target) return;
      $intentContent.html('');
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          intent: target
        }, response);
        return callWatsonAPI('/listExamples', 'POST', body);
      }).then(function (response) {
        var data = response.result;
        $intentContent.html(generateExampleAdder() + (data.examples.map(function (example) {
          return generateExampleList(example);
        }) || []).join('\n'));
        selectIntent = target;
      })["catch"](function (error) {
        console.log(error);
      });
    });
    $intentEditor.on('click', '#intent_add', function (e) {
      $addIntentEntitySidebar.toggleClass('active');
      $addIntentEntitySidebar.find('#new_intent').show();
      $addIntentEntitySidebar.find('#new_entity').hide();
      $addIntentEntitySidebar.find('#submit_add_intent').show();
      $addIntentEntitySidebar.find('#submit_add_entity').hide();
    });
    $addIntentEntitySidebar.on('click', '#submit_add_intent', function (e) {
      var $target = $(e.currentTarget);
      var newIntent = $('#new_intent_input').val().trim();
      if (!newIntent) return;
      $target.attr('disabled', false);
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          intent: newIntent
        }, response);
        return callWatsonAPI('/createIntent', 'POST', body);
      }).then(function (response) {
        $intentSelector[0].selectize.addOption({
          value: newIntent,
          text: newIntent
        });
        $intentSelector[0].selectize.refreshOptions(false);
        $intentSelector[0].selectize.setValue(newIntent, false);
        $addIntentEntitySidebar.toggleClass('active');
        notify.success('新增意圖成功');
      })["catch"](function (error) {
        notify.danger('新增意圖失敗');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    $intentEditor.on('click', '#intent_name_edit', function (e) {
      if (!selectIntent) return;
      var $parent = $(e.currentTarget).parent().parent().parent();
      $('#intent_name_input').val(selectIntent);
      $parent.children('div').toggleClass('d-none');
    });
    $intentEditor.on('click', '#intent_name_submit', function (e) {
      var newInentName = $('#intent_name_input').val().trim();
      var $parent = $(e.currentTarget).parent().parent().parent();
      if (!newInentName) return;
      mainController.getAssistantConfig().then(function (response) {
        if (selectIntent == newInentName) return Promise.resolve();
        var body = Object.assign({
          intent: selectIntent,
          newIntent: newInentName
        }, response);
        return callWatsonAPI('/updateIntent', 'POST', body);
      }).then(function (response) {
        $intentSelector[0].selectize.updateOption(selectIntent, {
          value: newInentName,
          text: newInentName
        });
        $intentSelector[0].selectize.refreshOptions(false);
        $intentSelector[0].selectize.setValue(newInentName, true);
        selectIntent = newInentName;
        $parent.children('div').toggleClass('d-none');
        notify.success('修改意圖名稱成功');
      })["catch"](function (error) {
        notify.danger('修改意圖名稱失敗');
      });
    });
    $intentEditor.on('click', '#intent_name_cancel', function (e) {
      var $parent = $(e.currentTarget).parent().parent().parent();
      $parent.children('div').toggleClass('d-none');
      $('#intent_name_input').val(selectIntent);
    });
    $intentEditor.on('click', '#intent_remove', function (e) {
      if (!selectIntent) return;

      if (confirm("即將刪除該Intent，確定要刪除?")) {//
      } else {
        return;
      }

      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          intent: selectIntent
        }, response);
        return callWatsonAPI('/deleteIntent', 'POST', body);
      }).then(function (response) {
        $intentSelector[0].selectize.removeOption(selectIntent);
        $intentSelector[0].selectize.refreshOptions(false);
        $intentSelector[0].selectize.setValue('請選擇', true);
        $intentContent.html('');
        notify.success('移除意圖成功');
      })["catch"](function (error) {
        notify.danger('移除意圖失敗');
      });
    });
    $intentEditor.on('click', '#intent_import', function (e) {
      $importDataSidebar.find('#importTarget').html('Intent');
      $importDataSidebar.attr('target', 'intent');
      $importDataSidebar.toggleClass('active');
    }); // entity list

    $entitySelector.on('change', function (e) {
      var target = $(e.target).val();
      if (!target) return;
      $entityContent.html('');
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          entity: target
        }, response);
        return callWatsonAPI('/getEntity', 'POST', body);
      }).then(function (response) {
        var data = response.result;
        $entityContent.html(generateValueAdder() + (data.values.map(function (val) {
          return generateValueList(val);
        }) || []).join('\n'));
        $('#entity_input').val(target);
        selectEntity = target;
      })["catch"](function (error) {
        console.log(error);
      });
    });
    $entityEditor.on('click', '#entity_add', function (e) {
      $addIntentEntitySidebar.toggleClass('active');
      $addIntentEntitySidebar.find('#new_entity').show();
      $addIntentEntitySidebar.find('#new_intent').hide();
      $addIntentEntitySidebar.find('#submit_add_entity').show();
      $addIntentEntitySidebar.find('#submit_add_intent').hide();
    });
    $addIntentEntitySidebar.on('click', '#submit_add_entity', function (e) {
      var $target = $(e.currentTarget);
      var newEntity = $('#new_entity_input').val().trim();
      if (!newEntity) return;
      $target.attr('disabled', true);
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          entity: newEntity
        }, response);
        return callWatsonAPI('/createEntity', 'POST', body);
      }).then(function (response) {
        $entitySelector[0].selectize.addOption({
          value: newEntity,
          text: newEntity
        });
        $entitySelector[0].selectize.refreshOptions(false);
        $entitySelector[0].selectize.setValue(newEntity, false);
        $addIntentEntitySidebar.toggleClass('active');
        notify.success('新增實體成功');
      })["catch"](function (error) {
        notify.danger('新增實體失敗');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    $entityEditor.on('click', '#entity_name_edit', function (e) {
      if (!selectEntity) return;
      var $parent = $(e.currentTarget).parent().parent().parent();
      $('#entity_name_input').val(selectEntity);
      $parent.children('div').toggleClass('d-none');
    });
    $entityEditor.on('click', '#entity_name_submit', function (e) {
      var newEntityName = $('#entity_name_input').val().trim();
      var $parent = $(e.currentTarget).parent().parent().parent();
      if (!newEntityName) return;
      mainController.getAssistantConfig().then(function (response) {
        if (selectEntity == newEntityName) return Promise.resolve();
        var body = Object.assign({
          entity: selectEntity,
          newEntity: newEntityName
        }, response);
        return callWatsonAPI('/updateEntity', 'POST', body);
      }).then(function (response) {
        $entitySelector[0].selectize.updateOption(selectEntity, {
          value: newEntityName,
          text: newEntityName
        });
        $entitySelector[0].selectize.refreshOptions(false);
        $entitySelector[0].selectize.setValue(newEntityName, true);
        selectEntity = newEntityName;
        $parent.children('div').toggleClass('d-none');
        notify.success('修改意圖名稱成功');
      })["catch"](function (error) {
        notify.danger('修改意圖名稱失敗');
      });
    });
    $entityEditor.on('click', '#entity_name_cancel', function (e) {
      var $parent = $(e.currentTarget).parent().parent().parent();
      $parent.children('div').toggleClass('d-none');
      $('#entity_name_input').val(selectEntity);
    });
    $entityEditor.on('click', '#entity_remove', function (e) {
      if (!selectEntity) return;

      if (confirm("即將刪除該Entity，確定要刪除?")) {//
      } else {
        return;
      }

      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          entity: selectEntity
        }, response);
        return callWatsonAPI('/deleteEntity', 'POST', body);
      }).then(function (response) {
        $entitySelector[0].selectize.removeOption(selectEntity);
        $entitySelector[0].selectize.refreshOptions(false);
        $entitySelector[0].selectize.setValue('請選擇', true);
        $entityContent.html('');
        notify.success('移除Entity成功');
      })["catch"](function (error) {
        notify.danger('移除Entity失敗');
      });
    });
    $entityEditor.on('click', '#entity_import', function (e) {
      $importDataSidebar.find('#importTarget').html('Entity');
      $importDataSidebar.attr('target', 'entity');
      $importDataSidebar.toggleClass('active');
    }); // edit examples

    $intentContent.on('click', '[content="edit_example"]', function (e) {
      $(e.currentTarget).parent().parent().children().toggleClass('d-none');
    });
    $intentContent.on('click', '[content="delete_example"]', function (e) {
      var $targetRow = $(e.currentTarget).parent().parent().parent();
      var selectExample = $targetRow.find('.training_list_content').html();
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          deleteExample: {
            intent: selectIntent,
            text: selectExample
          }
        }, response);
        return callWatsonAPI('/deleteExample', 'POST', body);
      }).then(function (response) {
        $targetRow.remove();
        notify.success('刪除例句成功');
      })["catch"](function (error) {
        notify.danger('刪除例句失敗');
      });
    });
    $intentContent.on('click', '[content="update_example"]', function (e) {
      var $targetRow = $(e.currentTarget).parent().parent().parent();
      var selectExample = $targetRow.find('.training_list_content').html();
      var editedExample = $targetRow.find('input').val().trim();
      if (!editedExample) return;
      mainController.getAssistantConfig().then(function (response) {
        if (selectExample == editedExample) return Promise.resolve();
        var body = Object.assign({
          newExample: {
            intent: selectIntent,
            text: selectExample,
            newText: editedExample
          }
        }, response);
        return callWatsonAPI('/updateExample', 'POST', body);
      }).then(function (response) {
        $targetRow.find('.training_list_content').html(editedExample);
        $targetRow.children().children().toggleClass('d-none');
        notify.success('編輯例句成功');
      })["catch"](function (error) {
        notify.danger('編輯例句失敗');
      });
    });
    $intentContent.on('click', '[content="cancel_edit_example"]', function (e) {
      var $targetRow = $(e.currentTarget).parent().parent().parent();
      $targetRow.children().children().toggleClass('d-none');
    });
    $intentContent.on('click', '[content="add_example"]', function (e) {
      var $targetRow = $(e.currentTarget).parent().parent().parent();
      var newExample = $targetRow.find('input').val().trim();
      if (!newExample) return;
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          newExample: {
            intent: selectIntent,
            text: newExample
          }
        }, response);
        return callWatsonAPI('/createExample', 'POST', body);
      }).then(function (response) {
        var data = response.result;
        $targetRow.after(generateExampleList(data));
        $targetRow.find('input').val('');
        notify.success('新增例句成功');
      })["catch"](function (error) {
        notify.danger('新增例句失敗');
      });
    }); // edit value

    $entityContent.on('click', '[content="edit_value"]', function (e) {
      selectValue = $(e.currentTarget).parent().parent().children('.training_list_content').attr('value');
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          targetValue: {
            entity: selectEntity,
            value: selectValue
          }
        }, response);
        return callWatsonAPI('/listSynonyms', 'POST', body);
      }).then(function (response) {
        var data = response.result;
        $('#edited_value').val(selectValue);
        $('#synonyms').html(data.synonyms.map(function (syn) {
          return "<div class=\"input-group input-group-sm col-4 mb-3\">\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" value=\"".concat(syn.synonym, "\">\n\t\t\t\t\t\t\t<div class=\"input-group-append\">\n\t\t\t\t\t\t\t\t<button class=\"btn btn-sm nowrap bg_blue remove_synonym\" type=\"button\"><i class=\"fas fa-trash-alt fa-fw text_white\"></i></button>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>");
        }));
        $editValueAndSynonymsSidebar.toggleClass('active'); // notify.success('取得Value成功');
      })["catch"](function (error) {
        notify.danger('取得Value失敗');
      });
    });
    $entityContent.on('click', '[content="delete_value"]', function (e) {
      var $targetRow = $(e.currentTarget).parent().parent().parent();
      selectValue = $(e.currentTarget).parent().parent().children('.training_list_content').attr('value');
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          targetValue: {
            entity: selectEntity,
            value: selectValue
          }
        }, response);
        return callWatsonAPI('/deleteValue', 'POST', body);
      }).then(function (response) {
        $targetRow.remove();
        notify.success('刪除Value成功');
      })["catch"](function (error) {
        notify.danger('刪除Value失敗');
      });
    });
    $entityContent.on('click', '[content="add_value"]', function (e) {
      var $targetRow = $(e.currentTarget).parent().parent().parent();
      var newValue = $targetRow.find('input').val().trim();
      if (!newValue) return;
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          targetValue: {
            entity: selectEntity,
            value: newValue
          }
        }, response);
        return callWatsonAPI('/createValue', 'POST', body);
      }).then(function (response) {
        var data = response.result;
        $targetRow.after(generateValueList(data));
        $targetRow.find('input').val('');
        notify.success('新增Value成功');
      })["catch"](function (error) {
        notify.danger('新增Value失敗');
      });
    }); // synonyms

    $editValueAndSynonymsSidebar.on('click', '#add_synonym', function (e) {
      var newSynonym = $('#new_synonym').val().trim();
      var synonyms = $('#synonyms').find('input').toArray().map(function (syn) {
        return $(syn).val().trim();
      });
      synonyms.push(newSynonym);
      if (!newSynonym) return;

      if (!checkSynonyms(synonyms)) {
        notify.danger('有重複的同義字');
        return;
      }

      ;
      $('#new_synonym').val('');
      $('#synonyms').append("\n\t\t\t\t<div class=\"input-group input-group-sm col-4 mb-3\">\n\t\t\t\t\t<input type=\"text\" class=\"form-control\" value=\"".concat(newSynonym, "\">\n\t\t\t\t\t<div class=\"input-group-append\">\n\t\t\t\t\t\t<button class=\"btn btn-sm nowrap bg_blue remove_synonym\" type=\"button\"><i class=\"fas fa-trash-alt fa-fw text_white\"></i></button>\n\t\t\t\t\t</div>\n\t\t\t\t</div>"));
    });
    $editValueAndSynonymsSidebar.on('click', '.remove_synonym', function (e) {
      $(e.currentTarget).parent().parent().remove();
    });
    $editValueAndSynonymsSidebar.on('click', '#submit_edit_value', function (e) {
      var valueName = $('#edited_value').val();
      var synonyms = $('#synonyms').find('input').toArray().map(function (syn) {
        return $(syn).val().trim();
      });

      if (!valueName) {
        notify.danger('缺少同義字名稱');
        return;
      }

      ;

      if (!checkSynonyms(synonyms)) {
        notify.danger('有重複的同義字');
        return;
      }

      ;
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign({
          newValue: {
            entity: selectEntity,
            value: valueName,
            newSynonyms: synonyms
          }
        }, response);
        return callWatsonAPI('/updateValue', 'POST', body);
      }).then(function (response) {
        $(".training_list_content[value=\"".concat(selectValue, "\"]")).attr('value', valueName).html("<span class=\"badge badge-info mr-2\">".concat(valueName, "</span>").concat((synonyms || []).join(',')));
        $editValueAndSynonymsSidebar.toggleClass('active');
        notify.success('編輯Value成功');
      })["catch"](function (error) {
        notify.danger('編輯Value失敗');
      });
    }); // import

    $importDataSidebar.on('click', '#submit_import', function (e) {
      var $target = $(e.currentTarget);
      var importTarget = $importDataSidebar.attr('target');
      var importMethod = $importDataSidebar.find('.nav .nav-link.active').attr('aria-controls');
      $target.attr('disabled', true);
      return function () {
        if (importMethod == 'file') {
          var file = $importDataSidebar.find('input')[0].files[0];
          var fl = new FileLoader(file, 'csv');
          return fl.readFile()["catch"](function (error) {
            return Promise.reject('選擇檔案錯誤');
          });
        } else if (importMethod == 'paste') {
          return Promise.resolve($importDataSidebar.find('textarea').val());
        }
      }().then(function (text) {
        return function () {
          if (importTarget == 'intent') {
            return importIntent(parseCsvIntentData(text));
          } else if (importTarget == 'entity') {
            return importEntity(parseCsvEntityData(text));
          }
        }();
      }).then(function () {
        $importDataSidebar.toggleClass('active');
        $target.attr('disabled', false);
      })["catch"](function (error) {});
    });
    $importDataSidebar.on('change', 'input[type="file"]', function (e) {
      //get the file name
      var fileName = $(e.currentTarget).val(); //replace the "Choose a file" label

      $(e.currentTarget).next('.custom-file-label').html(fileName);
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    var maskId = stableMask('取得資料中，請稍後');
    mainController.getAssistantConfig().then(function (response) {
      return Promise.all([callWatsonAPI('/listIntents', 'POST', response), callWatsonAPI('/listEntities', 'POST', response), callWatsonAPI('/listCounterexamples', 'POST', response)]);
    }).then(function (responses) {
      var intentsRes = responses[0].result,
          entitiesRes = responses[1].result,
          counterExamplesRes = responses[2].result;
      workspace = {
        intents: intentsRes,
        entities: entitiesRes
      };
      if ($intentSelector[0].selectize) $intentSelector[0].selectize.destroy();
      if ($entitySelector[0].selectize) $entitySelector[0].selectize.destroy(); // intent

      $intentSelector.html("<option>\u8ACB\u9078\u64C7</option>" + intentsRes.intents.map(function (intent) {
        return "<option value=\"".concat(intent.intent, "\">").concat(intent.intent, "</option>");
      }).join('\n')); // entity

      $entitySelector.html("<option>\u8ACB\u9078\u64C7</option>" + entitiesRes.entities.map(function (entity) {
        return "<option value=\"".concat(entity.entity, "\">").concat(entity.entity, "</option>");
      }).join('\n')); // counterexample
      // $('.training_list_body[content="counterexamples"]').html(generateCounterExampleAdder() + 
      //     (counterExamplesRes.counterexamples.map(ce => generateCounterExampleList(ce)) || []).join('\n'));

      $intentSelector.selectize({
        create: false,
        sortField: 'text',
        inputClass: 'form-control form-control-sm selectize-input',
        dropdownParent: "body"
      });
      $entitySelector.selectize({
        create: false,
        sortField: 'text',
        inputClass: 'form-control form-control-sm selectize-input',
        dropdownParent: "body"
      });
    })["catch"](function (error) {
      console.error(error);
    })["finally"](function () {
      removeMask(maskId);
    });
    haveInit = true;
  } // private functions


  function generateExampleList(example) {
    return "<li>\n                    <div class=\"training_list_item\">\n                        <div class=\"training_list_content\">".concat(example.text, "</div>\n                        <input type=\"text\" class=\"form-control form-control-sm mx-2 d-none\" value=\"").concat(example.text, "\">\n                        <div class=\"btn-group btn-group-sm\" role=\"group\">\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"edit_example\">\n                                <i class=\"fas fa-pen\"></i>\n                            </button>\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"delete_example\">\n                                <i class=\"fas fa-trash-alt\"></i>\n                            </button>\n                        </div>\n                        <div class=\"btn-group btn-group-sm d-none\" role=\"group\">\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"update_example\">\n                                <i class=\"fas fa-check\"></i>\n                            </button>\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"cancel_edit_example\">\n                                <i class=\"fas fa-times\"></i>\n                            </button>\n                        </div>\n                    </div>\n                </li>");
  }

  function generateExampleAdder() {
    // <button type="button" class="btn btn_outline_blue" content="import_example">
    // 	<i class="fas fa-folder-plus"></i>
    // </button>
    return "<li>\n                    <div class=\"training_list_item\">\n                        <input type=\"text\" class=\"form-control form-control-sm mx-2\">\n                        <div class=\"btn-group btn-group-sm\" role=\"group\">\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"add_example\">\n                                <i class=\"fas fa-plus\"></i>\n                            </button>\n                        </div>\n                    </div>\n                </li>";
  }

  function generateValueList(value) {
    return "<li>\n                    <div class=\"overflow-auto training_list_item\">\n                        <div class=\"training_list_content\" value=\"".concat(value.value, "\">\n                            <span class=\"badge badge-info mr-2\">").concat(value.value, "</span>").concat((value.synonyms || []).join(','), "\n                        </div>\n                        <div class=\"btn-group btn-group-sm\" role=\"group\">\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"edit_value\">\n                                <i class=\"fas fa-pen\"></i>\n                            </button>\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"delete_value\">\n                                <i class=\"fas fa-trash-alt\"></i>\n                            </button>\n                        </div>\n                    </div>\n                </li>");
  }

  function generateValueAdder() {
    return "<li>\n                    <div class=\"training_list_item\">\n                        <input type=\"text\" class=\"form-control form-control-sm mx-2\">\n                        <div class=\"btn-group btn-group-sm\" role=\"group\">\n                            <button type=\"button\" class=\"btn btn_outline_blue\" content=\"add_value\">\n                                <i class=\"fas fa-plus\"></i>\n                            </button>\n                            <!-- <button type=\"button\" class=\"btn btn_outline_blue\" content=\"import_values\">\n                                <i class=\"fas fa-folder-plus\"></i>\n                            </button> -->\n                        </div>\n                    </div>\n                </li>";
  }

  function generateCounterExampleList(ce) {
    return "<li>\n                <div class=\"training_list_item\">\n                    <div class=\"training_list_content\">".concat(ce.text, "</div>\n                    <input type=\"text\" class=\"form-control form-control-sm mx-2 d-none\" value=\"").concat(ce.text, "\">\n                    <div class=\"btn-group btn-group-sm\" role=\"group\">\n                        <button type=\"button\" class=\"btn btn_outline_blue\" content=\"edit_counterexample\">\n                            <i class=\"fas fa-pen\"></i>\n                        </button>\n                        <button type=\"button\" class=\"btn btn_outline_blue\" content=\"delete_counterexample\">\n                            <i class=\"fas fa-trash-alt\"></i>\n                        </button>\n                    </div>\n                    <div class=\"btn-group btn-group-sm d-none\" role=\"group\">\n                        <button type=\"button\" class=\"btn btn_outline_blue\" content=\"update_counterexample\">\n                            <i class=\"fas fa-check\"></i>\n                        </button>\n                        <button type=\"button\" class=\"btn btn_outline_blue\" content=\"cancel_edit_counterexample\">\n                            <i class=\"fas fa-times\"></i>\n                        </button>\n                    </div>\n                </div>\n            </li>");
  }

  function generateCounterExampleAdder() {
    return "<li>\n                <div class=\"training_list_item\">\n                    <input type=\"text\" class=\"form-control form-control-sm mx-2\">\n                    <div class=\"btn-group btn-group-sm\" role=\"group\">\n                        <button type=\"button\" class=\"btn btn_outline_blue\" content=\"add_counterexample\">\n                            <i class=\"fas fa-plus\"></i>\n                        </button>\n                    </div>\n                </div>\n            </li>";
  } // 檢查重複的同義字


  function checkSynonyms(array) {
    return array.filter(function (item) {
      if (!item || array.filter(function (i) {
        return i == item;
      }).length > 1) return true;
    }).length <= 0;
  } // for 匯入


  function parseCsvIntentData(csvString) {
    var intents = {};
    csvString.split('\n').forEach(function (row) {
      var ss = row.split(',');
      if (ss.length < 2) return;
      ss = ss.map(function (s) {
        return s.trim();
      });

      if (intents.hasOwnProperty(ss[1])) {
        intents[ss[1]].push(ss[0]);
      } else {
        intents[ss[1]] = [ss[0]];
      }
    });
    console.log(intents, csvString);
    return intents;
  }

  function parseCsvEntityData(csvString) {
    var entities = {};
    csvString.split('\n').forEach(function (row) {
      var ss = row.split(',').map(function (s) {
        return s.trim();
      });
      if (ss.length < 1) return;

      if (ss[0] && !entities.hasOwnProperty(ss[0])) {
        entities[ss[0]] = {};
      } else {// pass
      }

      if (ss.length < 2) return;

      if (ss[1] && !entities[ss[0]].hasOwnProperty(ss[1])) {
        entities[ss[0]][ss[1]] = [];
      } else {// pass
      }

      if (ss.length < 3) return;
      var synonyms = ss.slice(2);
      synonyms.forEach(function (s) {
        var synonym = entities[ss[0]][ss[1]].find(function (_s) {
          return _s == s;
        });

        if (synonym) {// pass
        } else {
          entities[ss[0]][ss[1]].push(s);
        }
      });
    });
    return entities;
  }

  function importIntent(intents) {
    notify.info('資料匯入中');
    return mainController.getAssistantConfig().then(function (response) {
      var body = Object.assign({
        properties: {
          _export: true
        }
      }, response);
      return callWatsonAPI('/listIntents', 'POST', body);
    }).then(function (response) {
      var result = response.result,
          change = false,
          countIntent = 0,
          countExample = 0;
      Object.keys(intents).forEach(function (intent) {
        var targetIntent = result.intents.find(function (i) {
          return i.intent == intent;
        });

        if (targetIntent) {
          intents[intent].forEach(function (example) {
            var targetExample = targetIntent.examples.find(function (e) {
              return e.text == example;
            });

            if (targetExample) {// already exist, pass
            } else {
              change = true;
              countExample++;
              targetIntent.examples.push({
                text: example
              });
            }
          });
        } else {
          change = true;
          var newIntent = {
            intent: intent,
            examples: []
          };
          intents[intent].forEach(function (example) {
            var targetExample = newIntent.examples.find(function (e) {
              return e.text == example;
            });

            if (!targetExample) {
              countExample++;
              newIntent.examples.push({
                text: example
              });
            } else {// pass
            }
          });
          countIntent++;
          countExample += newIntent.examples.length;
          result.intents.push(newIntent);
        }
      });

      if (change) {
        var msg = "\u78BA\u5B9A\u8981\u65B0\u589E\u8A13\u7DF4? \u5171 ".concat(countIntent, " \u65B0Intents\uFF0C").concat(countExample, " \u65B0Examples");

        if (confirm(msg)) {
          return mainController.getAssistantConfig().then(function (response) {
            var body = Object.assign({
              newWorkspace: {
                intents: result.intents
              }
            }, response);
            return callWatsonAPI('/updateWorkspace', 'POST', body);
          });
        }
      }

      return Promise.resolve();
    }).then(function (response) {
      console.log('匯入完成');

      if (!response) {// change
      } else {
        notify.success('新增訓練成功，請稍待訓練生效');
        initPage();
      }
    })["catch"](function (error) {
      console.log(error);
      notify.danger('匯入失敗');
    });
  }

  function importEntity(entities) {
    notify.info('資料匯入中');
    return mainController.getAssistantConfig().then(function (response) {
      var body = Object.assign({
        properties: {
          _export: true
        }
      }, response);
      return callWatsonAPI('/listEntities', 'POST', body);
    }).then(function (response) {
      var result = response.result;
      var updateEntity,
          change = false,
          countEntity = 0,
          countValue = 0,
          countSynonyms = 0;
      Object.keys(entities).forEach(function (entity) {
        var targetEntity = result.entities.find(function (e) {
          return e.entity == entity;
        });

        if (targetEntity) {
          Object.keys(entities[entity]).forEach(function (values) {
            var targetValue = targetEntity.values.find(function (e) {
              return e.value == value;
            });

            if (targetValue) {
              entities[entity][value].forEach(function (synonyms) {
                var targetSynonyms = targetValue.synonyms.find(function (s) {
                  return s == synonyms;
                });

                if (targetSynonyms) {// pass
                } else {
                  change = true;
                  countSynonyms++;
                  targetValue.synonyms.push(synonyms);
                }
              });
            } else {
              change = true;
              countValue++;
              countSynonyms += entities[entity][value].length;
              targetEntity.values.push({
                type: 'synonyms',
                value: value,
                synonyms: entities[entity][value]
              });
            }
          });
        } else {
          change = true;
          countEntity++;
          countValue += Object.values(entities[entity]).length;
          countSynonyms += Object.values(entities[entity]).map(function (value) {
            return Object.values(value).length;
          }).reduce(function (a, b) {
            return a + b;
          });
          result.entities.push({
            entity: entity,
            values: Object.keys(entities[entity]).map(function (value) {
              return {
                type: 'synonyms',
                value: value,
                synonyms: entities[entity][value]
              };
            })
          });
        }
      });

      if (change) {
        var msg = "\u78BA\u5B9A\u8981\u65B0\u589E\u8A13\u7DF4? \u5171 ".concat(countEntity, " \u65B0Entity\uFF0C").concat(countValue, " \u65B0Value\uFF0C").concat(countSynonyms, " \u65B0Synonyms");

        if (confirm(msg)) {
          return mainController.getAssistantConfig().then(function (response) {
            var body = Object.assign({
              newWorkspace: {
                entities: result.entities
              }
            }, response);
            return callWatsonAPI('/updateWorkspace', 'POST', body);
          });
        }
      }

      return Promise.resolve();
    }).then(function (res) {
      if (!res) {// change
      } else {
        notify.success('新增訓練成功，請稍待訓練生效');
        initPage();
      }
    })["catch"](function (error) {
      console.log(error);
      notify.danger('匯入失敗');
    });
  }

  function callWatsonAPI(assistantApi, method, body, headers) {
    Object.assign(body, {
      projectId: mainController.getProjectId()
    });
    return callBackendAPI('/watson/assistant' + assistantApi, method, body, headers);
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
}();