/* eslint-disable no-undef */
'use strict';

let sciName = require('./scientificName.ctrl'),
    mockNames = require('./names.mock.json');


describe('scientificName formatter', function() {
    it('can format names at levels at phylum level', function() {
        expect(sciName.formatName(mockNames.Euryarchaeota)).toEqual('Euryarchaeota');
    });

    it('can format names at family level', function() {
        expect(sciName.formatName(mockNames.Cortinariaceae)).toEqual('Cortinariaceae');
    });
    it('can format names at genus level', function() {
        expect(sciName.formatName(mockNames.Cortinarius)).toEqual('<i>Cortinarius </i>(Pers.) Gray, 1821');
    });
    it('can format names at species level', function() {
        expect(sciName.formatName(mockNames.Cortinarius_splendens)).toEqual('<i>Cortinarius splendens </i>Rob. Henry, 1939');
    });
    it('can format names at variety level with correct italization and rankmarker', function() {
        expect(sciName.formatName(mockNames.Riocreuxia_torulosa_var_bolusii)).toEqual('<i>Riocreuxia torulosa </i>var. <i>bolusii </i>(N. E. Br.) Masinde');
    });
    it('even knows about hybrids', function() {
        expect(sciName.formatName(mockNames.Elytrigia_juncea_subsp_boreoatlantica_Leymus_arenarius)).toEqual('<i>Elytrigia juncea subsp. boreoatlantica Ã— Leymus arenarius </i>');
    });
    it('and cultivars....', function() {
        expect(sciName.formatName(mockNames.Pilea_mollis_Moonglow)).toEqual('<i>Pilea mollis </i>\'Moonglow\'');
    });
    it('and weird things like bacterial candidate names', function() {
        expect(sciName.formatName(mockNames.Candidatus_Protochlamydia_amoebophila)).toEqual('"<i>Candidatus </i>Protochlamydia amoebophila" Collingro et al., 2005');
    });
    it('simply italicizes informal names of ranks lower than family', function() {
        expect(sciName.formatName(mockNames.Linum_cf_prostratum)).toEqual('<i>Linum cf. prostratum Weigend 7324 </i>');
    });
    it('can format named hybrids', function() {
        expect(sciName.formatName(mockNames.Asplenium_X_alternifolium_subsp_alternifolium)).toEqual('<i>Asplenium ×alternifolium subsp. alternifolium </i>Wulfen');
    });
});


