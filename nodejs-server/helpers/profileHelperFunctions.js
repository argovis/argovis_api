const HELPER_CONST = require('./profileHelperConstants')

module.exports = {}
module.exports.pres_slice_projection = function(minPres, maxPres) {
    const psp = {$project: { //need to include all fields that you wish to keep.
        nc_url: 1,
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
        cycle_number: 1,
        dac: 1,
        date:1,
        lat: 1,
        lon: 1,
        platform_number: 1,
        geoLocation: 1,
        station_parameters: 1,
        maximum_pressure: 1,
        POSITIONING_SYSTEM: 1,
        DATA_MODE: 1,
        PLATFORM_TYPE: 1,
        measurements: {
            $filter: {
                input: '$measurements',
                as: 'item',
                cond: { 
                    $and: [
                        {$gt: ['$$item.pres', minPres]},
                        {$lt: ['$$item.pres', maxPres]}
                    ]},
            },
        },
    }}
    return(psp)
}

module.exports.reduce_intp_meas = function(intPres) {
    const rim = [{$project: { // create lower and upper measurements
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
        cycle_number: 1,
        dac: 1,
        date:1,
        lat: 1,
        lon: 1,
        platform_number: 1,
        DATA_MODE: 1,
        measurements: 1,
        count: 1,
        upperMeas: {
            $filter: {
                input: '$measurements',
                as: 'item',
                cond: { $lt: ['$$item.pres', intPres]}      
            },
        },
        lowerMeas: {
            $filter: {
                input: '$measurements',
                as: 'item',
                cond: { $gte: ['$$item.pres', intPres]}      
            },
        },
    }},
    {$project: { // slice lower and upper measurements
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
        cycle_number: 1,
        dac: 1,
        date:1,
        lat: 1,
        lon: 1,
        platform_number: 1,
        DATA_MODE: 1,
        lowerMeas: { $slice: [ '$lowerMeas', 2 ] },
        upperMeas: { $slice: [ '$upperMeas', 2 ] },
    }},
    {$project: { //combine upper and lower measurements into one array
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
        cycle_number: 1,
        dac: 1,
        date:1,
        lat: 1,
        lon: 1,
        platform_number: 1,
        DATA_MODE: 1,
        measurements: { $concatArrays: [ "$upperMeas", "$lowerMeas" ] }  
    }},
    ]
    return rim
}

module.exports.make_match = function(startDate, endDate, basin) {
    let match
    if (basin) {
        match = {$match:  {$and: [ {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}},
                        {BASIN: basin}]}
                }
    }
    else{
        match = { $match: {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} }
    }
    return match

}

module.exports.make_pres_project = function(minPres, maxPres, meas) {
    let presProjectItems = HELPER_CONST.PROF_META_PARAMS
    presProjectItems[meas] = {
        $filter: {
            input: '$'.concat(meas),
            as: 'item',
            cond: { 
                $and: [
                    {$gt: ['$$item.pres', minPres]},
                    {$lt: ['$$item.pres', maxPres]}
                ]},
        },
    }
    const presProj = {$project: presProjectItems}
    return presProj
}

module.exports.make_bgc_pres_agg = function(minPres, maxPres, shapeJson, startDate, endDate) {
    let bgcPresProj = this.make_pres_project(minPres, maxPres, 'bgcMeas')

    const bgcPresAgg = [
        {$match: {geoLocation: {$geoWithin: {$geometry: shapeJson}}}},
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        bgcPresProj,
        {$project: HELPER_CONST.PROF_BGC_PROJECT_WITH_PRES_RANGE_COUNT},
        {$match: {count: {$gt: 0}}},
        {$sort: { date: -1}},
    ]
    return bgcPresAgg
}

module.exports.make_spatial_match_agg = function(shape, shapeBool, startDate=false, endDate=false) {
    let match = {}
    if (shapeBool && startDate) { //uses polygon shape
        match = { $match: { $and: [ {geoLocation: {$geoWithin: {$geometry: shape}}},
            {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} ] } }
    }
    else if (!shapeBool && startDate) { //uses 2d cartesian box
        match = { $match: { $and: [ {geoLocation: {$geoWithin: {$box: shape}}},
            {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} ] } }
    }
    else if (shapeBool && !startDate) { //uses polygon shape
        match = {$match: {geoLocation: {$geoWithin: {$geometry: shape}}}}
    }
    else { //uses 2d cartesian box
        match = {$match: {geoLocation: {$geoWithin: {$box: shape}}}}
    }
    return match
}

module.exports.make_map_pres_agg = function(minPres, maxPres, shapeJson, startDate, endDate, shapeBool=true) {
    let match = this.make_spatial_match_agg(shapeJson, shapeBool, startDate, endDate)
    let agg = [{$project: { // this projection has to be defined here
            platform_number: -1,
            date: -1,
            geoLocation: 1,
            cycle_number: -1,
            containsBGC: 1,
            isDeep: 1,
            DIRECTION: 1,
            measurements: {
                $filter: {
                    input: '$measurements',
                    as: 'item',
                    cond: {
                        $and: [
                            {$gt: ['$$item.pres', minPres]},
                            {$lt: ['$$item.pres', maxPres]}
                        ]},
                },
            },
            DATA_MODE: -1,
            core_data_mode: 1,
        }},
        match,
        {$project: HELPER_CONST.MAP_PROJ_WITH_COUNT},
        {$match: {count: {$gt: 0}}},
        {$project: HELPER_CONST.MAP_PROJ},
        {$limit: 1001},
        ]
    return agg
}

