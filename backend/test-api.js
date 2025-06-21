const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test de base
async function testBasicConnection() {
  try {
    console.log('🔍 Test de connexion de base...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ API connectée:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

// Test d'inscription
async function testRegistration() {
  try {
    console.log('🔍 Test d\'inscription...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: '123456',
      phone: '+22501234567' // Numéro ivoirien valide
    };
    
    const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    console.log('✅ Inscription réussie:', response.data.message);
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur d\'inscription:', error.response?.data || error.message);
    return null;
  }
}

// Test de connexion
async function testLogin(email, password) {
  try {
    console.log('🔍 Test de connexion...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    console.log('✅ Connexion réussie:', response.data.message);
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    return null;
  }
}

// Test de profil
async function testProfile(token) {
  try {
    console.log('🔍 Test de profil...');
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profil récupéré:', response.data.user.email);
    return true;
  } catch (error) {
    console.error('❌ Erreur de profil:', error.response?.data || error.message);
    return false;
  }
}

// Test de liste des espaces
async function testSpaces() {
  try {
    console.log('🔍 Test de liste des espaces...');
    const response = await axios.get(`${BASE_URL}/api/spaces`);
    console.log('✅ Espaces récupérés:', response.data.data.length, 'espaces');
    return true;
  } catch (error) {
    console.error('❌ Erreur de récupération des espaces:', error.response?.data || error.message);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests API...\n');
  
  // Test 1: Connexion de base
  const basicOk = await testBasicConnection();
  if (!basicOk) {
    console.log('❌ Arrêt des tests - API non accessible');
    return;
  }
  
  // Test 2: Inscription
  const token = await testRegistration();
  if (!token) {
    console.log('❌ Arrêt des tests - Inscription échouée');
    return;
  }
  
  // Test 3: Profil
  await testProfile(token);
  
  // Test 4: Espaces
  await testSpaces();
  
  console.log('\n✅ Tous les tests de base sont passés !');
  console.log('🎉 Votre API fonctionne correctement !');
  console.log('\n📝 Vous pouvez maintenant utiliser Postman avec la collection fournie.');
}

// Lancer les tests
runTests().catch(console.error); 