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

const argoSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: [String], required: true},
  data: [{type: [Number], required: false}],
  data_info: [{type:[Schema.Types.Mixed], required: false}],
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  data_warning: {type: [String], required: false, enum: ["degenerate_levels", "missing_basin", "missing_location", "missing_timestamp"]},
  cycle_number: {type: Number, required: true},
  geolocation_argoqc: {type: Number, required: false},
  profile_direction: {type: String, required: false},
  timestamp_argoqc: {type: Number, required: false},
  vertical_sampling_scheme: {type: String, required: false}
});

const argoMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  country: {type: String, required: false},
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
module.exports.argoMeta = mongoose.model('argoMeta', argoMetaSchema, 'argoMeta');
module.exports.argo = mongoose.model('argo', argoSchema, 'argo');