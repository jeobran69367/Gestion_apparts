'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { use } from 'react';
import { API_ENDPOINTS } from '@/config/api';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function EditStudioPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    surface: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    pricePerNight: '',
    isAvailable: false,
    photos: [] as string[],
    primaryPhoto: '' as string,
    amenities: [] as string[],
    rules: '',
    owner: '',
    id: '',
    ownerId: '',
    createdAt: '',
    updatedAt: '',
    reservations: [] as string[],
  });

  const [newPhotosToUpload, setNewPhotosToUpload] = useState<File[]>([]);
  const [newPhotosPreviews, setNewPhotosPreviews] = useState<string[]>([]);

  // Liste des équipements possibles
  const availableAmenities = [
    'Wi-Fi',
    'Climatisation',
    'Parking',
    'Piscine',
    'Cuisine équipée',
    'Télévision',
    'Chauffage',
    'Lave-linge',
    'Sèche-linge',
    'Salle de sport',
    'Jacuzzi',
    'Barbecue',
    'Terrasse',
    'Vue sur la mer',
    'Animaux acceptés',
  ];


  const fetchStudio = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.STUDIOS.BY_ID(id as string));
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, ...data }));
      } else {
        setError('Erreur lors du chargement du studio');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudio();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenity: string, isChecked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: isChecked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter((item) => item !== amenity),
    }));
  };

  const handlePhotoDelete = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleNewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError(`${file.name}: Type de fichier non supporté. Utilisez JPEG, PNG ou WEBP.`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`${file.name}: La taille du fichier dépasse 5MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setNewPhotosToUpload((prev) => [...prev, ...validFiles]);
      
      // Create preview URLs
      const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
      setNewPhotosPreviews((prev) => [...prev, ...newPreviewUrls]);
      setError('');
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotosToUpload((prev) => prev.filter((_, i) => i !== index));
    setNewPhotosPreviews((prev) => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newPhotosToUpload.length === 0) return [];

    setUploadingImages(true);
    try {
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      
      newPhotosToUpload.forEach((file) => {
        uploadFormData.append('images', file);
      });

      const response = await fetch(API_ENDPOINTS.UPLOADS.STUDIO_IMAGES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload des images');
      }

      const data = await response.json();
      return data.base64Images || [];
    } catch (err: any) {
      throw new Error(`Erreur d'upload: ${err.message}`);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCalendarChange = (value: Value) => {
    if (Array.isArray(value) && value[0] && value[1]) {
      const [startDate, endDate] = value;
      setFormData((prev) => ({
        ...prev,
        newPeriod: { 
          startDate: startDate.toISOString().split('T')[0], 
          endDate: endDate.toISOString().split('T')[0] 
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de pricePerNight
    const price = Number(formData.pricePerNight);
    if (price < 1 || isNaN(price)) {
      setError('Le prix par nuit doit être un nombre supérieur ou égal à 1.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Utilisateur non authentifié');
        return;
      }

      // Upload new images if any
      const uploadedPhotoUrls = await uploadNewImages();
      
      // Combine existing photos with new uploads
      const allPhotos = [...formData.photos, ...uploadedPhotoUrls];

      // Filtrer les propriétés non autorisées avant l'envoi
      const { id, ownerId, createdAt, updatedAt, owner, reservations, ...filteredData } = formData;

      const response = await fetch(API_ENDPOINTS.STUDIOS.BY_ID(id as string), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...filteredData, photos: allPhotos, pricePerNight: price }),
      });

      if (response.ok) {
        router.push('/studios');
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la mise à jour:', errorData);
        setError('Erreur lors de la mise à jour du studio');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion');
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Modifier le studio</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section: Informations générales */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* Section: Adresse */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Adresse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                required
              />
            </div>
          </div>
        </div>

        {/* Section: Caractéristiques */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Caractéristiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surface (m²)
              </label>
              <input
                type="number"
                name="surface"
                value={formData.surface}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chambres
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salles de bain
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix par nuit (Fcfa)
              </label>
              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                min="1"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Disponible</label>
            </div>
          </div>
        </div>

        {/* Section: Équipements */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Équipements</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">{amenity}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Règles */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Règles</h2>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            rows={4}
            placeholder="Règles à respecter dans le studio..."
          />
        </div>

        {/* Section: Photos */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Photos</h2>
          <div className="space-y-4">
            {/* Afficher les photos existantes */}
            {formData.photos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Photos actuelles</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className={`w-full h-32 object-cover rounded-lg shadow-md ${
                          photo === formData.primaryPhoto ? 'ring-4 ring-blue-500' : ''
                        }`}
                      />
                      {photo === formData.primaryPhoto && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          ★ Principale
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, primaryPhoto: photo })}
                          className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-700"
                          title="Marquer comme principale"
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePhotoDelete(index)}
                          className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Cliquez sur ★ pour définir la photo principale
                </p>
              </div>
            )}

            {/* Afficher les nouvelles photos à uploader */}
            {newPhotosPreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Nouvelles photos à ajouter</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {newPhotosPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Nouvelle photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-md border-2 border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ajouter de nouvelles photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter des photos
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleNewPhotoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formats acceptés: JPEG, PNG, WEBP. Taille max: 5MB par fichier.
              </p>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.push('/studios')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={uploadingImages}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploadingImages}
          >
            {uploadingImages ? 'Upload des images...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}