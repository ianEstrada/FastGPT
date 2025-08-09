/**
 * FastGPT Chatbot - JavaScript Frontend
 * Chatbot moderno con historial, selector de modelos y UI optimizada
 */

class FastGPTChatbot {
    constructor() {
        // Configuration
        this.config = {
            apiUrl: '/api/chat',
            modelsUrl: '/api/models',
            statusUrl: '/api/status',
            maxRetries: 3,
            retryDelay: 1000,
            typingDelay: 50,
            maxTokens: 2000,
            temperature: 0.7
        };

        // State management
        this.state = {
            chats: this.loadChats(),
            currentChatId: null,
            currentModel: 'llama3.1',
            availableModels: [],
            isConnected: false,
            isTyping: false,
            isSending: false
        };

        // DOM elements
        this.elements = {
            sidebar: document.getElementById('sidebar'),
            chatList: document.getElementById('chatList'),
            mainContent: document.getElementById('mainContent'),
            toggleSidebar: document.getElementById('toggleSidebar'),
            newChatBtn: document.getElementById('newChatBtn'),
            chatTitle: document.getElementById('chatTitle'),
            statusIndicator: document.getElementById('statusIndicator'),
            modelSelector: document.getElementById('modelSelector'),
            messagesContainer: document.getElementById('messagesContainer'),
            messageForm: document.getElementById('messageForm'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn')
        };

        this.init();
    }

    // Initialize the application
    async init() {
        try {
            this.bindEvents();
            await this.loadModels();
            await this.checkStatus();
            this.initializeChat();
            this.updateUI();
            
            console.log('🚀 FastGPT iniciado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar FastGPT:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    // Bind event listeners
    bindEvents() {
        // Sidebar controls
        this.elements.toggleSidebar.addEventListener('click', () => this.toggleSidebar());
        this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());

        // Model selector
        this.elements.modelSelector.addEventListener('change', (e) => {
            this.state.currentModel = e.target.value;
            this.saveState();
        });

        // Message form
        this.elements.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Auto-resize textarea
        this.elements.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateSendButton();
        });

        // Keyboard shortcuts
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Responsive behavior
        window.addEventListener('resize', () => this.handleResize());
        
        // Periodic status check
        setInterval(() => this.checkStatus(), 30000);
    }

    // Load available models
    async loadModels() {
        try {
        const response = await fetch(this.config.modelsUrl, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
            const data = await response.json();
            
            if (data.models && Array.isArray(data.models)) {
                this.state.availableModels = data.models;
                this.populateModelSelector();
                console.log(`📋 ${data.models.length} modelos cargados`);
            } else {
                console.warn('⚠️ No se pudieron cargar los modelos, usando valores por defecto');
                this.useDefaultModels();
            }
        } catch (error) {
            console.error('❌ Error cargando modelos:', error);
            this.useDefaultModels();
        }
    }

    // Use default models if API fails
    useDefaultModels() {
        this.state.availableModels = [
            { name: 'llama3.1', display_name: 'Llama 3.1', available: true },
            { name: 'qwen2.5', display_name: 'Qwen 2.5', available: true },
            { name: 'llama2', display_name: 'Llama 2', available: true },
            { name: 'mistral', display_name: 'Mistral', available: true }
        ];
        this.populateModelSelector();
    }

    // Populate model selector dropdown
    populateModelSelector() {
        const selector = this.elements.modelSelector;
        selector.innerHTML = '';

        this.state.availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name.split(':')[0]; // Remove version suffix
            option.textContent = model.display_name || model.name;
            option.disabled = !model.available;
            
            if (model.name.includes(this.state.currentModel)) {
                option.selected = true;
            }
            
            selector.appendChild(option);
        });
    }

