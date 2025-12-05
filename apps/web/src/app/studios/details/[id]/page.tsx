'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Studio {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  surface?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  isAvailable: boolean;
  minStay: number;
  maxStay: number;
  photos: string[];
  amenities: string[];
  rules: string[];
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Reservation {
  id: number;
  checkIn: string;
  checkOut: string;
  status: string;
}

export default function StudioDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studioId = params?.id as string;
  
  const [studio, setStudio] = useState<Studio | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date selection state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectingMode, setSelectingMode] = useState<'checkIn' | 'checkOut' | null>(null);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [reservedDates, setReservedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (studioId) {
      fetchStudio();
      fetchReservations();
    }
  }, [studioId]);

  useEffect(() => {
    if (checkIn && checkOut && studio) {
      const startDate = new Date(checkIn + 'T12:00:00');
      const endDate = new Date(checkOut + 'T12:00:00');
      const nightCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      
      if (nightCount > 0) {
        setNights(nightCount);
        const subtotal = (studio.pricePerNight) * nightCount;
        const serviceFee = subtotal * 0.12;
        const taxes = subtotal * 0.05;
        setTotalPrice(subtotal + serviceFee + taxes);
      }
    }
  }, [checkIn, checkOut, studio]);

  // Fermer le mini-calendrier en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowMiniCalendar(false);
      }
    };

    if (showMiniCalendar) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMiniCalendar]);

  const fetchStudio = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/studios/${studioId}`);
      if (response.ok) {
        const data = await response.json();
        setStudio(data);
      } else {
        setError('Studio non trouvé');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Erreur lors du chargement du studio');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/studios/${studioId}/reservations`);
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };

  // Correction de l'URL de l'API et ajout de logs pour déboguer
  useEffect(() => {
    if (!studio) return;

    const fetchReservedDates = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/studios/${studio.id}/reservations`);
        if (!response.ok) {
          console.error('Erreur API:', response.statusText);
          return;
        }
        const data = await response.json();
        const dates = data.map((reservation: { checkIn: string; checkOut: string }) => {
          const start = new Date(reservation.checkIn);
          const end = new Date(reservation.checkOut);
          const range = [];
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            range.push(new Date(d));
          }
          return range;
        }).flat();
        setReservedDates(dates);
      } catch (error) {
        console.error('Erreur lors de la récupération des dates réservées:', error);
      }
    };

    fetchReservedDates();
  }, [studio]);

  // FONCTION CORRIGÉE : Bloquer les dates passées ET les dates réservées
  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer seulement les dates
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  // Function to find the closest `checkIn` after a given date
  const findClosestCheckIn = (date: Date): Date | null => {
    const futureCheckIns = reservations
      .map((reservation) => new Date(reservation.checkIn))
      .filter((checkInDate) => checkInDate > date);

    if (futureCheckIns.length === 0) return null;

    return futureCheckIns.reduce((closest, current) => {
      return current < closest ? current : closest;
    });
  };

  // Updated `isDateBlocked` function
  const isDateBlocked = (date: Date) => {
    // Bloquer les dates passées
    if (isDateInPast(date)) {
      return true;
    }
    
    // Bloquer uniquement les dates issues de réservations dont le status est "CONFIRMED"
    for (const res of reservations) {
      if (res.status !== 'CONFIRMED') continue;

      const start = new Date(res.checkIn);
      const end = new Date(res.checkOut);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      if (d >= start && d <= end) {
      return true;
      }
    }

    // Bloquer les dates après le plus proche `checkIn` dans les réservations
    if (checkIn) {
      const selectedCheckInDate = new Date(checkIn);
      const closestCheckIn = findClosestCheckIn(selectedCheckInDate);

      if (closestCheckIn && date >= closestCheckIn) {
        return true;
      }
    }

    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateBlocked(date)) return;
    
    // Format YYYY-MM-DD pour cohérence et éviter les décalages timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (!checkIn || (checkIn && checkOut) || dateStr < checkIn) {
      // Première sélection ou reset
      setCheckIn(dateStr);
      setCheckOut('');
      setSelectingMode('checkOut');
    } else if (checkIn && !checkOut) {
      // Sélection de la date de fin
      setCheckOut(dateStr);
      setSelectingMode(null);
      setShowMiniCalendar(false); // Fermer le mini calendrier après sélection complète
    }
    
    // Synchroniser le mois affiché avec la sélection
    setSelectedMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Commencer par le lundi de la semaine contenant le 1er du mois
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calcul pour commencer lundi
    startDate.setDate(firstDay.getDate() + mondayOffset);
    
    const days = [];
    let current = new Date(startDate);
    
    // Générer 6 semaines de jours
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }
    
    return days;
  };

  const isDateSelected = (date: Date): 'start' | 'end' | 'between' | null => {
    if (!checkIn && !checkOut) return null;
    
    // Format YYYY-MM-DD cohérent
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (dateStr === checkIn) return 'start';
    if (dateStr === checkOut) return 'end';
    if (checkIn && checkOut && dateStr > checkIn && dateStr < checkOut) return 'between';
    
    return null;
  };

  // Composant Galerie Photo Modal
  const PhotoGalleryModal = () => {
    if (!showPhotoGallery || !studio) return null;
    
    const photos = studio.photos.length > 0 ? studio.photos : [defaultImage];
    
    const nextPhoto = () => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };
    
    const prevPhoto = () => {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    
    const closeGallery = () => {
      setShowPhotoGallery(false);
      setCurrentPhotoIndex(0);
    };

    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center">
        {/* Header de la galerie */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6 z-10">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold">{studio.name}</h2>
              <p className="text-white/80">
                Photo {currentPhotoIndex + 1} sur {photos.length}
              </p>
            </div>
            <button
              onClick={closeGallery}
              className="p-3 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image principale */}
        <div className="relative w-full h-full flex items-center justify-center p-12">
          <img
            src={photos[currentPhotoIndex]}
            alt={`${studio.name} - Photo ${currentPhotoIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
          
          {/* Navigation précédent/suivant */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all duration-300"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextPhoto}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all duration-300"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Miniatures en bas */}
        {photos.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
            <div className="flex items-center justify-center gap-3 overflow-x-auto max-w-4xl mx-auto">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === currentPhotoIndex 
                      ? 'border-white shadow-lg scale-110' 
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === currentPhotoIndex && (
                    <div className="absolute inset-0 bg-white/20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation au clavier */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/60 text-sm">
            Utilisez ← → ou cliquez pour naviguer
          </div>
        </div>
      </div>
    );
  };

  // Gestion des touches clavier pour la galerie
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showPhotoGallery) return;
      
      switch (event.key) {
        case 'Escape':
          setShowPhotoGallery(false);
          setCurrentPhotoIndex(0);
          break;
        case 'ArrowLeft':
          setCurrentPhotoIndex((prev) => {
            const photos = (studio?.photos && studio.photos.length > 0) ? studio.photos : [defaultImage];
            return (prev - 1 + photos.length) % photos.length;
          });
          break;
        case 'ArrowRight':
          setCurrentPhotoIndex((prev) => {
            const photos = (studio?.photos && studio.photos.length > 0) ? studio.photos : [defaultImage];
            return (prev + 1) % photos.length;
          });
          break;
      }
    };

    if (showPhotoGallery) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showPhotoGallery, studio]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Mini calendrier moderne pour le widget de droite
  const MiniCalendar = () => {
    const [miniSelectedMonth, setMiniSelectedMonth] = useState(selectedMonth);
    
    const navigateMiniMonth = (direction: 'prev' | 'next') => {
      setMiniSelectedMonth(prev => {
        const newMonth = new Date(prev);
        newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
        return newMonth;
      });
    };

    return (
      <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 rounded-2xl p-6 shadow-2xl absolute top-full left-0 right-0 z-50 mt-2">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMiniMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            {monthNames[miniSelectedMonth.getMonth()]} {miniSelectedMonth.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMiniMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-3">
          {dayNames.map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="text-center text-sm font-bold text-gray-500 py-4 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays(miniSelectedMonth).map((date, index) => {
            const isCurrentMonth = date.getMonth() === miniSelectedMonth.getMonth();
            const isBlocked = isDateBlocked(date);
            const selectionState = isDateSelected(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = isDateInPast(date);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={isBlocked}
                className={`
                  relative h-10 text-xs font-semibold rounded-xl transition-all duration-300 transform hover:scale-105
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${isBlocked ? 'text-gray-300 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
                  ${isPast ? 'line-through' : ''}
                  ${isToday && !selectionState ? 'font-bold text-gray-900 ring-2 ring-blue-400 bg-blue-50' : ''}
                  ${selectionState === 'start' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''}
                  ${selectionState === 'end' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : ''}
                  ${selectionState === 'between' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900' : ''}
                  ${!isBlocked && !selectionState ? 'hover:bg-gray-100 hover:shadow-md' : ''}
                `}
                title={isPast ? "Date passée" : isBlocked ? "Date non disponible" : ""}
              >
                {date.getDate()}
                {isToday && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const navigateToMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const handleReservation = () => {
    if (!checkIn || !checkOut || nights < studio!.minStay || (studio!.maxStay && nights > studio!.maxStay)) {
      return;
    }
    
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString()
    });
    
    router.push(`/studios/book/${studioId}?${params.toString()}`);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Studio non trouvé'}
          </h2>
          <Link 
            href="/studios" 
            className="text-rose-600 hover:underline"
          >
            Retour aux studios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* Header Modern */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/studios"
              className="inline-flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-all duration-300 group"
            >
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-medium">Retour à la recherche</span>
            </Link>
            
            {/* Breadcrumb moderne */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="text-gray-500 ">Accueil</Link>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/studios" className="text-gray-500 ">Studios</Link>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium truncate max-w-32">{studio.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Studio Gallery moderne */}
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden shadow-2xl">
                {studio.photos.slice(0, 4).map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setCurrentPhotoIndex(index);
                      setShowPhotoGallery(true);
                    }}
                    className={`relative group overflow-hidden cursor-pointer ${index === 0 ? 'col-span-2 row-span-2 h-96' : 'h-48'}`}
                  >
                    <img
                      src={photo || defaultImage}
                      alt={`${studio.name} - Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                {studio.photos.length === 0 && (
                  <div 
                    onClick={() => setShowPhotoGallery(true)}
                    className="col-span-4 row-span-2 h-96 relative group overflow-hidden cursor-pointer"
                  >
                    <img
                      src={defaultImage}
                      alt={studio.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                )}
              </div>
              
              {/* Bouton galerie flottant */}
              <button 
                onClick={() => setShowPhotoGallery(true)}
                className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md text-gray-900 px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {studio.photos.length > 0 ? `${studio.photos.length} photos` : 'Voir les photos'}
              </button>
            </div>

            {/* Title and Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{studio.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" fill="#fbbf24" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>4.47</span>
                  <span>· 86 commentaires</span>
                </div>
                <span>·</span>
                <span className="underline">{studio.address}, {studio.city}, {studio.country}</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>{studio.capacity} voyageurs</span>
                <span>{studio.bedrooms} chambres</span>
                <span>{studio.bathrooms} salles de bain</span>
                {studio.surface && <span>{studio.surface}m²</span>}
              </div>
            </div>

            {/* Owner Info */}
            <div className="border-t border-b py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {studio.owner.firstName[0]}{studio.owner.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Hôte: {studio.owner.firstName} {studio.owner.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">Hôte depuis 2020</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos de ce logement</h2>
              <p className="text-gray-600 leading-relaxed">
                {studio.description || "Un magnifique studio parfaitement situé, idéal pour découvrir la ville. Cet espace confortable et moderne offre tout le nécessaire pour un séjour agréable. Proche des transports en commun et des principales attractions touristiques."}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Équipements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studio.amenities && studio.amenities.length > 0 ? (
                  studio.amenities.slice(0, 8).map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span className="text-gray-700">WiFi gratuit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-gray-700">Cuisine équipée</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">Détecteur de fumée</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-gray-700">Coffre-fort</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Calendar */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Disponibilités</h2>
              <p className="text-gray-600 mb-6">
                Sélectionnez vos dates d'arrivée et de départ
              </p>

              {/* Calendrier principal avec design moderne */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sélectionnez vos dates</h3>
                  <p className="text-gray-600">
                    Minimum {studio.minStay} nuit{studio.minStay > 1 ? 's' : ''} • 
                    {studio.maxStay ? ` Maximum ${studio.maxStay} nuits` : ' Pas de maximum'}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={() => navigateToMonth('prev')}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 group"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-600 group-hover:text-gray-900">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                      {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => navigateToMonth('next')}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 group"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-600 group-hover:text-gray-900">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendrier avec style moderne */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {/* En-têtes des jours */}
                  {dayNames.map((day, index) => (
                    <div
                      key={`${day}-${index}`} // Utilisation d'une clé unique
                      className="text-center text-sm font-bold text-gray-500 py-4 uppercase tracking-wider"
                    >
                      {day}
                    </div>
                  ))}
                  
                  {/* Jours du calendrier */}
                  {generateCalendarDays(selectedMonth).map((date, index) => {
                    const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                    const isBlocked = isDateBlocked(date);
                    const selectionState = isDateSelected(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isPast = isDateInPast(date);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        disabled={isBlocked}
                        className={`
                          relative h-14 text-sm font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105
                          ${!isCurrentMonth ? 'text-gray-300' : ''}
                          ${isBlocked ? 'text-gray-300 cursor-not-allowed line-through bg-gray-50' : 'cursor-pointer'}
                          ${isPast ? 'line-through' : ''}
                          ${isToday && !selectionState ? 'font-bold text-gray-900 ring-2 ring-blue-500 bg-blue-50' : ''}
                          ${selectionState === 'start' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''}
                          ${selectionState === 'end' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : ''}
                          ${selectionState === 'between' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900' : ''}
                          ${!isBlocked && !selectionState ? 'hover:bg-gray-100 hover:shadow-md' : ''}
                        `}
                      >
                        {date.getDate()}
                        {isToday && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Légende moderne */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                    <span className="font-medium text-gray-700">Dates sélectionnées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg border-2 border-gray-300"></div>
                    <span className="font-medium text-gray-700">Disponible</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-0.5 bg-gray-400 rotate-45"></div>
                      </div>
                    </div>
                    <span className="font-medium text-gray-700">Non disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Widget Premium */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 sticky top-8">
              {/* Prix avec animation */}
              <div className="mb-8 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
                  <div className="relative bg-gradient-to-r from-gray-900 to-blue-900 text-white px-8 py-4 rounded-2xl">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold">
                        {(studio.pricePerNight ).toFixed(0)}€
                      </span>
                      <span className="text-white/80">/ nuit</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-sm">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">4.47</span>
                  <span className="text-gray-500">(86 avis)</span>
                </div>
              </div>

              {/* Sélecteur de dates moderne */}
              <div className="relative mb-6">
                <div 
                  onClick={() => setShowMiniCalendar(!showMiniCalendar)}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-300 transition-all duration-300 relative group"
                >
                  <div className="grid grid-cols-2 divide-x-2 divide-gray-200">
                    <div className="p-4">
                      <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
                        Arrivée
                      </label>
                      <div className="text-lg font-semibold text-gray-700">
                        {checkIn ? (() => {
                          const [year, month, day] = checkIn.split('-').map(Number);
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short'
                          });
                        })() : 'Date'}
                      </div>
                    </div>
                    <div className="p-4">
                      <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
                        Départ
                      </label>
                      <div className="text-lg font-semibold text-gray-700">
                        {checkOut ? (() => {
                          const [year, month, day] = checkOut.split('-').map(Number);
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short'
                          });
                        })() : 'Date'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t-2 border-gray-200 p-4">
                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
                      Voyageurs
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full text-lg font-semibold bg-transparent border-0 p-0 focus:ring-0 focus:outline-none text-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Array.from({ length: studio.capacity }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} voyageur{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Icône calendrier animée */}
                  <div className="absolute top-4 right-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Mini Calendar moderne */}
                {showMiniCalendar && <MiniCalendar />}
              </div>

              {/* Messages de validation avec design moderne */}
              {nights > 0 && (
                <div className="mb-6">
  {nights < studio.minStay && (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-r-xl">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">
            Séjour minimum requis : {studio.minStay} nuit
            {studio.minStay > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )}

  {studio.maxStay && nights > studio.maxStay && (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-orange-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-orange-800">
            Séjour maximum autorisé : {studio.maxStay} nuit
            {studio.maxStay > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )}

  {nights >= studio.minStay &&
    nights <= (studio.maxStay || 365) && (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-xl">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Parfait ! Séjour de {nights} nuit
              {nights > 1 ? 's' : ''} disponible
            </p>
          </div>
        </div>
      </div>
    )}
</div>

              )}

              {/* Bouton de réservation premium */}
              <div className="space-y-4 mb-6">
                <button
                  onClick={handleReservation}
                  disabled={!checkIn || !checkOut || nights < studio.minStay || Boolean(studio.maxStay && nights > studio.maxStay)}
                  className="relative w-full group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className={`relative w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    !checkIn || !checkOut || nights < studio.minStay || Boolean(studio.maxStay && nights > studio.maxStay)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl'
                  }`}>
                    {!checkIn || !checkOut ? 'Sélectionnez vos dates' : 
                     nights < studio.minStay ? `Minimum ${studio.minStay} nuit${studio.minStay > 1 ? 's' : ''}` :
                     studio.maxStay && nights > studio.maxStay ? `Maximum ${studio.maxStay} nuits` :
                     'Réserver maintenant'}
                  </div>
                </button>

                <div className="text-center text-sm text-gray-500">
                  💳 Aucun prélèvement immédiat
                </div>
              </div>

              {/* Récapitulatif des prix moderne */}
              {nights > 0 && checkIn && checkOut && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Détail des prix</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          {(studio.pricePerNight).toFixed(0)}€ × {nights} nuit{nights > 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">Logement</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {((studio.pricePerNight) * nights).toFixed(0)}€
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">Frais de service</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">12%</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {((studio.pricePerNight) * nights * 0.12).toFixed(0)}€
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">Taxes de séjour</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">5%</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {((studio.pricePerNight) * nights * 0.05).toFixed(0)}€
                      </span>
                    </div>
                    
                    <div className="border-t-2 border-gray-300 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {totalPrice.toFixed(0)}€
                          </div>
                          <div className="text-sm text-gray-500">
                            {nights > 0 ? `${(totalPrice / nights).toFixed(0)}€ par nuit` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de la galerie photo */}
      <PhotoGalleryModal />
    </div>
  )
};
