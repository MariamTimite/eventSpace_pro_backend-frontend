import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { spaceService } from '../../services/api';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const initialState = {
  name: '',
  description: '',
  type: '',
  capacity: 1,
  price: '',
  priceType: 'HEURE',
  amenities: '',
  address: '',
  coordinates: '',
  images: [],
};

const CreateSpace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user || user.role !== 'ADMIN') {
    return <div className="p-8 text-center text-red-600 font-bold">Accès réservé aux administrateurs.</div>;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setFormData({ ...formData, images: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('capacity', formData.capacity);
      data.append('price', formData.price);
      data.append('priceType', formData.priceType);
      if (formData.amenities) data.append('amenities', JSON.stringify(formData.amenities.split(',')));
      if (formData.address) data.append('address', formData.address);
      if (formData.coordinates) data.append('coordinates', formData.coordinates);
      for (let i = 0; i < formData.images.length; i++) {
        data.append('images', formData.images[i]);
      }
      await spaceService.create(data);
      setSuccess('Espace créé avec succès !');
      setTimeout(() => navigate('/spaces'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'espace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={['ADMIN']}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="bg-white shadow-xl rounded-lg max-w-2xl w-full p-8 space-y-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Créer un nouvel espace</h2>
          <p className="text-center text-gray-500 mb-6">Remplissez tous les champs pour ajouter un espace à la plateforme.</p>
          {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-center">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded text-center">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Infos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nom de l'espace" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sélectionner</option>
                  <option value="BUREAU">Bureau</option>
                  <option value="SALLE_REUNION">Salle de réunion</option>
                  <option value="SALLE_CONFERENCE">Salle de conférence</option>
                  <option value="ESPACE_COWORKING">Espace coworking</option>
                  <option value="SALLE_FORMATION">Salle de formation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité *</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min={1} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre de personnes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Prix" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de prix *</label>
                <select name="priceType" value={formData.priceType} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="HEURE">Heure</option>
                  <option value="JOUR">Jour</option>
                  <option value="SEMAINE">Semaine</option>
                  <option value="MOIS">Mois</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Décrivez l'espace, ses atouts, etc." rows={3} />
              </div>
            </div>
            {/* Section Adresse et coordonnées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (JSON)</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={`{"street":"Rue 123","city":"Abidjan","country":"Côte d'Ivoire"}`} />
                <span className="text-xs text-gray-400">Format : {'{"street":"...","city":"...","country":"..."}'}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordonnées (JSON)</label>
                <input type="text" name="coordinates" value={formData.coordinates} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder='{"latitude":5.348,"longitude":-4.027}' />
                <span className="text-xs text-gray-400">Format : {'{"latitude":5.348,"longitude":-4.027}'}</span>
              </div>
            </div>
            {/* Section Commodités et images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commodités (séparées par des virgules)</label>
                <input type="text" name="amenities" value={formData.amenities} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Wifi, Climatisation, Parking..." />
                <span className="text-xs text-gray-400">Exemple : Wifi, Climatisation, Parking</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images *</label>
                <input type="file" name="images" accept="image/*" multiple required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-xs text-gray-400">Ajoutez au moins une image</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" disabled={loading} className="group relative flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création en cours...
                  </span>
                ) : (
                  'Créer l\'espace'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateSpace; 