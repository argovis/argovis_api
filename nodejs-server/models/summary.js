var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var summarySchema = Schema(
    {
      _id: {type: String, required: true}
    }
  );

module.exports = mongoose.model('summaries', summarySchema, 'summaries');