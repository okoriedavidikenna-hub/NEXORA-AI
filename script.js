const API_URL = "https://nexora-ai-9jgj.onrender.com";

/* =========================================================
AUTH ELEMENTS
========================================================= */

const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("app");

const loginScreen = document.getElementById("loginScreen");
const signupScreen = document.getElementById("signupScreen");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword =
document.getElementById("signupConfirmPassword");

const authMessage =
document.getElementById("authMessage");

const showSignup =
document.getElementById("showSignupButton");

const showLogin =
document.getElementById("showLoginButton");

/* =========================================================
APP ELEMENTS
========================================================= */

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

const closeProfileButton =
document.getElementById("closeProfileButton");

const profileUsername =
document.getElementById("profileUsername");

const profileCount =
document.getElementById("conversationCount");

const logoutButton =
document.getElementById("logoutButton");

/* =========================================================
VOICE ELEMENTS
========================================================= */

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

/* =========================================================
USER SESSION
========================================================= */

let currentUser =
localStorage.getItem("nexora_username");

/* =========================================================
AUTH SCREEN CONTROL
========================================================= */

function showLoginScreen() {

if (loginScreen) {
    loginScreen.classList.remove("hidden");
    loginScreen.style.display = "block";
}

if (signupScreen) {
    signupScreen.classList.add("hidden");
    signupScreen.style.display = "none";
}

if (authMessage) {
    authMessage.textContent = "";
}

}

function showSignupScreen() {

if (loginScreen) {
    loginScreen.classList.add("hidden");
    loginScreen.style.display = "none";
}

if (signupScreen) {
    signupScreen.classList.remove("hidden");
    signupScreen.style.display = "block";
}

if (authMessage) {
    authMessage.textContent = "";
}

}

/* =========================================================
STARTUP
========================================================= */

function initializeApp() {

if (currentUser) {

    showApp();

} else {

    if (authScreen) {
        authScreen.style.display = "flex";
    }

    if (appScreen) {
        appScreen.classList.add("hidden");
        appScreen.style.display = "none";
    }

    showLoginScreen();
}

}

/* =========================================================
AUTH SWITCHING
========================================================= */

showSignup?.addEventListener("click", () => {
showSignupScreen();
});

showLogin?.addEventListener("click", () => {
showLoginScreen();
});

/* =========================================================
SIGNUP
========================================================= */

signupForm?.addEventListener("submit", async (event) => {

event.preventDefault();

const username =
    signupUsername.value.trim();

const password =
    signupPassword.value.trim();

const confirmPassword =
    signupConfirmPassword.value.trim();


if (!username || !password || !confirmPassword) {

    if (authMessage) {
        authMessage.textContent =
            "Please fill in all fields.";
    }

    return;
}


if (password !== confirmPassword) {

    if (authMessage) {
        authMessage.textContent =
            "Passwords do not match.";
    }

    return;
}


if (authMessage) {
    authMessage.textContent =
        "Creating account...";
}


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

        if (authMessage) {
            authMessage.textContent =
                data.error ||
                "Signup failed.";
        }

        return;
    }


    if (authMessage) {
        authMessage.textContent =
            "Account created successfully!";
    }


    signupUsername.value = "";
    signupPassword.value = "";
    signupConfirmPassword.value = "";


    setTimeout(() => {

        showLoginScreen();

        if (loginUsername) {
            loginUsername.value =
                username;
        }

        if (authMessage) {
            authMessage.textContent =
                "Account created. You can now log in.";
        }

    }, 700);


} catch (error) {

    console.error(
        "Signup error:",
        error
    );

    if (authMessage) {
        authMessage.textContent =
            "Could not connect to NEXORA.";
    }
}

});

/* =========================================================
LOGIN
========================================================= */

loginForm?.addEventListener("submit", async (event) => {

event.preventDefault();

const username =
    loginUsername.value.trim();

const password =
    loginPassword.value.trim();


if (!username || !password) {

    if (authMessage) {
        authMessage.textContent =
            "Please enter your username and password.";
    }

    return;
}


if (authMessage) {
    authMessage.textContent =
        "Logging in...";
}


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

        if (authMessage) {
            authMessage.textContent =
                data.error ||
                "Login failed.";
        }

        return;
    }


    currentUser =
        data.username || username;


    localStorage.setItem(
        "nexora_username",
        currentUser
    );


    if (authMessage) {
        authMessage.textContent =
            "Login successful.";
    }


    setTimeout(() => {
        showApp();
    }, 300);


} catch (error) {

    console.error(
        "Login error:",
        error
    );

    if (authMessage) {
        authMessage.textContent =
            "Could not connect to NEXORA.";
    }
}

});

