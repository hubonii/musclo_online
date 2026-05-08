
/**
 * Service for interacting with Azure Blob Storage for file uploads.
 */
const { ContainerClient } = require('@azure/storage-blob');

const AZURE_SAS_URL = process.env.AZURE_STORAGE_SAS_URL || '';
const containerClient = AZURE_SAS_URL ? new ContainerClient(AZURE_SAS_URL) : null;

/**
 * Uploads a file buffer to Azure Blob Storage and returns the public URL.
 * @param {Object} file - The file object from multer.
 * @returns {Promise<string>} The public URL of the uploaded blob.
 */
exports.uploadToAzure = async (file) => {
    if (!containerClient) {
        throw new Error('Azure Storage SAS URL not configured on the server.');
    }
    

    const blobName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);


    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    return blockBlobClient.url;
};

/**
 * Deletes a blob from Azure Storage based on its URL.
 * @param {string} photoUrl - The full URL of the blob to delete.
 * @returns {Promise<void>}
 */
exports.deleteFromAzure = async (photoUrl) => {
    if (!containerClient || !photoUrl || !photoUrl.includes('.blob.core.windows.net/')) {
        return;
    }
    
    try {

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
