/* ============================================================
   NEXORA AI
   AI WEBSITE FRONTEND CONTROLLER
   MATCHED TO THE EXACT NEXORA AI HTML + CSS
   DAVIDS DIGITALS LTD.©
   ============================================================ */

const API_BASE = "https://nexora-ai-1-r9y5.onrender.com";


/* ============================================================
   STATE
   ============================================================ */

let currentUser = null;
let currentConversationId = null;
let conversations = [];
let renameConversationId = null;
let isSending = false;
let recognition = null;


/* ============================================================
   DOM HELPER
   ============================================================ */

const $ = (id) => document.getElementById(id);


/* ============================================================
   DISPLAY HELPERS
   ============================================================ */

function show(element) {
    if (element) {
        element.style.display = "";
    }
}


function hide(element) {
    if (element) {
        element.style.display = "none";
    }
}


/* ============================================================
   API
   ============================================================ */

async function api(endpoint, options = {}) {

    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    if (options.body !== undefined) {
        config.body = options.body;
    }

    try {

        const response = await fetch(
            API_BASE + endpoint,
            config
        );

        const data = await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                `Request failed (${response.status})`
            );
        }

        return data;

    } catch (error) {

        console.error(
            "NEXORA API Error:",
            error
        );

        throw error;
    }
}


/* ============================================================
   AUTH MESSAGE
   ============================================================ */

function setAuthMessage(message, type = "") {

    const box = $("authMessage");

    if (!box) return;

    box.textContent = message || "";

    box.className =
        "auth-message" +
        (type ? ` ${type}` : "");
}


/* ============================================================
   AUTH SCREENS
   ============================================================ */

function showAuthScreen(screenId) {

    hide($("loginScreen"));
    hide($("signupScreen"));

    /*
       The current AI HTML only contains login and signup.
       These checks remain defensive in case they are added later.
    */

    hide($("forgotPasswordScreen"));
    hide($("resetPasswordScreen"));

    const screen = $(screenId);

    if (screen) {
        show(screen);
    }

    setAuthMessage("");
}


/* ============================================================
   USER STORAGE
   ============================================================ */

function saveUser(user) {

    if (!user) return;

    currentUser = user;

    localStorage.setItem(
        "nexora_user",
        JSON.stringify(user)
    );
}


function loadUser() {

    try {

        const saved =
            localStorage.getItem("nexora_user");

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Saved user error:",
            error
        );

        localStorage.removeItem(
            "nexora_user"
        );

        return null;
    }
}


/* ============================================================
   USER ID / PAYLOAD
   ============================================================ */

function getUserId() {

    if (!currentUser) {
        return null;
    }

    return (
        currentUser.id ||
        currentUser.user_id ||
        currentUser.userId ||
        null
    );
}


function userPayload() {

    if (!currentUser) {
        return {};
    }

    return {
        user_id:
            getUserId(),

        email:
            currentUser.email || "",

        username:
            currentUser.username ||
            currentUser.name ||
            "",

        name:
            currentUser.name ||
            currentUser.username ||
            "",

        user:
            currentUser
    };
}


/* ============================================================
   AUTH USER NORMALIZER
   ============================================================ */

function normalizeUser(data) {

    const user =
        data?.user ||
        data?.account ||
        null;

    if (user) {
        return user;
    }

    if (
        data?.id ||
        data?.user_id ||
        data?.email
    ) {

        return {
            id:
                data.id ||
                data.user_id,

            email:
                data.email || "",

            name:
                data.name ||
                data.username ||
                ""
        };
    }

    return null;
}


/* ============================================================
   LOGOUT
   ============================================================ */

function logout() {

    currentUser = null;
    currentConversationId = null;
    conversations = [];
    renameConversationId = null;

    localStorage.removeItem(
        "nexora_user"
    );

    hide($("app"));
    hide($("splashScreen"));

    show($("authScreen"));

    showAuthScreen(
        "loginScreen"
    );

    if ($("loginEmail")) {
        $("loginEmail").value = "";
    }

    if ($("loginPassword")) {
        $("loginPassword").value = "";
    }

    if ($("messages")) {
        $("messages").innerHTML = "";
    }

    show($("welcomeScreen"));

    closeDrawer();
}


