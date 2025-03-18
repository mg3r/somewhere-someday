document.addEventListener('DOMContentLoaded', function() {
    const triangleContainer = document.getElementById('triangle-container');
    const triangle = document.getElementById('triangle');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    
    // Clear existing initial message if there is one
    chatHistory.innerHTML = '';
    
    // Event details that will be shown after correct password
    const eventDetails = {
        somewhere: "emissary at 2032 p st nw, washington, dc 20036",
        someday: "april 5 2025",
        time: "18:00 to 24:00",
        info: "limited to 100 people. come as you are."
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
                
                // Show typing indicator for initial message with delay
                const typingIndicator = showTypingIndicator();
                
                // Disable input while initial message is being typed
                chatInput.disabled = true;
                
                setTimeout(() => {
                    removeTypingIndicator(typingIndicator);
                    addMessage("enter the secret password", 'ai');
                    chatInput.disabled = false;
                    chatInput.focus();
                }, getRandomDelay(800, 1500));
                
            }, 10);
        }
    });
    
    // Handle chat input
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && chatInput.value.trim() !== '') {
                const userMessage = chatInput.value.trim();
                
                // Add user message to chat
                addMessage(userMessage, 'user');
                
                // Disable input while "AI" is typing
                chatInput.disabled = true;
                
                // Show typing indicator
                const typingIndicator = showTypingIndicator();
                
                if (!isAuthenticated) {
                    // Check password with delay
                    setTimeout(() => {
                        // Remove typing indicator
                        removeTypingIndicator(typingIndicator);
                        
                        if (userMessage === '333') {
                            // Correct password with welcome message
                            isAuthenticated = true;
                            document.body.classList.add('authenticated');
                            
                            // First send welcome message
                            let welcomeMessage = 'welcome. you found us. somewhere someday, we meet to express ourselves, create, and connect collectively. we explore the boundaries of freedom through music, food, dance, and art. we embrace limitless potential. you are invited to our next gathering. here are the details:';
                            
                            addMessage(welcomeMessage, 'ai');
                            
                            // Then show typing for event details with delay
                            const detailsTypingIndicator = showTypingIndicator();
                            
                            setTimeout(() => {
                                removeTypingIndicator(detailsTypingIndicator);
                                
                                // Format event details as a separate message
                                let detailsMessage = '';
                                for (const [key, value] of Object.entries(eventDetails)) {
                                    detailsMessage += `${key}: ${value}\n`;
                                }
                                
                                addMessage(detailsMessage, 'ai');
                                
                                // Start reservation flow with another delay
                                const reservationTypingIndicator = showTypingIndicator();
                                setTimeout(() => {
                                    removeTypingIndicator(reservationTypingIndicator);
                                    startReservation();
                                    chatInput.disabled = false;
                                }, getRandomDelay(1200, 2000));
                            }, getRandomDelay(1800, 2500));
                        } else {
                            // Wrong password
                            addMessage("incorrect password. try again.", 'ai');
                            chatInput.disabled = false;
                        }
                    }, getRandomDelay(800, 1500));
                } else {
                    // Handle reservation flow with delay
                    setTimeout(() => {
                        removeTypingIndicator(typingIndicator);
                        handleReservationFlow(userMessage); // <-- FIXED: Changed userInput to userMessage
                        chatInput.disabled = false;
                    }, getRandomDelay(600, 1200));
                }
                
                chatInput.value = '';
            }
        });
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'ai-message', 'typing-indicator');
        typingElement.innerHTML = '...';
        chatHistory.appendChild(typingElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return typingElement;
    }
    
    // Function to remove typing indicator
    function removeTypingIndicator(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    
    // Function to get a random delay time within a range
    function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Function to start the reservation process
    function startReservation() {
        reservationState.stage = "firstName";
        addMessage("to gain access to the event, a reservation is required. please enter your first name.", 'ai');
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
                    addMessage("thank you for verifying. type 'yes' to complete your reservation or 'no' to cancel.", 'ai');
                } else if (verificationResponse === 'edit') {
                    reservationState.stage = "firstName";
                    addMessage("let's update your information. please enter your first name.", 'ai');
                } else {
                    addMessage("type 'correct' to confirm your information or 'edit' to make changes.", 'ai');
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
        // Strip all non-digit characters except + for the analysis
        const rawInput = phoneNumberString;
        const digitsOnly = phoneNumberString.replace(/[^\d+]/g, '');
        
        // Handle US/Canada format (10 digits, may or may not start with +1)
        if ((digitsOnly.length === 10 && !digitsOnly.startsWith('+')) || 
            (digitsOnly.length === 11 && digitsOnly.startsWith('1')) ||
            (digitsOnly.length === 12 && digitsOnly.startsWith('+1'))) {
            
            // Extract the 10 digits (remove country code if present)
            const last10 = digitsOnly.slice(-10);
            const match = last10.match(/^(\d{3})(\d{3})(\d{4})$/);
            if (match) {
                // If it had a +1, preserve it
                const countryCode = digitsOnly.startsWith('+') ? '+1 ' : '';
                return countryCode + match[1] + '-' + match[2] + '-' + match[3];
            }
        }
        
        // Handle UK format (starts with +44, followed by 10 digits)
        if (digitsOnly.startsWith('+44') && digitsOnly.length === 13) {
            return '+44 ' + digitsOnly.slice(3, 7) + '-' + digitsOnly.slice(7);
        }
        
        // Handle Australian format (starts with +61, followed by 9 digits)
        if (digitsOnly.startsWith('+61') && digitsOnly.length === 12) {
            return '+61 ' + digitsOnly.slice(3, 5) + '-' + digitsOnly.slice(5);
        }
        
        // Handle common European formats
        // e.g., Germany +49, France +33, Spain +34, Italy +39
        const europeanPrefixes = ['+49', '+33', '+34', '+39'];
        for (const prefix of europeanPrefixes) {
            if (digitsOnly.startsWith(prefix)) {
                // Format as +XX XXX-XXX-XXX
                const afterPrefix = digitsOnly.slice(prefix.length);
                if (afterPrefix.length >= 9) {
                    return prefix + ' ' + afterPrefix.slice(0, 3) + '-' + 
                           afterPrefix.slice(3, 6) + '-' + afterPrefix.slice(6);
                }
            }
        }
        
        // For any other international format, try to add some spacing
        if (digitsOnly.startsWith('+') && digitsOnly.length > 7) {
            // Extract country code (typically 1-3 digits after the +)
            const match = digitsOnly.match(/^\+(\d{1,3})(\d+)$/);
            if (match) {
                const countryCode = match[1];
                const restOfNumber = match[2];
                
                // Split the rest into chunks of 3-4 digits
                if (restOfNumber.length <= 7) {
                    return '+' + countryCode + ' ' + restOfNumber;
                } else {
                    const firstPart = restOfNumber.slice(0, Math.ceil(restOfNumber.length / 2));
                    const secondPart = restOfNumber.slice(Math.ceil(restOfNumber.length / 2));
                    return '+' + countryCode + ' ' + firstPart + '-' + secondPart;
                }
            }
        }
        
        // If all else fails, return the original input
        return rawInput;
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