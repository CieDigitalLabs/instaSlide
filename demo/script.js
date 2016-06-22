(function($) {
	
	$("body").foundation();
	
	// Initialize InstaSlide
	$("article").instaSlide({
		wrapperCSS: {
			width: "90%",
			background: "rgba(0,0,0,.7)",
			padding: "60px 10px 10px 10px"
		}
	});
	
})(jQuery);