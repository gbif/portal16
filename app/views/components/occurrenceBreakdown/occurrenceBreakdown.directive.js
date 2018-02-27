/*
end result:
create chart by setting dimension and optional chart type and other configuration.
change chart dimension and type and config as you see fit.
enable active filtering. If on, then default to occSearch link if no listener provided

config: what dimensions are supported. what types are supported for each type. default type per dimension. ...
        types:
            Print options per type
            supported dimensions

(de)serializer: compact representation of a chart that can be added to the url

transformers/chart formatting: transform the api result to the formats required by the charting library

Optional filter update (provide a filter the directive should listen to)

print options
 */
