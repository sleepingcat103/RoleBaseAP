"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * to call backend api with ajax
 * @param {string} path api url
 * @param {string} method GET,POST
 * @param {object} body JSON object or NULL
 */
function callBackendAPI(path, method, body, headers) {
  return callBackend('/backendApi' + path, method, body, headers).then(function (res) {
    console.log('[success]', path, res);
    return res;
  })["catch"](function (err) {
    console.log('[fail]', path, err);
    var status = err.status,
        desc = err.desc;

    if (status == 401) {
      tempMask('登入逾時，需要重新登入');
      setTimeout(function () {
        location.reload();
      }, 2000);
    } else if (status == 500) {
      notify.danger('連線異常，請稍後再試');
      return Promise.reject({
        msg: '連線異常，請稍後再試'
      });
    } else {
      notify.danger(desc);
      return Promise.reject(desc);
    }
  });
}

function callBackend(path, method, body, headers) {
  return new Promise(function (resolve, reject) {
    var baseUrl = location.protocol + '//' + location.host;
    var url = baseUrl + path;
    console.log('[callapi]', path, body);
    $.ajax({
      url: url,
      type: method,
      headers: Object.assign({}, headers),
      contentType: 'application/json',
      data: body ? JSON.stringify(body) : undefined,
      success: function success(res) {
        resolve(res);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        reject({
          status: jqXHR.status,
          desc: jqXHR.responseJSON || {
            msg: textStatus + ' ' + errorThrown
          }
        });
      }
    });
  });
}

function callBackendAPI_Multipart(path, method, formData, headers) {
  return callBackend_Multipart('/backendApi' + path, method, formData, headers).then(function (res) {
    console.log('[success]', path, res);
    return res;
  })["catch"](function (err) {
    console.log('[fail]', path, err);
    var status = err.status,
        desc = err.desc;

    if (status == 401) {
      tempMask('登入逾時，需要重新登入');
      setTimeout(function () {
        location.reload();
      }, 2000);
    } else if (status == 500) {
      notify.danger('連線異常，請稍後再試');
      return Promise.reject({
        msg: '連線異常，請稍後再試'
      });
    } else {
      notify.danger(desc);
      return Promise.reject(desc);
    }
  });
}

function callBackend_Multipart(path, method, formData, headers) {
  return new Promise(function (resolve, reject) {
    var baseUrl = location.protocol + '//' + location.host;
    var url = baseUrl + path;
    console.log('[callapi_multipart]', path, formData);
    $.ajax({
      url: url,
      type: method,
      headers: Object.assign({}, headers),
      data: formData,
      contentType: false,
      processData: false,
      success: function success(res) {
        resolve(res);
      },
      error: function error(jqXHR, textStatus, errorThrown) {
        reject({
          status: jqXHR.status,
          desc: jqXHR.responseJSON || {
            msg: textStatus + ' ' + errorThrown
          }
        });
      }
    });
  });
}
/**
 * transfer seconds number to readable time string 
 * @param {int} ss 
 */


function secondsToTime(ss) {
  var hh = Math.floor(ss / 3600); //Get whole hours

  ss -= hh * 3600;
  var mm = Math.floor(ss / 60); //Get remaining minutes

  ss -= mm * 60;
  return (hh ? hh + " 小時 " : "") + (mm ? mm + " 分鐘 " : "") + (ss ? ss : 0) + " 秒";
} // DB時區問題，減八小時來顯示


function localeTimeTW(time) {
  return dayjs(new Date(time).getTime() - 8 * 60 * 60 * 1000).format('YYYY/MM/DD A hh:mm:ss'); // return new Date(new Date(time).getTime() - 8 * 60 * 60 * 1000).toLocaleString('zh-Hans-TW');
}
/**
 * a mask to show some message and during a period of time
 * @param {string} message 
 * @param {int} during millisecond
 */


