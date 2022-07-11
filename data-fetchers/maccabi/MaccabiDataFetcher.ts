import { getQueueHash, IQueue } from '../../data/Queue';
import { DataFetcher } from '../DataFetcher';
import axios from 'axios';
import qs from 'qs';

interface IDoctors {
    [key: string]: { doc_licsense: number, doc_name: string };
}

interface ILine {
    doctor_name: string;
}

interface ILineFrame {
    time: string;
    month: string;
    day: string;
    year: string;
    lines: ILine[];
}

interface IDay {
    [key: string]: ILineFrame;
}

interface ICalendar {
    [key: string]: IDay;
}

const serviceTranslation: {[key: string]: string} = {
    'שיננית': 'hygenist',
    'רופא': 'dentist'
};

const placeTranslation: {[key: string]: string} = {
    'נתניה': '31'
};

function parseName(name: string): string {
    return name.replace(/[^א-ת ]/gi, '').split(' ').reverse().join(' ');
}

export class MaccabiDataFetcher extends DataFetcher {

    async fetch(service: string = 'שיננית', place: string = 'נתניה'): Promise<{ queues: IQueue[]; }> {

        const data = qs.stringify({
            'action': 'get_lines',
            'data[macabi_id]': `${placeTranslation[place]}`,
            'data[service_type]': `${serviceTranslation[service]}`,
            'data[age]': 'Y',
            'paged': '1',
            'getnearby': 'false',
            'updateminicalander': 'true',
            'specificdate': '',
            'bday': '1991-06-21',
            'show_video': '' 
        });
        const config = {
            method: 'post',
            url: 'https://maccabi-dent.com/wp-admin/admin-ajax.php',
            headers: { 
                'Accept': 'application/json, text/javascript, */*; q=0.01', 
                'Accept-Language': 'en-US,en;q=0.9,he;q=0.8', 
                'Cache-Control': 'no-cache', 
                'Content-Length': '177', 
                'Host': 'maccabi-dent.com', 
                'Origin': 'https://maccabi-dent.com', 
                'Pragma': 'no-cache', 
                'Referer': 'https://maccabi-dent.com/%D7%AA%D7%95%D7%A8-%D7%9C%D7%9C%D7%90-%D7%A1%D7%99%D7%A1%D7%9E%D7%90/', 
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"', 
                'sec-ch-ua-mobile': '?0', 
                'sec-ch-ua-platform': '"Windows"', 
                'Sec-Fetch-Dest': 'empty', 
                'Sec-Fetch-Mode': 'cors', 
                'Sec-Fetch-Site': 'same-origin', 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36', 
                'Content-Type': 'application/x-www-form-urlencoded', 
                'Cookie': 'MDLUEGSEVIPE=p67uqh1vb7fuh7m7cubo0o3obk; TS01ccdba7=0139ab6fd0d42ece2c92c0b98e8cf115e763128e4a04420a1abae8afa451bb096d89678f3a2c209722b978217873d71fc63c6c9719; TS16ca2245027=08cd0ab03dab2000233c64bfa32ad29d96176359857eb83013e8b934385b62f3924da408d8eaded408c04a1bc91130005d9be4290d1ffffb2100258ef9460f2755170ccce66acd1e8d9c829de8361b5063479302c015b6d6dfa533ff78016fc5'
            },
            data : data
        };

        return axios(config)
            .then(function ({ data }) {
                const queues: IQueue[] = [];
                const doctors = data.doctors as IDoctors;
                const lines = data.lines as ICalendar;
                Object.values(lines).forEach(day => {
                    Object.values(day).forEach(frame => {
                        const { day, time, lines, month, year } = frame;
                        const [hr, min] = time.split(':');
                        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hr), parseInt(min));

                        lines.forEach(({doctor_name}) => {
                            const queueData: Omit<IQueue, 'hash'> = {
                                therapist: {
                                    name: parseName(doctor_name)
                                },
                                date: dateObj.toUTCString(),
                                service,
                                location: {
                                    branch: place,
                                    city: place,
                                },
                            }; 

                            queues.push({
                                ...queueData,
                                hash: getQueueHash(queueData),
                            });
                        });
                    });
                });

                return { queues };
            })
            .catch(function (error) {
                console.log(error);
                return { queues: [] };
            });
    }


}