export interface Campaign {
id?: number;
title: string;
description?: string;
date: string; // ISO string ou texte
location?: string;
bloodType?: string; // ex: 'A+'
participants?: string[]; // ids ou emails simples
}