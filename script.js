/* =========================================================
   NEXORA AI 12 — FRONTEND
   Compatible with current index.html
   ========================================================= */

const API_URL =
    "https://nexora-ai-9jgj.onrender.com";


/* =========================================================
   ELEMENTS
   ========================================================= */

const splashScreen =
    document.getElementById("splashScreen");

const authScreen =
    document.getElementById("authScreen");

const app =
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

const drawer =
    document.getElementById("drawer");

const drawerOverlay =
    document.getElementById("drawerOverlay");

const menuBtn =
    document.getElementById("menuBtn");

const closeDrawer =
    document.getElementById("closeDrawer");

const newChatBtn =
    document.getElementById("newChatBtn");

const conversationList =
    document.getElementById("conversationList");

const profileBtn =
    document.getElementById("profileBtn");

const memoryBtn =
    document.getElementById("memoryBtn");

const switchAccountBtn =
    document.getElementById("switchAccountBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const topProfileBtn =
    document.getElementById("topProfileBtn");

const profileInitial =
    document.getElementById("profileInitial");

const chatContainer =
    document.getElementById("chatContainer");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const voiceBtn =
    document.getElementById("voiceBtn");

const sendBtn =
    document.getElementById("sendBtn");


/* =========================================================
   PROFILE MODAL
   ========================================================= */

const profileModal =
    document.getElementById("profileModal");

const closeProfileModal =
    document.getElementById("closeProfileModal");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");


/* =========================================================
   MEMORY MODAL
   ========================================================= */

const memoryModal =
    document.getElementById("memoryModal");

const closeMemoryModal =
    document.getElementById("closeMemoryModal");

const memoryContent =
    document.getElementById("memoryContent");

const clearMemoryBtn =
    document.getElementById("clearMemoryBtn");


/* =========================================================
   RENAME MODAL
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


/* =========================================================
   ACCOUNT MODAL
   ========================================================= */

const accountModal =
    document.getElementById("accountModal");

const closeAccountModal =
    document.getElementById("closeAccountModal");

const accountLoginBtn =
    document.getElementById("accountLoginBtn");

const accountSignupBtn =
    document.getElementById("accountSignupBtn");


/* =========================================================
   CONFIRM MODAL
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
   SESSION
   ========================================================= */

let currentUser = null;

let currentConversation = null;

let conversations = [];

let renameTargetId = null;

let confirmAction = null;


/* =========================================================
   SAFE STORAGE
   ========================================================= */

function loadSavedUser() {

    try {

        const saved =
            localStorage.getItem(
                "nexora_user"
            );

        if (saved) {

            currentUser =
                JSON.parse(saved);

            return;
        }

    } catch (error) {

        console.error(
            "User storage error:",
            error
        );
    }


    const oldUsername =
        localStorage.getItem(
            "nexora_username"
        );

    if (oldUsername) {

        currentUser = {
            username: oldUsername,
            email: "",
            name: oldUsername
        };
    }
}


function saveUser() {

    if (!currentUser) {
        return;
    }

    localStorage.setItem(
        "nexora_user",
        JSON.stringify(currentUser)
    );

    if (currentUser.username) {

        localStorage.setItem(
            "nexora_username",
            currentUser.username
        );
    }
}


function clearSavedUser() {

    localStorage.removeItem(
        "nexora_user"
    );

    localStorage.removeItem(
        "nexora_username"
    );
}


/* =========================================================
   API HELPERS
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );

    let data = {};

    try {
        data =
            await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


function userPayload() {

    return {

        email:
            currentUser?.email || "",

        username:
            currentUser?.username || "",

        user: {

            name:
                currentUser?.name || "",

            email:
                currentUser?.email || "",

            username:
                currentUser?.username || ""
        }
    };
}


/* =========================================================
   AUTH SCREENS
   ========================================================= */

function showLoginScreen() {

    if (loginScreen) {

        loginScreen.style.display =
            "block";
    }

    if (signupScreen) {

        signupScreen.style.display =
            "none";
    }

    if (authMessage) {

        authMessage.textContent =
            "";
    }
}


function showSignupScreen() {

    if (loginScreen) {

        loginScreen.style.display =
            "none";
    }

    if (signupScreen) {

        signupScreen.style.display =
            "block";
    }

    if (authMessage) {

        authMessage.textContent =
            "";
    }
}


showSignup?.addEventListener(
    "click",
    showSignupScreen
);


showLogin?.addEventListener(
    "click",
    showLoginScreen
);


/* =========================================================
   SPLASH
   ========================================================= */

function hideSplash() {

    if (!splashScreen) {
        return;
    }

    splashScreen.classList.add(
        "hide"
    );

    setTimeout(() => {

        splashScreen.style.display =
            "none";

    }, 750);
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {

    loadSavedUser();

    /*
     * Always remove the splash.
     * This prevents the splash screen from
     * trapping the application if anything
     * takes longer than expected.
     */

    setTimeout(
        hideSplash,
        900
    );


    if (currentUser) {

        openApp();

    } else {

        if (authScreen) {

            authScreen.style.display =
                "flex";
        }

        if (app) {

            app.style.display =
                "none";
        }

        showLoginScreen();
    }
}


/* =========================================================
   SIGNUP
   ========================================================= */

signupBtn?.addEventListener(
    "click",
    signupUser
);


async function signupUser() {

    const name =
        signupName?.value.trim();

    const email =
        signupEmail?.value.trim();

    const password =
        signupPassword?.value || "";


    if (!name || !email || !password) {

        setAuthMessage(
            "Please fill in all fields."
        );

        return;
    }


    if (password.length < 6) {

        setAuthMessage(
            "Password must be at least 6 characters."
        );

        return;
    }


    setAuthMessage(
        "Creating your account..."
    );

    signupBtn.disabled = true;


    try {

        const data =
            await apiRequest(
                "/signup",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            name,
                            email,
                            password
                        })
                }
            );


        currentUser =
            data.user || {
                name,
                email,
                username: email
            };


        saveUser();


        setAuthMessage(
            "Account created successfully!"
        );


        setTimeout(
            openApp,
            500
        );


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        setAuthMessage(
            error.message ||
            "Could not create your account."
        );

    } finally {

        signupBtn.disabled =
            false;
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

loginBtn?.addEventListener(
    "click",
    loginUser
);


async function loginUser() {

    const email =
        loginEmail?.value.trim();

    const password =
        loginPassword?.value || "";


    if (!email || !password) {

        setAuthMessage(
            "Please enter your email and password."
        );

        return;
    }


    setAuthMessage(
        "Logging in..."
    );

    loginBtn.disabled = true;


    try {

        const data =
            await apiRequest(
                "/login",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            email,
                            password
                        })
                }
            );


        currentUser =
            data.user || {
                email,
                username: email,
                name: email
            };


        saveUser();


        setAuthMessage(
            "Login successful."
        );


        setTimeout(
            openApp,
            300
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        setAuthMessage(
            error.message ||
            "Could not connect to NEXORA."
        );

    } finally {

        loginBtn.disabled =
            false;
    }
}


