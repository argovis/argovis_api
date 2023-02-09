const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {}

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
  doi: {type: String, required: false}
})

const argoneSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: [String], required: true},
  geolocation: {type: geolocation, required: true},
  geolocation_forecast: {type: geolocation, required: true},
  metadata: {type: [String], required: true},
  data: [{type: [Number], required: false}]
});

const argoneMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  levels: {type: [Number], required: true},
  data_info: [{type:[Schema.Types.Mixed], required: false}]
});

module.exports['argone'] = mongoose.model('covariance', argoneSchema, 'covariance');
module.exports['argoneMeta'] = mongoose.model('covarianceMeta', argoneMetaSchema , 'covarianceMeta');