var Collection = function( list ) {
    var _collection             = {};

    for (var i = 0; i < list.length; i++) {
        _collection[list[i]]    = list[i];
    }

    this.has = function(str) {
        return (str in _collection);
    };

    this.push = function(str) {
        _collection[str]        = str;
    };

    return this;
};

module.exports                  = Collection;