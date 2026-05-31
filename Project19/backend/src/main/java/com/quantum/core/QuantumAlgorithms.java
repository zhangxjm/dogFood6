package com.quantum.core;

import java.util.*;

public class QuantumAlgorithms {

    public static QuantumCircuit bellState() {
        QuantumCircuit circuit = new QuantumCircuit(2);
        circuit.addGate("H", 0);
        circuit.addGate("CNOT", 0, 1);
        return circuit;
    }

    public static QuantumCircuit ghzState(int numQubits) {
        QuantumCircuit circuit = new QuantumCircuit(numQubits);
        circuit.addGate("H", 0);
        for (int i = 1; i < numQubits; i++) {
            circuit.addGate("CNOT", i - 1, i);
        }
        return circuit;
    }

    public static QuantumCircuit deutschAlgorithm() {
        QuantumCircuit circuit = new QuantumCircuit(2);
        circuit.addGate("X", 1);
        circuit.addGate("H", 0);
        circuit.addGate("H", 1);
        circuit.addGate("H", 0);
        return circuit;
    }

    public static QuantumCircuit groverAlgorithm(int numQubits, int targetState) {
        QuantumCircuit circuit = new QuantumCircuit(numQubits);

        for (int i = 0; i < numQubits; i++) {
            circuit.addGate("H", i);
        }

        int iterations = (int) Math.floor(Math.PI / 4 * Math.sqrt((1 << numQubits)));

        for (int iter = 0; iter < iterations; iter++) {
            groverOracle(circuit, numQubits, targetState);
            groverDiffusion(circuit, numQubits);
        }

        return circuit;
    }

    private static void groverOracle(QuantumCircuit circuit, int numQubits, int targetState) {
        String binary = String.format("%" + numQubits + "s",
            Integer.toBinaryString(targetState)).replace(' ', '0');

        for (int i = 0; i < numQubits; i++) {
            if (binary.charAt(numQubits - 1 - i) == '0') {
                circuit.addGate("X", i);
            }
        }

        if (numQubits == 2) {
            circuit.addGate("H", 1);
            circuit.addGate("CNOT", 0, 1);
            circuit.addGate("H", 1);
        } else if (numQubits == 3) {
            circuit.addGate("H", 2);
            circuit.addGate("TOFFOLI", 0, 1, 2);
            circuit.addGate("H", 2);
        } else {
            circuit.addGate("Z", numQubits - 1);
        }

        for (int i = 0; i < numQubits; i++) {
            if (binary.charAt(numQubits - 1 - i) == '0') {
                circuit.addGate("X", i);
            }
        }
    }

    private static void groverDiffusion(QuantumCircuit circuit, int numQubits) {
        for (int i = 0; i < numQubits; i++) {
            circuit.addGate("H", i);
        }

        for (int i = 0; i < numQubits; i++) {
            circuit.addGate("X", i);
        }

        if (numQubits == 2) {
            circuit.addGate("H", 1);
            circuit.addGate("CNOT", 0, 1);
            circuit.addGate("H", 1);
        } else if (numQubits == 3) {
            circuit.addGate("H", 2);
            circuit.addGate("TOFFOLI", 0, 1, 2);
            circuit.addGate("H", 2);
        } else {
            circuit.addGate("Z", numQubits - 1);
        }

        for (int i = 0; i < numQubits; i++) {
            circuit.addGate("X", i);
        }

        for (int i = 0; i < numQubits; i++) {
            circuit.addGate("H", i);
        }
    }

    public static QuantumCircuit quantumFourierTransform(int numQubits) {
        QuantumCircuit circuit = new QuantumCircuit(numQubits);

        for (int i = numQubits - 1; i >= 0; i--) {
            circuit.addGate("H", i);
            for (int j = i - 1; j >= 0; j--) {
                double angle = Math.PI / Math.pow(2, i - j);
                circuit.addGateWithRotation("RZ", angle, j);
            }
        }

        for (int i = 0; i < numQubits / 2; i++) {
            circuit.addGate("SWAP", i, numQubits - 1 - i);
        }

        return circuit;
    }

