import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CommentProvider } from './context/CommentContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CommentProvider>
          <App />
        </CommentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
