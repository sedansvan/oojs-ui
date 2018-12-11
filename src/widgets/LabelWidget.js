/**
 * LabelWidgets help identify the function of interface elements. Each LabelWidget can
 * be configured with a `label` option that is set to a string, a label node, or a function:
 *
 * - String: a plaintext string
 * - jQuery selection: a jQuery selection, used for anything other than a plaintext label, e.g., a
 *   label that includes a link or special styling, such as a gray color or additional graphical elements.
 * - Function: a function that will produce a string in the future. Functions are used
 *   in cases where the value of the label is not currently defined.
 *
 * In addition, the LabelWidget can be associated with an {@link OO.ui.InputWidget input widget}, which
 * will come into focus when the label is clicked.
 *
 *     @example
 *     // Examples of LabelWidgets
 *     var label1 = new OO.ui.LabelWidget( {
 *         label: 'plaintext label'
 *     } );
 *     var label2 = new OO.ui.LabelWidget( {
 *         label: $( '<a>' ).attr( 'href', 'default.html' ).text( 'jQuery label' )
 *     } );
 *     // Create a fieldset layout with fields for each example
 *     var fieldset = new OO.ui.FieldsetLayout();
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( label1 ),
 *         new OO.ui.FieldLayout( label2 )
 *     ] );
 *     $( 'body' ).append( fieldset.$element );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.mixin.LabelElement
 * @mixins OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {OO.ui.InputWidget} [input] {@link OO.ui.InputWidget Input widget} that uses the label.
 *  Clicking the label will focus the specified input field.
 */
OO.ui.LabelWidget = function OoUiLabelWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.LabelWidget.parent.call( this, config );

	// Mixin constructors
	OO.ui.mixin.LabelElement.call( this, $.extend( {}, config, { $label: this.$element } ) );
	OO.ui.mixin.TitledElement.call( this, config );

	// Properties
	this.input = config.input;

	// Initialization
	if ( this.input ) {
		if ( this.input.getInputId() ) {
			this.$element.attr( 'for', this.input.getInputId() );
		} else {
			this.$label.on( 'click', function () {
				this.input.simulateLabelClick();
			}.bind( this ) );
		}
	}
	this.$element.addClass( 'oo-ui-labelWidget' );
};

/* Setup */

OO.inheritClass( OO.ui.LabelWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.LabelWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.LabelWidget, OO.ui.mixin.TitledElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.LabelWidget.static.tagName = 'label';
