import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import {Auth0Provider} from '@auth0/auth0-react'


createRoot(document.getElementById('root')).render(
    
    <BrowserRouter>

    <Auth0Provider
  domain="dev-ajr4xeni3l5fzgby.us.auth0.com"
  clientId="CTVz9XHSJTwE94a0Ov20KZAw5WtmoKS9"
  authorizationParams={{
    redirect_uri: window.location.origin
  }}
>

      <App />
</Auth0Provider>
    </BrowserRouter>

)
