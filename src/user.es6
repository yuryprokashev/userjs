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
const EventEmitter = require('events').EventEmitter;

const dbFactory = require('./dbFactory.es6');
const kafkaBusFactory = require('my-kafka').kafkaBusFactory;
const kafkaServiceFactory = require('my-kafka').kafkaServiceFactory;

const configObjectFactory = require('my-config').configObjectFactory;
const configServiceFactory = require('my-config').configServiceFactory;
const configCtrlFactory = require('my-config').configCtrlFactory;


const userServiceFactory = require('./userServiceFactory.es6');
const userCtrlFactory = require('./userCtrlFactory.es6');
const buildMongoConStr = require('./helpers/buildConnString.es6');

let kafkaBus,
    db,
    configObject;

let kafkaService,
    configService,
    userService;

let userCtrl,
    configCtrl;

let dbConfig,
    dbConnectStr;

let bootstrapComponents;

bootstrapComponents = () => {
    configObject = configObjectFactory(SERVICE_NAME, EventEmitter);
    configService = configServiceFactory(configObject, EventEmitter);
    configCtrl = configCtrlFactory(configService, kafkaService, EventEmitter);

    // loggerAgent.listenLoggerEventsIn([configCtrl, configService, configObject]);

    configCtrl.start();

    configCtrl.on('ready', () => {
        dbConfig = configService.read(`${SERVICE_NAME}.db`);
        dbConnectStr = buildMongoConStr(dbConfig);
        db = dbFactory(dbConnectStr, EventEmitter);

        userService = userServiceFactory(db, EventEmitter);
        userCtrl = userCtrlFactory(userService, configService, kafkaService, EventEmitter);
        userCtrl.start();

    });
};

// Instantiate app components
kafkaBus = kafkaBusFactory(kafkaHost, SERVICE_NAME, EventEmitter);
kafkaService = kafkaServiceFactory(kafkaBus, EventEmitter);

kafkaBus.producer.on('ready', bootstrapComponents);