function tempMask(message, during) {
  var id = 'mask-' + uuid();
  $('body').append('<div class="sky active" id="' + id + '" onclick="$(this).remove()">' + (message ? '<div class="sky-content">' + message + '</div>' : '') + ' \
    </div>');
  setTimeout(function () {
    var target = '.sky#' + id;
    if ($(target).length > 0) $(target).remove();
  }, during || 1600);
  return id;
}

function stableMask(message) {
  var id = 'mask-' + uuid();
  $('body').append('<div class="sky active" id="' + id + '">' + (message ? '<div class="sky-content">' + message + '</div>' : '') + ' \
    </div>');
  return id;
}

function removeMask(id) {
  var selector = '.sky' + '#' + id;
  $(selector).remove();
}

function htmlEncode(html) {
  html = $.trim(html);
  return html.replace(/[&"'\<\>]/g, function (c) {
    switch (c) {
      case "&":
        return "&amp;";

      case "'":
        return "&#39;";

      case '"':
        return "&quot;";

      case "<":
        return "&lt;";

      default:
        return "&gt;";
    }
  });
}

; // 比對物件是否相同

function deepCompare() {
  var i, l, leftChain, rightChain;

  function compare2Objects(x, y) {
    var p; // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true

    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
      return true;
    } // Compare primitives and functions.     
    // Check if both arguments link to the same object.
    // Especially useful on the step where we compare prototypes


    if (x === y) {
      return true;
    } // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes


    if (typeof x === 'function' && typeof y === 'function' || x instanceof Date && y instanceof Date || x instanceof RegExp && y instanceof RegExp || x instanceof String && y instanceof String || x instanceof Number && y instanceof Number) {
      return x.toString() === y.toString();
    } // At last checking prototypes as good as we can


    if (!(x instanceof Object && y instanceof Object)) {
      return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false;
    }

    if (x.constructor !== y.constructor) {
      return false;
    }

    if (x.prototype !== y.prototype) {
      return false;
    } // Check for infinitive linking loops


    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
      return false;
    } // Quick checking of one object being a subset of another.
    // todo: cache the structure of arguments[0] for performance


    for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (_typeof(y[p]) !== _typeof(x[p])) {
        return false;
      }
    }

    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (_typeof(y[p]) !== _typeof(x[p])) {
        return false;
      }

      switch (_typeof(x[p])) {
        case 'object':
        case 'function':
          leftChain.push(x);
          rightChain.push(y);

          if (!compare2Objects(x[p], y[p])) {
            return false;
          }

          leftChain.pop();
          rightChain.pop();
          break;

        default:
          if (x[p] !== y[p]) {
            return false;
          }

          break;
      }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {
    leftChain = []; //Todo: this can be cached

    rightChain = [];

    if (!compare2Objects(arguments[0], arguments[i])) {
      return false;
    }
  }

  return true;
} // 下載CSV大檔


function DownloadGreatArray(arr, filename) {
  var myCSV = [],
      part = 0;
  arr.forEach(function (row) {
    row.map(function (text) {
      return (text + '').replace(/\n/g, ' ').replace(/,/g, '，');
    });
    myCSV.push(row.join(','));

    if (myCSV.length == 10000) {
      DownloadCSV(myCSV.join('\n'), "".concat(filename, "-").concat(++part));
      myCSV = [];
    }
  });
  DownloadCSV(myCSV.join('\n'), "".concat(filename).concat(++part == 1 ? '' : "-".concat(part)));
}

function DownloadGreatCSV($selector, filename) {
  var myCSV = [],
      part = 0;
  $selector.find('tr').toArray().forEach(function (tr) {
    var row = [];
    $(tr).children('td,th').toArray().forEach(function (cell) {
      var mycontent = $(cell).html().includes('<img ') ? '圖片: ' + $($(cell).html()).prop('src') : $(cell).text().replace(/\n/g, " ").replace(/,/g, "，");
      row.push(mycontent);
    });
    myCSV.push(row.join(','));

    if (myCSV.length == 10000) {
      DownloadCSV(myCSV.join('\n'), "".concat(filename, "-").concat(++part));
      myCSV = [];
    }
  });
  DownloadCSV(myCSV.join('\n'), "".concat(filename).concat(++part == 1 ? '' : "-".concat(part)));
} // 下載csv


