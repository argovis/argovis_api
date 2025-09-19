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

const bapSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: [String], required: true},
  data: [{type: [Number], required: false}],
  data_info: [{type:[Schema.Types.Mixed], required: false}],
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  cycle_number: {type: Number, required: true},
  geolocation_argoqc: {type: Number, required: false},
  profile_direction: {type: String, required: false},
  timestamp_argoqc: {type: Number, required: false}
});

const bapMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  data_center: {type: String, required: false},
  instrument: {type: String, required: false},
  pi_name: {type: [String], required: false},
  platform: {type: String, required: false},
  platform_type: {type: String, required: false},
  fleetmonitoring: {type: String, required: false},
  oceanops: {type: String, required: false},
  positioning_system: {type: String, required: false},
  wmo_inst_type: {type: String, required: false}
});

module.exports = {}
module.exports.bgcargoplusMeta = mongoose.model('bgcargoplusMeta', bapMetaSchema, 'bgcargoplusMeta');
module.exports.bgcargoplus = mongoose.model('bgcargoplus', bapSchema, 'bgcargoplus');