from eth_account import Account

ROLES = ["deployer", "patient", "doctor", "nurse", "pharmacy", "research_center"]

for role in ROLES:
    account = Account.create()
    print(f"{role.upper()}_ADDRESS={account.address}")
    print(f"{role.upper()}_PRIVATE_KEY={account.key.hex()}")
    print()
