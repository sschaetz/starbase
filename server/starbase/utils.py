
def file_exists(filename):
    try:
        f = open(filename, 'r')
        f.close
    except: 
        return 0
    return 1
