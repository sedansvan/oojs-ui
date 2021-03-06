/**
 * StackLayouts contain a series of {@link OO.ui.PanelLayout panel layouts}. By default, only one panel is displayed
 * at a time, though the stack layout can also be configured to show all contained panels, one after another,
 * by setting the #continuous option to 'true'.
 *
 *     @example
 *     // A stack layout with two panels, configured to be displayed continuously
 *     var myStack = new OO.ui.StackLayout( {
 *         items: [
 *             new OO.ui.PanelLayout( {
 *                 $content: $( '<p>Panel One</p>' ),
 *                 padded: true,
 *                 framed: true
 *             } ),
 *             new OO.ui.PanelLayout( {
 *                 $content: $( '<p>Panel Two</p>' ),
 *                 padded: true,
 *                 framed: true
 *             } )
 *         ],
 *         continuous: true
 *     } );
 *     $( 'body' ).append( myStack.$element );
 *
 * @class
 * @extends OO.ui.PanelLayout
 * @mixins OO.ui.mixin.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [continuous=false] Show all panels, one after another. By default, only one panel is displayed at a time.
 * @cfg {OO.ui.Layout[]} [items] Panel layouts to add to the stack layout.
 */
OO.ui.StackLayout = function OoUiStackLayout( config ) {
	// Configuration initialization
	// Make the layout scrollable in continuous mode, otherwise each
	// panel is responsible for its own scrolling.
	config = $.extend( { scrollable: !!( config && config.continuous ) }, config );

	// Parent constructor
	OO.ui.StackLayout.parent.call( this, config );

	// Mixin constructors
	OO.ui.mixin.GroupElement.call( this, $.extend( {}, config, { $group: this.$element } ) );

	// Properties
	this.currentItem = null;
	this.continuous = !!config.continuous;

	// Initialization
	this.$element.addClass( 'oo-ui-stackLayout' );
	if ( this.continuous ) {
		this.$element.addClass( 'oo-ui-stackLayout-continuous' );
		this.$element.on( 'scroll', OO.ui.debounce( this.onScroll.bind( this ), 250 ) );
	}
	if ( Array.isArray( config.items ) ) {
		this.addItems( config.items );
	}
};

/* Setup */

OO.inheritClass( OO.ui.StackLayout, OO.ui.PanelLayout );
OO.mixinClass( OO.ui.StackLayout, OO.ui.mixin.GroupElement );

/* Events */

/**
 * A 'set' event is emitted when panels are {@link #addItems added}, {@link #removeItems removed},
 * {@link #clearItems cleared} or {@link #setItem displayed}.
 *
 * @event set
 * @param {OO.ui.Layout|null} item Current panel or `null` if no panel is shown
 */

/**
 * When used in continuous mode, this event is emitted when the user scrolls down
 * far enough such that currentItem is no longer visible.
 *
 * @event visibleItemChange
 * @param {OO.ui.PanelLayout} panel The next visible item in the layout
 */

/* Methods */

/**
 * Handle scroll events from the layout element
 *
 * @param {jQuery.Event} e
 * @fires visibleItemChange
 */
OO.ui.StackLayout.prototype.onScroll = function () {
	var currentRect,
		len = this.items.length,
		currentIndex = this.items.indexOf( this.currentItem ),
		newIndex = currentIndex,
		containerRect = this.$element[ 0 ].getBoundingClientRect();

	if ( !containerRect || ( !containerRect.top && !containerRect.bottom ) ) {
		// Can't get bounding rect, possibly not attached.
		return;
	}

	function getRect( item ) {
		return item.$element[ 0 ].getBoundingClientRect();
	}

	function isVisible( item ) {
		var rect = getRect( item );
		return rect.bottom > containerRect.top && rect.top < containerRect.bottom;
	}

	currentRect = getRect( this.currentItem );

	if ( currentRect.bottom < containerRect.top ) {
		// Scrolled down past current item
		while ( ++newIndex < len ) {
			if ( isVisible( this.items[ newIndex ] ) ) {
				break;
			}
		}
	} else if ( currentRect.top > containerRect.bottom ) {
		// Scrolled up past current item
		while ( --newIndex >= 0 ) {
			if ( isVisible( this.items[ newIndex ] ) ) {
				break;
			}
		}
	}

	if ( newIndex !== currentIndex ) {
		this.emit( 'visibleItemChange', this.items[ newIndex ] );
	}
};

/**
 * Get the current panel.
 *
 * @return {OO.ui.Layout|null}
 */
OO.ui.StackLayout.prototype.getCurrentItem = function () {
	return this.currentItem;
};

/**
 * Unset the current item.
 *
 * @private
 * @param {OO.ui.StackLayout} layout
 * @fires set
 */
