const request = require('request');
const querystring = require('querystring');
const Longpoll = require('./lib/longpoll');
const API = require('./lib/api');
const File = require('./lib/file');

module.exports = class {
    /**
     * @param  {String} token - VK user or group token
     */
    constructor(token, version)
    {
        this._api = new API(token, version);
        this._longpoll = new Longpoll(this._api);
        this._file = new File(this._api);
    }

    get api() {
        return this._api.api;
    }

    get longpoll() {
        return this._longpoll;
    }

    get file() {
        return this._file;
    }
}
