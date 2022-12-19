function handleClickUp(){
  const element = document.getElementById("passwordSignup");
  if(element.type==="password"){
    element.setAttribute('type', "text");
  }else{
    element.setAttribute('type', "password");
  }
}

function handleClickIn(){
  const element = document.getElementById("passwordSignin");
  if(element.type==="password"){
    element.setAttribute('type', "text");
  }else{
    element.setAttribute('type', "password");
  }
}

document.getElementById("character-check").addEventListener("input", (event)=>{
  let count = event.target.value.length;
  document.getElementById('character-num').textContent = count + "/150";
});

function handleFocus(){
  document.getElementById("is-pass-valid").classList.add("disappear");
}
