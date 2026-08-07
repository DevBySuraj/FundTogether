import { ethers } from 'ethers';
import { getBlockchainConfig } from '../../config/blockchain';
import { Transaction } from '../../models/Transaction';
import { Campaign } from '../../models/Campaign';
import { logger } from '../../utils/logger';

export class BlockchainEventListener {
  private isListening = false;

  public init(): void {
    const config = getBlockchainConfig();

    if (!config.provider || !config.contractAddress) {
      logger.info('[Event Listener] Live RPC Provider / Contract Address unconfigured. Event listener operating in manual sync mode.');
      return;
    }

    try {
      const abi = [
        'event DonationReceived(bytes32 indexed campaignId, address indexed donor, address indexed recipient, uint256 amountEth, uint256 blockNumber)'
      ];

      const contract = new ethers.Contract(config.contractAddress, abi, config.provider);

      contract.on('DonationReceived', async (campaignIdBytes, donor, recipient, amountWei, event) => {
        logger.info(`[Event Listener] DonationReceived event captured! Donor: ${donor}, Amount: ${ethers.formatEther(amountWei)} ETH`);
        await this.handleDonationEvent({
          campaignIdStr: campaignIdBytes,
          donor,
          recipient,
          amountEth: ethers.formatEther(amountWei),
          txHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      });

      this.isListening = true;
      logger.info('[Event Listener] Smart contract event listener initialized successfully.');
    } catch (err) {
      logger.warn('[Event Listener] Error setting up event listener:', err);
    }
  }

  public async handleDonationEvent(payload: {
    campaignIdStr: string;
    donor: string;
    recipient: string;
    amountEth: string;
    txHash: string;
    blockNumber?: number;
  }): Promise<void> {
    try {
      const existingTx = await Transaction.findOne({ txHash: payload.txHash });
      if (existingTx) return;

      const campaign = await Campaign.findById(payload.campaignIdStr);
      if (!campaign) {
        logger.warn(`[Event Listener] Received donation for unknown campaign ID: ${payload.campaignIdStr}`);
        return;
      }

      await Transaction.create({
        campaignId: campaign._id,
        donorWallet: payload.donor.toLowerCase(),
        recipientWallet: payload.recipient.toLowerCase(),
        amountEth: payload.amountEth,
        txHash: payload.txHash,
        blockNumber: payload.blockNumber,
        timestamp: new Date(),
      });

      campaign.currentAmount += parseFloat(payload.amountEth);
      if (campaign.currentAmount >= campaign.targetAmount) {
        campaign.status = 'COMPLETED';
      }
      await campaign.save();

      logger.info(`[Event Listener] Successfully recorded donation for campaign ${campaign._id}.`);
    } catch (error) {
      logger.error('[Event Listener] Error processing donation event:', error);
    }
  }
}

export const eventListener = new BlockchainEventListener();
