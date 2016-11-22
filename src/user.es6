/**
 *Created by py on 14/11/2016
 */
'use strict';
const KAFKA_TEST = "54.154.211.165";
const KAFKA_PROD = "54.154.226.55";
const parseProcessArgs = require('./parseProcessArgs.es6');
let args = parseProcessArgs();
let kafkaHost = (function(bool){
    let result = bool ? KAFKA_PROD : KAFKA_TEST;
    console.log(result);
    return result;
})(args[0].isProd);

// Load factory modules
const dbFactory = require('./dbFactory.es6');
const userServiceFactory = require('./userServiceFactory.es6');
const userControllerFactory = require('./userControllerFactory.es6');
const kafkaServiceFactory = require('./kafkaServiceFactory.es6');
const kafkaBusFactory = require('./kafkaBusFactory.es6');

// Instantiate app components
const db = dbFactory("mongodb://localhost:27017/pfin");
const kafkaBus = kafkaBusFactory(kafkaHost, 'User-Service');

// kafkaBus.producer.on('ready', () => {
//     const userService = userServiceFactory(db);
//     const kafkaService = kafkaServiceFactory(kafkaBus);
//     const userController = userControllerFactory(userService, kafkaService);
//     userController.subscribe('user-find-one-request', userController.findOne);
//     userController.subscribe('user-find-one-and-update-request', userController.findOneAndUpdate);
//     userController.subscribe('user-find-one-response', userController.getFindOneResponse);
// });

const userService = userServiceFactory(db);
const kafkaService = kafkaServiceFactory(kafkaBus);
const userController = userControllerFactory(userService, kafkaService);
userController.subscribe('user-find-one-request', userController.findOne);
userController.subscribe('user-find-one-and-update-request', userController.findOneAndUpdate);
// userController.subscribe('user-find-one-response', userController.getFindOneResponse);

