module.exports = function() {
	return {
		name: 'remove-shadowed',
		visitor: {
			ClassProperty(path) {
				let { node } = path;
				if(node.type === 'ClassProperty' && node.value === null) {
					path.remove();
				}
			}
		},
	};
}
