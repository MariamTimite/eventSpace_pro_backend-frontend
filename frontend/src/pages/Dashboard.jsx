import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import BookingStatusBadge from '../components/bookings/BookingStatusBadge';
import { BOOKING_STATUS, getNextStatus } from '../utils/bookingStatus';

const Dashboard = () => {
  const { user } = useAuth();
  const notification = useNotification();
  const [activeTab, setActiveTab] = useState('overview');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    console.log('🔍 Dashboard useEffect - user:', user);
    if (user && user.id) {
      console.log('✅ User trouvé, lancement de fetchReservations');
      fetchReservations();
    } else {
      console.log('❌ User non trouvé ou pas d\'ID');
      setLoading(false);
    }
  }, [user]);

  const fetchReservations = async () => {
    console.log('🚀 Début de fetchReservations');
    setLoading(true);
    try {
      console.log('📡 Appel API bookingService.getByUser avec user.id:', user.id);
      const response = await bookingService.getByUser(user.id);
      console.log('📥 Réponse API reçue:', response);
      console.log('📊 response.data:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log('✅ Données valides trouvées, nombre de réservations:', response.data.data.length);
        setReservations(response.data.data);
      } else {
        console.log('⚠️ Pas de données valides dans la réponse');
        setReservations([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réservations:', error);
      if (notification && notification.showNotification) {
        notification.showNotification('Erreur lors du chargement des réservations', 'error');
      }
      setReservations([]);
    } finally {
      console.log('🏁 Fin de fetchReservations, loading = false');
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, action) => {
    try {
      let response;
      switch (action) {
        case 'cancel':
          response = await bookingService.cancel(bookingId);
          break;
        case 'confirm':
          response = await bookingService.confirm(bookingId);
          break;
        case 'reject':
          response = await bookingService.update(bookingId, { status: BOOKING_STATUS.REJECTED });
          break;
        case 'start':
          response = await bookingService.update(bookingId, { status: BOOKING_STATUS.IN_PROGRESS });
          break;
        case 'complete':
          response = await bookingService.update(bookingId, { status: BOOKING_STATUS.COMPLETED });
          break;
        default:
          return;
      }

      // Mettre à jour la liste des réservations
      setReservations(prevReservations => 
        prevReservations.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: getNextStatus(booking.status, action) }
            : booking
        )
      );

      // Envoyer une notification par email
      if (notification && notification.showNotification) {
        await notification.showNotification('Statut de la réservation mis à jour avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      if (notification && notification.showNotification) {
        notification.showNotification(
          'Erreur lors de la mise à jour du statut de la réservation',
          'error'
        );
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const stats = {
    totalReservations: reservations.length,
    upcomingReservations: reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length,
    totalSpent: reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    averageAttendees: Math.round(reservations.reduce((sum, r) => sum + (r.numberOfPeople || 0), 0) / reservations.length) || 0
  };

  console.log('🔄 Rendu du Dashboard - reservations:', reservations, 'loading:', loading);

  if (loading) {
    console.log('⏳ Affichage du loader');
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Bienvenue, {user?.name || 'Utilisateur'}
              </p>
            </div>
            <Link
              to="/spaces"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réserver un espace
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Vue d\'ensemble' },
              { id: 'reservations', name: 'Mes réservations' },
              { id: 'profile', name: 'Profil' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total réservations</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalReservations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Réservations à venir</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.upcomingReservations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalSpent.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Moyenne participants</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.averageAttendees}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Réservations récentes */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Réservations récentes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Espace
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Heure
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((reservation) => (
                        <tr key={reservation._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={reservation.space?.images?.[0] || '/placeholder.jpg'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {reservation.space?.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(reservation.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.startTime} - {reservation.endTime}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reservation.numberOfPeople} personnes
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <BookingStatusBadge
                              status={reservation.status}
                              onStatusChange={(action) => handleStatusChange(reservation._id, action)}
                              isAdmin={user?.role === 'admin'}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reservation.totalPrice?.toLocaleString()} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link
                              to={`/spaces/${reservation.space?._id}`}
                              className="p-2 rounded-full hover:bg-blue-100 inline-block"
                              title="Voir l'espace"
                            >
                              <FaEye className="text-blue-600 text-lg w-5 h-5" />
                            </Link>
                            {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                              <>
                                <Link
                                  to={`/bookings/edit/${reservation._id}`}
                                  className="p-2 rounded-full hover:bg-yellow-100 inline-block"
                                  title="Modifier la réservation"
                                >
                                  <FaEdit className="text-yellow-500 text-lg w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() => handleStatusChange(reservation._id, 'cancel')}
                                  className="p-2 rounded-full hover:bg-red-100 inline-block"
                                  title="Annuler la réservation"
                                >
                                  <FaTrash className="text-red-600 text-lg w-5 h-5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Mes réservations</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{reservation.spaceName}</h4>
                        <p className="text-sm text-gray-600">
                          {reservation.date} • {reservation.startTime} - {reservation.endTime} • {reservation.attendees} participants
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{reservation.totalPrice.toLocaleString()} FCFA</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Profil utilisateur</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.name || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.phone || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.company || 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Modifier le profil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
