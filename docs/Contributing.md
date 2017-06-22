## Contributing

##### Overview

We aim to maintain this Designer-centric library with as little changes to the core functionality as possible, to ensure simple redesigns and a solid feature set. 

##### Implications

* Utilize as much of the chosen framework's functionality in the HTML as possible
* Add Javascript where you need access to Data Binding and other layers of complex functionality
* If the design needs to be altered in the Javascript, it is always best to change a variable that is bound to the DOM

##### Development Process

* Use `gulp jscs` to see all your Code Styling issues and repair them as necessary
* Use `gulp compress` to minify your files for production environments
* Encapsulate console logs with an `if (!Stratus.Environment.get('production'))` conditional, so they are hidden in production environments

##### Commit Process

To better maintain this project, we ask that you follow the following steps:

* Fork this repository
* Build your intended functionality in your fork
* Create a pull request describing your changes

We will then be able to review your changes and either accept them or ask that further changes are made.

##### Update Process

When you need to update your fork, please pull from the master branch and rebase to ensure there are not any merge commits, since they can cause the master branch to diverge and become quite the headache bringing them back to a workable standpoint without any data loss.

* Commit your changes locally (do not stash!)
* Execute `git pull upstream master` to get the latest commits
* Execute `git rebase` to rewind and fast forward commits
* Execute `git status` to ensure there are not any merge commits
* Execute `git push origin master` to reconvene your fork from where it diverged

##### Tracking Setup

Whichever method you used to originally clone your fork, you should re-use for the upstream, whether that be SSH or HTTPS.  If you don't remember, you can type `git remote -v` to see what it currently looks like.  On our system, the upstream's remote is an SSH location, which looks like so: `git@github.com:Sitetheory/stratus.git`

* Execute `git remote add upstream <url>` and replace url with the correct location as described before 
* Execute `git fetch --all` to hydrate all remotes accordingly
* Execute `git branch -u upstream/master` to track the project's history
* Check `git status` to see where your clone sits
