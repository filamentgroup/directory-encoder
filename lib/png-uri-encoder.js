var path = require( 'path' );
var url = require('url');
var DataURIEncoder = require( './data-uri-encoder' );

class PngURIEncoder extends DataURIEncoder {
	constructor(path) {
		super(path);
	}

	static get prefix() {
		return "data:image/png;base64,";
	}

	encode( options ) {
		var dataUriEncode = super.encode();
		var datauri = PngURIEncoder.prefix + dataUriEncode;

		//IE LTE8 cannot handle datauris that are this big. Need to make sure it just
		//links to a file
		if (options && ( datauri.length > 32768 && !options.forcedatauri || options.noencodepng )) {
			var output_path = options.pngpath || options.pngfolder;
			
			var pattern_url = /^(http:|https:|\/\/).*/;
			var file_url = null;
			
			// check if output_path is a hostname
			if (pattern_url.test(output_path)) {
				file_url = url.resolve(output_path, path.basename(this.path));
			}
			else {
				file_url = path.join(output_path, path.basename(this.path))
						.split( path.sep )
						.join( "/" );
			}
			
			return file_url;
		}

		return datauri;
	}
}

module.exports = PngURIEncoder;
