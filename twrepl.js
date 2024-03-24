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
// Run ./bin/test.sh script - may need backslashes in windows?
const runTestCommand = 'cd ./node_modules/tiddlywiki && ./bin/test.sh';

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

// Help and Test suite
const help = require('./src/help').Help(colour, submit, prompt);
const tests = require('./src/tests').Tests(colour, submit, prompt);

// -------------------
// Run TiddlyWiki tests
function runTests() {
	const { spawn } = require('child_process');
	const child = spawn(runTestCommand, {
		stdio: 'inherit',
		shell: true
	});
	child.on('exit', function (code, signal) {
		console.log(`./bin/test.sh exited with code ${code}\n`);
		colour.log(`Web page at 'http://localhost:8080/node_modules/tiddlywiki/editions/test/output/test.html'\n`, 11);
		submit('\n');
	});
}

// -------------------
// Remove database.sqlite
const { unlink } = require('node:fs/promises');
async function removeStoreDb() {
  try {
	const path = './mws/store/database.sqlite';
    await unlink(path);
    colour.log(`Successfully deleted ${path}\n\n`,130);
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
	colour.log( `${pkg.name}: `,75); colour.log(`v${pkg.version}\n\n`,130);
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

// Create $tw.Commander to do... commands
const cmdr = {
	execute: (cmds) => {
		colour.log('$tw.Commander: ',75); colour.log(JSON.stringify(cmds) + '\n',130);
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
	runtime.context.runTests = runTests;
	runtime.context.help = help;
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
	// Boot tiddlywiki module
	colour.log('Boot TiddlyWiki\n', 75);
	colour.log(`${pkg.dependencies.tiddlywiki}\n`,130);
	colour.log('-------------------\n',75);
	$tw.preloadTiddlers = require('./preloadTiddlers.json');
	$tw.boot.argv = [editionFolder];
	$tw.boot.boot(() => {});
	colour.log('-------------------\n\n', 75);

	// Static server
	colour.log('Start static server\n', 75);
	colour.log('-------------------\n',75);
	const fs = require('node:fs');
	const { spawn } = require('node:child_process');
	$tw.utils.createDirectory('./logs');
	const out = fs.openSync('./logs//http-server-out.log', 'w');
	const err = fs.openSync('./logs/http-server-err.log', 'w');
	const staticServer = spawn('./node_modules/http-server/bin/http-server -p 8888 -c-1', {
		stdio: [ 'ignore', out, err ],
		shell: true
	});
	staticServer.on('close', (code) => {
	  console.log(`Static server exited with code ${code}`);
	});
	colour.log(`Static server at http://localhost:8888\n`,130);
	colour.log(`If issues see logs at './logs/http-server-out.log' for details\n`,130);
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
		submit(`$tw.mws.store.listRecipes().map(\n`);
		submit(`  recipe => {\n`);
		submit(`    return {recipe_name:recipe.recipe_name,bag_names:recipe.bag_names}\n`);
		submit(`  }\n`);
		submit(`)\n`);
		submit(`$tw.mws.store.listBags().map(bag => bag.bag_name)\n`);
		submit(`help.intro()`);
	}, 2000);
}

// Show our name / version
intro();

// Remove the existing database.sqlite if present
//  and starup TiddlyWiki / Multi Wiki Server / REPL
removeStoreDb().then(() => startup());
