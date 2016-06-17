This file is used for documenting the rationale of the organisation of dataset information, mainly during early development phase. It maybe abstract or incomplete. If it evolve into more comprehensive form, we should consider either provide it as inline comments together with code or in the wiki.

Status: awaiting KyleB putting together more information before this document gets better. See (this issue)[http://dev.gbif.org/issues/browse/POR-3091] for more information.

### Roles mapping and prioritisation
From [GBIF API](https://github.com/gbif/gbif-api/blob/master/src/main/java/org/gbif/api/vocabulary/ContactType.java#L33), these roles are possibly to appear together with contacts:
```
  TECHNICAL_POINT_OF_CONTACT,
  ADMINISTRATIVE_POINT_OF_CONTACT,
  POINT_OF_CONTACT,
  ORIGINATOR,
  METADATA_AUTHOR,
  PRINCIPAL_INVESTIGATOR,
  AUTHOR,
  CONTENT_PROVIDER,
  CUSTODIAN_STEWARD,
  DISTRIBUTOR,
  EDITOR,
  OWNER,
  PROCESSOR,
  PUBLISHER,
  USER,
  PROGRAMMER,
  DATA_ADMINISTRATOR,
  SYSTEM_ADMINISTRATOR,
  HEAD_OF_DELEGATION,
  TEMPORARY_HEAD_OF_DELEGATION,
  ADDITIONAL_DELEGATE,
  TEMPORARY_DELEGATE,
  REGIONAL_NODE_REPRESENTATIVE,
  NODE_MANAGER,
  NODE_STAFF
```

For IPT, the metadata forms follows [EML Agent Role Vocabulary](http://rs.gbif.org/vocabulary/gbif/agent_role.xml) to provide avaiable roles:

```
  author,
  contentProvider,
  custodianSteward,
  distributor,
  editor,
  metadataProvider,
  originator,
  owner,
  pointOfContact,
  principalInvestigator,
  processor,
  publisher,
  user,
  programmer,
  curator
```
