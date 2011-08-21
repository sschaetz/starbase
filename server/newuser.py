
# script to create a new user

import sys
from starbase import utils

def main():
    if len(sys.argv) != 3:
        print "usage: python newuser.py <username> <accesstoken>"
        return 2
    username = sys.argv[1]
    accesstoken = sys.argv[2]
    return utils.create_user(username, accesstoken, 1)
    
        
if __name__ == "__main__":
    sys.exit(main())
    