/* ============================================================
   LOGIN
   ============================================================ */

async function login() {

    const email =
        $("loginEmail")?.value.trim();

    const password =
        $("loginPassword")?.value || "";

    if (!email) {

        setAuthMessage(
            "Please enter your email.",
            "error"
        );

        return;
    }

    if (!password) {

        setAuthMessage(
            "Please enter your password.",
            "error"
        );

        return;
    }

    const button = $("loginBtn");

    if (button) {

        button.disabled = true;
        button.textContent = "Logging in...";
    }

    try {

        const data = await api(
            "/login",
            {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const user =
            normalizeUser(data);

        if (!user) {

            throw new Error(
                data.message ||
                "Login succeeded but no account information was returned."
            );
        }

        saveUser(user);

        setAuthMessage("");

        await openApp();

    } catch (error) {

        setAuthMessage(
            error.message ||
            "Unable to connect to NEXORA.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = "Login";
        }
    }
}


/* ============================================================
   SIGNUP
   ============================================================ */

async function signup() {

    const name =
        $("signupName")?.value.trim();

    const email =
        $("signupEmail")?.value.trim();

    const password =
        $("signupPassword")?.value || "";

    if (!name) {

        setAuthMessage(
            "Please enter your name.",
            "error"
        );

        return;
    }

    if (!email) {

        setAuthMessage(
            "Please enter your email.",
            "error"
        );

        return;
    }

    if (password.length < 6) {

        setAuthMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }

    const button = $("signupBtn");

    if (button) {

        button.disabled = true;
        button.textContent = "Creating...";
    }

    try {

        const data = await api(
            "/signup",
            {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const user =
            normalizeUser(data);

        if (!user) {

            throw new Error(
                data.message ||
                "Account was created but no account information was returned."
            );
        }

        saveUser(user);

        setAuthMessage("");

        await openApp();

    } catch (error) {

        setAuthMessage(
            error.message ||
            "Unable to create your account.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = "Sign Up";
        }
    }
}


/* ============================================================
   OPEN APP
   ============================================================ */

async function openApp() {

    hide($("splashScreen"));
    hide($("authScreen"));

    show($("app"));

    updateProfileUI();

    await loadConversations();

    if (conversations.length > 0) {

        const firstConversation =
            conversations[0];

        await loadConversation(
            firstConversation.id
        );

    } else {

        await createNewChat(true);
    }
}


/* ============================================================
   PROFILE UI
   ============================================================ */

function updateProfileUI() {

    if (!currentUser) {
        return;
    }

    const name =
        currentUser.name ||
        currentUser.username ||
        currentUser.email ||
        "User";

    const initial =
        name
            .trim()
            .charAt(0)
            .toUpperCase() || "U";

    if ($("profileInitial")) {

        $("profileInitial").textContent =
            initial;
    }

    if ($("profileName")) {

        $("profileName").value =
            currentUser.name ||
            currentUser.username ||
            "";
    }

    if ($("profileEmail")) {

        $("profileEmail").value =
            currentUser.email ||
            "";
    }
}


/* ============================================================
   CONVERSATIONS
   ============================================================ */

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

        if (getUserId()) {
            params.set(
                "user_id",
                getUserId()
            );
        }

        const query =
            params.toString();

        const data = await api(
            "/conversations" +
            (query ? `?${query}` : "")
        );

        conversations =
            Array.isArray(data.conversations)
                ? data.conversations
                : [];

        renderConversations();

    } catch (error) {

        console.error(
            "Conversation loading error:",
            error
        );

        renderConversations();
    }
}


/* ============================================================
   RENDER CONVERSATIONS
   ============================================================ */

function renderConversations() {

    const list =
        $("conversationList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (!conversations.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "conversation-empty";

        empty.textContent =
            "No conversations yet.";

        list.appendChild(empty);

        return;
    }

    conversations.forEach(
        conversation => {

            const item =
                document.createElement("div");

            item.className =
                "conversation-item";

            if (
                String(conversation.id) ===
                String(currentConversationId)
            ) {

                item.classList.add("active");
            }


            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "conversation-button";


            const title =
                document.createElement("span");

            title.className =
                "conversation-title";

            title.textContent =
                conversation.title ||
                conversation.name ||
                "New chat";

            button.appendChild(title);


            button.addEventListener(
                "click",
                async () => {

                    await loadConversation(
                        conversation.id
                    );

                    closeDrawer();
                }
            );


            const rename =
                document.createElement("button");

            rename.type = "button";

            rename.className =
                "conversation-rename";

            rename.title =
                "Rename conversation";

            rename.textContent =
                "✎";


            rename.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    openRename(
                        conversation.id,
                        conversation.title ||
                        conversation.name ||
                        ""
                    );
                }
            );


            item.appendChild(button);
            item.appendChild(rename);

            list.appendChild(item);
        }
    );
}


