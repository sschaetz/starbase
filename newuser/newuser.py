
# script to create a new user

import ConfigParser
import sys
import shutil
import sqlite3
import os


def user_exists(folder, username):
    try:
        f = open(folder + username + '.sql', 'r')
        f.close
    except: 
        return 0
    return 1


class Usage(Exception):
    def __init__(self, msg):
        self.msg = msg


def main():
    if len(sys.argv) != 3:
        print "usage: python newuser.py <username> <accesstoken>"
        return 2
    username = sys.argv[1]
    accesstoken = sys.argv[2]
    print "trying to create user", username
    
    # read configuration
    config = ConfigParser.RawConfigParser()
    config.read('../config.cfg')
    
    user_data_folder = config.get('general', 'user_data_folder')
    user_database = user_data_folder + username + '.sql'
    user_url = config.get('general', 'domain') + username

    # check if user already exists
    if user_exists(user_data_folder, username):
        print "error: user already exists"
        return 2
    
    # here be dragons
    try:
        # copy over initial database
        shutil.copy2('default.sql', user_database)

        # initialize database
        db = sqlite3.connect(user_database)
        db.execute('insert into admin (authkey, name, url) values (?, ?, ?) ', 
                   (accesstoken, username, user_url))
        db.commit()
        db.close()
        
    except Exception, e:
        # delete the file if it was created
        if user_exists(user_data_folder, username):
            os.remove(user_database)
            
        print e
        return 2
    else:
        print "success"
        
if __name__ == "__main__":
    sys.exit(main())
    