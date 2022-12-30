const tokenContractAddress = "0x3922920b7465b1C05119673282a027082F71541B";
const tokenContractAbi = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
];

const contractLotteryAddress = "0xD216152Dfe1BDc65B145377B0D261648560B0494";
const contractLotteryAbi = [
  "function ethInLottery() public view returns(uint256)",
  "function maxEthInLottery() public view returns(uint256)",
  "function tokensInLottery() public view returns(uint256)",
  "function maxTokensInLottery() public view returns(uint256)",
  "function minTokensForBet() public view returns(uint256)",
  "function maxTokensForBet() public view returns(uint256)",
  "function winRate() public view returns(uint256)",
  "function winMultiplier() public view returns(uint256)",
  "function bet(uint256 _tokens) public",
  "event BetResult(address indexed _from, uint256 _value)",
];

let connectedWalletAddress = '';
let balanceAnyl = 0;
let provider, signer, contractToken, contractLottery;

function web3()
{
  if (provider === undefined)
  {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    signer = provider.getSigner();
    contractToken = new ethers.Contract(tokenContractAddress, tokenContractAbi, signer);
    contractLottery = new ethers.Contract(contractLotteryAddress, contractLotteryAbi, signer);
    contractLottery.on("BetResult", (_from, _value) => onBetResult(_from,_value));
  }
  return {
    provider, signer, contractToken, contractLottery
  }
}

function fillTokens(amount)
{
  document.getElementById('tokensAmount').value = balanceAnyl * amount / 100;
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
  document.getElementById('tokensAmount').value = '250000';
  await updateControls();
}

function round(number, decimals)
{
  return Math.floor(number * 10 ** decimals) / 10 ** decimals;
}

async function updateControls()
{
  const { provider, signer, contractToken, contractLottery } = web3();

  const tokensInLottery = await contractLottery.tokensInLottery();
  const tokensInLotteryNum = Number(ethers.utils.formatUnits(tokensInLottery.toString(), 18));
  const maxTokensInLottery = await contractLottery.maxTokensInLottery();
  const maxTokensInLotteryNum = Number(ethers.utils.formatUnits(maxTokensInLottery.toString(), 18));
  //console.log(tokensInLotteryNum, maxTokensInLotteryNum);
  document.getElementById("tokensInLottery").value = tokensInLotteryNum + ' / ' + maxTokensInLotteryNum;

  const ethInLottery = await contractLottery.ethInLottery();
  const ethInLotteryNum = Number(ethers.utils.formatUnits(ethInLottery.toString(), 18));
  const maxEthInLottery = await contractLottery.maxEthInLottery();
  const maxEthInLotteryNum = Number(ethers.utils.formatUnits(maxEthInLottery.toString(), 18));
  //console.log(tokensInLotteryNum, maxTokensInLotteryNum);
  document.getElementById("ethPrizePool").value = ethInLotteryNum + ' / ' + maxEthInLotteryNum;

  const isproviderConnected = connectedWalletAddress != '';
  if (!isproviderConnected)
    return;

  const balance = await contractToken.balanceOf(connectedWalletAddress);
  const balanceNum = Number(ethers.utils.formatUnits(balance.toString(), 18));
  balanceAnyl = balanceNum;
  document.getElementById("labelAmountTokens").innerText = "(balance " + round(balanceNum, 4) + " ANYL)";

  const tokensAmount = document.getElementById("tokensAmount").value;
  const approveAmount = await contractToken.allowance(connectedWalletAddress, contractLotteryAddress);
  const denom = ethers.BigNumber.from(10).pow(10)
  const isLotteryRunning = await contractLottery.ethInLottery() > 0;
  const approveAmountNum = ethers.BigNumber.from(approveAmount).div(denom).toNumber() / 10 ** 8;
  const isAmountFilled = Number(tokensAmount) > 0 || Number(tokensAmount) < 0;
  const isAmountAllowed = isproviderConnected && isAmountFilled && approveAmountNum >= tokensAmount;

  //console.log(tokensAmount, approveAmountNum, isAmountFilled, isAmountAllowed, isLotteryRunning);

  if (isproviderConnected && isAmountFilled && !isAmountAllowed)
    document.getElementById('btnApprove').classList.remove("disabled");
  else
    document.getElementById('btnApprove').classList.add("disabled");

  if (isproviderConnected && isAmountFilled && isAmountAllowed && isLotteryRunning)
    document.getElementById('btnBet').classList.remove("disabled");
  else
    document.getElementById('btnBet').classList.add("disabled");
}

async function onBtnApprove()
{
  const { provider, contractToken } = web3();

  let tokensAmount = Number(document.getElementById("tokensAmount").value) * 1.01;
  //console.log(tokensAmount);
  tokensAmount = Math.floor(tokensAmount * 10000) / 10000;
  //console.log(tokensAmount);
  const tokensAmountFmted = ethers.utils.parseUnits(tokensAmount.toString(), 18);
  //console.log(tokensAmountFmted);
  const tx = await contractToken.approve(contractLotteryAddress, tokensAmountFmted);
  console.log("tx", tx);
}

async function onBtnBet()
{
  const { provider, signer, contractToken, contractLottery } = web3();

  let tokensAmount = document.getElementById("tokensAmount").value;
  tokensAmount = round(tokensAmount, 6);

  const tokensAmountStr = ethers.utils.parseUnits(tokensAmount.toString(), 18);
  const tx = await contractLottery.bet(
    tokensAmountStr
  );
  console.log("tx", tx);
}

async function onBetResult(_from, _value)
{
  console.log('BetResult', _from, _value);
  if (_from.toLowerCase() === connectedWalletAddress.toLowerCase())
  {
    const valueNum = Number(ethers.utils.formatUnits(_value.toString(), 18));
    if (valueNum == 0)
    {
      console.log('Loose', valueNum);
      const template = document.getElementById('resultLoose');
      let newElem = template.cloneNode();
      newElem.removeAttribute("hidden");
      newElem.innerText = "Sorry, you lost";
      template.parentElement.append(newElem);
    }
    else
    {
      console.log('Win', valueNum);
      const template = document.getElementById('resultWin');
      let newElem = template.cloneNode();
      newElem.removeAttribute("hidden");
      newElem.innerText = "Congratulate, you won " + valueNum + " ETH";
      template.parentElement.append(newElem);
    }
  }
  updateControls();
}

/**
 * main
 */
$(function ()
{
  document.getElementById('btnConnect').onclick = onBtnConnect;
  document.getElementById('btnApprove').onclick = onBtnApprove;
  document.getElementById('btnBet').onclick = onBtnBet;
  updateControls();

  //some RPC doens't support it, so keep asking manually
  setInterval(() => updateControls(), 1000 * 5);
});

