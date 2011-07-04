define(['lib/jquery', 'lib/jquery/jquery.tmpl'], function () {

	$.fn.render = function( url, data, options, parentItem ) {
		var element = this[0];
		$(element).empty();
		// Synchronous get to block caller until the template is rendered.
		$.ajax({
			url: url,
			async: false,
			success: function(template) {
				$.tmpl(template, data, options, parentItem).appendTo(element);
			}
		});
	};
	
});