var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var TrajData = {
        date: {type: String, required: true},
        time:  {type: Number, required: true},
        class:  {type: String, required: true},
        lat:  {type: Number, required: true},
        lon:  {type: Number, required: true},
        wind:  {type: Number, required: false},
        pres: {type: Number, required: false},
        season: {type: Number, required: false},
        timestamp: {type: Date, required: true},
        geoLocation: {type: Schema.Types.Mixed, required: true},
    }


var tcTrajSchema = Schema(
    {
      _id: {type: String, required: true},
      name: {type: String, required: false},
      num: {type: Number, required: true},
      source: {type: String, required: true},
      startDate: {type: Date, required: true},
      endDate: {type:Date, required: true},
      trajData: [TrajData]
    },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true }
    }
  );

module.exports = mongoose.model('tcTrajs', tcTrajSchema, 'tcTrajs');

