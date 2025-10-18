export interface Campaign {
  id?: string; // Firestore document ID
  title: string;
  description?: string;
  date: string; // ISO string ou texte
  location?: string;
  bloodType?: string; // ex: 'A+'
  participants?: string[]; // ids ou emails simples
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  createdBy?: string; // ID de l'utilisateur qui a créé la campagne
  status?: 'active' | 'completed' | 'cancelled'; // Statut de la campagne
  maxParticipants?: number; // Nombre maximum de participants
  currentParticipants?: number; // Nombre actuel de participants
}