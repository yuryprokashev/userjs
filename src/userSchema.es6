/**
 *Created by py on 14/11/2016
 */
'use strict';

const mongoose = require( 'mongoose' );

const userSchema = new mongoose.Schema( {

    public: {
        username: {
            type: String,
            required: true,
            lowercase: true
        },
        name: {
            familyName: {
                type: String,
                required: true
            },
            givenName: {
                type:String,
                required: true
            }
        },

        picture: {
            type: String,
            match: /^https:\/\//i
        },

        settings: {
            defaults: {
                currency: {
                    type: String,
                    required: true,
                    enum: ["USD", "RUB", "EUR", "GBP", "JPY"],
                    default: "USD"
                }
            }
        }
    },

    private: {
        google: {
            email: {
                type: String
            },
            gender: {
                type: String
            },
            language: {
                type: String
            },
            circledByCount:{
                type: Number
            }
        },
        facebook:{
            email: {
                type: String
            },
            gender: {
                type: String
            }
        },
        local: {
            login: {
                type: String

            },
            password: {
                type: String
            }
        },
        telegramId: {
            type: Number,
            get: v => {return Math.round(v)},
            set: v => {return Math.round(v)}
        },
        oauth: {
            type: String
        },
        loginCount: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Number,
            required: true,
            get: v => {return Math.round(v)},
            set: v => {return Math.round(v)}
            default: new Date().valueOf()
        }
    }
});

module.exports = userSchema;
module.exports.userSchema = userSchema;