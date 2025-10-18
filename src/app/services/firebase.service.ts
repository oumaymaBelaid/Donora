import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Campaign } from '../models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private campaignsCollection = 'campaigns';
  private participantsCollection = 'participants';

  constructor(private firestore: Firestore) {}

  // ===== CAMPAGNES =====
  
  /**
   * Créer une nouvelle campagne
   */
  async createCampaign(campaign: Omit<Campaign, 'id'>): Promise<string> {
    const campaignsRef = collection(this.firestore, this.campaignsCollection);
    const campaignData = {
      ...campaign,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(campaignsRef, campaignData);
    return docRef.id;
  }

  /**
   * Récupérer toutes les campagnes
   */
  async getCampaigns(): Promise<Campaign[]> {
    const campaignsRef = collection(this.firestore, this.campaignsCollection);
    const q = query(campaignsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Campaign));
  }

  /**
   * Récupérer une campagne par ID
   */
  async getCampaignById(id: string): Promise<Campaign | null> {
    const campaignRef = doc(this.firestore, this.campaignsCollection, id);
    const campaignSnap = await getDoc(campaignRef);
    
    if (campaignSnap.exists()) {
      return {
        id: campaignSnap.id,
        ...campaignSnap.data()
      } as Campaign;
    }
    return null;
  }

  /**
   * Mettre à jour une campagne
   */
  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<void> {
    const campaignRef = doc(this.firestore, this.campaignsCollection, id);
    const updateData = {
      ...campaign,
      updatedAt: Timestamp.now()
    };
    await updateDoc(campaignRef, updateData);
  }

  /**
   * Supprimer une campagne
   */
  async deleteCampaign(id: string): Promise<void> {
    const campaignRef = doc(this.firestore, this.campaignsCollection, id);
    await deleteDoc(campaignRef);
  }

  // ===== PARTICIPANTS =====

  /**
   * Enregistrer un participant à une campagne
   */
  async registerParticipant(campaignId: string, donorId: string, donorInfo: any): Promise<string> {
    const participantsRef = collection(this.firestore, this.participantsCollection);
    const participantData = {
      campaignId,
      donorId,
      donorInfo,
      registeredAt: Timestamp.now(),
      status: 'registered' // registered, confirmed, completed
    };
    
    const docRef = await addDoc(participantsRef, participantData);
    return docRef.id;
  }

  /**
   * Récupérer les participants d'une campagne
   */
  async getCampaignParticipants(campaignId: string): Promise<any[]> {
    const participantsRef = collection(this.firestore, this.participantsCollection);
    const q = query(participantsRef, where('campaignId', '==', campaignId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Vérifier si un utilisateur est déjà inscrit à une campagne
   */
  async isUserRegistered(campaignId: string, donorId: string): Promise<boolean> {
    const participantsRef = collection(this.firestore, this.participantsCollection);
    const q = query(
      participantsRef, 
      where('campaignId', '==', campaignId),
      where('donorId', '==', donorId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // ===== STATISTIQUES =====

  /**
   * Récupérer les statistiques d'une campagne
   */
  async getCampaignStats(campaignId: string): Promise<{
    totalParticipants: number;
    confirmedParticipants: number;
    completedParticipants: number;
  }> {
    const participants = await this.getCampaignParticipants(campaignId);
    
    return {
      totalParticipants: participants.length,
      confirmedParticipants: participants.filter(p => p.status === 'confirmed').length,
      completedParticipants: participants.filter(p => p.status === 'completed').length
    };
  }
}

