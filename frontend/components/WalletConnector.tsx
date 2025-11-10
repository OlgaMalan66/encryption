import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface WalletConnectorProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnectionChange }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  const handleConnect = async (connectorId: string) => {
    try {
      setIsConnecting(true);
      const connector = connectors.find(c => c.id === connectorId);
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Connected</p>
          <p className="text-xs text-green-600 font-mono">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Connect Wallet</h3>
      <div className="grid gap-3">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => handleConnect(connector.id)}
            disabled={isConnecting || isPending}
            className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {connector.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {connector.name}
                </p>
                <p className="text-xs text-gray-500">
                  Connect using {connector.name}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {isConnecting && (
        <div className="text-center text-sm text-gray-600">
          Connecting...
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
