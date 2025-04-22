// Function to show typing indicator
function showTypingIndicator() {
  // Remove any existing typing indicator first
  hideTypingIndicator();

  // Clone the template
  const template = document.getElementById("typing-indicator-template");
  const indicator = template.content.cloneNode(true);

  // Add to chat container
  document.getElementById("chat").appendChild(indicator);

  // Scroll to bottom
  scrollToBottom();
}

// Function to hide typing indicator
function hideTypingIndicator() {
  const existingIndicator = document.querySelector("#chat .typing-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }
}

// Add typing indicator before sending the message to API
document.getElementById("send-button").addEventListener("click", function () {
  const messageInput = document.getElementById("user-input");
  const message = messageInput.value.trim();

  if (message) {
    addMessageToChat("user", message);
    messageInput.value = "";
    showTypingIndicator();

    // Simulate API call and response
    setTimeout(() => {
      hideTypingIndicator();
      // Replace this with actual API response handling
      addMessageToChat("ai", "This is a sample response from the AI.");
    }, 2000);
  }
});

// Helper function to scroll chat to bottom
function scrollToBottom() {
  const chatContainer = document.getElementById("chat");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
