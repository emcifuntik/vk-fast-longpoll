const methods = require('./methods');
const Promise = require('bluebird');
const request = require('request');
const fs = require('fs');
const util = require('util');
const winston = require('winston');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './api.log' })
    ]
});

module.exports = class {
    constructor(token, version)
    {
        this._token = token;
        this._version = version?version:'5.62';
        this._direct = false;
        this._api = [];
        this._queue = [];
        this._time = 220;
        this._callsCount = 25;

        let _apiCall = (method, params = {}, filters = '') => {
            return new Promise((resolve, reject) => {
                if(!this._direct) {
                    this._queue.push({
                        method,
                        params,
                        filters,
                        resolve,
                        reject
                    });
                }
                else {
                    console.log(params);
                    request({
                        url: 'https://api.vk.com/method/' + method,
                        method: 'POST',
                        qs: {
                            access_token: this._token,
                            v: this._version
                        },
                        form: params,
                        json: true
                    }, (err, res, body) => {
                        if(err) {
                            reject(err);
                        }
                        else {
                            resolve(body.response);
                        }
                    })
                }
            });
        };

        methods.forEach((method) => {
            let [group,name] = method.split('.');
            this._api[group] = this._api[group] || {};
            this._api[group][name] = (params,filters = '') => {
                return _apiCall(method,params,filters);
            };
        });

        this._executeLoop = (self) => {
            if(!self) self = this;
            if(self._queue.length)
            {
                let count = self._queue.length;
                if(count > this._callsCount)
                    count = this._callsCount;
                let apiCalls = [];
                let current = self._queue.splice(0, count);
                for(let i in current)
                    apiCalls.push('API.' + current[i].method + '(' + JSON.stringify(current[i].params) + ')' + current[i].filters);
                let code = 'return [\r\n' + apiCalls.join(',\r\n') + '\r\n];';
                let executeHandler = (current, err, res, body) => {
                    if(err)
                    {
                        for(let i in current)
                            this._queue.unshift(current[i]);
                        setTimeout(this._executeLoop, this._time);
                        return;
                    }
                    if(res.statusCode != 200)
                    {
                        if(res.statusCode == 413)
                        {
                            logger.error(code);
                            if(this._callsCount > 10)
                                this._callsCount--;
                            else if(this._callsCount < 0)
                                this._callsCount = 25;
                            logger.error('API execute calls was decreased to ' + this._callsCount + ' due to big request body');
                            setTimeout(this._executeLoop, this._time);
                            //Жду ответа от ВК по поводу этой ошибки
                            return;
                        }
                        else
                            logger.error(res.statusCode + ' | ' + res.statusMessage);
                        for(let i in current)
                            this._queue.unshift(current[i]);
                        setTimeout(this._executeLoop, this._time);
                        return;
                    }
                    if('error' in body)
                    {
                        if(body.error.error_code == 6)
                        {
                            for(let i in current)
                                this._queue.unshift(current[i]);
                            setTimeout(this._executeLoop, this._time);
                        }
                        else if(body.error.error_code == 13)
                        {
                            logger.error(code);
                            logger.error(body);
                            setTimeout(this._executeLoop, this._time);
                        }
                        else
                        {
                            logger.error(body.error);
                            setTimeout(this._executeLoop, this._time);
                        }
                    }
                    else if('response' in body)
                    {
                        let err_nr = 0;
                        for(let i in body.response)
                        {
                            if(body.response[i] === false)
                                current[i].reject(body.execute_errors[err_nr++]);
                            else
                                current[i].resolve(body.response[i]);
                        }
                        setTimeout(this._executeLoop, this._time);
                    }
                }
                request({
                    url: 'https://api.vk.com/method/execute',
                    timeout: 20e3,
                    qs: {
                        v: self._version,
                        access_token: self._token
                    },
                    method: 'POST',
                    json: true,
                    form: { code: code }
                }, executeHandler.bind(this, current));
            }
            else
                setTimeout(self._executeLoop, self._time);
        };
        process.nextTick(this._executeLoop, this);
    }

    get api() {
        return this._api;
    }
}

