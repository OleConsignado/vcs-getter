const crypto = require('crypto');

class Utility
{
	static sanetize(text) {
		return text.toLowerCase().replace(/[^a-z0-9]/g, '')
	}

	static contains(hailstack, needle) {
		return Utility.sanetize(hailstack).includes(Utility.sanetize(needle));	
	}	

	static md5(text) {
		return crypto.createHash('md5').update(text).digest('hex');
	}	
}

module.exports = Utility