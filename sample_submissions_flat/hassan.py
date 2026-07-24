def check_prime(val):
    if val < 2:
        return False
        
    for j in range(2, int(val**0.5) + 1):
        if val % j == 0:
            return False
            
    return True

print(check_prime(17))
