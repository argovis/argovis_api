var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var arShapesSchema = Schema(
  {
    _id: {type: String, required: true},
    date: {type: Date, required: true},
    shapeId: {type: Number, required: true},
    geoLocation: {type: Schema.Types.Mixed, required: true},
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// Virtual for formatted date
arShapesSchema
.virtual('date_formatted')
.get(function () {
  return moment.utc(this.date).format('YYYY-MM-DD');
});

//Export model, mongoose automatically looks for the plural of the first input. 'profiles'
module.exports = mongoose.model('arShapes', arShapesSchema, 'arShapes');