module.exports.make_pres_agg = function(minPres, maxPres, shapeJson, startDate, endDate, shapeBool=true) {
    console.log('shapeJson', shapeJson, 'shapeBool', shapeBool)
    let match = this.make_spatial_match_agg(shapeJson, shapeBool)
    let presProj = this.make_pres_project(minPres, maxPres, 'measurements')
    const presAgg = [
        match,
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        presProj,
        {$project: HELPER_CONST.PROF_PROJECT_WITH_PRES_RANGE_COUNT},
        {$match: {count: {$gt: 0}}},
        {$sort: { date: -1}},
    ]
    return presAgg
}

module.exports.meta_data_proj = function() {
    const proj = {$project: {measurements: 0, bgcMeas: 0}}
    return proj
}

module.exports.drop_missing_bgc_keys = function(keys) {
    //filters out measurement keys that all exist in array of bgc objects
    let conds = []
    for (idx=0; idx<keys.length; idx++) {
        const key = keys[idx]
        const item = '$$item.'.concat(key)
        const gteExp = {$gte: [item, -999]}  //works as long as items are never negative
        conds.push(gteExp)
    }
    let presProjectItems = {} //rename this to somthing more usefull. todo: add pos and date qc
    presProjectItems.cycle_number = 1
    presProjectItems.date = 1
    presProjectItems.DATA_MODE = 1
    presProjectItems.core_data_mode = 1
    presProjectItems.POSITIONING_SYSTEM = 1
    presProjectItems.bgcMeasKeys = 1
    presProjectItems.lat = 1
    presProjectItems.lon = 1
    presProjectItems.bgcMeas = {
            $filter: {
                input: '$bgcMeas',
                as: 'item',
                cond: {
                    $and: conds,
                    },
            },
        }
    return {$project: presProjectItems}
}

module.exports.reduce_bgc_meas = function(keys) {
    //reduces bgcMeas to input keys
    let newObj = {}
    for (idx=0; idx<keys.length; idx++) {
        const key = keys[idx]
        const item = '$$item.'.concat(key)
        const item_qc = item.concat('_qc')
        newObj[key] = item
        newObj[key+'_qc'] = item_qc
    }
    const reduceArray = {
                        $addFields: {
                            bgcMeas: {
                                $map: {
                                    input: "$bgcMeas",
                                    as: "item",
                                    in: newObj
                                }
                            }
                        }
                    }
    return reduceArray
}

module.exports.make_virtural_fields = function(profiles){
    for(let idx=0; idx < profiles.length; idx++){
        let core_data_mode
        if (profiles[idx].DATA_MODE) {
            core_data_mode = profiles[idx].DATA_MODE
        }
        else if (profiles[idx].PARAMETER_DATA_MODE) {
            core_data_mode = profiles[idx].PARAMETER_DATA_MODE[0]
        }
        else {
            core_data_mode = 'Unknown'
        }
        profiles[idx].core_data_mode = core_data_mode

        let lat = profiles[idx].lat
        let lon = profiles[idx].lon
        profiles[idx].roundLat = Number(lat).toFixed(3)
        profiles[idx].roundLon = Number(lon).toFixed(3)

        if (lat > 0) {
            profiles[idx].strLat = Math.abs(lat).toFixed(3).toString() + ' N'
        }
        else {
            profiles[idx].strLat = Math.abs(lat).toFixed(3).toString() + ' S'
        }
        if (lon > 0) {
            profiles[idx].strLon = Math.abs(lon).toFixed(3).toString() + ' E'
        }
        else {
            profiles[idx].strLon = Math.abs(lon).toFixed(3).toString() + ' W'
        }
        if (profiles[idx].station_parameters) {
            let station_parameters = profiles[idx].station_parameters
            profiles[idx].formatted_station_parameters = station_parameters.map(param => ' '+param)
        }
    }
    return profiles
}

module.exports.reduce_gps_measurements = function(profiles, maxLength) {

    pos_sys = profiles[0].POSITIONING_SYSTEM;
    if (pos_sys === 'GPS'){
        for(let idx = 0; idx < profiles.length; idx++){
            let profile = profiles[idx]
            mLen = profile.measurements.length;
            if (mLen > maxLength) {
                //reduce array length to so that only every delta element is plotted
                const delta = Math.floor( mLen / maxLength );
                let reducedMeasurements = [];
                for (let jdx = 0; jdx < mLen; jdx=jdx + delta) {
                    reducedMeasurements.push(profile.measurements[jdx]);
                }
                profiles[idx].measurements = reducedMeasurements
            }
        }
    }
        
    return profiles
}
