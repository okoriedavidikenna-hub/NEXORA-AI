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
CONVERSATION DRAWER ELEMENTS
========================================================= */

const menuButton =
    document.getElementById("menuButton");

const sideDrawer =
    document.getElementById("sideDrawer");

const drawerOverlay =
    document.getElementById("drawerOverlay");

const closeDrawerButton =
    document.getElementById("closeDrawerButton");

const newChatButton =
    document.getElementById("newChatButton");

const conversationList =
    document.getElementById("conversationList");

const drawerProfileButton =
    document.getElementById("drawerProfileButton");


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

let currentConversationId =
    localStorage.getItem(
        "nexora_conversation_id"
    );

let conversationsCache = [];


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

showSignup?.addEventListener(
    "click",
    () => {
        showSignupScreen();
    }
);


showLogin?.addEventListener(
    "click",
    () => {
        showLoginScreen();
    }
);


/* =========================================================
SIGNUP
========================================================= */

signupForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            signupUsername.value.trim();

        const password =
            signupPassword.value.trim();

        const confirmPassword =
            signupConfirmPassword.value.trim();


        if (
            !username ||
            !password ||
            !confirmPassword
        ) {

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


            console.log(
                "SIGNUP STATUS:",
                response.status
            );

            console.log(
                "SIGNUP RESPONSE:",
                data
            );


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


            setTimeout(
                () => {

                    showLoginScreen();

                    if (loginUsername) {
                        loginUsername.value =
                            username;
                    }

                    if (authMessage) {
                        authMessage.textContent =
                            "Account created. You can now log in.";
                    }

                },
                700
            );


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

    }
);


/* =========================================================
LOGIN
========================================================= */

loginForm?.addEventListener(
    "submit",
    async (event) => {

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


            localStorage.removeItem(
                "nexora_conversation_id"
            );

            currentConversationId = null;


            if (authMessage) {
                authMessage.textContent =
                    "Login successful.";
            }


            setTimeout(
                () => {
                    showApp();
                },
                300
            );


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

    }
);


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

    loadProfile();

    loadConversations();

    if (currentConversationId) {

        loadConversation(
            currentConversationId
        );

    } else {

        openFirstConversationOrNew();

    }

}


/* =========================================================
PROFILE
========================================================= */

profileButton?.addEventListener(
    "click",
    () => {

        if (!profilePanel) {
            return;
        }

        const isHidden =
            profilePanel.classList.contains(
                "hidden"
            );


        if (isHidden) {

            profilePanel.classList.remove(
                "hidden"
            );

            profilePanel.style.display =
                "block";

            loadProfile();

        } else {

            profilePanel.classList.add(
                "hidden"
            );

            profilePanel.style.display =
                "none";
        }

    }
);


closeProfileButton?.addEventListener(
    "click",
    () => {

        if (!profilePanel) {
            return;
        }

        profilePanel.classList.add(
            "hidden"
        );

        profilePanel.style.display =
            "none";

    }
);


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

logoutButton?.addEventListener(
    "click",
    () => {

        stopSpeaking();
        stopListening();

        localStorage.removeItem(
            "nexora_username"
        );

        localStorage.removeItem(
            "nexora_conversation_id"
        );

        currentUser = null;
        currentConversationId = null;

        location.reload();

    }
);


/* =========================================================
DRAWER — OPEN
========================================================= */

function openDrawer() {

    if (!sideDrawer) {
        return;
    }

    sideDrawer.classList.add(
        "open"
    );

    if (drawerOverlay) {
        drawerOverlay.classList.add(
            "active"
        );
    }

    loadConversations();

}


/* =========================================================
DRAWER — CLOSE
========================================================= */

function closeDrawer() {

    if (!sideDrawer) {
        return;
    }

    sideDrawer.classList.remove(
        "open"
    );

    if (drawerOverlay) {
        drawerOverlay.classList.remove(
            "active"
        );
    }

}


/* =========================================================
DRAWER BUTTONS
========================================================= */

