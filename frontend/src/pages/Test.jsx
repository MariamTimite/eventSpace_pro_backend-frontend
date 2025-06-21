import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Test = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/health');
      setHealthStatus(response.data);
      console.log('✅ Connexion API réussie:', response.data);
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur de connexion API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🧪 Test de Connexion - EventSpace Pro
          </h1>
          
          <div className="space-y-6">
            {/* Test de connexion API */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">🔗 Test de Connexion API</h2>
              
              <button
                onClick={testConnection}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? '🔄 Test en cours...' : '🔄 Tester la connexion'}
              </button>
              
              {healthStatus && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800">✅ Connexion réussie!</h3>
                  <pre className="mt-2 text-sm text-green-700 overflow-auto">
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800">❌ Erreur de connexion</h3>
                  <p className="mt-2 text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Informations de configuration */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">⚙️ Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Frontend</h3>
                  <p className="text-sm text-gray-600">Port: 3000</p>
                  <p className="text-sm text-gray-600">URL: http://localhost:3000</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Backend</h3>
                  <p className="text-sm text-gray-600">Port: 5001</p>
                  <p className="text-sm text-gray-600">URL: http://localhost:5001</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">API Base URL</h3>
                  <p className="text-sm text-gray-600">
                    {import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Base de données</h3>
                  <p className="text-sm text-gray-600">MongoDB: mongodb://localhost:27017/eventspace</p>
                </div>
              </div>
            </div>

            {/* Instructions de dépannage */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">🔧 Dépannage</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium text-gray-700">Si la connexion échoue:</h3>
                  <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                    <li>Vérifiez que MongoDB est démarré</li>
                    <li>Vérifiez que le backend est en cours d'exécution sur le port 5001</li>
                    <li>Vérifiez que le fichier .env existe dans le dossier backend/</li>
                    <li>Vérifiez les logs du serveur backend</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Commandes utiles:</h3>
                  <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                    <div># Démarrer MongoDB</div>
                    <div>mongod</div>
                    <br />
                    <div># Démarrer le backend</div>
                    <div>npm run server</div>
                    <br />
                    <div># Démarrer le frontend</div>
                    <div>npm run client</div>
                    <br />
                    <div># Démarrer les deux</div>
                    <div>npm run dev</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test; 