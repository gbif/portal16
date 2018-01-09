'use strict';


var angular = require('angular'),
    _ = require('lodash');

require('./occurrenceTaxonomy.resource');

angular
    .module('portal')
    .directive('occurrenceTaxonomy', occurrenceTaxonomyDirective);

/** @ngInject */
function occurrenceTaxonomyDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceTaxonomy/occurrenceTaxonomy.html?v=' + BUILD_VERSION,
        scope: {
            filter: '=',
            options: '='
        },
        //link: chartLink,
        controller: occurrenceTaxonomy,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function chartLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceTaxonomy($scope, $state, OccurrenceFrequentTaxa, OccurrenceFilter, OccurrenceTaxonSearch) {
        var vm = this;
        vm.fullTree = {children:[]};

        function updateTree() {
            if (_.get(vm.frequent, '$cancelRequest')) {
                vm.frequent.$cancelRequest();
            }
            var filter = vm.filter || {};
            var q = _.merge({}, filter, vm.options);
            vm.frequent = OccurrenceFrequentTaxa.query(q);
            vm.tree = undefined;
            vm.frequent.$promise
                .then(function (data) {
                    console.log(data.tree);
                    vm.tree = data.tree;
                })
                .catch(function (err) {
                    console.log(err);
                });
        }

        var ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
        vm.appendTaxa = function (item) {
            if (item.children.length > 0) {
                item.children = [];
                item.expanded = false;
                return;
            }
            item.expanded = true;
            var filter = vm.filter || {};
            var customQuery = {offset: item.children.length, limit: 20, taxonKey: item.key};
            var rank = item.rank || '';
            var nextRank = ranks[ranks.indexOf(rank.toLowerCase()) + 1];
            if (!nextRank) {
                item.loading = false;
                return;
            }
            customQuery.type = nextRank;
            var query = _.merge({}, filter, customQuery);
            item.loading = true;
            OccurrenceTaxonSearch.query(query, function (data) {
                //item.children = [{scientificName: '234', children: []}, {scientificName: '234', children: []}];
                data.results.forEach(function(e){
                    e.children = [];
                });
                item.children = _.concat(item.children, data.results);
                if (item.children.length)
                //item.children.splice(-1, 0, data.results);
                //item.children.push({scientificName: '234', children: []});
                item.endOfRecords = data.endOfRecords;
                item.loading = false;
            }, function () {
                //TODO handle request error
            });
        };
        function restartTree() {
            vm.fullTree = {children:[]};
            vm.appendTaxa(vm.fullTree);
        }
        restartTree();


        vm.search = function (taxonKey) {
            if ($state.current.parent == 'occurrenceSearch') {
                OccurrenceFilter.updateParam('taxon_key', [taxonKey]);
            } else {
                var filter = vm.filter || {};
                var q = _.merge({}, filter, {taxon_key: taxonKey});
                $state.go('occurrenceSearchTable', q);
            }
        };

        //$scope.create = function (element) {
        //    vm.chartElement = element[0].querySelector('.chartArea');
        //    updateChart('month');
        //};

        $scope.$watchCollection(function () {
            return vm.options
        }, function () {
            updateTree();
        });

        $scope.$watchCollection(function () {
            return vm.filter
        }, function () {
            updateTree();
            restartTree();
        });
    }
}

module.exports = occurrenceTaxonomyDirective;

