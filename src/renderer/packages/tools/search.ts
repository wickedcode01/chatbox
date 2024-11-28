import { getDefaultStore } from 'jotai'
import * as atoms from '../../stores/atoms'


export const performSearch = async (input: string | InputObj, ext?: object): Promise<string> => {
    const store = getDefaultStore();
    const settings = store.get(atoms.settingsAtom);
    const { googleCx, googleAPIKey } = settings;

    try {
        console.log(input);
        if (typeof input === 'string') {
            input = JSON.parse(input) as InputObj;
        }

        const query = input.query;
        const url = `https://www.googleapis.com/customsearch/v1?key=${googleAPIKey}&cx=${googleCx}&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.items;

    } catch (error) {
        throw new Error(String(error));
    }
};



interface InputObj {
    query: string;
}