menuButton?.addEventListener(
    "click",
    openDrawer
);


closeDrawerButton?.addEventListener(
    "click",
    closeDrawer
);


drawerOverlay?.addEventListener(
    "click",
    closeDrawer
);


drawerProfileButton?.addEventListener(
    "click",
    () => {

        closeDrawer();

        if (profilePanel) {

            profilePanel.classList.remove(
                "hidden"
            );

            profilePanel.style.display =
                "block";
        }

        loadProfile();

    }
);


/* =========================================================
LOAD CONVERSATIONS
========================================================= */

async function loadConversations() {

    if (
        !currentUser ||
        !conversationList
    ) {
        return;
    }


    conversationList.innerHTML =
        `<div class="conversation-loading">
            Loading conversations...
        </div>`;


    try {

        const response =
            await fetch(
                `${API_URL}/conversations?username=${encodeURIComponent(currentUser)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !Array.isArray(
                data.conversations
            )
        ) {

            conversationList.innerHTML =
                `<div class="conversation-empty">
                    Couldn't load conversations.
                </div>`;

            return;
        }


        conversationsCache =
            data.conversations;


        renderConversations(
            conversationsCache
        );


        if (profileCount) {
            profileCount.textContent =
                conversationsCache.length;
        }


    } catch (error) {

        console.error(
            "Conversation loading error:",
            error
        );


        conversationList.innerHTML =
            `<div class="conversation-empty">
                Couldn't connect to NEXORA.
            </div>`;
    }

}


/* =========================================================
RENDER CONVERSATIONS
========================================================= */

function renderConversations(
    conversations
) {

    if (!conversationList) {
        return;
    }


    conversationList.innerHTML = "";


    if (
        !conversations ||
        conversations.length === 0
    ) {

        conversationList.innerHTML =
            `<div class="conversation-empty">
                No conversations yet.<br>
                Start a new chat with NEXORA.
            </div>`;

        return;
    }


    conversations.forEach(
        conversation => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "conversation-item";


            if (
                String(
                    conversation.id
                ) ===
                String(
                    currentConversationId
                )
            ) {

                item.classList.add(
                    "active"
                );
            }


            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "conversation-title";

            title.textContent =
                conversation.title ||
                "New chat";


            const date =
                document.createElement(
                    "div"
                );

            date.className =
                "conversation-date";

            date.textContent =
                formatConversationDate(
                    conversation.updated_at ||
                    conversation.created_at
                );


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "delete-conversation";

            deleteButton.type =
                "button";

            deleteButton.title =
                "Delete conversation";

            deleteButton.textContent =
                "🗑";


            deleteButton.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    await deleteConversation(
                        conversation.id
                    );

                }
            );


            item.appendChild(
                title
            );

            item.appendChild(
                date
            );

            item.appendChild(
                deleteButton
            );


            item.addEventListener(
                "click",
                () => {

                    loadConversation(
                        conversation.id
                    );

                }
            );


            conversationList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
FORMAT CONVERSATION DATE
========================================================= */

function formatConversationDate(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    const now =
        new Date();


    const sameDay =
        date.toDateString() ===
        now.toDateString();


    if (sameDay) {

        return date.toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    }


    return date.toLocaleDateString(
        [],
        {
            day: "numeric",
            month: "short"
        }
    );

}


/* =========================================================
LOAD ONE CONVERSATION
========================================================= */

async function loadConversation(
    conversationId
) {

    if (
        !currentUser ||
        !conversationId
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/conversations/${encodeURIComponent(conversationId)}?username=${encodeURIComponent(currentUser)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            addMessage(
                "I couldn't open that conversation.",
                "ai"
            );

            return;
        }


        currentConversationId =
            conversationId;


        localStorage.setItem(
            "nexora_conversation_id",
            conversationId
        );


        chatBox.innerHTML = "";


        const messages =
            Array.isArray(
                data.messages
            )
                ? data.messages
                : [];


        if (
            messages.length === 0
        ) {

            addMessage(
                "This is a new conversation. How can I help you?",
                "ai"
            );

        } else {

            messages.forEach(
                message => {

                    if (
                        message.role ===
                        "user"
                    ) {

                        addMessage(
                            message.content,
                            "user"
                        );

                    } else if (
                        message.role ===
                        "assistant"
                    ) {

                        addMessage(
                            message.content,
                            "ai"
                        );

                    }


                    if (
                        message.image_url
                    ) {

                        addImageMessage(
                            message.image_url,
                            message.image_prompt ||
                            ""
                        );
                    }

                }
            );

        }


        chatBox.scrollTop =
            chatBox.scrollHeight;


        closeDrawer();


        renderConversations(
            conversationsCache
        );


        stopSpeaking();


    } catch (error) {

        console.error(
            "Load conversation error:",
            error
        );


        addMessage(
            "I couldn't load that conversation.",
            "ai"
        );
    }

}


/* =========================================================
NEW CHAT
========================================================= */

newChatButton?.addEventListener(
    "click",
    createNewChat
);


async function createNewChat() {

    if (!currentUser) {
        return;
    }


    if (newChatButton) {
        newChatButton.disabled =
            true;
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
                            currentUser,

                        title:
                            "New chat"
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.conversation
        ) {

            throw new Error(
                "Could not create conversation"
            );
        }


        currentConversationId =
            data.conversation.id;


        localStorage.setItem(
            "nexora_conversation_id",
            currentConversationId
        );


        chatBox.innerHTML = "";


        addMessage(
            `Welcome to a new chat, ${currentUser}. How can I help you?`,
            "ai"
        );


        stopSpeaking();


        await loadConversations();


        closeDrawer();


        messageInput?.focus();


    } catch (error) {

        console.error(
            "New conversation error:",
            error
        );


        addMessage(
            "I couldn't create a new conversation.",
            "ai"
        );


    } finally {

        if (newChatButton) {
            newChatButton.disabled =
                false;
        }

    }

}


/* =========================================================
DELETE CONVERSATION
========================================================= */

async function deleteConversation(
    conversationId
) {

    if (
        !currentUser ||
        !conversationId
    ) {
        return;
    }


    const confirmed =
        window.confirm(
            "Delete this conversation?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/conversations/${encodeURIComponent(conversationId)}?username=${encodeURIComponent(currentUser)}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                "Delete failed"
            );
        }


        if (
            String(
                currentConversationId
            ) ===
            String(
                conversationId
            )
        ) {

            currentConversationId =
                null;


            localStorage.removeItem(
                "nexora_conversation_id"
            );


            chatBox.innerHTML = "";


            await openFirstConversationOrNew();

        }


        await loadConversations();

        await loadProfile();


    } catch (error) {

        console.error(
            "Delete conversation error:",
            error
        );


        alert(
            "I couldn't delete that conversation."
        );
    }

}


/* =========================================================
OPEN FIRST CONVERSATION OR CREATE ONE
========================================================= */

async function openFirstConversationOrNew() {

    if (!currentUser) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/conversations?username=${encodeURIComponent(currentUser)}`
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success &&
            Array.isArray(
                data.conversations
            ) &&
            data.conversations.length > 0
        ) {

            await loadConversation(
                data.conversations[0].id
            );

        } else {

            await createNewChat();

        }


    } catch (error) {

        console.error(
            "Opening first conversation error:",
            error
        );

    }

}


