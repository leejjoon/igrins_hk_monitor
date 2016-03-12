import sys
import datetime
from firebase_token_generator import create_token

if __name__ == "__main__":
    firebase_secret = sys.argv[1]
    auth_payload = {"uid": "igrins", "telescope": "hjst"}
    options = {"expires": datetime.datetime(2100, 1, 1)}
    token = create_token(firebase_secret, auth_payload)
    print token