function setAuthMessage(message) {

    if (authMessage) {

        authMessage.textContent =
            message;
    }
}


/* =========================================================
   OPEN APP
   ========================================================= */

async function openApp() {

    if (!currentUser) {

        showLoginScreen();

        return;
    }


    if (authScreen) {

        authScreen.style.display =
            "none";
    }

    if (app) {

        app.style.display =
            "flex";
    }


    updateProfileInitial();

    await loadConversations();

    setupSuggestionButtons();

    setupVoiceInput();
}


/* =========================================================
   PROFILE INITIAL
   ========================================================= */

function updateProfileInitial() {

    if (!profileInitial) {
        return;
    }

    const name =
        currentUser?.name ||
        currentUser?.username ||
        "U";

    profileInitial.textContent =
        name
            .charAt(0)
            .toUpperCase();
}


/* =========================================================
   DRAWER
   ========================================================= */

function openDrawer() {

    drawer?.classList.add(
        "open"
    );

    drawerOverlay?.classList.add(
        "open"
    );
}


function closeDrawerMenu() {

    drawer?.classList.remove(
        "open"
    );

    drawerOverlay?.classList.remove(
        "open"
    );
}


menuBtn?.addEventListener(
    "click",
    openDrawer
);


closeDrawer?.addEventListener(
    "click",
    closeDrawerMenu
);


drawerOverlay?.addEventListener(
    "click",
    closeDrawerMenu
);


/* =========================================================
   CONVERSATIONS
   ========================================================= */

