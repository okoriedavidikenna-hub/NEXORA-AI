const API_URL = "https://nexora-ai-9jgj.onrender.com";

// ===============================
// AUTH ELEMENTS
// ===============================

const authScreen = document.getElementById("authScreen");
const app = document.getElementById("app");

const loginScreen = document.getElementById("loginScreen");
const signupScreen = document.getElementById("signupScreen");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");

const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

const showSignupButton = document.getElementById("showSignupButton");
const showLoginButton = document.getElementById("showLoginButton");

const authMessage = document.getElementById("authMessage");

// ===============================
// APP ELEMENTS
// ===============================

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const clearButton = document.getElementById("clearButton");

const profileButton = document.getElementById("profileButton");
const profilePanel = document.getElementById("profilePanel");
const closeProfileButton = document.getElementById("closeProfileButton");

const profileUsername = document.getElementById("profileUsername");
const conversationCount = document.getElementById("conversationCount");

const logoutButton = document.getElementById("logoutButton");

// ===============================
// AUTH SCREEN SWITCHING
// ===============================

showSignupButton.addEventListener("click", () => {
    loginScreen.classList.add("hidden");
    signupScreen.classList.remove("hidden");
    authMessage.textContent = "";
});

showLoginButton.addEventListener("click", () => {
    signupScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    authMessage.textContent = "";
});

// ===============================
// AUTH MESSAGE
// ===============================

function showAuthMessage(message, success = false) {
    authMessage.textContent = message;

    if (success) {
        authMessage.style.color = "#6dff9c";
    } else {
        authMessage.style.color = "#ff6b6b";
    }
}

// ===============================
// SIGN UP
// ===============================

signupButton.addEventListener("click", signup);

async function signup() {
    const username = signupUsername.value.trim();
    const password = signupPassword.value;
    const confirmPassword = signupConfirmPassword.value;

    if (!username || !password || !confirmPassword) {
        showAuthMessage("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage("Passwords do not match.");
        return;
    }

    if (password.length < 4) {
        showAuthMessage("Password must be at least 4 characters.");
        return;
    }

    signupButton.disabled = true;
    signupButton.textContent = "Creating...";

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showAuthMessage(data.error || "Signup failed.");
            return;
        }

        showAuthMessage("Account created successfully!", true);

        signupUsername.value = "";
        signupPassword.value = "";
        signupConfirmPassword.value = "";

        setTimeout(() => {
            signupScreen.classList.add("hidden");
            loginScreen.classList.remove("hidden");
            authMessage.textContent = "";
        }, 800);

    } catch (error) {
        console.error(error);
        showAuthMessage("Unable to connect to NEXORA.");
    } finally {
        signupButton.disabled = false;
        signupButton.textContent = "Create Account";
    }
}

// ===============================
// LOGIN
// ===============================

loginButton.addEventListener("click", login);

async function login() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (!username || !password) {
        showAuthMessage("Enter your username and password.");
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showAuthMessage(data.error || "Login failed.");
            return;
        }

        localStorage.setItem("nexora_user", data.username);

        loginUsername.value = "";
        loginPassword.value = "";

        checkLogin();

    } catch (error) {
        console.error(error);
        showAuthMessage("Unable to connect to NEXORA.");
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
}

// ===============================
// CURRENT USER
// ===============================

function getCurrentUser() {
    return localStorage.getItem("nexora_user");
}

// ===============================
// CHECK LOGIN
// ===============================

function checkLogin() {
    const username = getCurrentUser();

    if (username) {
        authScreen.classList.add("hidden");
        app.classList.remove("hidden");

        profileUsername.textContent = username;

        loadProfile();
        loadHistory();
    } else {
        authScreen.classList.remove("hidden");
        app.classList.add("hidden");
    }
}

// ===============================
// PROFILE
// ===============================

profileButton.addEventListener("click", () => {
    profilePanel.classList.toggle("hidden");
    loadProfile();
});

closeProfileButton.addEventListener("click", () => {
    profilePanel.classList.add("hidden");
});

async function loadProfile() {
    const username = getCurrentUser();

    if (!username) return;

    try {
        const response = await fetch(
            `${API_URL}/profile?username=${encodeURIComponent(username)}`
        );

        const data = await response.json();

        if (response.ok) {
            profileUsername.textContent = data.username || username;

            conversationCount.textContent =
                data.conversation_count ?? 0;
        }

    } catch (error) {
        console.error("Profile error:", error);
    }
}

// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("nexora_user");

    chatBox.innerHTML = `
        <div class="welcome">
            <div class="welcome-icon">✦</div>
            <h2>Hello, I'm NEXORA.</h2>
            <p>Your intelligent AI assistant. Ask me anything and let's get started.</p>
        </div>
    `;

    profilePanel.classList.add("hidden");

    checkLogin();
});

// ===============================
// ADD TEXT MESSAGE
// ===============================

function addMessage(text, sender) {
    const message = document.createElement("div");

    message.className = `message ${sender}`;

    message.textContent = text;

    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;

    return message;
}

// ===============================
// ADD IMAGE MESSAGE
// ===============================

function addImageMessage(imageUrl, prompt = "") {
    const message = document.createElement("div");

    message.className = "message ai image-message";

    const image = document.createElement("img");

    image.className = "generated-image";

    image.src = imageUrl;

    image.alt = prompt || "Generated image by NEXORA AI";

    image.loading = "lazy";

    image.addEventListener("load", () => {
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    image.addEventListener("error", () => {
        image.remove();

        const errorText = document.createElement("p");
        errorText.textContent = "NEXORA generated an image, but it could not be displayed.";

        message.appendChild(errorText);
    });

    message.appendChild(image);

    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;

    return message;
}

// ===============================
// TYPE AI MESSAGE
// ===============================

async function typeMessage(element, text) {
    element.textContent = "";

    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];

        chatBox.scrollTop = chatBox.scrollHeight;

        await new Promise(resolve => setTimeout(resolve, 8));
    }
}

// ===============================
// SEND MESSAGE
// ===============================

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = messageInput.value.trim();
    const username = getCurrentUser();

    if (!message || !username) return;

    // Show user message
    addMessage(message, "user");

    messageInput.value = "";

    sendButton.disabled = true;
    messageInput.disabled = true;

    // Thinking message
    const thinkingMessage = addMessage("NEXORA is thinking...", "ai");

    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                message: message
            })
        });

        const data = await response.json();

        // Remove thinking message
        thinkingMessage.remove();

        if (!response.ok) {
            addMessage(
                data.error || "Something went wrong.",
                "ai"
            );

            return;
        }

        // =========================
        // IMAGE RESPONSE
        // =========================

        if (data.image_generated && data.image_url) {

            if (data.reply) {
                const replyMessage = addMessage("", "ai");

                await typeMessage(
                    replyMessage,
                    data.reply
                );
            }

            addImageMessage(
                data.image_url,
                data.image_prompt || message
            );

        } else {

            // =========================
            // NORMAL TEXT RESPONSE
            // =========================

            const aiMessage = addMessage("", "ai");

            await typeMessage(
                aiMessage,
                data.reply || "I couldn't generate a response."
            );
        }

        loadProfile();

    } catch (error) {
        console.error("Chat error:", error);

        thinkingMessage.remove();

        addMessage(
            "I couldn't connect to NEXORA's server.",
            "ai"
        );

    } finally {
        sendButton.disabled = false;
        messageInput.disabled = false;

        messageInput.focus();
    }
}

// ===============================
// CLEAR CHAT
// ===============================

clearButton.addEventListener("click", clearChat);

async function clearChat() {
    const username = getCurrentUser();

    if (!username) return;

    try {
        const response = await fetch(`${API_URL}/clear`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username
            })
        });

        const data = await response.json();

        if (!response.ok) {
            addMessage(
                data.error || "Unable to clear conversation.",
                "ai"
            );

            return;
        }

        chatBox.innerHTML = `
            <div class="welcome">
                <div class="welcome-icon">✦</div>
                <h2>Hello, I'm NEXORA.</h2>
                <p>Your intelligent AI assistant. Ask me anything and let's get started.</p>
            </div>
        `;

        loadProfile();

    } catch (error) {
        console.error("Clear error:", error);

        addMessage(
            "Unable to connect to NEXORA.",
            "ai"
        );
    }
}

// ===============================
// LOAD HISTORY
// ===============================

async function loadHistory() {
    const username = getCurrentUser();

    if (!username) return;

    try {
        const response = await fetch(
            `${API_URL}/history?username=${encodeURIComponent(username)}`
        );

        const data = await response.json();

        if (!response.ok || !Array.isArray(data.history)) {
            return;
        }

        if (data.history.length === 0) {
            return;
        }

        chatBox.innerHTML = "";

        for (const item of data.history) {

            if (item.user) {
                addMessage(item.user, "user");
            }

            if (item.assistant) {
                addMessage(item.assistant, "ai");
            }
        }

    } catch (error) {
        console.error("History error:", error);
    }
}

// ===============================
// START APP
// ===============================

checkLogin();