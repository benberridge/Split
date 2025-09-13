// main.js

import { createClient, configureChains, useConnect, useSigner } from 'https://cdn.skypack.dev/wagmi';
import { InjectedConnector } from 'https://cdn.skypack.dev/wagmi/connectors/injected';
import { jsonRpcProvider } from 'https://cdn.skypack.dev/wagmi/providers/jsonRpc';
import { publicProvider }   from 'https://cdn.skypack.dev/wagmi/providers/public';
import { ethers }           from 'https://cdn.skypack.dev/ethers';

// 1. Define your SONIC chain
const sonicChain = {
  id: 8888,
  name: 'Sonic',
  network: 'sonic',
  rpcUrls: { default: { http: ['https://rpc.sonic.network'] } },
  nativeCurrency: { name: 'SONIC', symbol: 'SONIC', decimals: 18 },
  blockExplorers: { default: { name: 'SonicScan', url: 'https://scan.sonic.network' } }
};

// 2. Configure providers
const { chains, provider } = configureChains(
  [sonicChain],
  [
    jsonRpcProvider({ rpc: c => ({ http: c.rpcUrls.default.http[0] }) }),
    publicProvider()
  ]
);

// 3. Create wagmi client with injected connector (MetaMask, Rabby, etc.)
const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains })
  ],
  provider
});

// 4. Grab UI elements
const walletBtn   = document.getElementById('wallet-button');
const mintBtn     = document.getElementById('mint-button');
const statusEl    = document.getElementById('status');
const powerSelect = document.getElementById('power-select');

let signer;

// 5. Connect / Disconnect logic
walletBtn.addEventListener('click', async () => {
  const { connect, connectors } = useConnect({ client: wagmiClient });
  const chosen = connectors[0]; // injected
  try {
    const data = await connect({ connector: chosen });
    signer = useSigner({ client: wagmiClient }).data;
    walletBtn.textContent = 'Disconnect';
    statusEl.textContent = '';
  } catch {
    walletBtn.textContent = 'Connect Wallet';
    signer = null;
    statusEl.textContent = '';
  }
});

// 6. Mint logic (from HTML3(10e).txt)
const SONIC10_ABI = [
  'function feeForPower(uint8 power) public view returns (uint256)',
  'function mint(uint8 power) external payable'
];
const CONTRACT_ADDRESS = '0x7D9aD34Ea9436659327ba1d765bC9743a7C3E778';

mintBtn.addEventListener('click', async () => {
  statusEl.textContent = '';
  if (!signer) {
    statusEl.textContent = 'Please connect your wallet first.';
    return;
  }
  const power = parseInt(powerSelect.value, 10);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, SONIC10_ABI, signer);

  try {
    statusEl.textContent = 'Fetching fee…';
    const fee = await contract.feeForPower(power);
    statusEl.textContent = 'Sending transaction…';
    const tx = await contract.mint(power, { value: fee });
    statusEl.textContent = `Transaction sent: ${tx.hash}`;
    await tx.wait();
    statusEl.textContent = `Mint confirmed! Power ${power}.`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Mint failed: ' + (err.error?.message || err.message);
  }
});