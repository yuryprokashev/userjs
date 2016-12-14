/**
 *Created by py on 14/11/2016
 */
"use strict";
module.exports = (userService, kafkaService) =>{
    const userController = {};

    //@param: KafkaRequest - which is kafka message containing query in body.
    //@function: parses KafkaRequest; calls userService to find user data; sends response to Kafka
    userController.findOneAndUpdate = (kafkaMessage) => {
        
        let context, query, profile;

        context = userController.extractContext(kafkaMessage);
        query = userController.extractQuery(kafkaMessage);
        profile = userController.extractWriteData(kafkaMessage);

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
    userController.findOne = (kafkaMessage) => {
        // console.log(kafkaMessage);
        let context, query;

        query = userController.extractQuery(kafkaMessage);
        context = userController.extractContext(kafkaMessage);

        userService.findOne(query)
            .then(
                (result) => {
                    // console.log(JSON.stringify(result));
                    context.response = result;
                    kafkaService.send('user-find-one-response', context);
                },
                (error) => {
                    // console.log(JSON.stringify(error));
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

    userController.extractQuery = (kafkaMessage) => {
        let query = JSON.parse(kafkaMessage.value).request.query;
        if(query === undefined || query === null) {
            let context;
            context = userController.extractContext(kafkaMessage);
            context.response = {error: 'query is empty'};
            kafkaService.send(kafkaMessage.topic, context);
        }
        else {
            return query;
        }
    };

    userController.extractWriteData = (kafkaMessage) => {
        let profile = JSON.parse(kafkaMessage.value).request.writeData;
        if(profile === undefined || profile === null) {
            let context;
            context = userController.extractContext(kafkaMessage);
            context.response = {error: 'profile is empty'};
            kafkaService.send(kafkaMessage.topic, context);
        }
        else {
            return profile;
        }
    };

    return userController;
};