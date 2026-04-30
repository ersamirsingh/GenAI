import { configDotenv } from 'dotenv';
configDotenv();

import path from 'path';
import { fileURLToPath } from 'url';

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function indexing() {

   try {

      // const PDF_PATH = path.resolve(__dirname, 'Node.pdf');
      const PDF_PATH = './docs/Node.pdf';
      // console.log(PDF_PATH);

      const loader = new PDFLoader(PDF_PATH);
      const rawDocs = await loader.load();
      console.log(`PDF loaded: ${rawDocs.length} page(s)`);

      const textSplitter = new RecursiveCharacterTextSplitter({
         chunkSize: 1000,
         chunkOverlap: 200,
      });

      const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
      console.log(`File chunked successfully: ${chunkedDocs.length} chunks`);

      const { GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME } = process.env;
      if (!GEMINI_API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
         throw new Error("Missing required environment variables");
      }

      const embeddings = new GoogleGenerativeAIEmbeddings({
         apiKey: GEMINI_API_KEY,
         modelName: 'gemini-embedding-001',
         // configuration: { outputDimensionality: 768 },
      });
      console.log('Embedding created successfully!');

      const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
      const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);


      // Docs--> ChunkedDocs-->Embedding --> Vector DB
      // Docs--> ChunkedDocs-->Embedding --> Vector DB
      await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
         pineconeIndex,
         maxConcurrency: 5,
      });

      console.log("Indexing completed successfully!");

   } catch (error) {
      console.error("Indexing failed:", error.message);
      process.exit(1);
   }
}


indexing();