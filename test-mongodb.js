const { exec } = require('child_process');
const path = require('path');

console.log('🔍 Test de connexion MongoDB...\n');

// Utiliser le script de test du backend
const backendTestPath = path.join(__dirname, 'backend', 'test-api.js');

console.log('📡 Test de connexion via le backend...');

exec(`node ${backendTestPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez que MongoDB est démarré');
    console.log('2. Vérifiez que le port 27017 est disponible');
    console.log('3. Vérifiez le fichier .env dans le dossier backend/');
    console.log('4. Essayez: mongod --dbpath /path/to/data/db');
    process.exit(1);
  }
  
  if (stderr) {
    console.error('⚠️ Avertissements:', stderr);
  }
  
  console.log('📤 Sortie du test:');
  console.log(stdout);
  
  if (stdout.includes('✅') || stdout.includes('success')) {
    console.log('\n🎉 MongoDB est prêt! Vous pouvez démarrer l\'application avec: npm run dev');
  } else {
    console.log('\n⚠️ Veuillez résoudre les problèmes MongoDB avant de continuer');
    process.exit(1);
  }
}); 