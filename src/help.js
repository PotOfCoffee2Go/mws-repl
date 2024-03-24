var colour, submit, prompt;

function Help(_colour, _submit, _prompt) {
	colour = _colour;
	submit = _submit;
	prompt = _prompt;
	return this;
};

const intro = () => {
	submit('', [
		'Help introduction will be here'
		].join('\n')
	);
}


module.exports = {
	Help: Help,
	intro: intro,
}
