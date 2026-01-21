const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.oauthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'No code provided' });
  }

  try {
    // 1. Exchange code for Access Token
    const tokenResponse = await axios.post(
      `${process.env.KEYCLOAK_URL}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        code: code,
        redirect_uri: 'http://localhost:3000/auth/callback'
      }),
      {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
      }
    );

    const keycloakAccessToken = tokenResponse.data.access_token;

    // 2. Get User Info
    const userResponse = await axios.get(
      `${process.env.KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
      {
        headers: { Authorization: `Bearer ${keycloakAccessToken}` }
      }
    );

    const { email, preferred_username } = userResponse.data;

    // 3. Find or Create User
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create with 'keycloak' provider
      user = await User.create({
        username: preferred_username || email.split('@')[0],
        email: email,
        password: 'oauth_user',
        role: 'user',
        provider: 'keycloak'
      });
    } else {
      // Update provider if existing
      if (user.provider !== 'keycloak') {
        user.provider = 'keycloak';
        await user.save();
      }
    }

    // 4. Generate Our Token
    const ourToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Return Token + User Object
    res.json({ 
      accessToken: ourToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        provider: user.provider
      }
    });

  } catch (err) {
    console.error('OAuth Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'OAuth Failed' });
  }
};