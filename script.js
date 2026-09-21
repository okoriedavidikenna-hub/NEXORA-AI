/* =========================================================
   NEXORA AI
   MAIN JAVASCRIPT — VERSION 12
   ========================================================= */

const API_URL = "https://nexora-ai-9jgj.onrender.com";


/* =========================================================
   SPLASH
   ========================================================= */

const splashScreen =
    document.getElementById("splashScreen");

if (splashScreen) {

    window.addEventListener("load", () => {

        setTimeout(() => {

            splashScreen.classList.add("hide");

            setTimeout(() => {
                splashScreen.style.display = "none";
            }, 750);

        }, 2200);

    });

}


/* =========================================================
   AUTH
   ========================================================= */

const authScreen =
    document.getElementById("authScreen");

const appScreen =
    document.getElementById("app");

const loginScreen =
    document.getElementById("loginScreen");

const signupScreen =
    document.getElementById("signupScreen");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupPassword =
    document.getElementById("signupPassword");

const loginBtn =
    document.getElementById("loginBtn");

const signupBtn =
    document.getElementById("signupBtn");

const showSignup =
    document.getElementById("showSignup");

const showLogin =
    document.getElementById("showLogin");

const authMessage =
    document.getElementById("authMessage");


/* =========================================================
   APP ELEMENTS
   ========================================================= */

const menuBtn =
    document.getElementById("menuBtn");

const closeDrawer =
    document.getElementById("closeDrawer");

const drawer =
    document.getElementById("drawer");

const drawerOverlay =
    document.getElementById("drawerOverlay");

const newChatBtn =
    document.getElementById("newChatBtn");

const conversationList =
    document.getElementById("conversationList");

const messages =
    document.getElementById("messages");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const voiceBtn =
    document.getElementById("voiceBtn");


/* =========================================================
   PROFILE
   ========================================================= */

const profileBtn =
    document.getElementById("profileBtn");

const topProfileBtn =
    document.getElementById("topProfileBtn");

const profileModal =
    document.getElementById("profileModal");

const closeProfileModal =
    document.getElementById("closeProfileModal");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileInitial =
    document.getElementById("profileInitial");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");


/* =========================================================
   MEMORY
   ========================================================= */

const memoryBtn =
    document.getElementById("memoryBtn");

const memoryModal =
    document.getElementById("memoryModal");

const closeMemoryModal =
    document.getElementById("closeMemoryModal");

const memoryContent =
    document.getElementById("memoryContent");

const clearMemoryBtn =
    document.getElementById("clearMemoryBtn");


/* =========================================================
   RENAME
   ========================================================= */

const renameModal =
    document.getElementById("renameModal");

const closeRenameModal =
    document.getElementById("closeRenameModal");

const renameConversationInput =
    document.getElementById(
        "renameConversationInput"
    );

const saveConversationNameBtn =
    document.getElementById(
        "saveConversationNameBtn"
    );


let conversationBeingRenamed = null;


/* =========================================================
   SWITCH ACCOUNT
   ========================================================= */

const switchAccountBtn =
    document.getElementById(
        "switchAccountBtn"
    );

const accountModal =
    document.getElementById("accountModal");

const closeAccountModal =
    document.getElementById(
        "closeAccountModal"
    );

const accountLoginBtn =
    document.getElementById(
        "accountLoginBtn"
    );

const accountSignupBtn =
    document.getElementById(
        "accountSignupBtn"
    );


/* =========================================================
   CONFIRMATION
   ========================================================= */

const confirmModal =
    document.getElementById("confirmModal");

const confirmTitle =
    document.getElementById("confirmTitle");

const confirmMessage =
    document.getElementById("confirmMessage");

const confirmCancel =
    document.getElementById("confirmCancel");

const confirmOkay =
    document.getElementById("confirmOkay");


/* =========================================================
   STATE
   ========================================================= */

let currentUser = null;
let currentConversation = null;
let conversations = [];

let isSending = false;


/* =========================================================
   USER-SPECIFIC STORAGE
   ========================================================= */

function getUserStorageKey() {

    if (!currentUser) {
        return "guest";
    }

    const email =
        currentUser.email ||
        "unknown";

    return email
        .toLowerCase()
        .replace(/[^a-z0-9@._-]/g, "_");
}


