document.addEventListener('DOMContentLoaded', function () {
    // Elementos da interface
    const loginForm = document.querySelector('.login__form');
    const registerButton = document.querySelector('.register__button');
    const nameInputForm = document.querySelector('.name-input__form');
    const chatForm = document.querySelector('.chat__form');
    const messagesContainer = document.querySelector('.chat__messages');
    const codePopup = document.getElementById('code-popup');
    const codeButton = document.querySelector('.chat__code-button');
    const codeCloseButton = document.querySelector('.code-popup__close-button');
    const codeExecuteButton = document.querySelector('.code-popup__button');
    const codeConsole = document.getElementById('code-popup-console');
    const imageButton = document.querySelector('.chat__image-button');
    const imageInput = document.querySelector('#imageInput');
    const ttElement = document.querySelector('.tt');
    const container = document.querySelector('.container');
    const googleSignInButton = document.getElementById('google-signin-button');
    const emailRegisterButton = document.querySelector('.email-register-button');
    const googleRegisterButton = document.querySelector('.google-register-button');
    const backToLoginButton = document.querySelector('.back-to-login-button');
    const backToRegisterButton = document.querySelector('.back-to-register-button');
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'p') {
            event.preventDefault();
            alert('A função "print" foi desabilitada no editor.');
        }
    });
    

    const loginSection = document.querySelector('.login');
    const registerSection = document.querySelector('.register');
    const emailRegisterSection = document.querySelector('.email-register');
    
    // Variáveis globais
    let userId = null;
    let userName = null;
    let userColor = null;
    const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];

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

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    const auth = firebase.auth();
    const storage = firebase.storage();
const database = firebase.database();
const responses = {
    "/bot": "Olá! Sou o Robozão dos Cria de ADS. Posso ajudar com alguns dos comandos abaixo:<br>" +
        "<br>- /bot o que é algoritmo?<br>" +
        "- /bot o que é javascript?<br>" +
        "- /bot qual a diferença entre java e javascript?<br>" +
        "- /bot o que é html?<br>" +
        "- /bot qual o comando de git para fazer commit?<br>" +
        "- /bot quais as permissões do chmod?<br>" +
        "- /bot como criar um repositório no github?<br>" +
        "- /bot o que é typescript?<br>",

    "/bot o que é algoritmo?": "Um algoritmo é uma sequência finita de ações executáveis que visam obter uma solução para um determinado tipo de problema.",
    "/bot o que é javascript?": "JavaScript é uma linguagem de programação de alto nível, interpretada e orientada a objetos. É amplamente utilizada para criar páginas da web interativas e dinâmicas.",
    "/bot qual a diferença entre java e javascript?": "Apesar dos nomes semelhantes, Java e JavaScript são linguagens de programação distintas. Java é uma linguagem de programação de propósito geral, enquanto JavaScript é uma linguagem de script principalmente usada para desenvolvimento web.",
    "/bot o que é html?": "HTML (Hypertext Markup Language) é a linguagem padrão para criar páginas da web. Ele descreve a estrutura básica de uma página da web usando elementos HTML.",
    "/bot qual o comando de git para fazer commit?": "O comando do Git para fazer commit é `git commit`. Este comando é usado para salvar as mudanças feitas no repositório Git.",
    "/bot quais as permissões do chmod?": "O comando `chmod` é usado no sistema Unix e Unix-like para modificar as permissões de acesso aos arquivos. As permissões incluem ler, gravar e executar, e podem ser definidas para o proprietário do arquivo, o grupo associado ao arquivo e outros usuários.",
    
    "/bot como criar um repositório no github?": "Para criar um repositório no GitHub, você precisa fazer login na sua conta GitHub, clicar no botão '+' no canto superior direito e selecionar 'New repository'. Em seguida, siga as instruções para configurar o seu repositório.",
    "/bot o que é typescript?": "TypeScript é uma linguagem de programação de código aberto desenvolvida pela Microsoft. É uma superset da linguagem JavaScript e adiciona tipagem estática opcional, entre outras funcionalidades, o que ajuda a evitar erros comuns e a facilitar o desenvolvimento de grandes aplicativos JavaScript."
};


