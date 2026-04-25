// Centralized Azure Blob Storage service for handling file operations.
const { ContainerClient } = require('@azure/storage-blob');

const AZURE_SAS_URL = process.env.AZURE_STORAGE_SAS_URL || '';
const containerClient = AZURE_SAS_URL ? new ContainerClient(AZURE_SAS_URL) : null;

/**
 * Uploads a file buffer to Azure Blob Storage and returns the public URL.
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - The URL of the uploaded blob
 */
exports.uploadToAzure = async (file) => {
    if (!containerClient) {
        throw new Error('Azure Storage SAS URL not configured on the server.');
    }
    
    // Create a unique blob name to prevent collisions
    const blobName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the buffer directly
    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    return blockBlobClient.url;
};

/**
 * Deletes a blob from Azure Storage based on its URL.
 * @param {string} photoUrl - The full URL of the blob to delete
 */
exports.deleteFromAzure = async (photoUrl) => {
    if (!containerClient || !photoUrl || !photoUrl.includes('.blob.core.windows.net/')) {
        return;
    }
    
    try {
        // Strip query parameters from the URL before extracting the blob name
        const cleanUrl = photoUrl.split('?')[0];
        const urlParts = cleanUrl.split('/');
        const blobName = urlParts[urlParts.length - 1];
        
        if (!blobName) return;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
    } catch (err) {
        console.error(`[AZURE DELETE ERROR] Failed to delete blob ${photoUrl}:`, err);
    }
};
