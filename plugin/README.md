NodeBot plugins should be installed in this directory. Each plugin should be stored in its
own directory and named as it should be called. (e.g., the Finger plugin should be in the
plugin/Finger directory.)  Plugins have their own directory structure and can contain as
many files as the Plugin author needs; however, the plugin must be instantiated by a
singleton in a file by the same name of the Plugin.  (e.g. plugin/Finger/Finger.js)