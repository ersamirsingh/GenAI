import { GoogleGenAI, Type } from "@google/genai";
import readlineSync from 'readline-sync'
import os from 'os'
import child_process from 'child_process'
import 'dotenv/config'
import util from 'util'


const execute = util.promisify(child_process.exec);
const platform = os.platform();


const ai = new GoogleGenAI({});



// const ALLOWED_COMMANDS = ['mkdir', 'touch', 'echo', 'cat', 'dir', 'ls'];
const ALLOWED_COMMANDS = platform === 'win32'
  ? ['mkdir', 'type', 'echo', 'dir']
  : ['mkdir', 'touch', 'echo', 'cat', 'ls'];
const isCommandSafe = (command) => {

   if (typeof command !== "string") return false;
   command = command.trim();
   return ALLOWED_COMMANDS.some(cmd => command.startsWith(cmd));
};

const executeCommand = async ({command}) => {
   
   try {
      if (!isCommandSafe(command)) {
         return "Command not allowed for security reasons.";
      }

      const { stdout, stderr } = await execute(command);
      console.log('Standard Output',stdout)
      console.log('Standard Error',stderr)

      if (stderr)
         return `Error occured: ${stderr}`;

      return `Success: ${stdout}`;
   } catch (error) {
      return `Error occured: ${error.message}`;
   }
};



const executeCommandInfo = {
   name: "executeCommand",
   description: "It takes any shell/terminal command and execute it. It will help us to create, read, write, update, delete any folder and file",
   parameters: {
      type: Type.OBJECT,
      properties: {
         command: {
            type: Type.STRING,
            description: "It is the terminal/shell command. Ex: mkdir calculator , touch calculator/index.js etc"
         }
      },
      required: ['command']
   }
}


const History = [];

async function buildWebsite() {

   let steps = 0;
   const MAX_STEPS = 8;
   while (steps < MAX_STEPS) {
      steps++;

      const result = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: History,
         config: {
            systemInstruction: ` You are a website Builder, which will create the frontend part of the website using terminal/shell Command.
         You will give shell/terminal command one by one and our tool will execute it.

         Give the command according to the Operarting system we are using.
         My Current user Operating system is: ${platform}.

         Kindly use best practice for commands, it should handle multine write also efficiently.

         Your Job
         1: Analyse the user query
         2: Take the neccessary action after analysing the query by giving proper shell.command according to the user operating system.

         Step By Step By Guide

         1: First you have to create the folder for the website which we have to create, ex: mkdir calculator
         2: Give shell/terminal command to create html file , ex: touch calculator/index.html
         3: Give shell/terminal command to create CSS file 
         4: Give shell/terminal command to create Javascript file 
         5: Give shell/terminal command to write on html file 
         6: Give shell/terminal command to write on css file 
         7: Give shell/terminal command to write on javascript file
         8: fix the error if they are persent at any step by writing, update or deleting
         `,

            tools: [
               {
                  functionDeclarations: [executeCommandInfo]
               }
            ]
         },
      });


      if (result.functionCalls && result.functionCalls.length > 0) {

         const functionCall = result.functionCalls[0];

         const { name, args } = functionCall;
         console.log('Function name: ', name);
         console.log('Arguments name: ', args);

         const toolResponse = await executeCommand(args);


         const functionResponsePart = {
            name: functionCall.name,
            response: {
               result: toolResponse,
            },
         };

         // Send the function response back to the model.
         History.push({
            role: "model",
            parts: [
               {
                  functionCall: functionCall,
               },
            ],
         });

         History.push({
            role: "user",
            parts: [
               {
                  functionResponse: functionResponsePart,
               },
            ],

         })
      }
      else {
         console.log(result.text);
         History.push({
            role: "model",
            parts: [{ text: result.text }]
         })
         break;
      }

   }
}


while(true){

   const question = readlineSync.question('Explain what you want to build: ');
   if (question === 'exit' || question === 'quit') break;

   History.push({
      role: 'user',
      parts: [{ text: question }]
   });

   await buildWebsite();
}