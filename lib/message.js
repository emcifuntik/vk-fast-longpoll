'use strict';

let Attachment = class {
    constructor(type, owner, id) {
        this._type = type;
        this._owner = owner;
        this._id = id;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    get owner() {
        return this._owner;
    }

    get ref() {
        return this._type + this._owner + '_' + this._id;
    }
}

module.exports = class {

    constructor(id, flags, sender, timestamp, subject, text, attachments) {
        this._id = id;
        this._flags = flags;
        this._timestamp = timestamp;
        this._subject = subject;
        this._sender = sender;
        this._text = text;
        this._attachments = [];
        for (let i in attachments) {
            if (/attach(\d)\b/.test(i)) {
                let nr = parseInt(i.substring(6));
                let attach = attachments['attach' + nr].split('_');
                this._attachments.push(new Attachment(attachments['attach' + nr + '_type'], attach[0], attach[1]));
            } else if (i == 'geo')
                this._attachments.push(new Attachment('geo', attachments['geo_provider'], attachments['geo']));
        }
    }

    get sender() {
        return this._sender;
    }
    get id() {
        return this._id;
    }
    get timestamp() {
        return this._timestamp;
    }
    get subject() {
        return this._subject;
    }
    get text() {
        return this._text;
    }
    get attachments() {
        return this._attachments;
    }
    get isUnread() {
        return (this._flags & 1) == 1;
    }
    get isOutbox() {
        return (this._flags & 2) == 2;
    }
    get isReplied() {
        return (this._flags & 4) == 4;
    }
    get isImportant() {
        return (this._flags & 8) == 8;
    }
    get isChat() {
        return (this._flags & 16) == 16;
    }
    get isFriends() {
        return (this._flags & 32) == 32;
    }
    get isSpam() {
        return (this._flags & 64) == 64;
    }
    get isDeleted() {
        return (this._flags & 128) == 128;
    }
    get isFixed() {
        return (this._flags & 256) == 256;
    }
    get isMedia() {
        return (this._flags & 512) == 512;
    }
}