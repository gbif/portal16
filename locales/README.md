# Translations

## For developers

### Adding a new language

Adding a new language requires some configuration. Primarily in `config/locales`.

You need to add the new language as it appears in the url.
For that name, say 'ru' you also need to add mappings to what language code it corresponds to in other systems, libraries etc. E.g. what map language should be used (we might not support all). What is this locale called in Moment.js. etc.

**Add the locale as an option**
in `config/locales/` you should add it to the `locales` array. This is the name by which it will appear in the url.

**Do you need articles to be translatable in contentful?**
1) If so you need to configure contentful to support your new language
2) add a mapping between the contentful language code and the one you specified as the site code (`locales`). You can do so in `config/locales/`.
If there is no corresponding language in contentful then ignore this step.

**Time in moment.js**
Check that the moment library that we use for timestamps etc is recognizing this format. if not you should map it to the corresponding momentJs one in `config/locales/`
You need to include the moment configuration for your new language. This is done with a `require('moment/locales/da')` in `views/shared/layout/html/html.js` . By default it will use the url locale.

**Add language code**
What is the language code as listed in your translation file. Typically a 3 letter iso

**What language code should be used for numbers**
By default it will use the url locale. This is the locale used when calling '123456789'.toLocaleString(LOCALE) in the browser.

**Adding the translation to crowdin**
Tell crowdin that this language should be supported.


### Easing the work of the translators
Lists of language names and country names can be found online. Generating a JSON-file with these and uploading them to Crowdin will ease translators work quite a lot.

### Be careful when changing the english text
Any change to the english text will delete translations. Even a comma. It is no longer the same text and Crowdin will delete it all. If you do not believe it to be essential, then you need to restore the translations afterwards.

### Don't move translation files around
When doing so crowdin gets confused - it keeps the oirginal file structure - kind of. The interface might then have duplicates, files that the translators can translate, but isn't synced. It sucks. If you do need to move files, then the same files needs to be manually moced in the Crowdin interface.

## For translators
It is of course best if everything is translated, but it is possible to only translate parts of the site, but in some cases it will mean that two adjacent words will be in different languages.

We suggest that you start with:

in `components`
1) menu, homepage, profile, feedback, terms, footer, health
2) search, speciesSearch, datasetSearch, occurrenceSearch, publisherSearch, pagination, counts, filters, filterNames, intervals, downloadReport, phrases
3) species, [occurrenceKey, occurrenceFieldNames], dataset, [resource, cms]
4) metrics, map, galleryBar, downloads
5) publisher, [participant, country],
6) the remaining ...

`enums`


