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
        info: "limited to 200 people, rsvp required",
    };
    
    // Track authentication and reservation states
    let isAuthenticated = false;
    let reservationState = {
        stage: "initial", // Can be: initial, firstName, lastName, confirmation
        firstName: "",
        lastName: "",
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
        addMessage("would you like to make a reservation? please enter your first name.", 'ai');
    }
    
    // Function to handle reservation flow
    function handleReservationFlow(userInput) {
        switch (reservationState.stage) {
            case "firstName":
                reservationState.firstName = userInput.toLowerCase();
                reservationState.stage = "lastName";
                addMessage("thank you. please enter your last name.", 'ai');
                break;
                
            case "lastName":
                reservationState.lastName = userInput.toLowerCase();
                reservationState.stage = "confirmation";
                addMessage(`thank you, ${reservationState.firstName}. please confirm your reservation by typing 'yes' or cancel by typing 'no'.`, 'ai');
                break;
                
            case "confirmation":
                const response = userInput.toLowerCase();
                if (response === 'yes') {
                    reservationState.confirmed = true;
                    
                    // Store the reservation
                    const reservation = {
                        firstName: reservationState.firstName,
                        lastName: reservationState.lastName,
                        timestamp: new Date().toISOString()
                    };
                    reservations.push(reservation);
                    
                    // Store in localStorage for persistence (simple solution)
                    try {
                        localStorage.setItem('somewhere_reservations', JSON.stringify(reservations));
                    } catch (e) {
                        console.error("Could not save to localStorage", e);
                    }
                    
                    addMessage(`your reservation has been confirmed, ${reservationState.firstName}. we look forward to seeing you at the event. check your text messages for additional details closer to the date.`, 'ai');
                } else if (response === 'no') {
                    reservationState.confirmed = false;
                    addMessage("we understand. you can always come back later if you change your mind.", 'ai');
                } else {
                    addMessage("please respond with 'yes' or 'no' to confirm your reservation.", 'ai');
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