    // Check Ollama connection status
    async checkStatus() {
        try {
            const response = await fetch(this.config.statusUrl, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await response.json();
            
            this.state.isConnected = data.status === 'connected';
            this.updateStatusIndicator();
            
        } catch (error) {
            this.state.isConnected = false;
            this.updateStatusIndicator();
        }
    }

    // Update status indicator
    updateStatusIndicator() {
        const indicator = this.elements.statusIndicator;
        if (this.state.isConnected) {
            indicator.classList.remove('disconnected');
            indicator.title = 'Conectado a Ollama';
        } else {
            indicator.classList.add('disconnected');
            indicator.title = 'Desconectado de Ollama';
        }
    }

    // Initialize chat system
    initializeChat() {
        if (this.state.chats.length === 0) {
            this.createNewChat();
        } else {
            this.state.currentChatId = this.state.chats[0].id;
        }
        this.renderChatList();
        this.renderCurrentChat();
    }

    // Create a new chat
    createNewChat() {
        const newChat = {
            id: this.generateId(),
            title: 'Nuevo Chat',
            messages: [],
            model: this.state.currentModel,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.state.chats.unshift(newChat);
        this.state.currentChatId = newChat.id;
        
        this.saveChats();
        this.renderChatList();
        this.renderCurrentChat();
        
        // Hide sidebar on mobile after creating new chat
        if (window.innerWidth <= 768) {
            this.hideSidebar();
        }
    }

    // Delete a chat
    deleteChat(chatId) {
        if (confirm('¿Estás seguro de que quieres eliminar este chat?')) {
            this.state.chats = this.state.chats.filter(chat => chat.id !== chatId);
            
            if (this.state.currentChatId === chatId) {
                if (this.state.chats.length > 0) {
                    this.state.currentChatId = this.state.chats[0].id;
                } else {
                    this.createNewChat();
                    return;
                }
            }
            
            this.saveChats();
            this.renderChatList();
            this.renderCurrentChat();
        }
    }

    // Switch to a specific chat
    switchToChat(chatId) {
        this.state.currentChatId = chatId;
        this.renderChatList();
        this.renderCurrentChat();
        
        // Hide sidebar on mobile after selecting chat
        if (window.innerWidth <= 768) {
            this.hideSidebar();
        }
    }

    // Render chat list in sidebar
    renderChatList() {
        const chatList = this.elements.chatList;
        chatList.innerHTML = '';

        this.state.chats.forEach(chat => {
            const chatItem = this.createChatItem(chat);
            chatList.appendChild(chatItem);
        });
    }

    // Create a chat item element
    createChatItem(chat) {
        const isActive = chat.id === this.state.currentChatId;
        const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;

        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${isActive ? 'active' : ''}`;
        chatItem.onclick = () => this.switchToChat(chat.id);

        chatItem.innerHTML = `
            <div class="chat-item-title">${this.escapeHtml(chat.title)}</div>
            <div class="chat-item-preview">
                ${lastMessage ? this.escapeHtml(this.truncate(lastMessage.content, 50)) : 'Chat vacío'}
            </div>
            <div class="chat-item-actions" style="position: absolute; top: 0.5rem; right: 0.5rem; opacity: 0; transition: opacity 0.2s;">
                <button onclick="event.stopPropagation(); fastGPT.deleteChat('${chat.id}')" 
                        style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 0.25rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Show actions on hover
        chatItem.addEventListener('mouseenter', () => {
            chatItem.querySelector('.chat-item-actions').style.opacity = '1';
        });
        
        chatItem.addEventListener('mouseleave', () => {
            chatItem.querySelector('.chat-item-actions').style.opacity = '0';
        });

        return chatItem;
    }

    // Render current chat messages
    renderCurrentChat() {
        const currentChat = this.getCurrentChat();
        if (!currentChat) return;

        this.elements.chatTitle.textContent = currentChat.title;
        this.elements.messagesContainer.innerHTML = '';

        if (currentChat.messages.length === 0) {
            this.showEmptyState();
        } else {
            currentChat.messages.forEach(message => {
                this.appendMessage(message.content, message.role, false);
            });
        }

        this.scrollToBottom();
    }

    // Show empty state
    showEmptyState() {
        this.elements.messagesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h2>¡Hola! Soy FastGPT</h2>
                <p>¿En qué puedo ayudarte hoy? Escribe tu mensaje y comencemos a conversar.</p>
            </div>
        `;
    }

    // Send a message
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.state.isSending) return;

        this.state.isSending = true;
        this.updateSendButton();
        
        // Clear empty state if present
        const emptyState = this.elements.messagesContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Add user message
        this.appendMessage(message, 'user');
        this.addMessageToCurrentChat(message, 'user');
        this.elements.messageInput.value = '';
        this.autoResizeTextarea();

        // Update chat title if it's a new chat
        this.updateChatTitle(message);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Prepare context for the API
            const currentChat = this.getCurrentChat();
            const context = currentChat.messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

            const response = await this.callChatAPI(message, context);
            
            if (response.error) {
                throw new Error(response.error);
            }

            const botReply = response.response || response.completion || 'Lo siento, no pude generar una respuesta.';
            
            // Remove typing indicator and add bot response
            this.hideTypingIndicator();
            await this.typeMessage(botReply, 'bot');
            this.addMessageToCurrentChat(botReply, 'assistant');

        } catch (error) {
            this.hideTypingIndicator();
            const errorMsg = `Error: ${error.message}`;
            this.appendMessage(errorMsg, 'bot');
            this.addMessageToCurrentChat(errorMsg, 'assistant');
            console.error('❌ Error enviando mensaje:', error);
        } finally {
            this.state.isSending = false;
            this.updateSendButton();
            this.saveChats();
        }
    }

    // Call chat API
    async callChatAPI(message, context) {
        const payload = {
            model: this.state.currentModel,
            prompt: message,
            context: context,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens
        };

        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    // Append a message to the chat
    appendMessage(content, role, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-content">${this.formatMessage(content)}</div>
            <div class="message-time">${timeString}</div>
        `;

        if (animate) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(20px)';
        }

        this.elements.messagesContainer.appendChild(messageDiv);

        if (animate) {
            requestAnimationFrame(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            });
        }

        this.scrollToBottom();
        return messageDiv;
    }

