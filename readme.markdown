# Html5form #

Enable placeholder, required, input[type=url,email,number] for dummy browsers


# Usage #

    $("form").html5form({
		//settings
		tipgravity : 'w',
		tipfade: true,
		messages: {
			required: "This field is required",
			number: "Please enter a correct number",
			email: "Please enter a correct email",
			url: "Please enter a correct url",
			custom: "This field is not correct"
		}
    });