/* ============================================================
   LOAD CONVERSATION
   ============================================================ */

async function loadConversation(id) {

    if (!currentUser || !id) {
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

        if (getUserId()) {
            params.set(
                "user_id",
                getUserId()
            );
        }

        const query =
            params.toString();

        const data = await api(
            "/conversations/" +
            encodeURIComponent(id) +
            (query ? `?${query}` : "")
        );

        const conversation =
            data.conversation ||
            data;

        currentConversationId =
            conversation.id ||
            id;

        const messages =
            Array.isArray(data.messages)
                ? data.messages
                : Array.isArray(
                    conversation.messages
                )
                    ? conversation.messages
                    : [];

        renderMessages(messages);

        renderConversations();

    } catch (error) {

        console.error(
            "Load conversation error:",
            error
        );
    }
}


/* ============================================================
   CREATE NEW CHAT
   ============================================================ */

async function createNewChat(silent = false) {

    if (!currentUser) {
        return;
    }

    try {

        const data = await api(
            "/conversations/new",
            {
                method: "POST",
                body: JSON.stringify({
                    ...userPayload(),
                    title: "New chat"
                })
            }
        );

        const conversation =
            data.conversation;

        if (!conversation) {

            if (!silent) {
                showWelcome();
                renderMessages([]);
            }

            return;
        }

        currentConversationId =
            conversation.id;

        conversations =
            conversations.filter(
                item =>
                    String(item.id) !==
                    String(conversation.id)
            );

        conversations.unshift(
            conversation
        );

        renderConversations();
        renderMessages([]);

        showWelcome();

        if (!silent) {
            closeDrawer();
        }

    } catch (error) {

        console.error(
            "Create chat error:",
            error
        );

        if (!silent) {

            addMessageToUI(
                "assistant",
                "I couldn't create a new conversation right now."
            );
        }
    }
}


/* ============================================================
   WELCOME
   ============================================================ */

function showWelcome() {

    show($("welcomeScreen"));
}


function hideWelcome() {

    hide($("welcomeScreen"));
}


/* ============================================================
   RENDER MESSAGES
   ============================================================ */

function renderMessages(messages) {

    const container =
        $("messages");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !Array.isArray(messages) ||
        messages.length === 0
    ) {

        showWelcome();
        return;
    }

    hideWelcome();

    messages.forEach(
        message => {

            const role =
                message.role === "user"
                    ? "user"
                    : "assistant";

            const content =
                message.content ||
                message.message ||
                message.text ||
                "";

            const imageUrl =
                message.image_url ||
                message.imageUrl ||
                null;

            addMessageToUI(
                role,
                content,
                imageUrl
            );
        }
    );

    scrollToBottom();
}


/* ============================================================
   ADD MESSAGE
   ============================================================ */

