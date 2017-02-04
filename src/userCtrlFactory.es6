/**
 *Created by py on 14/11/2016
 */
"use strict";
module.exports = (userService, configService, kafkaService) =>{

    let userController = {};

    let kafkaListeners,
        isSignedMessage;

    let findOneAndUpdate,
        findOne;

    findOneAndUpdate = kafkaMessage => {
        
        let context, query, profile;

        let signRequest, topic;

        signRequest = false;
        topic = kafkaService.makeResponseTopic(kafkaMessage);

        context = kafkaService.extractContext(kafkaMessage);
        query = kafkaService.extractQuery(kafkaMessage);
        profile = kafkaService.extractWriteData(kafkaMessage);

        userService.findOneAndUpdate(query, profile)
            .then(
                (result) => {

                    context.response = result;
                    kafkaService.send(topic, signRequest, context);
                },
                (error) => {
                    context.response = error;
                    kafkaService.send(topic, signRequest, context);
                }
            );
    };

    findOne = kafkaMessage => {
        let context, query;
        let signRequest, topic;

        signRequest = false;
        topic = kafkaService.makeResponseTopic(kafkaMessage);

        context = extractContext(kafkaMessage);
        query = extractQuery(kafkaMessage);

        userService.findOne(query)
            .then(
                (result) => {
                    // console.log(JSON.stringify(result));
                    context.response = result;
                    kafkaService.send(topic, signRequest, context);
                },
                (error) => {
                    // console.log(JSON.stringify(error));
                    context.response = error;
                    kafkaService.send(topic, signRequest, context);
                }
            )
    };

    kafkaListeners = configService.read('userjs.kafkaListeners');
    isSignedMessage = false;
    if(kafkaListeners !== undefined) {
        kafkaService.subscribe(kafkaListeners.findOne, isSignedMessage, findOne);
        kafkaService.subscribe(kafkaListeners.findOneAndUpdate, isSignedMessage, findOneAndUpdate);
    }

    return userController;
};