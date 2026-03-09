let SMART = {}

async function loadBrain(){
 const data = await fetch("smart.json").then(r=>r.json())
 SMART = data
}

loadBrain()

function detectIntent(msg){

 msg = msg.toLowerCase()

 if(msg.includes("draw") || msg.includes("image") || msg.includes("picture"))
  return "image"

 if(msg.includes("build") || msg.includes("create app"))
  return "generator"

 if(msg.includes("error") || msg.includes("bug"))
  return "debug"

 return "knowledge"
}

function searchKnowledge(msg){

 for(const cat in SMART.knowledge){
  for(const key in SMART.knowledge[cat]){
   if(msg.includes(key)){
    return SMART.knowledge[cat][key]
   }
  }
 }

 return null
}

function debugHelp(msg){

 for(const key in SMART.debug){
  if(msg.includes(key)){
   return SMART.debug[key]
  }
 }

 return null
}

function generateProject(msg){

 for(const key in SMART.generators){
  if(msg.includes(key)){
   return SMART.generators[key].files
  }
 }

 return null
}

function generateImage(prompt){

 const img = document.createElement("img")

 img.src =
 "https://image.pollinations.ai/prompt/"
 + encodeURIComponent(prompt)

 img.style.width = "350px"

 document.getElementById("chat").appendChild(img)
}

function processMessage(msg){

 const intent = detectIntent(msg)

 if(intent==="image"){
  generateImage(msg)
  return
 }

 if(intent==="generator"){
  const files = generateProject(msg)
  if(files){
   return files
  }
 }

 if(intent==="debug"){
  const help = debugHelp(msg)
  if(help) return help
 }

 const answer = searchKnowledge(msg)
 if(answer) return answer

 return "I do not know that yet."
}
