def fact(x):
    # This is calculating the factorial
    if x == 0:
        return 1
    else:
        return x * fact(x-1)

def show_output():
    res = fact(5)
    print(res)