async function loadConversations() {

    if (!currentUser) {
        return;
    }


    try {

        const params =
            new URLSearchParams();

        if (currentUser.email) {

            params.set(
                "email",
                currentUser.email
            );
        }

        if (currentUser.username) {

            params.set(
                "username",
                currentUser.username
            );
        }


        const data =
            await apiRequest(
                `/conversations?${params}`
            );


        conversations =
            Array.isArray(
                data.conversations
            )
                ? data.conversations
                : [];


        renderConversationList();


        if (conversations.length) {

            await openConversation(
                conversations[0].id,
                false
            );

        } else {

            await createNewConversation(
                false
            );
        }


    } catch (error) {

        console.error(
            "Conversation loading error:",
            error
        );

        conversations = [];

        renderConversationList();

        currentConversation = null;

        showWelcome();
    }
}


function renderConversationList() {

    if (!conversationList) {
        return;
    }

    conversationList.innerHTML =
        "";


    if (!conversations.length) {

        const empty =
            document.createElement(
                "div"
            );

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
                document.createElement(
                    "div"
                );

            item.className =
                "conversation-item";


            if (
                currentConversation &&
                String(
                    currentConversation.id
                ) ===
                String(
                    conversation.id
                )
            ) {

                item.classList.add(
                    "active"
                );
            }


            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "conversation-button";


            const title =
                document.createElement(
                    "span"
                );

            title.className =
                "conversation-title";

            title.textContent =
                conversation.title ||
                "New chat";


            button.appendChild(
                title
            );


            button.addEventListener(
                "click",
                async () => {

                    await openConversation(
                        conversation.id
                    );

                    closeDrawerMenu();
                }
            );


            const rename =
                document.createElement(
                    "button"
                );

            rename.className =
                "conversation-rename";

            rename.textContent =
                "✏️";

            rename.title =
                "Rename conversation";


            rename.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openRenameModal(
                        conversation
                    );
                }
            );


            item.appendChild(
                button
            );

            item.appendChild(
                rename
            );

            conversationList.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   NEW CONVERSATION
   ========================================================= */

newChatBtn?.addEventListener(
    "click",
    async () => {

        await createNewConversation(
            true
        );

        closeDrawerMenu();
    }
);


async function createNewConversation(
    refresh = true
) {

    if (!currentUser) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/conversations/new",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            ...userPayload(),
                            title: "New chat"
                        })
                }
            );


        currentConversation =
            data.conversation;


        if (refresh) {

            conversations.unshift(
                currentConversation
            );
        } else {

            conversations = [
                currentConversation
            ];
        }


        renderConversationList();

        showWelcome();


    } catch (error) {

        console.error(
            "New conversation error:",
            error
        );

        showWelcome();
    }
}


/* =========================================================
   OPEN CONVERSATION
   ========================================================= */

async function openConversation(
    conversationId,
    scroll = true
) {

    if (!currentUser) {
        return;
    }


    try {

        const params =
            new URLSearchParams();

        if (currentUser.email) {

            params.set(
                "email",
                currentUser.email
            );
        }

        if (currentUser.username) {

            params.set(
                "username",
                currentUser.username
            );
        }


        const data =
            await apiRequest(
                `/conversations/${encodeURIComponent(
                    conversationId
                )}?${params}`
            );


        currentConversation =
            data.conversation;


        renderConversationList();


        messages.innerHTML =
            "";


        const history =
            Array.isArray(
                data.messages
            )
                ? data.messages
                : [];


        if (!history.length) {

            showWelcome();

            return;
        }


        hideWelcome();


        history.forEach(
            item => {

                if (
                    item.role ===
                    "user"
                ) {

                    addMessage(
                        item.content,
                        "user"
                    );

                } else if (
                    item.role ===
                    "assistant"
                ) {

                    addMessage(
                        item.content,
                        "ai"
                    );


                    if (
                        item.image_url
                    ) {

                        addImageMessage(
                            item.image_url,
                            item.image_prompt ||
                            ""
                        );
                    }
                }
            }
        );


        if (scroll) {

            scrollToBottom();
        }


    } catch (error) {

        console.error(
            "Open conversation error:",
            error
        );

        currentConversation = {
            id: conversationId,
            title: "New chat"
        };

        messages.innerHTML =
            "";

        showWelcome();
    }
}


/* =========================================================
   WELCOME
   ========================================================= */

function showWelcome() {

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "flex";
    }

    if (messages) {

        messages.innerHTML =
            "";
    }
}


function hideWelcome() {

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";
    }
}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function setupSuggestionButtons() {

    document
        .querySelectorAll(
            ".suggestion"
        )
        .forEach(
            button => {

                if (
                    button.dataset
                        .nexoraBound
                ) {
                    return;
                }

                button.dataset
                    .nexoraBound =
                    "true";


                button.addEventListener(
                    "click",
                    () => {

                        messageInput.value =
                            button.textContent.trim();

                        messageInput.focus();
                    }
                );
            }
        );
}


