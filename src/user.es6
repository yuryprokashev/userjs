/**
 *Created by py on 14/11/2016
 */
'use strict';
const SERVICE_NAME = 'userjs';

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
const kafkaBusFactory = require('my-kafka').kafkaBusFactory;
const kafkaServiceFactory = require('my-kafka').kafkaServiceFactory;
const dbFactory = require('./dbFactory.es6');
const userServiceFactory = require('./userServiceFactory.es6');
const userControllerFactory = require('./userControllerFactory.es6');
const configFactory = require('./configFactory.es6');
const buildMongoConStr = require('./helpers/buildConnString.es6');

let kafkaBus,
    db;

let kafkaService,
    configService,
    userService;

let userCtrl;

let dbConfig,
    dbConnectStr,
    kafkaListeners;

// Instantiate app components
kafkaBus = kafkaBusFactory(kafkaHost, SERVICE_NAME);
kafkaService = kafkaServiceFactory(kafkaBus);

kafkaBus.producer.on('ready', ()=> {
    configService = configFactory(kafkaService);
    configService.on('ready', () => {
        dbConfig = configService.get(SERVICE_NAME).db;
        // console.log(dbConfig);

        dbConnectStr = buildMongoConStr(dbConfig);
        db = dbFactory(dbConnectStr);

        userService = userServiceFactory(db);
        userCtrl = userControllerFactory(userService, kafkaService);

        kafkaListeners = configService.get(SERVICE_NAME).kafkaListeners;
        console.log(kafkaListeners);

        kafkaService.subscribe(kafkaListeners.findOne, userCtrl.findOne);
        kafkaService.subscribe(kafkaListeners.findOneAndUpdate, userCtrl.findOneAndUpdate);

    });
});
