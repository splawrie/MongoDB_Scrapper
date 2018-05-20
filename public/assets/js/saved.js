/* global bootbox */
$(document).ready(function() {
    //Getting a reference to the article container div that will be rendering all articles inside of
    var articleContainer = $(".article-container");
    //Adding event listeners for dynamically generated buttons for deleting articles,
    //pulling up article notes, saving article notes, and deleting article notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);

    //initPage loads the page
    initPage();

    function initPage() {
        //Empty the article container, run an AJAX request for any saved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true").then(function(data) {
            //If there are headlines render them to the page
            if (data && data.length) {
                renderArticles(data);
            } else {
                //Otherwise render a message explaining there are no articles
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        //This function handles appending HTML containing the article data to the page
        //An array of JSON is passed containg all available articles in the database
        var articlePanels = [];
        //We pass each article JSON object to the CreatePanel function which returns a bootstrap
        //panel with our article data inside
        for (var i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        

        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        //This function takes in a single JSON object for an article/headline
        //It constructs a jQuery element containing all of the formatted HTML for the
        //article panel
        var panel = 
            $(["<div class = 'panel panel-default'>",
            "<div class = 'panel-heading'>",
            "<h3>",
            article.headline,
            "<a class = 'btn btn-danger delete'>",
            "Delete From Saved",
            "</a>",
            "<a class = 'btn btn-info notes'> Article Notes </a>",
            " </h3>",
            "</div>",
            "<div class = 'panel-body'>",
            article.summary, 
            "</div>",
            "</div>",
        ].join(""));
        //Attach the articles id to the jQuery element
        //Use this when trying to figure out which article the user wants to remove or 
        //open for notes for
        panel.data("_id", article._id);
        return panel;
    }

    function renderEmpty() {
        //This function renders HTML to the page explaining there aren't any articles to view
        //using a joined array of HTML string data 
        var emptyAlert = 
            $(["div class = 'alert alert-warning text-center'>",
            "<h4> There are no saved articles</h4>",
            "</div>",
            "<div class = 'panel panel-default'>",
            "<div class = 'panel-heading text center'>",
            "<h3>Would you like to browse available articles?</h3>",
            "</div>",
            "<div class = 'panel-body text center'>",
            "<h4> <a href='/'>Browse Articles</a></h4>",
            "</div>",
            "</div>"
        ].join(""));
        //Appending data to the page
    articleContainer.append(emptyAlert);
    }

    function renderNotesList(data) {
        //This functionhandles rendering note list items to the notes modal
        //Setting up an array of notes to render after finished
        //Also setting up a currentNote variable to temporarily store each note

        var notesToRender=[];
        var currentNote;
        if(!data.notes.length) {
            //If there are not notes display a message 
            currentNote= [
                "<li class = 'list-group-item'>",
                "No notes for this article.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        } else {
            //If we do have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                //Construct an li element to contain the noteText and a delete button
                currentNote = $([
                    "<li class = 'list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class = 'btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                //Store the note id on the delete button for easy acces when trying to delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                //Adding the currentNote tothe notesToRender array
                notesToRender.push(currentNote);
            }
        }
        //Append the notesToRender to the note=container inside the note modal
        $(".note-container").append(notesToRender);
    }

    function handleArticleDelete() {
        //This function handles deleting articles/headlines
        //Grab the id of the article to delete from the panel element 
        var articleToDelete = $(this).parents(".panel").data();
        
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {

            if (data.ok) {
                initPage();
            }
        });
    }

    function handleArticleNotes() {
        //This function opens the notes modal and displays the notes 
        //Grab the id of the article to get notes from the panel element
        var currentArticle = $(this).parents(".panel").data();
        //Grab any notes with the headline/article id
        $.get("/api/notes/" + currentArticle._id).then(function(data) {
            //Construct initial HTML to add to the notes modal
            var modalText = [
                "<div class = 'container-fluid text-center'>",
                "<h4> Notes For Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class = 'list-group note-container'>",
                "</ul>",
                "<textarea placeholder = 'New Note' rows = '4' cols = '60'></textarea>",
                "<button class='btn btn-success save'>Save Note</button>",
                "</div>"
            ].join("");
            //Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id
                notes: data || []
            };
            //Adding information about the article and article notes to the save button

            $(".btn.save").data("article", noteData);
            //renderNotesList will populate the actual note HTML inside of the modal that was created/opened
            renderNotesList(noteData);
        });
    }

    function handleNoteSave() {
        //This function handles what happens when a user tries to save a new note for an article
        //Setting a variable to hold some formatted data about our note.
        //Grabbing the note typed into the input box
        var noteData;
        var newNote = $(".bootbox-body textarea").val().trim();
        //If there is data in the note input field, format it and
        //post it to the "/api/note" route and send the formatted notedata
        if (newNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function() {
                //When complete, close the modal
               bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        //This function handles the deletion of notes/
        //Get the ide of the note to delete, store this data on the
        //delete button that was created
        var noteToDelete = $(this).data("_id");
        //
        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function() {
            //hide the modal
            bootbox.hideAll();
        });
    }

});