import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Toast } from 'radix-ui';
import { Toaster } from 'sonner';
import { UserProvider } from './context/userContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
    <BrowserRouter>
      <App />
      <Toaster/>
    </BrowserRouter>
    </UserProvider>
  </StrictMode>,
)
