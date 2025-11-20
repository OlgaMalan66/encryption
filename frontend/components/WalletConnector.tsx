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
  const [lastReconnectTime, setLastReconnectTime] = useState<number>(0);
  const [reconnectTimeoutId, setReconnectTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  // Wallet reconnection logic
  useEffect(() => {
    if (!enableAutoReconnect) return;

    const handleReconnect = async () => {
      const now = Date.now();
      const timeSinceLastAttempt = now - lastReconnectTime;

      // FIX: Prevent too frequent reconnection attempts
      if (timeSinceLastAttempt < 5000) { // Minimum 5 seconds between attempts
        return;
      }

      if (!isConnected && connectionAttempts < 5) { // Allow up to 5 attempts
        try {
          setIsConnecting(true);
          setLastReconnectTime(now);

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

          // FIX: Smart delay based on attempt count and time
          let delay = 1000; // Base 1 second
          if (connectionAttempts > 0) {
            delay = Math.min(Math.pow(2, connectionAttempts) * 1000, 30000); // Max 30 seconds
          }
          await new Promise(resolve => setTimeout(resolve, delay));

          // FIX: Attempt connection with timeout
          const connectionPromise = connect({ connector: metaMaskConnector });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 15000) // 15 second timeout
          );

          await Promise.race([connectionPromise, timeoutPromise]);

          // FIX: Reset attempts on successful connection
          setConnectionAttempts(0);

        } catch (error) {
          console.error('Reconnection failed:', error);
          setConnectionAttempts(prev => prev + 1);

          // FIX: Schedule next attempt with increasing delay
          if (connectionAttempts < 4) {
            const nextDelay = Math.min(Math.pow(2, connectionAttempts + 1) * 2000, 60000); // Max 1 minute
            const timeoutId = setTimeout(handleReconnect, nextDelay);
            setReconnectTimeoutId(timeoutId);
          }
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

        // FIX: Listen for network connectivity changes
      const handleOnline = () => {
        console.log('Network back online');
        if (!isConnected && enableAutoReconnect) {
          setTimeout(handleReconnect, 1000);
        }
      };

      // FIX: Listen for visibility changes (user returns to tab)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && !isConnected && enableAutoReconnect) {
          console.log('Tab became visible, checking connection');
          setTimeout(handleReconnect, 500);
        }
      };

      window.addEventListener('online', handleOnline);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // FIX: Enhanced cleanup function
      return () => {
        // Clear any pending reconnection timeouts
        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
          setReconnectTimeoutId(null);
        }

        // Remove all event listeners
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
        ethereum.removeListener('disconnect', handleDisconnect);
        window.removeEventListener('online', handleOnline);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    // FIX: Cleanup for non-ethereum environments
    return () => {
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        setReconnectTimeoutId(null);
      }
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
