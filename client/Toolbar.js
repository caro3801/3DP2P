/**
 * @author mrdoob / http://mrdoob.com/
 */

var Toolbar = function ( editor ) {

	var signals = editor.signals;

	var container = document.createElement("div");
	container.id = "toolbar";

	var buttons = document.createElement('div');
	buttons.id = "buttons";
	container.appendChild( buttons );

	// translate / rotate / scale

	var translate = document.createElement("button");
	translate.id = 'translate';
	translate.innerHTML = 'translate';
	translate.addEventListener('click', function () {

		signals.transformModeChanged.dispatch( 'translate' );

	},false );
	buttons.appendChild( translate );

	var rotate = document.createElement("button");
	rotate.id = 'rotate';
	rotate.innerHTML = 'rotate';
	rotate.addEventListener('click', function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	},false );
	buttons.appendChild( rotate );

	var scale = document.createElement("button");
	scale.id = 'scale';
	scale.innerHTML = 'scale';
	scale.addEventListener('click', function () {

		signals.transformModeChanged.dispatch( 'scale' );

	},false );
	buttons.appendChild( scale );

	// grid

	var grid = document.createElement("input");
	grid.id = 'grid';
	grid.name = 'grid';
	grid.type = "text";
	grid.style.width = '42px';
	grid.addEventListener('change', update );
	grid.value="25";

	var gridLabel = document.createElement("label");
	gridLabel.innerHTML = "Grid";
	gridLabel.htmlFor = 'grid';
	buttons.appendChild( gridLabel );
	buttons.appendChild( grid );

	//snap

	var snap = document.createElement("input");
	snap.id = 'snap';
	snap.name = 'snap';
	snap.type = "checkbox";
	snap.addEventListener('change', update );

	var snapLabel = document.createElement("label");
	snapLabel.innerHTML = "Snap";
	snapLabel.htmlFor = "snap";
	buttons.appendChild( snap );
	buttons.appendChild(snapLabel);

	//local

	var local = document.createElement("input");
	local.id = 'local';
	local.name = 'local';
	local.type = "checkbox";
	local.addEventListener('change', update );
	buttons.appendChild( local );

	var localLabel = document.createElement("label");
	localLabel.innerHTML = "Local";
	localLabel.htmlFor = "local";
	buttons.appendChild(localLabel );

	//showGrid

	var showGrid = document.createElement("input");
	showGrid.id = 'showGrid';
	showGrid.name = 'showGrid';
	showGrid.type = "checkbox";
	showGrid.checked = "checked";
	showGrid.addEventListener('change', update );
	buttons.appendChild( showGrid );

	var showGridLabel = document.createElement("label");
	showGridLabel.innerHTML = "Show grid";
	showGridLabel.htmlFor = "showGrid";
	buttons.appendChild( showGridLabel);

	function update() {

		signals.snapChanged.dispatch( snap.checked === true ? parseInt(grid.value) : null );
		signals.spaceChanged.dispatch( local.checked === true ? "local" : "world" );
		signals.gridChanged.dispatch( parseInt(grid.value) );
		signals.showGridChanged.dispatch( showGrid.checked );

	}

	update();

	return container;

};

module.exports = Toolbar;