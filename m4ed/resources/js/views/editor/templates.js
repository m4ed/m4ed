// Filename:
define([
  'jquery',
  'hogan'
],
function($, hogan) {

  return {

    item: hogan.compile($('#item-template').html()),

    // Editor templates
    // -------------------------------------

    editor: hogan.compile($('#editor-template').html()),
    dropdownToggle: hogan.compile($('#editor-dropdown-toggle').html()),
    button: hogan.compile('<i class="icon-{{icon}}"></i><span class="btn-label"> {{label}}</span>'),

    // TODO: THIS IS COMPLETELY MISSPLACED. RELOCATE IT ON SERVER SIDE
    buttonGroups: [{
      className: "undo-redo",
      hideLabels: true,
      buttons: [{
        "label": "Undo",
        "icon": "undo"
        // "callback": {
        //   "action": "span",
        //   "data": {
        //     "text": "Heading 1",
        //     "prefix": "# ",
        //     "suffix": ""
        //   }
        // }
      }, {
        "label": "Redo",
        "icon": "redo"
        // "callback": {
        //   "action": "span",
        //   "data": {
        //     "text": "Heading 1",
        //     "prefix": "# ",
        //     "suffix": ""
        //   }
        // }
      }]
    }, {
      label: "Elements",
      className: "elements pull-right",
      buttons: [{
        "label": "Link",
        "icon": "link",
        "callback": {
          "action": "span",
          "data": {
            "text": "link text",
            "prefix": "[",
            "suffix": "](http://www.example.com)"
          }
        }
      }, {
        // TODO: implement a better table helper
        "label": "Table",
        "icon": "table",
        "callback": {
          "action": "span",
          "data": {
            "text": "header",
            "prefix": "| ",
            "suffix":         "        |         header |\n" +
                      "|:--------------|---------------:|\n" +
                      "| aligned left  |  aligned right |"
          }
        }
      },
      {
          "label": "Latex Math",
          "icon": "asterisk",
          "callback": {
            "action": "span",
            "data": {
              "prefix": "[[",
              "text":"math: \nlatex here\n",
              "suffix":"]]"
            }
          }
      },
      {
          "label": "Quiz choice",
          "icon": "ok",
          "callback": {
            "action": "span",
            "data": {
              "prefix": "[[multi:\n",
              "text":"A. incorrect\n: reveal after answer\n" +
                     "B! correct\n: reveal after answer\n" +
                     "C. incorrect\n: reveal after answer\n",
              "suffix":"]]"
            }
          }
      }

      ]
    }, {
      label: "Format",
      className: "format pull-right",
      buttons: [{
        "label": "Heading 1",
        "icon": "h1",
        "callback": {
          "action": "span",
          "data": {
            "text": "Heading 1",
            "prefix": "# ",
            "suffix": ""
          }
        }
      }, {
        "label": "Heading 2",
        "icon": "h2",
        "callback": {
          "action": "span",
          "data": {
            "text": "Heading 2",
            "prefix": "## ",
            "suffix": ""
          }
        }

      }, {
        "label": "Heading 3",
        "icon": "h3",
        "callback": {
          "action": "span",
          "data": {
            "text": "Heading 3",
            "prefix": "### ",
            "suffix": ""
          }
        }
      }, {
        "label": "Bold",
        "icon": "bold",
        "callback": {
          "action": "span",
          "data": {
            "text": "strong text",
            "prefix": "**",
            "suffix": "**"
          }
        }
      }, {
        "label": "Italic",
        "icon": "italic",
        "callback": {
          "action": "span",
          "data": {
            "text": "italic text",
            "prefix": "_",
            "suffix": "_"
          }
        }
      }, {
        "label": "List",
        "icon": "list",
        "callback": {
          "action": "list",
          "data": {
            "wrap": true,
            "prefix": "* ",
            "suffix": ""
          }
        }
      }, {
        "label": "Numbered list",
        "icon": "numbered-list",
        "callback": {
          "action": "list",
          "data": {
            "regex": "^\\s*\\d+\\.\\s",
            "wrap": true,
            "prefix": "0. ",
            "suffix": ""
          }
        }
      }, {
        "label": "Quote",
        "icon": "quote",
        "callback": {
          "action": "list",
          "data": {
            "wrap": true,
            "prefix": "> "
          }
        }
      }, {
        "label": "Code",
        "icon": "code",
        "callback": {
          "action": "block",
          "data": {
            "wrap": true,
            "prefix": "    "
          }
        }
      }]
    }],


    // Asset container templates
    // -------------------------------------

    imageMarkdown: hogan.compile('[[img: id={{src}}, alt="{{alt}}"]]'),

    asset: hogan.compile($('#asset-template').html()),

    assetEditor: hogan.compile($('#asset-editor').html())

  };

});