/* =========================================================
MESSAGE HELPERS
========================================================= */

function createMessageElement(
    text,
    sender
) {

    const wrapper =
        document.createElement(
            "div"
        );


    const isUser =
        sender === "user";


    wrapper.className =
        isUser
            ? "message user-message"
            : "message ai-message";


    if (!isUser) {

        const avatar =
            document.createElement(
                "div"
            );


        avatar.className =
            "message-avatar";


        avatar.textContent =
            "N";


        wrapper.appendChild(
            avatar
        );
    }


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    bubble.textContent =
        text || "";


    wrapper.appendChild(
        bubble
    );


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
        document.createElement(
            "div"
        );


    wrapper.className =
        "message ai-message nexora-typing-message";


    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        "message-avatar";


    avatar.textContent =
        "N";


    wrapper.appendChild(
        avatar
    );


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble nexora-typing-bubble";


    bubble.innerHTML =
        '<span class="typing-name">NEXORA</span> is typing<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';


    wrapper.appendChild(
        bubble
    );


    chatBox.appendChild(
        wrapper
    );


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
        setInterval(
            () => {

                dots++;

                if (dots > 3) {
                    dots = 0;
                }

                typingDots.textContent =
                    ".".repeat(dots);

            },
            250
        );


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
        document.createElement(
            "div"
        );


    wrapper.className =
        "message ai-message image-message";


    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        "message-avatar";


    avatar.textContent =
        "N";


    wrapper.appendChild(
        avatar
    );


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    const image =
        document.createElement(
            "img"
        );


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


    /*
     * If there is no conversation yet,
     * create one before sending.
     */

    if (!currentConversationId) {

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
                                currentUser,

                            title:
                                message
                        })
                    }
                );


            const data =
                await response.json();


            if (
                response.ok &&
                data.success &&
                data.conversation
            ) {

                currentConversationId =
                    data.conversation.id;


                localStorage.setItem(
                    "nexora_conversation_id",
                    currentConversationId
                );

            }

        } catch (error) {

            console.error(
                "Conversation creation error:",
                error
            );

        }

    }


    addMessage(
        message,
        "user"
    );


    messageInput.value = "";


    if (sendButton) {
        sendButton.disabled =
            true;
    }


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
                            message,

                        conversation_id:
                            currentConversationId

                    })
                }
            );


        const data =
            await response.json();


        /*
         * Save conversation ID returned
         * by the backend.
         */

        if (data.conversation_id) {

            currentConversationId =
                data.conversation_id;


            localStorage.setItem(
                "nexora_conversation_id",
                currentConversationId
            );

        }


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
                    data.reply,
                    "ai"
                );


            chatBox.appendChild(
                replyMessage.wrapper
            );


            chatBox.scrollTop =
                chatBox.scrollHeight;


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


        /*
         * Refresh conversation list so
         * the latest chat appears correctly.
         */

        loadConversations();


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
            sendButton.disabled =
                false;
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


            /*
             * Refresh conversations because
             * backend may have changed history.
             */

            loadConversations();


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


    if (
        !text ||
        !text.trim()
    ) {
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
SWIPE GESTURES
========================================================= */

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;


document.addEventListener(
    "touchstart",
    event => {

        if (
            !appScreen ||
            appScreen.classList.contains(
                "hidden"
            )
        ) {
            return;
        }


        if (
            event.touches &&
            event.touches.length > 0
        ) {

            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

        }

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    event => {

        if (
            !event.changedTouches ||
            !event.changedTouches.length
        ) {
            return;
        }


        touchEndX =
            event.changedTouches[0].clientX;


        touchEndY =
            event.changedTouches[0].clientY;


        const deltaX =
            touchEndX -
            touchStartX;


        const deltaY =
            touchEndY -
            touchStartY;


        const horizontalSwipe =
            Math.abs(deltaX) >
            Math.abs(deltaY);


        /*
         * Swipe RIGHT from left edge
         * to open drawer.
         */

        if (
            horizontalSwipe &&
            touchStartX < 55 &&
            deltaX > 75
        ) {

            openDrawer();

        }


        /*
         * Swipe LEFT anywhere while
         * drawer is open.
         */

        if (
            horizontalSwipe &&
            sideDrawer &&
            sideDrawer.classList.contains(
                "open"
            ) &&
            deltaX < -75
        ) {

            closeDrawer();

        }


        touchStartX = 0;
        touchStartY = 0;
        touchEndX = 0;
        touchEndY = 0;

    },
    {
        passive: true
    }
);


/* =========================================================
START NEXORA
========================================================= */

initializeApp();