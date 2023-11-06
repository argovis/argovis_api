const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var geolocation = Schema({
  type: {
    type: String,
    required: true,
    enum: ['MultiPolygon']
  },
  coordinates:{
    type: [[[[Number]]]],
    required: true
  }
})

var sourceinfo = Schema({
  source: {type: [String], required: true},
  url: {type: String, required: false},
})

const extendedSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: [String], required: true},
  geolocation: {type: geolocation, required: true},
  true_geolocation: {type: geolocation, required: false},
  raster: {type: [Schema.Types.Mixed], required: false},
  basin: {type: [Number], required: true}
});

const extendedMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  data_info: [{type:[Schema.Types.Mixed], required: false}],
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true}
});

module.exports = {}
module.exports['extendedMeta'] = mongoose.model('extendedMeta', extendedMetaSchema, 'extendedMeta');
module.exports['ar'] = mongoose.model('ar', extendedSchema, 'ar');


