const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var geolocation = Schema({
  type: {
    type: String,
    required: true,
    enum: ['Point']
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v){
        return v.length == 2
      },
      message: x => '${x} is not a valid coordinate set'
    }
  }
})

var sourceinfo = Schema({
  source: {type: [String], required: true},
  url: {type: String, required: false},
  doi: {type: String, required: false},
  date_updated: {type: Date, required: false},
})

const tcSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: String, required: true},
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  data: [{type: [Number]}],
  record_identifier: {type: String, required: true},
  class: {type: String, required: true}
});

const tcMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  data_info: Schema.Types.Mixed,
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  name: {type: String, required: true},
  num: {type: Number, required: true}
});

module.exports = {}
module.exports.tcMeta = mongoose.model('tcMeta', tcMetaSchema, 'tcMeta');
module.exports.tc = mongoose.model('tc', tcSchema, 'tc');