function addMessageToUI(
    role,
    content,
    imageUrl = null
) {

    const container =
        $("messages");

    if (!container) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message";

    if (role === "user") {
        wrapper.classList.add("user");
    }


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";


    if (role === "user") {

        const name =
            currentUser?.name ||
            currentUser?.username ||
            currentUser?.email ||
            "U";

        avatar.textContent =
            name
                .trim()
                .charAt(0)
                .toUpperCase() || "U";

    } else {

        avatar.textContent = "N";
    }


    const contentBox =
        document.createElement("div");

    contentBox.className =
        "message-content";

    contentBox.textContent =
        content || "";


    if (imageUrl) {

        const image =
            document.createElement("img");

        image.src = imageUrl;

        image.alt =
            "NEXORA generated image";

        image.loading = "lazy";

        image.style.display = "block";
        image.style.width = "100%";
        image.style.maxWidth = "100%";
        image.style.borderRadius = "14px";
        image.style.marginTop =
            content ? "10px" : "0";

        image.addEventListener(
            "error",
            () => {
                image.remove();
            }
        );

        contentBox.appendChild(image);
    }


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

    container.appendChild(wrapper);
}


/* ============================================================
   TYPING INDICATOR
   ============================================================ */

function showTyping() {

    removeTyping();

    const container =
        $("messages");

    if (!container) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.id =
        "nexoraTyping";

    wrapper.className =
        "message";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent = "N";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-content";

    bubble.textContent =
        "NEXORA is thinking...";


    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    container.appendChild(wrapper);

    scrollToBottom();
}


function removeTyping() {

    const typing =
        $("nexoraTyping");

    if (typing) {
        typing.remove();
    }
}


/* ============================================================
   SEND MESSAGE
   ============================================================ */

async function sendMessage(customMessage = null) {

    if (
        !currentUser ||
        isSending
    ) {
        return;
    }

    const input =
        $("messageInput");

    if (!input) {
        return;
    }

    const message =
        customMessage !== null
            ? String(customMessage).trim()
            : input.value.trim();

    if (!message) {
        return;
    }

    isSending = true;

    const sendButton =
        $("sendBtn");

    if (sendButton) {
        sendButton.disabled = true;
    }


    input.value = "";
    input.style.height = "auto";

    hideWelcome();

    addMessageToUI(
        "user",
        message
    );

    showTyping();

    try {

        /*
           If no conversation exists,
           create one before sending.
        */

        if (!currentConversationId) {

            await createNewChat(true);
        }


        const payload = {
            ...userPayload(),

            message,

            conversation_id:
                currentConversationId
        };


        const data = await api(
            "/chat",
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );


        removeTyping();


        if (data.conversation_id) {

            currentConversationId =
                data.conversation_id;
        }

        if (data.conversation?.id) {

            currentConversationId =
                data.conversation.id;
        }


        const reply =
            data.reply ||
            data.response ||
            data.answer ||
            data.message ||
            "I couldn't generate a response.";


        const imageUrl =
            data.image_url ||
            data.imageUrl ||
            data.image?.url ||
            null;


        addMessageToUI(
            "assistant",
            reply,
            imageUrl
        );


        await loadConversations();

        renderConversations();

    } catch (error) {

        removeTyping();

        console.error(
            "Send message error:",
            error
        );

        addMessageToUI(
            "assistant",
            "Sorry, I couldn't connect to NEXORA right now. Please try again."
        );

    } finally {

        isSending = false;

        if (sendButton) {
            sendButton.disabled = false;
        }

        input.focus();
    }
}


/* ============================================================
   SCROLL
   ============================================================ */

function scrollToBottom() {

    const chat =
        $("chatContainer");

    if (!chat) {
        return;
    }

    requestAnimationFrame(
        () => {

            chat.scrollTop =
                chat.scrollHeight;
        }
    );
}


/* ============================================================
   DRAWER
   ============================================================ */

function openDrawer() {

    $("drawer")
        ?.classList
        .add("open");

    $("drawerOverlay")
        ?.classList
        .add("open");
}


