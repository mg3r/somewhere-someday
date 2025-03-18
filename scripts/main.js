document.addEventListener('DOMContentLoaded', function() {
    const triangleContainer = document.getElementById('triangle-container');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    
    // Event details that will be shown after correct password
    const eventDetails = {
        name: "Somewhere Someday",
        nextEvent: "March 21, 2025",
        location: "Underground Warehouse, 123 Hidden Street",
        time: "10 PM - 6 AM",
        lineup: "DJ Aurora, Techno Collective, Ambient Division",
        theme: "Nebular Dreams",
        dresscode: "All white, reflective materials encouraged",
        tickets: "Limited to 200 people, RSVP required",
        contact: "text 555-333-3333 for more info"
    };
    
    // Show chat when clicking anywhere on the page
    document.body.addEventListener('click', function() {
        if (chatContainer.classList.contains('hidden')) {
            chatContainer.style.display = 'block';
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
                    addMessage("Incorrect password. Please try again.", 'ai');
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
});