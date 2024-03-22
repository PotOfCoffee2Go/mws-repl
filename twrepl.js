/*
 * Author: @poc2go at talk.tiddlywiki.org
 * License: MIT
 * Description: Runs a node.js REPL with '$tw' installed.
 *
 * Usage:

npm install http://github.com/PotOfCoffee2Go/mws-repl.git
cd mws-repl
npm install
npm start

 *
 * Enjoy ;)
*/

// TW output path
//  is where 'edition/multiwikiserver' tiddlywiki.info lives
const editionFolder = 'mws';
// Port and host for multi wiki server
//  'host=0.0.0.0' will make available on local network
const serverCommand = ['--listen','port=9200','host=127.0.0.1'];

// -------------------
// REPL display
const submit = { cmd: (txt) => runtime._ttyWrite(txt) }
const colour = {
  log: (txt='', fg=255, bg=0, efg=255, ebg=0) => process.stdout.write(
    `\x1b[38;5;${fg};48;5;${bg}m${txt}\x1b[38;5;${efg};48;5;${ebg}m`),

  txt: (txt='', fg=255, bg=0, efg=255, ebg=0) =>
    `\x1b[38;5;${fg};48;5;${bg}m${txt}\x1b[38;5;${efg};48;5;${ebg}m`,
}
const prompt = colour.txt('$mws-repl> ',33,0,7,0);
const display = { prompt: () => colour.log(`\n\n${prompt}`,10) }

const tests = require('./src/tests').Tests(colour, submit, display);

// -------------------
// Who are we?
const pkg = require('./package.json');
function intro() {
  colour.log( `${pkg.name}: `,75); colour.log(`v${pkg.version}\n\n`,130,0,110);
}

// -------------------
// TiddlyWiki commander
// commander got an error?
function checkForErrors(err) {
    if (err) {
        try {
            $tw.utils.error("Error: " + err);
        } catch (e) {}
    }
}

// Commander logs to console
const log = {
    write: (text) => console.log(text.toString())
}

// Create $tw.Commander to do... commands
const cmdr = {
    execute: (cmds) => {
        colour.log('$tw.Commander: ',75); colour.log(JSON.stringify(cmds) + '\n',130,0,110);
        new $tw.Commander(cmds, checkForErrors, $tw.wiki).execute();
    }
}

// -------------------
// Initialize
// Show our name and version
intro();

// Boot tiddlywiki module
colour.log('Boot TiddlyWiki (multi-wiki-support)\n', 75);
colour.log(`${pkg.dependencies.tiddlywiki}\n`,130,0,110);
colour.log('-------------------\n',75);

const $tw = require('tiddlywiki').TiddlyWiki();
$tw.preloadTiddlers = require('./preloadTiddlers.json');
$tw.boot.argv = [editionFolder];
$tw.boot.boot(() => {});

colour.log('-------------------\n\n', 75);

// -------------------
// Node'js REPL
// Place $tw in REPL context so can be referenced
function resetContext() {
  runtime.context.$tw = $tw;
  runtime.context.test = test;
}

// REPL runtime
var runtime;
function startRepl() {
  runtime = require('node:repl').start({
      prompt: prompt, useColors: true,
      ignoreUndefined: true, /*completer: completer*/
  });

  // If REPL is reset (.clear) - context needs resetting
  runtime.on('reset', () => resetContext());

  // Initial context settings
  resetContext();
}

// -------------------
// -------------------
// Startup

// Fire up the Multi Wiki Server
colour.log('Startup Multi Wiki Server\n', 75);
colour.log('-------------------\n',75);
cmdr.execute(serverCommand);

// Show prompt when startup done
setTimeout(() => {
  colour.log('-------------------\n\n',75);
  startRepl();
  submit.cmd(`// Show objects 5 levels deep\n`);
  submit.cmd(`function showObj(obj) { console.dir(obj, {depth:5}) }\n`);
  display.prompt();
  submit.cmd('$tw.version\n');
  display.prompt();
  submit.cmd(`$tw.mws.store.listBags().map(bag => bag.bag_name)\n`);
  display.prompt();
  submit.cmd(`$tw.mws.store.getBagTiddlers('bag-alpha')\n`);
  display.prompt();
  submit.cmd(`step(1) // Start demo - first poll returns all (up to limit)`);
}, 2000);

/*
function step(nbr) {
  if (nbr === 1) {
    colour.log(`\n----- poll #1 -----\n`,10);
    colour.log(`Specify only the bag name param to get list of most recent tiddlers\n`,10);
    colour.log(` up to the 'limit' - currently 20 tiddlers`,10);
    display.prompt();
    submit.cmd(`var poll_1 = $tw.mws.store.getBagRecentTiddlers('bag-alpha')\n`);
    submit.cmd(`showObj(poll_1)\n`);
    display.prompt();
    submit.cmd(`step(2) // Poll again using bag_max_tiddler_id from previous poll (#1)`);
  }
  else if (nbr === 2) {
    colour.log(`\n----- poll #2 -----\n`,10);
    colour.log(`Using the bag_max_tiddler_id from poll #1\n`,10);
    colour.log(`Returns no tiddlers as tiddler_id needs to be greater\n`,10);
    colour.log(` than poll #1's bag_max_tiddler_id`,10);
    display.prompt();
    submit.cmd(`poll_1.bag_max_tiddler_id\n`);
    submit.cmd(`var poll_2 = $tw.mws.store.getBagRecentTiddlers('bag-alpha',poll_1.bag_max_tiddler_id)\n`);
    submit.cmd(`showObj(poll_2)\n`);
    display.prompt();
    submit.cmd(`step(3) // Add a tiddler to bag-alpha`);
  }
  else if (nbr === 3) {
    colour.log(`\n---- Add tiddler -----`,10);
    display.prompt();
    submit.cmd(`var newTiddler = {\n`);
    submit.cmd(`title: 'In the bag',\n`);
    submit.cmd(`text: 'This tiddler is in bag-alpha'\n`);
    submit.cmd(`}\n`);
    submit.cmd(`$tw.mws.store.saveBagTiddler(newTiddler,'bag-alpha')\n`);
    display.prompt();
    submit.cmd(`step(4) // Poll again using bag_max_tiddler_id from previous poll (#2)`);
  }
  else if (nbr === 4) {
    colour.log(`\n----- poll #3 -----\n`,10);
    colour.log(`Using the bag_max_tiddler_id from poll #2\n`,10);
    colour.log(`Returns new tiddler just added`,10);
    display.prompt();
    submit.cmd(`poll_2.bag_max_tiddler_id\n`);
    submit.cmd(`var poll_3 = $tw.mws.store.getBagRecentTiddlers('bag-alpha',poll_2.bag_max_tiddler_id)\n`);
    submit.cmd(`showObj(poll_3)\n`);
    colour.log(`End of demo`,10);
    display.prompt();
  }
}
*/

