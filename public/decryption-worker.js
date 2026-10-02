// Decryption Web Worker
self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  if (type === 'decrypt-batch') {
    try {
      const { encryptedRecords, batchIndex } = data;
      const results = [];
      
      for (let i = 0; i < encryptedRecords.length; i++) {
        try {
          const decryptedRecord = await decryptEnquiryRecord(encryptedRecords[i]);
          results.push({
            index: i,
            success: true,
            data: decryptedRecord
          });
        } catch (error) {
          results.push({
            index: i,
            success: false,
            error: error.message
          });
        }
      }
      
      self.postMessage({
        type: 'batch-complete',
        data: {
          batchIndex,
          results
        }
      });
    } catch (error) {
      self.postMessage({
        type: 'batch-error',
        data: {
          batchIndex: data.batchIndex,
          error: error.message
        }
      });
    }
  }
};

// Decryption function (same as main thread)
async function decryptEnquiryRecord(encryptedRecord) {
  try {
    // Extract encryption parameters from the record
    const encryptedData = encryptedRecord.fullName; // hex format
    const encryptionKey = encryptedRecord.email;    // base64 format
    const iv = encryptedRecord.phone;               // base64 format
    const tag = encryptedRecord.message;            // base64 format
    const contactDate = encryptedRecord.contactDate; // unencrypted

    // Validate that we have all required fields
    if (!encryptedData || !encryptionKey || !iv || !tag) {
      throw new Error('Missing required encryption fields');
    }

    // Convert to ArrayBuffers
    const keyBuffer = base64ToArrayBuffer(encryptionKey);
    const ivBuffer = base64ToArrayBuffer(iv);
    const tagBuffer = base64ToArrayBuffer(tag);
    const dataBuffer = hexToArrayBuffer(encryptedData);

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Combine encrypted data with auth tag
    const encryptedBuffer = new Uint8Array(dataBuffer.byteLength + tagBuffer.byteLength);
    encryptedBuffer.set(new Uint8Array(dataBuffer), 0);
    encryptedBuffer.set(new Uint8Array(tagBuffer), dataBuffer.byteLength);

    // Decrypt using AES-GCM with additional authenticated data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
        additionalData: new TextEncoder().encode('enquiry-export'),
        tagLength: 128
      },
      key,
      encryptedBuffer
    );

    // Convert to string and parse JSON
    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    const decryptedData = JSON.parse(decryptedText);

    // Return the decrypted record with original contact date
    return {
      fullName: decryptedData.fullName || '',
      email: decryptedData.email || '',
      phone: decryptedData.phone || '',
      message: decryptedData.message || '',
      contactDate: contactDate || ''
    };

  } catch (error) {
    throw error;
  }
}

// Convert hex string to ArrayBuffer
function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

// Convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
} 