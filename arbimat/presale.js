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

let connectedWalletAddress = '';
let provider, signer, contractPresale;

function web3()
{
  if (provider === undefined)
  {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    signer = provider.getSigner();
    contractPresale = new ethers.Contract(contractPresaleAddress, contractPresaleAbi, signer);
  }
  return {
    provider, signer, contractPresale
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
      params: [{chainId:42161}]
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

  const isWhitelisted = await contractPresale.isWhitelisted(connectedWalletAddress);
  const isClaiming = await contractPresale.isClaimingAllowed();
  const isPurchaseWithoutWlAllowed = await contractPresale.isPurchaseWithoutWlAllowed();
  const isNoLimitPurchaseAllowed = await contractPresale.isNoLimitPurchaseAllowed();
  const maxAllocation = await contractPresale.presaleMaxWalletAllocationEth();
  const maxAllocationNum = Number(ethers.utils.formatUnits(maxAllocation, 18));
  const myPurchaseEth = await contractPresale.purchasedAmountEth(connectedWalletAddress);
  const myPurchaseEthNum = Number(ethers.utils.formatUnits(myPurchaseEth, 18));

  if (isClaiming)
  {
    document.getElementById("btnPurchase").innerText = 'Presale is over';
    document.getElementById('btnPurchase').classList.add("disabled");
  }
  else if (isWhitelisted || isPurchaseWithoutWlAllowed || isNoLimitPurchaseAllowed)
  {
    document.getElementById("purchaseAmountEth").value = round(maxAllocationNum - myPurchaseEthNum, 4);
    document.getElementById('btnPurchase').classList.remove("disabled");
    document.getElementById("btnPurchase").innerText = 'PURCHASE';
  }
  else
  {
    document.getElementById("btnPurchase").innerText = 'Not whitelisted';
    document.getElementById('btnPurchase').classList.add("disabled");
  }

  await updateControls();
}

function round(number, decimals)
{
  return Math.floor(number * 10 ** decimals) / 10 ** decimals;
}

async function updateControls()
{
  const { provider, signer, contractPresale } = web3();
  const totalPaidEth = await contractPresale.totalPaidEth();
  const maxAllocation = await contractPresale.presaleMaxTotalAmountEth();
  const maxWalletTokens = await contractPresale.presaleMaxWalletAllocationTokens();
  const maxWalletEths = await contractPresale.presaleMaxWalletAllocationEth();
  const balance = connectedWalletAddress ? await provider.getBalance(connectedWalletAddress) : 0;
  const myPurchaseEth = connectedWalletAddress ? await contractPresale.purchasedAmountEth(connectedWalletAddress) : 0;

  const balanceNum = Number(ethers.utils.formatUnits(balance.toString(), 18));
  const maxWalletTokensNum = Number(ethers.utils.formatUnits(maxWalletTokens, 18));
  const maxWalletEthsNum = Number(ethers.utils.formatUnits(maxWalletEths, 18));
  const maxAllocationNum = Number(ethers.utils.formatUnits(maxAllocation, 18));
  const totalPaidEthNum = Number(ethers.utils.formatUnits(totalPaidEth, 18));
  const myPurchaseEthNum = Number(ethers.utils.formatUnits(myPurchaseEth, 18));

  const presaleTokenRatio = maxWalletTokensNum / maxWalletEthsNum;
  const presalePercentProgress = round(totalPaidEthNum / maxAllocationNum * 100, 1);
  const tokens = myPurchaseEthNum * presaleTokenRatio;
  const presaleProgress = maxAllocation;
  document.getElementById('presaleProgress').innerText = presalePercentProgress + '%';
  document.getElementById('presaleProgress').setAttribute("style", "width: " + presalePercentProgress + "%");
  document.getElementById('presaleProgress').setAttribute("aria-volumenow", presalePercentProgress);
  document.getElementById('editTotalPresaleCap').value = totalPaidEthNum + ' / ' + maxAllocationNum;

  if (connectedWalletAddress)
  {
    document.getElementById('editMyPurchase').value = myPurchaseEthNum + ' / ' + maxWalletEthsNum;
    document.getElementById("labelAmountETH").innerText = "(balance " + round(balanceNum, 4) + " ETH)";
    document.getElementById('editMyPurchaseAmat').value = round(tokens, 2);
  }
  else
  {
    document.getElementById('editMyPurchase').value = '-';
    document.getElementById("labelAmountETH").innerText = "";
    document.getElementById('editMyPurchaseAmat').value = '-';
  }
}

async function onBtnPurchase()
{
  const { provider, signer, contractPresale } = web3();
  let purchaseAmountEth = document.getElementById("purchaseAmountEth").value;
  purchaseAmountEth = round(purchaseAmountEth, 6);
  const purchaseAmountEthStr = ethers.utils.parseUnits(Math.abs(purchaseAmountEth).toString(), 18);
  console.log('Buy', purchaseAmountEthStr);
  const tx = await contractPresale.purchase({ value: purchaseAmountEthStr });
  console.log("tx", tx);
}

/**
 * main
 */
$(function ()
{
  document.getElementById('btnConnect').onclick = onBtnConnect;
  document.getElementById('btnPurchase').onclick = onBtnPurchase;
  updateControls();

  //some RPC doens't support it, so keep asking manually
  setInterval(() => updateControls(), 1000 * 5);
});

