document.addEventListener('DOMContentLoaded', function() {
    const triangleContainer = document.getElementById('triangle-container');
    const triangle = document.getElementById('triangle');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    
    // Event details that will be shown after correct password
    const eventDetails = {
        somewhere: "emissary at 2032 P St NW, Washington, DC 20036",
        someday: "april 5 2025",
        time: "6 pm to 12 pm",
        info: "limited to 100 people, rsvp required",
    };
    
    // Track authentication and reservation states
    let isAuthenticated = false;
    let reservationState = {
        stage: "initial", // Can be: initial, firstName, lastName, phoneNumber, verification, confirmation
        firstName: "",
        lastName: "",
        phoneNumber: "",
        confirmed: null
    };
    
    // Collection of reservations
    let reservations = [];
    
    // Load any existing reservations from localStorage
    try {
        const savedReservations = JSON.parse(localStorage.getItem('somewhere_reservations') || '[]');
        reservations = savedReservations;
    } catch (e) {
        console.error("Could not load reservations from localStorage", e);
    }
    
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
            
            if (!isAuthenticated) {
                // Check password
                setTimeout(() => {
                    if (userMessage === '333') {
                        // Correct password with welcome message
                        isAuthenticated = true;
                        document.body.classList.add('authenticated');
                        
                        let detailsMessage = 'welcome. you found us. somewhere someday, we meet to express ourselves freely as a collective. we explore the boundaries of freedom through music, food, dance, and art.\n\n';
                        
                        for (const [key, value] of Object.entries(eventDetails)) {
                            detailsMessage += `${key}: ${value}\n`;
                        }
                        
                        addMessage(detailsMessage, 'ai');
                        
                        // Start reservation flow
                        setTimeout(() => {
                            startReservation();
                        }, 1000);
                    } else {
                        // Wrong password
                        addMessage("incorrect password. please try again.", 'ai');
                    }
                }, 500);
            } else {
                // Handle reservation flow
                handleReservationFlow(userMessage);
            }
            
            chatInput.value = '';
        }
    });
    
    // Function to start the reservation process
    function startReservation() {
        reservationState.stage = "firstName";
        addMessage("to gain access to the event, a reservation is required. please enter your first name", 'ai');
    }
    
    // Function to handle reservation flow
    function handleReservationFlow(userInput) {
        switch (reservationState.stage) {
            case "firstName":
                reservationState.firstName = userInput.toLowerCase();
                reservationState.stage = "lastName";
                addMessage("please enter your last name.", 'ai');
                break;
                
            case "lastName":
                reservationState.lastName = userInput.toLowerCase();
                reservationState.stage = "phoneNumber";
                addMessage("please enter your phone number. include country code if international (e.g., +44 for UK).", 'ai');
                break;
                
            case "phoneNumber":
                // Store the original phone input
                const phoneInput = userInput.trim();
                
                // Basic validation - must contain digits and be at least 7 characters
                if (!/\d/.test(phoneInput) || phoneInput.length < 7) {
                    addMessage("please enter a valid phone number. include country code if international.", 'ai');
                    return; // Don't proceed to next stage
                }
                
                reservationState.phoneNumber = phoneInput;
                reservationState.stage = "verification";
                
                // Show all collected information for verification
                const verificationMessage = `please verify your information:\n\nfirst name: ${reservationState.firstName}\nlast name: ${reservationState.lastName}\nphone: ${formatPhoneNumber(reservationState.phoneNumber)}\n\ntype 'correct' to confirm or 'edit' to make changes.`;
                addMessage(verificationMessage, 'ai');
                break;
                
            case "verification":
                const verificationResponse = userInput.toLowerCase();
                
                if (verificationResponse === 'correct') {
                    reservationState.stage = "confirmation";
                    addMessage("thank you for verifying. please type 'yes' to complete your reservation or 'no' to cancel.", 'ai');
                } else if (verificationResponse === 'edit') {
                    reservationState.stage = "firstName";
                    addMessage("let's update your information. please enter your first name.", 'ai');
                } else {
                    addMessage("please type 'correct' to confirm your information or 'edit' to make changes.", 'ai');
                }
                break;
                
            case "confirmation":
                const response = userInput.toLowerCase();
                if (response === 'yes') {
                    reservationState.confirmed = true;
                    
                    // Store the reservation
                    const reservation = {
                        firstName: reservationState.firstName,
                        lastName: reservationState.lastName,
                        phoneNumber: reservationState.phoneNumber,
                        timestamp: new Date().toISOString()
                    };
                    reservations.push(reservation);
                    
                    // Store in localStorage for persistence (simple solution)
                    try {
                        localStorage.setItem('somewhere_reservations', JSON.stringify(reservations));
                    } catch (e) {
                        console.error("Could not save to localStorage", e);
                    }
                    
                    addMessage(`your reservation has been confirmed, ${reservationState.firstName}. we look forward to seeing you. you will receive text updates at ${formatPhoneNumber(reservationState.phoneNumber)} as the event approaches.`, 'ai');
                } else if (response === 'no') {
                    reservationState.confirmed = false;
                    addMessage("we understand. come back later if you change your mind.", 'ai');
                } else {
                    addMessage("please respond with 'yes' or 'no' to confirm your attendance.", 'ai');
                    return; // Don't change stage
                }
                
                // Reset for potential future interactions
                reservationState.stage = "complete";
                break;
                
            case "complete":
                addMessage("your reservation process is complete. if you have any questions, please text the contact number provided in the event details.", 'ai');
                break;
                
            default:
                addMessage("i'm not sure what you're asking. if you need help, please text the contact number provided in the event details.", 'ai');
        }
    }
    
    // Helper function to format phone numbers for display
    function formatPhoneNumber(phoneNumberString) {
        // Check if it's an international number (starts with + or 00)
        if (phoneNumberString.startsWith('+') || phoneNumberString.startsWith('00')) {
            // For international numbers, just return as is
            return phoneNumberString;
        }
        
        // For what seems like US numbers, format with hyphens
        const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        
        // Check if it's a 10-digit US number
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return match[1] + '-' + match[2] + '-' + match[3];
        }
        
        // For anything else, return as is
        return phoneNumberString;
    }
    
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

// Force background color even if DOM content loaded event doesn't fire properly
document.body.style.backgroundColor = "#1a1a1a";