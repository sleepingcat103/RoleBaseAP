"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FileLoader = /*#__PURE__*/function () {
  function FileLoader(file, type) {
    _classCallCheck(this, FileLoader);

    this.file = file;
    this.validTypes = type && Array.isArray(type) ? type : type && typeof type == 'string' ? [type] : [];
  } // upload


  _createClass(FileLoader, [{
    key: "setfile",
    value: function setfile(file) {
      this.file = file;
    }
  }, {
    key: "validTypes",
    value: function validTypes(type) {
      this.validTypes = type && Array.isArray(type) ? type : type && typeof type == 'string' ? [type] : [];
    }
  }, {
    key: "validFile",
    value: function validFile() {
      if (!this.file) {
        throw new Error('no file to validate');
      }

      var extension = this.file.name.split('.').pop().toLowerCase();

      if (!this.validTypes || this.validTypes.indexOf(extension) < 0) {
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: "readFile",
    value: function readFile() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (!_this.validFile()) reject('file type not allowed');
        var reader = new FileReader();

        reader.onload = function (e) {
          var csv = e.target.result;
          resolve(csv);
        };

        reader.onerror = function (error) {
          reject(error);
        };

        reader.readAsText(_this.file, 'UTF-8');
      });
    } // download

  }, {
    key: "download",
    value: function download(data, extension, filename) {
      var allowedFileTypes = ['txt', 'csv', 'json'];
      if (allowedFileTypes.indexOf(extension) < 0) return false;
      var typeCorr = {
        txt: 'plain',
        csv: 'csv',
        json: 'json'
      };
      var blobdata = new Blob(["\uFEFF" + data], {
        type: "text/".concat(typeCorr[extension], ";charset=utf-8")
      });
      var link = document.createElement("a");
      link.setAttribute("href", window.URL.createObjectURL(blobdata));
      link.setAttribute("download", "".concat(filename ? filename + '-' : '').concat(new Date(Date.now() + 28800000).toISOString().replace('T', ' ').replace('Z', ''), ".").concat(extension));
      link.click();
      return true;
    }
  }]);

  return FileLoader;
}(); // read excel


function _ExcelToJSON(file, callback) {
  var reader = new FileReader();

  reader.onload = function (e) {
    var data = this.result;
    console.log(data); // var workbook = XLSX.read(data, {
    // 	type: 'binary'
    // });
    // workbook.SheetNames.forEach(function(sheetName) {
    // 	// Here is your object
    // 	var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    // 	var json_object = JSON.stringify(XL_row_object);
    // 	console.log(json_object);
    // })
  };

  reader.onerror = function (ex) {
    console.log(ex);
  };

  reader.readAsText(file, 'ISO-8859-4');
}

; // read utf-8 csv file

function readCSV(file) {
  var reader = new FileReader();

  reader.onload = function (e) {
    var csv = e.target.result;
    console.log(csv);
  };

  reader.onerror = function (error) {
    console.error(error);
  };

  reader.readAsText(file, 'UTF-8');
}