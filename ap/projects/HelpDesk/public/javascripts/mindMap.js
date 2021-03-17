"use strict";

var mindMapController = function () {
  var haveInit;
  var $tab = $('[tab="mindMap"]');
  var $search = $('#search');
  var $editSidebar = $tab.find('#editSidebar');
  var $searchSidebar = $tab.find('#searchSidebar');

  var _jm;

  var nodes; // 初始化頁面動作

  function __init__() {
    $editSidebar.find('#addReturn').on('click', function (e) {
      $('[name="nodeReturn"]').append("\n            <div class=\"input-group\" data-role=\"return-line\">\n                <input type=\"text\" class=\"form-control\">\n                <div class=\"input-group-append\">\n                    <button class=\"btn btn-outline-primary\" type=\"button\" action=\"edit\"><i class=\"fas fa-pen\"></i></button>\n                    <button class=\"btn btn-outline-info\" type=\"button\" action=\"preview\"><i class=\"fas fa-eye\"></i></button>\n                    <button class=\"btn btn-outline-danger\" type=\"button\" data-remove=\"return-line\"><i class=\"fas fa-trash-alt\"></i></button>\n                </div>\n            </div>");
    });
    $editSidebar.on('click', '[action="update"]', function (e) {
      var $target = $(e.currentTarget);
      var nodeId = $editSidebar.attr('nodeId');
      var type = $editSidebar.find('[name="nodeType"]').html();
      var newNode = {
        newTitle: $editSidebar.find('[name="nodeTitle"]').val() || null,
        newConditions: $editSidebar.find('[name="conditions"]').val() || null
      };

      if (type != 'folder') {
        newNode = Object.assign(newNode, {
          newOutput: {
            generic: [{
              response_type: 'text',
              values: $editSidebar.find('[name="nodeReturn"] input').toArray().map(function (input) {
                return {
                  text: $(input).val() || ''
                };
              }),
              selection_policy: $editSidebar.find('[name="chooseType"]').val()
            }]
          }
        });
      }

      $target.attr('disabled', true);
      mainController.getAssistantConfig().then(function (response) {
        var body = Object.assign(response, {
          dialogNode: nodeId,
          newNode: newNode
        });
        return callBackendAPI('/watson/assistant/updateDialogNode', 'POST', body);
      }).then(function (response) {
        notify.success('編輯成功');
      })["catch"](function (error) {
        notify.danger('編輯失敗' + error);
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    $editSidebar.on('click', '[action="preview"]', function (e) {
      var $target = $(e.currentTarget);
      var ansId = $target.closest('.input-group').find('input').val();
      if (!ansId) return;
      var body = {
        projectId: mainController.getProjectId(),
        ansId: ansId
      };
      $target.attr('disabled', true);
      callBackendAPI('/getAnswerpack', 'POST', body).then(function (response) {
        if (!response) {
          notify.danger('沒有該答案包');
        } else {
          var _JSON$parse = JSON.parse(response.INFORMATION),
              output = _JSON$parse.output;

          mainController.preview(output);
        }
      })["catch"](function (error) {
        notify.danger('取得答案包資料失敗');
      })["finally"](function () {
        $target.attr('disabled', false);
      });
    });
    $editSidebar.on('click', '[action="edit"]', function (e) {
      if (confirm('確定要跳至編輯頁嗎?')) {
        var ansId = $(e.currentTarget).closest('.input-group').find('input').val();
        var projectId = mainController.getProjectId();
        mainController.newPage("/".concat(projectId, "/answerPack?ansId=").concat(ansId));
      }
    });
    $search.on('click', function (e) {
      $searchSidebar.toggleClass('active');
    });
    $searchSidebar.on('click', '[action="search"]', function (e) {
      var $target = $(e.currentTarget);
      var searchContent = $searchSidebar.find('#searchContent').val();
      var searchDialogIdResult = nodes.filter(function (node) {
        return node.dialog_node.indexOf(searchContent) > -1;
      }).map(function (node) {
        return {
          id: node.dialog_node,
          title: node.dialog_node
        };
      });
      var searchAnsIdResult = nodes.filter(function (node) {
        return node.hasOwnProperty('output') && node.output.generic.length > 0 && node.output.generic[0].values.length > 0;
      }).filter(function (node) {
        return node.output.generic[0].values[0].text.indexOf(searchContent) > -1;
      }).map(function (node) {
        return {
          id: node.dialog_node,
          title: node.output.generic[0].values[0].text
        };
      }); // call api

      var searchContentResult;
      var body = {
        projectId: mainController.getProjectId(),
        pattern: searchContent
      };
      $target.attr('disabled', true);
      callBackendAPI('/findAnswerpack', 'POST', body).then(function (response) {
        searchContentResult = nodes.filter(function (node) {
          return response.find(function (answerpack) {
            return node.hasOwnProperty('output') && node.output.generic.length > 0 && node.output.generic[0].values.length > 0 && node.output.generic[0].values[0].text == answerpack.ANSWER_ID;
          });
        }).map(function (node) {
          return {
            id: node.dialog_node,
            title: node.output.generic[0].values[0].text
          };
        });
      })["catch"](function (error) {
        console.error(error);
      })["finally"](function () {
        $target.attr('disabled', false); // console.log(searchDialogIdResult, searchAnsIdResult, searchContentResult);

        var myhtml = "\n                    <h4 class=\"mt-2\">\u641C\u5C0Bdialog Id</h4>\n                    <div>".concat(searchDialogIdResult.map(function (r) {
          return "\n                            <div action=\"gotoNode\" class=\"btn btn-sm btn-light border mb-2\" dialogNode=\"".concat(r.id, "\">\n                                ").concat(r.title, "\n                            </div>");
        }).join('') || '無結果', "</div>\n                    <h4 class=\"mt-2\">\u641C\u5C0B\u7B54\u6848\u5305ID</h4>\n                    <div>").concat(searchAnsIdResult.map(function (r) {
          return "\n                            <div action=\"gotoNode\" class=\"btn btn-sm btn-light border mb-2\" dialogNode=\"".concat(r.id, "\">\n                                ").concat(r.title, "\n                            </div>");
        }).join('') || '無結果', "</div>\n                    <h4 class=\"mt-2\">\u641C\u5C0B\u7B54\u6848\u5305\u5167\u5BB9</h4>\n                    <div>").concat(searchContentResult.map(function (r) {
          return "\n                            <div action=\"gotoNode\" class=\"btn btn-sm btn-light border mb-2\" dialogNode=\"".concat(r.id, "\">\n                                ").concat(r.title, "\n                            </div>");
        }).join('') || '無結果', "</div>");
        $searchSidebar.find('div[content="searchReault"]').html(myhtml);
      });
    });
    $searchSidebar.on('click', '[action="gotoNode"]', function (e) {
      var dialogNode = $(e.currentTarget).attr('dialogNode');
      $searchSidebar.toggleClass('active');

      var node = _jm.get_node(dialogNode);

      var parent = node.parent;

      while (parent) {
        _jm.expand_node(parent);

        parent = parent.parent;
      }

      _jm.select_node(dialogNode);
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    var maskId = stableMask('心智圖載入中請稍後');
    mainController.getAssistantConfig().then(function (response) {
      return callBackendAPI('/watson/assistant/listDialogNodes', 'POST', response);
    }).then(function (response) {
      nodes = response.result.dialog_nodes;
      var tree = {
        id: 'root',
        topic: '心智圖',
        item: null,
        after: null,
        parent: null,
        children: {}
      };
      console.log(nodes);
      tree = nodes.getChildren(tree);
      load_jsmind(tree);
      notify.success('心智圖載入成功');
    })["catch"](function (error) {
      console.error(error);
      notify.danger('心智圖載入失敗，專案資訊未填寫');
    })["finally"](function () {
      removeMask(maskId);
    });
    haveInit = true;
  } // private functions
  // 將assistant節點資料建成tree


  Array.prototype.getChildren = function (parentNode) {
    var childs = this.filter(function (item) {
      return parentNode.id == (item.parent || 'root');
    });

    var _this = this;

    if (childs.length > 0) {
      parentNode.children = childs.map(function (item) {
        return {
          id: item.dialog_node,
          item: item,
          topic: item.title || item.conditions || item.dialog_node,
          expanded: false,
          after: item.previous_sibling || null,
          parent: item.parent || 'root'
        };
      }).sortChildren();
      parentNode.children.map(function (item) {
        item = _this.getChildren(item);
      });
    }

    return parentNode;
  }; // 排序子節點


  Array.prototype.sortChildren = function () {
    var result = [];

    for (var i = 0; i < this.length; i++) {
      result.push(i == 0 ? this.find(function (item) {
        return item.after == null;
      }) : this.find(function (item) {
        return item.after == result[i - 1].id;
      }));
    }

    return result;
  }; // 暫時用不到 顯示用


  function showTree(tree, floor) {
    floor = floor || 0;
    return !tree.hasOwnProperty('children') ? '' : tree.children.sortChildren().map(function (item) {
      return "\n  ".concat('  '.repeat(floor), " ").concat(item.id, " (").concat(item.topic, ") ").concat(item.hasOwnProperty('children') ? showTree(item, floor + 1) : '');
    }).join('');
  } // 用tree畫心智圖


  function load_jsmind(tree) {
    var mind = {
      "meta": {
        "name": "Assistant",
        "author": "",
        "version": ""
      },
      "format": "node_tree",
      "data": tree
    };
    var options = {
      container: 'jsmind_container',
      editable: true,
      theme: 'primary',
      shortcut: {
        enable: false
      },
      dblclick_handle: dblclick_handler
    };
    _jm = jsMind.show(options, mind);
  }

  function dblclick_handler(e) {
    var element = e.target || event.srcElement; // this = jsmind

    var nodeId = this.view.get_binded_nodeid(element);
    if (!nodeId) return;
    var mindNode = this.get_node(nodeId);
    var WatsonNode = mindNode.data.item; // console.log(mindNode, WatsonNode);

    var maskId = stableMask('loading<span class="loading"></span>');
    mainController.getAssistantConfig().then(function (response) {
      var body = Object.assign(response, {
        nodeId: WatsonNode.dialog_node
      });
      return callBackendAPI('/watson/assistant/getDialogNode', 'POST', body);
    }).then(function (response) {
      var node = response.result;
      var returns, returnType, chooseType;

      try {
        chooseType = node.output.generic[0].selection_policy;
        returnType = node.output.generic[0].response_type;
        returns = node.output.generic[0].values.map(function (value) {
          return value.text;
        });
      } catch (e) {
        returns = [];
      }

      if (node.type == 'folder') {
        $editSidebar.find('#nodeReturn').hide();
        $editSidebar.find('#chooseType').hide();
      } else {
        if (returnType != 'text') {
          notify.danger('節點內容無法解析，目前僅支援文字類型的回覆');
          return;
        }

        $editSidebar.find('#nodeReturn').show();
        $editSidebar.find('#chooseType').show();
      }

      $editSidebar.attr('nodeId', nodeId);
      $editSidebar.find('[name="nodeType"]').html(node.type || '');
      $editSidebar.find('[name="nodeTitle"]').val(node.title || '');
      $editSidebar.find('[name="conditions"]').val(node.conditions || '');
      $editSidebar.find('[name="chooseType"]').val(chooseType || '');
      $editSidebar.find('[name="nodeReturn"]').html(returns.map(function (ret) {
        return "\n                    <div class=\"input-group\" data-role=\"return-line\">\n                        <input type=\"text\" class=\"form-control\" value=\"".concat(ret, "\" disabled>\n                        <div class=\"input-group-append\">\n                            <button class=\"btn btn-outline-primary\" type=\"button\" action=\"edit\"><i class=\"fas fa-pen\"></i></button>\n                            <button class=\"btn btn-outline-info\" type=\"button\" action=\"preview\"><i class=\"fas fa-eye\"></i></button>\n                            <!-- <button class=\"btn btn-outline-danger\" type=\"button\" data-remove=\"return-line\"><i class=\"fas fa-trash-alt\"></i></button> -->\n                        </div>\n                    </div>");
      }).join('') || '');
      $editSidebar.toggleClass('active');
    })["catch"](function (error) {
      console.error(error);
    })["finally"](function () {
      removeMask(maskId);
    });
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage,
    jm: function jm() {
      return _jm;
    }
  };
}();