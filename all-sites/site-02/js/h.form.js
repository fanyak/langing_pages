
/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/*                                                                                                                                             */
/*                                                    Copyright (C) 2015-2016 hōstbin LLC                                                      */
/*                                                          All Rights Reserved                                                                */
/*                                                           http://hostbin.co                                                                 */
/*                                                                                                                                             */
/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

console.log('STATUS: using site-form google ajax');

// SOURCE = http://railsrescue.com/blog/2015-05-28-step-by-step-setup-to-send-form-data-to-google-sheets/

// Variable to hold request
var request;

// Bind to the submit event of our form
$("#commentForm").submit(function(event){
console.log("STATUS: processing form input...");

    // Abort any pending request
    if (request) {
        request.abort();
    }
    // setup some local variables
    var $form = $(this);

    // Let's select and cache all the fields
    var $inputs = $form.find("input, text, email, select, button, textarea");

    // Serialize the data in the form
    var serializedData = $form.serialize();

    // Let's disable the inputs for the duration of the Ajax request.
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop("disabled", true);

    // Fire off the request 
    // REF = https://www.lennu.net/jquery-ajax-example-with-json-response/
    request = $.ajax({
        // NOTE: 
        // Sheet Name = LIVESITE = hostbin.co (otto@hostbin)
        // Sheet ID = 1-kp_Lg--jdOtuJz0hVlXEGbQyOPSnBgq3r7P81wzVzA
        // Sheet URL = https://docs.google.com/spreadsheets/d/1-kp_Lg--jdOtuJz0hVlXEGbQyOPSnBgq3r7P81wzVzA/edit#gid=0
        // Sheet Exec = https://script.google.com/macros/s/AKfycbzKtbFKSnOiCpc50qwh8iVFCIMqp1Xwu3eYIGoLIj4ddWDg5IbW/exec
        //url: "SCRIPT URL GOES HERE"
        url: "https://script.google.com/macros/s/AKfycbzKtbFKSnOiCpc50qwh8iVFCIMqp1Xwu3eYIGoLIj4ddWDg5IbW/exec",
        type: "post",
        data: serializedData
    });

    // Callback handler that will be called on success ; success = done
    request.done(function (response, textStatus, jqXHR){
        // Log a message to the console
        console.log("STATUS: Working = JS to GAS...");
        console.log(response);
        console.log(textStatus);
        console.log(jqXHR);
    });

    // Callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // Log the error to the console
        console.error( "The following error occurred: "+ textStatus, errorThrown );
        // Will work in Safari but update does not occur
        // BUG_Safari = https://code.google.com/p/google-apps-script-issues/issues/detail?id=3226
    });

    // Callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
        // Reenable the inputs
        $inputs.prop("disabled", false);
        $('#commentForm').html("<div id='inputFeedback'></div>");
        $('#inputFeedback').html("<br><p><h6> Thank you !</h6>").append("<p><img width='25px height='25px id='checkmark' src='https://storage.googleapis.com/gcs.hostbin.co/assets/public/checkmark.png' /><br><p><br>");
    });


    // Immediate feedback = UX
    $('#commentForm').html("<div id='inputFeedback'></div>");
    $('#inputFeedback').html("<br><p><h6> Recording...</h6>");

    // Prevent default posting of form
    event.preventDefault();
    
});
