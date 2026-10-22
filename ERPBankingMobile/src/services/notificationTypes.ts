export interface NotificationBackend {
  id: number;
  type: string;
  titre: string;
  message: string;
  lien: string | null;
  lu: boolean;
  dateCreation: string;
  emoji: string | null;
}