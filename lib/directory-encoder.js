/*global require:true*/
/*global module:true*/
(function(){
	"use strict";

	var fs = require( 'fs-extra' );
	var path = require( 'path' );
	var Handlebars = require( 'handlebars' );
	var SvgURIEncoder = require( './svg-uri-encoder' );
	var PngURIEncoder = require( './png-uri-encoder' );

	function DirectoryEncoder( input, output, options ){
		this.input = input;
		this.output = output;
		this.options = options || {};

		this.prefix = this.options.prefix || ".icon-";

		this.options.pngfolder = this.options.pngfolder || "";

		this.customselectors = this.options.customselectors || {};
		this.template = this._loadTemplate( this.options.template );
	}

	DirectoryEncoder.encoders = {
		svg: SvgURIEncoder,
		png: PngURIEncoder
	};

	DirectoryEncoder.prototype.encode = function() {
		var self = this, seen = {};

		// remove the file if it's there
		if( fs.existsSync(this.output) ) {
			fs.unlinkSync( this.output );
		}

		if( !fs.existsSync(path.dirname( this.output )) ){
			fs.mkdirpSync( path.dirname( this.output ) );
		}

		// append each selector
		fs.readdirSync( this.input ).forEach(function( file ) {
			var css, datauri, extension = path.extname( file );

			if( extension === ".svg" || extension === ".png" ) {
				if( fs.lstatSync( path.join( self.input, file ) ).isFile() ) {
					self._checkName(seen, file.replace( extension, '' ));

					datauri = self._datauri( path.join(self.input, file) );

					css = self._css( file.replace( extension, '' ), datauri );

					fs.appendFileSync( self.output, css + "\n\n" );
				}
			}
		});
	};
	DirectoryEncoder.prototype._css = function( name, datauri ) {
		var self = this;
		this.customselectors = this.customselectors || {};
		this.prefix = this.prefix || ".icon-";

		if( this.customselectors[ "*" ] ){
			this.customselectors[ name ] = this.customselectors[ name ] || [];
			var selectors = this.customselectors[ "*" ];
			selectors.forEach( function( el ){
				self.customselectors[ name ].push( name.replace( new RegExp( "(" + name + ")" ), el ) );
			});
		}

		var data = {
			prefix: this.prefix,
			name: name,
			datauri: datauri,
			customselectors: this.customselectors[ name ]
		}, css;

		if( this.template ){
			css = this.template( data );
		} else {
			css = this.prefix + name +
				" { background-image: url('" +
				datauri +
				"'); background-repeat: no-repeat; }";
		}

		return css;
	};

	DirectoryEncoder.prototype._datauri = function( file ) {
		var encoder, extension = path.extname( file );

		if( typeof DirectoryEncoder.encoders[extension.replace(".", "")] === "undefined" ){
			throw new Error( "Encoder does not recognize file type: " + file );
		}

		encoder = new DirectoryEncoder.encoders[extension.replace(".", "")]( file );

		// TODO passthrough of options is generally a code smell
		return encoder.encode( this.options );
	};

	DirectoryEncoder.prototype._checkName = function( seen, name ) {
		if( seen[name] ){
			throw new Error("Two files with the same name: `" + name + "` exist in the input directory");
		}

		seen[name] = true;
	};

	DirectoryEncoder.prototype._loadTemplate = function( templateFile ) {
		var tmpl;

		if( templateFile && fs.existsSync( templateFile ) ){
			var source = fs.readFileSync( templateFile ).toString( 'utf-8' );
			tmpl = Handlebars.compile(source);
		} else {
			tmpl = false;
		}

		return tmpl;
	};

	module.exports = DirectoryEncoder;
}());
