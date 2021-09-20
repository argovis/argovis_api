const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CovarSchema = Schema(
  {
    forcastDays: {type: Number, required: true },
    _id: {type: String, required: true, max: 100},
    features: [{type: Schema.Types.Mixed, required: true}],
    geoLocation: {type: Schema.Types.Mixed, required: true},
    dLat: {type: Number, required: true },
    dLong: {type :Number, required: true}
  },
  );

module.exports = mongoose.model('covars', CovarSchema, 'covars');