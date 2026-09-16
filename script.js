const API_URL = "https://nexora-ai-9jgj.onrender.com";

// ===============================
// AUTH ELEMENTS
// ===============================

const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");

const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");

const showSignup =
    document.getElementById("showSignupButton");

const showLogin =
    document.getElementById("showLoginButton");


// ===============================
// APP ELEMENTS
// ===============================

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const chatBox =
    document.getElementById("chatBox");

const clearButton =
    document.getElementById("clearButton");

const profileButton =
    document.getElementById("profileButton");

const profilePanel =
    document.getElementById("profilePanel");

const profileUsername =
    document.getElementById("profileUsername");

const profileCount =
    document.getElementById("profileCount");

const logoutButton =
    document.getElementById("logoutButton");


// ===============================
// VOICE ELEMENTS
// ===============================

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceReplyToggle =
    document.getElementById("voiceReplyToggle");

let speechRecognition = null;
let isListening = false;

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

const speechSynthesisSupported =
    "speechSynthesis" in window;


// ===============================
// USER SESSION
// ===============================

let currentUser =
    localStorage.getItem("nexora_username");


// ===============================
// STARTUP
// ===============================

// Always begin on the authentication screen.
// Login is required before entering the app.

if (authScreen) {
    authScreen.style.display = "flex";
}

if (appScreen) {
    appScreen.style.display = "none";
}


// ===============================
// AUTH SWITCHING
// ===============================

showSignup?.addEventListener("click", () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";

    loginMessage.textContent = "";
    signupMessage.textContent = "";
});

showLogin?.addEventListener("click", () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";

    signupMessage.textContent = "";
    loginMessage.textContent = "";
});


// ===============================
// SIGNUP
// ===============================

signupForm?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const username =
            signupUsername.value.trim();

        const password =
            signupPassword.value.trim();

        if (!username || !password) {
            signupMessage.textContent =
                "Please enter a username and password.";

            return;
        }

        signupMessage.textContent =
            "Creating account...";

        try {
            const response =
                await fetch(`${API_URL}/signup`, {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                });

            const data =
                await response.json();

            if (!response.ok) {
                signupMessage.textContent =
                    data.error ||
                    "Signup failed.";

                return;
            }

            signupMessage.textContent =
                "Account created successfully!";

            signupUsername.value = "";
            signupPassword.value = "";

            setTimeout(() => {
                signupForm.style.display =
                    "none";

                loginForm.style.display =
                    "block";

                loginUsername.value =
                    username;

                loginMessage.textContent =
                    "You can now log in.";
            }, 700);

        } catch (error) {
            console.error(error);

            signupMessage.textContent =
                "Could not connect to NEXORA.";
        }
    }
);


// ===============================
// LOGIN
// ===============================

loginForm?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const username =
            loginUsername.value.trim();

        const password =
            loginPassword.value.trim();

        if (!username || !password) {
            loginMessage.textContent =
                "Please enter your username and password.";

            return;
        }

        loginMessage.textContent =
            "Logging in...";

        try {
            const response =
                await fetch(`${API_URL}/login`, {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                });

            const data =
                await response.json();

            if (!response.ok) {
                loginMessage.textContent =
                    data.error ||
                    "Login failed.";

                return;
            }

            currentUser =
                data.username || username;

            localStorage.setItem(
                "nexora_username",
                currentUser
            );

            loginMessage.textContent =
                "Login successful.";

            setTimeout(() => {
                showApp();
            }, 400);

        } catch (error) {
            console.error(error);

            loginMessage.textContent =
                "Could not connect to NEXORA.";
        }
    }
);


// ===============================
// SHOW APP
// ===============================

function showApp() {
    if (authScreen) {
        authScreen.style.display = "none";
    }

    if (appScreen) {
        appScreen.style.display = "flex";
    }

    if (profileUsername) {
        profileUsername.textContent =
            currentUser || "User";
    }

    setupVoiceInput();
    loadHistory();
    loadProfile();
}


// ===============================
// PROFILE
// ===============================

profileButton?.addEventListener(
    "click",
    () => {
        if (!profilePanel) return;

        const visible =
            profilePanel.style.display ===
            "block";

        profilePanel.style.display =
            visible ? "none" : "block";

        if (!visible) {
            loadProfile();
        }
    }
);


async function loadProfile() {
    if (!currentUser) return;

    try {
        const response =
            await fetch(
                `${API_URL}/profile?username=${encodeURIComponent(currentUser)}`
            );

        const data =
            await response.json();

        if (profileUsername) {
            profileUsername.textContent =
                currentUser;
        }

        if (profileCount) {
            profileCount.textContent =
                data.conversation_count ?? 0;
        }

    } catch (error) {
        console.error(
            "Profile error:",
            error
        );
    }
}


// ===============================
// LOGOUT
// ===============================

