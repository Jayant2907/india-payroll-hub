/**
 * Storage Fallback Layer
 * Provides JSON file backup when localStorage is unavailable or fails
 */

import type { Employee, PayrollRun, Settlement } from '@/types/payroll';

const BACKUP_FILE_PREFIX = 'payroll-backup-';

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

// Storage interface
interface StorageAdapter {
    getItem<T>(key: string, defaultValue: T): T;
    setItem<T>(key: string, value: T): void;
}

/**
 * LocalStorage Adapter
 */
class LocalStorageAdapter implements StorageAdapter {
    getItem<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`[LocalStorage] Error reading ${key}:`, error);
            return defaultValue;
        }
    }

    setItem<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`[LocalStorage] Error writing ${key}:`, error);
            throw error; // Re-throw to trigger fallback
        }
    }
}

/**
 * JSON File Adapter (Fallback)
 * Uses browser's File System Access API or IndexedDB as alternative
 */
class JSONFileAdapter implements StorageAdapter {
    private db: IDBDatabase | null = null;
    private readonly dbName = 'payroll-fallback-db';
    private readonly storeName = 'documents';

    constructor() {
        this.initDB();
    }

    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error('[IndexedDB] Failed to open database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[IndexedDB] Database initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'key' });
                    console.log('[IndexedDB] Object store created');
                }
            };
        });
    }

    getItem<T>(key: string, defaultValue: T): T {
        try {
            // Synchronous read from in-memory cache (fallback fallback)
            const cached = sessionStorage.getItem(key);
            if (cached) {
                return JSON.parse(cached);
            }

            // If IndexedDB available, queue async read
            this.asyncGetItem(key).then((value) => {
                if (value !== null) {
                    sessionStorage.setItem(key, JSON.stringify(value));
                }
            });

            return defaultValue;
        } catch (error) {
            console.error(`[JSONFile] Error reading ${key}:`, error);
            return defaultValue;
        }
    }

    private async asyncGetItem<T>(key: string): Promise<T | null> {
        if (!this.db) {
            await this.initDB();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    setItem<T>(key: string, value: T): void {
        try {
            // Write to sessionStorage immediately
            sessionStorage.setItem(key, JSON.stringify(value));

            // Async write to IndexedDB
            this.asyncSetItem(key, value).catch((error) => {
                console.error(`[JSONFile] Failed to persist ${key} to IndexedDB:`, error);
            });
        } catch (error) {
            console.error(`[JSONFile] Error writing ${key}:`, error);
        }
    }

    private async asyncSetItem<T>(key: string, value: T): Promise<void> {
        if (!this.db) {
            await this.initDB();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({ key, value });

            request.onsuccess = () => {
                console.log(`[IndexedDB] Successfully saved ${key}`);
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

/**
 * Smart Storage Manager
 * Auto-selects localStorage or JSON file fallback
 */
class StorageManager {
    private adapter: StorageAdapter;
    private usingFallback: boolean = false;

    constructor() {
        if (isLocalStorageAvailable()) {
            this.adapter = new LocalStorageAdapter();
            console.log('[Storage] Using localStorage');
        } else {
            this.adapter = new JSONFileAdapter();
            this.usingFallback = true;
            console.warn('[Storage] localStorage unavailable, using IndexedDB fallback');
        }
    }

    getItem<T>(key: string, defaultValue: T): T {
        return this.adapter.getItem(key, defaultValue);
    }

    setItem<T>(key: string, value: T): void {
        try {
            this.adapter.setItem(key, value);
        } catch (error) {
            // If localStorage fails, switch to fallback
            if (!this.usingFallback) {
                console.warn('[Storage] localStorage failed, switching to IndexedDB fallback');
                this.adapter = new JSONFileAdapter();
                this.usingFallback = true;
                this.adapter.setItem(key, value);
            } else {
                throw error;
            }
        }
    }

    isUsingFallback(): boolean {
        return this.usingFallback;
    }

    async exportToJSON(): Promise<string> {
        const data = {
            employees: this.getItem('app_employees_data', []),
            payrollRuns: this.getItem('processedPayrolls', []),
            settlements: this.getItem('app_settlements', []),
            companyConfig: this.getItem('app_company_config', {}),
            taxSettings: this.getItem('app_tax_settings', {}),
            exportDate: new Date().toISOString(),
        };

        return JSON.stringify(data, null, 2);
    }

    async importFromJSON(jsonString: string): Promise<void> {
        try {
            const data = JSON.parse(jsonString);

            if (data.employees) this.setItem('app_employees_data', data.employees);
            if (data.payrollRuns) this.setItem('processedPayrolls', data.payrollRuns);
            if (data.settlements) this.setItem('app_settlements', data.settlements);
            if (data.companyConfig) this.setItem('app_company_config', data.companyConfig);
            if (data.taxSettings) this.setItem('app_tax_settings', data.taxSettings);

            console.log('[Storage] Successfully imported data');
        } catch (error) {
            console.error('[Storage] Import failed:', error);
            throw new Error('Invalid JSON format');
        }
    }
}

// Singleton instance
export const storageManager = new StorageManager();

// Export helper functions
export const getItem = <T,>(key: string, defaultValue: T): T =>
    storageManager.getItem(key, defaultValue);

export const setItem = <T,>(key: string, value: T): void =>
    storageManager.setItem(key, value);

export const isUsingFallback = (): boolean =>
    storageManager.isUsingFallback();

export const exportData = (): Promise<string> =>
    storageManager.exportToJSON();

export const importData = (jsonString: string): Promise<void> =>
    storageManager.importFromJSON(jsonString);
