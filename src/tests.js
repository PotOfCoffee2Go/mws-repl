var colour, submit, prompt;

function Tests(_colour, _submit, _display) => {
	colour = _colour;
	submit = _submit;
	prompt = _display.prompt;
};

const firstPoll = {
	step: () => {
		if (nbr === 1) {
			colour.log(`\n----- poll #1 -----\n`,10);
			colour.log(`Specify only the bag name param to get list of most recent tiddlers\n`,10);
			colour.log(` up to the 'limit' - currently 20 tiddlers`,10);
			prompt();
			submit.cmd(`var poll_1 = $tw.mws.store.getBagRecentTiddlers('bag-alpha')\n`);
			submit.cmd(`showObj(poll_1)\n`);
			prompt();
			submit.cmd(`step(2) // Poll again using bag_max_tiddler_id from previous poll (#1)`);
		}
		else if (nbr === 2) {
			colour.log(`\n----- poll #2 -----\n`,10);
			colour.log(`Using the bag_max_tiddler_id from poll #1\n`,10);
			colour.log(`Returns no tiddlers as tiddler_id needs to be greater\n`,10);
			colour.log(` than poll #1's bag_max_tiddler_id`,10);
			prompt();
			submit.cmd(`poll_1.bag_max_tiddler_id\n`);
			submit.cmd(`var poll_2 = $tw.mws.store.getBagRecentTiddlers('bag-alpha',poll_1.bag_max_tiddler_id)\n`);
			submit.cmd(`showObj(poll_2)\n`);
			prompt();
			submit.cmd(`step(3) // Add a tiddler to bag-alpha`);
		}
		else if (nbr === 3) {
			colour.log(`\n---- Add tiddler -----`,10);
			prompt();
			submit.cmd(`var newTiddler = {\n`);
			submit.cmd(`title: 'In the bag',\n`);
			submit.cmd(`text: 'This tiddler is in bag-alpha'\n`);
			submit.cmd(`}\n`);
			submit.cmd(`$tw.mws.store.saveBagTiddler(newTiddler,'bag-alpha')\n`);
			prompt();
			submit.cmd(`step(4) // Poll again using bag_max_tiddler_id from previous poll (#2)`);
		}
		else if (nbr === 4) {
			colour.log(`\n----- poll #3 -----\n`,10);
			colour.log(`Using the bag_max_tiddler_id from poll #2\n`,10);
			colour.log(`Returns new tiddler just added`,10);
			prompt();
			submit.cmd(`poll_2.bag_max_tiddler_id\n`);
			submit.cmd(`var poll_3 = $tw.mws.store.getBagRecentTiddlers('bag-alpha',poll_2.bag_max_tiddler_id)\n`);
			submit.cmd(`showObj(poll_3)\n`);
			colour.log(`End of demo`,10);
			prompt();
		}
	}
}

module.exports = {
	Tests: Tests,
	firstPoll: firstPoll
}