    // Type message with animation
    async typeMessage(content, role) {
        const messageDiv = this.appendMessage('', role);
        const contentDiv = messageDiv.querySelector('.message-content');
        
        for (let i = 0; i < content.length; i++) {
            contentDiv.textContent += content[i];
            this.scrollToBottom();
            await this.delay(this.config.typingDelay);
        }
        
        // Update with formatted content after typing
        contentDiv.innerHTML = this.formatMessage(content);
    }

    // Show typing indicator
    showTypingIndicator() {
        if (this.elements.messagesContainer.querySelector('.typing-indicator')) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>Escribiendo...</span>
        `;

        this.elements.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        this.state.isTyping = true;
    }

    // Hide typing indicator
    hideTypingIndicator() {
        const typingIndicator = this.elements.messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.state.isTyping = false;
    }

    // Add message to current chat
    addMessageToCurrentChat(content, role) {
        const currentChat = this.getCurrentChat();
        if (currentChat) {
            currentChat.messages.push({
                content,
                role,
                timestamp: new Date().toISOString()
            });
            currentChat.updatedAt = new Date().toISOString();
        }
    }

    // Update chat title based on first message
    updateChatTitle(firstMessage) {
        const currentChat = this.getCurrentChat();
        if (currentChat && currentChat.title === 'Nuevo Chat') {
            currentChat.title = this.truncate(firstMessage, 30);
            this.elements.chatTitle.textContent = currentChat.title;
            this.renderChatList();
        }
    }

    // Format message content (supports basic markdown)
    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Auto-resize textarea
    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Update send button state
    updateSendButton() {
        const hasContent = this.elements.messageInput.value.trim().length > 0;
        const isEnabled = hasContent && !this.state.isSending && this.state.isConnected;
        
        this.elements.sendBtn.disabled = !isEnabled;
        
        if (this.state.isSending) {
            this.elements.sendBtn.innerHTML = '<div class="spinner"></div>';
        } else {
            this.elements.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    // Sidebar controls
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('show');
        this.elements.sidebar.classList.toggle('hidden');
    }

    showSidebar() {
        this.elements.sidebar.classList.add('show');
        this.elements.sidebar.classList.remove('hidden');
    }

    hideSidebar() {
        this.elements.sidebar.classList.remove('show');
        this.elements.sidebar.classList.add('hidden');
    }

    // Handle window resize
    handleResize() {
        if (window.innerWidth > 768) {
            this.elements.sidebar.classList.remove('show', 'hidden');
            this.elements.mainContent.classList.remove('expanded');
        }
    }

    // Scroll to bottom of messages
    scrollToBottom() {
        requestAnimationFrame(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        });
    }

    // Get current chat
    getCurrentChat() {
        return this.state.chats.find(chat => chat.id === this.state.currentChatId);
    }

    // Save/Load functions
    saveChats() {
        try {
            localStorage.setItem('fastgpt_chats', JSON.stringify(this.state.chats));
        } catch (error) {
            console.error('❌ Error guardando chats:', error);
        }
    }

    loadChats() {
        try {
            const chats = localStorage.getItem('fastgpt_chats');
            return chats ? JSON.parse(chats) : [];
        } catch (error) {
            console.error('❌ Error cargando chats:', error);
            return [];
        }
    }

    saveState() {
        try {
            localStorage.setItem('fastgpt_state', JSON.stringify({
                currentModel: this.state.currentModel,
                currentChatId: this.state.currentChatId
            }));
        } catch (error) {
            console.error('❌ Error guardando estado:', error);
        }
    }

    loadState() {
        try {
            const state = localStorage.getItem('fastgpt_state');
            if (state) {
                const parsedState = JSON.parse(state);
                this.state.currentModel = parsedState.currentModel || 'llama3.1';
                this.state.currentChatId = parsedState.currentChatId;
            }
        } catch (error) {
            console.error('❌ Error cargando estado:', error);
        }
    }

    updateUI() {
        this.loadState();
        this.updateSendButton();
        this.elements.modelSelector.value = this.state.currentModel;
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncate(str, length) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showError(message) {
        console.error('❌', message);
        // You could implement a toast notification system here
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fastGPT = new FastGPTChatbot();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FastGPTChatbot;
}
