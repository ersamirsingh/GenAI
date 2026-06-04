// =====================================================================
// 13_runQuery.js — INTERACTIVE QUERY CLI
// =====================================================================
//
// THE UNIVERSAL FLOW (same for every query):
//
//   User Query
//       │
//       ▼
//   ENTITY RESOLUTION (9_entityResolver.js)
//   Extract entity names → search ALL node types in Neo4j
//   "DiCaprio" → Actor "Leonardo DiCaprio"
//   "Action" → Genre "Action"
//       │
//       ▼
//   CLASSIFICATION (10_queryClassifier.js)
//   With resolved entities, decide: graph or similarity?
//   LLM now KNOWS what each entity is — no guessing
//       │
//       ├──────────────────────┐
//       ▼                      ▼
//   GRAPH HANDLER          SIMILARITY HANDLER
//   (11_graphHandler.js)   (12_similarityHandler.js)
//   Neo4j only             Pinecone → Neo4j → LLM
//       │                      │
//       ▼                      ▼
//     Answer                 Answer
//
// =====================================================================

import readline from "readline";
import { resolveQueryEntities } from "./9_entityResolver.js";
import { classifyQuery } from "./10_queryClassifier.js";
import { handleGraphQuery } from "./11_graphHandler.js";
import { handleSimilarityQuery } from "./12_similarityHandler.js";
import { closeConnections } from "./2_config.js";

async function processQuery(query) {
   console.log("\n═══════════════════════════════════════════");

   
   console.log("\n🔍 ENTITY RESOLUTION");
   const resolved = await resolveQueryEntities(query);


   console.log("\n🧠 CLASSIFICATION");
   const classification = await classifyQuery(query, resolved);
   console.log(`   Type: ${classification.type} | Reason: ${classification.reasoning}`);

   let answer;

   if (classification.type === "similarity") {
      console.log("\n → SIMILARITY handler (Pinecone + Neo4j)...");
      answer = await handleSimilarityQuery(query, resolved);
   } else {
      console.log("\n → GRAPH handler (Neo4j)...");
      answer = await handleGraphQuery(query, resolved);
   }

   console.log("\n═══════════════════════════════════════════");
   console.log("Answer:\n");
   console.log(answer);
   console.log("\n═══════════════════════════════════════════");
}

async function startCLI() {
   console.log("===========================================");
   console.log("   🎬 GraphRAG Movie Query System");
   console.log("===========================================");
   console.log('Type your question. Type "exit" to quit.\n');

   const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
   });

   const ask = () => {
      rl.question("🎬 You: ", async (input) => {
         const query = input.trim();

         if (query.toLowerCase() === "exit") {
            console.log("\n👋 Goodbye!");
            rl.close();
            await closeConnections();
            process.exit(0);
         }

         if (!query){ 
            console.log("\n❌ Please enter a query."); 
            ask(); 
            return; 
         }

         console.log(query);

         try{
            await processQuery(query);
         } catch (err) {
            console.error("\n❌ Error:", err.message);
         }

         ask();
      });
   };

   ask();
}

startCLI();