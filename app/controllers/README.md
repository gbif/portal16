# controllers

All files matching '/app/controllers/**/*.ctrl.js' is assumed to be routes and included automatically from './config.express.js'.

> This remainder of the document is inteded for those new to building web application but eager to contribute.

This is where the routes are handled and their corresponding logic goes.
Controllers have a corresponding page located in `/app/views/pages`

## Natural language examples

```
If the user asks for the url '/blogpost/my-first-blog-post'
then return 'my-first-blog-post.html'

Or more complex

If the user asks for the url '/blogpost/my-first-blog-post'
then {
	get article from the article api
	render article using a template
	return rendered article
}

Or even more complex

If the user asks for the url '/blogpost/my-first-blog-post'
then get the data nicely formatted via '../models/blogpost'
return rendered template with the model data
```

## Files
All routes have a seperate file. And if it is a complex controller it might be sensible to split the processing into multiple files.

## What goes into the controller and model? 

Business logic belongs in models and view specific code in the controller.

### Example
You have a route that shows a page with information about a species and the latest known occurrence.

**Controller**
Your controller would get the species through a model and ask an occurrence model for the latest of the species in question. It wouldn't go to the API itself. Once it have the data from the models it might have some view specific logic. e.g. formatting the datefields that the view will use. Complex view conditions should also be done here. The view (template) is not a good place to do complex logic. The view should have as little logic as possible.

**Model**
If you need information about a species it would make sense to create a species model. The model would then fetch the data from the API. It might also add often needed extra information. And return the data as a nicely formatted object with various getters to make life easier. The same goes for the occurrence.



