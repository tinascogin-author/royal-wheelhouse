// Browser installation stays separate from party state and backup data.
(() => {
  const button=document.getElementById('installApp');
  const dialog=document.getElementById('installDialog');
  const nativeButton=document.getElementById('nativeInstall');
  const status=document.getElementById('installStatus');
  const offline=document.getElementById('installOfflineStatus');
  let installPrompt=null;
  let installed=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  function render(){
    button.textContent=installed?'✓ App installed':'↓ Install app';
    nativeButton.hidden=installed||!installPrompt;
    if(installed)status.textContent='The Wheelhouse is installed. Open it from your computer’s app launcher or Start menu.';
    else if(installPrompt)status.textContent='Ready to install on this computer. Choose Install on this computer below.';
    else status.textContent='If no install prompt appears, use the Chrome or Edge menu below. Open this page in a regular browser rather than inside a chat app.';
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;render();});
  window.addEventListener('appinstalled',()=>{installed=true;installPrompt=null;render();});
  button.onclick=()=>{render();dialog.showModal();};
  document.getElementById('closeInstall').onclick=()=>dialog.close();
  nativeButton.onclick=async()=>{
    if(!installPrompt)return;
    const prompt=installPrompt;installPrompt=null;nativeButton.disabled=true;
    try{
      await prompt.prompt();const choice=await prompt.userChoice;
      render();
      if(!installed)status.textContent=choice.outcome==='accepted'?'Installation requested. Finish any browser prompts, then launch The Royal Wheelhouse from your computer.':'Installation dismissed. You can still play here and install later from the browser menu.';
    }catch{render();status.textContent='The browser could not show its install prompt. Use the menu instructions below.';}
    finally{nativeButton.disabled=false;}
  };
  if('serviceWorker' in navigator){
    navigator.serviceWorker.ready.then(()=>{offline.textContent='✦ Offline ready — the game, artwork, and sounds are saved on this device.';}).catch(()=>{offline.textContent='Offline setup is not ready. Keep this page online until the footer says Offline ready.';});
  }else offline.textContent='This browser cannot prepare offline play. Open the site in Chrome or Edge.';
  render();
})();
