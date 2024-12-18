'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    phylotree = require('phylotree'),
    parseNexus = require('./parseNexus');

angular
    .module('portal')
    .directive('phyloTree', phyloTreeDirective);

function startsWithLowerCase(s) {
    var character = s.charAt(0);
    return character == character.toLowerCase();
}

    
/** @ngInject */
function phyloTreeDirective() {
    var directive = {
        restrict: 'E',
      //  templateUrl: '/templates/components/phylotree/phylotree.html',
        template: '<div class="phylotreeContainer" id="phylotreeContainer"></div>',
        scope: {
            datasetKey: '=',
            phyloTreeFileName: '=',
            phyloTreeTipLabel: '='
        },
        link: treeLink,
        controller: phyloTreeCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function treeLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function phyloTreeCtrl($scope, $http, $state) {
        var vm = this;
        vm.loading = true;
       
        function pathToRoot(node) {
            var edgeSelection = [];
            while (node) {
                edgeSelection.push(node);
              node = node.parent;
            }
            return edgeSelection;
          }
        var splitted = vm.phyloTreeFileName.split('.');
        if (splitted.length > 1) {
            vm.fileExtension = splitted[splitted.length - 1];
        }

        $scope.create = function(element) {
           vm.treeElement = element[0].querySelector('.phylotreeContainer');
            var spacingX = 14, spacingY = 30;

           $http.get('/api/source-archive/' + vm.datasetKey + '/' + vm.phyloTreeFileName)
            .then(function(response) {
                console.log(response);
                var nwk;
                var tipTranslation;
                if (['nex', 'nexus'].includes(vm.fileExtension)) {
                var parsedNexus = parseNexus(response.data);
                    nwk = _.get(parsedNexus, 'treesblock.trees[0].newick');
                    tipTranslation = _.get(parsedNexus, 'treesblock.translate');
                } else if (['phy', 'nwk', 'newick', 'tree'].includes(vm.fileExtension)) {
                    nwk = response.data;
                } else {
                    vm.unsupportedFormatError = 'Unsupported file type';
                }
                if (nwk) {
                    vm.tree = new phylotree.phylotree(nwk);
                    if (tipTranslation) {
                        var internals = vm.tree.getInternals();
                        var tips = vm.tree.getTips();
                        [internals, tips].forEach(function(nodes) {
                            for (var i = 0; i < nodes.length; i++) {
                                if (tipTranslation[_.get(nodes[i], 'data.name')]) {
                                  nodes[i].data.name = tipTranslation[nodes[i].data.name];
                                }
                              }
                        });
                      }

                    vm.selectedNode = vm.phyloTreeTipLabel ? vm.tree.getNodeByName(vm.phyloTreeTipLabel.replaceAll(' ', '_')) : null;
                    vm.edgeSelection = vm.selectedNode ? pathToRoot(vm.selectedNode) : [];
                    
                    vm.tree.render({
                        'container': '#phylotreeContainer',
                        'max-radius': 468,
                        'width': 500,
                      //  zoom: true,
                        //'show-menu': false,
                    /*    align-tips: false
              annular-limit: 0.38196601125010515
              attribute-list: []
              binary-selectable: false
              bootstrap: false
              branches: "step"
              brush: true
              collapsible: true
              color-fill: true
              compression: 0.2
              container: "#tree_container"
              draw-size-bubbles: false
              edge-styler: null
              hide: true
              internal-names: false
              is-radial: false
              label-nodes-with-name: false
              layout: "left-to-right"
              left-offset: 0
              left-right-spacing: "fixed-step"
              logger: console {debug: ƒ, error: ƒ, info: ƒ, log: ƒ, warn: ƒ, …}
              max-radius: 768
              maximum-per-level-spacing: 100
              maximum-per-node-spacing: 100
              minimum-per-level-spacing: 10
              minimum-per-node-spacing: 2
              node-span: null
              node-styler: (element, data) => {…}
              node_circle_size: ƒ ()
              reroot: true
              restricted-selectable: false
              scaling: true
              selectable: true
              show-labels: true
              show-menu: true
              show-scale: "top"
              top-bottom-spacing: "fixed-step"
              transitions: null
              zoom: false */
              'show-menu': false,
             'left-right-spacing:': 'fit-to-size',
                        'node-styler': function(element, data) {
                        if (_.get(data, 'data.name') && _.get(data, 'data.name').replaceAll('_', ' ') === vm.phyloTreeTipLabel) {
                            element.style(
                                'fill',
                                '#71b171',
                                'important'
                              );
                        }
                        if (_.get(data, 'data.name') && !data.children) {
                            element.style(
                                'cursor',
                                'pointer'
                              ); 
                        }
                          element.on('click', function(e) {
                           /*  if (typeof onNodeClick === 'function') {
                              onNodeClick(data);
                            } */
                            data.selected_xx = true;
                            console.log(data);
                            if (data.data.name && !data.children) {
                                var searchTerm = '';
                                var parts = data.data.name.split('_');
                                if (parts.length < 3) {
                                    searchTerm = data.data.name.replaceAll('_', ' ');
                                } else {
                                    var firstEpithet = parts.find(startsWithLowerCase);
                                    var firstEpithetIndex = parts.indexOf(firstEpithet);
                                    if (firstEpithetIndex > 1) {
                                        searchTerm = parts.slice(firstEpithetIndex - 1).join(' ');
                                    } else {
                                        searchTerm = data.data.name.replaceAll('_', ' ');
                                    }
                                }
                                

                                $state.go('occurrenceSearchTable', {q: searchTerm, dataset_key: vm.datasetKey});
                            }
                            // tree.getNodeById(data.data.id)
                           // console.log(tree.getNodeByName(data.data.name))
                            });
                        },
                        'edge-styler': function(element, data) {
                           if (vm.edgeSelection.includes(data.target)) {
                            element.style(
                                'stroke',
                                '#71b171',
                                'important'
                              );
                           }
                        }
                      });
                      vm.tree.display.spacing_x(spacingX).update();
                      vm.tree.display.spacing_y(spacingY).update();
                      vm.treeElement.appendChild(vm.tree.display.show());
                }
            });
        };
       // var parsedNexus = parseNexus(testData);
       // var newick = _.get(parsedNexus, 'treesblock.trees.[0].newick');
    }
}

module.exports = phyloTreeDirective;

