// === Password Protection ===
document.getElementById("password").addEventListener("keypress", function(e){
  if(e.key==="Enter") checkPassword();
});
function checkPassword(){
  const entered = document.getElementById("password").value;
  if(entered==="lal1234"){
    document.getElementById("passwordScreen").style.display="none";
    document.getElementById("mainContent").style.display="block";
    resetLogoutTimer();
  } else { alert("Incorrect password!"); }
}

// === Logout Function ===
function logout(){
  clearAll();
  document.getElementById("mainContent").style.display="none";
  document.getElementById("passwordScreen").style.display="block";
  document.getElementById("password").value = "";
  clearTimeout(autoLogoutTimer);
}

// === Clear All ===
function clearAll(){
  document.getElementById('inputText').value='';
  document.getElementById('outputText').value='';
  for(let i=1;i<=10;i++){
    document.getElementById('fileInput'+i).value='';
    document.getElementById('fileName'+i).textContent = "No file chosen";
    window['slotText'+i]='';
    window['slotOutput'+i]='';
    window['slotFileName'+i]='';
  }
}

// === Load file ===
function loadFile(slot,event){
  resetLogoutTimer();
  const file = event.target.files[0];
  const nameSpan = document.getElementById('fileName'+slot);
  if(!file){
    nameSpan.textContent = "No file chosen";
    return;
  }
  nameSpan.textContent = file.name;
  window['slotFileName'+slot]=file.name;
  const reader = new FileReader();
  reader.onload = function(e){
    window['slotText'+slot]=e.target.result;
    document.getElementById('inputText').value=window['slotText'+slot];
    document.getElementById('outputText').value='';
  };
  reader.readAsText(file);
}

// === Process slot ===
function processSlot(slot){
  resetLogoutTimer();
  if(!window['slotText'+slot]){
    alert('Please upload a file first for this slot!');
    return;
  }
  let lines = window['slotText'+slot].split("\n");
  let outputLines = [...lines];
  let raceIndexes = [];
  lines.forEach((line,i)=>{ if(line.startsWith("@Race:")) raceIndexes.push(i); });
  raceIndexes.push(lines.length);

  for(let r=0;r<raceIndexes.length-1;r++){
    let start = raceIndexes[r];
    let end = raceIndexes[r+1];
    let block = lines.slice(start,end);
    let betLineIndex = block.findIndex(l=>l.startsWith("@Bett:"));
    if(betLineIndex===-1) continue;
    let betLine = block[betLineIndex];
    let betHorses = betLine.replace(/@Bett:[^:]*:/,"").split(",").slice(0,2)
                     .map(h=>h.replace(/\d+\/\d+/g,"").trim().toUpperCase());

    for(let i=start;i<end;i++){
      if(lines[i].startsWith("@HossD:")){
        outputLines[i] = lines[i].replace(/\bK\s+/g,".K. ").replace(/\bH\s+/g,".H. ");
      }
    }
  }
  window['slotOutput'+slot] = outputLines.join("\n");
  document.getElementById('inputText').value=window['slotText'+slot];
  document.getElementById('outputText').value=window['slotOutput'+slot];
}

// === Download processed TXT ===
function downloadSlot(slot){
  resetLogoutTimer();
  if(!window['slotOutput'+slot]){
    alert('Please process this slot first!');
    return;
  }
  let blob = new Blob([window['slotOutput'+slot]],{type:'text/plain'});
  let link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  let originalName = window['slotFileName'+slot] || 'race_output';
  link.download=originalName.replace(/\.txt$/i,'_KH.txt');
  link.click();
}

// === Process All Files ===
function processAll(){
  for(let i=1;i<=10;i++){
    if(window['slotText'+i]) processSlot(i);
  }
  alert("All uploaded files processed!");
}

// === Download All Outputs ===
function downloadAll(){
  for(let i=1;i<=10;i++){
    if(window['slotOutput'+i]) downloadSlot(i);
  }
}

// === Print All Outputs ===
function printAllOutputs(){
  let combined = "";
  for(let i=1;i<=10;i++){
    if(window['slotOutput'+i]){
      combined += "=== File: " + (window['slotFileName'+i]||("Slot"+i)) + " ===\n";
      combined += window['slotOutput'+i] + "\n\n";
    }
  }
  if(combined===""){ alert("No outputs to print!"); return; }
  let printWindow = window.open('', '', 'width=900,height=700');
  printWindow.document.write('<pre style="font-family:monospace; font-size:14px;">'+combined+'</pre>');
  printWindow.document.close();
  printWindow.print();
}

// === Highlight K/H in output textarea ===
function highlightKH(){
  resetLogoutTimer();
  let output = document.getElementById('outputText');
  let lines = output.value.split("\n");
  let highlighted = lines.map(line=>{
    return line.replace(/(\.K\.|\.H\.)\s*([A-Z][A-Z\s']*\s*\([A-Z]*\))/g, function(match,p1,p2){
      return '%HIGHLIGHT_START%' + match + '%HIGHLIGHT_END%';
    });
  });
  let tempDiv = document.createElement('div');
  tempDiv.innerHTML = highlighted.join("<br>");
  tempDiv.innerHTML = tempDiv.innerHTML.replace(/%HIGHLIGHT_START%/g,'<span style="background-color:yellow;font-weight:bold">');
  tempDiv.innerHTML = tempDiv.innerHTML.replace(/%HIGHLIGHT_END%/g,'</span>');
  let newWindow = window.open('', '', 'width=800,height=600,scrollbars=yes');
  newWindow.document.write('<pre style="font-family:monospace; font-size:14px;">' + tempDiv.innerHTML + '</pre>');
  newWindow.document.title = "Highlighted K/H Races";
}

// === Smooth Background Slideshow ===
const bgImages = [
  'https://www.timeschronicle.ca/wp-content/uploads/2020/07/horse18_w.jpg',
  'https://www.racingqueensland.com.au/kenticoimage.axd/media/e7bcc609-04c1-43a0-8880-1c293fd24f07/c3195b24-d3fb-402b-af62-0ae49f05f28e.jpg?format=jpg&width=1370&height=514&quality=90&rmode=crop&d=094323&hmac=71380ead0ca57bbb740521bc2ade52dad61cd368cd20399f8a901826092373f5',
  'https://www.thecreek.com.au/wp-content/uploads/2023/12/finals.jpg',
  'https://tscom.imgix.net/RAINBOWROOM_KENTUCKIANA_0922_ba503f8364.false?auto=compress,format',
  'https://tiogadowns.com/wp-content/uploads/media/hero/Racing-HERO.jpg'
];

let current = 0;
const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');
bg1.style.backgroundImage = `url('${bgImages[0]}')`;

setInterval(() => {
  let next = (current + 1) % bgImages.length;
  bg2.style.backgroundImage = `url('${bgImages[next]}')`;
  bg2.style.opacity = 1;
  setTimeout(() => {
    bg1.style.backgroundImage = `url('${bgImages[next]}')`;
    bg2.style.opacity = 0;
    current = next;
  }, 2000);
}, 5000);


// Auto Logout After 12 Minutes
let autoLogoutTimer;
function resetLogoutTimer(){
  clearTimeout(autoLogoutTimer);
  autoLogoutTimer = setTimeout(()=>{ alert("Session expired due to inactivity!"); logout(); }, 12*60*1000);
}
['click','keypress','mousemove','scroll'].forEach(evt=>{document.addEventListener(evt, resetLogoutTimer);});



