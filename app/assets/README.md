# assets

This folder is copied as is into the public folder. 

###Favicons, manifest etc
favicons are recommended to be placed in the root.
Generated with [http://realfavicongenerator.net/](http://realfavicongenerator.net/)
We could do it as a gulp task `gulp-real-favicon` that would then include the newest and fanciest icons as new platforms come out. 
But for know hardcoding them seems fine.


###Icon font
> The icon font still needs some attention. It is not obvious that it scales well to smaller fonts.

The icon font is build separately and the corresponding css generated. This is a separate build done when new icons is needed in the font.
To append an icon to the font add the svg to `app/assets/icons/used`.
`app/assets/icons/all` is a set of icons that might be useful and provides a style guide for custom icons. 
The list of icons can also be seen here [http://themes-pixeden.com/font-demos/7-stroke/](http://themes-pixeden.com/font-demos/7-stroke/).
Build using 
```
gulp fonts
```
This will create the fonts and place them at `app/assets/iconfont/`.
and also create a stylus file and copy it to `app/views/shared/style/fonts`. When located there it will be injected into the main css file along with the other stylus files once the project is build. 

### Why template the stylus file for the font ?
The stylus file is based on the template `icons/fonttemplate.nunjucks.styl`. Templating the stylus file allows us to use variables to reference the ascii chars used to represents the various icons. This is useful because they are cumbersome to write and can change between builds. 

If we want to insert the home icon using css we need to refer to the char in the font. But the char can change between builds. So `content: "\EA02";` won't work as it can have changed to `"\EA03"` next time. Instead the template generates sstylus variables a la `$icon-string-menu = "\EA03"`. The variable `$icon-string-menu` can then be used instead.




