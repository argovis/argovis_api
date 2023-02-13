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
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  metadata: {type: [String], required: true},
  data: [{type: [Number], required: false}]
});

const GridMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  levels: {type: [Number], required: true},
  data_info: [{type:[Schema.Types.Mixed], required: false}]
});

module.exports = {}
module.exports['rg09Meta'] = mongoose.model('rg09Meta', GridMetaSchema, 'rg09Meta');
module.exports['rg09'] = mongoose.model('rg09', GridSchema, 'rg09');
module.exports['kg21Meta'] = mongoose.model('kg21Meta', GridMetaSchema, 'kg21Meta');
module.exports['kg21'] = mongoose.model('kg21', GridSchema, 'kg21');