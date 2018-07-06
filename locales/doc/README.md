
# About translations

### Getting started

Translations are done using the website [Crowdin](https://crowdin.com/) - so you need an account for that.

1. Have you recieved an invitation email with a link?
    * Yes: Then simply follow the link and login/create account.
    * No: go to the [GBIF.org project](https://crowdin.com/project/gbif-portal). Select the language you would like to translate. Press `Join`. We will then add you to the translator team.
2. Start translating. It is fairly intuitive to get started, but there is also a [detailed video](https://www.youtube.com/watch?v=bxdC7MfrO7A) that goes into many of the features of the product that you can see if you are curious to optimize your process.

### What to translate
It is of course best if everything is translated, but it is possible to only translate parts of the site, but in some cases it will mean that two adjacent words will be in different languages.

We suggest that you start with:

in `components`
1) menu, homepage, profile, feedback, terms, footer, healthSummary
2) search, speciesSearch, datasetSearch, occurrenceSearch, publisherSearch, pagination, counts, filters, filterNames, intervals, downloadReport, phrases
3) species, [occurrenceKey, occurrenceFieldNames], dataset, [resource, cms]
4) metrics, map, galleryBar, downloads
5) publisher, [participant, country],
6) the remaining ...

`enums`

### Variables, pluralizations and Markdown
Most translations strings is simply english text, but some of them is more complex and have characters with special meaning. Some of them should not be translated and others should be changed and added to.

**Markdown**

Markdown is a simple way to write HTML (the format used to define links headlines, and regular text). Instead of writing `<h1>Headline</h1>`, one can write `#Headline`. In cases where the translation includes e.g. a link Markdown is used. To properly translate Markdown, you need to know what to translate and what to leave as it is. Read more [about markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) and [try writing something](https://dillinger.io/) to get a feed for it.

**Variables**

Sometimes we need to replace a single word in a sentence. For example: `Welcome back {USER_FIRST_NAME}` could become `Welcome back Charles`. Variables are demarked by curly brackets `{}` and should not be translated. So the danish translation would be `Velkommen tilbage {USER_FIRST_NAME}`. It is fine to move the variable somewhere else if your translation require it. E.g. `{USER_FIRST_NAME}, back you are.`

**Plurals**

In english you would say `0 occurrenceS, 1 occurrence, 2 occurrenceS`. Other languages pluralize differently and might have more forms. [Message format](https://messageformat.github.io/messageformat/page-guide) is used for pluralization.  And looks like this `{NUMBER_FORMATED} {NUMBER, select, 0{occurrences} 1{occurrence} other{occurrences}}`. In this translation string we see 2 variables: `{NUMBER_FORMATED}` and `NUMBER`. But there is also some markup that defines what to write depending on the value of `NUMBER`. The numeric input is mapped to a plural category, some subset of zero, one, two, few, many, and other depending on the locale and the type of plural. 

* zero: This category is used for languages that have grammar specialized specifically for zero number of items. (Examples are Arabic and Latvian.)
* one: This category is used for languages that have grammar specialized specifically for one item. Many languages, but not all, use this plural category. (Many popular Asian languages, such as Chinese and Japanese, do not use this category.)
* two: This category is used for languages that have grammar specialized specifically for two items. (Examples are Arabic and Welsh.)
* few: This category is used for languages that have grammar specialized specifically for a small number of items. For some languages this is used for 2-4 items, for some 3-10 items, and other languages have even more complex rules.
* many: This category is used for languages that have grammar specialized specifically for a larger number of items. (Examples are Arabic, Polish, and Russian.)
* other: This category is used if the value doesn't match one of the other plural categories. Note that this is used for "plural" for languages (such as English) that have a simple "singular" versus "plural" dichotomy.

### screenshots of the absolute basics

![Select a language](./img/select_language.png?raw=true)
![Select a file](./img/select_file.png?raw=true)
![Select when translating](./img/translation_interface.jpg?raw=true)
![variables](./img/variables.png?raw=true)
![plurals](./img/plurals.png?raw=true)



