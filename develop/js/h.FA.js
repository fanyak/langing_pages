/* -- NOTE: this script doesn't use the JSON_Helper plugin  (https://docs.google.com/spreadsheets/d/1zYmPMl3EVu9wSb8SXBTJqUC2JNspQDEzrh6Z2VZ0O4c/edit#gid=0)
/* Instead data is returned using this AppScript: https://script.google.com/d/1ewGLYOrm5nJNd_KFaanr6JEv8r19OUTvli50qhuOStMl20Pr5DPSO5uv/edit?usp=sharing
* For this reason this script IS NOT USED in index.html, blog.html & blog-post.html
* THE SCRIPT js/h.FA_v2.js IS USED INSTEAD to fetch data for index.html, blog.html & blog-post.html
 * -- END OF NOTE
 *
 * Fetch Blog Posts from Google spreadsheet 
 * @author Fani Akritidou, fani.akritidou@gmail.com
 * @date April 11, 2016
 * Function "getSpData" is the main function called in index.html, blog.html, blog-post.html  
 * Function "getSheetInfo" fetches the worksheetId of the spreadsheet to be used in the feed url
 * after the worksheetId is fetched getBlogPosts is called using the complete url
 * Function  "getBlogPosts" fetchees the blogposts and diplays them on index.html using handlebars.
 * if getJSON is successful the script uses handlebar templating to display the data in index.html
 * Function "getBlogHtml" displays posts in blog.html
 * Function "getSinglePost" displays a post in blog-post.html
 * Function "getPostComments" displays comments for a post in blog-post.html

 */

