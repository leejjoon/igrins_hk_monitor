import sys
import os
import time
from firebase import firebase
import datetime
import pytz

telescope_list = ["HJST", "DCT", "GeminiSouth"]

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

FieldNames = [('date', str), ('time', str),
              ('pressure', float),
              ('bench', float), ('bench_tc', float),
              ('grating', float), ('grating_tc', float),
              ('detH', float), ('detH_tc', float),
              ('detK', float), ('detK_tc', float),
              ('detS', float), ('detS_tc', float),
              ('coldhead01', float), ('coldhead02', float),
              ('chacoalbox', float)]


def get_most_recent_hk_entry(fb):
    """
    """
    r = fb.get("BasicHK", None,
               params=dict(orderBy='"utc_upload"', limitToLast=1))

    if r:
        return r.values()[0]
    else:
        return None


def get_firebase_token():
    filename = "firebase_token.txt"
    print "loading firebase token from %s." % filename
    return open(filename).read().strip()


def read_item_to_upload():
    HK_list = open(HKLogPath).read().split()
    HK_dict = dict((k, t(v)) for (k, t), v in zip(FieldNames, HK_list))

    HK_dict["datetime"] = HK_dict["date"] + "T" + HK_dict["time"] + "+00:00"

    return HK_dict


def start_upload_to_firebase(telescope_name):

    firebase_url = "https://igrins-hk.firebaseio.com/"

    token = get_firebase_token()

    auth = FirebaseAuthentication(token)
    fb = firebase.FirebaseApplication(firebase_url, auth)

    last_entry = get_most_recent_hk_entry(fb)

    while True:
        #result = firebase.get('/BasicHK', None)
        HK_dict = read_item_to_upload()

        if last_entry and \
           (HK_dict["date"] == last_entry["date"]) and \
           (HK_dict["time"] == last_entry["time"]):

            yield None

        else:

            HK_dict["utc_upload"] = datetime.datetime.now(pytz.utc).isoformat()
            HK_dict["tel_name"] = telescope_name
            #firebase.put('/BasicHK', "upload", HK_dict)
            fb.post('/BasicHK', HK_dict)

            last_entry = HK_dict

            yield HK_dict


def main(telescope_name):
    print '================================================'
    print 'IGRINS House Keeping Status Updater for Firebase'
    print '                                Ctrl + C to exit'
    print '================================================'

    fb = start_upload_to_firebase(telescope_name)

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

    if len(sys.argv) == 2 and sys.argv[1] in telescope_list:
        main(sys.argv[1])
    else:
        telescope_names = ", ".join(telescope_list)
        print "The first argument must be a name of telescope [%s]" % \
            (telescope_names,)
