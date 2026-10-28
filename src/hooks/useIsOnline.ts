import { useNetworkState } from 'expo-network';

/**
 * `false` only when we know the device is offline. While the state is still
 * unknown (first render, or the OS can't tell) we assume online, so the UI
 * never flashes an offline warning on launch.
 */
export function useIsOnline() {
  const network = useNetworkState();
  return network.isConnected !== false && network.isInternetReachable !== false;
}
