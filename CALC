from flask import Flask, render_template, jsonify, request
import math
from collections import defaultdict
import json

app = Flask(__name__)

class SeriesCalculator:
    @staticmethod
    def parse_input(data):
        try:
            return list(map(float, data.split()))
        except ValueError:
            raise ValueError("Неверный формат ввода. Введите числа, разделенные пробелами.")

    @staticmethod
    def apply_transform(values, power, multiplier):
        try:
            power = int(power)
            multiplier = float(multiplier)
        except ValueError:
            raise ValueError("Неверный формат для степени или множителя.")
        
        result = values.copy()
        if power != 1:
            result = [v ** power for v in result]
        if multiplier != 1:
            result = [v * multiplier for v in result]
        return result

    @staticmethod
    def compute_distribution(x, Px, y, Py, operation):
        result = defaultdict(float)
        for v1, p1 in zip(x, Px):
            for v2, p2 in zip(y, Py):
                if operation == '+':
                    res_val = v1 + v2
                elif operation == '-':
                    res_val = v1 - v2
                elif operation == '*':
                    res_val = v1 * v2
                result[res_val] += p1 * p2
        
        sorted_result = sorted(result.items())
        return {
            'values': [val for val, prob in sorted_result],
            'probabilities': [round(prob, 4) for val, prob in sorted_result]
        }

    @staticmethod
    def calculate_statistics(values, probabilities):
        # Математическое ожидание
        Mx = sum(v * p for v, p in zip(values, probabilities))
        
        # Начальные моменты
        a = []
        for k in range(1, 6):
            a_k = sum(v ** k * p for v, p in zip(values, probabilities))
            a.append(round(a_k, 4))
        
        # Центральные моменты
        mu = []
        for k in range(1, 6):
            mu_k = sum((v - Mx) ** k * p for v, p in zip(values, probabilities))
            mu.append(round(mu_k, 4))
        
        # Дисперсия и среднеквадратичное отклонение
        Dx = mu[1] if len(mu) > 1 else 0
        sigma = round(math.sqrt(Dx), 4) if Dx > 0 else 0
        
        # Коэффициенты
        A = round(mu[2] / (sigma ** 3), 4) if sigma != 0 else 0
        E = round((mu[3] / (sigma ** 4)) - 3, 4) if sigma != 0 else 0
        
        return {
            'Mx': round(Mx, 4),
            'Dx': round(Dx, 4),
            'sigma': sigma,
            'a': a,
            'mu': mu,
            'A': A,
            'E': E
        }

calculator = SeriesCalculator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        
        # Парсинг данных
        x_values = calculator.parse_input(data['x_values'])
        x_probs = calculator.parse_input(data['x_probs'])
        y_values = calculator.parse_input(data['y_values'])
        y_probs = calculator.parse_input(data['y_probs'])
        
        # Проверка данных
        if len(x_values) != len(x_probs) or len(y_values) != len(y_probs):
            return jsonify({'error': 'Количество значений и вероятностей должно совпадать'}), 400
        
        if abs(sum(x_probs) - 1.0) > 0.0001 or abs(sum(y_probs) - 1.0) > 0.0001:
            return jsonify({'error': 'Сумма вероятностей должна равняться 1'}), 400
        
        # Применение трансформаций
        x_values = calculator.apply_transform(x_values, data['power_x'], data['multiplier_x'])
        y_values = calculator.apply_transform(y_values, data['power_y'], data['multiplier_y'])
        
        # Вычисление распределения
        distribution = calculator.compute_distribution(
            x_values, x_probs, 
            y_values, y_probs, 
            data['operation']
        )
        
        # Вычисление статистик
        stats = calculator.calculate_statistics(
            distribution['values'], 
            distribution['probabilities']
        )
        
        return jsonify({
            'success': True,
            'distribution': distribution,
            'statistics': stats
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
