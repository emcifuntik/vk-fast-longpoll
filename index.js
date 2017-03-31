'use strict';
const request = require('request');
const querystring = require('querystring');
const Longpoll = require('./lib/longpoll');
const API = require('./lib/api');


module.exports = class {
    constructor(token)
    {
        this._api = new API(token);
        this._longpoll = new Longpoll(this._api);
    }

    get api() {
        return this._api.api;
    }

    get longpoll() {
        return this._longpoll;
    }
}
