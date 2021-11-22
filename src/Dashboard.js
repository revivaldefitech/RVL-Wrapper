import * as React from "react";
import { useEagerConnect, useInactiveListener } from "./hooks";
import './App.css';
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
import ABI from './lottery.json';
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

function Dashboard() {
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





  const pause = async () => {
    const address = '0x35eFc9B50CEF4d3D83463708A39662cc6812f52d';
    const web3 = new Web3(Web3.givenProvider)
    const smartContract = new web3.eth.Contract(ABI, address);
    await smartContract.methods.changePause().send({
        from: account
    })
  }

  const unpause = async () => {
    const address = '0x35eFc9B50CEF4d3D83463708A39662cc6812f52d';
    const web3 = new Web3(Web3.givenProvider)
    const smartContract = new web3.eth.Contract(ABI, address);

    await smartContract.methods.changePause().send({
        from: account
    })
  }

  const generateRandomNumber = async () => {
    const address = '0x35eFc9B50CEF4d3D83463708A39662cc6812f52d';
    const web3 = new Web3(Web3.givenProvider)
    const smartContract = new web3.eth.Contract(ABI, address);
    await smartContract.methods.extraWinnerPart1().send({
        from: account
    })
  }


  const extractWinner = async () => {
    const address = '0x35eFc9B50CEF4d3D83463708A39662cc6812f52d';
    const web3 = new Web3(Web3.givenProvider)
    const smartContract = new web3.eth.Contract(ABI, address);
    await smartContract.methods.extractWinnerPart2().send({
        from: account
    })
  }


  const transferOwnership = async () => {
    const address = '0x35eFc9B50CEF4d3D83463708A39662cc6812f52d';
    const web3 = new Web3(Web3.givenProvider)
    const smartContract = new web3.eth.Contract(ABI, address);
    await smartContract.methods.changeOwner("0xe3C601b1FC6564ebf5603fCaD7956697761E39Db").send({
        from: account
    })
  }

  

  

  return (
    <div className="App">
      <div className="container">

      <h1>Admin Dashboard</h1>
      <h4>Manage SSB Lottery</h4>

      <hr style={{border:'0'}} /> 
      <div style={{background:'linear-gradient(rgb(39, 8, 65) 0%, black 100%)', padding:'25px', maxWidth:'600px', width:'100%', margin:'auto'}}>
          <div className="row">
            {account ? <div>Connected as {account} </div> : null}
              <h4>Part 1 </h4>
              <ol>
                  <li>
                      Get some LINK token from Pancakeswap. You will need at least 0.2 LINK for each extraction 
                  </li>
                  <li>
                      Visit <a href="https://pegswap.chain.link/" target="_blank">
                      https://pegswap.chain.link/
                      </a> and wrap your LINK to Wrapped LINK  (its address is 0x404460C6A5EdE2D891e8297795264fDe62ADBB75)
                  </li>
                  <li>
                  You must wrap at least 0.2 LINK
                    Deposit the converted Wrapped Link to the Lottery address:
                    0x35eFc9B50CEF4d3D83463708A39662cc6812f52d
                  </li>
                  <li>
                      If you deposited 1 WRAPPED LINK, you will have enough "random extraction funds" for 5 extractions (0.2 each)
                  </li>

              </ol>
          </div>

          <div className="row">
              <h4>Part 2 </h4>
              <ol>
                  <li>
                    Connect to wallet as lottery owner ( 0xa2408Ef0bD37b23959098Eb0114021F036Cb0658 )
                  </li>
                  <li>
                      Press PAUSE button from below and wait for it to confirm of Binance Smart Chain. 
                  </li>
                  <li>
                      Press GENERATE RANDOM NUMBER button from below. Confirm the transaction and  <span style={{fontWeight:'bold'}}>wait at least 2 minutes after it's confirmed on Binance Smart Chain</span>. 
                  </li>
                  <li>
                  After the 2 minutes, press EXTRACT WINNER button 
                  </li>
                  <li>
                      After transaction is confirmed, press UNPAUSE button
                  </li>

              </ol>
          </div>
        <div className="row">
        {active === false ? (      <>

{Object.keys(connectorsByName).map(name => {
  const currentConnector = connectorsByName[name];
  const activating = currentConnector === activatingConnector;
  const connected = currentConnector === connector;
  const disabled =
    !triedEager || !!activatingConnector || connected || !!error;
  return (
    <button type="button" class="btn btn-primary"
      disabled={disabled}
      key={name}
      onClick={() => {
        setActivatingConnector(currentConnector);
        activate(connectorsByName[name]);
      }}
      style={{float:'right',color: "white", background:'#9B51E0'}}
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
</>) : null}
{(active || error) && (
          <button type="button" class="btn btn-text"
            onClick={() => {
              deactivate();
            }}
            style={{color:"white", float:'right', border:'1px solid blue'}}
          >
            Disconnect
          </button>
        )}
        </div>

        <br /> 
        <div className="row">
        <button type="button" class="btn btn-primary" onClick={pause} style={{marginBottom:'2%'}}> PAUSE</button>
        <button type="button" class="btn btn-primary" onClick={generateRandomNumber} style={{marginBottom:'2%'}}> GENERATE RANDOM NUMBER</button>
        <button type="button" class="btn btn-primary" onClick={extractWinner} style={{marginBottom:'2%'}}> EXTRACT WINNER</button>

        <button type="button" class="btn btn-primary" onClick={unpause} style={{marginBottom:'2%'}}> UNPAUSE</button>
        <button type="button" class="btn btn-primary" onClick={transferOwnership}> TRANSFER OWNERSHIP BACK</button>

        
        </div>
      </div>
      </div>

    </div>
  );
}

export default Dashboard;
