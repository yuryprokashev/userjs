/**
 *Created by py on 14/11/2016
 */
"use strict";
module.exports = (userService, kafkaService) =>{
    const userController = {};

    //@param: KafkaRequest - which is kafka message containing query in body.
    //@function: parses KafkaRequest; calls userService to find user data; sends response to Kafka
    userController.findOneAndUpdate = (kafkaRequest) => {
        
        let context, query, profile;

        context = userController.extractContext(kafkaRequest);
        query = userController.extractQuery(kafkaRequest);
        profile = userController.extractWriteData(kafkaRequest);

        userService.findOneAndUpdate(query, profile)
            .then(
                (result) => {
                    context.response = result;
                    kafkaService.send('user-find-one-and-update-response', context);
                },
                (error) => {
                    context.response = error;
                    kafkaService.send('user-find-one-and-update-response', context);
                }
            );
    };

    //@param: KafkaRequest - which is kafka message containing query in body.
    //@function: parses KafkaRequest; calls userService to find user data; sends response to Kafka
    userController.findOne = (kafkaRequest) => {
        let context, query;

        query = userController.extractQuery(kafkaRequest);
        context = userController.extractContext(kafkaRequest);

        userService.findOne(query)
            .then(
                (result) => {
                    context.response = result;
                    kafkaService.send('user-find-one-response', context);
                },
                (error) => {
                    console.log(error);
                    context.response = error;
                    kafkaService.send('user-find-one-response', context);
                }
            )
    };

    //@param: topic - kafka topic, where controller has to send the response
    //@param: response - object that will be packed in kafka message.
    userController.send = (topic, response) => {
        kafkaService.send(topic, response);
    };

    //@param: topic - kafka topic, which controller is listening
    //@callback: function that will be executed, when message will arrive
    userController.subscribe = (topic, callback) => {
        kafkaService.subscribe(topic, callback);
    };

    userController.extractContext = (kafkaMessage) => {
        let context;
        context = JSON.parse(kafkaMessage.value);
        if(context === undefined) {
            let newContext = {};
            newContext.response = {error: 'arrived context is empty'};
            kafkaService.send(kafkaMessage.topic, newContext);
        }
        return context;
    };

    userController.extractQuery = (kafkaRequest) => {
        let query = JSON.parse(kafkaRequest.value).request.query;
        if(query === undefined || query === null) {
            let context;
            context = userController.extractContext(kafkaRequest);
            context.response = {error: 'query is empty'};
            kafkaService.send(kafkaRequest.topic, context);
        }
        else {
            return query;
        }
    };

    userController.extractWriteData = (kafkaRequest) => {
        let profile = JSON.parse(kafkaRequest.value).request.writeData;
        if(profile === undefined || profile === null) {
            let context;
            context = userController.extractContext(kafkaRequest);
            context.response = {error: 'profile is empty'};
            kafkaService.send(kafkaRequest.topic, context);
        }
        else {
            return profile;
        }
    };

    return userController;
};