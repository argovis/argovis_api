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
  source_url: {type: String, required: false}
})

const DrifterSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: String, required: true},
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  data: {type: [Number], required: true}
});

const DrifterMetaSchema = Schema({
  _id: {type: String, required: true},
  rowsize: {type: Number, required: true},
  wmo: {type: Number, required: true},
  expno: {type: Number, required: true},
  deploy_date: {type: Date, required: true},
  deploy_lon: {type: Number, required: true},
  deploy_lat: {type: Number, required: true},
  end_date: {type: Date, required: true},
  end_lon: {type: Number, required: true},
  end_lat: {type: Number, required: true},
  drogue_lost_date: {type: Date, required: true},
  typedeath: {type: Number, required: true},
  typebuoy: {type: String, required: true},
  data_type: {type: String, required: true},
  date_updated_argovis: {type: Date, required: true},
  source_info: {type: sourceinfo, required: true},
  data_keys: {type: [String], required: true},
  units: {type: [String], required: true},
  long_name: {type: [String], required: true}
});

module.exports = {}
module.exports.drifterMeta = mongoose.model('drifterMeta', DrifterMetaSchema, 'drifterMeta');
module.exports.drifter = mongoose.model('drifter', DrifterSchema, 'drifter');