module.exports = [
  {
    'name': 'get',
    'icon': 'gb-icon-map',
    'type': 'normal',
    'items': [
      {
        'name': 'occurrences',
        'url': '/occurrence/search'
      },
      {
        'name': 'species',
        'url': '/species/search'
      },
      {
        'name': 'datasets',
        'url': '/dataset/search'
      },
      {
        'name': 'publishers',
        'url': '/publisher/search'
      },
      {
        'name': 'trends',
        'url': '/analytics/global'
      },
      {
        'name': 'citationGuidance',
        'url': '/citation-guidelines'
      }
    ]
  },
  {
    'name': 'share',
    'icon': 'gb-icon-cloud-upload',
    'type': 'normal',
    'items': [
      {
          'name': 'publishingGuide',
          'url': '/publishing-data'
      },
      {
        'name': 'datasetClasses',
        'url': '/dataset-classes'
      },

      {
        'name': 'endorsement',
        'url': '/become-a-publisher'
      },
      {
        'name': 'standards',
        'url': '/standards'
      },
      {
        'name': 'dataPapers',
        'url': '/data-papers'
      },
      {
        'name': 'citizenScience',
        'url': '/citizen-science'
      }
    ]
  },
  {
    'name': 'tools',
    'icon': 'gb-icon-tools',
    'type': 'mega',
    'items': [
      {
        'name': 'publishers',
        'items': [
          {
            'name': 'ipt',
            'url': '/ipt'
          },
          {
           'name': 'dataValidator',
           'url': '/tools/data-validator'
          },
          {
            'name': 'suggestDataset',
            'url': '/suggest-dataset'
          },
          {
            'name': 'dataRepository',
            'url': '/data-repository',
            'roles': ['DATA_REPO_USER']
          }
        ]
      },
      {
        'name': 'developers',
        'items': [
          {
            'name': 'api',
            'url': '/developer/summary'
          },
          {
            'name': 'gbifSoftware',
            'url': '/data-processing'
          },
          {
            'name': 'rgbif',
            'url': '/tool/81747'
          },
          {
            'name': 'maxent',
            'url': '/tool/81279'
          },
          {
            'name': 'toolsCatalogue',
            'url': '/resource/search?contentType=tool'
          }
        ]
      },
      {
        'name': 'gbifLabs',
        'items': [
          {
            'name': 'speciesMatching',
            'url': '/tools/species-lookup'
          },
          {
            'name': 'nameParser',
            'url': '/tools/name-parser'
          },
          {
            'name': 'observationTrends',
            'url': '/tools/observation-trends'
          },
          {
            'name': 'developerBlog',
            'url': 'http://gbif.blogspot.com',
            'type': 'EXTERNAL'
          }
        ]
      }
    ]
  },
  {
    'name': 'inside',
    'icon': 'gb-icon-info',
    'type': 'mega',
    'items': [
      {
        'name': 'about',
        'items': [
          {
            'name': 'whatIsGbif',
            'url': '/what-is-gbif'
          },
          {
            'name': 'GbifNetwork',
            'url': '/the-gbif-network'
          },
          {
            'name': 'becomeMember',
            'url': '/become-member'
          },
            {
                'name': 'governance',
                'url': '/governance'
            },
          {
            'name': 'funders',
            'url': '/funders'
          },
          {
            'name': 'partnerships',
            'url': '/partners'
          },
          {
            'name': 'strategicPlan',
            'url': '/strategic-plan'
          },
          {
            'name': 'contactUs',
            'url': '/contact-us'
          }
        ]
      },
      {
        'name': 'information',
        'items': [
          {
            'name': 'news',
            'url': '/resource/search?contentType=news'
          },
          {
            'name': 'featuredDataUse',
            'url': '/resource/search?contentType=dataUse'
          },
          {
            'name': 'events',
            'url': '/resource/search?contentType=event'
          },
          {
            'name': 'newsletters',
            'url': '/newsletters'
          },
            {
                'name': 'awards',
                'url': '/awards'
            },
          {
            'name': 'communitySite',
            'url': 'https://discourse.gbif.org',
            'type': 'EXTERNAL'
          }
        ]
      },
      {
        'name': 'ProgrammesProjects',
        'items': [
          {
            'name': 'capacitySupport',
            'url': '/programme/82219/capacity-enhancement-support-programme'
          },
          {
            'name': 'bidProgramme',
            'url': '/programme/82243/bid-biodiversity-information-for-development'
          },
          {
            'name': 'bifaProgramme',
            'url': '/programme/82629/bifa-biodiversity-information-fund-for-asia'
          },
          {
            'name': 'livingAtlases',
            'url': 'http://living-atlases.gbif.org',
            'type': 'EXTERNAL'
          }
        ]
      }
    ]
  }
];
