import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Campaign } from 'src/app/models/campaign.model';
import { FirebaseService } from './firebase.service';


@Injectable({ providedIn: 'root' })
export class CampaignService {
private STORAGE_KEY = 'campaigns';
private _storage: Storage | null = null;
private HISTORY_KEY = 'donations_history';


constructor(
  private storage: Storage,
  private firebaseService: FirebaseService
) {
  this.init();
}


async init() {
const s = await this.storage.create();
this._storage = s;
}


async getAll(): Promise<Campaign[]> {
  // Utiliser Firebase comme source principale
  try {
    return await this.firebaseService.getCampaigns();
  } catch (error) {
    console.error('Erreur Firebase, fallback vers le stockage local:', error);
    // Fallback vers le stockage local en cas d'erreur
    return (await this._storage?.get(this.STORAGE_KEY)) || [];
  }
}


async add(c: Campaign): Promise<string> {
  try {
    // Ajouter via Firebase
    const campaignData = {
      ...c,
      participants: [],
      status: 'active' as const,
      currentParticipants: 0
    };
    const campaignId = await this.firebaseService.createCampaign(campaignData);
    
    // Synchroniser avec le stockage local
    const items = await this.getAll();
    items.push({ ...c, id: campaignId });
    await this._storage?.set(this.STORAGE_KEY, items);
    
    return campaignId;
  } catch (error) {
    console.error('Erreur Firebase, fallback vers le stockage local:', error);
    // Fallback vers le stockage local
    const items = await this.getAll();
    c.id = Date.now().toString();
    c.participants = [];
    items.push(c);
    await this._storage?.set(this.STORAGE_KEY, items);
    return c.id!;
  }
}


async delete(id: string) {
  try {
    // Supprimer via Firebase
    await this.firebaseService.deleteCampaign(id);
    
    // Synchroniser avec le stockage local
    let items = await this.getAll();
    items = items.filter(i => i.id !== id);
    await this._storage?.set(this.STORAGE_KEY, items);
  } catch (error) {
    console.error('Erreur Firebase, fallback vers le stockage local:', error);
    // Fallback vers le stockage local
    let items = await this.getAll();
    items = items.filter(i => i.id !== id);
    await this._storage?.set(this.STORAGE_KEY, items);
  }
}


async registerParticipant(campaignId: string, donorId: string) {
  try {
    // Vérifier si l'utilisateur est déjà inscrit
    const isRegistered = await this.firebaseService.isUserRegistered(campaignId, donorId);
    if (isRegistered) {
      throw new Error('Utilisateur déjà inscrit à cette campagne');
    }

    // Enregistrer via Firebase
    const donorInfo = {
      donorId,
      registeredAt: new Date().toISOString()
    };
    await this.firebaseService.registerParticipant(campaignId, donorId, donorInfo);

    // Synchroniser avec le stockage local
    const items = await this.getAll();
    const idx = items.findIndex(i => i.id === campaignId);
    if (idx > -1) {
      items[idx].participants = items[idx].participants || [];
      if (!items[idx].participants!.includes(donorId)) {
        items[idx].participants!.push(donorId);
        await this._storage?.set(this.STORAGE_KEY, items);
      }
    }

    // Enregistrer l'historique
    const history = (await this._storage?.get(this.HISTORY_KEY)) || [];
    history.push({ donorId, campaignId, date: new Date().toISOString() });
    await this._storage?.set(this.HISTORY_KEY, history);
  } catch (error) {
    console.error('Erreur Firebase, fallback vers le stockage local:', error);
    // Fallback vers le stockage local
    const items = await this.getAll();
    const idx = items.findIndex(i => i.id === campaignId);
    if (idx > -1) {
      items[idx].participants = items[idx].participants || [];
      if (!items[idx].participants!.includes(donorId)) {
        items[idx].participants!.push(donorId);
        await this._storage?.set(this.STORAGE_KEY, items);
      }
    }
  }
}


async getById(id: string): Promise<Campaign | undefined> {
  try {
    // Récupérer via Firebase
    const campaign = await this.firebaseService.getCampaignById(id);
    if (campaign) {
      return campaign;
    }
  } catch (error) {
    console.error('Erreur Firebase, fallback vers le stockage local:', error);
  }
  
  // Fallback vers le stockage local
  const items = await this.getAll();
  return items.find(i => i.id === id);
}

async getHistoryForDonor(donorId: string): Promise<Array<{ donorId: string; campaignId: number; date: string }>> {
  const history = (await this._storage?.get(this.HISTORY_KEY)) || [];
  return history.filter((h: any) => h.donorId === donorId);
}
}