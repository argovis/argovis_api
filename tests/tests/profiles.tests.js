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
      it("searches for cchdo profiles with data=metadata-only", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=metadata-only").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/cchdo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo metadata-only should still have units and data_keys", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=metadata-only").set({'x-argokey': 'developer'});
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
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-58,-42],[-58,-43],[-57,-43],[-57,-42]]&data=salinity_btl,oxygen_btl&compression=basic").set({'x-argokey': 'developer'});
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
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-57.8,-42],[-57.8,-43],[-57,-43],[-57,-42]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members([ "temperature_btl_woceqc", "bottle_number_btl_woceqc", "bottle_number_btl", "temperature_btl", "oxygen_btl_woceqc", "pressure", "pressure_ctd_woceqc", "oxygen_btl", "temperature_ctd", "salinity_btl", "oxygen_ctd", "potential_temperature_c_btl", "sample_ctd", "sample_btl", "salinity_btl_woceqc", "bottle_salinity_btl_woceqc", "oxygen_ctd_woceqc", "ctd_pressure_raw_btl", "bottle_salinity_btl", "temperature_ctd_woceqc", "salinity_ctd_woceqc", "salinity_ctd" ])
      });
    });

    describe("GET /cchdo", function () {
      it("cchdo with data=all filter should return correct units", async function () {
        const response = await request.get("/cchdo?polygon=[[-57,-42],[-57.8,-42],[-57.8,-43],[-57,-43],[-57,-42]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({"temperature_btl_woceqc":  "null","bottle_number_btl_woceqc":  "null","bottle_number_btl":  "null","temperature_btl":  "Celsius","oxygen_btl_woceqc":  "null","pressure":  "decibar","pressure_ctd_woceqc":  "null","oxygen_btl":  "micromole/kg","temperature_ctd":  "null","salinity_btl":  "psu","oxygen_ctd":  "null","potential_temperature_c_btl":  "Celsius","sample_ctd":  "null","sample_btl":  "null","salinity_btl_woceqc":  "null","bottle_salinity_btl_woceqc":  "null","oxygen_ctd_woceqc":  "null","ctd_pressure_raw_btl":  "decibar","bottle_salinity_btl":  "psu","temperature_ctd_woceqc":  "null","salinity_ctd_woceqc":  "null","salinity_ctd" :  "null"})
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

    describe("GET /cchdo", function () {
      it("check that a source filter on cchdo works as expected", async function () {
        const response = await request.get("/cchdo?source=cchdo_woce&startDate=1996-04-01T00:00:00Z&endDate=1996-05-01T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5)
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
      it("searches for argo profiles with data=metadata-only", async function () {
        const response = await request.get("/argo?id=4901283_021&data=metadata-only").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argo'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argo", function () {
      it("argo metadata-only should still have units and data_keys for BGC profiles", async function () {
        const response = await request.get("/argo?id=4901283_021&data=metadata-only").set({'x-argokey': 'developer'});
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
        const response = await request.get("/argo?id=4901283_021&data=salinity,doxy&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal(["psu","micromole/kg","decibar"])
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

    describe("GET /argo/vocabulary", function () {
      it("get list of argo profiles", async function () {
        const response = await request.get("/argo/vocabulary?parameter=platform").set({'x-argokey': 'developer'});
         expect(response.body).to.have.members(['4901283', '13857']) 
      });
    });

    describe("GET /argo", function () {
      it("filters on source correctly", async function () {
        const response = await request.get("/argo?startDate=2011-10-01T00:00:00Z&endDate=2011-12-01T00:00:00Z&source=argo_bgc").set({'x-argokey': 'developer'});
         expect(response.body.length).to.eql(3);
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

    // legacy profiles route

    describe("GET /profiles", function () {
      it("searches for profiles by date", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00.000Z&endDate=2006-04-16T00:00:00.000Z&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("searches for profiles by date and geo", async function () {
        const response = await request.get("/profiles?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("gets only pressure measurements", async function () {
        const response = await request.get("/profiles?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&data=pres&compression=basic").set({'x-argokey': 'developer'});
  
        expect(response.body[0].data_keys).to.eql(['pres']);
      });
    });

    // describe("GET /profiles", function () {
    //   it("fails on too long a date range", async function () {
    //     const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-04-01T00:00:00.000Z&compression=basic").set({'x-argokey': 'developer'});
    //     expect(response.status).to.eql(400);
    //   });
    // });

    describe("GET /profiles", function () {
      it("gets profiles for one platform", async function () {
        const response = await request.get("/profiles?platform=2900448&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("fails on too many platforms", async function () {
        const response = await request.get("/profiles?platforms=4902911,9999&compression=basic").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("fails with an unclosed polygon", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743936]]&compression=basic").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("cuts off pressures greater than 100", async function () {
        const response = await request.get("/profiles?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&data=pres&presRange=0,100&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body[0].data[response.body[0].data.length-1][0]).to.be.lessThan(100)
      });
    });

    describe("GET /profiles", function () {
      it("should find 2 profiles within a 20 km of this point", async function () {
        const response = await request.get("/profiles?platform=2900448&center=134.25,36.16&radius=20&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(2)
      });
    });

    describe("GET /profiles", function () {
      it("should only return KO profiles", async function () {
        const response = await request.get("/profiles?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&dac=KO&compression=basic").set({'x-argokey': 'developer'});
        dacs = response.body.map(p => p.data_center)
        s = new Set(dacs)
        expect(Array.from(s)).to.eql(['KO'])
      });
    });

    describe("GET /profiles", function () {
      it("fails to find any nitrate in BGC measurements", async function () {
        const response = await request.get("/profiles?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&data=nitrate&compression=basic").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });   

    describe("GET /profiles", function () {
      it("finds a core temperature measurement on the given day", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-04-16T00:00:00Z&data=temp&compression=basic").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(200);
      });
    });

    describe("GET /profiles/overview", function () {
      it("summarizes profile collection", async function () {
        const response = await request.get("/profiles/overview").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles/overview'].get.responses['200'].content['application/json'].schema);   
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with doxy data", async function () {
        const response = await request.get("/profiles/listID?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&data=doxy").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['2900448_060','2900448_061'])  
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with a core salinity measurement", async function () {
        const response = await request.get("/profiles/listID?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&data=psal").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['2900448_060','2900448_061'])
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("fails to find any profile IDs with nitrate in BGC measurements", async function () {
        const response = await request.get("/profiles/listID?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z&polygon=[[134.23095703125,38.05674222065296],[131.912841796875,34.7506398050501],[136.219482421875,34.56990638085636],[134.23095703125,38.05674222065296]]&data=nitrate").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });   

    describe("GET /profiles/listID", function () {
      it("fails to find a profile with doxy on the given day", async function () {
        const response = await request.get("/profiles/listID?startDate=2006-05-17T00:00:00.000Z&endDate=2006-05-18T00:00:00.000Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=doxy").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /profiles", function () {
      it("should only return bgc profiles", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&source=argo_bgc").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(3)
      });
    });

    describe("GET /profiles", function () {
      it("should only return argo_core profiles that dont have associated argo_bgc", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&source=argo_core,~argo_bgc").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1)
      });
    });

    describe("GET /profiles", function () {
      it("should only return profiles with doxy", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=doxy").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(3)
      });
    });

    describe("GET /profiles", function () {
      it("should only return profiles with temp", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=temp").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(4)
      });
    });

    describe("GET /profiles", function () {
      it("should only return profiles with temp AND doxy", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=temp,doxy").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(3)
      });
    });

    describe("GET /profiles", function () {
      it("should handle data=all correctly", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(4)
      });
    });

    describe("GET /profiles", function () {
      it("should not return anything due to presRange being empty", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=temp&presRange=10000,20000").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /profiles", function () {
      it("should append pres even if not requested", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=doxy").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(['doxy', 'pres'])
      });
    });

    describe("GET /profiles", function () {
      it("should not return a profile if it had coerced pressure alone", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=chla").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /profiles", function () {
      it("should handle data='metadata-only", async function () {
        const response = await request.get("/profiles?id=2900448_060&data=metadata-only").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    });

    describe("GET /profiles", function () {
      it("should suppress levels that don't have a doxy value", async function () {
        const response = await request.get("/profiles?id=2900448_060&data=doxy").set({'x-argokey': 'developer'});
        expect(response.body[0].data[1].doxy).to.eql(258.24920654296875);
      });
    });

    describe("GET /profiles", function () {
      it("should suppress anything with dissolved oxygen", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=pres,psal,~doxy").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    });

    describe("GET /profiles", function () {
      it("should suppress anything with dissolved oxygen, in isolation", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=~doxy").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    });

    describe("GET /profiles", function () {
      it("make sure metadata-only interacts nicely with data negation", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=metadata-only,~doxy").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    });

    describe("GET /profiles", function () {
      it("make sure data=all interacts nicely with data negation", async function () {
        const response = await request.get("/profiles?startDate=2006-04-15T00:00:00Z&endDate=2006-05-18T00:00:00Z&polygon=[[133.330078125,38.89103282648846],[133.0224609375,35.639441068973944],[135.4833984375,35.71083783530009],[135.615234375,38.75408327579141],[133.330078125,38.89103282648846]]&data=all,~doxy").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    });

    describe("GET /profiles", function () {
      it("capture only the intersection with multipolygon", async function () {
        const response = await request.get("/profiles?multipolygon=[[[134,36],[135,36],[135,37],[134,37],[134,36]],[[134,36],[134.5,36],[134.5,37],[134,37],[134,36]]]").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(2);
      });
    });
  }
})