import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:"AIzaSyB4sYHd8C4zkFBeHP2mXg-VRNhnD1CvJeE"});

async function main() {
   const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Explain about Array in few words",
   });

   const newResponse = await ai.models.generateContent({})
   console.log(response.text);
}

await main();