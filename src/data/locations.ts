
export interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
    description: string;
}

export const LOCATIONS: Location[] = [
    {
        id: 'andheri',
        name: 'Andheri',
        lat: 19.1197,
        lng: 72.8464,
        description: 'The sleepless heart of entertainment',
    },
    {
        id: 'bandra',
        name: 'Bandra',
        lat: 19.0596,
        lng: 72.8295,
        description: 'Queen of the Suburbs',
    },
    {
        id: 'colaba',
        name: 'Colaba',
        lat: 18.9067,
        lng: 72.8147,
        description: 'Gateway to history',
    },
    {
        id: 'dharavi',
        name: 'Dharavi',
        lat: 19.0420,
        lng: 72.8522,
        description: 'City within a city',
    },
    {
        id: 'juhu',
        name: 'Juhu',
        lat: 19.0883,
        lng: 72.8263,
        description: 'Sands of stardom',
    },
    {
        id: 'marine-lines',
        name: 'Marine Lines',
        lat: 18.9432,
        lng: 72.8235,
        description: ' The Queen’s Necklace',
    },
    {
        id: 'worli',
        name: 'Worli',
        lat: 19.0176,
        lng: 72.8150,
        description: 'Where sea meets sky',
    },
    {
        id: 'dadar',
        name: 'Dadar',
        lat: 19.0178,
        lng: 72.8478,
        description: 'The cultural pulse',
    },
    {
        id: 'fort',
        name: 'Fort',
        lat: 18.9322,
        lng: 72.8353,
        description: 'Colonial echoes',
    },
    {
        id: 'powai',
        name: 'Powai',
        lat: 19.1176,
        lng: 72.9060,
        description: 'Lakeside innovation',
    },
];
