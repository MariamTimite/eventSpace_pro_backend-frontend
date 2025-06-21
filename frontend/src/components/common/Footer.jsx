import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Logo et description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <h3 className="text-xl lg:text-2xl font-bold text-blue-400 mb-4">EventSpace Pro</h3>
            <p className="text-gray-300 mb-4 text-sm lg:text-base">
              La première plateforme de réservation d'espaces événementiels en Côte d'Ivoire. 
              Trouvez et réservez l'espace parfait pour vos événements à Abidjan, Bouaké, San-Pédro et dans tout le pays.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-200">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-200">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-blue-400 transition duration-200 text-sm lg:text-base">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/spaces" className="text-gray-300 hover:text-blue-400 transition duration-200 text-sm lg:text-base">
                  Espaces
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-blue-400 transition duration-200 text-sm lg:text-base">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contact@eventspace.ci" className="text-gray-300 hover:text-blue-400 transition duration-200 text-sm lg:text-base">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-200 text-sm lg:text-base">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-200 text-sm lg:text-base">
                  Aide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-6 lg:mt-8 pt-6 lg:pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <h5 className="text-blue-400 font-semibold mb-2">📞 Contact</h5>
              <p className="text-gray-300 text-sm">+225 27 22 49 56 78</p>
              <p className="text-gray-300 text-sm">contact@eventspace.ci</p>
            </div>
            <div>
              <h5 className="text-blue-400 font-semibold mb-2">📍 Adresse</h5>
              <p className="text-gray-300 text-sm">Cocody, Abidjan</p>
              <p className="text-gray-300 text-sm">Côte d'Ivoire</p>
            </div>
            <div>
              <h5 className="text-blue-400 font-semibold mb-2">🕒 Horaires</h5>
              <p className="text-gray-300 text-sm">Lun-Ven: 8h-18h</p>
              <p className="text-gray-300 text-sm">Sam: 9h-15h</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 lg:mt-8 pt-6 lg:pt-8 text-center">
          <p className="text-gray-400 text-sm lg:text-base">
            © {new Date().getFullYear()} EventSpace Pro - Côte d'Ivoire. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Première plateforme de réservation d'espaces événementiels en Côte d'Ivoire
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 