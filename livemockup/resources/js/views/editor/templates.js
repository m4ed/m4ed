// Filename: 
define([
  'hogan'
],
function(hogan) {
  //console.log('Invoked!');
  return {
    editor: hogan.compile($('#editor-template').html()),

    button: hogan.compile([
        '<span class="wrap" unselectable="on">',
          '<span class="text" style="display:block" unselectable="on">',
            '{{name}}',
          '</span>',
          '<i class="icon-{{icon}}"></i>',
        '</span>'
      ].join('')),

    // TODO: THIS IS COMPLETELY MISSPLACED. RELOCATE IT ON SERVER SIDE
    buttonGroups: [[{"callback": {"action": "span", "data": {"text": "Heading 1", "prefix": "# ", "suffix": ""}}, "icon": "h1"}, {"callback": {"action": "span", "data": {"text": "Heading 2", "prefix": "## ", "suffix": ""}}, "icon": "h2"}, {"callback": {"action": "span", "data": {"text": "Heading 3", "prefix": "### ", "suffix": ""}}, "icon": "h3"}], [{"callback": {"action": "span", "data": {"text": "strong text", "prefix": "**", "suffix": "**"}}, "icon": "bold"}, {"callback": {"action": "span", "data": {"text": "italic text", "prefix": "_", "suffix": "_"}}, "icon": "italic"}, {"callback": {"action": "span", "data": {"text": "link text", "prefix": "[", "suffix": "](http://www.example.com)"}}, "icon": "link"}], [{"callback": {"action": "list", "data": {"wrap": true, "prefix": "* ", "suffix": ""}}, "icon": "list"}, {"callback": {"action": "list", "data": {"regex": "^\\s*\\d+\\.\\s", "wrap": true, "prefix": "0. ", "suffix": ""}}, "icon": "numbered-list"}], [{"callback": {"action": "list", "data": {"wrap": true, "prefix": "> "}}, "icon": "quote"}, {"callback": {"action": "block", "data": {"wrap": true, "prefix": "    "}}, "icon": "code"}]],
 

    // Asset container templates
    // -------------------------------------

    imageMarkdown: hogan.compile('![{{alt}}]({{src}})'),

    image: hogan.compile([
      '<li>',
        '<img alt="{{alt}}" src="{{src}}" />',
        '<div class="buttons" style="display: none;">',
          '{{#buttons}}',
            '<div class="btn btn-inverse btn-circle btn-{{name}}">' ,
              '<i class="icon-{{icon}} icon-white"></i>',
            '</div>',
          '{{/buttons}}',
        '</div>',
      '</li>'
    ].join('')),

    imageModal: hogan.compile([
      '<div class="modal hide">',
        '<div class="modal-header">',
          '<button type="button" class="close" data-dismiss="modal">&times;</button>',
          '<h3>Edit image</h3>',
        '</div>',
        '<div class="modal-body">',
          '<img src="{{src}}" />',
          '<p>Blaa blaa</p>',
        '</div>',
        '<div class="modal-footer">',
          '<a href="#" class="btn" data-dismiss="modal">Close</a>',
          '<a href="#" class="btn btn-primary">Save changes</a>',
        '</div>',
      '</div>'
    ].join(''))

  };

});
