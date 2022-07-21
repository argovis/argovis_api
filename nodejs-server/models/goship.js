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

const goshipSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: String, required: true},
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  data_warning: {type: [String], required: false, enum: ["degenerate_levels", "missing_basin", "missing_location", "missing_timestamp"]},
  data_keys: {type: [String], required: true},
  units: {type: [String], required: true},
  data: [{type: [Number]}],
  station: {type: String, required: true},
  cast: {type: Number, required: true}
});

const goshipMetaSchema = Schema({
  _id: {type: String, required: true},
  date_updated_argovis: {type: Date, required: true},
  data_type: {type: String, required: true},
  country: {type: String, required: false},
  data_center: {type: String, required: false},
  instrument: {type: String, required: false},
  pi_name: {type: [String], required: false},
  expocode: {type: String, required: true},
  cchdo_cruise_id: {type: Number, required: true},
  woce_lines: {type: [String], required: true}
});

module.exports = {}
module.exports.goshipMeta = mongoose.model('goshipMeta', goshipMetaSchema, 'goshipMeta');
module.exports.goship = mongoose.model('goship', goshipSchema, 'goship');