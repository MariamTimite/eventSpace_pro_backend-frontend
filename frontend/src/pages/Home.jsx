import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { spaceService } from '../services/api';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [popularSpaces, setPopularSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les espaces populaires (les 3 premiers)
    spaceService.getAll({ limit: 3 })
      .then(res => {
        setPopularSpaces(res.data.data || []);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des espaces populaires:', err);
        setPopularSpaces([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Trouvez l'espace parfait pour vos événements en Côte d'Ivoire
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Des salles de conférence, espaces de coworking, studios photo et plus encore à Abidjan, 
              Bouaké, San-Pédro et dans toute la Côte d'Ivoire. Réservez facilement l'espace qui correspond à vos besoins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/spaces"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                Voir les espaces
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition duration-300"
                >
                  S'inscrire
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir EventSpace Pro ?
            </h2>
            <p className="text-lg text-gray-600">
              La première plateforme de réservation d'espaces événementiels en Côte d'Ivoire
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recherche facile</h3>
              <p className="text-gray-600">
                Trouvez rapidement l'espace idéal dans votre ville avec nos filtres avancés et notre recherche intelligente.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservation instantanée</h3>
              <p className="text-gray-600">
                Réservez votre espace en quelques clics avec confirmation immédiate et paiement sécurisé.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion simplifiée</h3>
              <p className="text-gray-600">
                Gérez toutes vos réservations depuis votre tableau de bord personnel avec support en français.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Spaces Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Espaces populaires en Côte d'Ivoire
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez nos espaces les plus demandés à Abidjan et dans les grandes villes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : popularSpaces.length > 0 ? (
              // Espaces réels de la base de données
              popularSpaces.map((space) => (
                <div key={space._id || space.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="h-48 relative">
                    {space.images && space.images.length > 0 ? (
                      <img
                        src={space.images[0].startsWith('http') 
                          ? space.images[0] 
                          : `http://localhost:5001/${space.images[0].replace(/\\/g, '/')}`}
                        alt={space.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm">Aucune image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {space.name}
                    </h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {space.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      📍 {typeof space.address === 'string' 
                        ? space.address 
                        : `${space.address?.city || 'Abidjan'}, ${space.address?.country || 'Côte d\'Ivoire'}`}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {space.price?.toLocaleString()} FCFA / {space.priceType?.toLowerCase() || 'jour'}
                      </span>
                      <Link
                        to={`/spaces/${space._id || space.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Espaces par défaut si aucun espace trouvé
              <>
                {/* Space Card 1 */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Salle de conférence Cocody
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Salle moderne équipée pour conférences et présentations professionnelles.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">📍 Cocody, Abidjan</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">150 000 FCFA/jour</span>
                      <Link
                        to="/spaces"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Space Card 2 */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Espace Coworking Plateau
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Espace de travail collaboratif avec équipements modernes et connexion internet haut débit.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">📍 Plateau, Abidjan</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">80 000 FCFA/jour</span>
                      <Link
                        to="/spaces"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Space Card 3 */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Studio Photo Yopougon
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Studio professionnel pour shootings photos et vidéos avec éclairage professionnel.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">📍 Yopougon, Abidjan</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">120 000 FCFA/jour</span>
                      <Link
                        to="/spaces"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/spaces"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Voir tous les espaces
            </Link>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos espaces dans les grandes villes
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez nos espaces disponibles dans les principales villes de Côte d'Ivoire
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Abidjan</h3>
              <p className="text-gray-600 mb-4">La capitale économique</p>
              <p className="text-sm text-blue-600 font-medium">25+ espaces disponibles</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bouaké</h3>
              <p className="text-gray-600 mb-4">Le centre du pays</p>
              <p className="text-sm text-green-600 font-medium">8+ espaces disponibles</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">San-Pédro</h3>
              <p className="text-gray-600 mb-4">Le port du sud</p>
              <p className="text-sm text-purple-600 font-medium">5+ espaces disponibles</p>
            </div>
            
            <div className="text-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Korhogo</h3>
              <p className="text-gray-600 mb-4">Le nord du pays</p>
              <p className="text-sm text-orange-600 font-medium">3+ espaces disponibles</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à organiser votre prochain événement en Côte d'Ivoire ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'organisateurs qui font confiance à EventSpace Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/spaces"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Commencer maintenant
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-transparent hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg border-2 border-white transition duration-300"
              >
                Créer un compte
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Besoin d'aide ?
          </h3>
          <p className="text-gray-600 mb-6">
            Notre équipe est disponible pour vous accompagner
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium text-gray-900">📞 Téléphone</p>
              <p className="text-gray-600">+225 27 22 49 56 78</p>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">📧 Email</p>
              <p className="text-gray-600">contact@eventspace.ci</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            📍 Siège social : Cocody, Abidjan, Côte d'Ivoire
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home; 