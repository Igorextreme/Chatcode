document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.login__form');
  const chatForm = document.querySelector('.chat__form');
  const messagesContainer = document.querySelector('.chat__messages');
  const codePopup = document.getElementById('code-popup');
  const codeButton = document.querySelector('.chat__code-button');
  const codeCloseButton = document.querySelector('.code-popup__close-button');
  const codeExecuteButton = document.querySelector('.code-popup__button');
  const codeConsole = document.getElementById('code-popup-console');
  let userId = null;
  let userName = null;
  let userColor = null;

  // Configuração do Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyA6PWkidk688t7Jt1cRec2pwDrqByI448k",
    authDomain: "chatcode-3ff70.firebaseapp.com",
    databaseURL: "https://chatcode-3ff70-default-rtdb.firebaseio.com",
    projectId: "chatcode-3ff70",
    storageBucket: "chatcode-3ff70.appspot.com",
    messagingSenderId: "1017866956028",
    appId: "1:1017866956028:web:cd08d04c83ad7aa9337b79",
    measurementId: "G-FNP2G66YZS"
  };
  
 // Inicializa o Firebase
 firebase.initializeApp(firebaseConfig);
 const db = firebase.database();

 // Respostas predefinidas do bot
 const responses = {
   "/bot": "Olá sou o Robozão dos Cria de ADS, posso ajudar com alguns dos comandos abaixo:<br>" +
       "<br>- /bot o que é algoritmo?<br>" +
       "- /bot o que é javascript?<br>" +
       "- /bot qual a diferença entre java e javascript?<br>" +
       "- /bot o que é html?<br>" +
       "- /bot qual a diferença entre css e html?",
   "/bot o que é algoritmo?": "É uma sequência finita de ações executáveis que visam obter uma solução para um determinado tipo de problema.",
   "/bot o que é javascript?": "JavaScript é uma linguagem de programação amplamente utilizada para criar páginas web interativas.",
   "/bot qual a diferença entre java e javascript?": "Java e JavaScript são linguagens de programação diferentes. Java é uma linguagem de programação de propósito geral, enquanto JavaScript é principalmente usada para desenvolvimento web.",
   "/bot o que é html?": "HTML (HyperText Markup Language) é a linguagem padrão para criação de páginas web. Ele define a estrutura básica e o conteúdo de uma página web.",
   "/bot qual a diferença entre css e html?": "HTML é usado para definir a estrutura e o conteúdo de uma página web, enquanto CSS (Cascading Style Sheets) é usado para estilizar a página e controlar o layout."
 };

 // Login form submission
 loginForm.addEventListener('submit', function (e) {
   e.preventDefault();
   userName = document.querySelector('.login__input').value;
   userId = `user_${Date.now()}`;
   userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
   document.querySelector('.login').style.display = 'none';
   document.querySelector('.chat').style.display = 'block';
   loadMessages();
 });

 // Chat form submission
 chatForm.addEventListener('submit', function (e) {
   e.preventDefault();
   const messageInput = document.querySelector('.chat__input');
   const messageText = messageInput.value;
   if (messageText.trim() !== '') {
     sendMessage(messageText, false);
     messageInput.value = '';
     checkBotResponse(messageText); // Chama a função checkBotResponse após enviar a mensagem
   }
 });

 // Load messages from the server in real-time
 function loadMessages() {
   db.ref("messages").on('value', (snapshot) => {
     messagesContainer.innerHTML = '';
     if (snapshot.exists()) {
       snapshot.forEach((childSnapshot) => {
         const message = childSnapshot.val();
         displayMessage(message);
       });
     }
   });
 }

 // Send a message to the server
 function sendMessage(content, isImage) {
   const message = {
     userId,
     userName,
     userColor,
     content,
     isImage,
     timestamp: Date.now()
   };

   db.ref("messages").push(message)
     .catch(error => console.error('Error sending message:', error));
 }

 // Display a message in the chat
 function displayMessage(message) {
   const messageElement = document.createElement('div');
   messageElement.style.color = message.userColor;
   messageElement.className = message.userId === userId ? 'message-self' : 'message-other';
   messageElement.innerHTML = `<strong>${message.userName}:</strong> ${message.content}`;
   messagesContainer.appendChild(messageElement);
   messagesContainer.scrollTop = messagesContainer.scrollHeight;
 }

 // Check for bot command and respond
 function checkBotResponse(userMessage) {
   const botResponse = responses[userMessage];
   if (botResponse) {
     const botMessage = {
       userId: 'bot',
       userName: 'Robozão dos Cria de ADS',
       userColor: '#FF5733',
       content: botResponse,
       isImage: false,
       timestamp: Date.now()
     };
     db.ref("messages").push(botMessage)
       .catch(error => console.error('Error sending bot message:', error));
   }
 }


codeButton.addEventListener("click", () => {
  codePopup.style.display = "block";
  codeConsole.textContent = "";
});


// Selecione o textarea, o botão e o console
const codeTextarea = document.querySelector(".code-popup__textarea");

const languageSelector = document.querySelector(".code-popup__language-selector");
const codeButtonExecutar = document.querySelector(".code-popup__button");

// Adicione um event listener para o clique no botão Executar
codeButtonExecutar.addEventListener("click", () => {
  try {
      codeConsole.innerHTML = "";

      const code = codeTextarea.value;
      const selectedLanguage = languageSelector.value;

      if (selectedLanguage === "javascript") {
          eval(code);
      } else if (selectedLanguage === "typescript") {
          const compiledCode = ts.transpile(code);
          eval(compiledCode);
      } else {
          throw new Error("Linguagem de programação não suportada.");
      }
  } catch (error) {
      console.error(error);
      codeConsole.innerHTML += "<span style='color: red;'>" + error.toString() + "</span><br>";
  }
});

// Selecione o botão de fechar
const closeBtn = document.querySelector(".code-popup__close-button");

closeBtn.addEventListener("click", () => {
  codePopup.style.display = "none";
});

// Substitua a função console.log para exibir logs no elemento codeConsole
const originalConsoleLog = console.log;
console.log = function() {
  originalConsoleLog.apply(console, arguments);
  const message = Array.from(arguments).join(",");
  codeConsole.textContent += message + "\n";
};


function clearAllMessages() {
  fetch('https://chatcode-back.onrender.com/api/clearall', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to clear messages');
      }
      return response.json();
  })
  .then(data => {
      console.log(data.message); // Mensagem de sucesso da limpeza de mensagens
  })
  .catch(error => {
      console.error('Error clearing messages:', error); // Tratamento de erro
  });
}




});
