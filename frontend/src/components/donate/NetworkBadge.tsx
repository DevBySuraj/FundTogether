import React from 'react';
import { POLYGON_AMOY_CHAIN_ID } from '../../hooks/useMetaMask';

interface NetworkBadgeProps {
  chainId: number | null;
  onSwitch?: () => void;
}

const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  137: 'Polygon Mainnet',
  80002: 'Polygon Amoy',
  11155111: 'Sepolia Testnet',
  80001: 'Mumbai Testnet',
};

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({ chainId, onSwitch }) => {
  if (chainId === null) {
    return (
      <span className="w3-network-badge w3-network-unknown">
        ⬡ Not Connected
      </span>
    );
  }

  const isCorrect = chainId === POLYGON_AMOY_CHAIN_ID;
  const networkName = NETWORK_NAMES[chainId] ?? `Chain ${chainId}`;

  if (isCorrect) {
    return (
      <span className="w3-network-badge w3-network-ok">
        ✓ {networkName}
      </span>
    );
  }

  return (
    <button onClick={onSwitch} className="w3-network-badge w3-network-wrong">
      ⚠ {networkName} — Switch to Amoy
    </button>
  );
};
