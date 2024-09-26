const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  
  // Acessa a chave de API da variável de ambiente
  const apiKey = 'AIzaSyBVJmQC1FCnqb4vknJ9GPHHa2ZCVgF3Hng'
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "sempre responda no final da frase atenciosamente \"jose\" ",
  });
  
  
  const chat = model.startChat();
  
  const prompt = 'Qual e o terceiro numero primo?';
  const prompt2 = "Qual e o proximo?";
  (async () => {
    try {
      const result = await chat.sendMessage(prompt);
      console.log(result.response.text());
      const result2 = await chat.sendMessage(prompt2);
      console.log(result2.response.text());
    } catch (error) {
      console.error("Error generating content:", error);
    }
  })();