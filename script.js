/* ===============================
   NEXORA USER SYSTEM
================================ */

const authScreen = document.getElementById("authScreen");
const app = document.getElementById("app");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword =
    document.getElementById("signupConfirmPassword");

const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

const authMessage = document.getElementById("authMessage");

/* ===============================
   CHAT ELEMENTS
================================ */

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearButton");

/* ===============================
   PROFILE ELEMENTS
================================ */

const profileButton = document.getElementById("profileButton");
const profilePanel = document.getElementById("profilePanel");
const closeProfileButton =
    document.getElementById("closeProfileButton");
const profileUsername =
    document.getElementById("profileUsername");
const conversationCount =
    document.getElementById("conversationCount");
const logoutButton = document.getElementById("logoutButton");

/* ===============================
   AUTH TABS
================================ */

loginTab.addEventListener("click", function() {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    authMessage.textContent = "";
});

signupTab.addEventListener("click", function() {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    authMessage.textContent = "";
});

/* ===============================
   SIGN UP
================================ */

signupButton.addEventListener("click", async function() {

    const username = signupUsername.value.trim();
    const password = signupPassword.value;
    const confirmPassword = signupConfirmPassword.value;

    if (!username || !password || !confirmPassword) {
        authMessage.textContent =
            "Please fill in all fields.";
        return;
    }

    if (password !== confirmPassword) {
        authMessage.textContent =
            "Passwords do not match.";
        return;
    }

    if (username.length < 3) {
        authMessage.textContent =
            "Username must be at least 3 characters.";
        return;
    }

    if (password.length < 6) {
        authMessage.textContent =
            "Password must be at least 6 characters.";
        return;
    }

    signupButton.disabled = true;
    authMessage.textContent =
        "Creating account...";

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            authMessage.textContent =
                data.message ||
                "Could not create account.";
            return;
        }

        authMessage.textContent =
            "Account created! You can now log in.";

        signupUsername.value = "";
        signupPassword.value = "";
        signupConfirmPassword.value = "";

        loginTab.click();
        loginUsername.value = username;

    } catch (error) {

        authMessage.textContent =
            "⚠️ Cannot connect to NEXORA server.";

        console.error("Signup error:", error);

    } finally {

        signupButton.disabled = false;
    }
});

/* ===============================
   LOGIN
================================ */

loginButton.addEventListener("click", async function() {

    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (!username || !password) {
        authMessage.textContent =
            "Enter your username and password.";
        return;
    }

    loginButton.disabled = true;
    authMessage.textContent = "Logging in...";

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            authMessage.textContent =
                data.message ||
                "Login failed.";
            return;
        }

        localStorage.setItem(
            "nexora_user",
            data.username || username
        );

        authScreen.classList.add("hidden");
        app.classList.remove("hidden");

        loginPassword.value = "";
        authMessage.textContent = "";

        messageInput.focus();

    } catch (error) {

        authMessage.textContent =
            "⚠️ Cannot connect to NEXORA server.";

        console.error("Login error:", error);

    } finally {

        loginButton.disabled = false;
    }
});

/* ===============================
   GET CURRENT USER
================================ */

function getCurrentUser() {
    return localStorage.getItem("nexora_user");
}

/* ===============================
   CHECK LOGIN
================================ */

function checkLogin() {

    const savedUser = getCurrentUser();

    if (savedUser) {

        authScreen.classList.add("hidden");
        app.classList.remove("hidden");

    } else {

        authScreen.classList.remove("hidden");
        app.classList.add("hidden");
    }
}

/* ===============================
   PROFILE
================================ */

async function openProfile() {

    const username = getCurrentUser();

    if (!username) return;

    profileUsername.textContent = username;

    profilePanel.classList.remove("hidden");

    conversationCount.textContent = "Loading...";

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/profile?username=" +
            encodeURIComponent(username)
        );

        const data = await response.json();

        if (response.ok) {

            conversationCount.textContent =
                data.conversation_count ?? 0;

        } else {

            conversationCount.textContent = "0";
        }

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        conversationCount.textContent = "0";
    }
}

