function handleClick(){
  const element = document.getElementById("password");
  if(element.type==="password"){
    element.setAttribute('type', "text");
  }else{
    element.setAttribute('type', "password");
  }
}

document.getElementById("character-check").addEventListener("input", (event)=>{
  let count = event.target.value.length;
  document.getElementById('character-num').textContent = count + "/120";
});
