document.addEventListener('DOMContentLoaded', function() {
    const supabaseUrl = 'https://kwmsqwfemtfupfesaxqd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3bXNxd2ZlbXRmdXBmZXNheHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDkyMjUsImV4cCI6MjA1Nzg4NTIyNX0.IVVp2qhVbwpwT_QCZpOE5mtWn-JojX8t2DTBPRqlKSo';
    // Fixed initialization - using window.supabase and renamed client
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    
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
        sometime: "18:00 to 24:00",
        somemore: "music. djs. art. dance. food. social. come as you are. free your mind. try something new. limited to 100 people."
    };
    
    // Function to save reservation data to Supabase
    async function saveReservationToSupabase(reservation) {
        // This uses the Supabase client to insert a new record in the 'reservations' table
        const { data, error } = await supabaseClient
            .from('reservations') // 'reservations' is the name of your table in Supabase
            .insert([reservation]); // Pass the reservation object
        
        // If there's an error, throw it so the .catch() above can handle it
        if (error) {
            throw error;
        }
        
        // Return the data (this will contain the newly created record)
        return data;
    }
    
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
                
                // Show typing indicator for the first message with delay
                const firstTypingIndicator = showTypingIndicator();
                
                // Disable input while messages are being typed
                chatInput.disabled = true;
                
                setTimeout(() => {
                    // Show the first message with event details
                    removeTypingIndicator(firstTypingIndicator);
                    addMessage("somewhere: xxx\nsomeday: april 5 2025", 'ai');
                    
                    // Show typing indicator for the password prompt
                    const passwordTypingIndicator = showTypingIndicator();
                    
                    setTimeout(() => {
                        removeTypingIndicator(passwordTypingIndicator);
                        addMessage("enter the secret password to continue", 'ai');
                        chatInput.disabled = false;
                        chatInput.focus();
                    }, getRandomDelay(800, 1500));
                    
                }, getRandomDelay(800, 1500));
                
            }, 10);
        }
    });
    
    // Handle chat input
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            const userMessage = chatInput.value.trim().toLowerCase(); // Convert to lowercase immediately
            
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
                        
                        // First send welcome message - with longer typing delay
                        const welcomeTypingIndicator = showTypingIndicator();
                        setTimeout(() => {
                            removeTypingIndicator(welcomeTypingIndicator);
                            let welcomeMessage = 'welcome. you found us. somewhere someday, we host events to express, create, and connect collectively. we explore the boundaries of freedom. we embrace limitless potential. here are the details of our next event:';
                            addMessage(welcomeMessage, 'ai');
                            
                            document.body.classList.add('authenticated');

                            // Then show typing for event details with increased delay
                            setTimeout(() => {
                                const detailsTypingIndicator = showTypingIndicator();
                                
                                setTimeout(() => {
                                    removeTypingIndicator(detailsTypingIndicator);
                                    
                                    // Format event details as a separate message
                                    let detailsMessage = '';
                                    for (const [key, value] of Object.entries(eventDetails)) {
                                        detailsMessage += `${key}: ${value}\n`;
                                    }
                                    
                                    addMessage(detailsMessage, 'ai');
                                    
                                    // Start reservation flow with another longer delay
                                    setTimeout(() => {
                                        const reservationTypingIndicator = showTypingIndicator();
                                        setTimeout(() => {
                                            removeTypingIndicator(reservationTypingIndicator);
                                            startReservation();
                                            chatInput.disabled = false;
                                            chatInput.focus(); // Added focus
                                        }, getRandomDelay(2000, 3000)); // Increased reservation prompt delay
                                    }, 3000); // Added extra pause between details and reservation typing
                                }, getRandomDelay(2000, 3000)); // Increased details typing delay
                            }, 3000); // Added extra pause between welcome and details typing
                        }, getRandomDelay(800, 1500)); // Increased welcome typing delay
                    } else {
                        // Wrong password
                        addMessage("incorrect password. try again.", 'ai');
                        chatInput.disabled = false;
                        chatInput.focus(); // Added focus
                    }
                }, getRandomDelay(800, 1500)); // Slightly increased password check delay
            } else {
                // Handle reservation flow with delay
                setTimeout(() => {
                    removeTypingIndicator(typingIndicator);
                    handleReservationFlow(userMessage);
                    // Note: we DO NOT re-enable input here, as each step in handleReservationFlow 
                    // handles its own input enabling at the appropriate time
                }, getRandomDelay(1000, 1800)); // Increased reservation flow response delay
            }

            chatInput.value = '';
        }
    });

    // Handler for send button
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            if (chatInput.value.trim() !== '') {
                // Force lowercase before dispatching event
                chatInput.value = chatInput.value.toLowerCase();
                
                // Simulate an Enter keypress
                const event = new KeyboardEvent('keypress', {
                    key: 'Enter'
                });
                chatInput.dispatchEvent(event);
            }
        });
    }
    
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
        addMessage("to gain access, you'll need to reserve your attendance. please enter your first name.", 'ai');
    }
        
    // Function to handle reservation flow
    function handleReservationFlow(userInput) {
        switch (reservationState.stage) {
            case "firstName":
                reservationState.firstName = userInput.toLowerCase();
                reservationState.stage = "lastName";
                
                // Add typing indicator for last name request
                const lastNameTypingIndicator = showTypingIndicator();
                
                // Delay the last name request message
                setTimeout(() => {
                    removeTypingIndicator(lastNameTypingIndicator);
                    addMessage("please enter your last name.", 'ai');
                    chatInput.disabled = false; // Re-enable input
                    chatInput.focus();
                }, getRandomDelay(1000, 1800));
                
                // Input remains disabled while typing
                break;
                
            case "lastName":
                reservationState.lastName = userInput.toLowerCase();
                reservationState.stage = "phoneNumber";
                
                // Add typing indicator for phone number request
                const phoneTypingIndicator = showTypingIndicator();
                
                // Delay the phone number request message
                setTimeout(() => {
                    removeTypingIndicator(phoneTypingIndicator);
                    addMessage("please enter your phone number. include country code if international (e.g., +44 for UK).", 'ai');
                    chatInput.disabled = false; // Re-enable input
                    chatInput.focus();
                }, getRandomDelay(1000, 1800));
                
                // Input remains disabled while typing
                break;
                
            case "phoneNumber":
                // Store the original phone input
                const phoneInput = userInput.trim();
                
                // Basic validation - must contain digits and be at least 7 characters
                if (!/\d/.test(phoneInput) || phoneInput.length < 7) {
                    addMessage("please enter a valid phone number. include country code if international.", 'ai');
                    chatInput.disabled = false; // Re-enable input for retry
                    chatInput.focus();
                    return; // Don't proceed to next stage
                }
                
                reservationState.phoneNumber = phoneInput;
                reservationState.stage = "verification";
                
                // Add typing indicator for verification message
                const verifyTypingIndicator = showTypingIndicator();
                
                // Delay the verification message
                setTimeout(() => {
                    removeTypingIndicator(verifyTypingIndicator);
                    // Show all collected information for verification
                    const verificationMessage = `please verify your information:\n\nfirst name: ${reservationState.firstName}\nlast name: ${reservationState.lastName}\nphone: ${formatPhoneNumber(reservationState.phoneNumber)}\n\ntype 'correct' to confirm or 'edit' to make changes.`;
                    addMessage(verificationMessage, 'ai');
                    chatInput.disabled = false; // Re-enable input
                    chatInput.focus();
                }, getRandomDelay(1000, 1800));
                
                // Input remains disabled while typing
                break;
                
            case "verification":
                const verificationResponse = userInput.toLowerCase();
                
                if (verificationResponse === 'correct') {
                    reservationState.stage = "confirmation";
                    
                    // Show the archive link
                    const archiveLink = document.getElementById('archive-link');
                    if (archiveLink) {
                        archiveLink.classList.add('visible');
                    }    

                    // Add typing indicator for confirmation message
                    const confirmTypingIndicator = showTypingIndicator();
                    
                    // Delay the confirmation message
                    setTimeout(() => {
                        removeTypingIndicator(confirmTypingIndicator);
                        addMessage("thank you for verifying. type 'yes' to secure your place at the event or 'no' to cancel.", 'ai');
                        chatInput.disabled = false; // Re-enable input
                        chatInput.focus();
                    }, getRandomDelay(1000, 1800));
                    
                    // Input remains disabled while typing
                } else if (verificationResponse === 'edit') {
                    reservationState.stage = "firstName";
                    
                    // Add typing indicator for edit message
                    const editTypingIndicator = showTypingIndicator();
                    
                    // Delay the edit message
                    setTimeout(() => {
                        removeTypingIndicator(editTypingIndicator);
                        addMessage("let's update your information. please enter your first name again.", 'ai');
                        chatInput.disabled = false; // Re-enable input
                        chatInput.focus();
                    }, getRandomDelay(1000, 1800));
                    
                    // Input remains disabled while typing
                } else {
                    // For invalid responses, show typing indicator
                    const invalidTypingIndicator = showTypingIndicator();
                    
                    // Delay the invalid response message
                    setTimeout(() => {
                        removeTypingIndicator(invalidTypingIndicator);
                        addMessage("type 'correct' to confirm your information or 'edit' to make changes.", 'ai');
                        chatInput.disabled = false; // Re-enable input
                        chatInput.focus();
                    }, getRandomDelay(1000, 1800));
                    
                    // Input remains disabled while typing
                }
                break;
                
            case "confirmation":
                const response = userInput.toLowerCase();
                
                if (response === 'yes') {
                    reservationState.confirmed = true;
                    
                    // Show a typing indicator while saving
                    const savingTypingIndicator = showTypingIndicator();
                    
                    // Create the reservation object with column names matching your Supabase table
                    const reservation = {
                        first_name: reservationState.firstName,
                        last_name: reservationState.lastName,
                        phone_number: reservationState.phoneNumber,
                        created_at: new Date().toISOString()
                    };
                    
                    // Store the reservation in Supabase - this is an asynchronous call
                    saveReservationToSupabase(reservation).then(() => {
                        // This executes if the save was successful
                        setTimeout(() => {
                            removeTypingIndicator(savingTypingIndicator);
                            addMessage(`you're in, ${reservationState.firstName}. we look forward to seeing you. you'll receive text updates at ${formatPhoneNumber(reservationState.phoneNumber)} as the event approaches.`, 'ai');
                            chatInput.disabled = false; // Re-enable input
                            chatInput.focus();
                            
                            // Reset for potential future interactions
                            reservationState.stage = "complete";
                        }, getRandomDelay(800, 1500));
                    }).catch(error => {
                        // This executes if there was an error saving to Supabase
                        console.error("Error saving to Supabase:", error);
                        
                        // Still show success to the user even if the database save failed
                        setTimeout(() => {
                            removeTypingIndicator(savingTypingIndicator);
                            addMessage(`you're in, ${reservationState.firstName}. we look forward to seeing you. you'll receive text updates at ${formatPhoneNumber(reservationState.phoneNumber)} as the event approaches.`, 'ai');
                            chatInput.disabled = false; // Re-enable input
                            chatInput.focus();
                            
                            // Reset for potential future interactions
                            reservationState.stage = "complete";
                        }, getRandomDelay(800, 1500));
                    });
                    
                    // Input remains disabled while saving and typing
                } else if (response === 'no') {
                    // Show typing indicator for no response
                    const noResponseTypingIndicator = showTypingIndicator();
                    
                    setTimeout(() => {
                        removeTypingIndicator(noResponseTypingIndicator);
                        addMessage("we understand. come back later if you change your mind.", 'ai');
                        chatInput.disabled = false; // Re-enable input
                        chatInput.focus();
                        
                        // Update state
                        reservationState.confirmed = false;
                        reservationState.stage = "complete";
                    }, getRandomDelay(1000, 1800));
                    
                    // Input remains disabled while typing
                } else {
                    // For invalid responses, show typing indicator
                    const invalidResponseTypingIndicator = showTypingIndicator();
                    
                    setTimeout(() => {
                        removeTypingIndicator(invalidResponseTypingIndicator);
                        addMessage("please respond with 'yes' or 'no' to confirm your attendance.", 'ai');
                        chatInput.disabled = false; // Re-enable input
                        chatInput.focus();
                    }, getRandomDelay(1000, 1800));
                    
                    // Input remains disabled while typing
                }
                break;
                
            case "complete":
                // Show typing indicator for complete message
                const completeTypingIndicator = showTypingIndicator();
                
                setTimeout(() => {
                    removeTypingIndicator(completeTypingIndicator);
                    addMessage("your reservation process is complete.", 'ai');
                    chatInput.disabled = false; // Re-enable input
                    chatInput.focus();
                }, getRandomDelay(1000, 1800));
                
                // Input remains disabled while typing
                break;
                
            default:
                // Show typing indicator for default message
                const defaultTypingIndicator = showTypingIndicator();
                
                setTimeout(() => {
                    removeTypingIndicator(defaultTypingIndicator);
                    addMessage("i'm not sure what you're asking.", 'ai');
                    chatInput.disabled = false; // Re-enable input
                    chatInput.focus();
                }, getRandomDelay(1000, 1800));
                
                // Input remains disabled while typing
                break;
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