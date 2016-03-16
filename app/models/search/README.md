# Considerations on Search

## Match API
The species match API currently ignores author. So for now that will have to be done to ensure proper matching when searching for a full name such as `  http://api.gbif.org/v1/species/match?verbose=true&name=Bacteria%20Agassiz,%201846`.

## Children API
When showing lower classifications it is worth considering what to show. The children api returns children that are not direct as well as those whose placement are uncertain (Marcus knows an example)
```
http://api.gbif.org/v1/species/2435269/children
```
That could be misleading.


