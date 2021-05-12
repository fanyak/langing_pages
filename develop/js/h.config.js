$(function() {
	simpleCart({

	    // array representing the format and columns of the cart
	    // see the cart columns documentation
	    cartColumns: [
	        { attr: "name" , label: " Name" },
	        { attr: "price" , label: " Price", view: 'currency' },
	        //{ view: "decrement" , label: false },
	        { attr: "quantity" , label: " Qty" },
	        //{ view: "increment" , label: false },
	        { attr: "total" , label: "SubTotal", view: 'currency' },
	        { view: "remove" , text: "X" , label: false }    // product is subscription based = qty always 1
	    ],

	    // "div" or "table" - builds the cart as a table or collection of divs
	    cartStyle: "div", // div default

	    // how simpleCart should checkout, see the checkout reference for more info
	    checkout: {
	        type: "PayPal" ,
	        email: "you@yours.com"
	    },

	    // set the currency, see the currency reference for more info
	    currency: "USD",

	    // collection of arbitrary data you may want to store with the cart,
	    // such as customer info
	    data: {},

	    // set the cart langauge (may be used for checkout)
	    language: "english-us",

	    // array of item fields that will not be sent to checkout
	    excludeFromCheckout: [
	    	'qty', // OG: in testing, using simplecart.js code, qty was sent.
	    	'thumb'
	    ],

	    // custom function to add shipping cost
	    shippingCustom: null,

	    // flat rate shipping option
	    shippingFlatRate: 0,

	    // added shipping based on this value multiplied by the cart quantity
	    shippingQuantityRate: 0,

	    // added shipping based on this value multiplied by the cart subtotal
	    shippingTotalRate: 0,

        // OG = technical debt = some states tax the cloud
	    // tax rate applied to cart subtotal
	    taxRate: 0,

	    // true if tax should be applied to shipping
	    taxShipping: false,

	    // event callbacks (via Event Listeners)
	    beforeAdd               	: null,
	    afterAdd                	: null,
	    load                    	: null,
	    beforeSave              	: null,
	    afterSave               	: null,
	    update                  	: null,
	    ready                   	: null,
	    checkoutSuccess             : null,
	    checkoutFail                : null,
	    beforeCheckout              : null

	});



    // OG: Custom simpleCart.js Event Listeners for callbacks = http://simplecartjs.org/documentation/using_events
    // Does not work in Firefox , use "inspect" = https://developer.mozilla.org/en-US/docs/Tools/Page_Inspector/How_to/Examine_event_listeners
    /*
    simpleCart.bind( 'afterAdd' , function( item ){
      alert( item.name + " has been added to the cart!");
    });
    */
   
    // OG: Debug cart via console
    simpleCart.bind( 'update' , function(){
    console.log( "Whoa, the cart total is now at " + simpleCart.grandTotal() + "! Nice!" ); 
    });

    // OG: Hide empty cart = https://github.com/wojodesign/simplecart-js/issues/211
    // jQuery show/hide = http://www.w3schools.com/jquery/jquery_ref_effects.asp
 	simpleCart.bind('update', function(){
  		if( simpleCart.quantity() === 0 ){
    		// hide the cart
        	console.log( "Cart Empty" );
        	// Remove Checkout Option
        	$("#link_checkout").hide();
  		} else {
    		// Show checkout Option
        	$("#link_checkout").show();
  		}
	});   


    // simpleStore init
	simpleStore.init({

		// brand can be text or image URL
		brand : "hōstbin",

		// numder of products per row (accepts 1, 2 or 3)
		numColumns : 3,

		// name of JSON file, located in directory root
		//JSONFile : "products.json", 

        // NEW: per "google-sheets.js" doc
        // NOTE: Don't forget remove JSONFILE config + add "," to previous record in json file
        // Spreadsheet URL = https://docs.google.com/spreadsheets/d/10gWjx5dw-apQ_4zPXFfGX694QdrA-j4z9NmYPxqPZ6w/edit?usp=sharing
        spreadsheetID : "10gWjx5dw-apQ_4zPXFfGX694QdrA-j4z9NmYPxqPZ6w"

	});

});
