import axios from 'axios';
import fs from 'fs';
import util from 'util';
const readFile = util.promisify(fs.readFile);
const stoContractFile = './smartcontract/sto.scilla';
const helloWorldContractFile = './smartcontract/Hello.scilla';
import { BN, Long, bytes } from '@zilliqa-js/util';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { getAddressFromPrivateKey, getPubKeyFromPrivateKey, sign } from '@zilliqa-js/crypto';

const HOST = 'https://sandbox-api.propine.com';
const VERSION = 'v3';
const TOKEN = '81f649fd-f254-4e5e-af93-f0a2f7eea78f';
const privateKey = "1305c8c7c1e4326c2b29047ca42f42ed6e685a981360b9ff68185f4f070019c5";
const publicKey = getPubKeyFromPrivateKey(privateKey);
// const API_URI = 'https://dev-api.zilliqa.com';
// const CHAIN_ID = "333";
const API_URI = 'https://zilliqa-isolated-server.zilliqa.com';
const CHAIN_ID = "222";
const MSG_VERSION = 1;
const matchComments = /[(][*].*?[*][)]/gs
const matchWhitespace = /\s+/g
const log = console.log;

const URL = {
    'generate-wallet': '{host}/{version}/keys',
    'sign-txns': '{host}/{version}/keys/{key_id}/sign'
}

function replace(api, value) {
    if (!URL[api]) {
        return null;
    }
    value = Object.assign(value, { host: HOST, version: VERSION });
    for (let key in value) {
        URL[api] = URL[api].replace(`{${key}}`, value[key])
    }
    return URL[api];
}

