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
    const palavrasReservadas = new Set([
        'e', 'pi', 'sin', 'seno', 'cos', 'cosseno', 'tan', 'tangente',
        'sqrt', 'raiz', 'exp', 'log', 'log10', 'abs', 'floor', 'ceil', 'round'
    ]);

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
    expr = expr.replace(/\^/g, '**');

    const variavel = detectarVariavel(expr);

    try {
        const func = new Function(variavel, ...Object.keys(mathNamespace), `return ${expr}`);
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

        if (Math.abs(fc) < tol || Math.abs(bAtual - aAtual) < tol) {
            return { raiz: c, iteracoes: iteracao + 1, fc: fc };
        }

        if (fc * avalieFuncao(funcao, aAtual) < 0) {
            bAtual = c;
        } else {
            aAtual = c;
        }
    }

    throw new Error(`Número máximo de iterações (${maxIteracoes}) atingido`);
}

document.getElementById('biseccaoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    document.getElementById('resultado').classList.add('hidden');
    document.getElementById('erro').classList.add('hidden');

    try {
        const exprTexto = document.getElementById('funcao').value.trim();
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const tol = parseFloat(document.getElementById('tolerancia').value);
        const maxIteracoes = parseInt(document.getElementById('maxIteracoes').value);

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

        const funcao = criarFuncao(exprTexto);
        const resultado = bisseccao(funcao, a, b, tol, maxIteracoes);

        document.getElementById('raizValue').textContent = resultado.raiz.toFixed(10);
        document.getElementById('iteracoesValue').textContent = resultado.iteracoes;
        document.getElementById('fValue').textContent = resultado.fc.toExponential(6);
        document.getElementById('resultado').classList.remove('hidden');
    } catch (erro) {
        document.getElementById('erroMessage').textContent = erro.message;
        document.getElementById('erro').classList.remove('hidden');
    }
});

document.getElementById('funcao').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('biseccaoForm').dispatchEvent(new Event('submit'));
    }
});

function lagrangeInterpolacao(xPoints, yPoints, x) {
    if (xPoints.length !== yPoints.length) {
        throw new Error("Os arrays de x e y devem ter o mesmo tamanho");
    }
    
    if (xPoints.length < 2) {
        throw new Error("É necessário pelo menos 2 pontos para interpolação");
    }
    
    let resultado = 0;
    const n = xPoints.length;
    
    for (let i = 0; i < n; i++) {
        let Li = yPoints[i];
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                Li *= (x - xPoints[j]) / (xPoints[i] - xPoints[j]);
            }
        }
        
        resultado += Li;
    }
    
    return resultado;
}

function lagrangeCoeficientes(xPoints, yPoints) {
    if (xPoints.length !== yPoints.length) {
        throw new Error("Os arrays de x e y devem ter o mesmo tamanho");
    }
    
    if (xPoints.length < 2) {
        throw new Error("É necessário pelo menos 2 pontos para interpolação");
    }
    
    const n = xPoints.length;
    let poly = [0];
    
    for (let i = 0; i < n; i++) {
        let li = [1];
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const novoLi = new Array(li.length + 1).fill(0);
                const divisor = xPoints[i] - xPoints[j];
                const xj = -xPoints[j];
                
                for (let k = 0; k < li.length; k++) {
                    novoLi[k] += li[k] * xj / divisor;
                    novoLi[k + 1] += li[k] / divisor;
                }
                
                li = novoLi;
            }
        }
        
        li = li.map(coef => coef * yPoints[i]);
        
        if (poly.length < li.length) {
            poly = poly.concat(new Array(li.length - poly.length).fill(0));
        }
        
        for (let k = 0; k < li.length; k++) {
            poly[k] += li[k];
        }
    }
    
    return poly;
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const tabName = this.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        const tituloElement = document.getElementById('titulo');
        const subtituloElement = document.getElementById('subtitulo');
        
        if (tabName === 'bisseccao') {
            tituloElement.textContent = 'Encontrar raízes (Bisseção)';
            subtituloElement.textContent = 'Método da Bisseção para encontrar raízes de funções';
        } else if (tabName === 'lagrange') {
            tituloElement.textContent = 'Encontrar o polinômio interpolador (Lagrange)';
            subtituloElement.textContent = 'Interpolação polinomial usando o método de Lagrange';
        }
    });
});

function adicionarPonto() {
    const container = document.getElementById('pontosContainer');
    const novoDiv = document.createElement('div');
    novoDiv.className = 'ponto-input';
    novoDiv.innerHTML = `
        <input type="number" class="ponto-x" placeholder="x" step="any" required>
        <input type="number" class="ponto-y" placeholder="y" step="any" required>
        <button type="button" class="btn-remove" onclick="removerPonto(this)">✕</button>
    `;
    container.appendChild(novoDiv);
}

function removerPonto(btn) {
    const container = document.getElementById('pontosContainer');
    if (container.children.length > 1) {
        btn.parentElement.remove();
    } else {
        alert('É necessário manter pelo menos um ponto');
    }
}

function executarLagrange() {
    document.getElementById('resultadoLagrange').classList.add('hidden');
    document.getElementById('erroLagrange').classList.add('hidden');
    
    try {
        const xPoints = [];
        const yPoints = [];
        const pontosSet = new Set();
        
        document.querySelectorAll('.ponto-input').forEach(div => {
            const x = parseFloat(div.querySelector('.ponto-x').value);
            const y = parseFloat(div.querySelector('.ponto-y').value);
            
            if (isNaN(x) || isNaN(y)) {
                throw new Error('Todos os pontos devem ter valores válidos para x e y');
            }
            
            const pontoStr = `${x},${y}`;
            if (pontosSet.has(pontoStr)) {
                throw new Error(`Ponto duplicado encontrado: (${x}, ${y})`);
            }
            pontosSet.add(pontoStr);
            
            xPoints.push(x);
            yPoints.push(y);
        });
        
        const xMap = new Map();
        for (let i = 0; i < xPoints.length; i++) {
            const x = xPoints[i];
            const y = yPoints[i];
            
            if (xMap.has(x)) {
                const yExistente = xMap.get(x);
                if (Math.abs(yExistente - y) > 1e-10) {
                    throw new Error(`Valor de X duplicado com Y diferente: x=${x} possui y=${yExistente} e y=${y}`);
                }
            } else {
                xMap.set(x, y);
            }
        }
        
        if (xPoints.length < 2) {
            throw new Error('É necessário pelo menos 2 pontos para gerar o polinômio interpolador');
        }
        
        const coeficientes = lagrangeCoeficientes(xPoints, yPoints);
        
        const termos = coeficientes
            .map((c, i) => {
                if (Math.abs(c) < 1e-10) return '';
                
                let valor;
                if (Math.abs(c) < 1e-6) {
                    valor = c.toExponential(3);
                } else {
                    valor = Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : c.toFixed(6);
                }
                
                const sinal = c > 0 && i > 0 ? ' + ' : (c < 0 && i > 0 ? ' - ' : '');
                const absValor = sinal && c < 0 ? Math.abs(valor) : valor;
                
                if (i === 0) return `${absValor}`;
                if (i === 1) return `${sinal}${absValor}x`;
                return `${sinal}${absValor}x<sup>${i}</sup>`;
            })
            .filter(s => s !== '')
            .join('');
        
        document.getElementById('polinomioValue').innerHTML = termos || '0';
        document.getElementById('resultadoLagrange').classList.remove('hidden');
    } catch (erro) {
        document.getElementById('erroLagrangeMessage').textContent = erro.message;
        document.getElementById('erroLagrange').classList.remove('hidden');
    }
}
