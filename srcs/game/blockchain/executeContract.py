import json
import os
from dotenv import load_dotenv
from web3 import Web3

# Input files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUTS_DIR = os.path.join(BASE_DIR, "blockchain/contractOutputs/")
ABI_FILE = os.path.join(OUTPUTS_DIR, "abi.json")
CONTRACT_ADDRESS = os.path.join(OUTPUTS_DIR, "contract_address.json")

# Set the environment variables
load_dotenv()
w3_provider = os.environ.get("WEB3_PROVIDER", None)
chain_id = int(os.environ.get("CHAIN_ID"))
my_address = os.environ.get("MY_ADDRESS", None)
private_key = os.getenv("PRIVATE_OWNER_KEY", None)

# Create a Web3 instance
w3 = Web3(
    Web3.HTTPProvider(w3_provider)
)  # Replace 'w3_provider' with your actual Ethereum node URL


def load_json_file(path, key):
    with open(path, "r") as f:
        data = json.load(f)
    return data[key] if key else data


# Set the variables for the contract
abi = load_json_file(ABI_FILE, None)
contract_address = load_json_file(CONTRACT_ADDRESS, "contractAddress")


def retrieve_transaction():
    # If env variables are missing, return an error for running the Django server
    if (
        w3_provider is None
        or chain_id == 0
        or my_address is None
        or private_key is None
    ):
        print("Error: One or more required environment variables are missing.")
        return

    # Load the contract
    tournament_contract = w3.eth.contract(address=contract_address, abi=abi)
    print("Retrieve transaction:", tournament_contract.functions.retrieve().call())

    # Retrieve the log from the contract
    tournaments = tournament_contract.functions.retrieve().call()
    tournaments = sorted(tournaments, key=lambda x: x[-1])

    # Convert the log into a dictionary
    tournament_log = []
    for tournament in tournaments:
        tournament_dict = []

        for idx, game in enumerate(tournament):
            if idx < 3:  # Limit to 3 iterations
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
        "etherscan": f"https://goerli.etherscan.io/address/{contract_address}",
    }

    # Convert the dictionary to JSON format
    json_data = json.dumps(tournament_log_data, ensure_ascii=False, indent=4)
    return json_data


def record_transaction(tournament):
    # If env variables are missing, return an error for running the Django server
    if (
        w3_provider is None
        or chain_id == 0
        or my_address is None
        or private_key is None
    ):
        print("Error: One or more required environment variables are missing.")
        return

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


# Example usage:
# json_data = retrieve_transaction()
# record_transaction("YourTournamentData")
