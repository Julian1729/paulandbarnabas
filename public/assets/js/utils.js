(function(g){

  var redirect = function(to){
    g.location.replace(to);
  }

  var Utils = {
    redirect: redirect
  };

  g.Utils = g.pb = Utils;

}(window));
