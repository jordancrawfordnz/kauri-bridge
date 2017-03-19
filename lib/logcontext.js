'use strict';

var dateFormat = require('dateformat')
var colors = require('colors/safe');

var LogContext = function(context, parent) {
  if (parent) {
    this.parent = parent;
  }

  this.context = context;
  this.enabled = true;
};

// Descends further down the log context path.
  // Returns the descended LogContext.
LogContext.prototype.descend = function(newContext) {
  return new LogContext(newContext, this); // make a new LogContext.
};

LogContext.prototype.getContext = function() {
  var parentContext = this.parent ? this.parent.getContext() : '';

  return parentContext + colors.cyan(this.context) + ' - ';
};

// Logs a message using the current context.
LogContext.prototype.log = function(message) {
  if (this.enabled && (!this.parent || this.parent.isEnabled())) {
    console.log(colors.dim(dateFormat(new Date(), 'isoDateTime') + ': ') + this.getContext() + message);
  }
};

LogContext.prototype.isEnabled = function() {
  return this.enabled;
};

LogContext.prototype.disable = function() {
  this.enabled = false;
};

LogContext.prototype.enable = function() {
  this.enabled = true;
};

module.exports = LogContext;