function DownloadCSV(csvContent, tableTitle) {
  // console.log(csvContent, tableTitle)
  var blobdata = new Blob(["\uFEFF" + csvContent], {
    type: 'text/csv;charset=utf-8'
  });
  var fileName = "".concat(tableTitle, " ").concat(new Date(Date.now() + 28800000).toISOString().replace('T', ' ').replace('Z', ''), ".csv");

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // for IE
    window.navigator.msSaveOrOpenBlob(blobdata, fileName);
  } else {
    var link = document.createElement("a");
    link.setAttribute("href", window.URL.createObjectURL(blobdata));
    link.setAttribute("download", fileName);
    link.click();
  }
} // 下載 excel 需搭配 xlsx.full.js


function openDownloadDialog(url, saveName) {
  if (_typeof(url) == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url);
  }

  var aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = saveName || '';
  var event;

  if (window.MouseEvent) {
    event = new MouseEvent('click');
  } else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }

  aLink.dispatchEvent(event);
}

function sheet2blob(sheet, sheetName) {
  sheetName = sheetName || 'sheet1';
  var workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  };
  workbook.Sheets[sheetName] = sheet; // 生成excel的配置项

  var wopts = {
    bookType: 'xlsx',
    // 要生成的文件类型
    bookSST: false,
    // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  };
  var wbout = XLSX.write(workbook, wopts);
  var blob = new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }); // 字符串转ArrayBuffer

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);

    for (var i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }

    return buf;
  }

  return blob;
} // 複製到剪貼簿


function copy(content) {
  var el = document.createElement('textarea');
  el.value = content;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
} // 跟隨滑鼠的提示


function cursorTooltip(content, startX, startY, during) {
  if (!content) return;
  during = during || 2000;
  var cursorTooltip = document.createElement('div');
  cursorTooltip.appendChild(document.createTextNode(content));
  document.body.appendChild(cursorTooltip);
  cursorTooltip.setAttribute("class", "cursor-tooltip");

  if (startX && startY) {
    cursorTooltip.style.left = startX + 20 + 'px';
    cursorTooltip.style.top = startY - 5 + 'px';
  }

  $('body').on('mousemove', function (e) {
    cursorTooltip.style.left = e.originalEvent.x + 20 + 'px';
    cursorTooltip.style.top = e.originalEvent.y - 5 + 'px';
  });
  setTimeout(function () {
    cursorTooltip.style.opacity = '0';
    setTimeout(function () {
      document.body.removeChild(cursorTooltip);
      $('body').unbind('mousemove');
    }, 1000);
  }, during);
}

function getNowFormatDate(date) {
  var seperator1 = "/";
  var seperator2 = ":";
  var strMonth = date.getMonth();
  var strDate = date.getDate();
  var strHour = date.getHours();
  var strMinute = date.getMinutes();
  var strSecond = date.getSeconds();

  if (strMonth >= 1 && strMonth <= 9) {
    strMonth = "0" + strMonth;
  }

  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }

  if (strHour >= 0 && strHour <= 9) {
    strHour = "0" + strHour;
  }

  if (strMinute >= 0 && strMinute <= 9) {
    strMinute = "0" + strMinute;
  }

  if (strSecond >= 0 && strSecond <= 9) {
    strSecond = "0" + strSecond;
  }

  var currentdate = date.getFullYear() + seperator1 + strMonth + seperator1 + strDate + " " + strHour + seperator2 + strMinute + seperator2 + strSecond;
  return currentdate;
} // make sidebar


