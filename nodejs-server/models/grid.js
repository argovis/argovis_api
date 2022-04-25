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

const GridSchema = Schema(
  {
    _id: {type: String, required: true},
    g: {type: geolocation, required: true},
    t: {type: Date, required: true},
    d: {type: [Number], required: true}
  }
);

module.exports = {}
module.exports.rgTempTotal = mongoose.model('rgTempTotal', GridSchema, 'rgTempTotal');
module.exports.rgPsalTotal = mongoose.model('rgPsalTotal', GridSchema, 'rgPsalTotal');
module.exports.ohc = mongoose.model('ohc', GridSchema, 'ohc');