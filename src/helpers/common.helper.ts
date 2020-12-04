import * as GoogleGeocode from 'node-library/lib/utils/google.geocoder';

export async function reverseLookup(location){
    try {
        const result = await GoogleGeocode.reverseLookup(location.latitude,location.longitude);
        if(result.length>0)
            return result[0];
    } catch (error) {
        
    }
    return {};
}