// Função de login com email e senha
// Função de login com email e senha
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('.login__email').value;
    const password = loginForm.querySelector('.login__password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            userId = userCredential.user.uid;
            userColor = colors[Math.floor(Math.random() * colors.length)];
            ttElement.style.display = 'none';
            container.classList.add('fullscreen');
            loginForm.parentElement.style.display = 'none';
            document.querySelector('.name-input').style.display = 'flex';

            // Verifica se o nome do usuário já está no banco de dados
            return database.ref(`users/${userId}/name`).once('value');
        })
        .then((snapshot) => {
            if (snapshot.exists()) {
                document.querySelector('.name-input').style.display = 'none';
                document.querySelector('.chat').style.display = 'flex';
                loadMessages();
            }
        })
        .catch((error) => {
            console.error('Erro ao fazer login:', error.message);
            if (error.code === 'auth/user-not-found') {
                alert('Usuário não encontrado. Por favor, registre-se primeiro.');
            } else if (error.code === 'auth/wrong-password') {
                alert('Senha incorreta. Por favor, tente novamente.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Email inválido. Por favor, insira um email válido.');
            } else {
                alert('Falha ao fazer login. Por favor, verifique suas credenciais e tente novamente.');
            }
        });
});


// Função para exibir a seção de registro
registerButton.addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

// Função para exibir a seção de cadastro com email e senha
emailRegisterButton.addEventListener('click', () => {
    registerSection.style.display = 'none';
    emailRegisterSection.style.display = 'block';
});

// Função para registro com Google
googleRegisterButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.fetchSignInMethodsForEmail(provider.email) // Verifica se o email já está registrado
        .then((methods) => {
            if (methods.length > 0) {
                alert('Esta conta do Google já está registrada. Por favor, faça login.');
            } else {
                auth.signInWithPopup(provider)
                    .then((result) => {
                        userId = result.user.uid;
                        userColor = colors[Math.floor(Math.random() * colors.length)];
                        ttElement.style.display = 'none';
                        container.classList.add('fullscreen');
                        registerSection.style.display = 'none';  // Oculta a tela de registro
                        emailRegisterSection.style.display = 'none';  // Oculta a tela de cadastro por email/senha
                        document.querySelector('.name-input').style.display = 'flex';  // Exibe a tela de inserção do nome
                    })
                    .catch((error) => {
                        console.error('Erro ao registrar com o Google:', error.message);
                    });
            }
        })
        .catch((error) => {
            console.error('Erro ao verificar email do Google:', error.message);
        });
});

// Função para voltar para a tela de login a partir da tela de registro
backToLoginButton.addEventListener('click', () => {
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

// Função para voltar para a tela de seleção de registro a partir da tela de cadastro com email e senha
backToRegisterButton.addEventListener('click', () => {
    emailRegisterSection.style.display = 'none';
    registerSection.style.display = 'block';
});

// Função de registro com email e senha
emailRegisterSection.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailRegisterSection.querySelector('.register__email').value;
    const password = emailRegisterSection.querySelector('.register__password').value;

    // Verifica se o email já está registrado
    auth.fetchSignInMethodsForEmail(email)
        .then((methods) => {
            if (methods.length > 0) {
                alert('Este email já está registrado. Por favor, faça login.');
            } else {
                // Cria um novo usuário com email e senha
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        userId = userCredential.user.uid;
                        userColor = colors[Math.floor(Math.random() * colors.length)];
                        ttElement.style.display = 'none';
                        container.classList.add('fullscreen');
                        registerSection.style.display = 'none';  // Oculta a tela de registro
                        emailRegisterSection.style.display = 'none';  // Oculta a tela de cadastro por email/senha
                        document.querySelector('.name-input').style.display = 'flex';  // Exibe a tela de inserção do nome
                    })
                    .catch((error) => {
                        console.error('Erro ao fazer registro:', error.message);

                        // Verifica o código de erro retornado
                        if (error.code === 'auth/weak-password') {
                            alert('A senha é muito fraca. Por favor, escolha uma senha mais forte.');
                        } else if (error.code === 'auth/email-already-in-use') {
                            alert('Este email já está em uso. Por favor, faça login ou use outro email.');
                        } else if (error.code === 'auth/invalid-email') {
                            alert('Email inválido. Por favor, insira um email válido.');
                        } else {
                            alert('Falha ao fazer registro. Por favor, tente novamente.');
                        }
                    });
            }
        })
        .catch((error) => {
            console.error('Erro ao verificar email:', error.message);

            // Mensagem genérica para erros na verificação do email
            alert('Erro ao verificar o email. Por favor, tente novamente mais tarde.');
        });
});


