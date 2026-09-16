const API_URL = "https://nexora-ai-9jgj.onrender.com";

// ===============================
// AUTH ELEMENTS
// ===============================

const authScreen =
    document.getElementById("authScreen");

const appScreen =
    document.getElementById("appScreen");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");

const signupUsername =
    document.getElementById("signupUsername");

const signupPassword =
    document.getElementById("signupPassword");

const loginMessage =
    document.getElementById("loginMessage");

const signupMessage =
    document.getElementById("signupMessage");

// IMPORTANT:
// These IDs match index.html
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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupVoiceInput();
        setupVoiceReplyToggle();

        if (currentUser) {
            showApp();
        } else {
            showAuth();
        }

    }
);


// ===============================
// SHOW AUTH
// ===============================

function showAuth() {

    if (authScreen) {
        authScreen.classList.remove("hidden");
        authScreen.style.display = "block";
    }

    if (appScreen) {
        appScreen.classList.add("hidden");
        appScreen.style.display = "none";
    }

}


// ===============================
// SHOW APP
// ===============================

function showApp() {

    if (authScreen) {
        authScreen.classList.add("hidden");
        authScreen.style.display = "none";
    }

    if (appScreen) {
        appScreen.classList.remove("hidden");
        appScreen.style.display = "flex";
    }

    loadHistory();
    loadProfile();

}


// ===============================
// AUTH SWITCHING
// ===============================

showSignup?.addEventListener(
    "click",
    () => {

        if (loginForm) {
            loginForm.style.display = "none";
        }

        if (signupForm) {
            signupForm.style.display = "block";
        }

        if (loginMessage) {
            loginMessage.textContent = "";
        }

        if (signupMessage) {
            signupMessage.textContent = "";
        }

    }
);


showLogin?.addEventListener(
    "click",
    () => {

        if (signupForm) {
            signupForm.style.display = "none";
        }

        if (loginForm) {
            loginForm.style.display = "block";
        }

        if (signupMessage) {
            signupMessage.textContent = "";
        }

        if (loginMessage) {
            loginMessage.textContent = "";
        }

    }
);


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
                await fetch(
                    `${API_URL}/signup`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username,
                            password
                        })
                    }
                );

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

            setTimeout(
                () => {

                    if (signupForm) {
                        signupForm.style.display =
                            "none";
                    }

                    if (loginForm) {
                        loginForm.style.display =
                            "block";
                    }

                    if (loginUsername) {
                        loginUsername.value =
                            username;
                    }

                    if (loginMessage) {
                        loginMessage.textContent =
                            "You can now log in.";
                    }

                },
                700
            );

        } catch (error) {

            console.error(
                "Signup error:",
                error
            );

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
                await fetch(
                    `${API_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username,
                            password
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                loginMessage.textContent =
                    data.error ||
                    "Login failed.";

                return;
            }

            currentUser =
                data.username ||
                username;

            localStorage.setItem(
                "nexora_username",
                currentUser
            );

            loginMessage.textContent =
                "Login successful.";

            setTimeout(
                () => {
                    showApp();
                },
                400
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                "Could not connect to NEXORA.";

        }

    }
);


// ===============================
// ADD MESSAGE
// ===============================

function addMessage(
    text,
    sender = "ai",
    imageUrl = null
) {

    if (!chatBox) {
        return null;
    }

    const message =
        document.createElement("div");

    message.className =
        `message ${sender}`;

    if (text) {

        const textElement =
            document.createElement("div");

        textElement.className =
            "message-text";

        textElement.textContent =
            text;

        message.appendChild(
            textElement
        );
    }

    if (imageUrl) {

        const image =
            document.createElement("img");

        image.src = imageUrl;

        image.alt =
            "Generated image";

        image.className =
            "generated-image";

        image.loading =
            "lazy";

        message.appendChild(
            image
        );
    }

    chatBox.appendChild(
        message
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;

    return message;
}


// ===============================
// TYPE MESSAGE
// ===============================

function typeMessage(
    element,
    text,
    speed = 12
) {

    return new Promise(
        (resolve) => {

            if (!element) {
                resolve();
                return;
            }

            element.textContent = "";

            let index = 0;

            function typeNext() {

                if (index >= text.length) {
                    resolve();
                    return;
                }

                element.textContent +=
                    text.charAt(index);

                index++;

                if (chatBox) {
                    chatBox.scrollTop =
                        chatBox.scrollHeight;
                }

                setTimeout(
                    typeNext,
                    speed
                );
            }

            typeNext();

        }
    );
}


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    if (!messageInput) {
        return;
    }

    const message =
        messageInput.value.trim();

    if (!message) {
        return;
    }

    if (!currentUser) {

        showAuth();

        return;
    }

    addMessage(
        message,
        "user"
    );

    messageInput.value = "";

    if (sendButton) {
        sendButton.disabled = true;
    }

    const thinkingMessage =
        addMessage(
            "NEXORA is thinking...",
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

        if (thinkingMessage) {
            thinkingMessage.remove();
        }

        if (!response.ok) {

            addMessage(
                data.error ||
                "Something went wrong.",
                "ai"
            );

            return;
        }

        const aiMessage =
            addMessage(
                "",
                "ai"
            );

        const textElement =
            aiMessage?.querySelector(
                ".message-text"
            );

        if (data.reply) {

            await typeMessage(
                textElement,
                data.reply
            );

            speakReply(
                data.reply
            );
        }

        if (
            data.image_generated &&
            data.image_url
        ) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                data.image_url;

            image.alt =
                data.image_prompt ||
                "Generated image";

            image.className =
                "generated-image";

            image.loading =
                "lazy";

            aiMessage.appendChild(
                image
            );

            if (chatBox) {
                chatBox.scrollTop =
                    chatBox.scrollHeight;
            }
        }

    } catch (error) {

        console.error(
            "Chat error:",
            error
        );

        if (thinkingMessage) {
            thinkingMessage.remove();
        }

        addMessage(
            "Could not connect to NEXORA.",
            "ai"
        );

    } finally {

        if (sendButton) {
            sendButton.disabled = false;
        }

        messageInput.focus();
    }
}


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
// SEND BUTTON
// ===============================

sendButton?.addEventListener(
    "click",
    sendMessage
);


// ===============================
// CLEAR CHAT
// ===============================

clearButton?.addEventListener(
    "click",
    async () => {

        if (!currentUser) {
            return;
        }

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

            const data =
                await response.json();

            if (response.ok) {

                if (chatBox) {
                    chatBox.innerHTML = "";
                }

                addMessage(
                    "Chat cleared. How can I help you?",
                    "ai"
                );

                loadProfile();
            } else {

                addMessage(
                    data.error ||
                    "Could not clear chat.",
                    "ai"
                );
            }

        } catch (error) {

            console.error(
                "Clear chat error:",
                error
            );

        }

    }
);


// ===============================
// LOAD HISTORY
// ===============================

async function loadHistory() {

    if (!currentUser || !chatBox) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/history?username=${encodeURIComponent(currentUser)}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            return;
        }

        chatBox.innerHTML = "";

        const history =
            data.history ||
            data.conversation_history ||
            [];

        if (!history.length) {

            addMessage(
                `Hello ${currentUser}! I'm NEXORA. How can I help you today?`,
                "ai"
            );

            return;
        }

        history.forEach(
            (item) => {

                const userText =
                    item.user ||
                    item.question ||
                    item.message;

                const aiText =
                    item.assistant ||
                    item.answer ||
                    item.reply;

                if (userText) {

                    addMessage(
                        userText,
                        "user"
                    );
                }

                if (aiText) {

                    addMessage(
                        aiText,
                        "ai"
                    );
                }

            }
        );

    } catch (error) {

        console.error(
            "History error:",
            error
        );

    }

}


