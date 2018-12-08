
try{
  var test = require('./this/doesnt/exists');
}catch(e){
  if(e.code === "MODULE_NOT_FOUND"){
    console.log('yup');
  }
}
