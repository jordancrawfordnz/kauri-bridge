'use strict';

var dateFormat = require('dateformat')
var colors = require('colors/safe');

var LogContext = function(initialContext) {
  this.currentContext = [];
  if (initialContext) {
    if (Array.isArray(initialContext)) {
      this.currentContext = initialContext;
    } else {
      this.currentContext.push(initialContext);
    }
  }
};

// Descends further down the log context path.
  // Returns the descended LogContext.
LogContext.prototype.descend = function(newContext) {
  var newFullContext = this.currentContext.slice(0, this.currentContext.length); // copy the context
  newFullContext.push(newContext); // add the next context
  return new LogContext(newFullContext); // make a new LogContext.
};

LogContext.prototype.getContext = function() {
  var contextStr = '';
  this.currentContext.forEach(function(context) {
    contextStr += colors.green(context) + " - ";
  });

  return contextStr;
};

// Logs a message using the current context.
LogContext.prototype.log = function(message) {
  console.log(colors.dim(dateFormat(new Date(), 'isoDateTime') + ': ') + this.getContext() + message);
};

module.exports = LogContext;
