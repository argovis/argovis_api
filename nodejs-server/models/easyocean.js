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
  url: {type: String, required: true},
  filename: {type: String, required: false},
})

var occupancy_items = Schema({
  varying_direction: {type: String, required: true},
  static_direction: {type: String, required: true},
  expocodes: {type: [String], required: true},
  time_boundaries: {type: Date, required: true}
})

easyoceanmetaSchema = {
    "bsonType": "object",
    "required": ["_id","occupancies","date_updated_argovis"],
    "properties": {
        "_id": {
            "bsonType": "string"
        },
        "occupancies": {
            "bsonType": "array",
            "items": {
                "bsonType": "object",
                "required": ["varying_direction", "static_direction", "expocodes", "time_boundaries"],
                "properties": {
                    "varying_direction": {
                        "bsonType": "string"
                    },
                    "static_direction": {
                        "bsonType": "string"
                    },
                    "expocodes": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "string"
                        }
                    },
                    "time_boundaries": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "date"
                        }
                    }
                }
            }
        },
        "date_updated_argovis": {
            "bsonType": "date"
        }
    }
}

const easyoceanSchema = Schema({
  _id: {type: String, required: true},
  metadata: {type: [String], required: true},
  data_type: {type: String, required: true},
  section_expocodes: {type: [String], required: false},
  section_start_date: {type: Date, required: false},
  section_end_date: {type: Date, required: false},
  woce_lines: {type: [String], required: false},
  instrument: {type: String, required: false},
  references: {type: String, required: false},
  dataset_created: {type: Date, required: false},
  section_countries: {type: [String], required: false},
  positioning_system: {type: String, required: false},
  data_center: {type: String, required: false},
  source: {type: sourceinfo, required: true},
  geolocation: {type: geolocation, required: true},
  basin: {type: Number, required: true},
  timestamp: {type: Date, required: true},
  data: [{type: [Number], required: false}],
  data_info: [{type:[Schema.Types.Mixed], required: false}]
});

const easyoceanMetaSchema = Schema({
  _id: {type: String, required: true},
  date_updated_argovis: {type: Date, required: true},
  occupancies: {type: [occupancy_items], required: true}
});

module.exports = {}
module.exports.easyoceanMeta = mongoose.model('easyoceanMeta', easyoceanMetaSchema, 'easyoceanMeta');
module.exports.easyocean = mongoose.model('easyocean', easyoceanSchema, 'easyocean');