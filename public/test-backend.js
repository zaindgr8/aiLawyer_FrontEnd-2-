// Simple script to test if the backend is accessible
async function testBackendConnection() {
  const API_URL = "http://localhost:8000";
  const resultElement = document.getElementById("result");

  try {
    resultElement.innerHTML = "Testing connection to backend...";

    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      resultElement.innerHTML = `✅ Backend is running! Response: ${JSON.stringify(
        data
      )}`;
      resultElement.style.color = "green";
    } else {
      resultElement.innerHTML = `❌ Backend responded with status ${response.status} ${response.statusText}`;
      resultElement.style.color = "orange";
    }
  } catch (error) {
    resultElement.innerHTML = `❌ Cannot connect to backend! Error: ${error.message}`;
    resultElement.style.color = "red";
    console.error("Connection test failed:", error);
  }
}

// Try alternative endpoint if health endpoint isn't available
async function testChatEndpoint() {
  const API_URL = "http://localhost:8000";
  const resultElement = document.getElementById("chat-result");

  try {
    resultElement.innerHTML = "Testing chat endpoint...";

    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "test message",
        country: "uae",
      }),
    });

    if (response.ok) {
      resultElement.innerHTML = "✅ Chat endpoint accessible";
      resultElement.style.color = "green";
    } else {
      const errorText = await response.text();
      resultElement.innerHTML = `❌ Chat endpoint error: ${response.status} - ${errorText}`;
      resultElement.style.color = "orange";
    }
  } catch (error) {
    resultElement.innerHTML = `❌ Cannot connect to chat endpoint: ${error.message}`;
    resultElement.style.color = "red";
  }
}
