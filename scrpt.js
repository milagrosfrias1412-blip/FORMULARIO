(function(){
  var $=function(id){return document.getElementById(id)};
  var KEY="club-nana-cuentas", mem=[];
  function leer(){try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):[]}catch(e){return mem}}
  function guardar(l){mem=l;try{localStorage.setItem(KEY,JSON.stringify(l))}catch(e){}}

  function hex(buf){return Array.prototype.map.call(new Uint8Array(buf),function(b){return b.toString(16).padStart(2,"0")}).join("")}
  function hash(txt){
    if(!(window.crypto&&crypto.subtle))return Promise.resolve("");
    var salt=hex(crypto.getRandomValues(new Uint8Array(8)));
    return crypto.subtle.digest("SHA-256",new TextEncoder().encode(salt+txt)).then(function(b){return salt+":"+hex(b)});
  }

  var checks={
    len:function(p){return p.length>=8},
    num:function(p){return /\d/.test(p)},
    mix:function(p){return /[a-z]/.test(p)&&/[A-Z]/.test(p)}
  };
  function evaluar(){
    var p=$("pass").value, ok=0;
    Array.prototype.forEach.call($("reqs").children,function(li){
      var c=checks[li.dataset.r](p); li.classList.toggle("ok",c); if(c)ok++;
    });
    var extra=/[^A-Za-z0-9]/.test(p)&&p.length>=8?1:0, pts=p?ok+extra:0;
    var nombres=["sin evaluar","débil","regular","buena","fuerte"];
    $("bar").style.width=(pts/4*100)+"%";
    $("bar").style.background=pts<=1?"var(--err)":pts<=2?"var(--pink)":"var(--purple)";
    $("nivel").textContent="Seguridad: "+nombres[pts];
    return ok===3;
  }

  var reglas={
    email:function(){
      var v=$("email").value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return "Ingresá un correo válido, por ejemplo nombre@correo.com.";
      return leer().some(function(c){return c.email===v.toLowerCase()})?"Este correo ya está registrado.":"";
    },
    edad:function(){
      var v=$("edad").value.trim();
      if(v==="")return "Ingresá tu edad.";
      var n=Number(v);
      if(!Number.isInteger(n)||n<0||n>120)return "Ingresá una edad válida (número entero).";
      return n<18?"Necesitás tener 18 años o más para unirte.":"";
    },
    pass:function(){return evaluar()?"":"La contraseña no cumple los requisitos."}
  };
  function check(id){
    var e=reglas[id](); $("e-"+id).textContent=e;
    $(id).closest(".field").classList.toggle("invalid",!!e);
    $(id).setAttribute("aria-invalid",e?"true":"false");
    return !e;
  }
  ["email","edad","pass"].forEach(function(id){
    $(id).addEventListener("blur",function(){check(id)});
    $(id).addEventListener("input",function(){
      if(id==="pass")evaluar();
      if($(id).closest(".field").classList.contains("invalid"))check(id);
    });
  });

  $("show").addEventListener("click",function(){
    var v=$("pass").type==="password";
    $("pass").type=v?"text":"password";
    this.textContent=v?"Ocultar":"Mostrar"; this.setAttribute("aria-pressed",v);
  });

  $("form").addEventListener("submit",function(e){
    e.preventDefault();
    var primero=null;
    ["email","edad","pass"].forEach(function(id){if(!check(id)&&!primero)primero=id});
    if(primero){$(primero).focus();return}
    var email=$("email").value.trim().toLowerCase(), edad=Number($("edad").value);
    hash($("pass").value).then(function(h){
      var l=leer(); l.push({email:email,edad:edad,pass:h,fecha:new Date().toISOString()}); guardar(l);
      $("ok").textContent="Tu cuenta "+email+" quedó registrada. Sos la persona socia n.º "+l.length+".";
      $("form").hidden=true; $("done").hidden=false; $("done").scrollIntoView({block:"start"});
    });
  });

  $("otro").addEventListener("click",function(){
    $("form").reset(); evaluar(); $("pass").type="password"; $("show").textContent="Mostrar";
    Array.prototype.forEach.call(document.querySelectorAll(".invalid"),function(x){x.classList.remove("invalid")});
    Array.prototype.forEach.call(document.querySelectorAll(".error"),function(x){x.textContent=""});
    $("form").hidden=false; $("done").hidden=true; $("email").focus();
  });
})();
