def calc_fib(x):
    # This is calculating fibonacci sequence
    if x <= 1:
        return x
    else:
        return calc_fib(x-1) + calc_fib(x-2)

output = calc_fib(10)
print(output)
