const axios = require('axios');
const FormData = require('form-data');
const config = require("../config/configRouter");

module.exports = {
    uploadFile: (file, projectName, fileType) => {
        let form = new FormData();
        form.append('uploadFile', file.buffer, file.originalname);

        return axios.post(`${ config.fileManagementApi }/api/file/upload?projectName=${ projectName }&fileType=${ fileType }`, form, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${ form._boundary }`
            }
        })
        .then(response => {
            return response.data
        })
    },
    listFiles: (projectName, fileType) => {
        return axios({
            method: 'POST',
            url: `${ config.fileManagementApi }/api/file/getPath`,
            data: {
                projectName: projectName,
                fileType: fileType
            }
        })
        .then(response => {
            return response.data
        })
    },
}