// Função de login com Google
googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            userId = result.user.uid;
            userColor = colors[Math.floor(Math.random() * colors.length)];
            ttElement.style.display = 'none';
            container.classList.add('fullscreen');
            loginForm.parentElement.style.display = 'none';
            document.querySelector('.name-input').style.display = 'flex';

            // Verifica se o nome do usuário já está no banco de dados
            return database.ref(`users/${userId}/name`).once('value');
        })
        .then((snapshot) => {
            if (snapshot.exists()) {
                userName = snapshot.val(); // Atribui o nome recuperado à variável userName
                document.querySelector('.name-input').style.display = 'none';
                document.querySelector('.chat').style.display = 'flex';
                loadMessages();
            } else {
                // Se o nome não existir, mantém a tela de input para o usuário inserir o nome.
                document.querySelector('.name-input').style.display = 'flex';
            }
            
        })
        .catch((error) => {
            console.error('Erro ao fazer login com o Google:', error.message);
            if (error.code === 'auth/user-not-found') {
                alert('Usuário não encontrado. Por favor, registre-se primeiro.');
            }
        });
});

// Função para capturar o nome do usuário e exibir o chat
nameInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userName = nameInputForm.querySelector('.name-input__input').value;

    // Salva o nome do usuário no Realtime Database
    database.ref(`users/${userId}`).set({
        name: userName
    })
    .then(() => {
        document.querySelector('.name-input').style.display = 'none';
        document.querySelector('.chat').style.display = 'flex';
        loadMessages();
    })
    .catch((error) => {
        console.error('Erro ao salvar o nome do usuário:', error.message);
    });
});

auth.onAuthStateChanged((user) => {
    if (user) {
        userId = user.uid;

        // Verifica se o nome do usuário já está salvo no banco de dados
        database.ref(`users/${userId}/name`).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    userName = snapshot.val();  // Recupera o nome do usuário

                    // Exibe a seção de input de nome, mas não o chat
                    document.querySelector('.name-input').style.display = 'none';
                    document.querySelector('.chat').style.display = 'none';

                    // Adiciona evento ao botão de confirmação do nome
                    document.querySelector('.name-input__form').addEventListener('submit', (event) => {
                        event.preventDefault();  // Impede o envio do formulário
                        const nameInput = document.querySelector('.name-input__input').value;

                        if (nameInput) {
                            // Salva o nome do usuário no banco de dados
                            database.ref(`users/${userId}/name`).set(nameInput)
                                .then(() => {
                                    // Após salvar o nome, oculta a seção de input e exibe o chat
                                    document.querySelector('.name-input').style.display = 'none';
                                    document.querySelector('.chat').style.display = 'flex';
                                    loadMessages();
                                })
                                .catch((error) => {
                                    console.error('Erro ao salvar o nome do usuário:', error.message);
                                });
                        } else {
                            alert('Por favor, insira um nome válido.');
                        }
                    });
                } else {
                    // Se o nome não existir, exibe o formulário para inseri-lo
                    document.querySelector('.name-input').style.display = 'flex';
                    document.querySelector('.chat').style.display = 'none';
                }
            })
            .catch((error) => {
                console.error('Erro ao recuperar o nome do usuário:', error.message);
            });
    } 
});



chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = chatForm.querySelector('.chat__input');
    const message = messageInput.value;
    const timestamp = new Date().toLocaleString();
    
    if (message.trim() !== '') {
        // Verifica se a mensagem começa com "/bot"
        if (message.startsWith('/bot')) {
            // Envia a mensagem para o bot
            sendMessageToBot(message).then((botResponse) => {
                // Adiciona a resposta do bot ao chat
                db.ref('messages').push({
                    userId: 'bot',
                    userName: 'Bot',
                    userColor: '#000000',
                    message: botResponse,
                    timestamp: new Date().toLocaleString(),
                });
            }).catch(error => {
                console.error('Erro ao enviar mensagem para o bot:', error);
            });
        } else if (message === '/clearall') {
            clearAllMessages();
        } else {
            // Envia mensagem normal
            db.ref('messages').push({
                userId,
                userName,
                userColor,
                message,
                timestamp,
            });
        }

        // Limpa o campo de input após o envio
        messageInput.value = '';
    }
});


