function handleClick(){
  const element = document.getElementById("password");
  if(element.type==="password"){
    element.setAttribute('type', "text");
  }else{
    element.setAttribute('type', "password");
  }
}
