(function(){

    var global_output = "undefined";

    var month_names = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    // arrays of data
    var array_of_apps = [
        "App 1",
        "App 2",
        "App 3",
        "App 4",
        "App 5"
    ];
    var array_of_videos = [
        "Khan Academy - Mathematics",
        "Brightstorm - English Grammar",
        "Crash Course - World History",
        "Various - Natural Science",
    ];
    var array_of_books = [
        "CK-12 Middle School Math - Grade 7",
        "Algebra Explorations, Pre-K through Grade 7",
        "Ck-12 Middle School Math - Grade 8",
        "CK-12 Life Science for Middle School",
        "CK-12 Earth Science for Middle School",
        "CK-12 Physical Science for Middle School",
        "Basic Speller Student Materials",
        "English 1- Ms. Stout",
        "8th Grade Science ",
        "Foundations of Science Core Concepts",
        "CK-12 Understanding Biodiversity",
        "Andersen's Fairy Tales",
        "The Complete Works of William Shakespeare"
    ];

    // builds out the data set
    var generator = (function(){

        var _this = this;

        // outputs an object of objects
        var output = {};

        //
        this.round_to_day = function( raw )
        {
            // check if we have been given a date object or a timestamp
            var date = ( typeof raw === 'number' ) ? new Date ( raw ) : raw;

            // round everything 
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            return date.getTime();
        };
       
        // random length of time
        this.rand_duration = function( multiplier )
        {
            if( !multiplier ){ var multiplier = 1 };
            return Math.round( Math.random() * 84 * multiplier + (10 * multiplier));
        }

        // random resource from an array of resources
        this.rand_resource = function( array )
        {
            var pointer = Math.round( Math.random() * (array.length - 1) );
            return array[ pointer ];
        }

        // create a single entry
        this.create_date = function( raw_date )
        {
            var date_bucket = _this.round_to_day( raw_date );
            var entry = {};

            // weighting multipliers
            var multiplier = 1;             // general multiplier
            var study_multiplier = 1;       // multiplier for serious apps
            var relax_multiplier = 1;       // multiplier for entertainment apps

            // determine weighting
            var day = raw_date.getDay();

            // if saturday or sunday, more weight to entertainment and vice versa
            if( day == 0 || day == 6 ){
                study_multiplier *= Math.random() * 10 / 10; 
            } else {
                relax_multiplier *= Math.random() * 10 / 10; 
            } 

            // formatted date for chart display
            entry.date = month_names[ raw_date.getMonth() ] + " " + raw_date.getDate();

            // --------------------------
            // categories
            
            entry.category = {
                "books"         : _this.rand_duration( study_multiplier ),
                "videos"        : _this.rand_duration( study_multiplier ),
                "tools"         : _this.rand_duration( study_multiplier ),
                "entertainment" : _this.rand_duration( relax_multiplier ),
                "other"         : _this.rand_duration(  )
            }

            // --------------------------
            // books

            entry.books = {};

            // populate each entry with each book
            for( var i = 0 ; i < array_of_books.length ; i++ )
            {
                var title = array_of_books[i];
                entry.books[ title ] = 0;
            }

            var books_available_time = entry.category.books; // total time spent reading books
            var books_total_time = 0; // time accumulated by books so far

            // generate top 5 book titles
            for( var i = 0 ; i < 5 ; i++ )
            {
                // generate a random duration
                var duration = Math.round( Math.random() * ( books_available_time - books_total_time ) / 2);
                if( duration < 0 ){ duration = 0 };

                // check if the book already has a duration ; if it does, try again
                var inserted = false;
                while( inserted === false )
                {
                    // select a random book from the array of books
                    var random = _this.rand_resource( array_of_books );

                    if( entry.books[ random ] === 0 ){
                        // if the entry does not already exist, insert it and break the loop
                        entry.books[ random ] = duration;
                        inserted = true;
                    }
                }

                // add duration to other books, so that the available pool of time is decreased 
                books_total_time += duration;
            }

            // aggregate all the "other" books not in the top 5
            entry.books["Other"] = books_available_time - books_total_time;

            // Highcharts workaround - 
            // The plugin requires a data point for each metric measured in a stacked bar chart
            // We need to insert a 0 for each possible value; otherwise days get crammed to the first days

            // --------------------------
            // videos
            
            entry.videos = {};

            var videos_available_time = entry.category.videos; // total time spent reading videos
            var videos_total_time = 0; // time accumulated by videos so far

            // generate top 5  video titles
            for( var i = 0 ; i < 4 ; i++ )
            {
                // generate a random duration
                var duration = Math.round( Math.random() * ( videos_available_time - videos_total_time ) / 2);
                if( duration < 0 ){ duration = 0 };

                // check if the video already has an entry in the object ; if exists, try again
                var inserted = false;
                while( inserted == false )
                {
                    var random = _this.rand_resource( array_of_videos );
                    if( !entry.videos[ random ] ){
                        // if the entry does not already exist, insert it and break the loop
                        entry.videos[ random ] = duration;
                        inserted = true;
                    }
                }

                // add duration to other videos, so that the available pool of time is decreased 
                videos_total_time += duration;
            }

            // aggregate all the "other" videos not in the top 5
            entry.videos["Other"] = videos_available_time - videos_total_time;
            

            // --------------------------
            // boy || girl ratio ( for that filtering )
            entry.boy_ratio = (Math.random() * 4 + 3) / 10; // random % between 30 and 70
            entry.girl_ratio = 1 - entry.boy_ratio;        
            
            // insert the entry
            output[date_bucket] = entry;
        }


        // loop through multiple dates
        this.generate_set = function( start_date , end_date )
        {
            var iterator = start_date;

            while( iterator <= end_date )
            {
                // console.log("looping");
                // generate single entry from function
                _this.create_date( iterator );

                // increment the start date to progress through the loop 
                iterator.setDate( iterator.getDate() + 1 );
            }
        }

        // -----------------------------------
        // test it out with one date
        // this.create_date( new Date() );

        // create a set of dates
        var start_date = new Date( 2014 , 1 , 1 );
        var stop_date = new Date( 2015 , 3 , 1 );
        this.generate_set( start_date , stop_date );

        // spit the object of objects
        console.log( output );
        global_output = output;
        return output;

    })();


    // creates and downloads the JSON file
    
    // sauce
    // http://stackoverflow.com/a/21016088

    var textFile = null,
    makeTextFile = function (text) {
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        return textFile;
    };

    var create = document.getElementById('create');

    create.addEventListener('click', function () {
        var link = document.getElementById('downloadlink');
        link.href = makeTextFile( JSON.stringify(global_output) );
        link.style.display = 'block';
    }, false);

})();

