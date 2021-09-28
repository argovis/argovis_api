var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var ProfileSchema = Schema(
  {
    _id: {type: String, required: true},
    nc_url: {type: String, required: true},
    position_qc: {type: Number, required: true},
    cycle_number: {type: Number, required: true},
    dac: {type: String, required: true, max: 100},
    date: {type: Date, required: true},
    date_added: {type: Date, required: false},
    date_qc: {type: Number, required: false},
    max_pres: {type: Number, required: true},
    measurements: [{ pres: {type: Number, required: true}, //defaulting to null may cause performance issues for profiles with all nan
                     temp: {type: Number, required: false, default: null}, 
                     psal: {type: Number, required: false, default: null},
                     }],
    //bgcMeas: [mongoose.Schema.Types.Mixed], // defining schema slows down for large bgcMeas
    bgcMeas: [{ pres: {type: Number, required: false},
      pres_qc: {type: Number, required: false},
      temp: {type: Number, required: false},
      temp_qc: {type: Number, required: false},
      psal: {type: Number, required: false},
      psal_qc: {type: Number, required: false},
      cndc: {type: Number, required: false},
      cndc_qc: {type: Number, required: false},
      doxy: {type: Number, required: false},
      doxy_qc: {type: Number, required: false},
      chla: {type: Number, required: false},
      chla_qc: {type: Number, required: false},
      cdom: {type: Number, required: false},
      cdom_qc: {type: Number, required: false},
      nitrate: {type: Number, required: false},
      nitrate_qc: {type: Number, required: false},
      bbp700: {type: Number, required: false},
      bbp700_qc: {type: Number, required: false},
      down_irradiance412: {type: Number, required: false},
      down_irradiance412_qc: {type: Number, required: false},
      down_irradiance443: {type: Number, required: false},
      down_irradiance443_qc: {type: Number, required: false},
      down_irradiance490: {type: Number, required: false},
      down_irradiance490_qc: {type: Number, required: false},
      downwelling_par: {type: Number, required: false},
      downwelling_par_qc: {type: Number, required: false},
    }],
    bgcMeasKeys: {type: [String], required: false},
    lat: {type: Number, required: true},
    lon: {type: Number, required: true},
    platform_number: {type: Number, required: true, max: 100},
    geoLocation: {type: Schema.Types.Mixed, required: true},
    station_parameters: {type: [String], required: true},
    station_parameters_in_nc: {type: [String], required: false},
    VERTICAL_SAMPLING_SCHEME: {type:String, required: false},
    PI_NAME: {type: String, required: false, max: 100},
    WMO_INST_TYPE: {type: String, required: false, max: 100},
    POSITIONING_SYSTEM: {type: String, required: false, max: 100},
    DATA_MODE: {type: String, required: false, max: 100},
    PARAMETER_DATA_MODE: { type: [String], required: false},
    DATA_CENTRE: {type: String, required: false, max: 100},
    DIRECTION: {type: String, required: false, max: 100},
    PLATFORM_TYPE: {type: String, required: false, max: 100},
    pres_max_for_TEMP: {type: Number, required: false},
    pres_max_for_PSAL: {type: Number, required: false},
    pres_min_for_TEMP: {type: Number, required: false},
    pres_min_for_PSAL: {type: Number, required: false},
    containsBGC: {type: Boolean, required: false},
    isDeep: {type: Boolean, required: false},
    BASIN: {type: Number, required: false},
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// Virtual for profile's URL
ProfileSchema
.virtual('url')
.get(function () {
  return '/catalog/profiles/' + this._id;
});

ProfileSchema
.virtual('core_data_mode')
.get(function() {
  let core_data_mode
  if (this.DATA_MODE) {
    core_data_mode = this.DATA_MODE
  }
  else if (this.PARAMETER_DATA_MODE.length > 0) {
    core_data_mode = this.PARAMETER_DATA_MODE[0]
  }
  else {
    core_data_mode = 'Unknown'
  }
  return core_data_mode
})

ProfileSchema
.virtual('jcommopsPlatform')
.get(function () {
  return 'http://www.jcommops.org/board/wa/Platform?ref=' + this.platform_number
})

ProfileSchema
.virtual('euroargoPlatform')
.get(function () {
  return 'https://fleetmonitoring.euro-argo.eu/float/'+this.platform_number
})

ProfileSchema
.virtual('formatted_station_parameters')
.get(function () {
  return this.station_parameters.map(param => ' '+param)
})

ProfileSchema
.virtual('roundLat')
.get(function () {
  return this.lat.toFixed(3);
});
ProfileSchema
.virtual('roundLon')
.get(function () {
  return this.lon.toFixed(3);
});

ProfileSchema
.virtual('strLat')
.get(function () {
  let lat = this.lat;
  if (lat > 0) {
    strLat = Math.abs(lat).toFixed(3).toString() + ' N';
  }
  else {
      strLat = Math.abs(lat).toFixed(3).toString() + ' S';
  }
  return strLat
});

ProfileSchema
.virtual('strLon')
.get(function () {
  let lon = this.lon;
  if (lon > 0) {
    strLon = Math.abs(lon).toFixed(3).toString() + ' E';
  }
  else {
      strLon = Math.abs(lon).toFixed(3).toString() + ' W';
  }
  return strLon
});

// Virtual for formatted date
ProfileSchema
.virtual('date_formatted')
.get(function () {
  return moment.utc(this.date).format('YYYY-MM-DD');
});

//Export model, mongoose automatically looks for the plural of the first input. 'profiles'
module.exports = mongoose.model('profile', ProfileSchema);