var tester = {"rank":"kingdom","children":[{"key":1,"nubKey":1,"nameKey":13352168,"taxonID":"gbif:1","kingdom":"Animalia","kingdomKey":1,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"Animalia","canonicalName":"Animalia","authorship":"","nameType":"SCIENTIFIC","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"ACCEPTED","nomenclaturalStatus":[],"remarks":"","publishedIn":"Linnæus, Carolus.  1758. Systema naturae per regna tria naturae, secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis. Laurentii Salvii, Holmiae [= Stockholm].  Vol. Tomus I,  Editio decima, reformata: i-ii, 1-824.","numDescendants":2323575,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T12:05:57.974+0000","issues":[],"synonym":false,"_count":6331186,"$$hashKey":"object:130","children":[{"key":1,"nubKey":1,"nameKey":13352168,"taxonID":"gbif:1","kingdom":"Animalia","kingdomKey":1,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"Animalia","canonicalName":"Animalia","authorship":"","nameType":"SCIENTIFIC","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"ACCEPTED","nomenclaturalStatus":[],"remarks":"","publishedIn":"Linnæus, Carolus.  1758. Systema naturae per regna tria naturae, secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis. Laurentii Salvii, Holmiae [= Stockholm].  Vol. Tomus I,  Editio decima, reformata: i-ii, 1-824.","numDescendants":2323575,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T12:05:57.974+0000","issues":[],"synonym":false,"_count":6331186}],"endOfRecords":true},{"key":6,"nubKey":6,"nameKey":13566757,"taxonID":"gbif:6","kingdom":"Plantae","kingdomKey":6,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"Plantae","canonicalName":"Plantae","authorship":"","nameType":"SCIENTIFIC","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"ACCEPTED","nomenclaturalStatus":[],"remarks":"","numDescendants":800354,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T13:09:40.175+0000","issues":[],"synonym":false,"_count":905055,"$$hashKey":"object:131"},{"key":5,"nubKey":5,"nameKey":13559875,"taxonID":"gbif:5","kingdom":"Fungi","kingdomKey":5,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"Fungi","canonicalName":"Fungi","authorship":"","nameType":"SCIENTIFIC","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"ACCEPTED","nomenclaturalStatus":[],"remarks":"","publishedIn":"Bot. Mar. 23: 371 (1980)","numDescendants":259402,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T13:02:32.067+0000","issues":[],"synonym":false,"_count":84591,"$$hashKey":"object:132"},{"key":7,"nubKey":7,"nameKey":13590911,"taxonID":"gbif:7","kingdom":"Protozoa","kingdomKey":7,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"Protozoa","canonicalName":"Protozoa","authorship":"","nameType":"SCIENTIFIC","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"ACCEPTED","nomenclaturalStatus":[],"remarks":"","numDescendants":18599,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T13:36:57.343+0000","issues":[],"synonym":false,"_count":1219,"$$hashKey":"object:133"},{"key":4,"nubKey":4,"nameKey":13556905,"taxonID":"gbif:4","kingdom":"Chromista","kingdomKey":4,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"Chromista","canonicalName":"Chromista","authorship":"","nameType":"SCIENTIFIC","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"ACCEPTED","nomenclaturalStatus":[],"remarks":"","numDescendants":100630,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T13:00:47.352+0000","issues":[],"synonym":false,"_count":732,"$$hashKey":"object:134"},{"key":3,"nubKey":3,"nameKey":13555164,"taxonID":"gbif:3","kingdom":"Bacteria","kingdomKey":3,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"Bacteria","canonicalName":"Bacteria","authorship":"","nameType":"SCIENTIFIC","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"ACCEPTED","nomenclaturalStatus":[],"remarks":"","numDescendants":26326,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T13:00:10.285+0000","issues":[],"synonym":false,"_count":137,"$$hashKey":"object:135"},{"key":0,"nubKey":0,"nameKey":13592277,"taxonID":"gbif:0","kingdom":"incertae sedis","kingdomKey":0,"datasetKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","constituentKey":"d7dddbf4-2cf0-4f39-9b2a-bb099caae36c","scientificName":"incertae sedis","canonicalName":"incertae sedis","authorship":"","nameType":"PLACEHOLDER","rank":"KINGDOM","origin":"SOURCE","taxonomicStatus":"DOUBTFUL","nomenclaturalStatus":[],"remarks":"","numDescendants":12499,"lastCrawled":"2017-02-14T13:42:21.926+0000","lastInterpreted":"2017-02-14T13:37:11.829+0000","issues":[],"synonym":false,"_count":94,"$$hashKey":"object:136"}],"endOfRecords":true};
