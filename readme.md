# vk-fast-longpoll
> RU | Мощный инструмент для работы с VK API, который работает в 25 раз быстрее обычных вызовов API методов.

> EN | Powerfull tool for VK api that works 25 times faster then usual api calls

[![NPM version](https://img.shields.io/npm/v/vk-fast-longpoll.svg)](https://www.npmjs.com/package/vk-fast-longpoll)
[![NPM downloads](https://img.shields.io/npm/dt/vk-fast-longpoll.svg)](https://www.npmjs.com/package/vk-fast-longpoll)

# Русский
## Установка и начало работы
### Установка
```shell
npm install vk-io --save
```
### Инициализация
```javascript
const VK = require('vk-fast-longpoll');
const group = new VK('token here');
```
### Запуск longpoll соединения
```javascript
group.longpoll.start();
```
### Начинаем слушать сообщения
```javascript
group.longpoll.on('message', (message) => {
    if(!message.isOutbox)
    {
        //Отвечаем на сообщение
    }
});
```
### Вызов API методов
Все методы VK должны вызываться с префиксом api например
```javascript
group.api.messages.send({user_id: 1, message: 'Привет, Паша'});
```
Методы возвращают Promise-ы, поэтому стоит добавлять обработчик ошибок к каждому вызову.
```javascript
group.api.messages.send({user_id: 1, message: 'Привет, Паша'}).catch(console.error);
```
Все названия методов, а также названия полей полностью соответсвуют названиям из [документации VK](https://vk.com/dev/methods)

### Echo пример
```javascript
const VK = require('vk-fast-longpoll');
const group = new VK('token here');

group.longpoll.start();

group.longpoll.on('message', (message) => {
    if(!message.isOutbox)
    {
        group.api.messages.send({user_id: message.sender, message: message.text}).then(() => {
            console.log(message.text);
        }).catch(console.error);
    }
});
```

### Загрузка файлов
```javascript
//В разработке
```

# English
## Installing and getting started
### Installing
```shell
npm install vk-io --save
```
### Initializing
```javascript
const VK = require('vk-fast-longpoll');
const group = new VK('token here');
```
### Longpoll connection start
```javascript
group.longpoll.start();
```
### Listen to messages
```javascript
group.longpoll.on('message', (message) => {
    if(!message.isOutbox)
    {
        //Reply message
    }
});
```
### API method calls
All VK Api methods must be called with `api` prefix
```javascript
group.api.messages.send({user_id: 1, message: 'Hello, Pasha'});
```
All methods return Promises, therefor you need to catch errors in every api call.
```javascript
group.api.messages.send({user_id: 1, message: 'Hello, Pasha'}).catch(console.error);
```
All methods names and fields names are equal as [VK Api docs](https://vk.com/dev/methods)

### Echo example
```javascript
const VK = require('vk-fast-longpoll');
const group = new VK('token here');

group.longpoll.start();

group.longpoll.on('message', (message) => {
    if(!message.isOutbox)
    {
        group.api.messages.send({user_id: message.sender, message: message.text}).then(() => {
            console.log(message.text);
        }).catch(console.error);
    }
});
```

### File uploading
```javascript
//In development
```
