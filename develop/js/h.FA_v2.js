/* THIS SCRIPT IS USED IN index.html, blog.html & blog-post.html
 * Fetch data from Google spreadsheet 
 * using JSON_Helper plugin
 * The Script uses JSONP because JSON returned from google webApp does not work on Safari:
 // BUG_Safari = https://code.google.com/p/google-apps-script-issues/issues/detail?id=3226
 *
 * @author Fani Akritidou, fani.akritidou@gmail.com
 * @date April 15, 2016
 * @updated April 26 2016
 *
 * Function "getSpData" is the main function called on "document.ready" in index.html, blog.html, blog-post.html  
 * Function "getBlogPosts" fetches the blogposts and diplays them in index.html using handlebars.
 * Function "getBlogHtml" displays posts in blog.html using handlebars
 * Function "getSinglePost" displays a single post in blog-post.html using handlebars
 * Function "getPostComments" displays comments for a post in blog-post.html using handlebars
 * Funtion   "updateBlogsSheet" increments by 1 the number of comments that appear for a post blog in blog.html. Called after a new comment is posted.
 * Function "showReplyForm" is called when the "reply to comment" link is clicked. It displays the reply-to-comment form.
 *
 * FA NOTE on Technical Debt: In blog.html &  blog-post.html, the code throws an error: “Error: You must pass a string or Handlebars AST to Handlebars.compile. You passed undefined”
   This is because in these 2 pages the scripts js/h.config & js/h.simpleStore.js are inluded but the handlebars template to display Products/Store data isn't present: 
   <script id="shirt-template" type="text/x-handlebars-template"></script>.
   I am not sure that js/h.config & js/h.simpleStore.js are needed outside of index.html? (only js/simpleCart is needed in blog.html & blog-post.html to display total cart items)
 */


 function getSpData(n) {

   var sheetsArray=[
   ["1MeZl5XkNfVUwi4GtTIeh4Q7oAUTAshoD33to1yAZco0", "Blogs"], 
   ["1vWJi_fJJ_9jS3dzs2fkT9Ucf3IBrWbq0liWd12p603E", "Blogs"], 
   ["1J6_sxNVqExXabvMFIf6EKzfU83bCqI5b4xaMQsCnLyE", "Blogs"],
   ["1zYmPMl3EVu9wSb8SXBTJqUC2JNspQDEzrh6Z2VZ0O4c", "Sheet1"]
   ];

   // FA: REF = JSON_HELPER plugin =http://pipetree.com/qmacro/blog/2013/10/sheetasjson-google-spreadsheet-data-as-json/

   /* *
     * FA: sheetURL is the plugin that will return the JSON data
     * The plugin JSON PLUGIN (FA) is the JSON_Helper with 1 added function to return a single result for blog-post.html
     *Plugin Url: https://script.google.com/d/10PlhSFbdDjYd9sf_dPmF-4rdY6Cs6Ik1zCDGWjo1QN7C7YR27HjivmoD/edit?usp=drive_web
   */

   var sheetUrl="https://script.google.com/macros/s/AKfycbwRd4Fiz_-YYkVmSjwp6Bl367dYCetqWg1C9z2ODC1nFzo0ZJbM/exec?id=" 
              + sheetsArray[n][0] 
              + "&sheet=" + sheetsArray[n][1]
              + "&callback=?"; //FA: JSONP callback

  /** 
   * FA: TECHNICAL DEPT
   * if parameter for post #no has been passed to url (?id=), then use that to get the specific post for blog-post.hml, 
   * otherwise get the first post entry (#1 post entry in sheet)
   *
   * The code presumes that the postID is the value of the first paremeter passed
   */

   var limit= location.href.indexOf("&")>-1 ? location.href.indexOf("&") : location.href.length;
    var bId= location.href.indexOf("?")>-1 ? location.href.substring(location.href.indexOf("=")+1, limit) : 1;
    console.log(bId);

           switch(n){
                        case 0:
                       //FA:  function for DemoSpreadSheet2 = index.html 
                          $.getJSON(sheetUrl, function(data){getBlogPosts(data);});                       
                            break;
                        case 1:
                        //FA: function for DemoSpreadSheet2 = blog.html
                            $.getJSON(sheetUrl, function(data){getBlogHtml(data);});  
                            break;
                        case 2: 
                        //FA: function for DemoSpreadSheet3 = blog-post.html -display a single post 
                            $.getJSON(sheetUrl +"&sr=" + bId, function(data){getSinglePost(data);});                                              
                            break;
                        case 3:
                        //FA: function for DemoSpreadSheet4 = data from comments form
                            $.getJSON(sheetUrl +"&fieldName=PostId" + "&fieldValue=" + bId, function(data){getPostComments(data);});                              
                            break;

                    }
                               

    } // end of getSpData(n)


        function getBlogPosts(data){ // FA: this is for DemoSpreadSheet1 = index.html

        	
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
             var tagsArray=[];
 
             var entry = data.Blogs;
 
                   $(entry).each(function(){
                     // Column names are title, directory, description, image.
   
                      var blogPost = {
                        title : this.Title.toUpperCase(),
                        tag: this.Tag.toUpperCase(),
                        intro : this.Intro,
                        image : this.Image,
                        video: this.Video,
                        comments:this.Comments,
                        tags:this.Tags.split(","),
                        indx: this.PostId //add an id for the blogPost url that corresponds to the data array returned with JSONP
                        };

                     blogPosts.push(blogPost);  

                     blogPost.tags.map(function(indx){
                      if (tagsArray.indexOf(indx)==-1 && indx.length>0){
                        tagsArray.push(indx);
                      }   
                    });

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


          //FA: create separate template for tags          
            var tagContext = {
              tags : tagsArray
             };

            var tagSource = $("#tag-template").html();
            var tagTemplate = Handlebars.compile(tagSource);
            var tagHtml = tagTemplate(tagContext);
            $(".fa_tag").append(tagHtml);


            // templating ends here  
           
         } // FA: end of function getBlogHtml

       function getSinglePost( data ){ // FA: this is for DemoSpreadSheet3 = blog-post.html
             var blogPost="";

 
              var entry = data.row;

                      blogPost = {
                        lead: entry.Lead,
                        //FA:replace the placeholders for images and video in the "Body" column with values from the Images and Video columns
                        body: entry.Body.replace("{{img1}}", entry.Img1).replace("{{img2}}", entry.Img2).replace(/{{video}}/g, entry.Video),                                                                  
                       }
                                             

                   console.log(blogPost);

                   var tags = entry.Tags.split(","); //FA: creat tags array

             //  Handlebars templating 

            var blogSource = $("#post-template").html(); //FA template for blog post
            var blogTemplate = Handlebars.compile(blogSource);
            var blogHtml = blogTemplate(blogPost);
            $(".fablogs").html(blogHtml);


             var tagContext = { //FA: seperate template for tags
              tags : tags
             };

            var tagSource = $("#tags-template").html(); 
            var tagTemplate = Handlebars.compile(tagSource);
            var tagHtml = tagTemplate(tagContext);
            $(".fa_tags").append(tagHtml);

        // templating ends here

        // FA: if the blog post loads, load the comments 

          getSpData(3);
    
       } //FA: end of function getSinglePost  


    function getPostComments( data ){ // FA: This is for DemoSpreadsheet 4 = comments form
	           var comments=[];
	           var comment_children=[];
	           var comment_children_ids=[];
 
                       
               var entry = data.comments;
 
                   $(entry).each(function(indx){
                     // Column names are title, directory, description, image.

                       if( this.Message !== "undefined" && this.Name !=="undefined") //FA: don't show undefined comments
                       {
                      var comment = {
                        name : this.Name,
                        message: this.Message,                        
                        image : this.Image, 
                        commentID: this.CommentID,   
                        parentId: this.ParentId                    
                         };

                     //FA: create separate arrays for the parent and children comments    

                     if(comment.parentId==0)
                     {
                     comments.push(comment);
                      }
                     else {
                      comment_children.push(comment);                      
                      }                   

                         } 


                     });

               //FA:  write the total number of comments using the length of the data array
             $( "#comments h4:first-child" ).text(comments.length + comment_children.length + " comments");


             /*
             * FA:  Handlebars templating for Parent Comments
             * parent comments are placed 1st, so that  child comments can be sorted underneath their parents
             * the 'data-comment' attribute in each parent comment block is used to place the children under the right parent
             */ 

            var commentContext = {
              comments : comments
             };

            var commentSource = $("#comment-template").html();
            var commentTemplate = Handlebars.compile(commentSource);
            var commentHtml = commentTemplate(commentContext);
            $(".facomments").html(commentHtml);
            // templating ends here  

            // FA: addClass "last" to last comment row
            var last=comments.length-1;
           $("#comments .comment:eq(" + last + ")" ).addClass("last");



          /**
          * FA: Start of Handlebars to display child comments under their parents
          * The cycle starts at line 331 where the parent comments array each mappaed against the "getChildren" function
          * The "getChildren" function = for every parent comment object check if it has a child in the comment_children array
          * If a child comment belongs to that parent, then use Handlebars to place the comment under the parent with "data-comment"=parentId
          * Call the getChildren function for every object in comment_children in order to find children of Child comments
          * The handlebars block for child comments has the "data-comment" attribute in the .row tag = every child comment is appended at the end
          * The positioning of comments that are children of child comments is Technical Debt
          */
          
           function getChildren( el, indx ) {

           comment_children.forEach(function( theChild, num ){

           	if(theChild.parentId == el.commentID) //FA: if the comment is a reply to a parent comment in Array comments
           {       	

            var childContext =  theChild;

            var commentSource = $("#child-template").html();
            var commentTemplate = Handlebars.compile(commentSource);
            var commentHtml = commentTemplate(childContext);

            /* FA: append the template under Parent Comment 
             * TECHNICAL DEPT - Find a  better way to display comment replies under child comments replies
            */
            if(indx==-1) //FA: if reply to child comment put under the child comment
            $("#comments [data-comment='" + theChild.parentId + "']").parent().append(commentHtml);
            else  //FA: else if reply to parent comment put under parent comment            	
            $("#comments [data-comment='" + theChild.parentId + "']").append(commentHtml);

           /* 
           * FA: call the function for every child comment to check if it has replies
           * @param "theChild" the child comment that calls the "getChildren" function for itself
           * to get it's own child comments
           * @param "-1" pass to differentiate how the comment will be displayed (see above line 305: if indx==-1)
           */
            //FA: getChildren.call(theChild, theChild, -1);
             getChildren(theChild, -1);

           	}

           	})


           }

          //FA: Call getChildren for comments Array to find the replies to parent comments 
          comments.map(getChildren);
          
      //FA: show the reply form and pass the ParentId value for the reply comment
      $("#comments .reply a" ).on( "click", function(e) {
    	e.preventDefault();
    	var name=$(this).parent().siblings('.text-uppercase').text();
    	var pos=$(this).parent().parent().data("comment");
      console.log(typeof pos);

      showReplyForm($(this).data('reply'), name, pos);

      });

  }	//end of function getPostComments	               



// FA: post message for a blog post using google sheets
// FA = REF = http://railsrescue.com/blog/2015-05-28-step-by-step-setup-to-send-form-data-to-google-sheets/
// Bind to the submit event of our form

$(".commentForms").submit(function(event){

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

    //FA: Add the bpostId  to reference the Blog Post a user is commenting on
    // The bpostID var equals to the value of the 1st parameter passed to the url (?{parameter}=value)
    var limit= location.href.indexOf("&")>-1 ? location.href.indexOf("&") : location.href.length;
    var bpostId= location.href.indexOf("?")>-1 ? location.href.substring(location.href.indexOf("=")+1, limit) : 1;
    console.log(bpostId);

    //FA: adding the IP data from the existing inputs instead of adding new inputs in the form with existing data
    // parameter must match header cell value in sheeet
    serializedData+="&IP=" + $("#commentForm input[name='IP']").val() 
    + "&Country=" + $("#commentForm input[name='Country']").val()
    + "&Region=" + $("#commentForm input[name='Region']").val()
    + "&City=" + $("#commentForm input[name='City']").val()
    + "&Zip=" + $("#commentForm input[name='Zip']").val()
    + "&Metro=" + $("#commentForm input[name='Metro']").val()
    + "&Image=" + ""
    + "&PostId=" + bpostId; // FA: to which blog post belongs the posted comment

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
        $(this).parent().html("<div id='inputFeedback'></div>");
        $('#inputFeedback').html("<br><p><h6> Thank you !</h6>").append("<p><img width='25px height='25px id='checkmark' src='https://storage.googleapis.com/gcs.hostbin.co/assets/public/checkmark.png' /><br><p><br>");
        
        //FA: set "ParentId" value back to 0 = create new comment, not a reply to existing comment
        $("#commentReply input[name='ParentId']").val(0);

         /*
         *FA: function "updateBlogSheet" increments the number of comments that appear for this post in blog.html line 266 
         * sheet to update = 1vWJi_fJJ_9jS3dzs2fkT9Ucf3IBrWbq0liWd12p603E
         */
        updateBlogsSheet(bpostId);
    });


    // Immediate feedback = UX
    $("#inputFeedback").remove(); //FA: remove existent #inputFeedback incase of comment after reply comment = dupblicate id inputFeedback
    $(this).parent().html("<div id='inputFeedback'></div>");
    $('#inputFeedback').html("<br><p><h6> Recording...</h6>");

    
    
});  // FA: end of posting message


 /* 
 * FA: function to increment by 1 the number of comments that appears in blog.html line 266 for a blog post
 * This function is called after a new comment is posted for the blog post
 * Sheet Id to update: 1vWJi_fJJ_9jS3dzs2fkT9Ucf3IBrWbq0liWd12p603E - this is sheet used for blog.html
 */

 function updateBlogsSheet(pId){

  /* when the parameters Keyrow & KeyFeild are passed, then function "incremetValues" is called
  in JSON PLUGIN (FA): https://script.google.com/d/10PlhSFbdDjYd9sf_dPmF-4rdY6Cs6Ik1zCDGWjo1QN7C7YR27HjivmoD/edit?usp=drive_web"
  */

var sheetUrl="https://script.google.com/macros/s/AKfycbwRd4Fiz_-YYkVmSjwp6Bl367dYCetqWg1C9z2ODC1nFzo0ZJbM/exec?id=" 
              + "1vWJi_fJJ_9jS3dzs2fkT9Ucf3IBrWbq0liWd12p603E" // this is the id of the sheet that is updated
              + "&sheet=Blogs"
              + "&keyRow=" + pId // set the row where the cell to be incremented is
              + "&keyField=Comments" // set the collumn where the cell to be incremented is
              + "&callback=?"; //FA: JSONP callback

$.getJSON(sheetUrl, function(data){console.log(data.result);});


 } // end of function