function getConversationStorageKey() {

    return `nexora_conversations_${getUserStorageKey()}`;
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveLocalData() {

    if (!currentUser) return;

    localStorage.setItem(
        "nexora_current_user",
        JSON.stringify(currentUser)
    );

    localStorage.setItem(
        getConversationStorageKey(),
        JSON.stringify(conversations)
    );

    /*
       Keep the old key too so existing users do not
       immediately lose their old conversations.
    */

    localStorage.setItem(
        "nexora_conversations",
        JSON.stringify(conversations)
    );
}


function loadUserConversations() {

    if (!currentUser) {
        conversations = [];
        return;
    }

    try {

        const userKey =
            getConversationStorageKey();

        const saved =
            localStorage.getItem(userKey);

        if (saved) {

            conversations =
                JSON.parse(saved);

            if (!Array.isArray(conversations)) {
                conversations = [];
            }

            return;
        }

        /*
           Migration for the old single-account storage.
        */

        const oldSaved =
            localStorage.getItem(
                "nexora_conversations"
            );

        if (oldSaved) {

            const oldConversations =
                JSON.parse(oldSaved);

            if (
                Array.isArray(oldConversations) &&
                oldConversations.length
            ) {

                conversations =
                    oldConversations;

                localStorage.setItem(
                    userKey,
                    JSON.stringify(conversations)
                );

                return;
            }
        }

        conversations = [];

    } catch (error) {

        console.error(
            "Conversation storage error:",
            error
        );

        conversations = [];
    }
}


function loadLocalData() {

    try {

        const savedUser =
            localStorage.getItem(
                "nexora_current_user"
            );

        if (savedUser) {

            currentUser =
                JSON.parse(savedUser);

            loadUserConversations();

        } else {

            currentUser = null;
            conversations = [];

        }

    } catch (error) {

        console.error(
            "Local storage error:",
            error
        );

        currentUser = null;
        conversations = [];
    }
}


/* =========================================================
   AUTH UI
   ========================================================= */

function showLoginForm() {

    if (loginScreen) {
        loginScreen.style.display = "block";
    }

    if (signupScreen) {
        signupScreen.style.display = "none";
    }

    clearAuthMessage();
}


function showSignupForm() {

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (signupScreen) {
        signupScreen.style.display = "block";
    }

    clearAuthMessage();
}


function clearAuthMessage() {

    if (authMessage) {
        authMessage.textContent = "";
    }
}


function showAuthMessage(message) {

    if (authMessage) {
        authMessage.textContent = message;
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser() {

    const email =
        loginEmail?.value.trim();

    const password =
        loginPassword?.value;

    if (!email || !password) {

        showAuthMessage(
            "Please enter your email and password."
        );

        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

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
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Login failed."
            );
        }

        currentUser =
            data.user || {
                email
            };

        loadUserConversations();

        currentConversation = null;

        saveLocalData();

        openApp();

    } catch (error) {

        console.error(error);

        showAuthMessage(
            error.message ||
            "Unable to login right now."
        );

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
}


/* =========================================================
   SIGNUP
   ========================================================= */

async function signupUser() {

    const name =
        signupName?.value.trim();

    const email =
        signupEmail?.value.trim();

    const password =
        signupPassword?.value;

    if (!name || !email || !password) {

        showAuthMessage(
            "Please complete all fields."
        );

        return;
    }

    if (password.length < 6) {

        showAuthMessage(
            "Password must be at least 6 characters."
        );

        return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent =
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
                        name,
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Signup failed."
            );
        }

        currentUser =
            data.user || {
                name,
                email
            };

        conversations = [];
        currentConversation = null;

        saveLocalData();

        openApp();

    } catch (error) {

        console.error(error);

        showAuthMessage(
            error.message ||
            "Unable to create account."
        );

    } finally {

        signupBtn.disabled = false;
        signupBtn.textContent = "Sign Up";
    }
}


/* =========================================================
   OPEN APP
   ========================================================= */

