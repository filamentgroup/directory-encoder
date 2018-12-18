var fs = require( 'fs' );
var imgStats = require( 'img-stats' );

class DataURIEncoder {
	constructor( path ) {
		this.path = path;
		this.extension = path.split('.').pop();
	}

	encode() {
		var fileData = fs.readFileSync( this.path );
		var base64 = fileData.toString( 'base64');
		return base64;
	}

	stats(){
		var data = imgStats.statsSync( this.path ), stats;

		if( data.width && data.height ){
			stats = {};
			if( data.width !== "" ){
				stats.width = data.width + "px";
			}
			if( data.height !== "" ){
				stats.height = data.height + "px";
			}
		}

		return stats;
	}
}

module.exports = DataURIEncoder;
