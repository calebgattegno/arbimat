const contractVestingDevsAddress = "0x91E43015255886d334d14121831c654Dd87B849C"
const contractVestingReferralsAddress = "0xC1B8470DF35825bb966bB078BabA3c05cAb03eCf"
const contractVestingAirdropsAddress = "0x0B2E0E39802a71b8C61352dD43e8980bECD77361"
const contractPresaleAddress = "0xDfc1e102343B600262Dd92524EF6ECD694a195e2"
const contractPresaleAbi = [
  "function presaleMaxWalletAllocationEth() public view returns (uint256)",
  "function presaleMaxWalletAllocationTokens() public view returns (uint256)",
  "function presaleMaxTotalAmountEth() public view returns (uint256)",
  "function totalPaidEth() public view returns (uint256)",
  "function isPurchaseWithoutWlAllowed() public view returns (bool)",
  "function isNoLimitPurchaseAllowed() public view returns (bool)",
  "function isClaimingAllowed() public view returns (bool)",
  "function totalPurchasedTokens() public view view returns (uint256)",
  "function isWhitelisted(address _address) public view returns (bool)",
  "function isClaimed(address _address) public view returns (bool)",
  "function purchasedAmountEth(address _address) public view returns (uint256)",
  "function purchase() public payable",
  "function claim() public",
];

const contractVestingAbi = [
  "function getTokensAmountClaimable(address _recipient) public view returns (uint256)",
  "function getTokensAmountTotalVested(address _recipient) public view returns (uint256) ",
  "function getTokensAmountUnclaimed(address _recipient) public view returns (uint256)",
  "function getTokensAmountClaimed(address _recipient) public view returns (uint256)",
  "function claim() public ",
];

let connectedWalletAddress = '';
let provider, signer, contractPresale;

function web3()
{
  if (provider === undefined)
  {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    signer = provider.getSigner();
    contractPresale = new ethers.Contract(contractPresaleAddress, contractPresaleAbi, signer);
    contractVestingDevs = new ethers.Contract(contractVestingDevsAddress, contractVestingAbi, signer);
    contractVestingAirdrops = new ethers.Contract(contractVestingAirdropsAddress, contractVestingAbi, signer);
    contractVestingReferral = new ethers.Contract(contractVestingReferralsAddress, contractVestingAbi, signer);
  }
  return {
    provider, signer, contractPresale, contractVestingDevs, contractVestingAirdrops, contractVestingReferral
  }
}

async function onBtnConnect() 
{
  const { provider } = web3();

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
  const { provider, contract } = web3();

  const accs = await provider.send("eth_requestAccounts", []);
  connectedWalletAddress = accs[0];
  document.getElementById('connectedWallet').value = connectedWalletAddress;
  await updateControls();
}

function round(number, decimals)
{
  return Math.floor(number * 10 ** decimals) / 10 ** decimals;
}

async function fillVesting(contract, edit1, edit2, btn)
{
  if (!connectedWalletAddress)
  {
    document.getElementById(edit1).value = '-';
    document.getElementById(edit2).value = '-';
    return;
  }

  const claimable = await contract.getTokensAmountClaimable(connectedWalletAddress);
  const totalVested = await contract.getTokensAmountTotalVested(connectedWalletAddress);
  const unclaimed = await contract.getTokensAmountUnclaimed(connectedWalletAddress);
  const claimed = await contract.getTokensAmountClaimed(connectedWalletAddress);
  const claimableNum = Number(ethers.utils.formatUnits(claimable, 18));
  const totalVestedNum = Number(ethers.utils.formatUnits(totalVested, 18));
  const unclaimedNum = Number(ethers.utils.formatUnits(unclaimed, 18));
  const claimedNum = Number(ethers.utils.formatUnits(claimed, 18));

  if (totalVestedNum > 0)
  {
    document.getElementById(edit1).value = round(claimedNum, 2) + ' of ' + round(totalVestedNum, 2) + ' claimed';
    document.getElementById(edit2).value = round(claimableNum, 2) + ' claimeable';
    document.getElementById(btn).classList.remove("disabled");
  }
  else
  {
    document.getElementById(edit1).value = '-';
    document.getElementById(edit2).value = 'nothing to claim';
    document.getElementById(btn).classList.add("disabled");
  }
}

