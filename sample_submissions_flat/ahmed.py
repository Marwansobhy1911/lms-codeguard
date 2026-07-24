def get_fibonacci(n):
    if n <= 1:
        return n
    return get_fibonacci(n-1) + get_fibonacci(n-2)

print(get_fibonacci(10))
