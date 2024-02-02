import json, os
from dotenv import load_dotenv
from web3 import Web3

# Input files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUTS_DIR = os.path.join(BASE_DIR, "blockchain/contractOutputs/")
ABI_FILE = os.path.join(OUTPUTS_DIR, "abi.json")
CONTRACT_ADDRESS = os.path.join(OUTPUTS_DIR, "contract_address.json")

# Set the environment variables
load_dotenv()
w3 = Web3(Web3.HTTPProvider(os.environ.get("WEB3_PROVIDER")))
chain_id = int(os.environ.get("CHAIN_ID"))
my_address = os.environ.get("MY_ADDRESS")
private_key = os.getenv("PRIVATE_OWNER_KEY")


def load_json_file(path, key):
    with open(path, "r") as f:
        data = json.load(f)
    return data[key] if key else data


# Set the variables for the contract
abi = load_json_file(ABI_FILE, None)
contract_address = load_json_file(CONTRACT_ADDRESS, "contractAddress")


def retrieve_transaction():
    # Load the contract
    tournament_contract = w3.eth.contract(address=contract_address, abi=abi)
    print("retrive transcation! !!:", tournament_contract.functions.retrieve().call())

    # Retrieve the log from the contract
    tournaments = tournament_contract.functions.retrieve().call()

    # Convert the log into a dictionary

    tournament_log = []
    for tournament in tournaments:
        tournament_dict = []

        for idx, game in enumerate(tournament):
            if idx < 3:  # 3번만 반복하도록 조건 추가
                game_id, winner, loser = game
                game_dict = {
                    "game_id": game_id,
                    "winner": {"name": winner[0], "score": winner[1]},
                    "loser": {"name": loser[0], "score": loser[1]},
                }
                tournament_dict.append(game_dict)
        tournament_dict.append({"timestamp": tournament[3]})

        tournament_log.append({"tournament": tournament_dict})

    tournament_log_data = {
        "tournamentLog": tournament_log,
        "etherscan": "https://goerli.etherscan.io/address/{}".format(contract_address),
    }

    # 딕셔너리를 JSON 형태로 변환
    json_data = json.dumps(tournament_log_data, ensure_ascii=False, indent=4)
    return json_data


def record_transaction(tournament):
    # Load the contract
    tournament_contract = w3.eth.contract(address=contract_address, abi=abi)
    nonce = w3.eth.get_transaction_count(my_address)

    # Build the transaction
    add_transaction = tournament_contract.functions.store(tournament).build_transaction(
        {"chainId": chain_id, "from": my_address, "nonce": nonce}
    )
    # Sign the transaction
    signed_add_txn = w3.eth.account.sign_transaction(
        add_transaction, private_key=private_key
    )
    # Send the transaction
    send_add_tx = w3.eth.send_raw_transaction(signed_add_txn.rawTransaction)

    # Wait for the transaction to be mined
    tx_receipt = w3.eth.wait_for_transaction_receipt(send_add_tx)
    print("Recorded Done!")
