// Filename: 
define([
  'hogan'
],
function(hogan) {
  console.log('Invoked!');
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

    buttonGroups: [[{"callback": {"action": "span", "data": {"text": "Heading 1", "prefix": "# ", "suffix": ""}}, "icon": "h1"}, {"callback": {"action": "span", "data": {"text": "Heading 2", "prefix": "## ", "suffix": ""}}, "icon": "h2"}, {"callback": {"action": "span", "data": {"text": "Heading 3", "prefix": "### ", "suffix": ""}}, "icon": "h3"}], [{"callback": {"action": "span", "data": {"text": "strong text", "prefix": "**", "suffix": "**"}}, "icon": "bold"}, {"callback": {"action": "span", "data": {"text": "italic text", "prefix": "_", "suffix": "_"}}, "icon": "italic"}, {"callback": {"action": "span", "data": {"text": "link text", "prefix": "[", "suffix": "](http://www.example.com)"}}, "icon": "link"}], [{"callback": {"action": "list", "data": {"wrap": true, "prefix": "* ", "suffix": ""}}, "icon": "list"}, {"callback": {"action": "list", "data": {"regex": "^\\s*\\d+\\.\\s", "wrap": true, "prefix": "0. ", "suffix": ""}}, "icon": "numbered-list"}], [{"callback": {"action": "list", "data": {"wrap": true, "prefix": "> "}}, "icon": "quote"}, {"callback": {"action": "block", "data": {"wrap": true, "prefix": "    "}}, "icon": "code"}]]
  }

});
