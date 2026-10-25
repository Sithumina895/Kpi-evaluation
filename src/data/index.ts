import { isFirebaseConfigured } from '../firebase/config';
import { DataService } from './DataService';
import { FirebaseDataService } from './FirebaseDataService';
import { LocalDemoDataService } from './LocalDemoDataService';

let activeDataService: DataService | null = null;

export function getDataService(): DataService {
  if (!activeDataService) {
    if (isFirebaseConfigured()) {
      try {
        activeDataService = new FirebaseDataService();
      } catch (err) {
        console.warn('Failed to initialize FirebaseDataService. Falling back to LocalDemoDataService:', err);
        activeDataService = new LocalDemoDataService();
      }
    } else {
      activeDataService = new LocalDemoDataService();
    }
  }
  return activeDataService;
}

export const dataService: DataService = getDataService();
