class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12;
    this.tagLength = 16;
    this.iterations = 100000; // PBKDF2 iterations
  }

  // Generate cryptographically secure random bytes
  generateRandomBytes(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  // Convert ArrayBuffer to hex string
  bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Convert hex string to ArrayBuffer
  hexToBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  // Derive encryption key from passphrase using PBKDF2
  async deriveKey(passphrase, salt = null) {
    try {
      const encoder = new TextEncoder();
      const passphraseBuffer = encoder.encode(passphrase);
      
      // Generate salt if not provided
      if (!salt) {
        salt = this.generateRandomBytes(16);
      }
      
      // Import passphrase as base key
      const baseKey = await crypto.subtle.importKey(
        'raw',
        passphraseBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      // Derive actual encryption key
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.iterations,
          hash: 'SHA-256'
        },
        baseKey,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      return {
        key: derivedKey,
        salt: this.bufferToHex(salt)
      };
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  // Encrypt data with AES-GCM
  async encrypt(data, keyInfo) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate random IV
      const iv = this.generateRandomBytes(this.ivLength);
      
      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        keyInfo.key,
        dataBuffer
      );
      
      // Combine IV + encrypted data + salt
      return {
        data: this.bufferToHex(encryptedBuffer),
        iv: this.bufferToHex(iv),
        salt: keyInfo.salt,
        algorithm: this.algorithm
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data with AES-GCM
  async decrypt(encryptedData, passphrase) {
    try {
      // Recreate key from passphrase and salt
      const salt = this.hexToBuffer(encryptedData.salt);
      const keyInfo = await this.deriveKey(passphrase, salt);
      
      // Convert hex back to buffers
      const iv = this.hexToBuffer(encryptedData.iv);
      const dataBuffer = this.hexToBuffer(encryptedData.data);
      
      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        keyInfo.key,
        dataBuffer
      );
      
      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - check passphrase');
    }
  }

  // Generate a secure random passphrase
  generatePassphrase(wordCount = 4) {
    const words = [
      'apple', 'bridge', 'castle', 'dragon', 'eagle', 'forest', 'golden', 'harbor',
      'island', 'jungle', 'kingdom', 'lighthouse', 'mountain', 'nature', 'ocean', 'palace',
      'quantum', 'rainbow', 'sunset', 'thunder', 'universe', 'victory', 'wisdom', 'xylophone',
      'yellow', 'zenith', 'adventure', 'butterfly', 'crimson', 'diamond', 'emerald', 'falcon',
      'glacier', 'horizon', 'infinity', 'jasmine', 'kaleidoscope', 'lavender', 'meadow', 'nebula'
    ];
    
    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
    }
    
    return selectedWords.join('-');
  }

  // Export key for storage
  async exportKey(keyInfo) {
    try {
      const keyData = await crypto.subtle.exportKey('raw', keyInfo.key);
      return {
        keyData: this.bufferToHex(keyData),
        salt: keyInfo.salt,
        algorithm: this.algorithm,
        iterations: this.iterations
      };
    } catch (error) {
      console.error('Key export failed:', error);
      throw new Error('Failed to export key');
    }
  }

  // Import key from storage
  async importKey(exportedKey) {
    try {
      const keyData = this.hexToBuffer(exportedKey.keyData);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      return {
        key: key,
        salt: exportedKey.salt
      };
    } catch (error) {
      console.error('Key import failed:', error);
      throw new Error('Failed to import key');
    }
  }

  // Compare two keys for equality
  async compareKeys(key1, key2) {
    try {
      const exported1 = await this.exportKey(key1);
      const exported2 = await this.exportKey(key2);
      return exported1.keyData === exported2.keyData && exported1.salt === exported2.salt;
    } catch (error) {
      console.error('Key comparison failed:', error);
      return false;
    }
  }

  // Hash data for integrity verification
  async hashData(data) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      return this.bufferToHex(hashBuffer);
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash data');
    }
  }

  // Verify data integrity
  async verifyHash(data, expectedHash) {
    try {
      const actualHash = await this.hashData(data);
      return actualHash === expectedHash;
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }

  // Check if Web Crypto API is available
  isAvailable() {
    return !!(window.crypto && window.crypto.subtle);
  }

  // Get encryption info for display
  getEncryptionInfo() {
    return {
      algorithm: this.algorithm,
      keyLength: this.keyLength,
      iterations: this.iterations,
      available: this.isAvailable()
    };
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
export default encryptionService;