document.addEventListener('DOMContentLoaded', function() {
    // Элементы UI
    const seriesTypeRadios = document.querySelectorAll('input[name="seriesType"]');
    const seriesChoiceRadios = document.querySelectorAll('input[name="seriesChoice"]');
    const calculateBtn = document.getElementById('calculateBtn');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Элементы ввода
    const xValuesInput = document.getElementById('xValues');
    const xProbabilitiesInput = document.getElementById('xProbabilities');
    const yValuesInput = document.getElementById('yValues');
    const yProbabilitiesInput = document.getElementById('yProbabilities');
    const operationSelect = document.getElementById('operation');
    const powerXInput = document.getElementById('powerX');
    const multiplierXInput = document.getElementById('multiplierX');
    const powerYInput = document.getElementById('powerY');
    const multiplierYInput = document.getElementById('multiplierY');

    // Элементы вывода
    const resultValues = document.getElementById('resultValues');
    const MxElement = document.getElementById('Mx');
    const DxElement = document.getElementById('Dx');
    const SigmaElement = document.getElementById('Sigma');
    const distributionTable = document.getElementById('distributionTable');
    const initialMoments = document.getElementById('initialMoments');
    const centralMoments = document.getElementById('centralMoments');
    const asymmetryElement = document.getElementById('asymmetry');
    const excessElement = document.getElementById('excess');

    // Обновление интерфейса при изменении типа рядов
    seriesTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateUI);
    });

    seriesChoiceRadios.forEach(radio => {
        radio.addEventListener('change', updateUI);
    });

    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Удаляем активный класс у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс текущей вкладке
            tab.classList.add('active');
            document.getElementById(tabId + 'Tab').classList.add('active');
        });
    });

    function updateUI() {
        const seriesType = document.querySelector('input[name="seriesType"]:checked').value;
        const seriesChoice = document.querySelector('input[name="seriesChoice"]:checked')?.value;
        
        const seriesX = document.getElementById('seriesX');
        const seriesY = document.getElementById('seriesY');
        const seriesChoiceGroup = document.getElementById('seriesChoiceGroup');
        
        if (seriesType === '1') {
            // Одинаковые ряды
            seriesChoiceGroup.style.display = 'block';
            
            if (seriesChoice === '1') {
                // Ряд X
                seriesX.style.display = 'block';
                seriesY.style.display = 'none';
            } else {
                // Ряд Y
                seriesX.style.display = 'none';
                seriesY.style.display = 'block';
            }
        } else {
            // Разные ряды
            seriesChoiceGroup.style.display = 'none';
            seriesX.style.display = 'block';
            seriesY.style.display = 'block';
        }
    }

    // Парсинг ввода
    function parseInput(input) {
        if (!input.trim()) return [];
        return input.trim().split(/\s+/).map(Number);
    }

    // Применение степени и множителя
    function applyTransform(values, power, multiplier) {
        const p = Number(power) || 1;
        const m = Number(multiplier) || 1;
        
        if (p === 1 && m === 1) return values;
        
        return values.map(v => {
            let result = v;
            if (p !== 1) result = Math.pow(result, p);
            if (m !== 1) result = result * m;
            return result;
        });
    }

    // Вычисление распределения
    function computeDistribution(x, Px, y, Py, op) {
        const result = new Map();
        
        for (let i = 0; i < x.length; i++) {
            for (let j = 0; j < y.length; j++) {
                let val;
                switch (op) {
                    case '+': val = x[i] + y[j]; break;
                    case '-': val = x[i] - y[j]; break;
                    case '*': val = x[i] * y[j]; break;
                }
                
                const prob = Px[i] * Py[j];
                result.set(val, (result.get(val) || 0) + prob);
            }
        }
        
        const sorted = Array.from(result.entries()).sort((a, b) => a[0] - b[0]);
        return {
            values: sorted.map(([val]) => val),
            probabilities: sorted.map(([, prob]) => Number(prob.toFixed(4)))
        };
    }

    // Вычисление статистик
    function calculateStatistics(values, probabilities) {
        // Математическое ожидание
        const Mx = values.reduce((sum, val, i) => sum + val * probabilities[i], 0);
        
        // Начальные моменты
        const a = [1, 2, 3, 4, 5].map(k => 
            values.reduce((sum, val, i) => sum + Math.pow(val, k) * probabilities[i], 0)
        );
        
        // Центральные моменты
        const mu = [1, 2, 3, 4, 5].map(k =>
            values.reduce((sum, val, i) => sum + Math.pow(val - Mx, k) * probabilities[i], 0)
        );
        
        // Дисперсия и среднеквадратичное отклонение
        const Dx = mu[1];
        const sigma = Math.sqrt(Dx);
        
        // Коэффициенты
        const A = sigma !== 0 ? mu[2] / Math.pow(sigma, 3) : 0;
        const E = sigma !== 0 ? (mu[3] / Math.pow(sigma, 4)) - 3 : 0;
        
        return {
            Mx: Number(Mx.toFixed(4)),
            Dx: Number(Dx.toFixed(4)),
            sigma: Number(sigma.toFixed(4)),
            a: a.map(v => Number(v.toFixed(4))),
            mu: mu.map(v => Number(v.toFixed(4))),
            A: Number(A.toFixed(4)),
            E: Number(E.toFixed(4))
        };
    }

    // Отображение результатов
    function displayResults(distribution, stats) {
        // Основные результаты
        resultValues.textContent = `Z = ${distribution.values.join(', ')}\nP(Z) = ${distribution.probabilities.join(', ')}`;
        MxElement.textContent = stats.Mx;
        DxElement.textContent = stats.Dx;
        SigmaElement.textContent = stats.sigma;
        
        // Таблица распределения
        distributionTable.innerHTML = '';
        distribution.values.forEach((val, i) => {
            const prob = distribution.probabilities[i];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${val}</td>
                <td>${prob}</td>
                <td>${(prob * 100).toFixed(2)}%</td>
            `;
            distributionTable.appendChild(row);
        });
        
        // Моменты
        initialMoments.innerHTML = '';
        centralMoments.innerHTML = '';
        
        stats.a.forEach((value, i) => {
            const item = document.createElement('div');
            item.className = 'moment-item';
            item.innerHTML = `
                <span class="moment-label">a${i + 1}</span>
                <span class="moment-value">${value}</span>
            `;
            initialMoments.appendChild(item);
        });
        
        stats.mu.forEach((value, i) => {
            const item = document.createElement('div');
            item.className = 'moment-item';
            item.innerHTML = `
                <span class="moment-label">μ${i + 1}</span>
                <span class="moment-value">${value}</span>
            `;
            centralMoments.appendChild(item);
        });
        
        // Коэффициенты
        asymmetryElement.textContent = stats.A;
        excessElement.textContent = stats.E;
    }

    // Обработчик расчета
    calculateBtn.addEventListener('click', function() {
        try {
            const seriesType = document.querySelector('input[name="seriesType"]:checked').value;
            const operation = operationSelect.value;
            
            let xValues, xProbs, yValues, yProbs;
            
            if (seriesType === '1') {
                // Одинаковые ряды
                const seriesChoice = document.querySelector('input[name="seriesChoice"]:checked').value;
                
                if (seriesChoice === '1') {
                    xValues = parseInput(xValuesInput.value);
                    xProbs = parseInput(xProbabilitiesInput.value);
                    yValues = xValues;
                    yProbs = xProbs;
                } else {
                    xValues = parseInput(yValuesInput.value);
                    xProbs = parseInput(yProbabilitiesInput.value);
                    yValues = xValues;
                    yProbs = xProbs;
                }
            } else {
                // Разные ряды
                xValues = parseInput(xValuesInput.value);
                xProbs = parseInput(xProbabilitiesInput.value);
                yValues = parseInput(yValuesInput.value);
                yProbs = parseInput(yProbabilitiesInput.value);
                
                // Если один из рядов не заполнен, используем другой
                if ((!xValues.length || !xProbs.length) && (yValues.length && yProbs.length)) {
                    xValues = yValues;
                    xProbs = yProbs;
                } else if ((!yValues.length || !yProbs.length) && (xValues.length && xProbs.length)) {
                    yValues = xValues;
                    yProbs = xProbs;
                }
            }
            
            // Проверка ввода
            if (!xValues.length || !xProbs.length || !yValues.length || !yProbs.length) {
                throw new Error('Заполните все необходимые поля');
            }
            
            if (xValues.length !== xProbs.length || yValues.length !== yProbs.length) {
                throw new Error('Количество значений и вероятностей должно совпадать');
            }
            
            const sumX = xProbs.reduce((a, b) => a + b, 0);
            const sumY = yProbs.reduce((a, b) => a + b, 0);
            
            if (Math.abs(sumX - 1) > 0.0001) {
                throw new Error('Сумма вероятностей ряда X должна равняться 1');
            }
            
            if (Math.abs(sumY - 1) > 0.0001) {
                throw new Error('Сумма вероятностей ряда Y должна равняться 1');
            }
            
            // Применение трансформаций
            xValues = applyTransform(xValues, powerXInput.value, multiplierXInput.value);
            yValues = applyTransform(yValues, powerYInput.value, multiplierYInput.value);
            
            // Вычисление распределения
            const distribution = computeDistribution(xValues, xProbs, yValues, yProbs, operation);
            
            // Вычисление статистик
            const stats = calculateStatistics(distribution.values, distribution.probabilities);
            
            // Отображение результатов
            displayResults(distribution, stats);
            
            // Переключение на вкладку результатов
            document.querySelector('[data-tab="results"]').click();
            
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    });

    // Инициализация UI
    updateUI();
    
    // Заполнение начальными данными для демонстрации
    const demoDistribution = computeDistribution(
        [1, 2, 3, 4],
        [0.1, 0.2, 0.3, 0.4],
        [5, 6, 7, 8],
        [0.4, 0.3, 0.2, 0.1],
        '+'
    );
    const demoStats = calculateStatistics(demoDistribution.values, demoDistribution.probabilities);
    displayResults(demoDistribution, demoStats);
});
