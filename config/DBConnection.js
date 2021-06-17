const mySQLDB = require('./DBConfig');
const catalouge = require('../models/Catalouge');
const productchoices = require('../models/Productchoices');
const chat = require('../models/Chat');
const messages = require('../models/Message');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('TailorNow database connected');
        })
        .then(() => {
        /*
        Defines the relationship where a user has many videos.
        In this case the primary key from user will be a foreign key
        in video.
        */
            catalouge.hasMany(productchoices);
            chat.hasMany(messages);
            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('----------------------------------------------------------\n');
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};
module.exports = { setUpDB };