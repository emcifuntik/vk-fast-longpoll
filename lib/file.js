const request = require('request');
const mime = require('file-type');
const fs = require('fs');

module.exports = class {
    
    /**
     * @param  {Object} api - api object
     */
    constructor(api)
    {
        this._api = api;
    }
    /**
     * Upload photo to message server
     * @param  {string} file - path to file of url
     */
    uploadMessagesPhoto(file) {
        return new Promise((resolve,reject) => {
            if(file.indexOf('http://') == 0 || file.indexOf('https://') == 0)
            {
                request({
                    url: file,
                    encoding: null
                }, (err, res, body) => {
                    if(!err && res.statusCode == 200)
                    {
                        let fileName = file.split('/').pop();
                        let mimeType = mime(body);
                        if(!fileName.endsWith('.' + mimeType.ext))
                            fileName += '.' + mimeType.ext;
                        this._api.api.photos.getMessagesUploadServer().then((server) => {
                            let boundary = Math.round(Math.random()*1000000000).toString(32);
                            let req = request.post({
                                url: server.upload_url,
                                headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary },
                                json: true
                            }, (err, res, body) => {
                                console.log(body);
                                if(!err && res.statusCode == 200)
                                    this._api.api.photos.saveMessagesPhoto(body).then(resolve).catch(reject);
                                else if(err)
                                    reject(err);
                                else
                                    reject(res.statusCode);
                            });
                            req.write('--' + boundary + '\r\nContent-Disposition: form-data; name="photo"; filename="' + fileName + '"\r\nContent-Type: ' + mimeType.mime + '\r\n\r\n');
                            req.write(body);
                            req.write('\r\n--' + boundary + '--');
                            req.end();
                        });
                    }
                    else if(err)
                        reject(err);
                    else
                        reject(res.statusCode);
                });
            }
            else
            {
                let fileName = file.split('/').pop();
                let content = fs.readFileSync(file);
                let mimeType = mime(content);
                this._api.api.photos.getMessagesUploadServer().then((server) => {
                    let boundary = Math.round(Math.random()*1000000000).toString(32);
                    let req = request.post({
                        url: server.upload_url,
                        headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary },
                        json: true
                    }, (err, res, body) => {
                        if(!err && res.statusCode == 200)
                            this._api.api.photos.saveMessagesPhoto(body).then(resolve).catch(reject);
                        else if(err)
                            reject(err);
                        else
                            reject(res.statusCode);
                    });
                    req.write('--' + boundary + '\r\nContent-Disposition: form-data; name="photo"; filename="' + fileName + '"\r\nContent-Type: ' + mimeType + '\r\n\r\n');
                    req.write(content);
                    req.write('\r\n--' + boundary + '--');
                    req.end();
                });
            }
        });
    }
}