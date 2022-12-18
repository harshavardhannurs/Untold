function handleClick(){
  const element = document.getElementById("password");
  if(element.type==="password"){
    element.setAttribute('type', "text");
  }else{
    element.setAttribute('type', "password");
  }
}

document.getElementById("character-check").addEventListener("keydown", (e)=>{
  let value = e.target.value.length+1;
  if(e.key==='Backspace'){
    if(value>1){
      value-=2;
    }else{
      value=0;
    }
  }
  document.getElementById("character-num").textContent = value += "/120";
});


document.getElementById("character-check").addEventListener("change", (e)=>{
  let value = e.target.value.length;
  document.getElementById("character-num").textContent = value += "/120";
});
