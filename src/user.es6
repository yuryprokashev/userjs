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

let bootstrapComponents,
    handleError;

bootstrapComponents = () => {
    configObject = configObjectFactory(SERVICE_NAME);
    configService = configServiceFactory(configObject);
    configCtrl = configCtrlFactory(configService, kafkaService);

    configCtrl.on('ready', () => {
        dbConfig = configService.read(`${SERVICE_NAME}.db`);
        dbConnectStr = buildMongoConStr(dbConfig);
        db = dbFactory(dbConnectStr);

        userService = userServiceFactory(db);
        userCtrl = userCtrlFactory(userService, configService, kafkaService);

    });

    configCtrl.on('error', (args) => {
        handleError(args);
    })
};

handleError = (err) => {
    //TODO. Implement centralized error logging.
    console.log(err);
};

// Instantiate app components
kafkaBus = kafkaBusFactory(kafkaHost, SERVICE_NAME);
kafkaService = kafkaServiceFactory(kafkaBus);

kafkaBus.producer.on('ready', bootstrapComponents);

