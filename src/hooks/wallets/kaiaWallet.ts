import type { WalletInit } from '@web3-onboard/common'
import { createEIP1193Provider } from '@web3-onboard/common'
import Caver from 'caver-js'

import { KAIAWALLET_SVG } from './consts'

export const createDownloadMessage = (walletLabel: string, download?: string | (() => void)): string => {
  if (!download) return `Please switch to ${walletLabel} to continue`
  if (typeof download === 'function') {
    return `Please <a href="#" onclick="${() => download()}">install</a> or enable to ${walletLabel} to continue`
  } else {
    return `Please <a href="${download}" target="_blank">install</a> or enable to ${walletLabel} to continue`
  }
}

function kaiaWallet(): WalletInit {
  return () => {
    return {
      label: 'KaiaWallet',
      injectedNamespace: 'klaytn',
      getIcon: async () => KAIAWALLET_SVG,
      getInterface: async (interfaceData: any) => {
        const provider: any = window.klaytn
        if (!provider) {
          throw new Error(
            createDownloadMessage(
              'KaiaWallet',
              'https://chromewebstore.google.com/detail/kaia-wallet/jblndlipeogpafnldhgmapagcccfchpi',
            ),
          )
        }
        const chains = interfaceData.chains
        const externalChainsCaver: any = {}
        for (let i = 0; i < chains.length; i++) {
          externalChainsCaver[chains[i].id] = new Caver(chains[i].publicRpcUrl)
        }

        const walletCaver = new Caver(provider)

        return Promise.resolve({
          provider: createEIP1193Provider(provider, {
            eth_sendTransaction: async ({ baseRequest, params }: any) => {
              const txHash = await baseRequest({ method: 'eth_sendTransaction', params })
              return (txHash as string) || ''
            },
            eth_getBalance: async ({ params }: any) => {
              let networkVersion = walletCaver.utils.toHex(provider.networkVersion)

              let selectedAddress = ''
              if (params && params.length > 0) {
                selectedAddress = params[0]
              }
              // Browser Caver couldnt fetch balance of its own address. returning -1 instead. So using external caver.
              let balance = await externalChainsCaver[networkVersion].klay.getBalance(selectedAddress)
              return balance
            },
          }),
        })
      },
    }
  }
}
export default kaiaWallet
