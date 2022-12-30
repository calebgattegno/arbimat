//import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";

var storedAuthHash = '';
var connectedWalletAddress = '';

// token contract address BDSM
const tokenContractAddress = "0x8F408ff2D5353CCfABafbe36105ACC691344d41a";
const tokenContractAbi = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const swapperContractAddress = "0xABD3089f3Bb89019CF5bF10dBE182B21b68a668E"
const swapperContractAbi = [
  "function isClaimable() public view returns(bool)",
  "function depositSourceTokens(uint256 _amount) public",
  "function withdrawSourceTokens(uint256 _amount) public",
  "function claim() public",
  "function amountSourceTokens() public view returns(uint256)",
  "function amountTargetTokens() public view returns(uint256)",
  "function depositedSourceAmount(address _addr) public view returns(uint256)",
  "function hasClaimed(address _addr) public view returns(bool)",
];

let provider, signer, contractToken, contractSwapper;
function web3()
{
  if (provider === undefined)
  {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    signer = provider.getSigner();
    contractToken = new ethers.Contract(tokenContractAddress, tokenContractAbi, signer);
    contractSwapper = new ethers.Contract(swapperContractAddress, swapperContractAbi, signer);
  }
  return {
    provider, signer, contractToken, contractSwapper
  }
}

async function onBtnConnect() 
{
  const { provider, contractToken } = web3();
  const networkId = await provider.getNetwork();
  if (networkId.chainId != 42161)
  {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: 42161 }]
    });
  }
  provider.provider.on("accountsChanged", (accounts) => onWalletConnected());
  provider.provider.on("chainChanged", (chainId) => onWalletConnected());
  provider.provider.on("networkChanged", (networkId) => onWalletConnected());
  await onWalletConnected(); 
}

async function onWalletConnected()
{
  const { provider, contractToken } = web3();

  const accs = await provider.send("eth_requestAccounts", []);
  connectedWalletAddress = accs[0];

  const balance = await contractToken.balanceOf(connectedWalletAddress);
  const balanceNum = Number(ethers.utils.formatUnits(balance.toString(), 18));
  document.getElementById("depositTokensAmount").value = balanceNum;
  await updateControls();
}

async function onBtnApprove()
{
  const { provider, contractToken } = web3();

  //some RPC doens't support it, so also checking manually
  contractToken.on("Approval", (owner, spender, value) =>
  {
    updateControls();
  });

  let tokensAmount = Number(document.getElementById("depositTokensAmount").value) * 1.01;
  console.log(tokensAmount);
  tokensAmount = Math.floor(tokensAmount * 10000) / 10000;
  console.log(tokensAmount);
  const tokensAmountFmted = ethers.utils.parseUnits(tokensAmount.toString(), 18);
  console.log(tokensAmountFmted);
  const tx = await contractToken.approve(swapperContractAddress, tokensAmountFmted);
  console.log("tx", tx);
}

async function onBtnDepositOrWithdraw()
{
  const { provider, contractToken, contractSwapper } = web3();

  let tokensAmount = document.getElementById("depositTokensAmount").value;
  tokensAmount = Math.floor(tokensAmount * 10000) / 10000;
  const tokensAmountFmted = ethers.utils.parseUnits(Math.abs(tokensAmount).toString(), 18);
  console.log('Deposit/withdraw', tokensAmount, tokensAmountFmted);
  if (tokensAmount > 0)
  {
    const tx = await contractSwapper.depositSourceTokens(tokensAmountFmted);
    console.log("tx", tx);
  }
  else
  {
    const tx = await contractSwapper.withdrawSourceTokens(tokensAmountFmted);
    console.log("tx", tx);
  }
}

async function onBtnClaim()
{
  const { provider, contractToken, contractSwapper } = web3();

  const tx = await contractSwapper.claim();
  console.log("tx", tx);
}

async function updateControls()
{
  console.log('updateControls');

  const { provider, contractToken } = web3();

  const totalSourceLocked = ethers.utils.formatUnits(await contractSwapper.amountSourceTokens(), 18);
  document.getElementById('editTotalBdsmLocked').value = totalSourceLocked;

  const totalTargetLocked = ethers.utils.formatUnits(await contractSwapper.amountTargetTokens(), 18);
  document.getElementById('editTotalArbiTokens').value = totalTargetLocked;

  const isproviderConnected = connectedWalletAddress != '';
  if (!isproviderConnected)
    return;

  const balance = await contractToken.balanceOf(connectedWalletAddress);
  const balanceNum = Number(ethers.utils.formatUnits(balance.toString(), 18));
  const tokensAmount = document.getElementById("depositTokensAmount").value;
  const approveAmount = await contractToken.allowance(connectedWalletAddress, swapperContractAddress);
  const denom = ethers.BigNumber.from(10).pow(10)
  const isClaimable = await contractSwapper.isClaimable();
  const approveAmountNum = ethers.BigNumber.from(approveAmount).div(denom).toNumber() / 10**8;
  const isAmountFilled = Number(tokensAmount) > 0 || Number(tokensAmount) < 0;
  const isAmountAllowed = isproviderConnected && isAmountFilled && approveAmountNum >= tokensAmount;

  console.log(tokensAmount, approveAmountNum, isAmountFilled, isAmountAllowed, isClaimable);

  if (isproviderConnected && isAmountFilled && !isAmountAllowed)
    document.getElementById('btnApprove').classList.remove("disabled");
  else
    document.getElementById('btnApprove').classList.add("disabled");

  if (isproviderConnected && isAmountFilled && isAmountAllowed & !isClaimable)
    document.getElementById('btnDeposit').classList.remove("disabled");
  else
    document.getElementById('btnDeposit').classList.add("disabled");

  if (isproviderConnected && isClaimable)
    document.getElementById('btnClaim').classList.remove("disabled");
  else
    document.getElementById('btnClaim').classList.add("disabled");

  document.getElementById('connectedWallet').value = connectedWalletAddress;
  document.getElementById('labelTotalTokens').innerText = ' (' + balanceNum + ' BDSMv1 available)';

  const userLocked = ethers.utils.formatUnits(await contractSwapper.depositedSourceAmount(connectedWalletAddress));
  document.getElementById('editCurrentUserLocked').value = userLocked;
  document.getElementById('editPoolShare').value = Number(totalSourceLocked) == 0 ? '-' : String(Math.floor(userLocked / totalSourceLocked * 100 * 100) / 100) + '%';
}

/**
 * main
 */
$(function ()
{
  document.getElementById('btnLogin').onclick = onBtnConnect;
  document.getElementById('btnApprove').onclick = onBtnApprove;
  document.getElementById('btnDeposit').onclick = onBtnDepositOrWithdraw;
  document.getElementById('btnClaim').onclick = onBtnClaim;
  document.getElementById('depositTokensAmount').onchange = updateControls;
  updateControls();
  //some RPC doens't support it, so keep asking manually
  setInterval(() => updateControls(), 1000 * 5);
});