/* =========================================================
   MESSAGES
   ========================================================= */

function createMessageElement(
    text,
    sender
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        sender === "user"
            ? "message user"
            : "message";


    if (sender !== "user") {

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
        "message-content";

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


function addMessage(
    text,
    sender
) {

    if (!messages) {
        return;
    }


    hideWelcome();


    const item =
        createMessageElement(
            text,
            sender
        );


    messages.appendChild(
        item.wrapper
    );


    scrollToBottom();
}


function addImageMessage(
    imageUrl,
    prompt
) {

    if (!imageUrl || !messages) {
        return;
    }


    hideWelcome();


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "message";


    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "N";


    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-content";


    const image =
        document.createElement(
            "img"
        );

    image.src =
        imageUrl;

    image.alt =
        prompt ||
        "Generated image";

    image.loading =
        "lazy";

    image.style.maxWidth =
        "100%";

    image.style.borderRadius =
        "12px";


    bubble.appendChild(
        image
    );

    wrapper.appendChild(
        avatar
    );

    wrapper.appendChild(
        bubble
    );

    messages.appendChild(
        wrapper
    );


    scrollToBottom();
}


function scrollToBottom() {

    if (!chatContainer) {
        return;
    }

    requestAnimationFrame(
        () => {

            chatContainer.scrollTop =
                chatContainer.scrollHeight;
        }
    );
}


/* =========================================================
   TYPING INDICATOR
   ========================================================= */

function showTyping() {

    if (!messages) {
        return null;
    }


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "message";


    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "N";


    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-content";


    bubble.innerHTML =
        '<span style="opacity:.7;">NEXORA is typing...</span>';


    wrapper.appendChild(
        avatar
    );

    wrapper.appendChild(
        bubble
    );

    messages.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


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


async function sendMessage() {

    const text =
        messageInput?.value.trim();


    if (!text) {
        return;
    }


    if (!currentUser) {

        showLoginScreen();

        return;
    }


    if (!currentConversation) {

        await createNewConversation(
            false
        );
    }


    if (!currentConversation) {

        addMessage(
            "I couldn't create a conversation. Please try again.",
            "ai"
        );

        return;
    }


    hideWelcome();


    addMessage(
        text,
        "user"
    );


    messageInput.value =
        "";


    if (sendBtn) {

        sendBtn.disabled =
            true;
    }


    const typing =
        showTyping();


    try {

        const data =
    await apiRequest(
        "/chat",
        {
            method: "POST",

            body:
                JSON.stringify({
                    ...userPayload(),

                    message: text,

                    conversation_id:
                        currentConversation.id,

                    generate_image:
                        /generate\s+(an?\s+)?(image|picture|photo|pic)|create\s+(an?\s+)?(image|picture|photo|pic)|make\s+(an?\s+)?(image|picture|photo|pic)|draw\s+(an?\s+)?(image|picture|photo|pic)/i.test(text)
                })
        }
    );


        typing?.remove();


        if (
            data.conversation_id &&
            String(
                data.conversation_id
            ) !==
            String(
                currentConversation.id
            )
        ) {

            currentConversation.id =
                data.conversation_id;
        }


        if (data.reply) {

            addMessage(
                data.reply,
                "ai"
            );
        }


        if (data.image_url) {

            addImageMessage(
                data.image_url,
                data.image_prompt ||
                text
            );
        }


        await refreshConversations();


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        typing?.remove();


        addMessage(
            error.message ||
            "Sorry, I couldn't connect to NEXORA right now.",
            "ai"
        );

    } finally {

        if (sendBtn) {

            sendBtn.disabled =
                false;
        }

        messageInput?.focus();
    }
}


/* =========================================================
   REFRESH CONVERSATIONS
   ========================================================= */

async function refreshConversations() {

    if (!currentUser) {
        return;
    }


    try {

        const params =
            new URLSearchParams();

        if (currentUser.email) {

            params.set(
                "email",
                currentUser.email
            );
        }

        if (currentUser.username) {

            params.set(
                "username",
                currentUser.username
            );
        }


        const data =
            await apiRequest(
                `/conversations?${params}`
            );


        conversations =
            data.conversations || [];


        renderConversationList();

    } catch (error) {

        console.error(
            "Refresh conversations error:",
            error
        );
    }
}


/* =========================================================
   RENAME
   ========================================================= */

function openRenameModal(
    conversation
) {

    renameTargetId =
        conversation.id;


    if (renameConversationInput) {

        renameConversationInput.value =
            conversation.title ||
            "";
    }


    if (renameModal) {

        renameModal.style.display =
            "flex";
    }
}


function closeRename() {

    if (renameModal) {

        renameModal.style.display =
            "none";
    }

    renameTargetId =
        null;
}


closeRenameModal?.addEventListener(
    "click",
    closeRename
);


saveConversationNameBtn?.addEventListener(
    "click",
    async () => {

        const title =
            renameConversationInput
                ?.value.trim();


        if (
            !renameTargetId ||
            !title
        ) {
            return;
        }


        try {

            const data =
                await apiRequest(
                    `/conversations/${encodeURIComponent(
                        renameTargetId
                    )}`,
                    {
                        method: "PATCH",

                        body:
                            JSON.stringify({
                                ...userPayload(),
                                title
                            })
                    }
                );


            const updated =
                data.conversation;


            conversations =
                conversations.map(
                    item =>
                        String(item.id) ===
                        String(
                            renameTargetId
                        )
                            ? updated
                            : item
                );


            if (
                currentConversation &&
                String(
                    currentConversation.id
                ) ===
                String(
                    renameTargetId
                )
            ) {

                currentConversation =
                    updated;
            }


            renderConversationList();

            closeRename();

        } catch (error) {

            console.error(
                "Rename error:",
                error
            );

            alert(
                error.message ||
                "Could not rename conversation."
            );
        }
    }
);


/* =========================================================
   PROFILE
   ========================================================= */

profileBtn?.addEventListener(
    "click",
    () => {

        closeDrawerMenu();

        openProfile();
    }
);


topProfileBtn?.addEventListener(
    "click",
    openProfile
);


function openProfile() {

    if (!profileModal) {
        return;
    }


    profileName.value =
        currentUser?.name || "";


    profileEmail.value =
        currentUser?.email || "";


    profileModal.style.display =
        "flex";
}


function closeProfile() {

    if (profileModal) {

        profileModal.style.display =
            "none";
    }
}


closeProfileModal?.addEventListener(
    "click",
    closeProfile
);


saveProfileBtn?.addEventListener(
    "click",
    async () => {

        const name =
            profileName?.value.trim();


        if (!name) {
            return;
        }


        try {

            const data =
                await apiRequest(
                    "/profile",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                ...userPayload(),
                                name
                            })
                    }
                );


            if (data.user) {

                currentUser =
                    data.user;

                saveUser();

                updateProfileInitial();
            }


            closeProfile();

        } catch (error) {

            console.error(
                "Profile save error:",
                error
            );

            alert(
                error.message ||
                "Could not save profile."
            );
        }
    }
);


