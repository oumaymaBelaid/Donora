import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Campaign } from 'src/app/models/campaign.model';


@Injectable({ providedIn: 'root' })
export class CampaignService {
private STORAGE_KEY = 'campaigns';
private _storage: Storage | null = null;


constructor(private storage: Storage) {
this.init();
}


async init() {
const s = await this.storage.create();
this._storage = s;
}


async getAll(): Promise<Campaign[]> {
return (await this._storage?.get(this.STORAGE_KEY)) || [];
}


async add(c: Campaign) {
const items = await this.getAll();
c.id = Date.now();
c.participants = [];
items.push(c);
await this._storage?.set(this.STORAGE_KEY, items);
}


async delete(id: number) {
let items = await this.getAll();
items = items.filter(i => i.id !== id);
await this._storage?.set(this.STORAGE_KEY, items);
}


async registerParticipant(campaignId: number, donorId: string) {
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


async getById(id: number): Promise<Campaign | undefined> {
const items = await this.getAll();
return items.find(i => i.id === id);
}
}