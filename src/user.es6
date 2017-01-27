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

const configObjectFactory = require('my-config').configObjectFactory;
const configServiceFactory = require('my-config').configServiceFactory;
const configCtrlFactory = require('my-config').configCtrlFactory;

const dbFactory = require('./dbFactory.es6');
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
    dbConnectStr,
    kafkaListeners;

// Instantiate app components
kafkaBus = kafkaBusFactory(kafkaHost, SERVICE_NAME);
kafkaService = kafkaServiceFactory(kafkaBus);

kafkaBus.producer.on('ready', ()=> {

    configObject = configObjectFactory(SERVICE_NAME);
    configObject.init().then(
        (config) => {
            configService = configServiceFactory(config);
            configCtrl = configCtrlFactory(configService, kafkaService);
            kafkaService.subscribe('get-config-response', configCtrl.writeConfig);
            kafkaService.send('get-config-request', configObject);
            configCtrl.on('ready', () => {
                dbConfig = configService.read(SERVICE_NAME, 'db');
                dbConnectStr = buildMongoConStr(dbConfig);
                db = dbFactory(dbConnectStr);

                userService = userServiceFactory(db);
                userCtrl = userCtrlFactory(userService, kafkaService);

                kafkaListeners = configService.read(SERVICE_NAME, 'kafkaListeners');

                kafkaService.subscribe(kafkaListeners.findOne, userCtrl.findOne);
                kafkaService.subscribe(kafkaListeners.findOneAndUpdate, userCtrl.findOneAndUpdate);
            });
            configCtrl.on('error', (args) => {
                console.log(args);
            });
        },
        (err) => {
            console.log(`ConfigObject Promise rejected ${JSON.stringify(err.error)}`);
        }
    );
});

