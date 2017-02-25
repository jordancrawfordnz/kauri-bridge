'use strict';

var Timing = {};

// Calculates the time in milliseconds until the next run.
function timeUntilRun(interval) {
  var currentTime = new Date().getTime();

  // Constant value added to the end to prevent underrunning timers being an issue.
  // We want consistancy so 100% accuracy isn't nessacary.
  return (interval - (currentTime % interval)) % interval + 10;
}

// Runs a job on an interval.
function runTimer(interval, toRun) {
  setTimeout(function() {
    toRun();
    runTimer(interval, toRun);
  }, timeUntilRun(interval));
}

// Sets up a timer that will be consistant between minutes.
Timing.startMinutelyTimer = function(interval, toRun, logContext) {
  // Check if the interval is able to be used.
  if (60%interval !== 0) {
    logContext.log('The timing interval must be divisible by 60. Using 10 seconds.');
    interval = 10;
  }
  interval = interval * 1000;

  var timeUntilNext = timeUntilRun(interval);
  logContext.log('Starting in ' + timeUntilNext/1000 + ' second(s)');

  runTimer(interval, toRun);
};

module.exports = Timing;
