class FileLoader {
    constructor (file, type) {
        this.file = file;
        this.validTypes = (type && Array.isArray(type)) ? type : 
                        (type && typeof(type) == 'string') ? [type] : [];
    }
    // upload
    setfile(file) {
        this.file = file;
    }
    validTypes(type) {
        this.validTypes = (type && Array.isArray(type)) ? type : 
                        (type && typeof(type) == 'string') ? [type] : [];
    }
    validFile() {
        if(!this.file) {
            throw new Error('no file to validate');
        }
        let extension = this.file.name.split('.').pop().toLowerCase();

        if(!this.validTypes || this.validTypes.indexOf(extension) < 0){
            return false;
        }else{
            return true;
        }
    }
    readFile(){
        let _this = this;
        return new Promise((resolve, reject) => {
            if(!_this.validFile()) reject('file type not allowed');

            let reader = new FileReader();

            reader.onload = function(e) {
                let csv = e.target.result;
                resolve(csv);
            };

            reader.onerror = function(error) {
                reject(error);
            };

            reader.readAsText(_this.file, 'UTF-8');
        });
    }

    // download
    download(data, extension, filename) {
        let allowedFileTypes = ['txt', 'csv', 'json'];
        if(allowedFileTypes.indexOf(extension)<0) return false;

        let typeCorr = {
            txt: 'plain',
            csv: 'csv',
            json: 'json'
        }

        var blobdata = new Blob(['\uFEFF' + data], { type : `text/${ typeCorr[extension] };charset=utf-8` });
        var link = document.createElement("a");
        link.setAttribute("href", window.URL.createObjectURL(blobdata));
        link.setAttribute("download", `${ filename ? (filename + '-') : '' }${ new Date(Date.now() + 28800000).toISOString().replace('T', ' ').replace('Z', '') }.${ extension }`);
        link.click();
        return true;
    }
}

// read excel
function _ExcelToJSON(file, callback) {
    let reader = new FileReader();

    reader.onload = function(e) {
        let data = this.result;

        console.log(data)

        // var workbook = XLSX.read(data, {
        // 	type: 'binary'
        // });

        // workbook.SheetNames.forEach(function(sheetName) {
        // 	// Here is your object
        // 	var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        // 	var json_object = JSON.stringify(XL_row_object);
        // 	console.log(json_object);
        // })
    };

    reader.onerror = function(ex) {
        console.log(ex);
    };

    reader.readAsText(file, 'ISO-8859-4');
};

// read utf-8 csv file
function readCSV(file) {

    let reader = new FileReader();

    reader.onload = function(e) {
        let csv = e.target.result;
        console.log(csv)
    };

    reader.onerror = function(error) {
        console.error(error);
    };

    reader.readAsText(file, 'UTF-8');
}