function generateImage(prompt){

 const url =
 "https://image.pollinations.ai/prompt/"
 + encodeURIComponent(prompt)

 const img = document.createElement("img")
 img.src = url
 img.style.width = "350px"

 document.getElementById("chat").appendChild(img)
}
