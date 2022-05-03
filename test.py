dict1 = {
    'xd': 2,
}

dict2 = {
    **dict1,
}

dict1['xd2'] = 3

print(dict1)
print(dict2)
