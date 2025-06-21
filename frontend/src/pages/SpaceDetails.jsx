import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/spaces/BookingModal';
import { spaceService } from '../services/api';
import { FaEdit, FaTrash, FaArrowLeft, FaCalendarCheck } from 'react-icons/fa';

const SpaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    spaceService.getById(id)
      .then(res => setSpace(res.data.data || res.data.space))
      .catch(() => setSpace(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookingSuccess = (booking) => {
    // Rediriger vers le dashboard ou afficher un message de succès
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet espace ?')) return;
    try {
      await spaceService.delete(id);
      navigate('/spaces');
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'espace...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace non trouvé</h2>
          <p className="text-gray-600 mb-4">L'espace que vous recherchez n'existe pas.</p>
          <Link
            to="/spaces"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Retour aux espaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  Accueil
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/spaces" className="ml-4 text-gray-400 hover:text-gray-500">
                    Espaces
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-500">{space.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                <img
                  src={space.images?.[selectedImage]}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {space.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${space.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Space Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{space.name}</h1>
                {user?.role === 'ADMIN' && (
                  <div className="flex gap-2">
                    <Link to={`/spaces/edit/${space._id || space.id}`} aria-label="Modifier">
                      <FaEdit className="text-yellow-500 hover:text-yellow-600 text-xl" />
                    </Link>
                    <button onClick={handleDelete} aria-label="Supprimer">
                      <FaTrash className="text-red-600 hover:text-red-700 text-xl" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-6">{space.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Caractéristiques</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacité:</span>
                      <span className="font-medium">{space.capacity} personnes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix:</span>
                      <span className="font-medium">{space.price} FCFA / {space.priceType?.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Note:</span>
                      <span className="font-medium">{space.rating?.average ?? 'N/A'} ★ ({space.rating?.count ?? 0} avis)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Localisation</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{typeof space.address === 'string' ? space.address : `${space.address?.street}, ${space.address?.city}, ${space.address?.country}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Commodités</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {space.amenities?.map((amenity, idx) => (
                  <li key={idx} className="text-gray-700 flex items-center">
                    <span className="mr-2">•</span> {amenity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Réserver */}
            {user?.role === 'USER' && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  <FaCalendarCheck className="mr-2" /> Réserver cet espace
                </button>
              </div>
            )}

            <BookingModal
              space={space}
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              onSuccess={handleBookingSuccess}
            />
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {space.price?.toLocaleString()} FCFA
                </div>
                <div className="text-gray-600">par {space.priceType?.toLowerCase()}</div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Capacité maximale:</span>
                  <span className="font-medium">{space.capacity} personnes</span>
                </div>
                {/* Ajoute d'autres infos pratiques ici si besoin */}
              </div>
              {user?.role === 'USER' && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                >
                  <FaCalendarCheck className="mr-2" /> Réserver maintenant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetails; 
