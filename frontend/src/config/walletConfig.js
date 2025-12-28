/**
 * Wallet Configuration for Verified NFT Marketplace
 * Week 3 Builder Challenge - WalletKit SDK Integration
 */

import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

// WalletConnect Project ID for Week 3 Challenge
export const WALLET_CONNECT_PROJECT_ID = '973aec75d9c96397c8ccd94d62bada81';

// Network Configuration
export const NETWORK_CONFIG = {
  testnet: new StacksTestnet(),
  mainnet: new StacksMainnet(),
};

// Current network (testnet for development)
export const NETWORK = NETWORK_CONFIG.testnet;
export const NETWORK_NAME = 'testnet';

// Contract Configuration
export const CONTRACT_CONFIG = {
  address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  name: 'verified-marketplace',
  network: NETWORK,
  fullId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.verified-marketplace',
  // Note: Contract ready but pending full Clarity 4 testnet support
  status: 'development', // Will be 'deployed' once testnet supports Clarity 4
};

// App Configuration for Stacks Connect
export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// App Metadata
export const APP_METADATA = {
  name: 'Verified NFT Marketplace',
  description: 'NFT marketplace that only allows verified/audited NFT contracts',
  url: 'https://verified-nft-marketplace.stacks.app',
  icons: ['https://verified-nft-marketplace.stacks.app/logo.png']
};

// WalletConnect Configuration
export const walletConnectConfig = {
  projectId: WALLET_CONNECT_PROJECT_ID,
  metadata: APP_METADATA,
  chains: ['stacks:testnet'],
};

// Connect Options for Stacks Connect
export const connectOptions = {
  appDetails: {
    name: 'Verified NFT Marketplace',
    icon: `${window.location.origin}/logo.png`,
  },
  redirectTo: '/',
  onFinish: () => {
    window.location.reload();
  },
  userSession,
};

// Supported Wallets Configuration
export const SUPPORTED_WALLETS = {
  HIRO: {
    name: 'Hiro Wallet',
    icon: '/wallets/hiro.svg',
    downloadUrl: 'https://wallet.hiro.so/',
    deepLink: 'hiro://',
    chromeWebStore: 'https://chrome.google.com/webstore/detail/hiro-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj',
    recommended: true
  },
  XVERSE: {
    name: 'Xverse',
    icon: '/wallets/xverse.svg',
    downloadUrl: 'https://www.xverse.app/',
    deepLink: 'xverse://',
    chromeWebStore: 'https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg'
  },
  LEATHER: {
    name: 'Leather',
    icon: '/wallets/leather.svg',
    downloadUrl: 'https://leather.io/',
    deepLink: 'leather://',
    chromeWebStore: 'https://chrome.google.com/webstore/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj'
  },
  OKX: {
    name: 'OKX Wallet',
    icon: '/wallets/okx.svg',
    downloadUrl: 'https://www.okx.com/web3',
    deepLink: 'okx://wallet',
    universalLink: 'https://www.okx.com/download'
  }
};

// Reown AppKit Configuration (optional but recommended)
export const reownAppKitConfig = {
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [NETWORK_NAME],
  providers: [],
  metadata: {
    ...APP_METADATA,
    verifyUrl: 'https://verify.walletconnect.com'
  },
  appearance: {
    theme: 'dark',
    accentColor: '#5546ff',
    borderRadius: 'medium',
    logo: '/logo.png'
  },
  features: {
    analytics: true,
    email: false,
    socials: ['google', 'github', 'discord'],
    emailShowWallets: true
  }
};

// Helper function to connect wallet
export const connectWallet = () => {
  showConnect(connectOptions);
};

// Helper function to get current user data
export const getCurrentUser = () => {
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    return {
      address: userData.profile.stxAddress.testnet,
      mainnetAddress: userData.profile.stxAddress.mainnet,
      username: userData.username,
      profile: userData.profile,
    };
  }
  return null;
};

// Helper function to disconnect wallet
export const disconnectWallet = () => {
  userSession.signUserOut();
  window.location.reload();
};

// API Configuration
export const API_CONFIG = {
  baseUrl: 'https://api.testnet.hiro.so',
  contractInterface: `/v2/contracts/interface/${CONTRACT_CONFIG.address}/${CONTRACT_CONFIG.name}`,
  contractEvents: `/extended/v1/contract/${CONTRACT_CONFIG.address}.${CONTRACT_CONFIG.name}/events`,
  readOnlyCall: `/v2/contracts/call-read/${CONTRACT_CONFIG.address}/${CONTRACT_CONFIG.name}`,
};

