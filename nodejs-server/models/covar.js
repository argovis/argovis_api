const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {}

const CovarSchema = Schema(
  {
    forcastDays: {type: Number, required: true },
    _id: {type: String, required: true, max: 100},
    features: [{type: Schema.Types.Mixed, required: true}],
    geolocation: {type: Schema.Types.Mixed, required: true},
    dLat: {type: Number, required: true },
    dLong: {type :Number, required: true}
  },
);

module.exports['covar'] = mongoose.model('covars', CovarSchema, 'covars');

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
  doi: {type: String, required: false}
})

const CovarianceSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: [String], required: true},
  geolocation: {type: geolocation, required: true},
  geolocation_forecast: {type: geolocation, required: true},
  data: [{type: [Number]}]
});

const CovarianceMetaSchema = Schema({
  _id: {type: String, required: true},
  data_type: {type: String, required: true},
  date_updated_argovis: {type: Date, required: true},
  source: {type: sourceinfo, required: true},
  levels: {type: [Number], required: true},
  data_keys: {type: [String], required: true},
  units: {type: [String], required: true},
});

module.exports['covariance'] = mongoose.model('covariance', CovarianceSchema, 'covariance');
module.exports['covarianceMeta'] = mongoose.model('covarianceMeta', CovarianceMetaSchema , 'covarianceMeta');