/* ===============================
   OPEN PROFILE BUTTON
================================ */

if (profileButton) {

    profileButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            openProfile();
        }
    );
}

/* ===============================
   CLOSE PROFILE
================================ */

if (closeProfileButton) {

    closeProfileButton.addEventListener(
        "click",
        function() {

            profilePanel.classList.add("hidden");
        }
    );
}

/* ===============================
   LOGOUT
================================ */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "nexora_user"
            );

            profilePanel.classList.add(
                "hidden"
            );

            app.classList.add("hidden");

            authScreen.classList.remove(
                "hidden"
            );

            chatBox.innerHTML = `
                <div class="welcome">
                    <div class="welcome-icon">✦</div>
                    <h2>Hello, I'm NEXORA.</h2>
                    <p>
                        Your intelligent AI assistant.
                        Ask me anything and let's get started.
                    </p>
                </div>
            `;

            loginPassword.value = "";

            messageInput.value = "";

            loginTab.click();
        }
    );
}

/* ===============================
   CHAT FUNCTIONS
================================ */

function addMessage(text, sender) {

    const message =
        document.createElement("div");

    message.className =
        `message ${sender}`;

    message.textContent = text;

    chatBox.appendChild(message);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    return message;
}

async function typeMessage(element, text) {

    element.textContent = "";

    for (let i = 0; i < text.length; i++) {

        element.textContent += text[i];

        chatBox.scrollTop =
            chatBox.scrollHeight;

        await new Promise(resolve =>
            setTimeout(resolve, 20)
        );
    }
}

/* ===============================
   SEND MESSAGE
================================ */

async function sendMessage() {

    const message =
        messageInput.value.trim();

    if (!message) return;

    const username =
        getCurrentUser();

    if (!username) {

        authScreen.classList.remove(
            "hidden"
        );

        app.classList.add("hidden");

        return;
    }

    addMessage(
        message,
        "user"
    );

    messageInput.value = "";

    const thinkingMessage =
        addMessage(
            "NEXORA is thinking...",
            "ai"
        );

    sendButton.disabled = true;
    messageInput.disabled = true;

    try {

        const API_URL = "https://nexora-ai-9jgj.onrender.com";
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    username: username
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            thinkingMessage.textContent =
                data.reply ||
                data.message ||
                "⚠️ Something went wrong.";

            return;
        }

        await typeMessage(
            thinkingMessage,
            data.reply ||
            "I didn't get a response."
        );

    } catch (error) {

        thinkingMessage.textContent =
            "⚠️ NEXORA can't connect to the server.";

        console.error(
            "NEXORA error:",
            error
        );

    } finally {

        sendButton.disabled = false;
        messageInput.disabled = false;

        messageInput.focus();
    }
}

/* ===============================
   SEND BUTTON
================================ */

sendButton.addEventListener(
    "click",
    sendMessage
);

/* ===============================
   ENTER KEY
================================ */

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            sendMessage();
        }
    }
);

/* ===============================
   CLEAR CHAT
================================ */

clearButton.addEventListener(
    "click",
    async function() {

        const username =
            getCurrentUser();

        try {

            await fetch(
                "http://127.0.0.1:5000/clear",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        username: username
                    })
                }
            );

        } catch (error) {

            console.error(
                "Could not clear server memory:",
                error
            );
        }

        chatBox.innerHTML = `
            <div class="welcome">
                <div class="welcome-icon">✦</div>
                <h2>Hello, I'm NEXORA.</h2>
                <p>
                    Your intelligent AI assistant.
                    Ask me anything and let's get started.
                </p>
            </div>
        `;

        messageInput.focus();
    }
);

/* ===============================
   START NEXORA
================================ */

checkLogin();