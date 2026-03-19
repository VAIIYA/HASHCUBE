/**
 * IPFS Utility functions for HASHCUBE
 */

export const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
];

/**
 * Validates if a string is a potentially valid CID (basic check)
 */
export const isCID = (value: string): boolean => {
    if (!value) return false;

    // CIDv0: starts with Qm, 46 chars
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;

    // CIDv1: usually starts with ba, longer
    const cidv1Regex = /^bafy[a-zA-Z0-9]{55,}$/;

    // Generic check for common patterns if regex is too strict
    return cidv0Regex.test(value) || cidv1Regex.test(value) || (value.length > 40 && /^[a-zA-Z0-9]+$/.test(value));
};

/**
 * Attempts to fix common Base58btc typos in a CID (O->o, I->i, l->L, 0->o)
 */
export const fixCIDTypos = (value: string): string => {
    if (!value) return value;
    if (value.startsWith('Qm') && value.length === 46) {
        // Replace invalid Base58btc characters with their likely intended counterparts
        return value
            .replace(/O/g, 'o')
            .replace(/I/g, 'i')
            .replace(/0/g, 'o')
            .replace(/l/g, 'L');
    }
    return value;
};

/**
 * Extracts CID from a string that might be a full URL, storage path, or just the CID
 */
export const extractCID = (value: string): string | null => {
    if (!value) return null;

    // Try to extract from URL (ipfs.io/ipfs/CID or /ipfs/CID)
    const urlMatch = value.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    if (urlMatch && urlMatch[1]) return urlMatch[1];

    // Check if the value itself is a CID
    if (isCID(value)) return fixCIDTypos(value);

    // Handle cases where the whole value might be a CIDv1 but didn't match the regex
    if (value.startsWith('bafy') && value.length > 50) return value;
    if (value.startsWith('Qm') && value.length === 46) return fixCIDTypos(value);

    return null;
};

/**
 * Gets the gateway URL for a CID and a specific gateway index or default
 */
export const getGatewayUrl = (cid: string, index = 0): string => {
    const gateway = IPFS_GATEWAYS[index % IPFS_GATEWAYS.length];
    return `${gateway}${cid}`;
};

/**
 * Detects if a URL is an IPNS link
 */
export const isIPNS = (value: string): boolean => {
    if (!value) return false;
    return value.includes('/ipns/') || value.startsWith('k51') || value.startsWith('k2k');
};

/**
 * Extracts IPNS key from a string
 */
export const extractIPNS = (value: string): string | null => {
    if (!value) return null;
    const match = value.match(/\/ipns\/([a-zA-Z0-9]+)/);
    if (match && match[1]) return match[1];
    if (value.startsWith('k51') || value.startsWith('k2k')) return value;
    return null;
};