function getSpData(n) {
  
  var hostname = "https://spreadsheets.google.com";
  var format = "json";
  var blogsSheetName = "Blogs"; //This must be the name of  the 1st Sheet in SpreadSheet
  var settingsSheetName = "Settings"; // This must be the name of the 2nd Sheet in SpreadSheet
  var commentsSheetName="Sheet1"; // if sheet1 is not named?
  var sheetIDs = {};

  var sheetsArray=["1MeZl5XkNfVUwi4GtTIeh4Q7oAUTAshoD33to1yAZco0", "1vWJi_fJJ_9jS3dzs2fkT9Ucf3IBrWbq0liWd12p603E", "1J6_sxNVqExXabvMFIf6EKzfU83bCqI5b4xaMQsCnLyE",
  "1zYmPMl3EVu9wSb8SXBTJqUC2JNspQDEzrh6Z2VZ0O4c" ];

  //FA: create an object to call getsheetInfo.validate() and get the WorkSheetId
  var obj={};
  getSheetInfo.call(obj, sheetsArray[n], n);
  obj.validate();


     function getSheetInfo( sheet_url, opt ) { //FA:  Function to validate WorkSheetID for all WorkSheets
       
         // ID of the Google Spreadsheet        
          var spreadsheetURL = hostname + "/feeds/worksheets/" + sheet_url + "/public/full?alt=" + format;        
        

          this.validate= function() {

            $.getJSON(spreadsheetURL)
                .done(function(data) {

                   var sheets = data.feed.entry;

                    $(sheets).each(function(i, sheet) {

                        var title = sheet.title.$t;
                        var id = sheet.id.$t;
                        var sheetID = id.substr(id.lastIndexOf('/') + 1);

                        if(title == settingsSheetName) {
                            sheetIDs.settingsSheetID = sheetID;
                        }
                        if(title == blogsSheetName || title == commentsSheetName) {
                            sheetIDs.blogsSheetID  = sheetID;
                        }
                    });

                    switch(opt){
                        case 0:
                            getBlogPosts(sheetIDs.blogsSheetID, sheet_url); //FA: function for DemoSpreadSheet1 = index.html
                            break;
                        case 1:
                            getBlogHtml(sheetIDs.blogsSheetID, sheet_url); //FA: function for DemoSpreadSheet2 = blog.html
                            break;
                        case 2:                        
                            getSinglePost(sheetIDs.blogsSheetID, sheet_url); //FA: function for DemoSpreadSheet3 = blog-post.html
                            break;
                        case 3:
                            getPostComments(sheetIDs.blogsSheetID, sheet_url); //FA: function for DemoSpreadSheet4 = comments form
                            break;

                    }

                })
                .fail(function (){console.log(spreadsheetURL);});

          }
                

        function getBlogPosts( sheetID, sheetUrl ){ // FA: This is for DemoSpreadsheet 1 = index.html
             var posts=[];
 
             // Make sure it is public or set to Anyone with link can view 
             var url =  hostname + "/feeds/list/" + sheetUrl + "/" + sheetID + "/public/values?alt=json";
 
             $.getJSON(url)
             .done(function(data) {
 
                var entry = data.feed.entry;
 
                   $(entry).each(function(){
                     // Column names are title, directory, description, image.
   
                      var post = {
                        title : this.gsx$title.$t,
                        directory: this.gsx$directory.$t,
                        description : this.gsx$description.$t,
                        image : this.gsx$image.$t
                        };

                     posts.push(post);                        

                 });

               console.log(posts);
  
             //  Handlebars templating 

             var blogContext = {
              posts : posts
             };

            var blogSource = $("#blog-template").html();
            var blogTemplate = Handlebars.compile(blogSource);
            var blogHtml = blogTemplate(blogContext);
            $(".fablogs").append(blogHtml);

        // templating ends here
    
          })
           .fail(function(){
                  // what to do if JSON call fails
                  console.log("JSON call DemoSpreadSheet1 has failed");
                });

 
         } // FA: End of function getBlogPosts
                                
        function getBlogHtml( sheetID, sheetUrl ){ // FA: this is for DemoSpreadSheet2 = blog.html
             var blogPosts=[];
 
             // Make sure it is public or set to Anyone with link can view 
             var url = hostname + "/feeds/list/" + sheetUrl + "/" + sheetID + "/public/values?alt=json";
 
             $.getJSON(url)
             .done(function(data) {
 
                var entry = data.feed.entry;
 
                   $(entry).each(function(indx){
                     // Column names are title, directory, description, image.
   
                      var blogPost = {
                        title : this.gsx$title.$t.toUpperCase(),
                        tag: this.gsx$tag.$t.toUpperCase(),
                        intro : this.gsx$intro.$t,
                        image : this.gsx$image.$t,
                        video: this.gsx$video.$t,
                        comments:this.gsx$comments.$t,
                        indx: Number(indx+2) //add an id for the blogPost url that corresponds to the row number of the post in the DemoSpreadSheet 2
                        };

                     blogPosts.push(blogPost);                        

                 });

               console.log(blogPosts);
  
             //  Handlebars templating 

             var blogContext = {
              blogPosts : blogPosts
             };

            var blogSource = $("#blog-template").html();
            var blogTemplate = Handlebars.compile(blogSource);
            var blogHtml = blogTemplate(blogContext);
            $(".fablogs").append(blogHtml);


          })
           .fail(function(){
                  // what to do if JSON call fails
                  console.log("JSON call DemoSpreadSheet2 has failed");
                });

 
         } //end of function getBlogHtml            
       
      function getSinglePost( sheetID, sheetUrl ){ // FA: this is for DemoSpreadSheet3 = blog-post.html
             var blogPost="";
 
             // Make sure it is public or set to Anyone with link can view 
             var url = hostname + "/feeds/list/" + sheetUrl + "/" + sheetID + "/public/values?alt=json";
 
             $.getJSON(url)
             .done(function(data) {
 
                //if parameter for post #no has been passed to url (?id=) use that to get the specific post, otherwise get the first post entry
                // start with id=2 = entry[0]
                var bid=location.href.indexOf("?")>-1 ? location.href.substring(location.href.indexOf("=")+1) -2 : 0;
                console.log(bid);
 
                   var entry = data.feed.entry[bid];

                      blogPost = {
                        lead: entry.gsx$lead.$t,
                        body: entry.gsx$body.$t.replace("{{img1}}",entry.gsx$img1.$t).replace("{{img2}}",entry.gsx$img2.$t).replace("{{video}}",entry.gsx$video.$t)                                            
                       }
                                             

                   console.log(blogPost);
  
             //  Handlebars templating 

            var blogSource = $("#post-template").html();
            var blogTemplate = Handlebars.compile(blogSource);
            var blogHtml = blogTemplate(blogPost);
            $(".fablogs").html(blogHtml);

        // templating ends here

        // FA: if the blog post loads, load the comments for this blog post

          getSheetInfo.call(obj, sheetsArray[3], 3);
           obj.validate();
    
          })
           .fail(function(){
                  // what to do if JSON call fails
                  console.log("JSON call DemoSpreadSheet3 has failed");
                });

 
         } //end of function getSinglePost   

    function getPostComments( sheetID, sheetUrl ){ // FA: This is for DemoSpreadsheet 4 = comments form
	 var comments=[];
 
             // Make sure it is public or set to Anyone with link can view 
             var url = hostname + "/feeds/list/" + sheetUrl + "/" + sheetID + "/public/values?alt=json";
 
             $.getJSON(url)
             .done(function(data) {
 
                var entry = data.feed.entry;
 
                   $(entry).each(function(indx){
                     // Column names are title, directory, description, image.

                       if( this.gsx$message.$t !== "undefined" && this.gsx$name.$t !=="undefined") //FA: don't show undefind comments
                       {
                      var comment = {
                        name : this.gsx$name.$t.toUpperCase(),
                        message: this.gsx$message.$t.toUpperCase(),                        
                        image : this.gsx$image.$t,                        
                         };

                     comments.push(comment);

                         }                  

                 });

                   // write the number of comments 
                   $( "#comments h4:first-child" ).text(comments.length + " comments");

             //  Handlebars templating 

             var commentContext = {
              comments : comments
             };

            var commentSource = $("#comment-template").html();
            var commentTemplate = Handlebars.compile(commentSource);
            var commentHtml = commentTemplate(commentContext);
            $(".facomments").append(commentHtml);

            // FA: addClass "last" to last comment row
            var last=comments.length-1;
         $("#comments .comment:eq(" + last + ")" ).addClass("last");

          })
           .fail(function(){
                  // what to do if JSON call fails
                  console.log("JSON call DemoSpreadSheet4 has failed");
                });

         }	//end of function getPostComments	

     }   
  
} // end of 

  
// post message for a post using google sheets
// FA = REF = http://railsrescue.com/blog/2015-05-28-step-by-step-setup-to-send-form-data-to-google-sheets/

