/**
 * TitledElement is mixed into other classes to provide a `title` attribute.
 * Titles are rendered by the browser and are made visible when the user moves
 * the mouse over the element. Titles are not visible on touch devices.
 *
 *     @example
 *     // TitledElement provides a 'title' attribute to the
 *     // ButtonWidget class
 *     var button = new OO.ui.ButtonWidget( {
 *         label: 'Button with Title',
 *         title: 'I am a button'
 *     } );
 *     $( 'body' ).append( button.$element );
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {jQuery} [$titled] The element to which the `title` attribute is applied.
 *  If this config is omitted, the title functionality is applied to $element, the
 *  element created by the class.
 * @cfg {string|Function} [title] The title text or a function that returns text. If
 *  this config is omitted, the value of the {@link #static-title static title} property is used.
 */
OO.ui.mixin.TitledElement = function OoUiMixinTitledElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$titled = null;
	this.title = null;

	// Initialization
	this.setTitle( config.title !== undefined ? config.title : this.constructor.static.title );
	this.setTitledElement( config.$titled || this.$element );
};

/* Setup */

OO.initClass( OO.ui.mixin.TitledElement );

/* Static Properties */

/**
 * The title text, a function that returns text, or `null` for no title. The value of the static property
 * is overridden if the #title config option is used.
 *
 * @static
 * @inheritable
 * @property {string|Function|null}
 */
OO.ui.mixin.TitledElement.static.title = null;

/* Methods */

/**
 * Set the titled element.
 *
 * This method is used to retarget a TitledElement mixin so that its functionality applies to the specified element.
 * If an element is already set, the mixin’s effect on that element is removed before the new element is set up.
 *
 * @param {jQuery} $titled Element that should use the 'titled' functionality
 */
OO.ui.mixin.TitledElement.prototype.setTitledElement = function ( $titled ) {
	if ( this.$titled ) {
		this.$titled.removeAttr( 'title' );
	}

	this.$titled = $titled;
	if ( this.title ) {
		this.updateTitle();
	}
};

/**
 * Set title.
 *
 * @param {string|Function|null} title Title text, a function that returns text, or `null` for no title
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TitledElement.prototype.setTitle = function ( title ) {
	title = typeof title === 'function' ? OO.ui.resolveMsg( title ) : title;
	title = ( typeof title === 'string' && title.length ) ? title : null;

	if ( this.title !== title ) {
		this.title = title;
		this.updateTitle();
	}

	return this;
};

/**
 * Update the title attribute, in case of changes to title or accessKey.
 *
 * @protected
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TitledElement.prototype.updateTitle = function () {
	var title = this.getTitle();
	if ( this.$titled ) {
		if ( title !== null ) {
			// Only if this is an AccessKeyedElement
			if ( this.formatTitleWithAccessKey ) {
				title = this.formatTitleWithAccessKey( title );
			}
			this.$titled.attr( 'title', title );
		} else {
			this.$titled.removeAttr( 'title' );
		}
	}
	return this;
};

/**
 * Get title.
 *
 * @return {string} Title string
 */
OO.ui.mixin.TitledElement.prototype.getTitle = function () {
	return this.title;
};
