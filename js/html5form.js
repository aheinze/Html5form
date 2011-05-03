(function($){
    
	var Validators = {
		number 	 : function(val) {return (/^[-+]?\d*\.?\d+$/).test(val);},
		email 	 : function(val) {return (/^[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i).test(val);},
		url 	 : function(val) {return (/^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/i).test(val);},
		custom   : function(val, input) {
			
			if(input.data("custom")) {
				return window[input.data("custom")](val, input);
			}
			
			return true;
		}
	};
	
	var Plugin = function(){};
	
	Plugin.prototype = $.extend(Plugin.prototype, {

		name: 'html5form',
		
		options: {
			tipgravity : 'w',
			tipfade: true,
			messages: {
				required: "This field is required",
				number: "Please enter a correct number",
				email: "Please enter a correct email",
				url: "Please enter a correct url",
				custom: "This field is not correct"
			}
		},
        
        placeholders: [],

		initialize : function(element, options) {
			
            this.element = element;
			
			this.options = $.extend({},this.options, options);
			
			var $this = this;

            //Filters browsers that support placeholder
            if(!("placeholder" in document.createElement("input"))){
                $(":input", element).each(function(){
					if($(this).attr('placeholder')){
                        $this.to_placeholder(this);
                    }
                });
            }

			element.bind("submit", function(e){
			
				$(".html5info").remove();
                
                //clear placeholder values on submit
                if($this.placeholders.length){
                    $.each($this.placeholders,function(){
                        if($(this).val()==$(this).attr('placeholder')){
                            $(this).val('');
                        }
                    });
                }
				
				if (!$this.check()) {
					e.preventDefault();
					$this.showTip($this.message, $this.input);				
				}
                
			});
	    },
		
		check: function() {
			
			var check = true;
			var $this = this;
            
			$this.input   = false;
			$this.message = '';
			
            //Filters browsers that support required
            if(!("required" in document.createElement("input"))){
                
                var required = [];
                
                $(':input:visible:not(:button,:submit,:radio,:checkbox)', this.element).each(function(i){
                    var ele = $(this);
                    
                    if(this.getAttribute('required')!=null || ele.hasClass("required")){
                        required.push(this);
                    }
                });
                
                for(var i=0;i<required.length;i++){
                    var input = $(required[i]);
                    if($.trim(input.val()) == "" || input.val()==input.attr("placeholder")) {
                        check = false;
                        $this.input   = input;
                        $this.message = $this.options.messages.required;
                        
                        break;
                    }
                }		
            }
			
			if(check){
				
				var elements = this.element.find("input.email, input.number, input.url, input[type=email],input[type=number],input[type=url]");
				
				for(var i=0;i<elements.length;i++){
					
					
					var input = $(elements[i]);
					var value = input.val();
					
					if(value=="" || value==input.attr("placeholder")) continue; //not required;

					for (var typ in Validators){
						
						if((input.hasClass(typ) || elements[i].getAttribute('type')==typ) && !Validators[typ].apply($this,[value,input])){
							
							check = false;
							$this.input   = input;
							
							if($this.message==="" && $this.options.messages[typ]) {
								$this.message = $this.options.messages[typ];
							}
                            
                            if(input.data("message")) {
                                $this.message = input.data("message");
                            }
							
							break;
						}
					}
					
					if(!check) break;
				}
				
			}
			
			return check;
		},
        
        to_placeholder: function(el) {
			
            var el = $(el);
            
            this.placeholders.push(el);
            
			if (el.val()=="" || el.val()==el.attr("placeholder")) {
				el.val(el.attr("placeholder"));
				el.addClass("placeholder");
			}
			
			el.bind("focusin", function(){
				if (el.hasClass("placeholder")) {
					el.removeClass("placeholder");
					el.val('');
				}
			})
            .bind("focusout", function(){
				if (el.val()=="") {
					el.val(el.attr("placeholder"));
					el.addClass("placeholder");
				}
			});
		},
		
		//code based on tipsy - https://github.com/jaz303/tipsy
		showTip: function(message, input) {
			var tip = $('<div class="html5info"><div class="html5info-inner"/></div>');
				tip.css({position: 'absolute', zIndex: 100000});

			tip.find('.html5info-inner').html(message);

			var pos = $.extend({}, input.offset(), {width: input.get(0).offsetWidth, height: input.get(0).offsetHeight});
			tip.get(0).className = 'html5info'; // reset classname in case of dynamic gravity
			tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body);
			var actualWidth = tip[0].offsetWidth, actualHeight = tip[0].offsetHeight;
			var gravity = this.options.tipgravity;

			switch (gravity.charAt(0)) {
				case 'n':
					tip.css({top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}).addClass('html5info-north');
					break;
				case 's':
					tip.css({top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}).addClass('html5info-south');
					break;
				case 'e':
					tip.css({top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}).addClass('html5info-east');
					break;
				case 'w':
					tip.css({top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}).addClass('html5info-west');
					break;
			}

			if (this.options.tipfade) {
				tip.hide().css({visibility: 'visible'}).fadeIn();
			} else {
				tip.css({visibility: 'visible'});
			}
		}
	});

	// Don't touch
	$.fn[Plugin.prototype.name] = function() {

		var args   = arguments;
		var method = args[0] ? args[0] : null;

		return this.each(function() {
			var element = $(this);

			if (Plugin.prototype[method] && element.data(Plugin.prototype.name) && method != 'initialize') {
				element.data(Plugin.prototype.name)[method].apply(element.data(Plugin.prototype.name), Array.prototype.slice.call(args, 1));
			} else if (!method || $.isPlainObject(method)) {
				var plugin = new Plugin();

				if (Plugin.prototype['initialize']) {
					plugin.initialize.apply(plugin, $.merge([element], args));
				}

				element.data(Plugin.prototype.name, plugin);
			} else {
				$.error('Method ' +  method + ' does not exist on jQuery.' + Plugin.name);
			}

		});
	};

})(jQuery);