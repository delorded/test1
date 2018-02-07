def trim(s):
    s1 = s
    if s1 == '':
       return s1
    i = 0
    while s1[i] == ' ' and i < (len(s1)-1):
       i = i+1
    s1 = s1[i:]
    i = -1
    while s1[i] == ' ' and -i < (len(s1)):
       i = i-1
    s1 = s1[:len(s1)+i+1]
    return s1


print(trim('       '))