logoutButton?.addEventListener(
    "click",
    () => {
        stopSpeaking();
        stopListening();

        localStorage.removeItem(
            "nexora_username"
        );

        currentUser = null;

        location.reload();
    }
);


// ===============================
// ADD MESSAGE
// ===============================

function addMessage(text, sender) {
    const message =
        document.createElement("div");

    message.className =
        `message ${sender}`;

    message.textContent =
        text;

    chatBox.appendChild(message);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    return message;
}


// ===============================
// ADD GENERATED IMAGE
// ===============================

function addImageMessage(
    imageUrl,
    prompt
) {
    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai image-message";

    const image =
        document.createElement("img");

    image.className =
        "generated-image";

    image.src =
        imageUrl;

    image.alt =
        prompt ||
        "Generated image";

    image.loading =
        "lazy";

    wrapper.appendChild(image);

    chatBox.appendChild(wrapper);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ===============================
// TYPE MESSAGE
// ===============================

async function typeMessage(
    element,
    text
) {
    if (!element) return;

    element.textContent = "";

    const words =
        text.split(" ");

    for (
        let i = 0;
        i < words.length;
        i++
    ) {
        element.textContent +=
            (i === 0 ? "" : " ") +
            words[i];

        chatBox.scrollTop =
            chatBox.scrollHeight;

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    18
                )
        );
    }
}


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {
    const message =
        messageInput.value.trim();

    if (!message) return;

    if (!currentUser) {
        addMessage(
            "Please log in first.",
            "ai"
        );

        return;
    }

    addMessage(
        message,
        "user"
    );

    messageInput.value = "";

    sendButton.disabled = true;

    const thinkingMessage =
        addMessage(
            "Thinking...",
            "ai"
        );

    try {
        const response =
            await fetch(
                `${API_URL}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username:
                            currentUser,

                        message:
                            message
                    })
                }
            );

        const data =
            await response.json();

        thinkingMessage.remove();

        if (!response.ok) {
            addMessage(
                data.error ||
                "Something went wrong.",
                "ai"
            );

            return;
        }

        if (data.reply) {
            const replyMessage =
                addMessage(
                    "",
                    "ai"
                );

            await typeMessage(
                replyMessage,
                data.reply
            );

            speakReply(
                data.reply
            );
        }

        if (data.image_url) {
            addImageMessage(
                data.image_url,
                data.image_prompt ||
                message
            );
        }

    } catch (error) {
        console.error(error);

        thinkingMessage.remove();

        addMessage(
            "I couldn't connect to the NEXORA server.",
            "ai"
        );

    } finally {
        sendButton.disabled =
            false;

        messageInput.focus();
    }
}


// ===============================
// SEND BUTTON
// ===============================

sendButton?.addEventListener(
    "click",
    sendMessage
);


// ===============================
// ENTER TO SEND
// ===============================

messageInput?.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            sendMessage();
        }
    }
);


// ===============================
// CLEAR CHAT
// ===============================

clearButton?.addEventListener(
    "click",
    async () => {
        if (!currentUser) return;

        try {
            const response =
                await fetch(
                    `${API_URL}/clear`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username:
                                currentUser
                        })
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Clear failed"
                );
            }

            chatBox.innerHTML = "";

            addMessage(
                "Chat cleared. How can I help you?",
                "ai"
            );

            stopSpeaking();

        } catch (error) {
            console.error(error);

            addMessage(
                "I couldn't clear the chat.",
                "ai"
            );
        }
    }
);


// ===============================
// LOAD HISTORY
// ===============================

async function loadHistory() {
    if (!currentUser) return;

    try {
        const response =
            await fetch(
                `${API_URL}/history?username=${encodeURIComponent(currentUser)}`
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !Array.isArray(
                data.history
            )
        ) {
            return;
        }

        chatBox.innerHTML = "";

        if (
            data.history.length === 0
        ) {
            addMessage(
                `Welcome back, ${currentUser}! I'm NEXORA. How can I help you?`,
                "ai"
            );

            return;
        }

        for (
            const item of data.history
        ) {
            if (
                item.user &&
                item.user.trim()
            ) {
                addMessage(
                    item.user,
                    "user"
                );
            }

            if (
                item.assistant &&
                item.assistant.trim()
            ) {
                addMessage(
                    item.assistant,
                    "ai"
                );
            }
        }

        chatBox.scrollTop =
            chatBox.scrollHeight;

    } catch (error) {
        console.error(
            "History error:",
            error
        );
    }
}


// ===============================
// VOICE INPUT
// ===============================