    public static QuantumCircuit teleportationCircuit() {
        QuantumCircuit circuit = new QuantumCircuit(3);

        circuit.addGate("H", 1);
        circuit.addGate("CNOT", 1, 2);

        circuit.addGate("CNOT", 0, 1);
        circuit.addGate("H", 0);

        circuit.addGate("CNOT", 1, 2);
        circuit.addGate("CZ", 0, 2);

        return circuit;
    }

    public static QuantumCircuit superdenseCoding(String bits) {
        QuantumCircuit circuit = new QuantumCircuit(2);

        circuit.addGate("H", 0);
        circuit.addGate("CNOT", 0, 1);

        if (bits.length() >= 2) {
            if (bits.charAt(1) == '1') {
                circuit.addGate("X", 0);
            }
            if (bits.charAt(0) == '1') {
                circuit.addGate("Z", 0);
            }
        }

        circuit.addGate("CNOT", 0, 1);
        circuit.addGate("H", 0);

        return circuit;
    }

    public static Map<String, Object> getAlgorithmInfo(String algorithmName) {
        Map<String, Object> info = new LinkedHashMap<>();

        switch (algorithmName.toLowerCase()) {
            case "bell":
                info.put("name", "Bell态制备");
                info.put("description", "Bell态是两量子比特系统的纠缠态，是量子纠缠的基础示例。通过Hadamard门和CNOT门制备。");
                info.put("numQubits", 2);
                info.put("application", "量子通信、量子密码学");
                break;
            case "ghz":
                info.put("name", "GHZ态制备");
                info.put("description", "GHZ态是三量子比特的最大纠缠态，是Bell态的多体推广。");
                info.put("numQubits", 3);
                info.put("application", "量子计算、量子计量学");
                break;
            case "deutsch":
                info.put("name", "Deutsch算法");
                info.put("description", "Deutsch算法是第一个证明量子计算比经典计算更具优势的算法，用于判断函数是常数还是平衡函数。");
                info.put("numQubits", 2);
                info.put("application", "量子算法基础");
                break;
            case "grover":
                info.put("name", "Grover算法");
                info.put("description", "Grover算法是一种无序数据库搜索算法，相比经典算法提供二次加速。");
                info.put("numQubits", 3);
                info.put("application", "搜索问题、优化问题");
                break;
            case "qft":
                info.put("name", "量子傅里叶变换");
                info.put("description", "量子傅里叶变换是Shor算法等许多量子算法的核心组件，是经典傅里叶变换的量子版。");
                info.put("numQubits", 3);
                info.put("application", "Shor算法、相位估计");
                break;
            case "teleportation":
                info.put("name", "量子隐形传态");
                info.put("description", "量子隐形传态利用经典通信和预先共享的纠缠态，将一个量子态从一个位置传输到另一个位置。");
                info.put("numQubits", 3);
                info.put("application", "量子通信");
                break;
            case "superdense":
                info.put("name", "超密编码");
                info.put("description", "超密编码利用量子纠缠，通过发送一个量子比特传输两比特的经典信息。");
                info.put("numQubits", 2);
                info.put("application", "量子通信");
                break;
            default:
                info.put("name", algorithmName);
                info.put("description", "未知算法");
                info.put("numQubits", 2);
        }

        return info;
    }

    public static QuantumCircuit getAlgorithmCircuit(String algorithmName, int numQubits, int targetState) {
        return switch (algorithmName.toLowerCase()) {
            case "bell" -> bellState();
            case "ghz" -> ghzState(numQubits);
            case "deutsch" -> deutschAlgorithm();
            case "grover" -> groverAlgorithm(numQubits, targetState);
            case "qft" -> quantumFourierTransform(numQubits);
            case "teleportation" -> teleportationCircuit();
            case "superdense" -> superdenseCoding("11");
            default -> bellState();
        };
    }

    public static List<String> getAvailableAlgorithms() {
        return Arrays.asList("bell", "ghz", "deutsch", "grover", "qft", "teleportation", "superdense");
    }
}