// Bind to the submit event of our form
$("#newComment").submit(function(event){

  // Variable to hold request
var messagerequest;

console.log("STATUS: processing form input...");
// Prevent default posting of form
    event.preventDefault();
    // Abort any pending request
    if (messagerequest) {
        messagerequest.abort();
    }
    // setup some local variables
    var $form = $(this);

    // Let's select and cache all the fields
    var $inputs = $form.find("input, text, email, select, button, textarea");

    // Serialize the data in the form
    var serializedData = $form.serialize();

    //FA: adding the data from the existing inputs instead of adding new inputs in the form with existing data
    serializedData+="&IP=" + $("#commentForm input[name='IP']").val() 
    + "&Country=" + $("#commentForm input[name='Country']").val()
    + "&Region=" + $("#commentForm input[name='Region']").val()
    + "&City=" + $("#commentForm input[name='City']").val()
    + "&Zip=" + $("#commentForm input[name='Zip']").val()
    + "&Metro=" + $("#commentForm input[name='Metro']").val()
     + "&Image=" + "";

console.log(serializedData);
    // Let's disable the inputs for the duration of the Ajax request.
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop("disabled", true);

    // Fire off the request 
    // REF = https://www.lennu.net/jquery-ajax-example-with-json-response/
    messagerequest = $.ajax({
        // FA NOTE: 
        // Sheet Name = TEST = hostbin.co - comments (FA)
        // Sheet ID = 1zYmPMl3EVu9wSb8SXBTJqUC2JNspQDEzrh6Z2VZ0O4c
        // Sheet URL = https://docs.google.com/spreadsheets/d/1zYmPMl3EVu9wSb8SXBTJqUC2JNspQDEzrh6Z2VZ0O4c/edit#gid=0
        // Sheet Exec = hhttps://script.google.com/macros/s/AKfycbxJlTFcDaN89SoHjn2X-5_byOC48sD6OGSedIJYhBC2Xn1_Vq7J/exec
        //url: "SCRIPT URL GOES HERE"
        url: "https://script.google.com/macros/s/AKfycbxJlTFcDaN89SoHjn2X-5_byOC48sD6OGSedIJYhBC2Xn1_Vq7J/exec",
        type: "post",
        data: serializedData
    });

    // Callback handler that will be called on success ; success = done
    messagerequest.done(function (response, textStatus, jqXHR){
        // Log a message to the console
        console.log("STATUS: Working = JS to GAS...");
        console.log(response);
        console.log(textStatus);
        console.log(jqXHR);
    });

    // Callback handler that will be called on failure
    messagerequest.fail(function (jqXHR, textStatus, errorThrown){
        // Log the error to the console
        console.error( "The following error occurred: "+ textStatus, errorThrown );
        // Will work in Safari but update does not occur
        // BUG_Safari = https://code.google.com/p/google-apps-script-issues/issues/detail?id=3226
    });

    // Callback handler that will be called regardless
    // if the request failed or succeeded
    messagerequest.always(function () {
        // Reenable the inputs
        $inputs.prop("disabled", false);
        $('#newComment').html("<div id='inputFeedback'></div>");
        $('#inputFeedback').html("<br><p><h6> Thank you !</h6>").append("<p><img width='25px height='25px id='checkmark' src='https://storage.googleapis.com/gcs.hostbin.co/assets/public/checkmark.png' /><br><p><br>");
    });




    // Immediate feedback = UX
    $('#newComment').html("<div id='inputFeedback'></div>");
    $('#inputFeedback').html("<br><p><h6> Recording...</h6>");

    
    
});

 // FA: end of posting message