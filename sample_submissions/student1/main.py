def calculate_factorial(n):
    if n == 0:
        return 1
    return n * calculate_factorial(n-1)

def print_result():
    print(calculate_factorial(5))