/* =========================================================
SHOW APP
========================================================= */

function showApp() {

if (authScreen) {
    authScreen.style.display = "none";
}

if (appScreen) {
    appScreen.classList.remove("hidden");
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

/* =========================================================
PROFILE
========================================================= */

profileButton?.addEventListener("click", () => {

if (!profilePanel) {
    return;
}

const isHidden =
    profilePanel.classList.contains("hidden");


if (isHidden) {

    profilePanel.classList.remove("hidden");
    profilePanel.style.display = "block";

    loadProfile();

} else {

    profilePanel.classList.add("hidden");
    profilePanel.style.display = "none";
}

});

closeProfileButton?.addEventListener("click", () => {

if (!profilePanel) {
    return;
}

profilePanel.classList.add("hidden");
profilePanel.style.display = "none";

});

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

/* =========================================================
LOGOUT
========================================================= */

logoutButton?.addEventListener("click", () => {

stopSpeaking();
stopListening();

localStorage.removeItem(
    "nexora_username"
);

currentUser = null;

location.reload();

});

/* =========================================================
MESSAGE HELPERS
========================================================= */

function createMessageElement(
text,
sender
) {

const wrapper =
    document.createElement("div");

const isUser =
    sender === "user";

wrapper.className =
    isUser
        ? "message user-message"
        : "message ai-message";


if (!isUser) {

    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "N";

    wrapper.appendChild(avatar);
}


const bubble =
    document.createElement("div");

bubble.className =
    "message-bubble";

bubble.textContent =
    text || "";

wrapper.appendChild(bubble);


return {
    wrapper,
    bubble
};

}

/* =========================================================
ADD MESSAGE
========================================================= */

function addMessage(
text,
sender
) {

if (!chatBox) {
    return null;
}

const message =
    createMessageElement(
        text,
        sender
    );

chatBox.appendChild(
    message.wrapper
);

chatBox.scrollTop =
    chatBox.scrollHeight;

return message.bubble;

}

/* =========================================================
NEXORA TYPING INDICATOR
========================================================= */

function createTypingIndicator() {

if (!chatBox) {
    return null;
}

const wrapper =
    document.createElement("div");

wrapper.className =
    "message ai-message nexora-typing-message";

const avatar =
    document.createElement("div");

avatar.className =
    "message-avatar";

avatar.textContent =
    "N";

wrapper.appendChild(avatar);


const bubble =
    document.createElement("div");

bubble.className =
    "message-bubble nexora-typing-bubble";

bubble.innerHTML =
    '<span class="typing-name">NEXORA</span> is typing<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';

wrapper.appendChild(bubble);

chatBox.appendChild(wrapper);

chatBox.scrollTop =
    chatBox.scrollHeight;


return wrapper;

}

/* =========================================================
TYPING DOT ANIMATION
========================================================= */

function startTypingAnimation() {

let dots = 0;

const typingDots =
    document.querySelector(
        ".nexora-typing-message .typing-dots"
    );

if (!typingDots) {
    return null;
}

const interval =
    setInterval(() => {

        dots++;

        if (dots > 3) {
            dots = 0;
        }

        typingDots.innerHTML =
            ".".repeat(dots);

    }, 350);

return interval;

}

/* =========================================================
GENERATED IMAGE
========================================================= */

function addImageMessage(
imageUrl,
prompt
) {

if (!chatBox) {
    return;
}

const wrapper =
    document.createElement("div");

wrapper.className =
    "message ai-message image-message";

const avatar =
    document.createElement("div");

avatar.className =
    "message-avatar";

avatar.textContent =
    "N";

wrapper.appendChild(
    avatar
);

const bubble =
    document.createElement("div");

bubble.className =
    "message-bubble";

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

bubble.appendChild(
    image
);

wrapper.appendChild(
    bubble
);

chatBox.appendChild(
    wrapper
);

chatBox.scrollTop =
    chatBox.scrollHeight;

}

/* =========================================================
TYPE MESSAGE
========================================================= */

async function typeMessage(
element,
text
) {

if (!element) {
    return;
}

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

    if (chatBox) {
        chatBox.scrollTop =
            chatBox.scrollHeight;
    }

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                18
            )
    );
}

}

