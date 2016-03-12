import sys
import os
import time
from firebase import firebase
import datetime
import pytz


class TokenUser(object):
    def __init__(self, token):
        self.firebase_auth_token = token


class FirebaseTokenBase(object):
    HEADERS = {'typ': 'JWT', 'alg': 'HS256'}


class FirebaseAuthentication(object):
    def __init__(self, token):
        self.token_user = TokenUser(token)
        self.authenticator = FirebaseTokenBase()

    def get_user(self):
        return self.token_user


HKLogPath = "/IGRINS/Log/Web/tempweb.dat"
# FieldNames = ['da','ti','va','t1','h1','t2','h2','t3','h3','t4','h4','t5','h5','t6','t7','t8']

FieldNames = ['date', 'time',
              'pressure',
              'bench', 'bench_tc',
              'grating', 'grating_tc',
              'detH', 'detH_tc',
              'detK', 'detK_tc',
              'detS', 'detS_tc',
              'coldhead01', 'coldhead02', 'chacoalbox']


def get_most_recent_hk_entry(fb):
    """
    """
    r = fb.get("BasicHK", None,
               params=dict(orderBy='"utc_now"', limitToLast=1))

    return r.values()[0]


def get_firebase_token():
    filename = "firebase_token.txt"
    print "loading firebase token from %s." % filename
    return open(filename).read().strip()


def start_upload_to_firebase():

    firebase_url = "https://igrins-hk.firebaseio.com/"

    token = get_firebase_token()

    auth = FirebaseAuthentication(token)
    fb = firebase.FirebaseApplication(firebase_url, auth)

    last_entry = get_most_recent_hk_entry(fb)

    while True:
        #result = firebase.get('/BasicHK', None)
        HK_list = open(HKLogPath).read().split()
        HK_dict = dict(zip(FieldNames, HK_list))

        if (HK_dict["date"] == last_entry["date"]) and \
           (HK_dict["time"] == last_entry["time"]):

            yield None

        else:

            HK_dict["utc_now"] = datetime.datetime.now(pytz.utc).isoformat()

            #firebase.put('/BasicHK', "upload", HK_dict)
            fb.post('/BasicHK', HK_dict)

            last_entry = HK_dict

            yield HK_dict


def main():
    print '================================================'
    print 'IGRINS House Keeping Status Updater for Firebase'
    print '                                Ctrl + C to exit'
    print '================================================'

    fb = start_upload_to_firebase()

    try:
        while True:
            r = fb.next()
            if r is None:
                print "Skipping, same as the last entry."
            else:
                print "Uploaded", r["date"], r["time"]

            time.sleep(60)

    except KeyboardInterrupt:
        print "Quit."
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)


if __name__ == "__main__":
    import sys

    main()