function sidebar($selector, appendClass, dismiss) {
  var sidebarId = 'sidebar-' + uuid();
  dismiss = dismiss || false;
  $selector.after("<div class=\"sidebar ".concat(appendClass ? appendClass : '', "\" id=\"").concat(sidebarId, "\">\n        <div class=\"sky\"></div>\n    </div>"));
  $selector.addClass('sidebar-content');
  $selector.appendTo('#' + sidebarId);
  var $sidebar = $('#' + sidebarId);

  if (dismiss) {
    $sidebar.find('.sidebar-content').prepend('<div class="dismiss"><i class="fas fa-times"></i></div>');
    $sidebar.find('.dismiss').on('click', function () {
      $sidebar.toggleClass('active');
    });
  }

  return $('#' + sidebarId);
} // uuid


function uuid() {
  var d = new Date().getTime();

  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now();
  }

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return uuid;
} // form Data JSON


function getFormDataJson($form) {
  var $disabled = $form.find(":disabled").removeAttr("disabled");
  var result = $form.serializeArray().reduce(function (obj, item) {
    obj[item.name] = item.value;
    return obj;
  }, {});
  $disabled.attr("disabled", true);
  return result;
}

var notify = function () {
  // http://bootstrap-notify.remabledesigns.com
  var defaultSettings = {
    placement: {
      from: "bottom",
      align: "right"
    },
    animate: {
      enter: 'animate__animated animate__fadeInRight',
      exit: 'animate__animated animate__fadeOutRight'
    },
    delay: 3000,
    allow_dismiss: true,
    z_index: 1031 // {0} = type {1} = title {2} = message {3} = url {4} = target
    // template: `
    //     <div data-notify="container" class="col-xs-10 col-sm-3 alert alert-{0}" role="alert">
    //         <button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>
    //         <span data-notify="icon"></span>
    //         <span data-notify="title">{1}</span>
    //         <span data-notify="message">{2}</span>
    //         <div class="progress" data-notify="progressbar">
    //             <div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>
    //         </div>
    //         <a href="{3}" target="{4}" data-notify="url"></a>
    //     </div>`

  };
  $.notifyDefaults(defaultSettings);

  var doNotify = function doNotify(type, msg, settings) {
    if (!type || !msg) return; // full options: { icon, title, message, url, target }

    var options;

    if (_typeof(msg) === 'object' && (msg.message || msg.title)) {
      options = msg;
    } else if (_typeof(msg) === 'object') {
      options = JSON.stringify(msg);
    } else {
      options = {
        message: msg
      };
    }

    settings = settings || {};

    if (type === 'success') {
      $.notify(options, Object.assign({
        type: 'success'
      }, settings));
    } else if (type === 'info') {
      $.notify(options, Object.assign({
        type: 'info'
      }, settings));
    } else if (type === 'warning') {
      $.notify(options, Object.assign({
        type: 'warning'
      }, settings));
    } else if (type === 'danger') {
      $.notify(options, Object.assign({
        type: 'danger'
      }, settings));
    }
  };

  return {
    success: function success(msg, config) {
      doNotify('success', msg, config);
    },
    info: function info(msg, config) {
      doNotify('info', msg, config);
    },
    warning: function warning(msg, config) {
      doNotify('warning', msg, config);
    },
    danger: function danger(msg, config) {
      doNotify('danger', msg, config);
    }
  };
}(); // jquery - bootstrap 風格開關 - active
// use data-toggle="XXX" to toggle closest "active" class of data-role="XXX"


$('body').on('click', '[data-toggle]', function (e) {
  $(e.currentTarget).closest("[data-role=\"".concat($(e.currentTarget).attr('data-toggle'), "\"]")).toggleClass('active');
}); // jquery - bootstrap 風格 remove
// use data-remove="XXX" to remove closest data-role="XXX"

$('body').on('click', '[data-remove]', function (e) {
  $(e.currentTarget).closest("[data-role=\"".concat($(e.currentTarget).attr('data-remove'), "\"]")).remove();
});