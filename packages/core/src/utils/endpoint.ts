import { HttpEndpoint } from '@interchainjs/types';
import axios, { AxiosRequestConfig } from "axios"

const pendingRequests = new Map<string, Promise<any>>();

const generateRequestKey = (config: AxiosRequestConfig) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
}

const fetchPreventDuplicate = async (config: AxiosRequestConfig) => {
  const requestKey = generateRequestKey(config);

  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const requestPromise = axios(config)
    .then(response => {
      pendingRequests.delete(requestKey);
      return response;
    })
    .catch(error => {
      pendingRequests.delete(requestKey);
      throw error;
    });

  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}



const checkRpcEndpoint = async (endpoint: string | HttpEndpoint) => {
  if (typeof endpoint === 'string') {
    return fetchPreventDuplicate({ url: endpoint, method: 'HEAD' })
  } else {
    return fetchPreventDuplicate({ url: endpoint.url, method: 'HEAD', headers: endpoint.headers })
  }
}

export const isValidRpcEndpoint = async (endpoint: string | HttpEndpoint) => {
  try {
    const res = await checkRpcEndpoint(endpoint)
    return res.status === 200
  } catch (error) {
    // console.error(error)
    return false
  }
}

const timeoutCheck = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))

export const getValidRpcEndpoint = async (endpoints: (string | HttpEndpoint)[]) => {
  let rpc: string | HttpEndpoint = ''
  for (const endpoint of endpoints) {
    try {
      const res = await Promise.race([checkRpcEndpoint(endpoint), timeoutCheck(1500)])
      if (res.status === 200) {
        rpc = endpoint
        break
      }
    } catch (error) {
      // console.error(error)
    }
  }
  return rpc
}

const checkRestEndpoint = async (endpoint: string | HttpEndpoint) => {
  if (typeof endpoint === 'string') {
    return fetch(`${endpoint}/cosmos/base/tendermint/v1beta1/node_info`, { method: "HEAD" })
  } else {
    return fetch(`${endpoint}/cosmos/base/tendermint/v1beta1/node_info`, { method: "HEAD", headers: endpoint.headers })
  }
}

export const isValidRestEndpoint = async (endpoint: string | HttpEndpoint) => {
  try {
    const res = await checkRestEndpoint(endpoint)
    return res.status === 200
  } catch (error) {
    // console.error(error)
    return false
  }
}

export const getValidRestEndpoint = async (endpoints: (string | HttpEndpoint)[]) => {
  let rest: string | HttpEndpoint = ''
  for (const endpoint of endpoints) {
    try {
      const res = await checkRestEndpoint(endpoint)
      if (res.status === 200) {
        rest = endpoint
        break
      }
    } catch (error) {
      // console.error(error)
    }
  }
  return rest
}