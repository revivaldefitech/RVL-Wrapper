import * as React from "react";
import { useEagerConnect, useInactiveListener } from "./hooks";
import {
  Web3ReactProvider,
  useWeb3React,
  UnsupportedChainIdError
} from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from "@web3-react/injected-connector";
import {
  injected,
} from "./connectors";
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from "@web3-react/frame-connector";
import BEP20 from './erc20.json';
import ABI from './abi.json';
import Web3 from 'web3';
import { ethers } from 'ethers'


const connectorsByName = {
  Injected: injected
};

function getErrorMessage(error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorFrame
  ) {
    return "Please authorize this website to access your Ethereum account.";
  } else {
    console.error(error);
    return "An unknown error occurred. Check the console for more details.";
  }
}

function App() {
  const context = useWeb3React();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error
  } = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState();
  React.useEffect(() => {
    console.log('running')
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  // set up block listener
  const [blockNumber, setBlockNumber] = React.useState();
  React.useEffect(() => {
    console.log('running')
    if (library) {
      let stale = false;

      console.log('fetching block number!!')
      library
        .getBlockNumber()
        .then(blockNumber => {
          if (!stale) {
            setBlockNumber(blockNumber);
          }
        })
        .catch(() => {
          if (!stale) {
            setBlockNumber(null);
          }
        });

      const updateBlockNumber = blockNumber => {
        setBlockNumber(blockNumber);
      };
      library.on("block", updateBlockNumber);

      return () => {
        library.removeListener("block", updateBlockNumber);
        stale = true;
        setBlockNumber(undefined);
      };
    }
  }, [library, chainId]);

  // fetch eth balance of the connected account
  const [ethBalance, setEthBalance] = React.useState();
  React.useEffect(() => {
    if (library && account) {
      let stale = false;

      library
        .getBalance(account)
        .then(balance => {
          if (!stale) {
            setEthBalance(balance);
          }
        })
        .catch(() => {
          if (!stale) {
            setEthBalance(null);
          }
        });

      return () => {
        stale = true;
        setEthBalance(undefined);
      };
    }
  }, [library, account, chainId]);

  const [ssb, setSsb] = React.useState(0)
  const [wssb, setWssb] = React.useState(0)
  const [ssbToStake, setSsbToStake] = React.useState(0)
  const [wssbToStake, setWssbToStake] = React.useState(0)
  const [approval, setApproval] = React.useState('0')
  const [loading, setLoading] = React.useState(false)

  React.useEffect( async() => {
    
    const address = '0xF47C9f5eC2A466c518ce6B119FAe4D915CC40607'; // WSSB address  
    const address2 = '0x7EaeE60040135F20f508A393ca400dEd339d654e'; // SSB address 
    const web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org"));
    const smartContract = new web3.eth.Contract(ABI, address);
    const smartContract2 = new web3.eth.Contract(BEP20, address2);
    if(account){
      let balanceWrapped = await smartContract.methods.balanceOf(account).call();
      let balanceSSB = await smartContract2.methods.balanceOf(account).call(); 
      balanceWrapped = await web3.utils.fromWei(balanceWrapped,'ether');
      balanceSSB = balanceSSB/10**9;
      setWssb(balanceWrapped)
      setSsb(balanceSSB)
      const approval = await smartContract2.methods.allowance(account, address).call();
      setApproval(approval)
    }

  }, [loading, account])
  

  const approve = async() => {
    try{
      setLoading(true)
      const address = '0x7EaeE60040135F20f508A393ca400dEd339d654e';
      const web3 = new Web3(Web3.givenProvider)
      const smartContract = new web3.eth.Contract(BEP20, address);
      await smartContract.methods.approve("0xF47C9f5eC2A466c518ce6B119FAe4D915CC40607",ethers.constants.MaxUint256).send({
        from: account
    });
      setLoading(false)
  
    }catch(err){
      setLoading(false)
    }

  }


  const wrapSSB = async () => {
    try{
      setLoading(true)
      const web3 = new Web3(Web3.givenProvider)
      const address = '0xF47C9f5eC2A466c518ce6B119FAe4D915CC40607'; // WSSB address 
      const smartContract = new web3.eth.Contract(ABI, address);
      const decimals = 9
      const receivedAmountParts = String(ssbToStake).split('.')
          let whole = receivedAmountParts[0] || '0'
          let fraction = receivedAmountParts[1] || '0'

          while (fraction.length < decimals) {
            fraction += '0'
          }
          const amount = web3.utils.toBN(
            whole
          ).mul(
            web3.utils.toBN(
              10
            ).pow(
              web3.utils.toBN(decimals)
            )
          ).add(web3.utils.toBN(
            fraction
          ))
        await smartContract.methods.deposit(amount.toString()).send({
          from: account
        })
      setLoading(false)

    } catch(err){
      setLoading(false)
    }
  }

  const unwrapSSB = async () => {
    try{
      setLoading(true)
      const web3 = new Web3(Web3.givenProvider)
      const address = '0xF47C9f5eC2A466c518ce6B119FAe4D915CC40607'; // WSSB address 
      const smartContract = new web3.eth.Contract(ABI, address);
      const decimals = 18
      const receivedAmountParts = String(wssbToStake).split('.')
          let whole = receivedAmountParts[0] || '0'
          let fraction = receivedAmountParts[1] || '0'

          while (fraction.length < decimals) {
            fraction += '0'
          }
          const amount = web3.utils.toBN(
            whole
          ).mul(
            web3.utils.toBN(
              10
            ).pow(
              web3.utils.toBN(decimals)
            )
          ).add(web3.utils.toBN(
            fraction
          ))
        await smartContract.methods.withdraw(amount.toString()).send({
          from: account
        })
      setLoading(false)

    } catch(err){
      setLoading(false)
    }
  }


  return (
    <div className="p-8">
      <div className="container text-center">

      <h1 className="text-2xl font-medium text-red-500 text-center text-black">Wrap your RVL for Staking</h1>
      <h4 className="mt-2 opacity-80">Fully decentralized</h4>

     

      {Object.keys(connectorsByName).map(name => {
  const currentConnector = connectorsByName[name];
  const activating = currentConnector === activatingConnector;
  const connected = currentConnector === connector;
  const disabled =
    !triedEager || !!activatingConnector || connected || !!error;
  return (
    <button type="button" class="btn btn-primary font-medium"
      disabled={disabled}
      key={name}
      onClick={() => {
        setActivatingConnector(currentConnector);
        activate(connectorsByName[name]);
      }}
      style={{color: "white", background:'#3952A8'}}
    >
        {activating && (
          "Loading..."
        )}
        {/* {connected && (
          <span role="img" aria-label="check">
            ✅
          </span>
        )} */}
      Connect to Wallet
    </button>
  );
})}      

      <div className="max-w-xl mt-8 mx-auto rounded-xl" style={{backgroundColor: '#f9f8fd'}}>
          <div className="flex items-center border-b h-28 px-8 py-4">
            <div className="col border-r w-1/2 h-full">
              <h4>RVL Balance:</h4>
              <p className="mt-2">{ssb}</p>
              </div>
            <div className="col w-1/2 h-full">
                <h4>WRVL Balance:</h4>
                <p className="mt-2">{wssb}</p>
            </div>
        </div>





<div>



</div>


        <div className="row px-8" >
          <div className="col mt-10">
          Convert RVL into WRVL
          <input type="text" className="form-control mt-4" id="exampleInputEmail1" placeholder="Amount of RVL" style={{background:'white', color:'black'}} aria-describedby="emailHelp" onChange={(event) => setSsbToStake(event.target.value)} />
          <br />
          {approval == "0"?           <button type="button" class="btn btn-primary font-medium" style={{width:'100%'}} style={{backgroundColor:'#3952A8'}} onClick={approve} disabled={loading}>Approve Spending</button>
 :           <button type="button" class="btn btn-primary" style={{width:'100%'}} style={{backgroundColor:'#3952A8'}} onClick={wrapSSB} disabled={loading}>WRAP RVL</button>
}
          </div>
        </div>

        <br /> <br />
        <div className="row px-8" >
          <div className="col">
          Convert WRVL into RVL
          <input type="text" class="form-control mt-4 " id="exampleInputEmail1" placeholder="Amount of WRVL" style={{background:'white', color:'black'}} aria-describedby="emailHelp" onChange={(event) => setWssbToStake(event.target.value)} />
          <br />
          <button type="button" class="btn btn-primary font-medium" style={{width:'100%'}} style={{backgroundColor:'#3952A8'}}  onClick={unwrapSSB} disabled={loading}>UNWRAP RVL</button>
          </div>
        </div>

        <br /> <br />
        <div className="row px-8">
        {active === false ? (      <>


</>) : null}
{(active || error) && (
          <button type="button" class="btn btn-text"
            onClick={() => {
              deactivate();
            }}
            style={{color:"white", float:'right'}}
          >
            Disconnect
          </button>
        )}
        </div>

        <br /> 

      </div>
      </div>

    </div>
  );
}

export default App;
