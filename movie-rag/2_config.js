import dotenv from "dotenv";
import neo4j from "neo4j-driver";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenAI } from "@google/genai";

dotenv.config();


const driver = neo4j.driver(
   process.env.NEO4J_URI,
   neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);


const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);


const llm = new ChatGoogleGenerativeAI({
   model: "gemini-2.5-flash",
   apiKey: process.env.GEMINI_API_KEY,
   temperature: 0,
});



const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


async function embedText(text) {
   const response = await genai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
   });

   return response.embeddings[0].values;
}



async function embedTexts(texts) {
   const response = await genai.models.embedContent({
      model: "gemini-embedding-001",
      contents: texts,
   });
   return response.embeddings.map((e) => e.values);
}

async function closeConnections() {
   await driver.close();
   console.log("✅ All connections closed.");
}

export { driver, pinecone, pineconeIndex, llm, genai, embedText, embedTexts, closeConnections };