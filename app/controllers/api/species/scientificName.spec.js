
"use strict";

var sciName = require('./scientificName.ctrl'),
mockNames = require('./names.mock.json');



describe("scientificName formatter", function () {





    it("can format names at family level", function () {



        expect(sciName.formatName(mockNames.Cortinariaceae)).toEqual("Cortinariaceae");


    });
    it("can format names at genus level", function () {



        expect(sciName.formatName(mockNames.Cortinarius)).toEqual("<i>Cortinarius </i>(Pers.) Gray, 1821");


    });
    it("can format names at species level", function () {

        let res = sciName.formatName(mockNames.Cortinarius_splendens);
        expect(res).toEqual("<i>Cortinarius splendens </i>Rob. Henry, 1939");



    });
    it("can format names at variety level", function () {

        let res = sciName.formatName(mockNames.Riocreuxia_torulosa_var_bolusii);
        expect(res).toEqual("<i>Riocreuxia torulosa </i>var. <i>bolusii </i>(N. E. Br.) Masinde");
    });



    it("even knows about hybrids", function () {

        expect(sciName.formatName(mockNames.Elytrigia_juncea_subsp_boreoatlantica_Leymus_arenarius)).toEqual("<i>Elytrigia juncea subsp. boreoatlantica Ã— Leymus arenarius </i>");


    });

    it("and cultivars....", function () {

        expect(sciName.formatName(mockNames.Pilea_mollis_Moonglow)).toEqual("<i>Pilea mollis </i>'Moonglow'");


    });

    it("and weird things like bacterial candidate names", function () {

        expect(sciName.formatName(mockNames.Candidatus_Protochlamydia_amoebophila)).toEqual("\"<i>Candidatus </i>Protochlamydia amoebophila\" Collingro et al., 2005");


    });








});


