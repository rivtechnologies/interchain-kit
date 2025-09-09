export const starshipConfig = {
  name: 'interchain-kit-e2e',
  version: '1.7.0',
  chains: [
    {
      id: 'osmosis-1',
      name: 'osmosis',
      numValidators: 1,
      ports: {
        rest: 1313,
        rpc: 26653,
        faucet: 9090
      },
      resources: {
        cpu: '0.2',
        memory: '200M'
      }
    },
    {
      id: 'cosmoshub-4',
      name: 'cosmoshub',
      numValidators: 1,
      ports: {
        rest: 1317,
        rpc: 26657,
        faucet: 9094
      },
      resources: {
        cpu: '0.2',
        memory: '200M'
      }
    }
  ],
  relayers: [
    {
      name: 'osmos-cosmos',
      type: 'hermes',
      replicas: 1,
      chains: [
        'osmosis-1',
        'cosmoshub-4'
      ],
      resources: {
        cpu: '0.1',
        memory: '100M'
      }
    }
  ],
  registry: {
    enabled: true,
    ports: {
      rest: 8081,
      grpc: 9091
    }
  }
};