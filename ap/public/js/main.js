"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mainController = function () {
  var haveInit;

  var _projectId,
      _featureId,
      assistantConfig = {};

  var $redirect = $('#redirect');
  var $sidebar = $('section#layoutSidenav_nav');
  var $content = $('section#layoutSidenav_content');
  var $sidebarToggle = $('#sidebarToggle');
  var $logout = $('#logout');
  var $mainPage = $('.main-page');
  var $previewSidebar = $('#preview');
  var BG_ACTIVE_CLASS = 'bg_green_light';
  var BG_INACTIVE_CLASS = 'bg_grey_light';
  var BG_EDITING_CLASS = 'bg_blue_light'; // 每次搜尋數

  var pageLimit = 500; // 替換字串設定

  var replaceConfig = {
    data: {
      name: /[$][{]domain_data[}]/g,
      value: "https://hqsaplu83.hotains.com.tw/file/helpdesk/document"
    },
    img: {
      name: /[$][{]domain_img[}]/g,
      value: "https://hqsaplu83.hotains.com.tw/file/helpdesk/image"
    }
  }; // 初始化頁面動作

  function __init__() {
    // 功能列收合
    $sidebarToggle.on('click', function (e) {
      $sidebar.toggleClass('active'); // $sidebar.find('.input-group').toggleClass('d-none')

      $content.toggleClass('active');
    }); // 切換環境

    $sidebar.find('select').on('change', function (e) {
      var $target = $(e.currentTarget);
      var projectId = $target.find('option:selected').attr('projectId');
      var $nowMenu = $sidebar.find(".sb-sidenav-menu[projectId=\"".concat(projectId, "\"]"));
      _projectId = projectId;
      callBackendAPI('/setSession', 'POST', {
        key: 'projectId',
        value: projectId
      })["catch"](function (e) {});
      $sidebar.find('.sb-sidenav-menu').addClass('d-none');
      $nowMenu.removeClass('d-none');
      var redirectfeatureId = $redirect.attr('featureId');
      $redirect.removeAttr('featureId');

      if (redirectfeatureId) {
        var $targetNav = $nowMenu.find(".nav-link[featureId=".concat(redirectfeatureId, "]"));
        $targetNav.trigger('click');
      } else {
        $nowMenu.find('.nav-link:first').trigger('click');
      }
    }); // 切換功能

    $sidebar.on('click', '.nav-link:not(.active)', function (e) {
      var $target = $(e.currentTarget);
      var featureId = $(e.currentTarget).attr('featureId');
      var redirectData = JSON.parse($redirect.val() || '{}');
      $redirect.removeAttr('value');
      $redirect.val('');
      _featureId = featureId;
      callBackendAPI('/setSession', 'POST', {
        key: 'featureId',
        value: featureId
      })["catch"](function (e) {});
      $sidebar.find('.nav-link.active').removeClass('active');
      $target.addClass('active');
      $previewSidebar.removeClass('active');
      changePage("/".concat(featureId), $mainPage, redirectData)["catch"](function (error) {
        console.error(error);
      });
    }); // 登出

    $logout.on('click', function (e) {
      logout();
    });
    initPage();
  }

  function changeNavStatus(featureId) {
    $sidebar.find('.nav-link.active').removeClass('active');
    $sidebar.find("[featureid=\"".concat(featureId, "\"]")).addClass('active');
    $previewSidebar.removeClass('active');
  } // 初始化頁面資訊


  function initPage() {
    var redirectProjectId = $redirect.attr('projectId');
    $redirect.removeAttr('projectId');

    if (redirectProjectId) {
      $sidebar.find('select').val(redirectProjectId);
    } else {
      _projectId = $sidebar.find('select').find('option:selected').attr('projectId');
    }

    $sidebar.find('select').trigger('change');
    haveInit = true; // trigger change projectId

    return 'ok';
  } // 登出動作


  function logout() {
    return callBackendAPI('/logout', 'POST', {}).then(function (response) {
      window.location = '/backend/login';
    })["catch"](function (error) {
      console.error('[logout fail]', error);
    });
  }

  function getProjectId() {
    return _projectId;
  }

  function getFeatureId() {
    return _featureId;
  }

  function getPage(path, data) {
    console.log('[get page]', path, data);
    var maskId = tempMask('頁面跳轉中請稍後');
    var headers = {
      asdiuvhai: 'akwelfhkwea'
    };
    var params = '?' + new URLSearchParams(_objectSpread({
      projectId: getProjectId()
    }, data)).toString();
    return callBackend('/backend' + path + params, 'GET', undefined, headers).then(function (res) {
      console.log('[success]', path);
      return res;
    })["catch"](function (err) {
      console.log('[fail]', path, err);
      var status = err.status,
          desc = err.desc;

      if (status == 401) {
        tempMask('登入逾時，需要重新登入');
        setTimeout(function () {
          window.location = '/backend/login';
        }, 2000);
      } else if (status == 500) {
        return Promise.reject({
          msg: '連線異常，請稍後再試'
        });
      } else {
        return Promise.reject(desc);
      }
    })["finally"](function () {
      removeMask(maskId);
    });
  }

  function changePage(path, target, data) {
    var $target;

    if (typeof target === 'string') {
      $target = $(target);
    } else {
      $target = target || $mainPage;
    }

    return getPage(path, data).then(function (page) {
      $target.html(page);
    });
  }

  function rollingSearch(searchParam, searchFunc, searchHandler) {
    searchParam.limit = searchParam.limit || pageLimit;
    searchParam.offset = searchParam.offset || 0;
    return searchFunc(searchParam).then(function (response) {
      searchHandler(response);

      if (response.length == pageLimit) {
        searchParam.offset += pageLimit;
        return rollingSearch(searchParam, searchFunc, searchHandler);
      }
    });
  }

  function getAssistantConfig() {
    return _getAssistantConfig.apply(this, arguments);
  }

  function _getAssistantConfig() {
    _getAssistantConfig = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var body;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              body = {
                projectId: getProjectId()
              };

              if (!assistantConfig[body.projectId]) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return", assistantConfig[body.projectId]);

            case 5:
              return _context.abrupt("return", callBackendAPI('/getWatsonConfig', 'POST', body).then(function (response) {
                assistantConfig[body.projectId] = response;
                return response;
              }));

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _getAssistantConfig.apply(this, arguments);
  }

  function getBgClassByActive(active) {
    if (active) {
      return BG_ACTIVE_CLASS;
    } else {
      return BG_INACTIVE_CLASS;
    }
  }

  function newPage(path) {
    window.open("".concat(window.location.origin).concat(window.location.pathname, "/newPage").concat(path));
  }

  function location(url) {
    window.location = url;
  }

  function preview(message) {
    var projectId = getProjectId(); // 替換pattern

    message = JSON.parse(replacePatterns(JSON.stringify(message)));
    var iframe = $previewSidebar.find('iframe')[0];

    iframe.onload = function () {
      iframe.contentWindow.displayMessage(message);
    };

    var params = new URLSearchParams({
      projectId: projectId
    }).toString();
    iframe.src = "/backend/preview?".concat(params);
    $previewSidebar.addClass('active');
  } // 替換網址中pattern供預覽使用


  function replacePatterns(text, target) {
    var targetConfigs; // 傳入目標為字串?

    if (target && typeof target == 'string') {
      targetConfigs = [replaceConfig[target]]; // 傳入目標為陣列
    } else if (target && Array.isArray(target) && target.length > 0) {
      targetConfigs = Object.keys(replaceConfig).filter(function (configType) {
        return target.indexOf(configType) > -1;
      }).map(function (configType) {
        return replaceConfig[configType];
      }); // 無目標
    } else {
      targetConfigs = Object.values(replaceConfig);
    }

    var _iterator = _createForOfIteratorHelper(targetConfigs),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var config = _step.value;
        var regExp = new RegExp(config.name);
        text = text.replace(regExp, config.value);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return text;
  } // 替換網址為pattern以存入資料庫


  function toPatterns(text, target) {
    var targetConfigs; // 傳入目標為字串?

    if (target && typeof target == 'string') {
      targetConfigs = [replaceConfig[target]]; // 傳入目標為陣列
    } else if (target && Array.isArray(target) && target.length > 0) {
      targetConfigs = Object.keys(replaceConfig).filter(function (configType) {
        return target.indexOf(configType) > -1;
      }).map(function (configType) {
        return replaceConfig[configType];
      }); // 無目標
    } else {
      targetConfigs = Object.values(replaceConfig);
    }

    var _iterator2 = _createForOfIteratorHelper(targetConfigs),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var config = _step2.value;
        var regExp = new RegExp(config.value);
        text = text.replace(regExp, config.name);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    return text;
  }

  __init__();

  return {
    haveInit: haveInit,
    pageLimit: pageLimit,
    color: {
      active: BG_ACTIVE_CLASS,
      inactive: BG_INACTIVE_CLASS,
      editing: BG_EDITING_CLASS
    },
    initPage: initPage,
    getPage: getPage,
    changePage: changePage,
    changeNavStatus: changeNavStatus,
    location: location,
    newPage: newPage,
    preview: preview,
    logout: logout,
    getProjectId: getProjectId,
    getFeatureId: getFeatureId,
    replacePatterns: replacePatterns,
    toPatterns: toPatterns,
    getAssistantConfig: getAssistantConfig,
    getBgClassByActive: getBgClassByActive,
    rollingSearch: rollingSearch
  };
}();