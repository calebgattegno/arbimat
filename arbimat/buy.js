const tokenContractAddress = "0xAC321E487fb31b4Ef736b271BecE18829f79e661";
const tokenContractAbi = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const contractMarketAddress = "0xB3585f24922eC6212ef93fdbc1FD1fFf4a0Df7Bc";
const contractMarketAbi = [
  "function swapEthForTokensWithReferral(uint256 _minAmountOut, address _to, address _referrer) public payable",
  "function getCurrentPriceRatio() public view returns (uint112 amount0, uint112 amount1)",
  "function minimalHoldingForReferralBonus() public view returns(uint256)"
];


let connectedWalletAddress = '';
let referralWalletAddress = '';
let referralValid = false;
let provider, signer, contractToken, contractMarket;

function web3()
{
  if (provider === undefined)
  {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    signer = provider.getSigner();
    contractToken = new ethers.Contract(tokenContractAddress, tokenContractAbi, signer);
    contractMarket = new ethers.Contract(contractMarketAddress, contractMarketAbi, signer);
  }
  return {
    provider, signer, contractToken, contractMarket
  }
}

function fillSlippage(amount)
{
  document.getElementById('purchaseSlippage').value = amount;
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
  const { provider, contractToken, contract } = web3();

  const accs = await provider.send("eth_requestAccounts", []);
  connectedWalletAddress = accs[0];
  document.getElementById('connectedWallet').value = connectedWalletAddress;
  document.getElementById('btnPurchase').classList.remove("disabled");
  document.getElementById('reflink').href = "./buy.html?ref=" + connectedWalletAddress;
  await updateControls();
}

function round(number, decimals)
{
  return Math.floor(number * 10 ** decimals) / 10 ** decimals;
}

async function getCurrentPrice()
{
  const { provider, contractToken, contractMarket } = web3();
  try
  {
    const priceRatio = await contractMarket.getCurrentPriceRatio();
    const priceRatio1Num = Number(ethers.utils.formatUnits(priceRatio.amount0.toString(), 18));
    const priceRatio2Num = Number(ethers.utils.formatUnits(priceRatio.amount1.toString(), 18));
    const price = priceRatio2Num / priceRatio1Num;
    return price;
  }
  catch (err)
  {
    //when token is not started
    return undefined;
  }
}

async function updateControls()
{
  const { provider, signer, contractToken, contractPresale } = web3();

  const currentPrice = await getCurrentPrice();
  document.getElementById("currentPrice").value = currentPrice ? (round(currentPrice, 8) + " AMAT/ETH") : "Trading not started";
  if (!connectedWalletAddress)
    return;
  const balance = await provider.getBalance(connectedWalletAddress);
  const balanceNum = Number(ethers.utils.formatUnits(balance.toString(), 18));
  document.getElementById("labelAmountETH").innerText = "(balance " + round(balanceNum, 4) + " ETH)";

  const balanceToken = await contractToken.balanceOf(connectedWalletAddress);
  const balanceTokenNum = Number(ethers.utils.formatUnits(balanceToken.toString(), 18));
  document.getElementById("currentBalance").value = round(balanceTokenNum, 2) + " AMAT";
}

async function fillReferrerStatus(refCode)
{
  const { contractMarket, contractToken } = web3();
  document.getElementById('referralCode').value = referralWalletAddress;

  try
  {
    const referalHoldings = await contractToken.balanceOf(referralWalletAddress);
    const minimalHoldings = await contractMarket.minimalHoldingForReferralBonus();
    const referalHoldingsNum = Number(ethers.utils.formatUnits(referalHoldings.toString(), 18));
    const minimalHoldingsNum = Number(ethers.utils.formatUnits(minimalHoldings.toString(), 18));

    if (referalHoldingsNum < minimalHoldingsNum)
    {
      document.getElementById('referralStatus').value = "Referral doesn't hold minimum balance " + minimalHoldingsNum + " AMAT";
      document.getElementById('warningRefNotValid').removeAttribute('hidden');
      referralValid = false;
    }
    else
    {
      document.getElementById('referralStatus').value = "Referral code is ok";
      document.getElementById('warningRefNotValid').setAttribute('hidden', '');
      referralValid = true;
    }
  }
  catch (err)
  {
    console.log(err);
    document.getElementById('referralStatus').value = 'Invalid referral code';
    referralValid = false;
  }
}

async function onBtnPurchase()
{
  const { provider, signer, contractToken, contractMarket } = web3();

  let purchaseAmountEth = document.getElementById("purchaseAmountEth").value;
  purchaseAmountEth = round(purchaseAmountEth, 6);
  const currentSlippage = document.getElementById("purchaseSlippage").value;
  const currentPrice = await getCurrentPrice();
  const minimumBuyTokens = (purchaseAmountEth * (1 / currentPrice)) * ((100 - currentSlippage) / 100)
  console.log('Price', currentPrice, 'eths:', purchaseAmountEth, 'minBuy:', minimumBuyTokens);

  const minimumBuyTokensStr = ethers.utils.parseUnits(minimumBuyTokens.toString(), 18);
  const purchaseAmountEthStr = ethers.utils.parseUnits(purchaseAmountEth.toString(), 18);
  console.log(minimumBuyTokensStr, purchaseAmountEthStr);
  const tx = await contractMarket.swapEthForTokensWithReferral(
    minimumBuyTokensStr,
    connectedWalletAddress,
    referralValid ? referralWalletAddress : '0x0000000000000000000000000000000000000000',
    { value: purchaseAmountEthStr }
  );
  console.log("tx", tx);
}

/**
 * main
 */
$(function ()
{
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  referralWalletAddress = urlParams.get('ref');
  fillReferrerStatus(referralWalletAddress);

  document.getElementById('btnConnect').onclick = onBtnConnect;
  document.getElementById('btnPurchase').onclick = onBtnPurchase;
  updateControls();

  //some RPC doens't support it, so keep asking manually
  setInterval(() => updateControls(), 1000 * 5);
});

