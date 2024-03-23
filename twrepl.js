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
// REPL interface
const colour = {
	log: (txt='', fg=255, bg=0, efg=255, ebg=0) => process.stdout.write(
		`\x1b[38;5;${fg};48;5;${bg}m${txt}\x1b[38;5;${efg};48;5;${ebg}m`),

	txt: (txt='', fg=255, bg=0, efg=255, ebg=0) =>
		`\x1b[38;5;${fg};48;5;${bg}m${txt}\x1b[38;5;${efg};48;5;${ebg}m`,
}
const prompt = colour.txt('$mws-repl> ',33,0,7,0);
const submit = (cmd, desc) => {
	if (desc) {
		if (desc === prompt) {
			colour.log(`${prompt}`);
		} else {
			colour.log(desc, 10);
			colour.log(`\n${prompt}`);
		}
	}
	if (cmd) {
		runtime._ttyWrite(cmd);
	}
}

// Show objects 5 levels deep
function showObj(obj) {
	console.dir(obj, {depth:5});
}

// Test suite
const tests = require('./src/tests').Tests(colour, submit, prompt);

// -------------------
// Remove database.sqlite
const { unlink } = require('node:fs/promises');
async function removeStoreDb() {
  try {
	const path = './mws/store/database.sqlite';
    await unlink(path);
    colour.log(`Successfully deleted ${path}\n\n`,130,0,110);
  } catch (error) {
	  if (error.errno !== -2) {
		console.dir(error);
	}
  }
}

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
// Node'js REPL
// Place $tw in REPL context so can be referenced
function resetContext() {
	runtime.context.$tw = $tw;
	runtime.context.showObj = showObj;
	runtime.context.tests = tests;
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
const $tw = require('tiddlywiki').TiddlyWiki();
function startup () {
	// -------------------
	// Initialize
	// Boot tiddlywiki module
	colour.log('Boot TiddlyWiki (multi-wiki-support)\n', 75);
	colour.log(`${pkg.dependencies.tiddlywiki}\n`,130,0,110);
	colour.log('-------------------\n',75);

	$tw.preloadTiddlers = require('./preloadTiddlers.json');
	$tw.boot.argv = [editionFolder];
	$tw.boot.boot(() => {});

	colour.log('-------------------\n\n', 75);


	// Fire up the Multi Wiki Server
	colour.log('Startup Multi Wiki Server\n', 75);
	colour.log('-------------------\n',75);
	cmdr.execute(serverCommand);

	// Show prompt when startup done
	setTimeout(() => {
		colour.log('-------------------\n\n',75);
		colour.log('Startup REPL\n', 75);
		colour.log('-------------------\n\n',75);
		startRepl();
		submit('$tw.version\n');
		submit(`$tw.mws.store.listBags().map(bag => bag.bag_name)\n`, '\n');
		submit(`tests.addTiddler.intro()`, `\n\nStart test - addTiddler`);
	}, 2000);
}

// Show our name / version
intro();

// Remove the existing database.sqlite if present
//  and starup TiddlyWiki / Multi Wiki Server / REPL
removeStoreDb().then(() => startup());
