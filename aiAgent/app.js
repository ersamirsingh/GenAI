import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';
import readlineSync from 'readline-sync';


const ai = new GoogleGenAI({});


async function get_weather_info({ city }) {
   const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
   const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}&aqi=no`);
   const data = await response.json();
   return data;
}

async function get_crypto_price({ coin }) {
   const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${coin}`);
   const data = await response.json();
   return data;
}

const cryptoInfo = {
   name: 'get_crypto_price',
   description:
      'We can give you the current price or other information related to cryptocurrency like bitcoin and ethereum etc',
   parameters: {
      type: Type.OBJECT,
      properties: {
         coin: {
            type: Type.STRING,
            description:
               'It will be the name of the cryptocurrency like bitcoin, ethereum, etc',
         },
      },
      required: ['coin'],
   },
};

const weatherInfo = {
   name: 'get_weather_info',
   description:
      'You can get the current weather information of any city like london, Bhopal, california etc',
   parameters: {
      type: Type.OBJECT,
      properties: {
         city: {
            type: Type.STRING,
            description:
               'Name of the city for which I have to fetch weather information like london, goa etc',
         },
      },
      required: ['city'],
   },
};

const History = [];
const tools = [{ functionDeclarations: [cryptoInfo, weatherInfo] }];

const toolFunctions = {
   "get_weather_info": get_weather_info,
   "get_crypto_price": get_crypto_price,
};

async function AI_Agent() {

   while (true) {
      const result = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: History,
         config: { tools },
      });

      if (result.functionCalls && result.functionCalls.length > 0) {

         const functionCall = result.functionCalls[0];
         const { name, args } = functionCall;
         if (!toolFunctions[name]) {
            throw new Error(`Unknown function call: ${name}`);
         }

         const response = await toolFunctions[name](args);

         const functionResponsePart = {
            name: functionCall.name,
            response: {
               result: response,
            },
         };
         History.push({
            role: 'model',
            parts: [{ functionCall: functionCall }],
         });

         History.push({
            role: 'user',
            parts: [{ functionResponse: functionResponsePart }],
         });
      } else {
         History.push({
            role: 'model',
            parts: [{ text: result.text }],
         });
         console.log(result.text);
         break;
      }
   }
}

while (true) {
   const question = readlineSync.question('Ask me anything: ');
   if (question === 'exit' || question === 'quit') break;

   History.push({
      role: 'user',
      parts: [{ text: question }]
   });

   await AI_Agent();
}

