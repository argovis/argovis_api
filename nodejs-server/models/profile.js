var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

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

var datakey = Schema({
  type: String,
  enum: ['pres','temp','psal','cndx','doxy','chla','cdom','nitrate','bbp700','down_irradiance412','down_irradiance442','down_irradiance490','downwelling_par','doxy_molar','pres_qc','temp_qc','psal_qc','cndx_qc','doxy_qc','chla_qc','cdom_qc','nitrate_qc','bbp700_qc','down_irradiance412_qc','down_irradiance442_qc','down_irradiance490_qc','downwelling_par_qc', 'molar_doxy', 'molar_doxy_qc', 'temp_synth', 'temp_synth_qc', 'psal_synth', 'psal_stynth_qc']
})

var ProfileSchema = Schema(
  {
    _id: {type: String, required: true},
    basin: {type: Number, required: true},
    data_type: {type: String, required: true},
    doi: {type: String, required: false},
    geoLocation: {type: geolocation, required: true},
    instrument: {type: String, required: false},
    data: [{
      type: [Number],
      validate: {
        validator: function(v){
          return v.length == this.data_keys.length
        },
        message: x => '${x} is not the same length as data_keys, cant interpret'
      }
    }],
    data_keys: {
      type: [datakey],
      required: function() { return this.data.hasOwnProperty('data') }
    },
    data_keys_source:{
      type: [String],
      required: function() { return this.data.hasOwnProperty('data') }
    }
    source: {type: [String], required: true},
    source_url: {type: [String], required: false},
    timestamp: {type: Date, required: true},
    date_updated_argovis: {type: Date, required: true},
    date_updated_source: {type: [Date], required: true},
    pi_name: {type: String, required: false},
    country: {type: String, required: false},
    data_center: {type: String, required: false},
    profile_direction: {type: String, required: false},
    geolocation_argoqc: {type: Number, required: false},
    timestamp_argoqc: {type: Number, required: false},
    cycle_number: {type: Number, required: true},
    fleetmonitoring: {type: String, required: false},
    oceanops: {type: String, required: false},
    data_keys_mode: {type: [String], required: false},
    platform_wmo_number: {type: Number, required: true},
    platform_type: {type: String, required: false},
    positioning_system: {type: String, required: false},
    vertical_sampling_scheme: {type: String, required: false},
    wmo_inst_type: {type: String, required: false}
  }
);

//Export model, mongoose automatically looks for the plural of the first input. 'profiles'
module.exports = mongoose.model('profilesx', ProfileSchema, 'profilesx');
//module.exports = mongoose.model('goship', ProfileSchema, 'goship');
