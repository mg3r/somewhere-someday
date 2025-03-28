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
    
    // Create the mobile triangle cue element
    const mobileTriangleCue = document.createElement('div');
    mobileTriangleCue.id = 'mobile-triangle-cue';
    
    // Create SVG triangle similar to cursor triangle
    mobileTriangleCue.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%">
            <polygon points="8,16 0,0 16,0" fill="white"/>
        </svg>
    `;
    
    // Add to triangle container
    triangleContainer.appendChild(mobileTriangleCue);
    
    // Function to check if device is mobile
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }
    
    // Show the mobile triangle cue with a delay on mobile devices
    if (isMobileDevice()) {
        // Delay showing the cue to let the page load properly first
        setTimeout(() => {
            mobileTriangleCue.classList.add('show-mobile-cue');
        }, 1000);
    }
    
    // Hide the mobile cue when the chat is visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                // If chat is visible, hide the mobile cue
                if (chatContainer.style.display !== 'none' && !chatContainer.classList.contains('hidden')) {
                    mobileTriangleCue.style.display = 'none';
                }
            }
        });
    });
    
    // Start observing the chat container
    observer.observe(chatContainer, { attributes: true });
    
    // Also handle window resize events to show/hide based on viewport size
    window.addEventListener('resize', function() {
        if (isMobileDevice()) {
            // Only show if chat isn't open yet
            if (chatContainer.style.display === 'none' || chatContainer.classList.contains('hidden')) {
                mobileTriangleCue.style.display = 'block';
            }
        } else {
            mobileTriangleCue.style.display = 'none';
        }
    });
    
    // Clear existing initial message if there is one
    chatHistory.innerHTML = '';
    
    // Event details that will be shown after correct password
    const eventDetails = {
        somewhere: "emissary at 2032 p st nw, washington, dc 20036",
        someday: "april 5 2025",
        sometime: "19:00 to 24:00",
        somemore: "music. djs. dance. art. food. drinks. social. come as you are. free your mind. try something new. limited to 100 people."
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
    let isWaitlistFlow = false; // New flag to track waitlist flow
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
                        addMessage("enter the code to continue", 'ai');
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
                        // Correct password for direct invites
                        isAuthenticated = true;
                        isWaitlistFlow = false;
                        
                        // Show the archive link
                        const archiveLink = document.getElementById('archive-link');
                        if (archiveLink) {
                            archiveLink.classList.remove('hidden');
                            archiveLink.classList.add('visible');
                        }
                        
                        // First send welcome message - with longer typing delay
                        const welcomeTypingIndicator = showTypingIndicator();
                        setTimeout(() => {
                            removeTypingIndicator(welcomeTypingIndicator);
                            let welcomeMessage = 'welcome. you found us. somewhere someday, we host events to express, create, and connect. here are the details of our next event:';
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
                    } else if (userMessage === '111') {
                        // Alternative password for public/QR code signups
                        isAuthenticated = true;
                        isWaitlistFlow = true; // Set waitlist flow flag
                        
                        // Show the archive link
                        const archiveLink = document.getElementById('archive-link');
                        if (archiveLink) {
                            archiveLink.classList.remove('hidden');
                            archiveLink.classList.add('visible');
                        }
                        
                        // First send welcome message - with longer typing delay
                        const welcomeTypingIndicator = showTypingIndicator();
                        setTimeout(() => {
                            removeTypingIndicator(welcomeTypingIndicator);
                            // Step 1: Show the welcome message with "here are the details of our next event"
                            let welcomeMessage = 'welcome. you found us. somewhere someday, we host events to express, create, and connect. here are the details of our next event:';
                            addMessage(welcomeMessage, 'ai');
                            
                            document.body.classList.add('authenticated');

                            // Step 2: Show limited event details with increased delay
                            setTimeout(() => {
                                const detailsTypingIndicator = showTypingIndicator();
                                
                                setTimeout(() => {
                                    removeTypingIndicator(detailsTypingIndicator);
                                    
                                    // Format LIMITED event details as a separate message - excluding the location
                                    let detailsMessage = 'somewhere: xxx\n';
                                    detailsMessage += `someday: ${eventDetails.someday}\n`;
                                    detailsMessage += `somemore: ${eventDetails.somemore}`;
                                    
                                    addMessage(detailsMessage, 'ai');
                                    
                                    // Step 3: Start waitlist flow with another longer delay
                                    setTimeout(() => {
                                        const waitlistTypingIndicator = showTypingIndicator();
                                        setTimeout(() => {
                                            removeTypingIndicator(waitlistTypingIndicator);
                                            // We'll modify this message in the startWaitlist function
                                            startWaitlist();
                                            chatInput.disabled = false;
                                            chatInput.focus();
                                        }, getRandomDelay(2000, 3000));
                                    }, 3000);
                                }, getRandomDelay(2000, 3000));
                            }, 3000);
                        }, getRandomDelay(800, 1500));
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
                    try {
                        handleReservationFlow(userMessage);
                    } catch (err) {
                        // In case of any error, ensure the chat input is re-enabled
                        console.error("Error handling reservation flow:", err);
                        chatInput.disabled = false;
                        chatInput.focus();
                    }
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
    
    // Function to start the reservation process for direct invites
    function startReservation() {
        reservationState.stage = "firstName";
        addMessage("to gain access, you'll need to reserve your attendance. please enter your first name.", 'ai');
    }
    
    // Function to start the waitlist process for public/QR code signups
    function startWaitlist() {
        reservationState.stage = "firstName";
        addMessage("to unlock updates and gain access, you'll need to request to join our guestlist. please enter your first name.", 'ai');
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
                    addMessage("please enter your phone number.", 'ai');
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
                    addMessage("please enter a valid phone number. include country code.", 'ai');
                    chatInput.disabled = false; // Re-enable input
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
                    let verificationMessage;function addMessage(text, sender) {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');
                        messageElement.classList.add(sender + '-message');
                        
                        // Replace new lines with <br> for proper display
                        // We'll use innerHTML to allow HTML content
                        messageElement.innerHTML = text.replace(/\n/g, '<br>');
                        
                        chatHistory.appendChild(messageElement);
                        chatHistory.scrollTop = chatHistory.scrollHeight;
                        
                        // Add click event listeners to any links in the message
                        const links = messageElement.querySelectorAll('a');
                        links.forEach(link => {
                            link.addEventListener('click', function(event) {
                                // This prevents the click from bubbling up and triggering the body click handler
                                event.stopPropagation();
                            });
                        });
                    }
                    
                    if (isWaitlistFlow) {
                        verificationMessage = `please verify your information to receive updates:\n\nfirst name: ${reservationState.firstName}\nlast name: ${reservationState.lastName}\nphone: ${formatPhoneNumber(reservationState.phoneNumber)}\n\ntype 'correct' to confirm or 'edit' to make changes. by confirming, you agree to our text <a href="privacy-terms" target="_blank" style="color: #e0e0e0; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">privacy policy and terms</a>.`;
                    } else {
                        verificationMessage = `please verify your information to confirm your attendance and receive updates:\n\nfirst name: ${reservationState.firstName}\nlast name: ${reservationState.lastName}\nphone: ${formatPhoneNumber(reservationState.phoneNumber)}\n\ntype 'correct' to confirm or 'edit' to make changes. by confirming, you agree to our text <a href="privacy-terms" target="_blank" style="color: #e0e0e0; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">privacy policy and terms</a>.`;
                    }
                    
                    addMessage(verificationMessage, 'ai');
                    chatInput.disabled = false; // Re-enable input
                    chatInput.focus();
                }, getRandomDelay(1000, 1800));
                
                // Input remains disabled while typing
                break;
             
            case "verification":
                const verificationResponse = userInput.toLowerCase();
                
                if (verificationResponse === 'correct') {
                    // Disable input immediately
                    chatInput.disabled = true;
                    
                    // Create the reservation object
                    const reservation = {
                        first_name: reservationState.firstName,
                        last_name: reservationState.lastName,
                        phone_number: reservationState.phoneNumber,
                        created_at: new Date().toISOString(),
                        source: isWaitlistFlow ? 'public' : 'direct_invite' // Add source field
                    };
                    
                    // Show typing indicator
                    const confirmTypingIndicator = showTypingIndicator();
                    
                    // Save to Supabase
                    saveReservationToSupabase(reservation)
                        .then(() => {
                            // Remove typing indicator
                            removeTypingIndicator(confirmTypingIndicator);
                            
                            // Add confirmation message based on flow
                            let confirmationMessage;
                            
                            if (isWaitlistFlow) {
                                confirmationMessage = `you're in the loop, ${reservationState.firstName}. we'll text you at ${formatPhoneNumber(reservationState.phoneNumber)} with updates as the event approaches.`;
                            } else {
                                confirmationMessage = `you're in, ${reservationState.firstName}. we look forward to seeing you. we'll text you at ${formatPhoneNumber(reservationState.phoneNumber)} with updates as the event approaches.`;
                            }
                            
                            addMessage(confirmationMessage, 'ai');
                            
                            // Update reservation state
                            reservationState.stage = "complete";
                            reservationState.confirmed = true;
                            
                            // Re-enable input
                            chatInput.disabled = false;
                            chatInput.focus();
                        })
                        .catch(error => {
                            console.error("error saving to supabase:", error);
                            
                            // Remove typing indicator
                            removeTypingIndicator(confirmTypingIndicator);
                            
                            // Add confirmation message based on flow even if there's an error
                            let confirmationMessage;
                            
                            if (isWaitlistFlow) {
                                confirmationMessage = `you're in the loop, ${reservationState.firstName}. we'll text you at ${formatPhoneNumber(reservationState.phoneNumber)} with details about potential access as the event approaches.`;
                            } else {
                                confirmationMessage = `you're in, ${reservationState.firstName}. we look forward to seeing you. you'll receive text updates at ${formatPhoneNumber(reservationState.phoneNumber)} as the event approaches.`;
                            }
                            
                            addMessage(confirmationMessage, 'ai');
                            
                            // Update reservation state
                            reservationState.stage = "complete";
                            reservationState.confirmed = true;
                            
                            // Re-enable input
                            chatInput.disabled = false;
                            chatInput.focus();
                        });
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
                }
                break;
            
            case "complete":
                // Handle post-reservation messages with a simple response
                const postReservationIndicator = showTypingIndicator();
                
                setTimeout(() => {
                    removeTypingIndicator(postReservationIndicator);
                    
                    let responseMessage;
                    if (isWaitlistFlow) {
                        responseMessage = "thanks for your message. we'll be in touch with updates.";
                    } else {
                        responseMessage = "thanks for your message. we're looking forward to seeing you at the event!";
                    }
                    
                    addMessage(responseMessage, 'ai');
                    chatInput.disabled = false;
                    chatInput.focus();
                }, getRandomDelay(1000, 1800));
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
        // We'll use innerHTML to allow HTML content
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
        
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Add click event listeners to any links in the message
        const links = messageElement.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(event) {
                // This prevents the click from bubbling up and triggering the body click handler
                event.stopPropagation();
            });
        });
    }
    
    // Prevent the chat container click from triggering body click
    chatContainer.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});

// Force background color even if DOM content loaded event doesn't fire properly
document.body.style.backgroundColor = "#1a1a1a";