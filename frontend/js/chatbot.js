document.addEventListener('DOMContentLoaded', () => {
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    
    chatbotContainer.innerHTML = `
        <div class="chatbot-bubble" id="chatbotBubble">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
        </div>
        <div class="chatbot-window" id="chatbotWindow">
            <div class="chatbot-header">
                <h3>Gym Assistant</h3>
                <span class="close-chat" id="closeChat">&times;</span>
            </div>
            <div class="chatbot-messages" id="chatMessages">
                <div class="message bot">Hello! I'm your East Blue Gym Assistant. How can I help you today?</div>
            </div>
            <div class="typing" id="typingIndicator">Assistant is typing...</div>
            <form class="chatbot-input" id="chatbotForm">
                <input type="text" id="chatInput" placeholder="Type a message..." required autocomplete="off">
                <button type="submit">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(chatbotContainer);

    const bubble = document.getElementById('chatbotBubble');
    const chatWindow = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('closeChat');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    let chatHistory = [];

    bubble.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        // Add user message to UI
        addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        typingIndicator.style.display = 'block';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: chatHistory })
            });

            const data = await response.json();
            
            if (data.reply) {
                addMessage(data.reply, 'bot');
                chatHistory.push({ role: 'user', text: message });
                chatHistory.push({ role: 'bot', text: data.reply });
            } else {
                addMessage("I'm sorry, I'm having trouble connecting right now.", 'bot');
            }
        } catch (err) {
            console.error('Chat error:', err);
            addMessage("Error connecting to server.", 'bot');
        } finally {
            typingIndicator.style.display = 'none';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
