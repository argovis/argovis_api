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
  doi: {type: String, required: false}
})

const argotrajectoriesSchema = Schema({
  _id: {type: String, required: true},
  cycle_number: {type: Number, required: true},
  geolocation: {type: geolocation, required: true},
  timestamp: {type: Date, required: true},
  geolocation_descending: {type: geolocation, required: true},
  timestamp_descending: {type: Date, required: true},
  geolocation_descending_transmitted: {type: geolocation, required: true},
  timestamp_descending_transmitted: {type: Date, required: true},
  geolocation_ascending: {type: geolocation, required: true},
  timestamp_ascending: {type: Date, required: true},
  geolocation_ascending_transmitted: {type: geolocation, required: true},
  timestamp_ascending_transmitted: {type: Date, required: true},
  geolocation_midpoint_transmitted: {type: geolocation, required: true},
  timestamp_midpoint_transmitted: {type: Date, required: true},
  metadata: {type: [String], required: true},
  data: [{type: [Number], required: false}]
});

const argotrajectoriesMetaSchema = Schema({
  _id: {type: String, required: true},
  platform: {type: String, required: false},
  data_type: {type: String, required: true},
  source: {type: sourceinfo, required: true},
  date_updated_argovis: {type: Date, required: true},
  positioning_system_flag: {type: Number, required: true},
  sensor_type_flag: {type: Number, required: true},
  mission_flag: {type: Number, required: true},
  extrapolation_flag: {type: Number, required: true},
  positioning_system: {type: String, required: true},
  platform_type: {type: String, required: true},
  data_info: [{type:[Schema.Types.Mixed], required: false}]
});

module.exports = {}
module.exports.argotrajectoriesMeta = mongoose.model('trajectoriesMeta', argotrajectoriesMetaSchema, 'trajectoriesMeta');
module.exports.argotrajectories = mongoose.model('trajectories', argotrajectoriesSchema, 'trajectories');