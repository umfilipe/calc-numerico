const mathNamespace = {
    e: Math.E,
    pi: Math.PI,
    sin: Math.sin,
    seno: Math.sin,
    cos: Math.cos,
    cosseno: Math.cos,
    tan: Math.tan,
    tangente: Math.tan,
    sqrt: Math.sqrt,
    raiz: Math.sqrt,
    exp: Math.exp,
    log: Math.log,
    log10: Math.log10,
    abs: Math.abs,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
};

function detectarVariavel(expr) {
    // Palavras reservadas (funções e constantes)
    const palavrasReservadas = new Set([
        'e', 'pi', 'sin', 'seno', 'cos', 'cosseno', 'tan', 'tangente',
        'sqrt', 'raiz', 'exp', 'log', 'log10', 'abs', 'floor', 'ceil', 'round'
    ]);

    // Remove operadores e números para encontrar variáveis
    const tokens = expr.match(/[a-zA-Z_]\w*/g) || [];
    const variaveisEncontradas = new Set();

    for (const token of tokens) {
        if (!palavrasReservadas.has(token.toLowerCase())) {
            variaveisEncontradas.add(token);
        }
    }

    if (variaveisEncontradas.size === 0) {
        throw new Error("A expressão deve conter uma variável");
    }

    if (variaveisEncontradas.size > 1) {
        throw new Error(`A expressão deve conter apenas uma variável. Encontradas: ${Array.from(variaveisEncontradas).join(', ')}`);
    }

    return Array.from(variaveisEncontradas)[0];
}

function criarFuncao(expr) {
    // Substitui ^ por **
    expr = expr.replace(/\^/g, '**');

    // Detecta a variável
    const variavel = detectarVariavel(expr);

    // Tenta avaliar a função com um valor de teste
    try {
        const func = new Function(variavel, ...Object.keys(mathNamespace), `return ${expr}`);
        // Testa com um valor arbitrário
        func(1.0, ...Object.values(mathNamespace));
        return { func, variavel };
    } catch (e) {
        throw new Error(`Expressão inválida: ${e.message}`);
    }
}

function avalieFuncao(funcao, valor) {
    try {
        return funcao.func(valor, ...Object.values(mathNamespace));
    } catch (e) {
        throw new Error(`Erro ao avaliar a função em ${funcao.variavel}=${valor}: ${e.message}`);
    }
}

function bisseccao(funcao, a, b, tol, maxIteracoes) {
    const fa = avalieFuncao(funcao, a);
    const fb = avalieFuncao(funcao, b);

    // Verifica se os sinais são opostos
    if (fa * fb >= 0) {
        throw new Error(
            `f(${funcao.variavel}) deve ter sinais opostos nos extremos.\nf(${a}) = ${fa.toFixed(6)}, f(${b}) = ${fb.toFixed(6)}`
        );
    }

    let iteracao = 0;
    let aAtual = a;
    let bAtual = b;

    for (iteracao = 0; iteracao < maxIteracoes; iteracao++) {
        const c = (aAtual + bAtual) / 2;
        const fc = avalieFuncao(funcao, c);

        // Se encontrou a raiz ou alcançou a tolerância
        if (Math.abs(fc) < tol || Math.abs(bAtual - aAtual) < tol) {
            return { raiz: c, iteracoes: iteracao + 1, fc: fc };
        }

        // Atualiza o intervalo
        if (fc * avalieFuncao(funcao, aAtual) < 0) {
            bAtual = c;
        } else {
            aAtual = c;
        }
    }

    throw new Error(`Número máximo de iterações (${maxIteracoes}) atingido`);
}

// Manipulador do formulário
document.getElementById('biseccaoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Limpa mensagens anteriores
    document.getElementById('resultado').classList.add('hidden');
    document.getElementById('erro').classList.add('hidden');

    try {
        // Obtém valores do formulário
        const exprTexto = document.getElementById('funcao').value.trim();
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const tol = parseFloat(document.getElementById('tolerancia').value);
        const maxIteracoes = parseInt(document.getElementById('maxIteracoes').value);

        // Validações
        if (!exprTexto) {
            throw new Error('A função não pode ser vazia');
        }
        if (isNaN(a) || isNaN(b)) {
            throw new Error('Os valores de a e b devem ser números');
        }
        if (isNaN(tol) || tol <= 0) {
            throw new Error('A tolerância deve ser um número positivo');
        }
        if (isNaN(maxIteracoes) || maxIteracoes <= 0) {
            throw new Error('O número máximo de iterações deve ser um número positivo');
        }

        // Cria e resolve
        const funcao = criarFuncao(exprTexto);
        const resultado = bisseccao(funcao, a, b, tol, maxIteracoes);

        // Exibe resultado
        document.getElementById('raizValue').textContent = resultado.raiz.toFixed(10);
        document.getElementById('iteracoesValue').textContent = resultado.iteracoes;
        document.getElementById('fValue').textContent = resultado.fc.toExponential(6);
        document.getElementById('resultado').classList.remove('hidden');
    } catch (erro) {
        // Exibe erro
        document.getElementById('erroMessage').textContent = erro.message;
        document.getElementById('erro').classList.remove('hidden');
    }
});

// Permite enviar o formulário com Enter
document.getElementById('funcao').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('biseccaoForm').dispatchEvent(new Event('submit'));
    }
});