function closeDrawer() {

    $("drawer")
        ?.classList
        .remove("open");

    $("drawerOverlay")
        ?.classList
        .remove("open");
}


/* ============================================================
   PROFILE MODAL
   ============================================================ */

async function openProfile() {

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

        if (getUserId()) {
            params.set(
                "user_id",
                getUserId()
            );
        }

        const query =
            params.toString();

        const data = await api(
            "/profile" +
            (query ? `?${query}` : "")
        );

        const user =
            data.user ||
            data.profile;

        if (user) {

            currentUser = user;

            saveUser(
                currentUser
            );
        }

        updateProfileUI();

        show($("profileModal"));

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        updateProfileUI();

        show($("profileModal"));
    }
}


/* ============================================================
   SAVE PROFILE
   ============================================================ */

async function saveProfile() {

    const input =
        $("profileName");

    if (!input || !currentUser) {
        return;
    }

    const name =
        input.value.trim();

    if (!name) {
        return;
    }

    const button =
        $("saveProfileBtn");

    if (button) {

        button.disabled = true;
        button.textContent = "Saving...";
    }

    try {

        const data = await api(
            "/profile",
            {
                method: "POST",

                body: JSON.stringify({
                    ...userPayload(),
                    name
                })
            }
        );

        const user =
            data.user ||
            data.profile;

        if (user) {

            currentUser = user;

        } else {

            currentUser = {
                ...currentUser,
                name
            };
        }

        saveUser(
            currentUser
        );

        updateProfileUI();

        hide($("profileModal"));

    } catch (error) {

        console.error(
            "Save profile error:",
            error
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "Save Changes";
        }
    }
}


/* ============================================================
   MEMORY
   ============================================================ */

async function openMemory() {

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

        if (getUserId()) {
            params.set(
                "user_id",
                getUserId()
            );
        }

        const query =
            params.toString();

        const data = await api(
            "/memory" +
            (query ? `?${query}` : "")
        );

        const box =
            $("memoryContent");

        if (!box) {
            return;
        }

        box.innerHTML = "";

        const memories =
            data.saved_memories ||
            data.memories ||
            data.memory ||
            [];


        if (
            typeof memories === "string"
        ) {

            box.textContent =
                memories;

        } else if (
            !Array.isArray(memories) ||
            memories.length === 0
        ) {

            box.textContent =
                "NEXORA has no saved memories yet.";

        } else {

            memories.forEach(
                memory => {

                    const item =
                        document.createElement("div");

                    item.textContent =
                        "• " +
                        (
                            typeof memory === "string"
                                ? memory
                                : memory.text ||
                                  memory.content ||
                                  JSON.stringify(memory)
                        );

                    item.style.marginBottom =
                        "8px";

                    box.appendChild(item);
                }
            );
        }

        show($("memoryModal"));

    } catch (error) {

        console.error(
            "Memory error:",
            error
        );
    }
}


/* ============================================================
   CLEAR MEMORY
   ============================================================ */

async function clearMemory() {

    if (!currentUser) {
        return;
    }

    const button =
        $("clearMemoryBtn");

    if (button) {
        button.disabled = true;
        button.textContent = "Clearing...";
    }

    try {

        let cleared = false;

        try {

            await api(
                "/clear",
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            userPayload()
                        )
                }
            );

            cleared = true;

        } catch (firstError) {

            console.warn(
                "Primary memory clear route failed. Trying fallback.",
                firstError
            );

            await api(
                "/memory/clear",
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            userPayload()
                        )
                }
            );

            cleared = true;
        }

        if (cleared) {
            await openMemory();
        }

    } catch (error) {

        console.error(
            "Clear memory error:",
            error
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "Clear Memory";
        }
    }
}


/* ============================================================
   RENAME
   ============================================================ */

function openRename(
    id,
    currentTitle = ""
) {

    renameConversationId = id;

    const input =
        $("renameConversationInput");

    if (input) {

        input.value =
            currentTitle || "";

        show($("renameModal"));

        setTimeout(
            () => {

                input.focus();
                input.select();

            },
            50
        );

    } else {

        show($("renameModal"));
    }
}