// Helper to check if wallet is installed
export const isWalletInstalled = (walletName) => {
  switch (walletName) {
    case 'HIRO':
      return typeof window.HiroWalletProvider !== 'undefined';
    case 'XVERSE':
      return typeof window.XverseProviders !== 'undefined';
    case 'LEATHER':
      return typeof window.LeatherProvider !== 'undefined';
    case 'OKX':
      return typeof window.okxwallet !== 'undefined';
    default:
      return false;
  }
};

// Track wallet events for Week 3 Builder Challenge leaderboard
export const trackWalletEvent = (eventName, eventData = {}) => {
  const event = {
    event: eventName,
    timestamp: Date.now(),
    projectId: WALLET_CONNECT_PROJECT_ID,
    protocol: 'verified-nft-marketplace',
    ...eventData
  };

  // Send to analytics endpoint
  if (window.analytics) {
    window.analytics.track(eventName, event);
  }

  // Log for debugging
  console.log('Wallet Event:', event);

  // Store locally for metrics
  const events = JSON.parse(localStorage.getItem('wallet_events') || '[]');
  events.push(event);

  // Keep only last 500 events
  if (events.length > 500) {
    events.splice(0, events.length - 500);
  }

  localStorage.setItem('wallet_events', JSON.stringify(events));

  return event;
};

// Export metrics for leaderboard tracking
export const getWalletMetrics = () => {
  const events = JSON.parse(localStorage.getItem('wallet_events') || '[]');

  return {
    totalConnections: events.filter(e => e.event === 'wallet_connected').length,
    uniqueWallets: [...new Set(events.map(e => e.wallet))].length,
    totalTransactions: events.filter(e => e.event === 'transaction_submitted').length,
    totalFeesGenerated: events
      .filter(e => e.fee)
      .reduce((sum, e) => sum + parseFloat(e.fee), 0),
    walletKitUsage: events.filter(e => e.sdk === 'walletkit').length,
    reownAppKitUsage: events.filter(e => e.sdk === 'reown').length,
    lastActivity: events[events.length - 1]?.timestamp || null
  };
};

// NFT Marketplace specific configuration
export const MARKETPLACE_CONFIG = {
  // Marketplace fees (2.5%)
  marketplaceFeePercent: 2.5,

  // Max royalty (10%)
  maxRoyaltyPercent: 10,

  // Supported NFT standards
  supportedStandards: ['SIP-009', 'SIP-010'],

  // Listing types
  listingTypes: {
    FIXED_PRICE: 'fixed-price',
    AUCTION: 'auction'
  },

  // Auction settings
  auctionSettings: {
    minDuration: 3600, // 1 hour in seconds
    maxDuration: 2592000, // 30 days in seconds
    minBidIncrement: 5 // 5% minimum bid increment
  }
};

// Builder Challenge Tracking
export const BUILDER_CHALLENGE = {
  week: 3,
  requirements: {
    walletKit: true,
    walletConnectId: WALLET_CONNECT_PROJECT_ID,
    multiWalletSupport: true,
    userTracking: true,
    feeTracking: true,
    reownAppKit: true, // Optional but recommended
  },
  features: [
    'WalletKit SDK integration (@stacks/connect)',
    'Multi-wallet support (Hiro, Xverse, Leather, OKX)',
    'User activity tracking',
    'Fee generation monitoring',
    'Reown AppKit integration (optional)',
    'WalletConnect Project ID configuration'
  ]
};

export default {
  WALLET_CONNECT_PROJECT_ID,
  NETWORK,
  NETWORK_NAME,
  CONTRACT_CONFIG,
  appConfig,
  userSession,
  walletConnectConfig,
  connectOptions,
  connectWallet,
  getCurrentUser,
  disconnectWallet,
  API_CONFIG,
  SUPPORTED_WALLETS,
  isWalletInstalled,
  trackWalletEvent,
  getWalletMetrics,
  MARKETPLACE_CONFIG,
  BUILDER_CHALLENGE,
  APP_METADATA,
  reownAppKitConfig,
};
