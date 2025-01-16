export const createSignerOption = (chainName: string) => {
  return {
    prefix: `${chainName}cosmos`,
    amino: {
      signMode: 'SIGN_MODE_LEGACY_AMINO_JSON',
      prefix: 'cosmos',
      accountNumber: '0',
      sequence: '0'
    }
  }
}