import * as sdkHelpers from '@/services/tx/tx-sender/sdk'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import type { SafeProvider } from '@safe-global/protocol-kit'
import {
  getFallbackHandlerDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
  getSafeMigrationDeployment,
} from '@safe-global/safe-deployments'
import { type SafeState } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import type { TransactionData } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Interface, JsonRpcProvider } from 'ethers'
import { createUpdateSafeTxs, extractTargetVersionFromUpdateSafeTx } from '../safeUpdateParams'
import * as web3 from '@/hooks/wallets/web3'
import { chainBuilder } from '@/tests/builders/chains'
import { getLatestSafeVersion } from '@safe-global/utils/utils/chains'
import { OperationType } from '@safe-global/types-kit'

const MOCK_SAFE_ADDRESS = '0x0000000000000000000000000000000000005AFE'

const getMockSafeProviderForChain = (chainId: number) => {
  return {
    getExternalProvider: jest.fn(),
    getExternalSigner: jest.fn(),
    getChainId: jest.fn().mockReturnValue(BigInt(chainId)),
    isContractDeployed: jest.fn().mockResolvedValue(true),
  } as unknown as SafeProvider
}

describe('safeUpgradeParams', () => {
  jest
    .spyOn(web3, 'getWeb3ReadOnly')
    .mockImplementation(() => new JsonRpcProvider(undefined, { name: 'ethereum', chainId: 1 }))

  jest.spyOn(sdkHelpers, 'getSafeProvider').mockImplementation(() => getMockSafeProviderForChain(1))

  it('Should add setFallbackHandler transaction data for 1.0.0 Safes', async () => {
    const mockSafe = {
      address: {
        value: MOCK_SAFE_ADDRESS,
      },
      version: '1.0.0',
    } as SafeState

    const mockChainInfo = chainBuilder()
      .with({ chainId: '1', l2: false, recommendedMasterCopyVersion: '1.4.1' })
      .build()
    const txs = await createUpdateSafeTxs(mockSafe, mockChainInfo)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeSingletonDeployment({ version: '1.4.1', network: '1' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeSetFallbackHandlerAddress(fallbackHandlerTx.data),
        getFallbackHandlerDeployment({ version: getLatestSafeVersion(mockChainInfo), network: '1' })?.defaultAddress,
      ),
    ).toBeTruthy()
  })

  it('Should upgrade L1 safe to L1 1.4.1', async () => {
    const mockSafe = {
      address: {
        value: MOCK_SAFE_ADDRESS,
      },
      version: '1.1.1',
    } as SafeState
    const mockChainInfo = chainBuilder()
      .with({ chainId: '1', l2: false, recommendedMasterCopyVersion: '1.4.1' })
      .build()
    const txs = await createUpdateSafeTxs(mockSafe, mockChainInfo)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeSingletonDeployment({ version: '1.4.1', network: '1' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeSetFallbackHandlerAddress(fallbackHandlerTx.data),
        getFallbackHandlerDeployment({ version: getLatestSafeVersion(mockChainInfo), network: '1' })?.defaultAddress,
      ),
    ).toBeTruthy()
  })

  it('Should upgrade L2 safe to L2 1.4.1', async () => {
    jest.spyOn(sdkHelpers, 'getSafeProvider').mockImplementation(() => getMockSafeProviderForChain(100))

    const mockSafe = {
      address: {
        value: MOCK_SAFE_ADDRESS,
      },
      version: '1.1.1',
    } as SafeState
    const mockChainInfo = chainBuilder()
      .with({ chainId: '100', l2: true, recommendedMasterCopyVersion: '1.4.1' })
      .build()

    const txs = await createUpdateSafeTxs(mockSafe, mockChainInfo)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeL2SingletonDeployment({ version: '1.4.1', network: '100' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeSetFallbackHandlerAddress(fallbackHandlerTx.data),
        getFallbackHandlerDeployment({ version: '1.4.1', network: '100' })?.defaultAddress,
      ),
    ).toBeTruthy()
  })
})

describe('extractTargetVersionFromUpdateSafeTx', () => {
  const mockSafeBase = {
    address: { value: MOCK_SAFE_ADDRESS },
    chainId: '1001', // Kairos
    fallbackHandler: null,
  } as unknown as SafeState

  const makeDelegateTxData = (toAddress: string): TransactionData => ({
    to: { value: toAddress, name: null, logoUri: null },
    operation: OperationType.DelegateCall,
    hexData: '0x',
    value: '0',
  })

  it('detects v1.4.1 SafeMigration delegate call on Kairos', () => {
    const v141Address = getSafeMigrationDeployment({ version: '1.4.1' })?.defaultAddress
    const txData = makeDelegateTxData(v141Address!)
    const safe = { ...mockSafeBase, version: '1.3.0' } as unknown as SafeState

    const result = extractTargetVersionFromUpdateSafeTx(txData, safe)
    expect(result).toBe('1.4.1')
  })

  it('detects v1.5.0 SafeMigration delegate call on Kairos (regression for "Unknown contract")', () => {
    // createUpdateMigration() uses defaultAddress for the SafeMigration contract.
    // For chains with recommendedMasterCopyVersion='1.5.0' (like Kairos/1001), the
    // v1.5.0 SafeMigration is used but was previously undetected → "Unknown contract" in UI.
    const v150Address = getSafeMigrationDeployment({ version: '1.5.0' })?.defaultAddress
    const txData = makeDelegateTxData(v150Address!)
    const safe = { ...mockSafeBase, version: '1.3.0' } as unknown as SafeState

    const result = extractTargetVersionFromUpdateSafeTx(txData, safe)
    expect(result).toBe('1.5.0')
  })

  it('returns undefined for an unrecognised delegate call target', () => {
    const txData = makeDelegateTxData('0x1234567890123456789012345678901234567890')
    const safe = { ...mockSafeBase, version: '1.3.0' } as unknown as SafeState

    const result = extractTargetVersionFromUpdateSafeTx(txData, safe)
    expect(result).toBeUndefined()
  })
})

const decodeChangeMasterCopyAddress = (data: string): string => {
  const CHANGE_MASTER_COPY_ABI = 'function changeMasterCopy(address _masterCopy)'

  const multiSendInterface = new Interface([CHANGE_MASTER_COPY_ABI])
  const decodedAddress = multiSendInterface.decodeFunctionData('changeMasterCopy', data)[0]
  return decodedAddress.toString()
}

const decodeSetFallbackHandlerAddress = (data: string): string => {
  const CHANGE_FALLBACK_HANDLER_ABI = 'function setFallbackHandler(address handler)'

  const multiSendInterface = new Interface([CHANGE_FALLBACK_HANDLER_ABI])
  const decodedAddress = multiSendInterface.decodeFunctionData('setFallbackHandler', data)[0]
  return decodedAddress.toString()
}
