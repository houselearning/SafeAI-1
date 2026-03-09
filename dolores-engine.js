let KNOWLEDGE={}
let FUNCTIONS={}
let PROJECTS={}

async function loadBrain(){

 KNOWLEDGE=await fetch("smart.json").then(r=>r.json())
 FUNCTIONS=await fetch("functions.json").then(r=>r.json())
 PROJECTS=await fetch("templates.json").then(r=>r.json())

}

loadBrain()

function detectIntent(msg){

 msg=msg.toLowerCase()

 if(msg.includes("draw") || msg.includes("image"))
  return "image"

 if(msg.includes("build") || msg.includes("create app"))
  return "project"

 if(msg.includes("error") || msg.includes("bug"))
  return "debug"

 if(msg.includes("function") || msg.includes("code"))
  return "code"

 return "knowledge"
}