OO.ui.StackLayout.prototype.unsetCurrentItem = function () {
	var prevItem = this.currentItem;
	if ( prevItem === null ) {
		return;
	}

	this.currentItem = null;
	this.emit( 'set', null );
};

/**
 * Add panel layouts to the stack layout.
 *
 * Panels will be added to the end of the stack layout array unless the optional index parameter specifies a different
 * insertion point. Adding a panel that is already in the stack will move it to the end of the array or the point specified
 * by the index.
 *
 * @param {OO.ui.Layout[]} items Panels to add
 * @param {number} [index] Index of the insertion point
 * @chainable
 * @return {OO.ui.StackLayout} The layout, for chaining
 */
OO.ui.StackLayout.prototype.addItems = function ( items, index ) {
	// Update the visibility
	this.updateHiddenState( items, this.currentItem );

	// Mixin method
	OO.ui.mixin.GroupElement.prototype.addItems.call( this, items, index );

	if ( !this.currentItem && items.length ) {
		this.setItem( items[ 0 ] );
	}

	return this;
};

/**
 * Remove the specified panels from the stack layout.
 *
 * Removed panels are detached from the DOM, not removed, so that they may be reused. To remove all panels,
 * you may wish to use the #clearItems method instead.
 *
 * @param {OO.ui.Layout[]} items Panels to remove
 * @chainable
 * @return {OO.ui.StackLayout} The layout, for chaining
 * @fires set
 */
OO.ui.StackLayout.prototype.removeItems = function ( items ) {
	// Mixin method
	OO.ui.mixin.GroupElement.prototype.removeItems.call( this, items );

	if ( items.indexOf( this.currentItem ) !== -1 ) {
		if ( this.items.length ) {
			this.setItem( this.items[ 0 ] );
		} else {
			this.unsetCurrentItem();
		}
	}

	return this;
};

/**
 * Clear all panels from the stack layout.
 *
 * Cleared panels are detached from the DOM, not removed, so that they may be reused. To remove only
 * a subset of panels, use the #removeItems method.
 *
 * @chainable
 * @return {OO.ui.StackLayout} The layout, for chaining
 * @fires set
 */
OO.ui.StackLayout.prototype.clearItems = function () {
	this.unsetCurrentItem();
	OO.ui.mixin.GroupElement.prototype.clearItems.call( this );

	return this;
};

/**
 * Show the specified panel.
 *
 * If another panel is currently displayed, it will be hidden.
 *
 * @param {OO.ui.Layout} item Panel to show
 * @chainable
 * @return {OO.ui.StackLayout} The layout, for chaining
 * @fires set
 */
OO.ui.StackLayout.prototype.setItem = function ( item ) {
	if ( item !== this.currentItem ) {
		this.updateHiddenState( this.items, item );

		if ( this.items.indexOf( item ) !== -1 ) {
			this.currentItem = item;
			this.emit( 'set', item );
		} else {
			this.unsetCurrentItem();
		}
	}

	return this;
};

/**
 * Reset the scroll offset of all panels, or the container if continuous
 *
 * @inheritdoc
 */
OO.ui.StackLayout.prototype.resetScroll = function () {
	if ( this.continuous ) {
		// Parent method
		return OO.ui.StackLayout.parent.prototype.resetScroll.call( this );
	}
	// Reset each panel
	this.getItems().forEach( function ( panel ) {
		var hidden = panel.$element.hasClass( 'oo-ui-element-hidden' );
		// Scroll can only be reset when panel is visible
		panel.$element.removeClass( 'oo-ui-element-hidden' );
		panel.resetScroll();
		if ( hidden ) {
			panel.$element.addClass( 'oo-ui-element-hidden' );
		}
	} );

	return this;
};

/**
 * Update the visibility of all items in case of non-continuous view.
 *
 * Ensure all items are hidden except for the selected one.
 * This method does nothing when the stack is continuous.
 *
 * @private
 * @param {OO.ui.Layout[]} items Item list iterate over
 * @param {OO.ui.Layout} [selectedItem] Selected item to show
 */
OO.ui.StackLayout.prototype.updateHiddenState = function ( items, selectedItem ) {
	var i, len;

	if ( !this.continuous ) {
		for ( i = 0, len = items.length; i < len; i++ ) {
			if ( !selectedItem || selectedItem !== items[ i ] ) {
				items[ i ].$element.addClass( 'oo-ui-element-hidden' );
				items[ i ].$element.attr( 'aria-hidden', 'true' );
			}
		}
		if ( selectedItem ) {
			selectedItem.$element.removeClass( 'oo-ui-element-hidden' );
			selectedItem.$element.removeAttr( 'aria-hidden' );
		}
	}
};