async function fillPresale(contract, edit1, edit2, btn)
{
  if (!connectedWalletAddress)
  {
    document.getElementById(edit1).value = '-';
    document.getElementById(edit2).value = '-';
    return;
  }

  const myPurchaseEth = await contract.purchasedAmountEth(connectedWalletAddress);
  const maxWalletTokens = await contract.presaleMaxWalletAllocationTokens();
  const maxWalletEths = await contract.presaleMaxWalletAllocationEth();
  const isClaimed = await contract.isClaimed(connectedWalletAddress);
  const isClaimingAllowed = await contract.isClaimingAllowed();
  const maxWalletTokensNum = Number(ethers.utils.formatUnits(maxWalletTokens, 18));
  const maxWalletEthsNum = Number(ethers.utils.formatUnits(maxWalletEths, 18));
  const myPurchaseEthNum = Number(ethers.utils.formatUnits(myPurchaseEth, 18));
  const presaleTokenRatio = maxWalletTokensNum / maxWalletEthsNum;
  const tokens = myPurchaseEthNum * presaleTokenRatio;
  
  if (isClaimingAllowed == false)
  {
    document.getElementById(edit1).value = '0 of ' + round(tokens, 2) + ' claimed';
    document.getElementById(edit2).value = 'Claiming not allowed';
    document.getElementById(btn).classList.add("disabled");
  }
  else if (isClaimed == false && myPurchaseEthNum > 0)
  {
    document.getElementById(edit1).value = '0 of ' + round(tokens, 2) + ' claimed';
    document.getElementById(edit2).value = round(tokens, 2) + ' claimeable';
    document.getElementById(btn).classList.remove("disabled");
  }
  else if (isClaimed == true)
  {
    document.getElementById(edit1).value = round(tokens, 2) + ' of ' + round(tokens, 2) + ' claimed';
    document.getElementById(edit2).value = '0 claimeable';
    document.getElementById(btn).classList.add("disabled");
  }
  else
  {
    document.getElementById(edit1).value = '-';
    document.getElementById(edit2).value = 'nothing to claim';
    document.getElementById(btn).classList.add("disabled");
  }
}

async function updateControls()
{
  const { provider, signer, contractPresale, contractVestingDevs, contractVestingAirdrops, contractVestingReferral } = web3();

  fillVesting(contractVestingDevs, 'amountClaimDeveloper1', 'amountClaimDeveloper2', 'btnClaimDeveloper');
  fillVesting(contractVestingAirdrops, 'amountClaimAirdrop1', 'amountClaimAirdrop2', 'btnClaimAirdrop');
  fillVesting(contractVestingReferral, 'amountClaimReferral1', 'amountClaimReferral2', 'btnClaimReferral');
  fillPresale(contractPresale, 'amountClaimPresale1', 'amountClaimPresale2', 'btnClaimPresale');
}

async function btnClaimDeveloper()
{
  const { contractVestingDevs } = web3();
  const tx = await contractVestingDevs.claim();
  console.log("tx", tx);
}

async function btnClaimAirdrop()
{
  const { contractVestingAirdrops } = web3();
  const tx = await contractVestingAirdrops.claim();
  console.log("tx", tx);
}

async function btnClaimReferral()
{
  const { contractVestingReferral } = web3();
  const tx = await contractVestingReferral.claim();
  console.log("tx", tx);
}

async function btnClaimPresale()
{
  const { contractPresale } = web3();
  const tx = await contractPresale.claim();
  console.log("tx", tx);
}

/**
 * main
 */
$(function ()
{
  document.getElementById('btnConnect').onclick = onBtnConnect;
  document.getElementById('btnClaimPresale').onclick = btnClaimPresale;
  document.getElementById('btnClaimReferral').onclick = btnClaimReferral;
  document.getElementById('btnClaimAirdrop').onclick = btnClaimAirdrop;
  document.getElementById('btnClaimDeveloper').onclick = btnClaimDeveloper;

  //document.getElementById('btnPurchase').onclick = onBtnPurchase;
  updateControls();

  //some RPC doens't support it, so keep asking manually
  setInterval(() => updateControls(), 1000 * 5);
});

