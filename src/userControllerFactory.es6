/**
 *Created by py on 14/11/2016
 */
"use strict";
module.exports = (userService, kafkaService) =>{
    const userController = {};

    //@param: KafkaRequest - which is kafka message containing query in body.
    //@function: parses KafkaRequest; calls userService to find user data; sends response to Kafka
    userController.findOneAndUpdate = (kafkaRequest) => {
        // console.log(kafkaRequest);
        let query = userController.extractQuery(kafkaRequest);
        let profile = userController.extractProfile(kafkaRequest);
        let topic = userController.extractTopic(kafkaRequest);
        let requestId = userController.extractRequestId(kafkaRequest);
        userService.findOneAndUpdate(query, profile)
            .then(
                (result) => {
                    userController.send('user-find-one-and-update-response', {user: result, requestId: requestId});
                },
                (error) => {
                    userController.handleError('error updating user', error);
                }
            );
    };

    //@param: KafkaRequest - which is kafka message containing query in body.
    //@function: parses KafkaRequest; calls userService to find user data; sends response to Kafka
    userController.findOne = (kafkaRequest) => {
        let query = userController.extractQuery(kafkaRequest);
        let topic = userController.extractTopic(kafkaRequest);
        let requestId = userController.extractRequestId(kafkaRequest);
        userService.findOne(query)
            .then(
                (result) => {
                    userController.send('user-find-one-response', {user: result, requestId: requestId});
                },
                (error) => {
                    userController.handleError('error searching user' , error);
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

    userController.extractQuery = (kafkaRequest) => {
        let query = JSON.parse(kafkaRequest.value).query;
        if(query === undefined || query === null) {
            userController.handleError('query is empty', kafkaRequest);
        }
        else {
            return query;
        }
    };

    userController.extractProfile = (kafkaRequest) => {
        let profile = JSON.parse(kafkaRequest.value).profile;
        if(profile === undefined || profile === null) {
            userController.handleError('profile is empty', kafkaRequest);
        }
        else {
            return profile;
        }
    };

    userController.extractTopic = (kafkaRequest) => {
        // let topic = JSON.parse(kafkaRequest.topic);
        let topic = kafkaRequest.topic;

        if(topic === undefined || topic === null) {
            userController.handleError('topic is null', kafkaRequest);
        }
        else {
            return topic;
        }
    };

    userController.extractRequestId = (kafkaRequest) => {
        let requestId = JSON.parse(kafkaRequest.value).requestId;

        if(requestId === undefined || requestId === null) {
            userController.handleError('requestId is null', kafkaRequest);
        }
        else {
            return requestId;
        }
    };

    userController.handleError = (errorName, error) => {
        console.log(errorName);
        console.log(error);
        console.log('----------------');
    };

    return userController;
};