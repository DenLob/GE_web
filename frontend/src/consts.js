import axios from "axios";
import {useState} from "react";

const server_ip = '*************'
const local_ip = 'http://localhost:8000/api/'
const apiKey = '*****************';

export const get_server_api_addr = async () => {
    let api_url = '0'
    await axios.get('http://localhost:8000').then(()=>api_url=local_ip).catch(()=>api_url=server_ip)
    return (api_url)
}
