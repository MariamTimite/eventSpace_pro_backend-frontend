const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration automatique d\'EventSpace Pro...\n');

// Vérifier si le fichier .env existe déjà
const envPath = path.join(__dirname, 'backend', '.env');
const envExamplePath = path.join(__dirname, 'backend', 'env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ Le fichier .env existe déjà dans le dossier backend/');
} else {
  console.log('📝 Création du fichier .env...');
  
  if (fs.existsSync(envExamplePath)) {
    // Copier le contenu de env.example
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env créé à partir de env.example');
  } else {
    // Créer un fichier .env par défaut
    const defaultEnvContent = `# Configuration du serveur
PORT=5001

# Configuration JWT
JWT_SECRET=mon_secret_jwt_super_securise_2024_eventspace_pro

# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/eventspace

# Configuration des uploads (optionnel)
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
`;
    fs.writeFileSync(envPath, defaultEnvContent);
    console.log('✅ Fichier .env créé avec la configuration par défaut');
  }
}

// Vérifier les prérequis
console.log('\n🔍 Vérification des prérequis...');

// Vérifier Node.js
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Vérifier npm
try {
  const npmVersion = require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
  console.log('❌ npm non trouvé');
}

// Vérifier la structure des dossiers
const requiredDirs = ['backend', 'frontend'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Dossier ${dir}/ trouvé`);
  } else {
    console.log(`❌ Dossier ${dir}/ manquant`);
  }
});

// Vérifier les package.json
const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
const frontendPackagePath = path.join(__dirname, 'frontend', 'package.json');

if (fs.existsSync(backendPackagePath)) {
  console.log('✅ package.json du backend trouvé');
} else {
  console.log('❌ package.json du backend manquant');
}

if (fs.existsSync(frontendPackagePath)) {
  console.log('✅ package.json du frontend trouvé');
} else {
  console.log('❌ package.json du frontend manquant');
}

console.log('\n📋 Instructions de démarrage:');
console.log('1. Assurez-vous que MongoDB est démarré');
console.log('2. Installez les dépendances: npm run install-all');
console.log('3. Démarrez l\'application: npm run dev');
console.log('\n🌐 URLs d\'accès:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend: http://localhost:5001');
console.log('- API Health: http://localhost:5001/api/health');

console.log('\n✨ Configuration terminée!'); 