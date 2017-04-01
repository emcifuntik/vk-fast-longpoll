const request = require('request');
const querystring = require('querystring');
const Promise = require('bluebird');
const Message = require('./message');
const fs = require('fs');
const util = require('util');
const winston = require('winston');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './longpoll.log' })
    ]
});

module.exports = class {
    constructor(api)
    {
        this._lpi = {};
        this._api = api;
        this._lpStarted = false;
        this._callback = {
            flagsChange: [],//1
            flagsInstall: [],//2
            flagsRemove: [],//3
            message: [],//4
            incomingRead: [],//6
            outboxRead: [],//7
            friendOnline: [],//8
            friendOffline: [],//9
            dialogFlagsRemove: [],//10
            dialogFlagsChange: [],//11
            dialogFlagsInstall: [],//12
            dialogCaptionChange: [],//51
            userTyping: [],//61
            userStartTyping: [],//62
            userCall: [],//70
            unreadCountChange: [],//80
            notificationSettingsChange: []//114
        }
    }
    /**
     * Starts longpoll listening
     */
    start()
    {
        this._api.api.messages.getLongPollServer({
            use_ssl: 1,
            need_pts: 0
        }).then((longPoll) => {
            this._lpi = {
                server: longPoll.server,
                key: longPoll.key
            };
            if(!this._lpStarted)
                this._lpi.ts = longPoll.ts;
            process.nextTick(this.listen.bind(this));
            this._lpStarted = true;
        }).catch((error) => {
            logger.error(error);
            process.nextTick(this.start.bind(this));
        });
    }

    listen() {
        request({
            url: 'https://' + this._lpi.server,
            timeout: 20e3,
            json: true,
            qs: {
                ts: this._lpi.ts,
                key: this._lpi.key,
                act: 'a_check',
                wait: 15,
                version: '1',
                mode: '2'
            }
        }, (err, res, body) => {
            if(err)
            {
                logger.error(err);
                process.nextTick(this.start.bind(this));
                return;
            }
            if(res.statusCode != 200)
            {
                logger.error(res.statusCode + ' | ' + res.statusMessage);
                process.nextTick(this.start.bind(this));
                return;
            }
            if('failed' in body)
            {
                switch(parseInt(body.failed))
                {
                    case 1:
                        this._lpi.ts = body.ts;
                        process.nextTick(this.listen.bind(this));
                        break;
                    case 2:
                        process.nextTick(this.start.bind(this));
                        break;
                    case 3:
                        this._lpStarted = false;
                        process.nextTick(this.start.bind(this));
                        break;
                    case 4:
                        logger.error('Передан недопустимый номер версии в параметре version');
                        break;
                    default:
                        logger.error(body);
                        break;
                }
                return;
            }
            this._lpi.ts = body.ts;
            if('updates' in body)
                for(let i in body.updates)
                    process.nextTick(this.update.bind(this), body.updates[i]);
            process.nextTick(this.listen.bind(this));
        });
    }

    update(data, self)
    {
        if(!self) self = this;
        switch(data[0])
        {
            case 1://Flags changed
            {
                break;
            }
            case 2://Flags installed
            {
                break;
            }
            case 3://Flags removed
            {
                break;
            }
            case 4://New message
            {
                for(let i in self._callback.message)
                    process.nextTick(self._callback.message[i], new Message(data[1], data[2], data[3], data[4], data[5], data[6], (data[7] != undefined) ? (data[7]) : []));
                break;
            }
        }
    }
    /**
     * Bind function to event
     * @param  {string} event - event name
     * @param  {function} callback
     */
    on(event, callback)
    {
        switch(event)
        {
            case 'flagschange':
            {
                this._callback.flagsChange.push(callback);
                break;
            }
            case 'flagsinstall':
            {
                this._callback.flagsInstall.push(callback);
                break;
            }
            case 'flagsremove':
            {
                this._callback.flagsRemove.push(callback);
                break;
            }
            case 'message':
            {
                this._callback.message.push(callback);
                break;
            }
            case 'incomingread':
            {
                this._callback.incomingRead.push(callback);
                break;
            }
            case 'outboxread':
            {
                this._callback.outboxRead.push(callback);
                break;
            }
            case 'friendonline':
            {
                this._callback.friendOnline.push(callback);
                break;
            }
            case 'friendoffline':
            {
                this._callback.friendOffline.push(callback);
                break;
            }
            case 'dialogflagsremove':
            {
                this._callback.dialogFlagsRemove.push(callback);
                break;
            }
            case 'dialogflagschange':
            {
                this._callback.dialogFlagsChange.push(callback);
                break;
            }
            case 'dialogflagsinstall':
            {
                this._callback.dialogFlagsInstall.push(callback);
                break;
            }
            case 'dialogcaptionchange':
            {
                this._callback.dialogCaptionChange.push(callback);
                break;
            }
            case 'usertyping':
            {
                this._callback.userTyping.push(callback);
                break;
            }
            case 'userstarttyping':
            {
                this._callback.userStartTyping.push(callback);
                break;
            }
            case 'usercall':
            {
                this._callback.userCall.push(callback);
                break;
            }
            case 'unreadcountchange':
            {
                this._callback.unreadCountChange.push(callback);
                break;
            }
            case 'notificationsettingschange':
            {
                this._callback.notificationSettingsChange.push(callback);
                break;
            }
        }
    }
}

    