const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
const rawspec = require('/tests/spec.json');
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
      it("cchdo except-data-values should still have units and data_keys", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body[0]).to.contain.keys('data_keys', 'units')
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
        expect(response.body[0].data_keys).to.have.members(['salinity_btl','oxygen_btl','pressure'])
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data filter should return correct units", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=salinity_btl,oxygen_btl").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({'salinity_btl':"psu",'oxygen_btl':"micromole/kg",'pressure':"decibar"})
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data filter should return correct units, as a list when compressed", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=salinity_btl,oxygen_btl&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal(["psu","micromole/kg","decibar"])
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
        expect(response.body[0].data_keys).to.have.members([ "salinity_ctd", "bottle_salinity_btl_woceqc", "sample_ctd", "bottle_number_btl", "doxy_ctd", "pressure_ctd_woceqc", "oxygen_btl_woceqc", "salinity_btl", "salinity_ctd_woceqc", "doxy_ctd_woceqc", "ctd_pressure_raw_btl", "salinity_btl_woceqc", "temperature_ctd", "temperature_ctd_woceqc", "temperature_btl", "bottle_salinity_btl", "pressure", "temperature_btl_woceqc", "oxygen_btl", "sample_btl", "potential_temperature_c_btl", "bottle_number_btl_woceqc" ])
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data=all filter should return correct units", async function () {
        const response = await request.get("/cchdo?id=expo_08PD0196_1_sta_016_cast_001&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.eql({salinity_ctd: 'null',bottle_salinity_btl_woceqc: 'null',sample_ctd: 'null',bottle_number_btl: 'null',doxy_ctd: 'null',pressure_ctd_woceqc: 'null',oxygen_btl_woceqc: 'null',salinity_btl: 'psu',salinity_ctd_woceqc: 'null',doxy_ctd_woceqc: 'null',ctd_pressure_raw_btl: 'decibar',salinity_btl_woceqc: 'null',temperature_ctd: 'null',temperature_ctd_woceqc: 'null',temperature_btl: 'Celsius',bottle_salinity_btl: 'psu',pressure: 'decibar',temperature_btl_woceqc: 'null',oxygen_btl: 'micromole/kg',sample_btl: 'null',potential_temperature_c_btl: 'Celsius',bottle_number_btl_woceqc: 'null'})
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo levels should get dropped if they dont have requested data", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-57.8,-42],[-57.8,-43],[-57,-43],[-57,-42]]&data=salinity_btl").set({'x-argokey': 'developer'});
        expect(response.body[0].data[0]['pressure']).to.eql(3.5)
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-57.8,-42],[-57.8,-43],[-57,-43],[-57,-42]]&data=ctd_fluor_raw_btl").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo levels should come out sorted by pressure", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-57.8,-42],[-57.8,-43],[-57,-43],[-57,-42]]&data=all").set({'x-argokey': 'developer'});
        p = response.body[0].data.map(x => x.pressure)
        pp = JSON.parse(JSON.stringify(p))
        pp.sort((a,b)=>a-b)
        expect(p).to.deep.equal(pp)
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
        expect(response.body).to.be.jsonSchema(schema.paths['/cchdo'].get.responses['200'].content['application/json'].schema);
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

    // argo

    describe("GET /argo", function () {
      it("searches for argo profiles, dont request data", async function () {
        const response = await request.get("/argo?id=4901283_021").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("searches for argo profiles with data=except-data-values", async function () {
        const response = await request.get("/argo?id=4901283_021&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("argo except-data-values should still have units and data_keys for BGC profiles", async function () {
        const response = await request.get("/argo?id=4901283_021&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body[0]).to.contain.keys('data_keys', 'units')
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return argo-consistent data", async function () {
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("shouldnt return a profile unless it has all the requested data", async function () {
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy,chla").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct data_keys", async function () {
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(['salinity', 'doxy', 'pressure'])
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct units", async function () {
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({'salinity':"psu",'doxy':"micromole/kg",'pressure':"decibar"})
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct units, as a list when compressed", async function () {
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal(["psu","micromole/kg","decibar"])
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct data_keys_mode", async function () {
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys_mode).to.deep.equal({'salinity':"D",'doxy':"D",'pressure':"D"})
      });
    });

    describe("GET /argo", function () {
      it("argo with data filter should return correct data_keys_mode, as a list when compressed", async function () {
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys_mode).to.deep.equal(["D","D","D"])
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys on a core profile", async function () {
        const response = await request.get("/argo?id=13857_018").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.deep.equal([ "pressure", "pressure_argoqc", "temperature", "temperature_argoqc" ])
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct units on a core profile", async function () {
        const response = await request.get("/argo?id=13857_018").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({"pressure": "decibar", "pressure_argoqc": "null", "temperature":"degree_Celsius", "temperature_argoqc":"null" })
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return correct units on a core profile", async function () {
        const response = await request.get("/argo?id=13857_018&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({"pressure": "decibar", "pressure_argoqc": "null", "temperature":"degree_Celsius", "temperature_argoqc":"null" })
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys_mode on a core profile", async function () {
        const response = await request.get("/argo?id=13857_018").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys_mode).to.deep.equal({"pressure": "R", "pressure_argoqc": "null", "temperature":"R", "temperature_argoqc":"null" })
      });
    });

    describe("GET /argo", function () {
      it("argo with data=metadataOnly filter should still return correct data_keys_mode on a core profile", async function () {
        const response = await request.get("/argo?id=13857_018&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys_mode).to.deep.equal({"pressure": "R", "pressure_argoqc": "null", "temperature":"R", "temperature_argoqc":"null" })
      });
    });

    describe("GET /argo", function () {
      it("argo with compression=array should return correct data_keys_mode on a core profile", async function () {
        const response = await request.get("/argo?id=13857_018&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys_mode).to.deep.equal(["R", "null", "R", "null"])
      });
    });

    describe("GET /argo", function () {
      it("argo with compression=array should return correct units on a core profile", async function () {
        const response = await request.get("/argo?id=13857_018&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal(["decibar", "null", "degree_Celsius", "null"])
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys on a bgc profile", async function () {
        const response = await request.get("/argo?id=4901283_021").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.deep.equal([ "doxy", "doxy_argoqc", "pressure", "pressure_argoqc", "salinity", "salinity_argoqc", "salinity_sfile", "salinity_sfile_argoqc", "temperature", "temperature_argoqc", "temperature_sfile", "temperature_sfile_argoqc" ])
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct units on a bgc profile", async function () {
        const response = await request.get("/argo?id=4901283_021").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({ "doxy": "micromole/kg", "doxy_argoqc": "null", "pressure":"decibar", "pressure_argoqc": "null", "salinity":"psu", "salinity_argoqc":"null", "salinity_sfile":"psu", "salinity_sfile_argoqc":"null", "temperature":"degree_Celsius", "temperature_argoqc":"null", "temperature_sfile": "degree_Celsius", "temperature_sfile_argoqc": "null" })
      });
    });

    describe("GET /argo", function () {
      it("argo with no data filter should still return correct data_keys_mode on a bgc profile", async function () {
        const response = await request.get("/argo?id=4901283_021").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys_mode).to.deep.equal({ "doxy": "D", "doxy_argoqc": "null", "pressure":"D", "pressure_argoqc": "null", "salinity":"D", "salinity_argoqc":"null", "salinity_sfile":"D", "salinity_sfile_argoqc":"null", "temperature":"D", "temperature_argoqc":"null", "temperature_sfile": "D", "temperature_sfile_argoqc": "null" })
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return argo-consistent data", async function () {
        const response = await request.get("/argo?id=4901283_021&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return correct data_keys", async function () {
        const response = await request.get("/argo?id=4901283_021&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members( [ "doxy", "doxy_argoqc", "pressure", "pressure_argoqc", "salinity", "salinity_argoqc", "salinity_sfile", "salinity_sfile_argoqc", "temperature", "temperature_argoqc", "temperature_sfile", "temperature_sfile_argoqc" ])
      });
    });

    describe("GET /argo", function () {
      it("argo with data=all filter should return correct units", async function () {
        const response = await request.get("/argo?id=13857_018&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({"pressure": "decibar", "pressure_argoqc": "null", "temperature": "degree_Celsius", "temperature_argoqc": "null"})
      });
    });

    describe("GET /argo", function () {
      it("argo levels should get dropped if they dont have requested data", async function () {
        const response = await request.get("/argo?id=4901283_021&data=doxy").set({'x-argokey': 'developer'});
        expect(response.body[0].data[0]['pressure']).to.eql(22)
      });
    });

    describe("GET /argo", function () {
      it("argo profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/argo?id=4901283_022&data=doxy").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argo", function () {
      it("argo levels should come out sorted by pressure", async function () {
        const response = await request.get("/argo?id=4901283_022&data=all").set({'x-argokey': 'developer'});
        p = response.body[0].data.map(x => x.pressure)
        pp = JSON.parse(JSON.stringify(p))
        pp.sort((a,b)=>a-b)
        expect(p).to.deep.equal(pp)
      });
    });

    describe("GET /argo/meta", function () {
      it("argo metadata", async function () {
        const response = await request.get("/argo/meta?id=4901283_m0").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo/meta'].get.responses['200'].content['application/json'].schema);
      });
    });    

    describe("GET /argo", function () {
      it("argo data filtered by platform", async function () {
        const response = await request.get("/argo?platform=4901283").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by source", async function () {
        const response = await request.get("/argo?polygon=[[-34,1],[-34,3],[-36,3],[-36,1],[-34,1]]&startDate=2011-11-01T00:00:00Z&endDate=2011-12-01T00:00:00Z&source=argo_bgc").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(2);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by source negation", async function () {
        const response = await request.get("/argo?polygon=[[-34,1],[-34,3],[-36,3],[-36,1],[-34,1]]&startDate=2011-11-01T00:00:00Z&endDate=2011-12-01T00:00:00Z&source=argo_core,~argo_bgc").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by platform_type", async function () {
        const response = await request.get("/argo?startDate=2011-10-01T00:00:00Z&endDate=2011-12-01T00:00:00Z&platform_type=PALACE").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    }); 

    describe("GET /argo", function () {
      it("argo data filtered by platform_type", async function () {
        const response = await request.get("/argo?startDate=2011-10-01T00:00:00Z&endDate=2011-12-01T00:00:00Z&platform_type=SOLO_W").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(3);
      });
    }); 

    describe("GET /argo/vocabulary", function () {
      it("get list of argo platforms", async function () {
        const response = await request.get("/argo/vocabulary?parameter=platform").set({'x-argokey': 'developer'});
         expect(response.body).to.have.members(['4901283', '13857']) 
      });
    });

    describe("GET /argo/vocabulary", function () {
      it("get list of argo metadata groups", async function () {
        const response = await request.get("/argo/vocabulary?parameter=metadata").set({'x-argokey': 'developer'});
         expect(response.body).to.have.members(["4901283_m1", "4901283_m0", "13857_m0"]) 
      });
    });

    describe("GET /argo/vocabulary", function () {
      it("get list of argo platform types", async function () {
        const response = await request.get("/argo/vocabulary?parameter=platform_type").set({'x-argokey': 'developer'});
         expect(response.body).to.have.members(['SOLO_W', 'PALACE']) 
      });
    });

    describe("GET /argo", function () {
      it("filters on source correctly", async function () {
        const response = await request.get("/argo?startDate=2011-10-01T00:00:00Z&endDate=2011-12-01T00:00:00Z&source=argo_bgc").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(3);
      });
    });

    describe("GET /argo", function () {
      it("minimal compression reponds appropriately", async function () {
        const response = await request.get("/argo?startDate=2011-10-01T00:00:00Z&endDate=2011-12-01T00:00:00Z&source=argo_bgc&compression=minimal").set({'x-argokey': 'developer'});
         expect(response.body).to.eql([["4901283_023", -34.50668290323591, 2.238459475658293, "2011-11-18T08:41:51.000Z", ['argo_bgc', 'argo_core']],["4901283_022",-35.670215, 2.313375, "2011-11-08T08:44:06.000Z",  ['argo_bgc', 'argo_core']],["4901283_021", -35.430227, 1.315393, "2011-10-29T08:43:51.000Z",  ['argo_bgc', 'argo_core']]]) 
      });
    });
    
    describe("GET /argo", function () {
      it("gets correct time for most recent result", async function () {
        const response = await request.get("/argo?platform=4901283&mostrecent=1").set({'x-argokey': 'developer'});
         expect(response.body[0].timestamp).to.eql('2011-11-18T08:41:51.000Z');
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
        const response = await request.get("/argo?metadata=4901283_m1").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(2);
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
        expect(response.body.length).to.eql(3);
      });
    });

  }
})