async function curlCall(api, value, obj = {}) {
    try {
        let url = replace(api, obj);
        const { data } = await axios({
            method: 'post',
            url: url,
            data: JSON.stringify(value),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${TOKEN}`
            }
        });
        return data;
    } catch (error) {
        log("error", error)
        throw error;
    }

}

async function createUser() {
    const response = await curlCall('generate-wallet', {
        "token": "zil",
        "name": "Test Name"
    });
    log("response", response)
}

async function deployStoContract() {
    log("Deploying STO contract....")
    try {
        const NIL_ADDRESS = '0x0000000000000000000000000000000000000000';
        const zilliqa = new Zilliqa(API_URI);
        const version = bytes.pack(CHAIN_ID, MSG_VERSION);
        const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();
        const myGasPrice = new BN(minGasPrice.result);
        const gasLimit = 50000;
        const address = getAddressFromPrivateKey(privateKey);
        // log("address", address)
        const registry_address = "0xaf2dd7243d3bd1c30079d3ed4966876752e8740c";

        const stoData = {
            "_id": "62e9e2a6dead6e00265f2921",
            "id": "2a5ae523-cee3-41e9-ba74-8923c3f9a8b2",
            "cmps_contract_address": "0xEE0d0bcd0B4A42D60Fe9223a3702daB7d4a4883e",
            "cmps_name": "Ashish",
            "cmps_profile": "SHARES",
            "cmps_status": "SUCCESS",
            "cmps_symbol": "CARSOME-ORDINARY",
            "cmps_type": "ORDINARY",
            "contract_version": "0.1.1",
            "conversion_rate": 1,
            "created_at": "2022-08-03 10:51:18",
            "custodian_address": "0x3424486a7050c5a54c04d5574b5d53a7f6618244",
            "custodian_email": "ashish@zilliqa.com",
            "firm": "HG_CUSTODY",
            "firm_id": "0",
            "firm_rep_id": "000002",
            "hard_cap": "",
            "initial_client_address": "0x1f2989a48214daf8caf6b90b50346f588935ebe5",
            "initial_client_id": "saayan_wallet_bluebird_recipient",
            "initial_cmps_supply": 1,
            "issuer": "CARSOME",
            "review_note": "test 1",
            "reviewer_email": "ashish@zilliqa.com",
            "seller_profile": "SELLER",
            "structure": "DIRECT",
            "ticket_no": "20220308105135774709",
            "underlying_spv": "Test",
            "updated_at": "2022-08-03 10:53:15",
            "create_timestamp": 1659495078384.0,
            "update_timestamp": 1659495195882.0,
            "maturity_date": "",
            "payout_frequency": "",
            "interest_rate": 0,
            "isin_number": "",
            "denomination": 0,
            "issue_currency": "",
            "first_issue_date": "",
            "put_right_of_holder": "N",
            "early_redemption": "N",
            "governing_law": "",
            "__v": 0
        }

        const init = [
            {
                vname: '_scilla_version',
                type: 'Uint32',
                value: '0',
            },
            {
                vname: 'cmps_name',
                type: 'String',
                value: stoData.cmps_name,
            },
            {
                vname: 'cmps_symbol',
                type: 'String',
                value: stoData.cmps_symbol,
            },
            {
                vname: 'cmps_type',
                type: 'String',
                value: stoData.cmps_type,
            },
            {
                vname: 'cmps_profile',
                type: 'String',
                value: stoData.cmps_profile,
            },
            {
                vname: 'issuer',
                type: 'String',
                value: stoData.issuer,
            },
            {
                vname: 'seller_profile',
                type: 'String',
                value: stoData.seller_profile,
            },
            {
                vname: 'structure',
                type: 'String',
                value: stoData.structure,
            },
            {
                vname: 'conversion_rate',
                type: 'Uint128',
                value: `${stoData.conversion_rate}`,
            },
            {
                vname: 'firm_id',
                type: 'String',
                value: stoData.firm_id,
            },
            {
                vname: 'initial_owner',
                type: 'ByStr20',
                value: address,
            },
            {
                vname: 'initial_client_address',
                type: 'ByStr20',
                value: stoData.initial_client_address,
            },
            {
                vname: 'initial_cmps_supply',
                type: 'Uint128',
                value: `${stoData.initial_cmps_supply}`,
            },
            {
                vname: 'initial_registry_contract',
                type: 'ByStr20',
                value: registry_address,
            },
            {
                vname: 'contract_version',
                type: 'String',
                value: stoData.contract_version,
            },
            {
                vname: 'initial_maturity_date',
                type: 'String',
                value: stoData.maturity_date,
            },
            {
                vname: 'payout_frequency',
                type: 'String',
                value: stoData.payout_frequency,
            },
            {
                vname: 'interest_rate',
                type: 'Uint256',
                value: `${stoData.interest_rate}`,
            },
            {
                vname: 'isin_number',
                type: 'String',
                value: stoData.isin_number,
            },
            {
                vname: 'denomination',
                type: 'Uint128',
                value: `${stoData.denomination}`,
            },
            {
                vname: 'issue_currency',
                type: 'String',
                value: stoData.issue_currency,
            },
            {
                vname: 'first_issue_date',
                type: 'String',
                value: stoData.first_issue_date,
            },
            {
                vname: 'put_right_of_holder',
                type: 'String',
                value: stoData.put_right_of_holder,
            },
            {
                vname: 'early_redemption',
                type: 'String',
                value: stoData.early_redemption,
            },
            {
                vname: 'governing_law',
                type: 'String',
                value: stoData.governing_law,
            }
        ];
        // log("init", JSON.stringify(init));

        const code = (await readFile(stoContractFile)).toString();
        // log("code", code)

        const compressedCode = compress(code)

        const nextNonce = (await zilliqa.blockchain.getBalance(address)).result.nonce + 1;

        const txParams = {
            "to": NIL_ADDRESS,
            "value": new BN(0),
            "gas_price": myGasPrice,
            "gas_limit": `${gasLimit}`,
            "data": JSON.stringify(init).replace(/\\"/g, '"'),
            "code": compressedCode,
            "version": version,
            "nonce": nextNonce
        }
        log("txParams", JSON.stringify(txParams));

        const key_id = '5f089649-96a3-428f-b32d-0ff3a560346c';

        const { data} = await curlCall('sign-txns', txParams, { "key_id": key_id });

        log("data", data);
    } catch (error) {
        log("Signing error..", error.message)
    }
}

async function deployHelloWorldContract() {
    log("Deploying Hello world contract....")
    try {
        const NIL_ADDRESS = '0x0000000000000000000000000000000000000000';
        const zilliqa = new Zilliqa(API_URI);
        const version = bytes.pack(CHAIN_ID, MSG_VERSION);
        const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();
        const myGasPrice = new BN(minGasPrice.result);
        const gasLimit = 50000;
        const address = getAddressFromPrivateKey(privateKey);

        const init = [
            {
                vname: '_scilla_version',
                type: 'Uint32',
                value: '0',
            },
            {
                vname: 'owner',
                type: 'ByStr20',
                value: address,
            }
        ];
        // log("init", JSON.stringify(init));

        const code = (await readFile(helloWorldContractFile)).toString();
        // log("code", code)

        const compressedCode = compress(code)

        const nextNonce = (await zilliqa.blockchain.getBalance(address)).result.nonce + 1;

        const txParams = {
            version: version,
            toAddr: NIL_ADDRESS,
            pubKey: publicKey,
            nonce: nextNonce,
            amount: new BN(0),
            gasPrice: myGasPrice,
            gasLimit: `${gasLimit}`,
            code: compressedCode,
            data: JSON.stringify(init).replace(/\\"/g, '"')
        }
        
        txParams.signature = await getSignature(txParams);

        if (txParams.signature) {
            log('Signature returned from Propine: ' + txParams.signature);
        } else {
            throw new Error('Could not get a signature from ADV');
        }

        const signedTx = zilliqa.transactions.new(txParams);

        const res = await zilliqa.provider.send(
            'CreateTransaction',
            signedTx.txParams
        );
        if(res.error){
            throw new Error(res.error.message);
        }

        log("res", JSON.stringify(res));

        log("Wait for approx 1 mins......")

        await signedTx.confirm(res.result.TranID, 33, 1000);

        log(`Txns id is :0x${res.result.TranID}`);

        log('Retrieved transaction status successfully');
    } catch (error) {
        log("Signing error..", error.message)
    }
}

function compress(code) {
    return code.replace(matchComments, '').replace(matchWhitespace, ' ')
}

async function getSignature(txParams){
    try {
        const advTxParams = {
            "to": txParams.toAddr,
            "value": txParams.amount,
            "gas_price": txParams.gasPrice,
            "gas_limit": txParams.gasLimit,
            "data": txParams.data,
            "code": txParams.code,
            "version": txParams.version,
            "nonce": txParams.nonce
        }
        log("advTxParams", JSON.stringify(advTxParams));
    
        const key_id = '5f089649-96a3-428f-b32d-0ff3a560346c';
    
        const response = await curlCall('sign-txns', advTxParams, { "key_id": key_id });
    
        return response.signed_transaction;
    } catch (error) {
        log("Signing error from ADV...")
        throw Error("Adv signing error");
    }
}

(function () {
    // deployStoContract();
    deployHelloWorldContract();
})()