/* =========================================================
   MEMORY
   ========================================================= */

memoryBtn?.addEventListener(
    "click",
    async () => {

        closeDrawerMenu();

        await openMemory();
    }
);


async function openMemory() {

    if (!memoryModal) {
        return;
    }


    memoryModal.style.display =
        "flex";


    memoryContent.innerHTML =
        "Loading memory...";


    try {

        const params =
            new URLSearchParams();

        if (currentUser?.email) {

            params.set(
                "email",
                currentUser.email
            );
        }

        if (currentUser?.username) {

            params.set(
                "username",
                currentUser.username
            );
        }


        const data =
            await apiRequest(
                `/memory?${params}`
            );


        const saved =
            data.saved_memories || [];


        if (!saved.length) {

            memoryContent.textContent =
                "NEXORA doesn't have any saved memories about you yet.";

            return;
        }


        memoryContent.innerHTML =
            "";


        saved.forEach(
            memory => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.style.padding =
                    "9px 0";

                item.style.borderBottom =
                    "1px solid rgba(255,255,255,.06)";

                item.textContent =
                    memory;

                memoryContent.appendChild(
                    item
                );
            }
        );


    } catch (error) {

        console.error(
            "Memory error:",
            error
        );

        memoryContent.textContent =
            error.message ||
            "Could not load memory.";
    }
}


function closeMemory() {

    if (memoryModal) {

        memoryModal.style.display =
            "none";
    }
}


closeMemoryModal?.addEventListener(
    "click",
    closeMemory
);


/* =========================================================
   CLEAR MEMORY
   ========================================================= */

