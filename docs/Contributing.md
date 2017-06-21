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
* Build your intended functionality
* Create a pull request describing your changes

We will then be able to review your changes and either accept them or ask that further changes are made.

##### Update Process

When you need to update your fork, please pull from the master branch and rebase to ensure there are not any merge commits, since they can cause the master branch to diverge and become quite the headache bringing them back to a workable standpoint without any data loss.

* Commit your changes locally (do not stash!)
* Pull from upstream/master
* Rebase your clone to rewind and fast forward
* Ensure there are not any merge commits
* Push data to your fork
