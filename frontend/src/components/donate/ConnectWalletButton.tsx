import React from 'react';

interface ConnectWalletButtonProps {
  isInstalled: boolean;
  account: string | null;
  isConnecting: boolean;
  onConnect: () => void;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  isInstalled,
  account,
  isConnecting,
  onConnect,
}) => {
  if (!isInstalled) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        className="w3-btn w3-btn-install"
      >
        <span className="w3-btn-icon">🦊</span>
        Install MetaMask
      </a>
    );
  }

  if (account) {
    return (
      <div className="w3-wallet-connected">
        <span className="w3-wallet-dot" />
        <span className="w3-wallet-address">
          {account.slice(0, 6)}…{account.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="w3-btn w3-btn-connect"
    >
      {isConnecting ? (
        <>
          <span className="w3-spinner" />
          Connecting…
        </>
      ) : (
        <>
          <span className="w3-btn-icon">🦊</span>
          Connect MetaMask
        </>
      )}
    </button>
  );
};
