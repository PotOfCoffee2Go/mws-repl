# mws-repl

Boots up a REPL of TiddlyWiki5 MWS including the Multi Wiki Server

## Install
```
git clone https://github.com/PotOfCoffee2Go/mws-repl.git
cd mws-repl
npm install
npm start
```

The install downloads the TiddlyWiki multi-wiki-support branch from PotOfCoffee2go's fork
of TiddlyWiki5 since is used when working on MWS code.
```
https://github.com/PotOfCoffee2go/TiddlyWiki5.git#multi-wiki-support
```

To run using the official TiddlyWiki5 branch:
In `package.json` file change the 'tiddlywiki' dependency

change
```js
  "dependencies": {
    "tiddlywiki": "https://github.com/PotOfCoffee2go/TiddlyWiki5.git#multi-wiki-support"
  },
```

to
```js
  "dependencies": {
    "tiddlywiki": "https://github.com/Jermolene/TiddlyWiki5.git#multi-wiki-support"
  },

```

delete the `/node_modules` directory from the 'mws-repl' folder and

run
```
npm install
```

---

## Start
`npm start` will boot TiddlyWiki, create and populate the SQLite database, start the
Multi Wiki Server at http://localhost:9200/ , and run some $tw functions.

Will be at the REPL prompt which allows access to all $tw variables, objects, and functions.
`.help` displays REPL help. A handy tip is to type part of a $tw object path including the period
`$tw.mws.store.` (don't forget the period at the end) - then press 'tab' twice. Will display a
list of all `$tw.mws.store.` functions.

```
> mws-repl@1.0.0 start
> node ./twrepl

mws-repl: v1.0.0

Boot TiddlyWiki (multi-wiki-support)
https://github.com/PotOfCoffee2go/TiddlyWiki5.git#multi-wiki-support
-------------------
Copying edition tw5.com/tiddlers
Copying edition dev/tiddlers
mws-initial-load: 16.197s
-------------------

Startup Multi Wiki Server
-------------------
$tw.Commander: ["--listen","port=9200","host=127.0.0.1"]
Serving on http://127.0.0.1:9200
(press ctrl-C to exit)
-------------------

$mws-repl> // Show objects 5 levels deep
$mws-repl> function showObj(obj) { console.dir(obj, {depth:5}) }
$mws-repl>

$mws-repl> $tw.version
'5.3.4-prerelease'
$mws-repl>

$mws-repl> $tw.mws.store.listBags().map(bag => bag.bag_name)
[ 'bag-alpha', 'bag-beta', 'bag-gamma', 'dev-docs', 'docs' ]
$mws-repl>

$mws-repl> $tw.mws.store.getBagTiddlers('bag-alpha')
[
  { title: '$:/SiteTitle', tiddler_id: 1891 },
  { title: '😀😃😄😁😆🥹😅😂', tiddler_id: 1892 }
]
$mws-repl>
```

The 'twrepl.js' program has some settings at the beginning.

Enjoy ;)
