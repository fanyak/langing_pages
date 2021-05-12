/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/*                                                                                                                                             */
/*                                                    Copyright (C) 2015-2016 hōstbin LLC                                                      */
/*                                                          All Rights Reserved                                                                */
/*                                                           http://hostbin.co                                                                 */
/*                                                                                                                                             */
/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

// ************************************************************************************************
// jQuery Main
$(document).ready(function() {
console.log("STATUS = $ document.ready");	
         $("#commentForm").validate({
            //debug: true,
            rules: {
                Name: { required: true, minlength: 2 },
                Email: { required: true, email: true } 
                //Message: { required: true, minlength: 4 }             
            },
            success: function(label) {
                label.addClass("valid").text("Ok!")
            },
            
            submitHandler: function(form) {
                console.log("submitted!");
            }

           
        }); 
    $('#btn').on('click', function() {
        var isError = $('#commentForm').valid(); 
        console.log("ERROR ? = " +isError);
        if (isError === false) {
        //$('#error').html("<h6> ERROR </h6>");
            console.log("Error = false");
            return false;
        }
    });
 
}); 

// ************************************************************************************************
// Functions
function getIp() {
console.log("STATUS = getIP called");
  $.get( "https://api.ipify.org", function(data){
    $('#autoIp').append("<input type=\"hidden\" name=\"IP\" value=\""+data+"\" >");
    $.get("http://freegeoip.net/json/"+data, function (response) {
         $('#autoIpCountry').append("<input type=\"hidden\" name=\"Country\" value=\""+response.country_name+"\" >");
         $('#autoIpRegion').append("<input type=\"hidden\" name=\"Region\" value=\""+response.region_name+"\" >");
         $('#autoIpCity').append("<input type=\"hidden\" name=\"City\" value=\""+response.city+"\" >");
         $('#autoIpZip').append("<input type=\"hidden\" name=\"Zip\" value=\""+response.zip_code+"\" >");
         $('#autoIpMetro').append("<input type=\"hidden\" name=\"Metro\" value=\""+response.metro_code+"\" >");
        }) // end ipinfo
   }) // end ipify
};