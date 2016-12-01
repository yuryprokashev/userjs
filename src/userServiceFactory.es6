/**
 *Created by py on 14/11/2016
 */
'use strict';

module.exports = db => {
    let User = db.model('User', require('./userSchema.es6'), 'users');
    const userService = {};
    //@param: query - query object to be passed to User model.
    //@return: Promise, which will resolve in user data, or not found error.
    userService.findOne = (query)=> {
        return new Promise(
            (resolve, reject) => {
                User.findOne(query)
                    .exec(
                        (err, result) => {
                            if(err){
                                return reject(err);
                            }
                            resolve(result);
                        }
                    );
            }
        )

    };
    //@param: query - query object to be passed to User model.
    //@param: profile - profile fields to be set in User model after update
    //@return: Promise, which will resolve in {success}
    userService.findOneAndUpdate = (query, profile) => {
        return new Promise(
            (resolve, reject) => {
                User.findOneAndUpdate(
                    query,
                    {
                        $set: userService.createSetQuery(profile)
                    },
                    {upsert: true, 'new': true}
                ).exec(
                    (err, result) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(result);
                    }
                );
            }
        )

    };

    userService.createSetQuery = (profile) => {
        let setQuery = {};
        if(profile.provider === 'facebook') {
            setQuery = {
                'public.name.familyName': profile._json.last_name || null,
                'public.name.givenName': profile._json.first_name || null,
                'public.username': `${profile._json.first_name} ${profile._json.last_name}` || null,
                'public.picture': profile._json.picture.data.url || null,
                'private.facebook.gender': profile._json.gender || null,
                'private.facebook.language': profile._json.language || null,
                'private.facebook.email': profile._json.email,
            };
        }
        else if(profile.provider === 'google') {
            setQuery = {
                'public.name.familyName': profile._json.name.familyName || null,
                'public.name.givenName': profile._json.name.givenName || null,
                'public.username': profile._json.displayName || null,
                'public.picture': profile._json.image.url || null,
                'private.google.gender': profile._json.gender || null,
                'private.google.language': profile._json.language || null,
                'private.google.circledByCount': profile._json.circledByCount || 0,
                'private.google.email': profile._json.emails[0].value,
            };
        }
        return setQuery;
    };

    return userService;
    
};