import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL ERROR: Could not find root element to mount the Addis Bingo application.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Addis Bingo successfully mounted.");
  } catch (error) {
    console.error("React Mounting Failed:", error);
    rootElement.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif; text-align: center;">
      <h2>System Error</h2>
      <p>Failed to initialize the game engine. Please refresh or check the console.</p>
    </div>`;
  }
}