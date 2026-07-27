// React StrictMode helps highlight potential bugs during development. It checks for deprecated code, unsafe lifecycle methods, and other issues, but it doesn't affect the production build.
import { StrictMode } from 'react'
// createRoot creates a React root container, and connects the React application to the HTML element in index.html.
import { createRoot } from 'react-dom/client'
// Global CSS is loaded before the app so base styles apply everywhere.
import './index.css'
// App is the top-level React component that controls routes, user state, and face detection.
import App from './App.jsx'
// Tachyons provides utility CSS classes (pa4, ma2, center, white, etc) used throughout the components.
import 'tachyons'

// The HTML file provides <div id="root"></div>; React renders the App component into that div.
createRoot(document.getElementById('root')).render(
  // wrap everything in React's development checker.
  <StrictMode> 
    {/* App contains the full frontend experience and communicates with the backend API. */}
    <App />
  </StrictMode>,
)
