var storedAuthHash="",connectedWalletAddress="";const tokenContractAddress="0x8F408ff2D5353CCfABafbe36105ACC691344d41a",tokenContractAbi=["function approve(address _spender, uint256 _value) public returns (bool success)","function allowance(address owner, address spender) public view returns (uint256)","function balanceOf(address account) public view returns (uint256)","event Approval(address indexed owner, address indexed spender, uint256 value)"],swapperContractAddress="0xABD3089f3Bb89019CF5bF10dBE182B21b68a668E",swapperContractAbi=["function isClaimable() public view returns(bool)","function depositSourceTokens(uint256 _amount) public","function withdrawSourceTokens(uint256 _amount) public","function claim() public","function amountSourceTokens() public view returns(uint256)","function amountTargetTokens() public view returns(uint256)","function depositedSourceAmount(address _addr) public view returns(uint256)","function hasClaimed(address _addr) public view returns(bool)"];let provider,signer,contractToken,contractSwapper;function web3(){return void 0===provider&&(provider=new ethers.providers.Web3Provider(window.ethereum,"any"),signer=provider.getSigner(),contractToken=new ethers.Contract(tokenContractAddress,tokenContractAbi,signer),contractSwapper=new ethers.Contract(swapperContractAddress,swapperContractAbi,signer)),{provider:provider,signer:signer,contractToken:contractToken,contractSwapper:contractSwapper}}async function onBtnConnect(){const{provider:e,contractToken:t}=web3();e.provider.on("accountsChanged",(e=>onWalletConnected())),e.provider.on("chainChanged",(e=>onWalletConnected())),e.provider.on("networkChanged",(e=>onWalletConnected())),await onWalletConnected()}async function onWalletConnected(){const{provider:e,contractToken:t}=web3(),n=await e.send("eth_requestAccounts",[]);connectedWalletAddress=n[0];const o=await t.balanceOf(connectedWalletAddress),r=Number(ethers.utils.formatUnits(o.toString(),18));document.getElementById("depositTokensAmount").value=r,await updateControls()}async function onBtnApprove(){const{provider:e,contractToken:t}=web3();t.on("Approval",((e,t,n)=>{updateControls()}));let n=1.01*Number(document.getElementById("depositTokensAmount").value);n=Math.floor(1e4*n)/1e4;const o=ethers.utils.parseUnits(n.toString(),18),r=await t.approve(swapperContractAddress,o);console.log("tx",r)}async function onBtnDepositOrWithdraw(){const{provider:e,contractToken:t,contractSwapper:n}=web3();let o=document.getElementById("depositTokensAmount").value;o=Math.floor(1e4*o)/1e4;const r=ethers.utils.parseUnits(Math.abs(o).toString(),18);if(console.log("Deposit/withdraw",o,r),o>0){const e=await n.depositSourceTokens(r);console.log("tx",e)}else{const e=await n.withdrawSourceTokens(r);console.log("tx",e)}}async function onBtnClaim(){const{provider:e,contractToken:t,contractSwapper:n}=web3(),o=await n.claim();console.log("tx",o)}async function updateControls(){console.log("updateControls");const{provider:e,contractToken:t}=web3(),n=ethers.utils.formatUnits(await contractSwapper.amountSourceTokens(),18);document.getElementById("editTotalBdsmLocked").value=n;const o=ethers.utils.formatUnits(await contractSwapper.amountTargetTokens(),18);document.getElementById("editTotalArbiTokens").value=o;const r=""!=connectedWalletAddress;if(!r)return;const a=await t.balanceOf(connectedWalletAddress),s=Number(ethers.utils.formatUnits(a.toString(),18)),c=document.getElementById("depositTokensAmount").value,d=await t.allowance(connectedWalletAddress,swapperContractAddress),i=ethers.BigNumber.from(10).pow(18),l=await contractSwapper.isClaimable(),u=ethers.BigNumber.from(d).div(i).toNumber(),p=Number(c)>0||Number(c)<0,m=r&&p&&u>=c;console.log(c,u,p,m,l),r&&p&&!m?document.getElementById("btnApprove").classList.remove("disabled"):document.getElementById("btnApprove").classList.add("disabled"),r&&p&&m&!l?document.getElementById("btnDeposit").classList.remove("disabled"):document.getElementById("btnDeposit").classList.add("disabled"),r&&l?document.getElementById("btnClaim").classList.remove("disabled"):document.getElementById("btnClaim").classList.add("disabled"),document.getElementById("connectedWallet").value=connectedWalletAddress,document.getElementById("labelTotalTokens").innerText=" ("+s+" BDSMv1 available)";const b=ethers.utils.formatUnits(await contractSwapper.depositedSourceAmount(connectedWalletAddress));document.getElementById("editCurrentUserLocked").value=b,document.getElementById("editPoolShare").value=0==Number(n)?"-":String(Math.floor(b/n*100*100)/100)+"%"}$((function(){document.getElementById("btnLogin").onclick=onBtnConnect,document.getElementById("btnApprove").onclick=onBtnApprove,document.getElementById("btnDeposit").onclick=onBtnDepositOrWithdraw,document.getElementById("btnClaim").onclick=onBtnClaim,document.getElementById("depositTokensAmount").onchange=updateControls,updateControls(),setInterval((()=>updateControls()),5e3)}));