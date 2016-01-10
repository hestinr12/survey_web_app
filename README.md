# Survey App
A web application using Node/Express/Sequelize/MySQL/Jade/Bootstrap/etc for serving a simple survey app!

This app allows guests to see unique survey questions each time they visit the site *and* provides an admin area for viewing results or adding new questions.

For the sake of testing, here's the basic run down of how everything is working/configured:
  * The app uses server-side sessions to keep track of what survey questions have been seen. This is kept in the default `MemoryStore` provided by [express-session](https://www.npmjs.com/package/express-session). It is not intended for a production environment. Feel free to ask more about this.
  * The sessions are *browser*-based, again, for the sake of testing. The session will terminate when the browser is closed. It may be simpler to test by popping open new Private Windows in any major broswer (each will generate its own session).
  * The front-end is built around the assumption that Javascript is enabled. Behavior of it being disable is currently...undefined O.o

---

###I want to try it!

You'll need MySQL (available using [Homebrew](http://brew.sh) via `brew install mysql`) and [Node.js](https://nodejs.org/en/download/).

1. `git clone https://github.com/hestinr12/survey_web_app.git`

2. `cd survey_web_app`

3. `npm install`

4. `mysql -uroot < utilities/mysql_setup.sql`
  > This will setup a test database called `sumo_dev` and create a new MySQL user for interacting with it. The app provides a default URI in the `config.js` file that is based on the credentials created using this script. You will need to edit the URI in the config if you choose not to do this step.

5. `node app`

6. `http://localhost:8000` + route

---

###Sure, but how do I *use* it?!


Default port: `8000`

####Public Routes

These are all defined/implemented in `app.js`. I'd like to make this cleaner and break routes out to their own files. Refactoring shall come another day.

#####GET '/' - Main page
  * See a survey. Reload? See a new survey. Answer a question? See a new survey. Seen all the surveys? See a message that you've seen all the surveys.

#####POST '/result' - Form submit target
  * When you answer a survey by clicking one of the buttons with an answer in it, it's handled here.

#####GET '/admin' - Admin Login
  * Login here for access to the admin panel.
  
  > Uses rudimentary authentication, the default is `{ user: admin, pass: taco }` as defined in `config.js`.
  
#####POST '/login' - Login submit target
  * Authenticates and sets current session as admin on success, else redirect with error notification.
  
#####GET '/logout' - Logout
  * That's it...it just logs you out :|
  
####Protected Routes

#####GET '/admin/survey_list' - View all surveys and results
  * See all the survey questions and sorted results for each associated answer
  
#####GET '/admin/new_survey' - Craft a new survey question
  * Featuring fancy front-end Javascript for dynamically sized multiple choice questions <3
  
#####POST '/admin/new_survey' - New survey question submit target
  * Handles the back-end creation of the new survey question and redirects once the persistent storage layer transaction is complete
  
  
---

###This is a pile of crap!

This is not meant to be a finished product, but an early iteration designed and developed around an open-ended set of requirements. It is not fully featured. It is not bullet-proof code. Regardless of all that, it's still pretty fun to see how your girlfriend answers goofy test questions you put up on it >:)

Feedback welcomed.
