/* FA NOTE: h.FA_v2.js IS USED INSTEAD of this script  in index.html, blog.html * blog-post.html because  
 *  script insertion that this version uses in line 60 to implement JSONP is problematic on Safari 
 * Instead, h.FA_v2.js uses  jQuery $.getJSON & callback=? to implement JSON on all browsers
 *
 * Fetch data from Google spreadsheet 
 * using JSON_Helper plugin
 * The Script uses JSONP because JSON returned from google webApp does not work in Safari:
 // BUG_Safari = https://code.google.com/p/google-apps-script-issues/issues/detail?id=3226
 *
 * @author Fani Akritidou, fani.akritidou@gmail.com
 * @date April 15, 2016
 * Function "getSpData" is the main function called on "document.ready" in index.html, blog.html, blog-post.html  
 * Function "getBlogPosts" fetches the blogposts and diplays them in index.html using handlebars.
 * Function "getBlogHtml" displays posts in blog.html using handlebars
 * Function "getSinglePost" displays a single post in blog-post.html
 * Function "getPostComments" displays comments for a post in blog-post.html
 *
 * NOTE: In blog.html &  blog-post.html, the code throws an error: “Error: You must pass a string or Handlebars AST to Handlebars.compile. You passed undefined”
   This is because in these 2 pages the scripts js/h.config & js/h.simpleStore.js are inluded but the handlebars template to display Products/Store data isn't present: 
   <script id="shirt-template" type="text/x-handlebars-template"></script>.
   I am not sure that js/h.config & js/h.simpleStore.js are needed outside of index.html? (only js/simpleCart is needed in blog.html & blog-post.html to display total cart items)
 */

 function getSpData(n) { // FA: Main function Parameter "n" refers to which of the sheets in the sheetsArray is needed (e.g. index.html only needs sheetsArray[0] = getSpData(0))

   var sheetsArray=[
   ["1MeZl5XkNfVUwi4GtTIeh4Q7oAUTAshoD33to1yAZco0", "Blogs"], 
   ["1vWJi_fJJ_9jS3dzs2fkT9Ucf3IBrWbq0liWd12p603E", "Blogs"], 
   ["1J6_sxNVqExXabvMFIf6EKzfU83bCqI5b4xaMQsCnLyE", "Blogs"],
   ["1zYmPMl3EVu9wSb8SXBTJqUC2JNspQDEzrh6Z2VZ0O4c", "Sheet1"]
   ];

   
   /*FA: sheetURL is the plugin that will return the JSON data
     The plugin JSON PLUGIN (FA) is the JSON_Helper with 1 added function to return a single result
    Plugin Url: https://script.google.com/d/10PlhSFbdDjYd9sf_dPmF-4rdY6Cs6Ik1zCDGWjo1QN7C7YR27HjivmoD/edit?usp=drive_web
   */

   var sheetUrl="https://script.google.com/macros/s/AKfycbwRd4Fiz_-YYkVmSjwp6Bl367dYCetqWg1C9z2ODC1nFzo0ZJbM/exec?id=" + sheetsArray[n][0] + "&sheet=" + sheetsArray[n][1];

  //FA: if parameter for post #no has been passed to url (?id=) use that to get the specific post, otherwise get the first post entry (#0 in results array)
   var bid=location.href.indexOf("?")>-1 ? location.href.substring(location.href.indexOf("=")+1) : 0;
    console.log(bid);

           switch(n){
                        case 0:
                          sheetUrl+= "&callback=getBlogPosts";  //FA: JSONP callback function for DemoSpreadSheet2 = index.html                        
                            break;
                        case 1:
                            sheetUrl+= "&callback=getBlogHtml"; //FA: JSONP callback function for DemoSpreadSheet2 = blog.html
                            break;
                        case 2: 
                            sheetUrl+= "&sr=" + bid + "&callback=getSinglePost"; //FA: JSONP callback function for DemoSpreadSheet3 = blog-post.html                    
                            break;
                        case 3:
                            sheetUrl+= "&callback=getPostComments"; //FA: JSONP callback function for DemoSpreadSheet4 = data from comments form
                            break;

                    }
      // FA: insert script at the end of body to get JSNOP data 
      //JSONP used because of BUG_Safari = https://code.google.com/p/google-apps-script-issues/issues/detail?id=3226
      //FA: Script insertion problematic on Safari (script gets called twice)

        var script=window.document.createElement('script'); 
                           script.src=sheetUrl;
                           $("body").append(script); //FA: insert the script before the closing body tag
               

} //FA: end of main function getSpData(n)



 function getBlogPosts(data){ // FA: this is data from DemoSpreadSheet1 to be used in index.html

          var posts=[];
                var entry = data.Blogs;
 
                   $(entry).each(function(){
                     // Column names are title, directory, description, image.
   
                      var post = {
                        title : this.Title,
                        directory: this.Directory,
                        description : this.Description,
                        image : this.Image
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
    
          
      } // FA: end of function getBlogPosts

function getBlogHtml( data ){ // FA: this is for DemoSpreadSheet2 = blog.html
             var blogPosts=[];
 
              var entry = data.Blogs;
 
                   $(entry).each(function(indx){
                        
                      var blogPost = {
                        title : this.Title.toUpperCase(),
                        tag: this.Tag.toUpperCase(),
                        intro : this.Intro,
                        image : this.Image,
                        video: this.Video,
                        comments:this.Comments,
                        indx: indx //add an id for the blogPost url that corresponds to the row number of the post in the DemoSpreadSheet 2
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

         } //end of function getBlogHtml


 function getSinglePost( data ){ // FA: this is for DemoSpreadSheet3 = blog-post.html

  // FA: get a single blog post using function  "readSingleRow_"  in JSON Plugin (FA)
             
             var blogPost="";

                 var entry = data.row;

                      blogPost = {
                        lead: entry.Lead,
                        body: entry.Body.replace("{{img1}}", entry.Img1).replace("{{img2}}", entry.Img2).replace(/{{video}}/g, entry.Video)                                           
                       }
                                             

                   console.log(blogPost);
  
             //  Handlebars templating 

            var blogSource = $("#post-template").html();
            var blogTemplate = Handlebars.compile(blogSource);
            var blogHtml = blogTemplate(blogPost);
            $(".fablogs").html(blogHtml);

        // templating ends here

        

           getSpData(3) // FA: When the Blog post is loaded, call main function passing parameter n=3 to load comments data from sheetUrl
    
       } //end of function getSinglePost 


function getPostComments( data ){ // FA: This is for DemoSpreadsheet 4 = comments form
   var comments=[];
 
    var entry = data.Sheet1;
 
                   $(entry).each(function(indx){
                     // Column names are title, directory, description, image.

                       if( this.Message !== "undefined" && this.Name !=="undefined") //FA: don't show undefined values from sheet
                       {
                      var comment = {
                        name : this.Name,
                        message: this.Message,                        
                        image : this.Image                        
                         };

                     comments.push(comment);

                         }                  

                 });

                   // When comments are loaded write the total number of comments using the created comments array
                   $( "#comments h4:first-child" ).text(comments.length + " comments");

             //  Handlebars templating 

             var commentContext = {
              comments : comments
             };

            var commentSource = $("#comment-template").html();
            var commentTemplate = Handlebars.compile(commentSource);
            var commentHtml = commentTemplate(commentContext);
            $(".facomments").append(commentHtml);


            // FA: addClass "last" to the last comment row

            var last=comments.length-1;
            $("#comments .comment:eq(" + last + ")" ).addClass("last");

         
         
  }  //end of function getPostComments   


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

    //FA: adding the data manually from the existing IP inputs instead of adding new inputs in the form with the existing data
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