/**
* FA: function to add the commentID of the comment a user is replying to 
* The value will be passed to the "ParentId" field in the Sheet
* Sheet URL: https://docs.google.com/spreadsheets/d/1zYmPMl3EVu9wSb8SXBTJqUC2JNspQDEzrh6Z2VZ0O4c/edit#gid=0
*/

 function showReplyForm(replyID, name, pos){

    //FA: get the comment block for the comment that is to be replied to
 	var commentToReply=document.querySelector("[data-comment='"+replyID+"']");
 	var replyForm=document.getElementById("reply-form");
 	
    //FA: TECHNICAL DEPT move the #replyForm form under the comment to reply to
    // If pos>0, then reply to parent comment = position the form underneath parent
    // else if pos==undefined, then reply to child comment = position the form underneath the child
 
    if(pos==undefined) {
    commentToReply.parentNode.insertBefore(replyForm, commentToReply.nextElementSibling);
      }
    else if (pos>0) {
     var lastP=document.querySelector("[data-comment='"+replyID+"'] > p:last-of-type");
    commentToReply.insertBefore(replyForm, lastP.nextElementSibling);
	    }

 	replyForm.setAttribute('style','display:block;');
 	$("#commentReply #reply-comment").html("REPLY TO  " + name.toUpperCase() + ":\n");

 	//FA: pass the replyID
 	// after the form is posted, the value of the ParentId input is set again to 0 (see line 428)
 	$("#commentReply input[name='ParentId']").val(replyID);


 	//FA: Cancel Reply = return to initial position, hide reply form and set ParentId input value to "0"
    $("#cancelReply").on("click", function(e){
    	e.preventDefault();
    	
    	//FA: move the #replyForm form back to its original position = after #all
    	document.getElementById("commentReply").reset();
    	replyForm.setAttribute('style','display:none;');
    	document.body.insertBefore(replyForm, document.getElementById("all").nextElementSibling);
    	    	
    });
 }