/* =========================================================
SEND MESSAGE
========================================================= */

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

if (sendButton) {
    sendButton.disabled = true;
}


/* ==========================================
   SHOW NEXORA TYPING
   ========================================== */

const typingIndicator =
    createTypingIndicator();

const typingAnimation =
    startTypingAnimation();


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


    if (typingAnimation) {
        clearInterval(
            typingAnimation
        );
    }


    if (typingIndicator) {
        typingIndicator.remove();
    }


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
            createMessageElement(
                "",
                "ai"
            );

        chatBox.appendChild(
            replyMessage.wrapper
        );

        await typeMessage(
            replyMessage.bubble,
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

    console.error(
        "Chat error:",
        error
    );


    if (typingAnimation) {
        clearInterval(
            typingAnimation
        );
    }


    if (typingIndicator) {
        typingIndicator.remove();
    }


    addMessage(
        "I couldn't connect to the NEXORA server.",
        "ai"
    );


} finally {

    if (sendButton) {
        sendButton.disabled = false;
    }

    messageInput.focus();
}

}

/* =========================================================
SEND BUTTON
========================================================= */

sendButton?.addEventListener(
"click",
sendMessage
);

/* =========================================================
ENTER TO SEND
========================================================= */

messageInput?.addEventListener(
"keydown",
event => {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();
    }
}

);

/* =========================================================
CLEAR CHAT
========================================================= */

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

        console.error(
            "Clear error:",
            error
        );


        addMessage(
            "I couldn't clear the chat.",
            "ai"
        );
    }
}

);

/* =========================================================
LOAD HISTORY
========================================================= */

async function loadHistory() {

    if (!currentUser) {
        return;
    }

    try {

        const savedConversationId =
            localStorage.getItem(
                "nexora_conversation_id"
            );

        let url =
            `${API_URL}/history?username=${encodeURIComponent(currentUser)}`;

        if (savedConversationId) {

            url +=
                `&conversation_id=${encodeURIComponent(savedConversationId)}`;
        }

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (
            !response.ok ||
            !Array.isArray(data.history)
        ) {
            return;
        }

        if (
            data.conversation_id
        ) {

            localStorage.setItem(
                "nexora_conversation_id",
                data.conversation_id
            );
        }

        chatBox.innerHTML = "";

        if (data.history.length === 0) {

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

/* =========================================================
VOICE INPUT
========================================================= */

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

        isListening =
            true;

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
    event => {

        let finalText =
            "";

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
    event => {

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

        isListening =
            false;

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

/* =========================================================
START LISTENING
========================================================= */

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

/* =========================================================
STOP LISTENING
========================================================= */

function stopListening() {

if (!speechRecognition) {
    return;
}

try {

    speechRecognition.stop();

} catch (error) {
    // Already stopped
}

isListening =
    false;

if (voiceButton) {

    voiceButton.textContent =
        "🎙️";

    voiceButton.classList.remove(
        "listening"
    );
}

}

/* =========================================================
VOICE BUTTON
========================================================= */

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

/* =========================================================
VOICE REPLIES
========================================================= */

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

/* =========================================================
STOP SPEAKING
========================================================= */

function stopSpeaking() {

if (!speechSynthesisSupported) {
    return;
}

window.speechSynthesis.cancel();

}

/* =========================================================
VOICE REPLY TOGGLE
========================================================= */

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
            voiceStatus.textContent = "";
        }

    }, 1500);
}

);

/* =========================================================
SAVE VOICE SETTING
========================================================= */

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

/* =========================================================
SPEECH SYNTHESIS VOICES
========================================================= */

if (speechSynthesisSupported) {

window.speechSynthesis.onvoiceschanged =
    () => {

        window.speechSynthesis
            .getVoices();
    };

}

/* =========================================================
START NEXORA
========================================================= */

initializeApp();

/* =========================================================
   NEXORA CONVERSATION DRAWER
   SAFE ADD-ON — DOES NOT REPLACE EXISTING APP CODE
========================================================= */

