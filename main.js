import { ethers } from 'https://cdn.skypack.dev/ethers';

const SONIC10_ABI = [
  'function feeForPower(uint8 power) public view returns (uint256)',
  'function mint(uint8 power) external payable'
];
const CONTRACT_ADDRESS = '0x7D9aD34Ea9436659327ba1d765bC9743a7C3E778';

const walletBtn   = document.getElementById('wallet-button');
const statusEl    = document.getElementById('status');
const powerSelect = document.getElementById('power-select');
const mintBtn     = document.getElementById('mint-button');

let provider, signer, account;

walletBtn.addEventListener('click', async () => {
  if (!window.ethereum) {
    alert('Please install MetaMask or another wallet.');
    return;
  }
  if (!account) {
    provider = new ethers.BrowserProvider(window.ethereum);
    const [acct] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = acct;
    signer  = await provider.getSigner();
    walletBtn.textContent = 'Disconnect';
  } else {
    account = signer = provider = null;
    walletBtn.textContent = 'Connect Wallet';
    statusEl.textContent = '';
  }
});

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

if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    account = accounts[0] || null;
    walletBtn.textContent = account ? 'Disconnect' : 'Connect Wallet';
    if (!account) statusEl.textContent = '';
  });
}