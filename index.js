'use strict';

var program = require('commander');
var pkg = require('./package.json');
var chalk = require('chalk');
var logger = require('./lib/logger');
var didYouMean = require('didyoumean');

program.version(pkg.version);
program.option('-P, --project <alias_or_project_id>', 'the Morpheus project to use for this command');
program.option('--non-interactive', 'error out of the command instead of waiting for prompts');
program.option('--interactive', 'force interactive shell treatment even when not detected');
program.option('--debug', 'print verbose debug output and keep a debug log file');

var client = {};
client.cli = program;
client.logger = require('./lib/logger');
client.errorOut = function(error, status) {
  require('./lib/errorOut')(client, error, status);
};
client.getCommand = function(name) {
  for (var i = 0; i < client.cli.commands.length; i++) {
    if (client.cli.commands[i]._name === name) {
      return client.cli.commands[i];
    }
  }
  return null;
};

require('./commands')(client);

var commandNames = program.commands.map(function(cmd) {
  return cmd._name;
});

var RENAMED_COMMANDS = {};

program.action(function(cmd, cmd2) {
  logger.error(
    chalk.bold.red('Error:'),
    chalk.bold(cmd), 'is not a Morpheus command'
  );

  if (RENAMED_COMMANDS[cmd]) {
    logger.error();
    logger.error(chalk.bold(cmd) + ' has been renamed, please run', chalk.bold('morpheus ' + RENAMED_COMMANDS[cmd]), 'instead');
  } else {
    var suggestion = didYouMean(cmd, commandNames);
    suggestion = suggestion || didYouMean([cmd, cmd2].join(':'), commandNames);
    if (suggestion) {
      logger.error();
      logger.error('Did you mean', chalk.bold(suggestion) + '?');
    }
  }

  process.exit(1);
});

module.exports = client;
