import dotenv from 'dotenv';
import express from 'express';
import { Nomba } from '../resources/client.js';
import { NombaConfig } from '../types/config.js';

dotenv.config();
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.raw());

app.get('/', async (req, res) => {
    let output;
    
    output = {message: `Server running...`};
    
    //example;

    //configure client;
    const config: NombaConfig = {
        account_id: process.env.ACCOUNT_ID!,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        environment: process.env.ENVIRONMENT! as NombaConfig['environment'],
        debug: 'error',
    };
    const client = Nomba(config);

    //call an endpoint;
    output = await client.virtual_account.lookup('1234567890');

    if(output?.status){//success
        console.log('success::', output?.data);
    }
    else {//failed;
        console.log('failed::', output?.description);
    }

    res.status(200).json(output);
});

//start local server
if(process.env.IS_LOCAL_MACHINE === 'true'){
    const port = 4000;
    app.listen(port, () => {
        console.log(`[http] listening on port ${port}`);
    });
}

export default app;