function setupVoiceInput() {
    if (!voiceButton) return;

    if (!SpeechRecognition) {
        voiceButton.disabled =
            true;

        voiceButton.title =
            "Voice input is not supported in this browser.";

        if (voiceStatus) {
            voiceStatus.textContent =
                "Voice input is not supported in this browser.";
        }

        return;
    }

    speechRecognition =
        new SpeechRecognition();

    speechRecognition.continuous =
        false;

    speechRecognition.interimResults =
        true;

    speechRecognition.lang =
        "en-US";

    speechRecognition.onstart =
        () => {
            isListening = true;

            voiceButton.textContent =
                "⏹️";

            voiceButton.classList.add(
                "listening"
            );

            if (voiceStatus) {
                voiceStatus.textContent =
                    "Listening... speak now";
            }
        };

    speechRecognition.onresult =
        (event) => {
            let finalText = "";

            for (
                let i =
                    event.resultIndex;
                i <
                    event.results.length;
                i++
            ) {
                finalText +=
                    event.results[i][0]
                        .transcript;
            }

            messageInput.value =
                finalText.trim();
        };

    speechRecognition.onerror =
        (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            if (voiceStatus) {
                if (
                    event.error ===
                    "not-allowed"
                ) {
                    voiceStatus.textContent =
                        "Microphone permission was denied.";
                } else {
                    voiceStatus.textContent =
                        "I couldn't hear that. Try again.";
                }
            }

            stopListening();
        };

    speechRecognition.onend =
        () => {
            isListening = false;

            voiceButton.textContent =
                "🎙️";

            voiceButton.classList.remove(
                "listening"
            );

            const spokenText =
                messageInput.value.trim();

            if (spokenText) {
                sendMessage();
            }

            setTimeout(() => {
                if (
                    !isListening &&
                    voiceStatus
                ) {
                    voiceStatus.textContent =
                        "";
                }
            }, 1500);
        };
}


// ===============================
// START LISTENING
// ===============================

function startListening() {
    if (!speechRecognition) {
        return;
    }

    try {
        speechRecognition.start();

    } catch (error) {
        console.error(
            "Could not start microphone:",
            error
        );
    }
}


// ===============================
// STOP LISTENING
// ===============================

function stopListening() {
    if (!speechRecognition) {
        return;
    }

    try {
        speechRecognition.stop();

    } catch (error) {
        // Already stopped
    }

    isListening = false;

    if (voiceButton) {
        voiceButton.textContent =
            "🎙️";

        voiceButton.classList.remove(
            "listening"
        );
    }
}


// ===============================
// VOICE BUTTON
// ===============================

voiceButton?.addEventListener(
    "click",
    () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }
);


// ===============================
// VOICE REPLIES
// ===============================

function speakReply(text) {
    if (
        !voiceReplyToggle ||
        !voiceReplyToggle.checked
    ) {
        return;
    }

    if (!speechSynthesisSupported) {
        return;
    }

    if (!text || !text.trim()) {
        return;
    }

    stopSpeaking();

    const cleanText =
        text
            .replace(/[*_#`]/g, "")
            .replace(/\n+/g, " ")
            .trim();

    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );

    utterance.lang =
        "en-US";

    utterance.rate =
        1.0;

    utterance.pitch =
        1.0;

    utterance.volume =
        1.0;

    const voices =
        window.speechSynthesis
            .getVoices();

    const preferredVoice =
        voices.find(
            voice =>
                voice.lang ===
                "en-US"
        ) ||
        voices.find(
            voice =>
                voice.lang.startsWith(
                    "en"
                )
        );

    if (preferredVoice) {
        utterance.voice =
            preferredVoice;
    }

    window.speechSynthesis.speak(
        utterance
    );
}


// ===============================
// STOP SPEAKING
// ===============================

function stopSpeaking() {
    if (!speechSynthesisSupported) {
        return;
    }

    window.speechSynthesis.cancel();
}


// ===============================
// VOICE REPLY TOGGLE
// ===============================

voiceReplyToggle?.addEventListener(
    "change",
    () => {
        if (
            !voiceReplyToggle.checked
        ) {
            stopSpeaking();

            if (voiceStatus) {
                voiceStatus.textContent =
                    "Voice replies off";
            }
        } else {
            if (voiceStatus) {
                voiceStatus.textContent =
                    "Voice replies on";
            }
        }

        setTimeout(() => {
            if (voiceStatus) {
                voiceStatus.textContent =
                    "";
            }
        }, 1500);
    }
);


// ===============================
// LOAD SAVED VOICE SETTING
// ===============================

const savedVoiceSetting =
    localStorage.getItem(
        "nexora_voice_replies"
    );

if (voiceReplyToggle) {
    if (
        savedVoiceSetting ===
        "off"
    ) {
        voiceReplyToggle.checked =
            false;
    } else {
        voiceReplyToggle.checked =
            true;
    }

    voiceReplyToggle.addEventListener(
        "change",
        () => {
            localStorage.setItem(
                "nexora_voice_replies",
                voiceReplyToggle.checked
                    ? "on"
                    : "off"
            );
        }
    );
}


// ===============================
// SPEECH SYNTHESIS VOICES
// ===============================

if (speechSynthesisSupported) {
    window.speechSynthesis.onvoiceschanged =
        () => {
            window.speechSynthesis
                .getVoices();
        };
}