const VK = require('../');
const html = require('html-entities').XmlEntities;
const config = require('./config');

const group = new VK(config.token);
group.longpoll.start();

group.longpoll.on('message', (message) => {
    if(!message.isOutbox)
    {
        group.api.messages.send({
            user_id: message.sender, 
            message: html.decode(message.text)
        });
    }
});

group.file.uploadMessagesPhoto('http://placehold.it/350x150').then((ph) => {
    console.log(ph);
}).catch(console.error);
