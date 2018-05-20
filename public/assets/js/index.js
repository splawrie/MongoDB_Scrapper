/* global bootbox */
$(document).ready(function() {
    //Setting a reference to the article-container div where all of the dynamic content will go
    //Adding event listeners to any dynamically generated save article
    //scrape new article buttons
    var articleContainer = $(".article-container");
    $(document).on("clickf", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);

    //Once the page is ready, run the initPage function 
    initPage();

    function initPage() {
        //Empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
            .then(function(data) {
            //If there are headlines render them to the page
            if (data && data.length) {
                renderArticles(data);
            }
            else {
                //Otherwise render a message explaining there are no articles
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        //This function handles appending HTML containing the article data to the web page
        //An array of JSON is passed containingg all available articles in the database
        var articlePanels = [];
        //Passing each article JSON object to the createPanel function which returns a bootstrap
        //panel with the article of data inside
        for (var i = 0; i < articles.length; i ++) {
            articlePanels.push(createPanel(articles[i]));
        }
        //When all of the HTML for the articles is stored in the articles Panels array,
        //append then to the articlePanels container
        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        //This function takes in a single JSON object for an article/headline
        //it constructs a jQuery element containing all of the formatted HTML for the 
        //article panel
        var panel =
            $(["<div class='panel panel-default'>",
            "<div class='panel-heading'>",
            "<h3>",
            article.headline,
            "<a class='btn btn-success save'>",
            "Save Article",
            "</a>",
            "</h3>",
            "</div>",
            "<div class='panel-body'>",
            article.summary,
            "</div>", 
            "</div>"
        ].join(""));
    //Attach the article's id to the jQuery element
    //Use this when trying to figure out which article the user wants to save
         panel.data("_id", article._id);
    //Return the constructed panel jQuery element
        return panel;
    }

    function renderEmpty() {
        //This function renders HTML to the page explaining that there aren't any articles to view 
        
        var emptyAlert = 
        $(["<div class='alert alert-warning text-center'>",
            "<h4>There are no new articles.</h4>",
            "</div>", 
            "<div class='panel panel-default'>",
            "<div class='panel-heading text-centered'>",
            "<h3>What Would You Like To Do?</h3>",
            "</div>",
            "<div class='panel-body text-centered'>",
            "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
            "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
            "</div>",
            "</div>"
    ].join(""));
    //Appending data to the page
    articleContainer.append(emptyAlert);
 }

 function handleArticleSaved() {
     //This function is triggered when the user wants to save an article
     //Retrieving the javascript object containing the headline id

     var articleToSave = $(this).parents(".panel").data();
     articleToSave.saved = true;

     $.ajax({
         method: "PATCH",
         url: "/api/headlines",
         data: articleToSave
     })
     .then(function(data) {
         

        if(data.ok) {
            //Run the initPage function again.  This reloads the entire list of articles
            initPage();
        }
     });
 }

    function handleArticleScrape() {
        //This function handles the user clicking any "scrape new article" button
        $.get("/api/fetch")
            .then(function(data) {
                //If the New York Times is scraped successfully and the articles can be compared to this
                //already collected, rerender the articles on the page and let the user know how
                //many unique articles were saved.
                initPage();
                bootbox.alert("<h3 class='text-centered m-top-80'>" + data.message + "</h3>");                
            });
    }
});