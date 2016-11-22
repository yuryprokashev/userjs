/**
 *Created by py on 14/11/2016
 */
var mongoose = require( 'mongoose' );

// exports user object model

var userSchema = new mongoose.Schema( {

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
        oauth: {
            type: String
        },
        loginCount: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },

    lastRecommendationSent: {
        type: Date
    }
});

module.exports = userSchema;
module.exports.userSchema = userSchema;