function openApp() {

    if (authScreen) {
        authScreen.style.display = "none";
    }

    if (appScreen) {
        appScreen.style.display = "flex";
    }

    updateProfileUI();

    renderConversations();

    if (!currentConversation) {

        if (conversations.length) {

            currentConversation =
                conversations[0];

            renderMessages();

        } else {

            createNewConversation();

        }

    } else {

        renderMessages();

    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    saveLocalData();

    currentUser = null;
    currentConversation = null;
    conversations = [];

    localStorage.removeItem(
        "nexora_current_user"
    );

    if (appScreen) {
        appScreen.style.display = "none";
    }

    if (authScreen) {
        authScreen.style.display = "flex";
    }

    showLoginForm();

    if (loginEmail) {
        loginEmail.value = "";
    }

    if (loginPassword) {
        loginPassword.value = "";
    }

    closeAllModals();
}


/* =========================================================
   SWITCH ACCOUNT
   ========================================================= */

function openAccountSwitcher() {

    closeDrawerMenu();

    if (accountModal) {
        accountModal.style.display = "flex";
    }
}


function closeAccountSwitcher() {

    if (accountModal) {
        accountModal.style.display = "none";
    }
}


function switchToLoginAccount() {

    saveLocalData();

    closeAccountSwitcher();

    currentUser = null;
    currentConversation = null;
    conversations = [];

    localStorage.removeItem(
        "nexora_current_user"
    );

    if (appScreen) {
        appScreen.style.display = "none";
    }

    if (authScreen) {
        authScreen.style.display = "flex";
    }

    showLoginForm();

    if (loginEmail) {
        loginEmail.value = "";
    }

    if (loginPassword) {
        loginPassword.value = "";
    }

    if (loginEmail) {
        setTimeout(() => {
            loginEmail.focus();
        }, 100);
    }
}


function switchToSignupAccount() {

    saveLocalData();

    closeAccountSwitcher();

    currentUser = null;
    currentConversation = null;
    conversations = [];

    localStorage.removeItem(
        "nexora_current_user"
    );

    if (appScreen) {
        appScreen.style.display = "none";
    }

    if (authScreen) {
        authScreen.style.display = "flex";
    }

    showSignupForm();

    if (signupName) {
        signupName.value = "";
    }

    if (signupEmail) {
        signupEmail.value = "";
    }

    if (signupPassword) {
        signupPassword.value = "";
    }

}


/* =========================================================
   CONVERSATIONS
   ========================================================= */

function createNewConversation() {

    const conversation = {

        id:
            Date.now().toString(),

        title:
            "New conversation",

        messages: [],

        createdAt:
            new Date().toISOString()

    };

    conversations.unshift(
        conversation
    );

    currentConversation =
        conversation;

    saveLocalData();

    renderConversations();

    renderMessages();
}


function loadConversation(id) {

    const conversation =
        conversations.find(
            item => item.id === id
        );

    if (!conversation) return;

    currentConversation =
        conversation;

    renderConversations();

    renderMessages();

    closeDrawerMenu();
}


/* =========================================================
   CONVERSATION RENDER
   ========================================================= */

function renderConversations() {

    if (!conversationList) return;

    conversationList.innerHTML = "";

    if (!conversations.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "conversation-empty";

        empty.textContent =
            "No conversations yet.";

        conversationList.appendChild(
            empty
        );

        return;
    }

    conversations.forEach(
        conversation => {

            const item =
                document.createElement("div");

            item.className =
                "conversation-item";

            if (
                currentConversation &&
                currentConversation.id ===
                    conversation.id
            ) {

                item.classList.add("active");
            }


            const button =
                document.createElement("button");

            button.className =
                "conversation-button";

            button.title =
                conversation.title ||
                "New conversation";

            const title =
                document.createElement("span");

            title.className =
                "conversation-title";

            title.textContent =
                conversation.title ||
                "New conversation";


            const renameButton =
                document.createElement("button");

            renameButton.className =
                "conversation-rename";

            renameButton.type =
                "button";

            renameButton.title =
                "Rename conversation";

            renameButton.textContent =
                "✏️";


            button.addEventListener(
                "click",
                () => {

                    loadConversation(
                        conversation.id
                    );

                }
            );


            renameButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openRenameConversation(
                        conversation.id
                    );

                }
            );


            item.appendChild(button);

            button.appendChild(title);

            item.appendChild(
                renameButton
            );

            conversationList.appendChild(
                item
            );

        }
    );
}


