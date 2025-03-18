document.addEventListener('DOMContentLoaded', function() {
    const triangleContainer = document.getElementById('triangle-container');
    const triangle = document.getElementById('triangle');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    
    // Event details that will be shown after correct password
    const eventDetails = {
        name: "somewhere someday",
        nextEvent: "april 5 2025",
        location: "emissary at 2032 P St NW, Washington, DC 20036",
        time: "6 pm to 12 pm",
        info: "freedom of expression",
        tickets: "limited to 200 people, rsvp required",
    };
    
    // Make sure triangle is visible
    triangleContainer.style.display = 'flex';
    
    // Make sure chat is hidden initially
    chatContainer.style.display = 'none';
    chatContainer.classList.add('hidden');
    
    // Show chat when clicking anywhere on the page
    document.body.addEventListener('click', function(event) {
        if (chatContainer.classList.contains('hidden')) {
            chatContainer.style.display = 'block';
            
            // Small delay before removing the hidden class to trigger the transition
            setTimeout(() => {
                chatContainer.classList.remove('hidden');
            }, 10);
            
            chatInput.focus();
        }
    });
    
    // Handle chat input
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            const userMessage = chatInput.value.trim();
            
            // Add user message to chat
            addMessage(userMessage, 'user');
            
            // Process input and respond
            setTimeout(() => {
                if (userMessage === '333') {
                    // Correct password
                    let detailsMessage = `✨ Event Details ✨\n\n`;
                    
                    for (const [key, value] of Object.entries(eventDetails)) {
                        detailsMessage += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
                    }
                    
                    addMessage(detailsMessage, 'ai');
                } else {
                    // Wrong password
                    addMessage("incorrect password. please try again.", 'ai');
                }
            }, 500);
            
            chatInput.value = '';
        }
    });
    
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender + '-message');
        
        // Replace new lines with <br> for proper display
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
        
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // Prevent the chat container click from triggering body click
    chatContainer.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});