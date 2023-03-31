const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
const rawspec = require('/tests/core-spec.json');
const $RefParser = require("@apidevtools/json-schema-ref-parser");

$RefParser.dereference(rawspec, (err, schema) => {
  if (err) {
    console.error(err);
  }
  else {

    // cchdo

    describe("GET /cchdo", function () {
      it("searches for cchdo profiles, dont request data", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/cchdo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /cchdo", function () {
      it("searches for cchdo profiles with data=except-data-values", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/cchdo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo except-data-values should still have data_info", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body[0]).to.contain.keys('data_info')
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data filter should return cchdo-consistent data", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=salinity_btl,oxygen_btl").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/cchdo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data filter should return correct data_keys", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=salinity_btl,oxygen_btl").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.have.members(['salinity_btl','oxygen_btl','pressure'])
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data filter should return correct units", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=salinity_btl,oxygen_btl").set({'x-argokey': 'developer'});
        salindex = response.body[0].data_info[0].indexOf('salinity_btl')
        oxyindex = response.body[0].data_info[0].indexOf('oxygen_btl')
        uindex = response.body[0].data_info[1].indexOf('units')
        expect(response.body[0].data_info[2][salindex][uindex]).to.deep.equal("psu")
        expect(response.body[0].data_info[2][oxyindex][uindex]).to.deep.equal("micromole/kg")
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data=all filter should return cchdo-consistent data", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-57.8,-42],[-57.8,-43],[-57,-43],[-57,-42]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/cchdo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data=all filter should return correct data_keys", async function () {
        const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_016_cast_001&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.have.members([ "salinity_ctd", "bottle_salinity_btl_woceqc", "sample_ctd", "bottle_number_btl", "doxy_ctd", "pressure_ctd_woceqc", "oxygen_btl_woceqc", "salinity_btl", "salinity_ctd_woceqc", "doxy_ctd_woceqc", "ctd_pressure_raw_btl", "salinity_btl_woceqc", "temperature_ctd", "temperature_ctd_woceqc", "temperature_btl", "bottle_salinity_btl", "pressure", "temperature_btl_woceqc", "oxygen_btl", "sample_btl", "potential_temperature_c_btl", "bottle_number_btl_woceqc" ])
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data=all filter should return correct units", async function () {
        const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_016_cast_001&data=all").set({'x-argokey': 'developer'});
        pindex = response.body[0].data_info[0].indexOf('ctd_pressure_raw_btl')
        uindex = response.body[0].data_info[1].indexOf('units')
        expect(response.body[0].data_info[2][pindex][uindex]).to.eql('decibar')
      });
    });

      describe("GET /cchdo", function () {
        it("cchdo levels should get dropped if they dont have requested data", async function () {
          const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_020_cast_001&data=potential_temperature_c_btl").set({'x-argokey': 'developer'});
          pindex = response.body[0].data_info[0].indexOf('pressure')
          expect(response.body[0].data[pindex][0]).to.eql(2.3)
        });
      });

    describe("GET /cchdo", function () {
      it("cchdo profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-57.8,-42],[-57.8,-43],[-57,-43],[-57,-42]]&data=ctd_fluor_raw_btl").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /cchdo/meta", function () {
      it("cchdo metadata", async function () {
        const response = await request.get("/cchdo/meta?id=972_m0").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/cchdo/meta'].get.responses['200'].content['application/json'].schema);
      });
    }); 

    describe("GET /cchdo/meta", function () {
      it("cchdo metadata 404s correctly", async function () {
        const response = await request.get("/cchdo/meta?id=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });    

    describe("GET /cchdo", function () {
      it("cchdo data filtered by woceline", async function () {
        const response = await request.get("/cchdo?woceline=AR08").set({'x-argokey': 'developer'});
        profiles = response.body.filter(x => x._id!=='expo_08PD0196_1_sta_020_cast_001') // nulls left in sta_020, won't validate in openapi 3.0.x
        expect(profiles).to.be.jsonSchema(schema.paths['/cchdo'].get.responses['200'].content['application/json'].schema);
      });
    }); 

    describe("GET /cchdo/vocabulary", function () {
      it("make sure cchdo identifies set of sources correctly", async function () {
        const response = await request.get("/cchdo/vocabulary?parameter=source").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['cchdo_woce'])
      });
    }); 

    describe("GET /cchdo/vocabulary", function () {
      it("make sure cchdo identifies metadata groups correctly", async function () {
        const response = await request.get("/cchdo/vocabulary?parameter=metadata").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['972_m0'])
      });
    }); 

    describe("GET /cchdo", function () {
      it("check that a source filter on cchdo works as expected", async function () {
        const response = await request.get("/cchdo?source=cchdo_woce&startDate=1996-04-01T00:00:00Z&endDate=1996-05-01T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5)
      });
    }); 

    describe("GET /cchdo", function () {
      it("check metadata group request", async function () {
        const response = await request.get("/cchdo?metadata=972_m0").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5)
      });
    }); 

    describe("GET /cchdo", function () {
      it("should return appropriate minimal representation of this measurement", async function () {
        const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_016_cast_001&compression=minimal").set({'x-argokey': 'developer'});
        expect(response.body).to.eql([['expo_08PD0196_1_sta_016_cast_001', -57.6833, -42.8133, "1996-04-01T10:24:00.000Z", [ "cchdo_woce" ], [ "AR08" ], 972]]);  
      });
    }); 

    describe("GET /cchdo/meta", function () {
      it("should 404 on ID typos", async function () {
        const response = await request.get("/cchdo/meta?id=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /cchdo", function () {
      it("should reduce on qc filtering correctly", async function () {
        const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_016_cast_001&data=bottle_salinity_btl,2").set({'x-argokey': 'developer'});
        index = response.body[0].data_info[0].indexOf('bottle_salinity_btl')
        expect(response.body[0].data[index]).to.eql([34.0305,34.1203,34.157,34.1575,34.5576,34.6604,34.7048,34.7068]);
      });
    });

    describe("GET /cchdo", function () {
      it("should handle qc filtering on all correctly", async function () {
        const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_016_cast_001&data=all,2").set({'x-argokey': 'developer'});
        index = response.body[0].data_info[0].indexOf('bottle_salinity_btl')
        expect(response.body[0].data[index].filter(x => x !== null)).to.eql([34.0305,34.1203,34.157,34.1575,34.5576,34.6604,34.7048,34.7068]);
      });
    });

    describe("GET /cchdo", function () {
      it("drop on no acceptable qc", async function () {
        const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_016_cast_001&data=bottle_salinity_btl,9").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    // argo

    describe("GET /argo", function () {
      it("searches for argo profiles, dont request data", async function () {
        const response = await request.get("/argo?id=2902857_002").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("searches for argo profiles with data=except-data-values", async function () {
        const response = await request.get("/argo?id=2902857_002&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("argo except-data-values should still have data_info for BGC profiles", async function () {
        const response = await request.get("/argo?id=2902857_003&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body[0]).to.contain.keys('data_info')
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return argo-consistent data", async function () {
        const response = await request.get("/argo?id=2902857_002&data=bbp700,chla").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("shouldnt return a profile unless it has all the requested data", async function () {
        const response = await request.get("/argo?id=2902857_003&data=temperature,doxy,chla").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct data_keys", async function () {
        const response = await request.get("/argo?id=2902857_003&data=bbp700,chla").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.have.members(['bbp700', 'chla', 'pressure'])
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct units", async function () {
        const response = await request.get("/argo?id=2902857_003&data=bbp700,chla").set({'x-argokey': 'developer'});
        units = response.body[0].data_info[1].indexOf('units')
        bbp700index = response.body[0].data_info[0].indexOf('bbp700')
        chlaindex = response.body[0].data_info[0].indexOf('chla')
        expect(response.body[0].data_info[2][bbp700index][units]).to.eql("m-1")
        expect(response.body[0].data_info[2][chlaindex][units]).to.eql("mg/m3")
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct data_keys_mode", async function () {
        const response = await request.get("/argo?id=2902857_003&data=bbp700,chla").set({'x-argokey': 'developer'});
        dkmode = response.body[0].data_info[1].indexOf('data_keys_mode')
        bbp700index = response.body[0].data_info[0].indexOf('bbp700')
        chlaindex = response.body[0].data_info[0].indexOf('chla')
        expect(response.body[0].data_info[2][bbp700index][dkmode]).to.eql("R")
        expect(response.body[0].data_info[2][chlaindex][dkmode]).to.eql("A")
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys on a core profile", async function () {
        const response = await request.get("/argo?id=13857_068").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.deep.equal([ "pressure", "pressure_argoqc", "temperature", "temperature_argoqc" ])
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct units on a core profile", async function () {
        const response = await request.get("/argo?id=13857_068").set({'x-argokey': 'developer'});
        units = response.body[0].data_info[1].indexOf('units')
        temperature = response.body[0].data_info[0].indexOf('temperature')
        pressure = response.body[0].data_info[0].indexOf('pressure')
        expect(response.body[0].data_info[2][temperature][units]).to.eql("degree_Celsius")
        expect(response.body[0].data_info[2][pressure][units]).to.eql("decibar")
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return correct units on a core profile", async function () {
        const response = await request.get("/argo?id=13857_068&data=all").set({'x-argokey': 'developer'});
        units = response.body[0].data_info[1].indexOf('units')
        temperature = response.body[0].data_info[0].indexOf('temperature')
        pressure = response.body[0].data_info[0].indexOf('pressure')
        expect(response.body[0].data_info[2][temperature][units]).to.eql("degree_Celsius")
        expect(response.body[0].data_info[2][pressure][units]).to.eql("decibar")
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys_mode on a core profile", async function () {
        const response = await request.get("/argo?id=13857_068").set({'x-argokey': 'developer'});
        dkmode = response.body[0].data_info[1].indexOf('data_keys_mode')
        temperature = response.body[0].data_info[0].indexOf('temperature')
        pressure = response.body[0].data_info[0].indexOf('pressure')
        expect(response.body[0].data_info[2][temperature][dkmode]).to.eql("R")
        expect(response.body[0].data_info[2][pressure][dkmode]).to.eql("R")
      });
    });

    describe("GET /argo", function () {
      it("argo with data=except-data-values filter should still return correct data_keys_mode on a core profile", async function () {
        const response = await request.get("/argo?id=13857_068&data=except-data-values").set({'x-argokey': 'developer'});
        dkmode = response.body[0].data_info[1].indexOf('data_keys_mode')
        temperature = response.body[0].data_info[0].indexOf('temperature')
        pressure = response.body[0].data_info[0].indexOf('pressure')
        expect(response.body[0].data_info[2][temperature][dkmode]).to.eql("R")
        expect(response.body[0].data_info[2][pressure][dkmode]).to.eql("R")
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys on a bgc profile", async function () {
        const response = await request.get("/argo?id=2902857_003").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.deep.equal([ "bbp700", "bbp700_argoqc", "cdom", "cdom_argoqc", "chla", "chla_argoqc", "pressure", "pressure_argoqc", "salinity", "salinity_argoqc", "salinity_sfile", "salinity_sfile_argoqc", "temperature", "temperature_argoqc", "temperature_sfile", "temperature_sfile_argoqc" ])
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct units on a bgc profile", async function () {
        const response = await request.get("/argo?id=2902857_003").set({'x-argokey': 'developer'});
        units = response.body[0].data_info[1].indexOf('units')
        bbp700index = response.body[0].data_info[0].indexOf('bbp700')
        chlaindex = response.body[0].data_info[0].indexOf('chla')
        expect(response.body[0].data_info[2][bbp700index][units]).to.eql("m-1")
        expect(response.body[0].data_info[2][chlaindex][units]).to.eql("mg/m3")
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys_mode on a bgc profile", async function () {
        const response = await request.get("/argo?id=2902857_003").set({'x-argokey': 'developer'});
        dkmode = response.body[0].data_info[1].indexOf('data_keys_mode')
        bbp700index = response.body[0].data_info[0].indexOf('bbp700')
        chlaindex = response.body[0].data_info[0].indexOf('chla')
        expect(response.body[0].data_info[2][bbp700index][dkmode]).to.eql("R")
        expect(response.body[0].data_info[2][chlaindex][dkmode]).to.eql("A")
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return argo-consistent data", async function () {
        const response = await request.get("/argo?id=2902857_002&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return correct data_keys", async function () {
        const response = await request.get("/argo?id=2902857_003&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.have.members([ "bbp700", "bbp700_argoqc", "cdom", "cdom_argoqc", "chla", "chla_argoqc", "pressure", "pressure_argoqc", "salinity", "salinity_argoqc", "salinity_sfile", "salinity_sfile_argoqc", "temperature", "temperature_argoqc", "temperature_sfile", "temperature_sfile_argoqc" ])
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return correct units", async function () {
        const response = await request.get("/argo?id=13857_068&data=all").set({'x-argokey': 'developer'});
        pindex = response.body[0].data_info[0].indexOf('pressure')
        pqcindex = response.body[0].data_info[0].indexOf('pressure_argoqc')
        tindex = response.body[0].data_info[0].indexOf('temperature')
        tqcindex = response.body[0].data_info[0].indexOf('temperature_argoqc')
        uindex = response.body[0].data_info[1].indexOf('units')
        expect(response.body[0].data_info[2][pindex][uindex]).to.deep.eql("decibar")
        expect(response.body[0].data_info[2][pqcindex][uindex]).to.deep.eql(null)
        expect(response.body[0].data_info[2][tindex][uindex]).to.deep.eql("degree_Celsius")
        expect(response.body[0].data_info[2][tqcindex][uindex]).to.deep.eql(null)
      });
    });

    describe("GET /argo", function () {
      it("argo levels should get dropped if they dont have requested data", async function () {
        const response = await request.get("/argo?id=2902857_003&data=bbp700").set({'x-argokey': 'developer'});
        pindex = response.body[0].data_info[0].indexOf('pressure')
        expect(response.body[0].data[pindex][0]).to.eql(0)
      });
    });

    describe("GET /argo", function () {
      it("drop whole profile is no levels with non-null requested data", async function () {
        const response = await request.get("/argo?id=2902857_003&data=bbp700&presRange=1.45,1.55").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("argo profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/argo?id=2902857_003&data=doxy").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo/meta", function () {
      it("argo metadata", async function () {
        const response = await request.get("/argo/meta?id=2902857_m0").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo/meta'].get.responses['200'].content['application/json'].schema);
      });
    });    

    describe("GET /argo", function () {
      it("argo data filtered by platform", async function () {
        const response = await request.get("/argo?startDate=2022-01-07T12:02:21Z&endDate=2022-07-06T12:02:21Z&platform=2902857").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by source", async function () {
        const response = await request.get("/argo?startDate=2022-01-07T12:02:21Z&endDate=2022-07-07T12:02:21Z&source=argo_bgc").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(3);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by source negation", async function () {
        const response = await request.get("/argo?startDate=2022-01-01T00:00:00Z&endDate=2022-09-01T00:00:00Z&source=argo_core,~argo_bgc").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by platform_type", async function () {
        const response = await request.get("/argo?startDate=2022-01-07T12:02:21Z&endDate=2022-07-07T12:02:21Z&platform_type=PALACE").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    }); 

    describe("GET /argo", function () {
      it("drop profiles with no data in them", async function () {
        const response = await request.get("/argo?id=1900959_198").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by platform_type", async function () {
        const response = await request.get("/argo?startDate=2022-01-07T12:02:21Z&endDate=2022-07-07T12:02:21Z&platform_type=PROVOR").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(3);
      });
    }); 

    describe("GET /argo/vocabulary", function () {
      it("get list of argo platforms", async function () {
        const response = await request.get("/argo/vocabulary?parameter=platform").set({'x-argokey': 'developer'});
         expect(response.body).to.have.members(['2902857', '13857', '1900959']) 
      });
    });

    describe("GET /argo/vocabulary", function () {
      it("get list of argo metadata groups", async function () {
        const response = await request.get("/argo/vocabulary?parameter=metadata").set({'x-argokey': 'developer'});
         expect(response.body).to.have.members(["2902857_m0", "13857_m0", '1900959_m0']) 
      });
    });

    describe("GET /argo/vocabulary", function () {
      it("get list of argo platform types", async function () {
        const response = await request.get("/argo/vocabulary?parameter=platform_type").set({'x-argokey': 'developer'});
         expect(response.body).to.have.members(['PROVOR', 'PALACE', 'APEX']) 
      });
    });

    describe("GET /argo", function () {
      it("filters on source correctly", async function () {
        const response = await request.get("/argo?startDate=2022-01-07T12:02:21Z&endDate=2022-07-07T12:02:21Z&source=argo_bgc").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(3);
      });
    });

    describe("GET /argo", function () {
      it("minimal compression reponds appropriately", async function () {
        const response = await request.get("/argo?startDate=2022-07-07T12:00:21Z&endDate=2022-07-07T12:02:21Z&source=argo_bgc&compression=minimal").set({'x-argokey': 'developer'});
         expect(response.body).to.eql([["2902857_003", 152.28354833333333, 42.39558666666667, "2022-07-07T12:01:21.000Z", ['argo_bgc', 'argo_core']]]) 
      });
    });
    
    describe("GET /argo", function () {
      it("gets correct time for most recent result", async function () {
        const response = await request.get("/argo?platform=2902857&mostrecent=1").set({'x-argokey': 'developer'});
         expect(response.body[0].timestamp).to.eql('2022-07-07T12:01:21.000Z');
      });
    });

    describe("GET /argo", function () {
      it("only gets one result", async function () {
        const response = await request.get("/argo?platform=4901283&mostrecent=1").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(1);
      });
    });

    describe("GET /argo", function () {
      it("gets most recent 2 results", async function () {
        const response = await request.get("/argo?platform=4901283&mostrecent=2").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(2);
      });
    });

    describe("GET /argo", function () {
      it("confirm mostrecent and data queries work together nicely", async function () {
        const response = await request.get("/argo?platform=4901283&data=temperature_sfile&mostrecent=2").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(2);
      });
    });

    describe("GET /argo", function () {
      it("check metadata batch request", async function () {
        const response = await request.get("/argo?metadata=2902857_m0").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(3);
      });
    });

    describe("GET /argo", function () {
      it("shouldnt return a profile with no levels in presRange, even if not returning actual data levels", async function () {
        const response = await request.get("/argo?presRange=2000,10000").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("shouldnt return a profile with no levels in presRange, even if not returning actual data levels, in minimal mode", async function () {
        const response = await request.get("/argo?presRange=2000,10000&compression=minimal").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("should return profiles in presRange, even if not returning actual data levels", async function () {
        const response = await request.get("/argo?presRange=1000,2000").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    });

    describe("GET /argo/meta", function () {
      it("should 404 on ID typos", async function () {
        const response = await request.get("/argo/meta?id=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("edgecase 20230315", async function () {
        const response = await request.get("/argo?id=2902857_001&presRange=80,100&compression=minimal").set({'x-argokey': 'developer'});
        expect(response.body).to.eql([['2902857_001',152.12710166666668,42.39075666666667,'2022-07-05T12:01:51.999Z',[ 'argo_bgc', 'argo_core' ]]]);
      });
    });

    describe("GET /argo", function () {
      it("check QC requirements correctly suppress bad values", async function () {
        const response = await request.get("/argo?id=2902857_001&data=bbp700,pressure").set({'x-argokey': 'developer'});
        expect(response.body[0].data[0][6]).to.eql(0.004465);
        const responseqc = await request.get("/argo?id=2902857_001&data=bbp700,1,pressure").set({'x-argokey': 'developer'});
        expect(responseqc.body[0].data[0][6]).to.eql(null);
      });
    });

    describe("GET /argo", function () {
      it("profile should drop if no acceptable qc", async function () {
        const response = await request.get("/argo?id=13857_068&data=temperature,2").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("data=all should cope with qc filters", async function () {
        const response = await request.get("/argo?id=2902857_002&data=all,0,1").set({'x-argokey': 'developer'});
        expect(response.body[0].data[4][0]).to.eql(null);
      });
    });
  }
})
