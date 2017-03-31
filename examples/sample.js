const VK = require('../');
const html = require('html-entities').XmlEntities;

const group = new VK('api key here');
group.longpoll.start();

group.longpoll.on('message', (message) => {
    if(!message.isOutbox)
    {
        group.api.messages.send({
            user_id: message.sender, 
            message: html.decode(message.text)
        });
    }
})