// // // check-models.js
// // import { configDotenv } from 'dotenv';
// // configDotenv();

// // const res = await fetch(
// //   `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
// // );
// // const { models } = await res.json();

// // const embeddingModels = models.filter(m => 
// //   m.supportedGenerationMethods.includes('embedContent')
// // );

// // embeddingModels.forEach(m => console.log(m.name, '|', m.displayName));













// import { configDotenv } from 'dotenv';
// configDotenv();

// import path from 'path';
// import { fileURLToPath } from 'url';

// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
// import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
// import { Pinecone } from '@pinecone-database/pinecone';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// async function indexing() {
//    try {
//       const PDF_PATH = path.resolve(__dirname, 'Node.pdf');

//       const loader = new PDFLoader(PDF_PATH);
//       const rawDocs = await loader.load();

//       const textSplitter = new RecursiveCharacterTextSplitter({
//          chunkSize: 1000,
//          chunkOverlap: 200,
//       });
//       console.log('File splitted successfully!')

//       const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
//       console.log('File chunked successfully', chunkedDocs.length)

//       const { GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME } = process.env;
//       if (!GEMINI_API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
//          throw new Error("Missing required environment variables");
//       }

//       const embeddings = new GoogleGenerativeAIEmbeddings({
//          apiKey: GEMINI_API_KEY,
//          modelName: 'gemini-embedding-001',
//       });
//       console.log('Embedding created successfully!')

//       const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
//       const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

//       // ✅ Pass outputDimensionality in the method call, not constructor
//       const texts = chunkedDocs.map((doc) => doc.pageContent);
//       console.log(texts.length)
//       const vectors = await embeddings.embedDocuments(texts, {
//          outputDimensionality: 768,
//       });

//       console.log(`Embedding dim: ${vectors[0].length}`); // ✅ 768

//       // Upsert to Pinecone in batches of 100
//       const records = vectors.map((values, i) => ({
//          id: `doc-${i}`,
//          values,
//          metadata: {
//             text: chunkedDocs[i].pageContent,
//             ...chunkedDocs[i].metadata,
//          },
//       }));

//       const batchSize = 100;
//       for (let i = 0; i < records.length; i += batchSize) {
//          await pineconeIndex.upsert(records.slice(i, i + batchSize));
//          console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}`);
//       }

//       console.log("Indexing completed successfully!");
//       return null;
//    } catch (error) {
//       console.error("Indexing failed:", error.message);
//       process.exit(1);
//    }
// }

// indexing();










import { configDotenv } from 'dotenv';
configDotenv();

const { GEMINI_API_KEY } = process.env;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
);

const data = await response.json();

// Filter only embedding models
const embeddingModels = data.models.filter(m => 
  m.supportedGenerationMethods?.includes('embedContent')
);

console.log("Available embedding models:");
embeddingModels.forEach(m => console.log(" -", m.name));