import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

class OAuthServer extends EventEmitter {
  constructor() {
    super();
    this.app = express();
    this.app.use(cors());
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.get('/login', (req, res) => {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const redirectUri = process.env.GITHUB_REDIRECT_URI;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user,repo,read:user`;
      res.redirect(githubAuthUrl);
    });

    this.app.get('/callback', async (req, res) => {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).send('No code provided');
      }

      try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }, {
          headers: {
            Accept: 'application/json',
          },
        });

        const accessToken = response.data.access_token;

        if (accessToken) {
          this.emit('token_received', accessToken);
          res.send(`
            <html>
              <head>
                <title>GitMatch — Authentication Successful</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                  * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                  }
                  body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #0d0d0d;
                    color: #f0ece6;
                    overflow: hidden;
                  }
                  .card {
                    background: #141414;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    padding: 3rem;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }
                  @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.96) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                  }
                  .brand {
                    font-family: 'Barlow Condensed', sans-serif;
                    font-size: 1.8rem;
                    font-weight: 900;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                    color: #f0ece6;
                    margin-bottom: 2rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                  }
                  .brand span {
                    color: #c8401a;
                  }
                  .success-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(34, 197, 94, 0.08);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    color: #22c55e;
                  }
                  h1 {
                    font-family: 'Barlow Condensed', sans-serif;
                    font-size: 2.2rem;
                    font-weight: 900;
                    letter-spacing: 0.01em;
                    text-transform: uppercase;
                    color: #f0ece6;
                    margin-bottom: 0.75rem;
                    line-height: 1.1;
                  }
                  p {
                    color: #888880;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin-bottom: 0;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="brand">GIT<span>MATCH</span></div>
                  <div class="success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h1>Success!</h1>
                  <p>Authentication was completed successfully. You can now return to the GitMatch app.</p>
                </div>
                <script>
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                </script>
              </body>
            </html>
          `);
        } else {
          res.status(500).send('Failed to exchange code for token');
        }
      } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  start(port) {
    this.server = this.app.listen(port, () => {
      console.log(`OAuth server running at http://localhost:${port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

export default new OAuthServer();
