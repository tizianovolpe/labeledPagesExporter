# README #

An indesign script to export labeled pages to PDF, JPEG or PNG
[more information: smartmix.it](https://smartmix.it/grafica-design/labeled-pages-exporter-indesign)

## How do I get set up? ##

* [install the script](https://indesignsecrets.com/how-to-install-scripts-in-indesign.php)
* Apply color label to pages
* Execute the script Labeled Pages Exporter, change language in the settings section
* Select the color label you need to export, you can select more than one label
* Select the exportation format: PDF, JPG or PNG
* Export

## Translations ##
add or modify translations editing the [lang.js](lang.js) file

### change default language ###
```
var lang = {
    'current-lang':'your-language-code'
    ...
}
```


### add new translation ###

```
var lang = {
    'en':{
        ...
    },
    'it:{
        ....
    },
    'your-new-language':{
        use the english value name and translate in your language
    }
}
```

## Author ##

* **Tiziano Volpe** - *Smart Mix* - [smartmix.it](https://smartmix.it)
