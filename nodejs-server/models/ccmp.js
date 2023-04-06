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

const CcmpSchema = Schema({
  _id: {type: String, required: true},
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timeseries: {type: [Date], required: true},
  metadata: {type: [String], required: true},
  data: [{type: [Number], required: false}]
});

const CcmpMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  data_info: [{type:[Schema.Types.Mixed], required: true}],
  date_updated_argovis: {type: Date, required: true},  
  source: {type: sourceinfo, required: true}
  
});

module.exports = {}
module.exports.ccmpMeta = mongoose.model('ccmpMeta', CcmpMetaSchema, 'ccmpMeta');
module.exports.ccmp = mongoose.model('ccmp', CcmpSchema, 'ccmp');