/* =========================================================
   RENAME CONVERSATION
   ========================================================= */

function openRenameConversation(id) {

    const conversation =
        conversations.find(
            item => item.id === id
        );

    if (!conversation) return;

    conversationBeingRenamed =
        conversation;

    if (renameConversationInput) {

        renameConversationInput.value =
            conversation.title ||
            "";

        renameConversationInput.focus();

        renameConversationInput.select();
    }

    if (renameModal) {
        renameModal.style.display =
            "flex";
    }
}


function closeRenameConversation() {

    conversationBeingRenamed = null;

    if (renameModal) {
        renameModal.style.display =
            "none";
    }
}


function saveConversationName() {

    if (!conversationBeingRenamed) {
        return;
    }

    const newName =
        renameConversationInput?.value.trim();

    if (!newName) {
        return;
    }

    conversationBeingRenamed.title =
        newName.substring(0, 80);

    saveLocalData();

    renderConversations();

    closeRenameConversation();
}


/* =========================================================
   CHAT
   ========================================================= */

function renderMessages() {

    if (!messages) return;

    messages.innerHTML = "";

    if (
        !currentConversation ||
        !Array.isArray(
            currentConversation.messages
        ) ||
        !currentConversation.messages.length
    ) {

        if (welcomeScreen) {
            welcomeScreen.style.display = "flex";
        }

        return;
    }

    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }

    currentConversation.messages.forEach(
        message => {

            addMessageToUI(
                message.role,
                message.content
            );

        }
    );
}


