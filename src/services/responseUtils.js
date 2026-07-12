/**
 * Extract array from API response that may be PagedResponse or plain array.
 * Handles: { items: [] }, [array], undefined, { success, data: { items: [] } }
 */
export const unwrapList = (res) => {
    const d = res?.data ?? res;
    if (Array.isArray(d)) return d;
    if (d?.items && Array.isArray(d.items)) return d.items;
    if (d?.data && Array.isArray(d.data)) return d.data;
    if (d?.data?.items && Array.isArray(d.data.items)) return d.data.items;
    return [];
};

/**
 * Extract single object from API response.
 * Handles: { data: {...} }, { success, data: {...} }, plain object
 */
export const unwrapOne = (res) => {
    const d = res?.data ?? res;
    if (d && typeof d === 'object' && !Array.isArray(d)) return d;
    return null;
};
