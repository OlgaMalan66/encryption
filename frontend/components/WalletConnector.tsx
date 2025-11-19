import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';

interface WalletConnectorProps {
  onConnectionChange?: (connected: boolean) => void;
  enableAutoReconnect?: boolean;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  onConnectionChange,
  enableAutoReconnect = true
}) => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  // Wallet reconnection logic
  useEffect(() => {
    if (!enableAutoReconnect) return;

    const handleReconnect = async () => {
      if (!isConnected && connectionAttempts < 3) {
        try {
          setIsConnecting(true);

          // FIX: Check MetaMask availability before attempting reconnection
          if (!window.ethereum) {
            console.warn('MetaMask not available for reconnection');
            return;
          }

          // FIX: Check network connectivity
          if (!navigator.onLine) {
            console.warn('No internet connection for reconnection');
            return;
          }

          // FIX: Validate MetaMask is the active connector
          const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
          if (!metaMaskConnector) {
            console.warn('MetaMask connector not found');
            return;
          }

          // FIX: Implement exponential backoff
          const delay = Math.pow(2, connectionAttempts) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));

          // FIX: Attempt connection with timeout
          const connectionPromise = connect({ connector: metaMaskConnector });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          );

          await Promise.race([connectionPromise, timeoutPromise]);
          setConnectionAttempts(prev => prev + 1);

        } catch (error) {
          console.error('Reconnection failed:', error);
          setConnectionAttempts(prev => prev + 1);
        } finally {
          setIsConnecting(false);
        }
      }
    };

    // FIX: Proper event listeners for connection state changes
    if (window.ethereum) {
      const ethereum = window.ethereum;

      // FIX: Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          console.log('Wallet disconnected');
          setConnectionAttempts(0); // Reset attempts on manual disconnect
        } else {
          console.log('Accounts changed:', accounts);
        }
      };

      // FIX: Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed:', chainId);
        // Trigger reconnection check when network changes
        setTimeout(handleReconnect, 1000);
      };

      // FIX: Listen for disconnection
      const handleDisconnect = (error: any) => {
        console.log('Wallet disconnected:', error);
        if (enableAutoReconnect && !isConnected) {
          setTimeout(handleReconnect, 2000);
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('disconnect', handleDisconnect);

      // FIX: Cleanup function
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
        ethereum.removeListener('disconnect', handleDisconnect);
      };
    }

    // FIX: Listen for network connectivity changes
    const handleOnline = () => {
      console.log('Network back online');
      if (!isConnected && enableAutoReconnect) {
        setTimeout(handleReconnect, 1000);
      }
    };

    window.addEventListener('online', handleOnline);

    // FIX: Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isConnected, enableAutoReconnect, connectionAttempts, connect, connectors]);

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
        {/* Prioritize MetaMask */}
        {connectors
          .filter(connector => connector.id === 'metaMask')
          .map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector.id)}
              disabled={isConnecting || isPending}
              className="w-full px-4 py-3 text-left bg-orange-50 border border-orange-300 rounded-lg hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    MetaMask 🦊
                  </p>
                  <p className="text-xs text-gray-500">
                    Connect with MetaMask wallet
                  </p>
                </div>
              </div>
            </button>
          ))}

        {/* Other connectors */}
        {connectors
          .filter(connector => connector.id !== 'metaMask')
          .map((connector) => (
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