clearMemoryBtn?.addEventListener(
    "click",
    () => {

        openConfirm(
            "Clear Memory",
            "Are you sure you want NEXORA to forget your saved memories?",
            clearGlobalMemory
        );
    }
);


async function clearGlobalMemory() {

    try {

        await apiRequest(
            "/memory/clear",
            {
                method: "POST",

                body:
                    JSON.stringify(
                        userPayload()
                    )
            }
        );


        await openMemory();

    } catch (error) {

        alert(
            error.message ||
            "Could not clear memory."
        );
    }
}


/* =========================================================
   SWITCH ACCOUNT
   ========================================================= */

switchAccountBtn?.addEventListener(
    "click",
    () => {

        closeDrawerMenu();

        if (accountModal) {

            accountModal.style.display =
                "flex";
        }
    }
);


closeAccountModal?.addEventListener(
    "click",
    () => {

        accountModal.style.display =
            "none";
    }
);


accountLoginBtn?.addEventListener(
    "click",
    () => {

        accountModal.style.display =
            "none";

        logoutWithoutReload();

        showLoginScreen();

        authScreen.style.display =
            "flex";
    }
);


accountSignupBtn?.addEventListener(
    "click",
    () => {

        accountModal.style.display =
            "none";

        logoutWithoutReload();

        showSignupScreen();

        authScreen.style.display =
            "flex";
    }
);


function logoutWithoutReload() {

    stopVoice();

    currentUser =
        null;

    currentConversation =
        null;

    conversations =
        [];

    clearSavedUser();

    if (app) {

        app.style.display =
            "none";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

logoutBtn?.addEventListener(
    "click",
    () => {

        closeDrawerMenu();

        openConfirm(
            "Logout",
            "Are you sure you want to log out of NEXORA?",
            performLogout
        );
    }
);


function performLogout() {

    logoutWithoutReload();

    if (authScreen) {

        authScreen.style.display =
            "flex";
    }

    showLoginScreen();

    if (loginPassword) {

        loginPassword.value =
            "";
    }
}


/* =========================================================
   CONFIRMATION
   ========================================================= */

function openConfirm(
    title,
    message,
    action
) {

    confirmAction =
        action;


    if (confirmTitle) {

        confirmTitle.textContent =
            title;
    }


    if (confirmMessage) {

        confirmMessage.textContent =
            message;
    }


    if (confirmModal) {

        confirmModal.style.display =
            "flex";
    }
}


function closeConfirm() {

    if (confirmModal) {

        confirmModal.style.display =
            "none";
    }

    confirmAction =
        null;
}


confirmCancel?.addEventListener(
    "click",
    closeConfirm
);


confirmOkay?.addEventListener(
    "click",
    async () => {

        const action =
            confirmAction;

        closeConfirm();

        if (action) {

            await action();
        }
    }
);


/* =========================================================
   VOICE INPUT
   ========================================================= */

let recognition = null;

let listening = false;


function setupVoiceInput() {

    if (!voiceBtn) {
        return;
    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        voiceBtn.disabled =
            true;

        voiceBtn.title =
            "Voice input is not supported.";

        return;
    }


    if (recognition) {
        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";

    recognition.continuous =
        false;

    recognition.interimResults =
        true;


    recognition.onstart =
        () => {

            listening =
                true;

            voiceBtn.textContent =
                "⏹️";
        };


    recognition.onresult =
        event => {

            let text = "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                text +=
                    event.results[i][0]
                        .transcript;
            }


            messageInput.value =
                text.trim();
        };


    recognition.onerror =
        error => {

            console.error(
                "Voice error:",
                error
            );

            listening =
                false;

            voiceBtn.textContent =
                "🎤";
        };


    recognition.onend =
        () => {

            listening =
                false;

            voiceBtn.textContent =
                "🎤";
        };
}


voiceBtn?.addEventListener(
    "click",
    () => {

        if (!recognition) {

            setupVoiceInput();
        }


        if (!recognition) {
            return;
        }


        if (listening) {

            stopVoice();

        } else {

            try {

                recognition.start();

            } catch (error) {

                console.error(
                    "Voice start error:",
                    error
                );
            }
        }
    }
);


function stopVoice() {

    if (!recognition) {
        return;
    }


    try {
        recognition.stop();
    } catch {}


    listening =
        false;


    if (voiceBtn) {

        voiceBtn.textContent =
            "🎤";
    }
}


/* =========================================================
   START
   ========================================================= */

initializeApp();