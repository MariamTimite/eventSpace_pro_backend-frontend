const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/spaces';
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'space-' + uniqueSuffix + extension);
  }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

// Configuration de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 10 // Maximum 10 fichiers
  }
});

// Middleware pour upload d'images d'espaces
const uploadSpaceImages = upload.array('images', 10);

// Middleware pour upload d'une seule image
const uploadSingleImage = upload.single('image');

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'La taille du fichier est trop importante (max 5MB)'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers (max 10)'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Champ de fichier inattendu'
      });
    }
  }
  
  if (error.message === 'Seules les images sont autorisées') {
    return res.status(400).json({
      success: false,
      message: 'Seules les images sont autorisées'
    });
  }
  
  next(error);
};

// Fonction pour supprimer un fichier
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('🗑️ Fichier supprimé:', filePath);
  }
};

// Fonction pour supprimer plusieurs fichiers
const deleteFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    deleteFile(filePath);
  });
};

// Middleware pour nettoyer les fichiers en cas d'erreur
const cleanupFiles = (req, res, next) => {
  // Sauvegarder les fichiers uploadés pour pouvoir les supprimer en cas d'erreur
  const uploadedFiles = req.files || (req.file ? [req.file] : []);
  
  // Ajouter une méthode pour nettoyer les fichiers
  req.cleanupUploadedFiles = () => {
    uploadedFiles.forEach(file => {
      deleteFile(file.path);
    });
  };
  
  next();
};

module.exports = {
  uploadSpaceImages,
  uploadSingleImage,
  handleUploadError,
  cleanupFiles,
  deleteFile,
  deleteFiles
}; 