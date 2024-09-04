
import { Chain } from "@chain-registry/v2-types"

export const creditFromStarship = (faucetUrl: string, address: string, denom: string) => fetch(faucetUrl, {
  method: 'POST',
  body: JSON.stringify({ address, denom }),
  headers: {
    'Content-Type': 'application/json'
  }
})



export const starshipChain: Chain = {
  "chainName": "osmosis",
  "chainId": "test-osmosis-1",
  "prettyName": "Osmosis Devnet",
  "status": "live",
  "networkType": "devnet",
  "bech32Prefix": "osmo",
  "daemonName": "osmosisd",
  "nodeHome": "\/root\/.osmosisd",
  "keyAlgos": [
    "secp256k1"
  ],
  "slip44": 118,
  "alternativeSlip44s": [],
  "fees": {
    "feeTokens": [
      {
        "denom": "uosmo",
        "fixedMinGasPrice": 0,
        "lowGasPrice": 0,
        "averageGasPrice": 0.025000000000000001387778780781445675529539585113525390625,
        "highGasPrice": 0.040000000000000000832667268468867405317723751068115234375
      }
    ]
  },
  "staking": {
    "stakingTokens": [
      {
        "denom": "uosmo"
      }
    ],
    "lockDuration": {
      "time": "1209600s"
    }
  },
  "codebase": {
    "gitRepo": "https:\/\/github.com\/osmosis-labs\/osmosis",
    "compatibleVersions": [],
    "consensus": {
      "type": "tendermint"
    },
    "icsEnabled": [],
    "versions": []
  },
  "images": [],
  "peers": {
    "seeds": [
      {
        "id": "314a4729b75c19b445c85cf9f0493681175be1c2",
        "address": "http:\/\/test-osmosis-1-genesis.default.svc.cluster.local:26657",
        "provider": "test-osmosis-1"
      }
    ],
    "persistentPeers": []
  },
  "apis": {
    "rpc": [
      {
        "address": "http:\/\/localhost:26657",
        "provider": "test-osmosis-1"
      }
    ],
    "rest": [
      {
        "address": "http:\/\/localhost:1317",
        "provider": "test-osmosis-1"
      }
    ],
    "grpc": [
      {
        "address": "http:\/\/test-osmosis-1-genesis.default.svc.cluster.local:9091",
        "provider": "test-osmosis-1"
      }
    ],
    "wss": [],
    "grpcWeb": [],
    "evmHttpJsonrpc": []
  },
  "explorers": [
    {
      "kind": "ping-pub",
      "url": "http:\/\/localhost:8080"
    }
  ],
  "keywords": [],
  "extraCodecs": []
}


export const starshipChain1: Chain = {
  "chainName": "cosmoshub",
  "chainId": "test-cosmoshub-4",
  "prettyName": "Cosmos Hub Devnet",
  "status": "live",
  "networkType": "devnet",
  "bech32Prefix": "cosmos",
  "daemonName": "gaiad",
  "nodeHome": "\/root\/.gaia",
  "keyAlgos": [
    "secp256k1"
  ],
  "slip44": 118,
  "alternativeSlip44s": [],
  "fees": {
    "feeTokens": [
      {
        "denom": "uatom",
        "fixedMinGasPrice": 0,
        "lowGasPrice": 0,
        "averageGasPrice": 0.025000000000000001387778780781445675529539585113525390625,
        "highGasPrice": 0.040000000000000000832667268468867405317723751068115234375
      }
    ]
  },
  "staking": {
    "stakingTokens": [
      {
        "denom": "uatom"
      }
    ],
    "lockDuration": {
      "time": "1209600s"
    }
  },
  "codebase": {
    "gitRepo": "https:\/\/github.com\/cosmos\/gaia",
    "compatibleVersions": [],
    "consensus": {
      "type": "tendermint"
    },
    "icsEnabled": [],
    "versions": []
  },
  "images": [],
  "peers": {
    "seeds": [
      {
        "id": "3c309ffe019ab314562ea452a9bfc4ad4374163e",
        "address": "http:\/\/test-cosmoshub-4-genesis.default.svc.cluster.local:26657",
        "provider": "test-cosmoshub-4"
      }
    ],
    "persistentPeers": []
  },
  "apis": {
    "rpc": [
      {
        "address": "http:\/\/localhost:26653",
        "provider": "test-cosmoshub-4"
      }
    ],
    "rest": [
      {
        "address": "http:\/\/localhost:1313",
        "provider": "test-cosmoshub-4"
      }
    ],
    "grpc": [
      {
        "address": "http:\/\/test-cosmoshub-4-genesis.default.svc.cluster.local:9091",
        "provider": "test-cosmoshub-4"
      }
    ],
    "wss": [],
    "grpcWeb": [],
    "evmHttpJsonrpc": []
  },
  "explorers": [
    {
      "kind": "ping-pub",
      "url": "http:\/\/localhost:8080"
    }
  ],
  "keywords": [],
  "extraCodecs": []
}