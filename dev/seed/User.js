/**
 * User Collection seed data
 */
const {ObjectId} = require('mongodb');

var user1 = {
    "_id" : new ObjectId("5bc014188c7bec2c0aeddcf3"),
    "first_name" : "Julian",
    "last_name" : "Hernandez",
    "email" : "hernandez.julian17@gmail.com",
    "password" : "$2b$10$FKl6qDU5i9JgJ/dj5EaKEOutyaQkqiUXZoe/L7LUKcefJVWa01ycG",
    "__v" : 0,
    "congregation" : new ObjectId("5c01eb89ef008c67a6f77add")
}

module.exports = [user1];
