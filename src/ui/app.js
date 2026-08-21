const form = document.querySelector('#message-form');
const input = document.querySelector('#message-input');
const messages = document.querySelector('#messages');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input?.value?.trim();
  if (!text || !messages) return;

  const bubble = document.createElement('div');
  bubble.className = 'message outgoing';
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  input.value = '';
});

// API integration is intentionally kept out of the UI bundle.
// Set the server-side Chatty Pi data service to connect the UI to the database/API.