async function sendMessageToBot(userMessage) {
    try {
        const response = await fetch('https://chatcode-back.onrender.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        // Verifique se a resposta é ok
        if (!response.ok) {
            throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.response) {
            throw new Error('Resposta inválida do bot');
        }

        return data.response;
    } catch (error) {
        console.error(error); // Adiciona log para ajudar no diagnóstico
        return "Desculpe, ocorreu um erro ao tentar responder sua pergunta.";
    }
}



    function clearAllMessages() {
        messagesContainer.innerHTML = '';
    }

    db.ref('messages').on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    function displayMessage({ userId: senderId, userName, userColor, message, timestamp }) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(senderId === userId ? 'message-self' : 'message-other');
        messageElement.innerHTML = `
            <span class="message-username" style="color: ${userColor}">${userName} - ${timestamp}</span>
            <span class="message-content">${message}</span>
        `;
        messagesContainer.appendChild(messageElement);
    }

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
        const originalConsoleLog = console.log;
        console.log = function(...args) {
            const message = args.join(' ') + '\n';
            codeConsole.innerHTML += message.replace(/\n/g, '<br>');
            originalConsoleLog.apply(console, args);
        };
    
        try {
            if (language === 'javascript') {
                const result = executeJavaScript(code);
                if (result !== undefined) {
                    codeConsole.innerHTML += result;
                }
            } else if (language === 'typescript') {
                const tsResult = ts.transpile(code);
                const result = executeJavaScript(tsResult);
                if (result !== undefined) {
                    codeConsole.innerHTML += result;
                }
            } else if (language === 'python') { // Adiciona esta condição
                executePython(code);
            }
        } catch (error) {
            codeConsole.innerHTML += `Error: ${error.message}`;
        } finally {
            console.log = originalConsoleLog;
        }
    }
    
    function executeJavaScript(code) {
        try {
            const result = (new Function(code))();
            return result;
        } catch (error) {
            throw error;
        }
    }
    function executePython(code) {
        fetch('https://chatcode-back.onrender.com/execute-python', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        })
        .then(response => response.text())
        .then(text => {
          console.log('Server Response:', text); // Log para inspecionar a resposta do servidor
          if (text) {
            try {
              const data = JSON.parse(text);
              if (data.output) {
                codeConsole.innerHTML = data.output.replace(/\n/g, '<br>');
              } else {
                codeConsole.textContent = 'Nenhuma saída do código.';
              }
            } catch (e) {
              codeConsole.textContent = 'Erro ao processar a resposta do servidor.';
            }
          } else {
            codeConsole.textContent = 'Nenhuma resposta do servidor.';
          }
        })
        .catch(error => {
          codeConsole.textContent = 'Erro na execução do código.';
          console.error('Erro ao executar o código Python:', error.message);
        });
      }
      

    imageButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const storageRef = storage.ref('images/' + file.name);
            storageRef.put(file).then(() => {
                storageRef.getDownloadURL().then((url) => {
                    const messageInput = chatForm.querySelector('.chat__input');
                    const timestamp = new Date().toLocaleString();
                    
                    db.ref('messages').push({
                        userId,
                        userName,
                        userColor,
                        message: `<div class="message-img-container"><img src="${url}" class="message-img"></div>`,
                        timestamp,
                    });
                });
            });
        }
    });

    function loadMessages() {
        db.ref('messages').once('value', (snapshot) => {
            const messages = snapshot.val();
            for (let id in messages) {
                displayMessage(messages[id]);
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    }

    // Check for bot responses
    function checkBotResponse(messageText) {
        const lowerCaseMessage = messageText.toLowerCase();
        if (responses.hasOwnProperty(lowerCaseMessage)) {
            const botResponse = responses[lowerCaseMessage];
            const botMessage = {
                userId: 'bot',
                userName: 'ChatCodeBot',
                userColor: 'lightblue',
                message: botResponse,
                timestamp: new Date().toLocaleString(),
            };
            setTimeout(() => {
                db.ref('messages').push(botMessage);
            }, 1000);
        }
    }
});
