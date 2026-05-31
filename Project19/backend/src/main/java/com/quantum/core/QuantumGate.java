package com.quantum.core;

public class QuantumGate {

    public static Matrix pauliX() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ZERO, ComplexNumber.ONE},
            {ComplexNumber.ONE, ComplexNumber.ZERO}
        });
    }

    public static Matrix pauliY() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ZERO, new ComplexNumber(0, -1)},
            {ComplexNumber.I, ComplexNumber.ZERO}
        });
    }

    public static Matrix pauliZ() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ONE, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, new ComplexNumber(-1, 0)}
        });
    }

    public static Matrix hadamard() {
        double factor = 1.0 / Math.sqrt(2);
        return new Matrix(new ComplexNumber[][] {
            {new ComplexNumber(factor, 0), new ComplexNumber(factor, 0)},
            {new ComplexNumber(factor, 0), new ComplexNumber(-factor, 0)}
        });
    }

    public static Matrix phase() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ONE, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.I}
        });
    }

    public static Matrix pi8() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ONE, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, new ComplexNumber(1.0/Math.sqrt(2), 1.0/Math.sqrt(2))}
        });
    }

    public static Matrix cnot() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO}
        });
    }

    public static Matrix cz() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, new ComplexNumber(-1, 0)}
        });
    }

    public static Matrix swap() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE}
        });
    }

    public static Matrix toffoli() {
        return new Matrix(new ComplexNumber[][] {
            {ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO, ComplexNumber.ZERO},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE},
            {ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ZERO, ComplexNumber.ONE, ComplexNumber.ZERO}
        });
    }

    public static Matrix identity() {
        return Matrix.identity(2);
    }

    public static Matrix rotationX(double theta) {
        double half = theta / 2;
        return new Matrix(new ComplexNumber[][] {
            {new ComplexNumber(Math.cos(half), 0), new ComplexNumber(0, -Math.sin(half))},
            {new ComplexNumber(0, -Math.sin(half)), new ComplexNumber(Math.cos(half), 0)}
        });
    }

    public static Matrix rotationY(double theta) {
        double half = theta / 2;
        return new Matrix(new ComplexNumber[][] {
            {new ComplexNumber(Math.cos(half), 0), new ComplexNumber(-Math.sin(half), 0)},
            {new ComplexNumber(Math.sin(half), 0), new ComplexNumber(Math.cos(half), 0)}
        });
    }

    public static Matrix rotationZ(double theta) {
        double half = theta / 2;
        return new Matrix(new ComplexNumber[][] {
            {new ComplexNumber(Math.cos(half), -Math.sin(half)), ComplexNumber.ZERO},
            {ComplexNumber.ZERO, new ComplexNumber(Math.cos(half), Math.sin(half))}
        });
    }

    public static Matrix getGate(String gateName) {
        return switch (gateName.toUpperCase()) {
            case "X", "PAULIX", "NOT" -> pauliX();
            case "Y", "PAULIY" -> pauliY();
            case "Z", "PAULIZ" -> pauliZ();
            case "H", "HADAMARD" -> hadamard();
            case "S", "PHASE" -> phase();
            case "T", "PI8" -> pi8();
            case "CNOT", "CX" -> cnot();
            case "CZ" -> cz();
            case "SWAP" -> swap();
            case "TOFFOLI", "CCX" -> toffoli();
            case "I", "IDENTITY" -> identity();
            default -> throw new IllegalArgumentException("Unknown gate: " + gateName);
        };
    }

    public static String getGateSymbol(String gateName) {
        return switch (gateName.toUpperCase()) {
            case "X", "PAULIX", "NOT" -> "X";
            case "Y", "PAULIY" -> "Y";
            case "Z", "PAULIZ" -> "Z";
            case "H", "HADAMARD" -> "H";
            case "S", "PHASE" -> "S";
            case "T", "PI8" -> "T";
            case "CNOT", "CX" -> "CX";
            case "CZ" -> "CZ";
            case "SWAP" -> "SWAP";
            case "TOFFOLI", "CCX" -> "CCX";
            case "I", "IDENTITY" -> "I";
            default -> gateName;
        };
    }

    public static String getGateDescription(String gateName) {
        return switch (gateName.toUpperCase()) {
            case "X", "PAULIX", "NOT" -> "Pauli-X门（比特翻转门）：将|0⟩翻转为|1⟩，|1⟩翻转为|0⟩";
            case "Y", "PAULIY" -> "Pauli-Y门：同时翻转比特和相位";
            case "Z", "PAULIZ" -> "Pauli-Z门（相位翻转门）：翻转|1⟩态的相位";
            case "H", "HADAMARD" -> "Hadamard门：创建叠加态，将|0⟩变为(|0⟩+|1⟩)/√2";
            case "S", "PHASE" -> "S门（相位门）：对|1⟩态施加π/2相位";
            case "T", "PI8" -> "T门（π/8门）：对|1⟩态施加π/4相位";
            case "CNOT", "CX" -> "CNOT门（受控NOT门）：当控制位为|1⟩时翻转目标位";
            case "CZ" -> "CZ门（受控Z门）：当两个量子位都为|1⟩时施加相位翻转";
            case "SWAP" -> "SWAP门：交换两个量子位的状态";
            case "TOFFOLI", "CCX" -> "Toffoli门（受控CNOT门）：三量子比特门";
            case "I", "IDENTITY" -> "Identity门：不改变量子态";
            default -> gateName + "门";
        };
    }
}