(function () {

    const drawerStyle = document.createElement("style");

    drawerStyle.textContent = `
        #nexoraDrawerOverlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.25s ease, visibility 0.25s ease;
            z-index: 9998;
        }

        #nexoraDrawerOverlay.open {
            opacity: 1;
            visibility: visible;
        }

        #nexoraSideDrawer {
            position: fixed;
            top: 0;
            left: 0;
            width: min(330px, 86vw);
            height: 100vh;
            background:
                linear-gradient(
                    180deg,
                    rgba(12, 18, 34, 0.99),
                    rgba(5, 9, 18, 0.99)
                );
            border-right: 1px solid rgba(80, 105, 255, 0.25);
            box-shadow: 15px 0 45px rgba(0, 0, 0, 0.45);
            transform: translateX(-105%);
            transition: transform 0.28s ease;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        #nexoraSideDrawer.open {
            transform: translateX(0);
        }

        #nexoraDrawerHeader {
            height: 72px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 18px;
            border-bottom: 1px solid rgba(100, 120, 180, 0.14);
        }

        #nexoraDrawerBrand {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #ffffff;
            font-weight: 800;
            letter-spacing: 0.7px;
        }

        #nexoraDrawerBrandIcon {
            width: 36px;
            height: 36px;
            border-radius: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #315cff, #713dff);
            color: #fff;
            font-weight: 800;
            box-shadow: 0 0 20px rgba(65, 91, 255, 0.28);
        }

        #nexoraCloseDrawer {
            width: 38px;
            height: 38px;
            border: 0;
            border-radius: 11px;
            background: rgba(255, 255, 255, 0.05);
            color: #aeb8d0;
            font-size: 20px;
            cursor: pointer;
        }

        #nexoraCloseDrawer:hover {
            background: rgba(255, 255, 255, 0.09);
            color: #ffffff;
        }

        #nexoraNewChat {
            margin: 18px;
            padding: 14px 16px;
            border: 1px solid rgba(91, 112, 255, 0.28);
            border-radius: 13px;
            background: linear-gradient(
                135deg,
                rgba(49, 92, 255, 0.18),
                rgba(113, 61, 255, 0.15)
            );
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
        }

        #nexoraNewChat:hover {
            background: linear-gradient(
                135deg,
                rgba(49, 92, 255, 0.28),
                rgba(113, 61, 255, 0.24)
            );
        }

        #nexoraConversationHeading {
            padding: 0 18px 10px;
            color: #66738b;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.3px;
            text-transform: uppercase;
        }

        #nexoraConversationList {
            flex: 1;
            overflow-y: auto;
            padding: 0 10px 15px;
        }

        .nexora-conversation-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            padding: 12px 10px;
            border-radius: 11px;
            color: #b8c1d5;
            cursor: pointer;
            transition: background 0.18s ease, color 0.18s ease;
        }

        .nexora-conversation-item:hover {
            background: rgba(75, 98, 255, 0.10);
            color: #ffffff;
        }

        .nexora-conversation-item.active {
            background: rgba(75, 98, 255, 0.16);
            color: #ffffff;
        }

        .nexora-conversation-title {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-size: 13px;
        }

        .nexora-delete-chat {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            border: 0;
            border-radius: 8px;
            background: transparent;
            color: #657087;
            cursor: pointer;
            opacity: 0;
        }

        .nexora-conversation-item:hover .nexora-delete-chat {
            opacity: 1;
        }

        .nexora-delete-chat:hover {
            background: rgba(255, 70, 90, 0.12);
            color: #ff7180;
        }

        #nexoraDrawerEmpty {
            padding: 25px 15px;
            text-align: center;
            color: #657087;
            font-size: 13px;
        }

        #nexoraDrawerProfile {
            flex-shrink: 0;
            margin: 10px;
            padding: 13px;
            border-top: 1px solid rgba(100, 120, 180, 0.14);
            color: #9aa6bd;
            font-size: 12px;
        }

        #nexoraDrawerProfile strong {
            display: block;
            margin-top: 3px;
            color: #ffffff;
            font-size: 13px;
        }

        #nexoraMenuButton {
            position: fixed;
            top: 18px;
            left: 18px;
            z-index: 9000;
            width: 42px;
            height: 42px;
            border: 1px solid rgba(100, 120, 180, 0.18);
            border-radius: 12px;
            background: rgba(8, 13, 24, 0.86);
            color: #ffffff;
            font-size: 20px;
            cursor: pointer;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }

        #nexoraMenuButton:hover {
            border-color: rgba(80, 105, 255, 0.45);
            background: rgba(20, 28, 50, 0.95);
        }

        @media (min-width: 850px) {
            #nexoraMenuButton {
                display: none;
            }
        }

        @media (max-width: 849px) {
            .header {
                padding-left: 72px !important;
            }
        }
    `;

    document.head.appendChild(drawerStyle);


    /* =====================================================
       CREATE DRAWER
    ===================================================== */

    const menuButton = document.createElement("button");
    menuButton.id = "nexoraMenuButton";
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", "Open conversations");
    menuButton.textContent = "☰";

    const overlay = document.createElement("div");
    overlay.id = "nexoraDrawerOverlay";

    const drawer = document.createElement("aside");
    drawer.id = "nexoraSideDrawer";

    drawer.innerHTML = `
        <div id="nexoraDrawerHeader">
            <div id="nexoraDrawerBrand">
                <div id="nexoraDrawerBrandIcon">N</div>
                <span>NEXORA</span>
            </div>

            <button
                id="nexoraCloseDrawer"
                type="button"
                aria-label="Close conversations"
            >×</button>
        </div>

        <button id="nexoraNewChat" type="button">
            ＋ New Chat
        </button>

        <div id="nexoraConversationHeading">
            Recent conversations
        </div>

        <div id="nexoraConversationList">
            <div id="nexoraDrawerEmpty">
                No conversations yet
            </div>
        </div>

        <div id="nexoraDrawerProfile">
            Signed in as
            <strong id="nexoraDrawerUsername">Guest</strong>
        </div>
    `;

    document.body.appendChild(menuButton);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);


    /* =====================================================
       OPEN / CLOSE
    ===================================================== */

    function openDrawer() {
        drawer.classList.add("open");
        overlay.classList.add("open");
        loadDrawerConversations();
    }

    function closeDrawer() {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
    }

    menuButton.addEventListener("click", openDrawer);

    overlay.addEventListener("click", closeDrawer);

    document
        .getElementById("nexoraCloseDrawer")
        .addEventListener("click", closeDrawer);


    /* =====================================================
       CONVERSATIONS
    ===================================================== */

    async function loadDrawerConversations() {

        const username =
            localStorage.getItem("nexora_username");

        const list =
            document.getElementById(
                "nexoraConversationList"
            );

        const drawerUsername =
            document.getElementById(
                "nexoraDrawerUsername"
            );

        if (drawerUsername) {
            drawerUsername.textContent =
                username || "Guest";
        }

        if (!username) {
            list.innerHTML = `
                <div id="nexoraDrawerEmpty">
                    Sign in to see your conversations
                </div>
            `;
            return;
        }

        list.innerHTML = `
            <div id="nexoraDrawerEmpty">
                Loading conversations...
            </div>
        `;

        try {

            const response = await fetch(
                `${API_URL}/conversations?username=${encodeURIComponent(username)}`
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(
                    data.message || "Unable to load conversations"
                );
            }

            renderDrawerConversations(
                data.conversations || []
            );

        } catch (error) {

            console.error(
                "NEXORA drawer error:",
                error
            );

            list.innerHTML = `
                <div id="nexoraDrawerEmpty">
                    Could not load conversations
                </div>
            `;
        }
    }


    function renderDrawerConversations(conversations) {

        const list =
            document.getElementById(
                "nexoraConversationList"
            );

        if (!conversations.length) {

            list.innerHTML = `
                <div id="nexoraDrawerEmpty">
                    No conversations yet
                </div>
            `;

            return;
        }

        const currentConversationId =
            localStorage.getItem(
                "nexora_conversation_id"
            );

        list.innerHTML = "";

        conversations.forEach(
            conversation => {

                const item =
                    document.createElement("div");

                item.className =
                    "nexora-conversation-item";

                if (
                    String(conversation.id) ===
                    String(currentConversationId)
                ) {
                    item.classList.add("active");
                }

                const title =
                    document.createElement("div");

                title.className =
                    "nexora-conversation-title";

                title.textContent =
                    conversation.title ||
                    "New chat";

                const deleteButton =
                    document.createElement("button");

                deleteButton.className =
                    "nexora-delete-chat";

                deleteButton.type =
                    "button";

                deleteButton.textContent =
                    "×";

                deleteButton.title =
                    "Delete conversation";

                deleteButton.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();

                        await deleteConversation(
                            conversation.id
                        );
                    }
                );

                item.addEventListener(
                    "click",
                    () => {

                        loadConversation(
                            conversation.id
                        );
                    }
                );

                item.appendChild(title);
                item.appendChild(deleteButton);

                list.appendChild(item);
            }
        );
    }


    /* =====================================================
       LOAD CONVERSATION
    ===================================================== */

    async function loadConversation(
        conversationId
    ) {

        const username =
            localStorage.getItem(
                "nexora_username"
            );

        if (!username) {
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/conversations/${encodeURIComponent(conversationId)}?username=${encodeURIComponent(username)}`
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Conversation not found"
                );
            }

            localStorage.setItem(
                "nexora_conversation_id",
                conversationId
            );

            if (
                typeof window.loadConversationMessages ===
                "function"
            ) {

                window.loadConversationMessages(
                    data.messages || []
                );

            } else {

                const chatBox =
                    document.getElementById(
                        "chatBox"
                    );

                if (chatBox) {

                    chatBox.innerHTML = "";

                    (data.messages || [])
                        .forEach(message => {

                            if (
                                typeof window.addMessage ===
                                "function"
                            ) {

                                window.addMessage(
                                    message.role,
                                    message.content,
                                    message.image_url
                                );
                            }

                        });
                }
            }

            closeDrawer();

        } catch (error) {

            console.error(
                "NEXORA conversation load error:",
                error
            );

            alert(
                "Could not load this conversation."
            );
        }
    }


    /* =====================================================
       NEW CHAT
    ===================================================== */

    document
        .getElementById("nexoraNewChat")
        .addEventListener(
            "click",
            async () => {

                const username =
                    localStorage.getItem(
                        "nexora_username"
                    );

                if (!username) {
                    return;
                }

                try {

                    const response =
                        await fetch(
                            `${API_URL}/conversations/new`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body: JSON.stringify({
                                    username:
                                        username,
                                    title:
                                        "New chat"
                                })
                            }
                        );

                    const data =
                        await response.json();

                    if (!data.success) {
                        throw new Error(
                            data.message ||
                            "Could not create chat"
                        );
                    }

                    const id =
                        data.conversation.id;

                    localStorage.setItem(
                        "nexora_conversation_id",
                        id
                    );

                    const chatBox =
                        document.getElementById(
                            "chatBox"
                        );

                    if (chatBox) {
                        chatBox.innerHTML = "";
                    }

                    closeDrawer();

                    loadDrawerConversations();

                } catch (error) {

                    console.error(
                        "NEXORA new chat error:",
                        error
                    );

                    alert(
                        "Could not create a new chat."
                    );
                }
            }
        );


    /* =====================================================
       DELETE CONVERSATION
    ===================================================== */

    async function deleteConversation(
        conversationId
    ) {

        const username =
            localStorage.getItem(
                "nexora_username"
            );

        if (!username) {
            return;
        }

        if (
            !confirm(
                "Delete this conversation?"
            )
        ) {
            return;
        }

        try {

            const response =
                await fetch(
                    `${API_URL}/conversations/${encodeURIComponent(conversationId)}?username=${encodeURIComponent(username)}`,
                    {
                        method: "DELETE"
                    }
                );

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Could not delete conversation"
                );
            }

            if (
                String(
                    localStorage.getItem(
                        "nexora_conversation_id"
                    )
                ) ===
                String(conversationId)
            ) {

                localStorage.removeItem(
                    "nexora_conversation_id"
                );

                const chatBox =
                    document.getElementById(
                        "chatBox"
                    );

                if (chatBox) {
                    chatBox.innerHTML = "";
                }
            }

            loadDrawerConversations();

        } catch (error) {

            console.error(
                "NEXORA delete conversation error:",
                error
            );

            alert(
                "Could not delete this conversation."
            );
        }
    }


    /* =====================================================
       SWIPE GESTURES
    ===================================================== */

    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener(
        "touchstart",
        event => {

            if (!event.touches.length) {
                return;
            }

            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;
        },
        { passive: true }
    );

    document.addEventListener(
        "touchend",
        event => {

            if (!event.changedTouches.length) {
                return;
            }

            const endX =
                event.changedTouches[0].clientX;

            const endY =
                event.changedTouches[0].clientY;

            const deltaX =
                endX - touchStartX;

            const deltaY =
                Math.abs(endY - touchStartY);

            if (deltaY > 80) {
                return;
            }

            if (
                !drawer.classList.contains("open") &&
                touchStartX < 35 &&
                deltaX > 70
            ) {

                openDrawer();
            }

            if (
                drawer.classList.contains("open") &&
                deltaX < -70
            ) {

                closeDrawer();
            }
        },
        { passive: true }
    );


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                drawer.classList.contains("open")
            ) {
                closeDrawer();
            }
        }
    );


})();