"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var projectManagementController = function () {
  var haveInit;
  var $tab = $('[tab="projectManagement"]');
  var $roleBlock = $('[content="role"]');
  var $featureBlock = $('[content="feature"]');
  var $userBlock = $('[content="user"]');
  var $selectAllFeatures = $featureBlock.find('input[type=checkbox][name=feature-all]'); // 初始化頁面動作

  function __init__() {
    $roleBlock.on('change', 'input[type=radio]', function (e) {
      var roleId = $(e.currentTarget).val();
      Promise.all([getAccrssRights(roleId), getAuthoritites(roleId)]).then(function (response) {
        var _response = _slicedToArray(response, 2),
            accessRights = _response[0],
            authorities = _response[1];

        $featureBlock.find("input[type=checkbox][name=feature]").prop("checked", false);
        accessRights.map(function (ar) {
          // set .prop("checked", true) do not trigger 'change' event
          $featureBlock.find("input[type=checkbox][name=feature][value=".concat(ar.FEATURE_ID, "]")).prop("checked", true);
        });

        if ($featureBlock.find("input[type=checkbox][name=feature]").not(':checked').length > 0) {
          $selectAllFeatures.prop('checked', false);
        } else {
          $selectAllFeatures.prop('checked', true);
        }

        $userBlock.find('.main-block-body').html(authorities.length > 0 ? "<ol>".concat(authorities.map(function (ar) {
          return "<li class=\"mx-2 my-1\">".concat(ar.USER_ID, "</li>");
        }).join('\n'), "</ol>") : '沒有成員');
      })["catch"](function (err) {});
    }); // 全選

    $featureBlock.on('change', 'input[type=checkbox][name=feature-all]', function (e) {
      var $unchecked = $featureBlock.find('input[type=checkbox][name=feature]').not(':checked');
      var $checked = $featureBlock.find('input[type=checkbox][name=feature]:checked');

      if ($unchecked.length > 0) {
        $unchecked.trigger('click');
        $selectAllFeatures.prop("checked", true);
      } else {
        $checked.trigger('click');
        $selectAllFeatures.prop("checked", false);
      }
    }); // set .prop("checked", true) do not trigger 'change' event

    $featureBlock.on('change', 'input[type=checkbox][name=feature]', function (e) {
      var $target = $(e.currentTarget);
      var featureId = $target.val();
      var checked = $target.prop('checked');
      (function () {
        $target.attr('disabled', true);

        if (checked === true) {
          return insertAccessRight(featureId);
        } else if (checked === false) {
          return deleteAccessRight(featureId);
        }
      })().then(function (response) {
        notify.success('Success!');
      })["catch"](function (err) {
        $target.prop('checked', !checked);
      })["finally"](function () {
        $target.attr('disabled', false);
        var $unchecked = $featureBlock.find('input[type=checkbox][name=feature]').not(':checked');

        if ($unchecked.length > 0) {
          $selectAllFeatures.prop("checked", false);
        } else {
          $selectAllFeatures.prop("checked", true);
        }
      });
    });
    initPage();
    return 'ok';
  } // 初始化頁面資訊


  function initPage() {
    // get data
    Promise.all([getRoles(), getFeatures()]).then(function (responses) {
      var _responses = _slicedToArray(responses, 2),
          roles = _responses[0],
          features = _responses[1];

      $roleBlock.find('.main-block-body').html(roles.map(function (role) {
        return "\n                        <div class=\"mx-2 my-1\">\n                            <div class=\"pretty p-default p-curve p-smooth\">\n                                <input type=\"radio\" name=\"role\" value=\"".concat(role.ROLE_ID, "\" />\n                                <div class=\"state p-primary-o\">\n                                    <label>").concat(role.ROLE_NAME, "</label>\n                                </div>\n                            </div>\n                        </div>");
      }).join('\n'));
      $featureBlock.find('.main-block-body').html(features.map(function (feature) {
        return "\n                        <div class=\"mx-2 my-1\">\n                            <div class=\"pretty p-default p-curve p-smooth\">\n                                <input type=\"checkbox\" name=\"feature\" value=\"".concat(feature.FEATURE_ID, "\" />\n                                <div class=\"state p-primary-o\">\n                                    <label>").concat(feature.FEATURE_NAME, "</label>\n                                </div>\n                            </div>\n                        </div>");
      }).join('\n'));
      $roleBlock.find('input:first').trigger('click');
    })["catch"](function (error) {});
    haveInit = true;
  } // private functions


  function getRoles() {
    return callBackendAPI('/listRole', 'GET');
  }

  function getFeatures() {
    return callBackendAPI('/listFeature', 'GET');
  }

  function getAccrssRights(roleId) {
    var body = {
      roleId: roleId,
      projectId: mainController.getProjectId()
    };
    return callBackendAPI('/listAccessRight', 'POST', body);
  }

  function getAuthoritites(roleId) {
    var body = {
      roleId: roleId,
      projectId: mainController.getProjectId()
    };
    return callBackendAPI('/listAuthorityByProjectIdAndRoleId', 'POST', body);
  }

  function insertAccessRight(featureId) {
    var body = {
      roleId: $roleBlock.find('input:checked').val(),
      projectId: mainController.getProjectId(),
      featureId: featureId
    };
    return callBackendAPI('/insertAccessRight', 'POST', body);
  }

  function deleteAccessRight(featureId) {
    var body = {
      roleId: $roleBlock.find('input:checked').val(),
      projectId: mainController.getProjectId(),
      featureId: featureId
    };
    return callBackendAPI('/deleteAccessRight', 'POST', body);
  } // do page init


  __init__();

  return {
    haveInit: haveInit,
    initPage: initPage
  };
}();