/**
 *Created by py on 14/11/2016
 */
"use strict";
module.exports = (userService, configService, kafkaService, EventEmitter) =>{

    let userController = new EventEmitter();

    let kafkaListeners;

    let findOneAndUpdate,
        findOne;

    findOneAndUpdate = kafkaMessage => {
        
        let context, query, profile;

        let topic;

        context = kafkaService.extractContext(kafkaMessage);
        if(context.error !== undefined) {console.error(context.error)}

        query = kafkaService.extractQuery(kafkaMessage);
        if(query.error !== undefined) {console.error(query.error)}

        profile = kafkaService.extractWriteData(kafkaMessage);
        if(profile.error !== undefined) {console.error(profile.error)}

        topic = kafkaService.makeResponseTopic(kafkaMessage);

        userService.findOneAndUpdate(query, profile)
            .then(
                (result) => {

                    context.response = result;
                    kafkaService.send(topic, context);
                },
                (error) => {
                    context.response = error;
                    kafkaService.send(topic, context);
                }
            );
    };

    findOne = kafkaMessage => {
        let context, query;
        let topic;

        context = extractContext(kafkaMessage);
        if(context.error !== undefined) {console.error(context.error)}

        query = extractQuery(kafkaMessage);
        if(query.error !== undefined) {console.error(query.error)}

        topic = kafkaService.makeResponseTopic(kafkaMessage);

        userService.findOne(query)
            .then(
                (result) => {
                    // console.log(JSON.stringify(result));
                    context.response = result;
                    kafkaService.send(topic, context);
                },
                (error) => {
                    // console.log(JSON.stringify(error));
                    context.response = error;
                    kafkaService.send(topic, context);
                }
            )
    };

    kafkaListeners = configService.read('userjs.kafkaListeners');
    if(kafkaListeners !== undefined) {
        kafkaService.subscribe(kafkaListeners.findOne, findOne);
        kafkaService.subscribe(kafkaListeners.findOneAndUpdate, findOneAndUpdate);
    }

    return userController;
};