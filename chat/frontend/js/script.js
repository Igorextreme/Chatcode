document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login__form');
    const chatForm = document.querySelector('.chat__form');
    const messagesContainer = document.querySelector('.chat__messages');
    const codePopup = document.getElementById('code-popup');
    const codeButton = document.querySelector('.chat__code-button');
    const codeCloseButton = document.querySelector('.code-popup__close-button');
    const codeExecuteButton = document.querySelector('.code-popup__button');
    const codeConsole = document.getElementById('code-popup-console');
    const imageButton = document.querySelector('.chat__image-button');
    const imageInput = document.querySelector('#imageInput');
    let userId = null;
    let userName = null;
    let userColor = null;

    // Lista de cores para os nomes dos usuários
    const colors = [
        "cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"
    ];

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
    const storage = firebase.storage();

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

    // Verifica se o link é do Firebase Storage
    function isFirebaseStorageURL(url) {
        return url.startsWith('https://firebasestorage.googleapis.com/');
    }

    // Função para verificar se o conteúdo é uma URL de imagem
    function isImageURL(url) {
        return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    // Função para obter o timestamp do servidor
    async function getServerTimestamp() {
        try {
            const response = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
            const data = await response.json();
            return new Date(data.datetime).getTime(); // Convertendo para milissegundos
        } catch (error) {
            console.error('Erro ao obter timestamp do servidor:', error);
            return Date.now(); // Fallback para timestamp local em caso de erro
        }
    }

    // Login form submission
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        userName = document.querySelector('.login__input').value;
        userId = `user_${Date.now()}`;
        userColor = colors[Math.floor(Math.random() * colors.length)];
        document.querySelector('.login').style.display = 'none';
        document.querySelector('.chat').style.display = 'flex';
        loadMessages();
    });

    // Chat form submission
    chatForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const messageInput = document.querySelector('.chat__input');
        const messageText = messageInput.value;
        if (messageText.trim() !== '') {
            const isImage = isImageURL(messageText);
            const timestamp = await getServerTimestamp();
            if (messageText.trim() === '/clearall') {
                clearAllMessages();
            } else {
                sendMessage(messageText, isImage, timestamp);
                checkBotResponse(messageText); // Chama a função checkBotResponse após enviar a mensagem
            }
            messageInput.value = '';
        }
    });

    // Load messages from the server in real-time
    function loadMessages() {
        db.ref("messages").orderByChild('timestamp').on('value', (snapshot) => {
            messagesContainer.innerHTML = '';
            if (snapshot.exists()) {
                const messages = [];
                snapshot.forEach((childSnapshot) => {
                    const message = childSnapshot.val();
                    messages.push(message);
                });
                messages.sort((a, b) => a.timestamp - b.timestamp);
                messages.forEach((message) => {
                    displayMessage(message);
                });
                scrollToLastMessage(); // Chame a função após carregar as mensagens
            }
        });
    }

    // Função para rolar para a última mensagem
    function scrollToLastMessage() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Função para esconder todas as mensagens anteriores a '/clearall'
    function clearAllMessages() {
        messagesContainer.innerHTML = ''; // Esconde todas as mensagens no frontend
        sendMessage('/clearall', false, Date.now()); // Envia a mensagem '/clearall' 
    }

    // Send a message to the server
    async function sendMessage(content, isImage, timestamp) {
        const message = {
            userId,
            userName,
            userColor,
            content,
            isImage,
            timestamp
        };

        db.ref("messages").push(message)
            .then(() => {
                scrollToLastMessage(); // Chame a função após a mensagem ser enviada
            })
            .catch(error => console.error('Error sending message:', error));
    }

    // Display a message in the chat
    function displayMessage(message) {
        if (message.content === '/clearall' && message.userId === userId) {
            // Oculta todas as mensagens anteriores a '/clearall' para o usuário atual
            messagesContainer.innerHTML = '';
        }

        const messageElement = document.createElement('div');
        messageElement.className = message.userId === userId ? 'message-self' : 'message-other';

        const userNameElement = document.createElement('div');
        userNameElement.style.color = message.userColor;
        userNameElement.textContent = message.userName;
        userNameElement.className = 'message-username';

        const messageContentElement = document.createElement('div');
        messageContentElement.style.color = 'white';
        messageContentElement.className = 'message-content';

        if (!message.isImage || !isFirebaseStorageURL(message.content)) {
            messageContentElement.innerHTML = message.content;
        } else {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('message-img-container');

            const imgElement = document.createElement('img');
            imgElement.src = message.content;
            imgElement.alt = "Image";
            imgElement.classList.add('message-img');

            imgContainer.appendChild(imgElement);
            messageContentElement.appendChild(imgContainer);
        }

        messageElement.appendChild(userNameElement);
        messageElement.appendChild(messageContentElement);
        messagesContainer.appendChild(messageElement);

        scrollToLastMessage();
    }

    // Check for bot command and respond
    async function checkBotResponse(userMessage) {
        const botResponse = responses[userMessage];
        if (botResponse) {
            const timestamp = await getServerTimestamp();
            const botMessage = {
                userId: 'bot',
                userName: 'Robozão dos Cria de ADS',
                userColor: '#FF5733',
                content: botResponse,
                isImage: false,
                timestamp
            };
            db.ref("messages").push(botMessage)
                .then(() => {
                    scrollToLastMessage(); // Chame a função após a mensagem do bot ser enviada
                })
                .catch(error => console.error('Error sending bot message:', error));
        }
    }

    // Image upload functionality
    imageButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadImage(file);
        }
    });

    async function uploadImage(file) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`images/${Date.now()}_${file.name}`);
        const uploadTask = imageRef.put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Progresso do upload
            },
            (error) => {
                console.error('Error uploading image:', error);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
                    const timestamp = await getServerTimestamp();
                    sendMessage(downloadURL, true, timestamp); // Envia o link da imagem
                });
            }
        );
    }

    // Code popup functionality
    codeButton.addEventListener('click', () => {
        codePopup.style.display = 'flex';
    });

    codeCloseButton.addEventListener('click', () => {
        codePopup.style.display = 'none';
    });

    codeExecuteButton.addEventListener('click', () => {
        const languageSelector = document.querySelector('.code-popup__language-selector');
        const codeTextarea = document.querySelector('.code-popup__textarea');
        const language = languageSelector.value;
        const code = codeTextarea.value;
        executeCode(language, code);
    });

    function executeCode(language, code) {
        codeConsole.innerHTML = '';
        try {
            if (language === 'javascript') {
                const result = eval(code);
                codeConsole.innerHTML = result;
            } else if (language === 'typescript') {
                const tsResult = ts.transpile(code);
                const jsResult = eval(tsResult);
                codeConsole.innerHTML = jsResult;
            }
        } catch (error) {
            codeConsole.innerHTML = `Error: ${error.message}`;
        }
    }
});
