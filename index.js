var fs = require('fs');
var path = require('path');
var vm = require('vm');

var HANDLEBARSJS = fs.readFileSync(__dirname + '/vendor/handlebars-1.0.0-rc.3.js', 'utf8');
var EMBERJS = fs.readFileSync(__dirname + '/vendor/ember-1.0.0-rc.1.min.js', 'utf8');

module.exports = function(file, basePath) {
  //dummy jQuery
  var jQuery = function() {
      return jQuery;
    };
  jQuery.ready = function() {
    return jQuery;
  };
  jQuery.inArray = function() {
    return jQuery;
  };
  jQuery.jquery = "1.7.1";
  jQuery.event = {
    fixHooks: {}
  };

  //dummy DOM element
  var element = {
    firstChild: function() {
      return element;
    },
    innerHTML: function() {
      return element;
    }
  };

  var sandbox = {
    // DOM
    document: {
      createRange: false,
      createElement: function() {
        return element;
      }
    },

    // Console
    console: console,

    // jQuery
    jQuery: jQuery,
    $: jQuery,

    // handlebars template to compile
    template: fs.readFileSync(file, 'utf8'),

    // compiled handlebars template
    templatejs: null
  };

  // window
  sandbox.window = sandbox;

  // create a context for the vm using the sandbox data
  var context = vm.createContext(sandbox);

  // load Handlebars and Ember into the sandbox
  vm.runInContext(HANDLEBARSJS, context, 'ember.js');
  vm.runInContext(EMBERJS, context, 'ember.js');

  // compile the handlebars template inside the vm context
  vm.runInContext('templatejs = Ember.Handlebars.precompile(template).toString()', context);

  // extract the compiled template from the vm context and return it,
  // adding template to Ember.TEMPLATES when it is required
  var templatePath = '';

  //only use template path addition when the basePath is given as command line argument
  if (basePath)
    templatePath = file.replace(basePath, '').replace(path.basename(file), '');
  
  var fileName = path.basename(file).replace(/\.hbs|\.handlebars/, '');
  var namedTemplateJs = 'Ember.TEMPLATES[' + JSON.stringify(templatePath+fileName) + '] = Ember.Handlebars.template(' + context.templatejs + ');';

  return namedTemplateJs;
};