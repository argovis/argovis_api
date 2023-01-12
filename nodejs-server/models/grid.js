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

const GridSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: [String], required: true},
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  data: [{type: [Number]}],
  data_keys: {type: [String], required: true},
  units: {type: [String], required: true},
});

const GridMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  levels: {type: [Number], required: true}
});

module.exports = {}
module.exports['grid_1_1_0.5_0.5Meta'] = mongoose.model('grid_1_1_0.5_0.5Meta', GridMetaSchema, 'grid_1_1_0.5_0.5Meta');
module.exports['grid_1_1_0.5_0.5'] = mongoose.model('grid_1_1_0.5_0.5', GridSchema, 'grid_1_1_0.5_0.5');