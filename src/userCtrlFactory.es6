/**
 *Created by py on 14/11/2016
 */
"use strict";
module.exports = (userService, kafkaService) =>{

    const extractContext = (kafkaMessage) => {
        let context;
        context = JSON.parse(kafkaMessage.value);
        if(context === undefined) {
            let newContext = {};
            newContext.response = {error: 'arrived context is empty'};
            kafkaService.send(makeResponseTopic(kafkaMessage), newContext);
        }
        return context;
    };

    const extractQuery = (kafkaMessage) => {
        let query = JSON.parse(kafkaMessage.value).request.query;
        if(query === undefined || query === null) {
            let context;
            context = extractContext(kafkaMessage);
            context.response = {error: 'query is empty'};
            kafkaService.send(makeResponseTopic(kafkaMessage), context);
        }
        else {
            return query;
        }
    };

    const extractWriteData =(kafkaMessage) => {
        let profile = JSON.parse(kafkaMessage.value).request.writeData;
        if(profile === undefined || profile === null) {
            let context;
            context = extractContext(kafkaMessage);
            context.response = {error: 'profile is empty'};
            kafkaService.send(makeResponseTopic(kafkaMessage), context);
        }
        else {
            return profile;
        }
    };

    const makeResponseTopic = (kafkaMessage) => {
        let re = /-request/;
        return kafkaMessage.topic.replace(re, '-response');
    };
    const userController = {};

    //@param: KafkaRequest - which is kafka message containing query in body.
    //@function: parses KafkaRequest; calls userService to find user data; sends response to Kafka
    userController.findOneAndUpdate = (kafkaMessage) => {
        
        let context, query, profile;

        context = extractContext(kafkaMessage);
        query = extractQuery(kafkaMessage);
        profile = extractWriteData(kafkaMessage);

        userService.findOneAndUpdate(query, profile)
            .then(
                (result) => {
                    context.response = result;
                    kafkaService.send(makeResponseTopic(kafkaMessage), context);
                },
                (error) => {
                    context.response = error;
                    kafkaService.send(makeResponseTopic(kafkaMessage), context);
                }
            );
    };

    //@param: KafkaRequest - which is kafka message containing query in body.
    //@function: parses KafkaRequest; calls userService to find user data; sends response to Kafka
    userController.findOne = (kafkaMessage) => {
        let context, query;

        context = extractContext(kafkaMessage);
        query = extractQuery(kafkaMessage);

        userService.findOne(query)
            .then(
                (result) => {
                    // console.log(JSON.stringify(result));
                    context.response = result;
                    kafkaService.send(makeResponseTopic(kafkaMessage), context);
                },
                (error) => {
                    // console.log(JSON.stringify(error));
                    context.response = error;
                    kafkaService.send(makeResponseTopic(kafkaMessage), context);
                }
            )
    };

    return userController;
};