import express from 'express'
import cors from "cors"
import dotenv from "dotenv"
export const app = express() 
// import { GoogleGenAI } from "@google/genai";
import { InferenceClient } from "@huggingface/inference";
app.use(cors(
    {
        origin: "*",
       
        
    }
))



dotenv.config({
    path:"./env"
})

app.use( express.json({

    limit:"50mb",
    extended :true    

}))

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.use(express.urlencoded({
    limit:"50mb",
    extended:true
}))

// console.log(process.env.apikey)

// const ai = new GoogleGenAI({ apiKey: process.env.apikey });
console.log(process.env.HF_TOKEN)
const client = new InferenceClient(process.env.HF_TOKEN);
 

app.post('/api', async (req, res) => {
  const { prompt } = req.body;
  console.log("prompt:", prompt);

  try {
    const output = await client.textClassification({
      model: "cardiffnlp/twitter-roberta-base-hate",
      inputs: prompt,
      provider: "hf-inference",
    });

    console.log(output);

    return res.status(200).json(output);

  } catch (error) {
    console.log("error during the fetch of api", error);
    return res.status(500).json({
      error: "error during the api request"
    });
  }
});


app.listen( process.env.PORT, () => {

  console.log(`sever is running on the port ${process.env.PORT}`)
})





























// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: "Explain how AI works in a few words",
//   });
//   console.log(response.text);
// }

// main();
// const apiFetch =  async ( req, res)=>{
//         try {

//           const response = await ai.models.generateContent({
//           model: "gemini-3-flash-preview",
//           contents: "Explain how AI works in a few words",
//           });

//           console.log(response)
            
//         } catch (error) {
//            console.log("error during the fetch of api" +  error)   
//         }

// } 