function addMessageToUI(
    role,
    content
) {

    if (!messages) return;

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${
            role === "user"
                ? "user"
                : "assistant"
        }`;


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        role === "user"
            ? getUserInitial()
            : "N";


    const contentBox =
        document.createElement("div");

    contentBox.className =
        "message-content";

    contentBox.textContent =
        content;


    if (role === "user") {

        wrapper.appendChild(
            contentBox
        );

        wrapper.appendChild(
            avatar
        );

    } else {

        wrapper.appendChild(
            avatar
        );

        wrapper.appendChild(
            contentBox
        );

    }


    messages.appendChild(
        wrapper
    );

    scrollToBottom();
}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    if (!messages) return;

    const container =
        document.getElementById(
            "chatContainer"
        );

    if (container) {

        requestAnimationFrame(() => {

            container.scrollTop =
                container.scrollHeight;

        });

    }
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    if (isSending) return;

    const text =
        messageInput?.value.trim();

    if (!text) return;

    if (!currentConversation) {
        createNewConversation();
    }

    isSending = true;

    messageInput.value = "";

    messageInput.style.height =
        "auto";

    if (welcomeScreen) {
        welcomeScreen.style.display =
            "none";
    }

    currentConversation.messages.push({

        role: "user",

        content: text

    });

    updateConversationTitle(text);

    addMessageToUI(
        "user",
        text
    );

    saveLocalData();

    showTypingIndicator();


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

                        message: text,

                        user:
                            currentUser || {},

                        conversation_id:
                            currentConversation.id

                    })
                }
            );


        const data =
            await response.json();


        removeTypingIndicator();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "NEXORA could not respond."
            );

        }


        const reply =
            data.response ||
            data.reply ||
            data.message ||
            "I couldn't generate a response.";


        currentConversation.messages.push({

            role: "assistant",

            content: reply

        });


        addMessageToUI(
            "assistant",
            reply
        );


        saveLocalData();


    } catch (error) {

        console.error(error);

        removeTypingIndicator();


        const errorMessage =
            "Sorry, I couldn't connect to NEXORA right now.";


        currentConversation.messages.push({

            role: "assistant",

            content: errorMessage

        });


        addMessageToUI(
            "assistant",
            errorMessage
        );


        saveLocalData();


    } finally {

        isSending = false;

    }
}


/* =========================================================
   AUTO TITLE
   ========================================================= */

function updateConversationTitle(text) {

    if (!currentConversation) return;

    if (
        currentConversation.title ===
        "New conversation"
    ) {

        let title =
            text.substring(0, 35);

        if (text.length > 35) {
            title += "...";
        }

        currentConversation.title =
            title;

        renderConversations();
    }
}


/* =========================================================
   TYPING
   ========================================================= */

function showTypingIndicator() {

    if (!messages) return;

    removeTypingIndicator();

    const typing =
        document.createElement("div");

    typing.id =
        "nexoraTyping";

    typing.className =
        "message assistant";

    typing.innerHTML = `
        <div class="message-avatar">N</div>
        <div class="message-content">
            NEXORA is thinking...
        </div>
    `;

    messages.appendChild(
        typing
    );

    scrollToBottom();
}


function removeTypingIndicator() {

    const typing =
        document.getElementById(
            "nexoraTyping"
        );

    if (typing) {
        typing.remove();
    }
}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawerMenu() {

    if (drawer) {
        drawer.classList.add("open");
    }

    if (drawerOverlay) {
        drawerOverlay.classList.add("open");
    }
}


function closeDrawerMenu() {

    if (drawer) {
        drawer.classList.remove("open");
    }

    if (drawerOverlay) {
        drawerOverlay.classList.remove("open");
    }
}


/* =========================================================
   PROFILE
   ========================================================= */

function getUserInitial() {

    const name =
        currentUser?.name ||
        currentUser?.email ||
        "U";

    return name
        .charAt(0)
        .toUpperCase();
}


function updateProfileUI() {

    if (!currentUser) return;

    const name =
        currentUser.name || "";

    const email =
        currentUser.email || "";


    if (profileName) {
        profileName.value = name;
    }

    if (profileEmail) {
        profileEmail.value = email;
    }

    if (profileInitial) {
        profileInitial.textContent =
            getUserInitial();
    }
}


function openProfile() {

    updateProfileUI();

    if (profileModal) {
        profileModal.style.display =
            "flex";
    }

    closeDrawerMenu();
}


function closeProfile() {

    if (profileModal) {
        profileModal.style.display =
            "none";
    }
}


function saveProfile() {

    if (!currentUser) return;

    const name =
        profileName?.value.trim();

    if (!name) return;

    currentUser.name =
        name;

    saveLocalData();

    updateProfileUI();

    closeProfile();
}


/* =========================================================
   MEMORY
   ========================================================= */

function openMemory() {

    closeDrawerMenu();

    if (!memoryModal) return;

    memoryModal.style.display =
        "flex";

    if (memoryContent) {

        memoryContent.textContent =
            "NEXORA's memory is connected to your account and conversation history.";

    }
}


function closeMemory() {

    if (memoryModal) {
        memoryModal.style.display =
            "none";
    }
}


function clearMemory() {

    localStorage.removeItem(
        getConversationStorageKey()
    );

    localStorage.removeItem(
        "nexora_conversations"
    );

    conversations = [];

    currentConversation = null;

    createNewConversation();

    closeMemory();
}


/* =========================================================
   CONFIRMATION
   ========================================================= */

function showConfirmation(
    title,
    message,
    callback
) {

    if (!confirmModal) return;

    confirmTitle.textContent =
        title;

    confirmMessage.textContent =
        message;

    confirmModal.style.display =
        "flex";


    confirmOkay.onclick = () => {

        confirmModal.style.display =
            "none";

        callback();

    };


    confirmCancel.onclick = () => {

        confirmModal.style.display =
            "none";

    };

}


/* =========================================================
   MODAL CLOSE
   ========================================================= */

function closeAllModals() {

    closeProfile();

    closeMemory();

    closeRenameConversation();

    closeAccountSwitcher();

    if (confirmModal) {
        confirmModal.style.display =
            "none";
    }
}


/* =========================================================
   VOICE
   ========================================================= */

let recognition = null;


function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        if (voiceBtn) {
            voiceBtn.style.display =
                "none";
        }

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";

    recognition.interimResults =
        false;

    recognition.continuous =
        false;


    recognition.onresult =
        event => {

            const transcript =
                event.results[0][0]
                    .transcript;


            if (messageInput) {

                messageInput.value =
                    transcript;

                messageInput.focus();

            }

        };


    recognition.onerror =
        error => {

            console.error(
                "Voice recognition:",
                error
            );

        };

}


function startVoiceInput() {

    if (!recognition) {
        setupVoiceRecognition();
    }

    if (recognition) {

        try {

            recognition.start();

        } catch (error) {

            console.log(
                "Voice already active."
            );

        }

    }

}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function setupSuggestions() {

    const suggestions =
        document.querySelectorAll(
            ".suggestion"
        );


    suggestions.forEach(
        suggestion => {

            suggestion.addEventListener(
                "click",
                () => {

                    if (messageInput) {

                        messageInput.value =
                            suggestion.textContent.trim();

                        messageInput.focus();

                    }

                }
            );

        }
    );

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        loginUser
    );

}


if (signupBtn) {

    signupBtn.addEventListener(
        "click",
        signupUser
    );

}


if (showSignup) {

    showSignup.addEventListener(
        "click",
        showSignupForm
    );

}


if (showLogin) {

    showLogin.addEventListener(
        "click",
        showLoginForm
    );

}


if (loginPassword) {

    loginPassword.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                loginUser();
            }

        }
    );

}


if (signupPassword) {

    signupPassword.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                signupUser();
            }

        }
    );

}


if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


if (messageInput) {

    messageInput.addEventListener(
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


    messageInput.addEventListener(
        "input",
        () => {

            messageInput.style.height =
                "auto";

            messageInput.style.height =
                Math.min(
                    messageInput.scrollHeight,
                    140
                ) + "px";

        }
    );

}


if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        startVoiceInput
    );

}


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        openDrawerMenu
    );

}


if (closeDrawer) {

    closeDrawer.addEventListener(
        "click",
        closeDrawerMenu
    );

}


if (drawerOverlay) {

    drawerOverlay.addEventListener(
        "click",
        closeDrawerMenu
    );

}


if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        () => {

            createNewConversation();

            closeDrawerMenu();

        }
    );

}


/* =========================================================
   PROFILE EVENTS
   ========================================================= */

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        openProfile
    );

}


if (topProfileBtn) {

    topProfileBtn.addEventListener(
        "click",
        openProfile
    );

}


if (closeProfileModal) {

    closeProfileModal.addEventListener(
        "click",
        closeProfile
    );

}


if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        saveProfile
    );

}


/* =========================================================
   MEMORY EVENTS
   ========================================================= */

if (memoryBtn) {

    memoryBtn.addEventListener(
        "click",
        openMemory
    );

}


if (closeMemoryModal) {

    closeMemoryModal.addEventListener(
        "click",
        closeMemory
    );

}


if (clearMemoryBtn) {

    clearMemoryBtn.addEventListener(
        "click",
        () => {

            showConfirmation(
                "Clear Memory",
                "Are you sure you want to clear your saved NEXORA conversations?",
                clearMemory
            );

        }
    );

}


/* =========================================================
   RENAME EVENTS
   ========================================================= */

if (closeRenameModal) {

    closeRenameModal.addEventListener(
        "click",
        closeRenameConversation
    );

}


if (saveConversationNameBtn) {

    saveConversationNameBtn.addEventListener(
        "click",
        saveConversationName
    );

}


if (renameConversationInput) {

    renameConversationInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                saveConversationName();

            }

        }
    );

}


/* =========================================================
   ACCOUNT SWITCHING EVENTS
   ========================================================= */

if (switchAccountBtn) {

    switchAccountBtn.addEventListener(
        "click",
        openAccountSwitcher
    );

}


if (closeAccountModal) {

    closeAccountModal.addEventListener(
        "click",
        closeAccountSwitcher
    );

}


if (accountLoginBtn) {

    accountLoginBtn.addEventListener(
        "click",
        switchToLoginAccount
    );

}


if (accountSignupBtn) {

    accountSignupBtn.addEventListener(
        "click",
        switchToSignupAccount
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            showConfirmation(
                "Logout",
                "Are you sure you want to logout?",
                logoutUser
            );

        }
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeApp() {

    loadLocalData();

    setupVoiceRecognition();

    setupSuggestions();


    if (currentUser) {

        openApp();

    } else {

        if (authScreen) {
            authScreen.style.display =
                "flex";
        }

        if (appScreen) {
            appScreen.style.display =
                "none";
        }

    }

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApp();

    }
);