/* ============================================================
   SAVE RENAME
   ============================================================ */

async function saveConversationName() {

    const input =
        $("renameConversationInput");

    if (
        !input ||
        !renameConversationId
    ) {
        return;
    }

    const title =
        input.value.trim();

    if (!title) {
        return;
    }

    const button =
        $("saveConversationNameBtn");

    if (button) {

        button.disabled = true;
        button.textContent = "Saving...";
    }

    try {

        await api(
            "/conversations/" +
            encodeURIComponent(
                renameConversationId
            ),
            {
                method: "PATCH",

                body: JSON.stringify({
                    ...userPayload(),
                    title
                })
            }
        );

        hide($("renameModal"));

        renameConversationId = null;

        await loadConversations();

        renderConversations();

    } catch (error) {

        console.error(
            "Rename error:",
            error
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "Save Name";
        }
    }
}


/* ============================================================
   ACCOUNT SWITCH
   ============================================================ */

function openAccountModal() {

    show($("accountModal"));
}


function switchAccount() {

    hide($("accountModal"));
    hide($("app"));

    show($("authScreen"));

    showAuthScreen(
        "loginScreen"
    );

    closeDrawer();
}


function switchToSignup() {

    hide($("accountModal"));
    hide($("app"));

    show($("authScreen"));

    showAuthScreen(
        "signupScreen"
    );

    closeDrawer();
}


/* ============================================================
   VOICE INPUT
   ============================================================ */

function voiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported on this device."
        );

        return;
    }


    if (recognition) {

        try {
            recognition.stop();
        } catch (_) {}

        recognition = null;

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

    recognition.maxAlternatives =
        1;


    recognition.onstart =
        () => {

            const button =
                $("voiceBtn");

            if (button) {
                button.textContent =
                    "🔴";
            }
        };


    recognition.onresult =
        event => {

            const transcript =
                event
                    .results?.[0]?.[0]
                    ?.transcript || "";

            const input =
                $("messageInput");

            if (!input) {
                return;
            }

            input.value =
                transcript;

            input.style.height =
                "auto";

            input.style.height =
                Math.min(
                    input.scrollHeight,
                    150
                ) + "px";

            input.focus();
        };


    recognition.onerror =
        error => {

            console.error(
                "Voice recognition error:",
                error
            );
        };


    recognition.onend =
        () => {

            const button =
                $("voiceBtn");

            if (button) {
                button.textContent =
                    "🎤";
            }

            recognition = null;
        };


    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Voice start error:",
            error
        );

        recognition = null;
    }
}


/* ============================================================
   MODALS
   ============================================================ */

function setupModalBackgrounds() {

    document
        .querySelectorAll(".modal")
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target === modal
                        ) {

                            hide(modal);

                            if (
                                modal.id ===
                                "renameModal"
                            ) {

                                renameConversationId =
                                    null;
                            }
                        }
                    }
                );
            }
        );
}


/* ============================================================
   EVENTS
   ============================================================ */

