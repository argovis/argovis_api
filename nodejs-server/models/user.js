var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var userSchema = Schema(
  {
    _id: {type: String, required: true},
    first: {type: String, required: true},
    last: {type: String, required: true},
    key: {type: String, required: true},
    email: {type: String, required: true},
    tokenValid: {type: Number, required: true},
    affiliation: {type: String, required: false}
  }
);

module.exports = mongoose.model('user', userSchema, 'user');