// ===============================
// LOAD PROFILE
// ===============================

async function loadProfile() {

    if (!currentUser) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/profile?username=${encodeURIComponent(currentUser)}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            return;
        }

        if (profileUsername) {

            profileUsername.textContent =
                data.username ||
                currentUser;
        }

        if (profileCount) {

            profileCount.textContent =
                data.conversation_count ??
                data.conversations ??
                0;
        }

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

    }

}


// ===============================
// PROFILE BUTTON
// ===============================

profileButton?.addEventListener(
    "click",
    () => {

        if (!profilePanel) {
            return;
        }

        profilePanel.classList.toggle(
            "hidden"
        );

    }
);


// ===============================
// LOGOUT
// ===============================

logoutButton?.addEventListener(
    "click",
    () => {

        stopSpeaking();

        currentUser = null;

        localStorage.removeItem(
            "nexora_username"
        );

        if (chatBox) {
            chatBox.innerHTML = "";
        }

        if (loginUsername) {
            loginUsername.value = "";
        }

        if (loginPassword) {
            loginPassword.value = "";
        }

        if (loginMessage) {
            loginMessage.textContent = "";
        }

        if (signupMessage) {
            signupMessage.textContent = "";
        }

        if (signupForm) {
            signupForm.style.display =
                "none";
        }

        if (loginForm) {
            loginForm.style.display =
                "block";
        }

        showAuth();

    }
);


// ===============================
// VOICE INPUT
// ===============================

function setupVoiceInput() {

    if (!voiceButton) {
        return;
    }

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
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                finalText +=
                    event.results[i][0].transcript;
            }

            if (messageInput) {

                messageInput.value =
                    finalText.trim();
            }

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
                messageInput?.value.trim();

            if (spokenText) {
                sendMessage();
            }

            setTimeout(
                () => {

                    if (
                        !isListening &&
                        voiceStatus
                    ) {

                        voiceStatus.textContent =
                            "";
                    }

                },
                1500
            );

        };

    voiceButton.addEventListener(
        "click",
        () => {

            if (!speechRecognition) {
                return;
            }

            if (isListening) {

                stopListening();

            } else {

                try {

                    messageInput.value = "";

                    speechRecognition.start();

                } catch (error) {

                    console.error(
                        "Voice start error:",
                        error
                    );

                }

            }

        }
    );

}


// ===============================
// STOP LISTENING
// ===============================

function stopListening() {

    if (
        speechRecognition &&
        isListening
    ) {

        try {
            speechRecognition.stop();
        } catch (error) {
            console.error(error);
        }
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
// SPEAK REPLY
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
        window.speechSynthesis.getVoices();

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

    if (
        speechSynthesisSupported
    ) {

        window.speechSynthesis.cancel();
    }

}


// ===============================
// VOICE REPLY TOGGLE
// ===============================

function setupVoiceReplyToggle() {

    if (!voiceReplyToggle) {
        return;
    }

    const savedVoiceSetting =
        localStorage.getItem(
            "nexora_voice_replies"
        );

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

            setTimeout(
                () => {

                    if (voiceStatus) {

                        voiceStatus.textContent =
                            "";
                    }

                },
                1500
            );

        }
    );

}


// ===============================
// SPEECH VOICES READY
// ===============================

if (
    speechSynthesisSupported
) {

    window.speechSynthesis.onvoiceschanged =
        () => {
            window.speechSynthesis.getVoices();
        };

}