function setupEvents() {

    /* =========================
       AUTH
    ========================= */

    $("loginBtn")
        ?.addEventListener(
            "click",
            login
        );


    $("signupBtn")
        ?.addEventListener(
            "click",
            signup
        );


    $("showSignup")
        ?.addEventListener(
            "click",
            () =>
                showAuthScreen(
                    "signupScreen"
                )
        );


    $("showLogin")
        ?.addEventListener(
            "click",
            () =>
                showAuthScreen(
                    "loginScreen"
                )
        );


    /* =========================
       DRAWER
    ========================= */

    $("menuBtn")
        ?.addEventListener(
            "click",
            openDrawer
        );


    $("closeDrawer")
        ?.addEventListener(
            "click",
            closeDrawer
        );


    $("drawerOverlay")
        ?.addEventListener(
            "click",
            closeDrawer
        );


    $("newChatBtn")
        ?.addEventListener(
            "click",
            () =>
                createNewChat(false)
        );


    /* =========================
       CHAT
    ========================= */

    $("sendBtn")
        ?.addEventListener(
            "click",
            () =>
                sendMessage()
        );


    $("voiceBtn")
        ?.addEventListener(
            "click",
            voiceInput
        );


    $("messageInput")
        ?.addEventListener(
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


    $("messageInput")
        ?.addEventListener(
            "input",
            event => {

                event.target.style.height =
                    "auto";

                event.target.style.height =
                    Math.min(
                        event.target.scrollHeight,
                        140
                    ) + "px";
            }
        );


    /* =========================
       SUGGESTIONS
    ========================= */

    document
        .querySelectorAll(".suggestion")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const text =
                            button.textContent
                                .trim();

                        sendMessage(text);
                    }
                );
            }
        );


    /* =========================
       PROFILE
    ========================= */

    $("profileBtn")
        ?.addEventListener(
            "click",
            () => {

                closeDrawer();

                openProfile();
            }
        );


    $("topProfileBtn")
        ?.addEventListener(
            "click",
            openProfile
        );


    $("saveProfileBtn")
        ?.addEventListener(
            "click",
            saveProfile
        );


    $("closeProfileModal")
        ?.addEventListener(
            "click",
            () =>
                hide(
                    $("profileModal")
                )
        );


    /* =========================
       MEMORY
    ========================= */

    $("memoryBtn")
        ?.addEventListener(
            "click",
            () => {

                closeDrawer();

                openMemory();
            }
        );


    $("clearMemoryBtn")
        ?.addEventListener(
            "click",
            clearMemory
        );


    $("closeMemoryModal")
        ?.addEventListener(
            "click",
            () =>
                hide(
                    $("memoryModal")
                )
        );


    /* =========================
       RENAME
    ========================= */

    $("saveConversationNameBtn")
        ?.addEventListener(
            "click",
            saveConversationName
        );


    $("closeRenameModal")
        ?.addEventListener(
            "click",
            () => {

                renameConversationId =
                    null;

                hide(
                    $("renameModal")
                );
            }
        );


    /* =========================
       ACCOUNT
    ========================= */

    $("switchAccountBtn")
        ?.addEventListener(
            "click",
            () => {

                closeDrawer();

                openAccountModal();
            }
        );


    $("accountLoginBtn")
        ?.addEventListener(
            "click",
            switchAccount
        );


    $("accountSignupBtn")
        ?.addEventListener(
            "click",
            switchToSignup
        );


    $("closeAccountModal")
        ?.addEventListener(
            "click",
            () =>
                hide(
                    $("accountModal")
                )
        );


    /* =========================
       LOGOUT
    ========================= */

    $("logoutBtn")
        ?.addEventListener(
            "click",
            logout
        );


    /* =========================
       ESCAPE KEY
    ========================= */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            closeDrawer();

            document
                .querySelectorAll(".modal")
                .forEach(
                    modal => hide(modal)
                );

            renameConversationId = null;
        }
    );


    setupModalBackgrounds();
}


/* ============================================================
   AUTH ENTER KEYS
   ============================================================ */

function setupAuthEnterKeys() {

    $("loginPassword")
        ?.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    login();
                }
            }
        );


    $("signupPassword")
        ?.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    signup();
                }
            }
        );


    $("renameConversationInput")
        ?.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    saveConversationName();
                }
            }
        );
}


/* ============================================================
   START NEXORA
   ============================================================ */

async function startNexora() {

    setupEvents();

    setupAuthEnterKeys();


    const savedUser =
        loadUser();


    if (savedUser) {

        currentUser =
            savedUser;

        hide($("splashScreen"));

        await openApp();

        return;
    }


    /*
       Show splash first,
       then reveal login.
    */

    setTimeout(
        () => {

            hide($("splashScreen"));

            show($("authScreen"));

            showAuthScreen(
                "loginScreen"
            );

        },
        1200
    );
}


/* ============================================================
   START
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    startNexora
);