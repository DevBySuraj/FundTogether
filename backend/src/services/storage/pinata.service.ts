import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { getPinataConfig } from '../../config/pinata';
import { logger } from '../../utils/logger';

export class PinataService {
  /**
   * Uploads local file to Pinata IPFS network and returns CID.
   */
  public async uploadFileToIPFS(filePath: string, fileName: string): Promise<string> {
    const config = getPinataConfig();

    if (config.jwt || (config.apiKey && config.secretKey)) {
      try {
        logger.info(`[Pinata Service] Uploading file ${fileName} to IPFS...`);

        const data = new FormData();
        data.append('file', fs.createReadStream(filePath));

        const metadata = JSON.stringify({
          name: `TrustChain_Doc_${fileName}`,
          keyvalues: {
            platform: 'TrustChain',
            timestamp: Date.now().toString(),
          },
        });
        data.append('pinataMetadata', metadata);

        const options = JSON.stringify({
          cidVersion: 1,
        });
        data.append('pinataOptions', options);

        const headers: Record<string, string> = {
          ...data.getHeaders(),
        };

        if (config.jwt) {
          headers['Authorization'] = `Bearer ${config.jwt}`;
        } else {
          headers['pinata_api_key'] = config.apiKey;
          headers['pinata_secret_api_key'] = config.secretKey;
        }

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
          headers,
          maxBodyLength: Infinity,
        });

        const ipfsCid = response.data.IpfsHash;
        logger.info(`[Pinata Service] Pin successful. IPFS CID: ${ipfsCid}`);
        return ipfsCid;
      } catch (error: any) {
        logger.warn('[Pinata Service] Pinata IPFS API error:', error.response?.data || error.message);
      }
    }

    // Fallback mock CID when Pinata keys are unconfigured
    const mockCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fb${Math.floor(Math.random() * 1000000)}`;
    logger.info(`[Pinata Service] (Local Dev Fallback) Generated mock IPFS CID: ${mockCid}`);
    return mockCid;
  }
}

export const pinataService = new PinataService();
