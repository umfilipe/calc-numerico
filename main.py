import math

def criar_funcao(expr):
    expr = expr.replace('^', '**')

    if 'x' not in expr.lower():
        raise ValueError("A expressão deve conter a variável 'x' ou 'X'")

    namespace = {
        'e': math.e,
        'pi': math.pi,
        'sin': math.sin,
        'seno': math.sin,
        'cos': math.cos,
        'tan': math.tan,
        'sqrt': math.sqrt,
        'raiz': math.sqrt,
        'exp': math.exp,
        'log': math.log,
        'log10': math.log10,
        '__builtins__': {}
    }

    def f(x):
        return eval(expr, namespace, {'x': x})

    try:
        f(1.0)
    except Exception as e:
        raise ValueError(f"Expressão inválida: {e}")

    return f

def bisseccao(f, a, b, tol, max_iteracoes):
    if f(a) * f(b) >= 0:
        raise ValueError("f(a) e f(b) devem ter sinais opostos")
    for i in range(max_iteracoes):
        c = (a + b) / 2
        if abs(f(c)) < tol:
            return c
        if f(c) * f(a) < 0:
            b = c
        else:
            a = c
    raise ValueError("Número máximo de iterações atingido")

def main():
    print("Digite a função F em termos de x")
    print("Exemplos: x**2 - 4, e^x, sin(x), sqrt(x)")
    expr = input("f(x) = ")

    funcao = criar_funcao(expr)

    a = float(input("a: "))
    b = float(input("b: "))
    tol = float(input("Tolerância: "))
    max_iteracoes = int(input("Máximo de iterações: "))

    raiz = bisseccao(funcao, a, b, tol, max_iteracoes)
    print(f"Raiz aproximada: {raiz}")

main()
