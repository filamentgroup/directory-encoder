var fs = require( 'fs' );
var DataURIEncoder = require( './data-uri-encoder' );

class SvgURIEncoder extends DataURIEncoder {
	static get prefix() {
		return "data:image/svg+xml;charset%3DUS-ASCII,";
	}

	encode() {
		var fileData = fs.readFileSync( this.path );

		return SvgURIEncoder.prefix + encodeURIComponent( fileData.toString('utf-8')
			//strip newlines and tabs
			.replace( /[\n\r]/gmi, "" )
			.replace( /\t/gmi, " " )
			//strip comments
			.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
			//replace
			.replace(/'/gmi, "\\i") )
			//encode brackets
			.replace(/\(/g, "%28").replace(/\)/g, "%29");
	}
}

module.exports = SvgURIEncoder;
