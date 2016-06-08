### Principles of naming of the style-related code

First thing first, calling it "principle" means rules are not strict. This is because we find that it's not always possible to come up with a naming that is immediately comprehensible. So when needed we check about naming.

We follow BEM described in [this post](http://cssguidelin.es/#bem-like-naming) as the principle of CSS naming. For separating block, element or modifier, we use double underscore "__". For block, element and modifier, if more words are needed, we use hyphen "-" to connect words.

Camel case strings suggest function, or calculation related identifiers. So we use camel case for mixins and variables. And for variables, we always start the identifier with a dollar sign. When it's useful to apply a BEM like naming for variables, single underscore "_" is used.

