import os, json
from web3 import Web3
from solcx import set_solc_version, compile_standard

# Set Solidity compiler version using solc-select
set_solc_version("0.8.0")

# Set the path to the Solidity file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUTS_DIR = os.path.join(BASE_DIR, "blockchain/contractOutputs/")
SOLIDITY_FILE = "tournament.sol"

# Set the environment variables

from dotenv import load_dotenv

load_dotenv()

w3 = Web3(Web3.HTTPProvider(os.environ.get("WEB3_PROVIDER")))
chain_id = int(os.environ.get("CHAIN_ID"))
my_address = os.environ.get("MY_ADDRESS")
private_key = os.getenv("PRIVATE_OWNER_KEY")

# Set the variables for the contract
bytecode = ""
abi = ""

# Output files
ABI_FILE = os.path.join(OUTPUTS_DIR, "abi.json")
CONTRACT_ADDRESS = os.path.join(OUTPUTS_DIR, "contract_address.json")


# Compile Solidity for the smart contract
def compile_solidity():
    print("Compiling Solidity!!")
    contract = "TournamentStorage"

    solidity_file_path = os.path.join(".", SOLIDITY_FILE)

    # Check if the Solidity file exists
    if not os.path.isfile(solidity_file_path):
        print(f"Error: Solidity file '{SOLIDITY_FILE}' not found.")
        return

    with open(solidity_file_path, "r") as f:
        contract_source_code = f.read()

    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {SOLIDITY_FILE: {"content": contract_source_code}},
            "settings": {
                "outputSelection": {
                    "*": {"*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]}
                }
            },
        }
    )

    # bytecode means the compiled code that can be deployed to the blockchain
    bytecode = compiled_sol["contracts"][SOLIDITY_FILE][contract]["evm"]["bytecode"][
        "object"
    ]

    # abi means the interface of the contract
    abi = compiled_sol["contracts"][SOLIDITY_FILE][contract]["abi"]

    # Save ABI to files for argument of excuting the contract
    with open(ABI_FILE, "w") as abi_file:
        json.dump(abi, abi_file)

    print(f"ABI saved to {ABI_FILE}")

    return bytecode, abi


def deploy_contract(bytecode, abi):
    SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = w3.eth.get_transaction_count(my_address)
    transaction = SimpleStorage.constructor().build_transaction(
        {"chainId": chain_id, "from": my_address, "nonce": nonce}
    )
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    print("Making New Contract!")
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    contract_address = tx_receipt["contractAddress"]
    print(f"Contract deployed to {contract_address}")

    with open(CONTRACT_ADDRESS, "w") as f:
        json.dump({"contractAddress": contract_address}, f)
    print(f"Contract address saved to {CONTRACT_ADDRESS}")


bytecode, abi = compile_solidity()
deploy_contract(bytecode, abi)
