package com.quantum.core;

import java.util.*;

public class QuantumCircuit {
    private final int numQubits;
    private final List<CircuitStep> steps;

    public QuantumCircuit(int numQubits) {
        this.numQubits = numQubits;
        this.steps = new ArrayList<>();
    }

    public void addGate(String gateName, int... qubits) {
        steps.add(new CircuitStep(gateName, qubits));
    }

    public void addGateWithRotation(String gateName, double theta, int... qubits) {
        steps.add(new CircuitStep(gateName, theta, qubits));
    }

    public QuantumState execute() {
        QuantumState state = new QuantumState(numQubits);

        for (CircuitStep step : steps) {
            String gateName = step.getGateName();

            switch (gateName.toUpperCase()) {
                case "CNOT":
                case "CX":
                    state = state.applyControlledGate(QuantumGate.pauliX(), step.getQubits()[0], step.getQubits()[1]);
                    break;
                case "CZ":
                    state = state.applyControlledGate(QuantumGate.pauliZ(), step.getQubits()[0], step.getQubits()[1]);
                    break;
                case "TOFFOLI":
                case "CCX":
                    state = state.applyToffoli(step.getQubits()[0], step.getQubits()[1], step.getQubits()[2]);
                    break;
                case "RX":
                    state = state.applyGate(QuantumGate.rotationX(step.getTheta()), step.getQubits()[0]);
                    break;
                case "RY":
                    state = state.applyGate(QuantumGate.rotationY(step.getTheta()), step.getQubits()[0]);
                    break;
                case "RZ":
                    state = state.applyGate(QuantumGate.rotationZ(step.getTheta()), step.getQubits()[0]);
                    break;
                default:
                    Matrix gate = QuantumGate.getGate(gateName);
                    state = state.applyGate(gate, step.getQubits()[0]);
            }
        }

        return state;
    }

    public List<Map<String, Object>> executeWithSteps() {
        List<Map<String, Object>> executionSteps = new ArrayList<>();
        QuantumState state = new QuantumState(numQubits);

        Map<String, Object> initialState = new LinkedHashMap<>();
        initialState.put("step", 0);
        initialState.put("gate", "初始状态");
        initialState.put("stateVector", stateToStringList(state));
        initialState.put("probabilities", state.getProbabilities());
        executionSteps.add(initialState);

        for (int i = 0; i < steps.size(); i++) {
            CircuitStep step = steps.get(i);
            String gateName = step.getGateName();

            switch (gateName.toUpperCase()) {
                case "CNOT":
                case "CX":
                    state = state.applyControlledGate(QuantumGate.pauliX(), step.getQubits()[0], step.getQubits()[1]);
                    break;
                case "CZ":
                    state = state.applyControlledGate(QuantumGate.pauliZ(), step.getQubits()[0], step.getQubits()[1]);
                    break;
                case "TOFFOLI":
                case "CCX":
                    state = state.applyToffoli(step.getQubits()[0], step.getQubits()[1], step.getQubits()[2]);
                    break;
                case "RX":
                    state = state.applyGate(QuantumGate.rotationX(step.getTheta()), step.getQubits()[0]);
                    break;
                case "RY":
                    state = state.applyGate(QuantumGate.rotationY(step.getTheta()), step.getQubits()[0]);
                    break;
                case "RZ":
                    state = state.applyGate(QuantumGate.rotationZ(step.getTheta()), step.getQubits()[0]);
                    break;
                default:
                    Matrix gate = QuantumGate.getGate(gateName);
                    state = state.applyGate(gate, step.getQubits()[0]);
            }

            Map<String, Object> stepResult = new LinkedHashMap<>();
            stepResult.put("step", i + 1);
            stepResult.put("gate", gateName);
            stepResult.put("qubits", Arrays.toString(step.getQubits()));
            stepResult.put("stateVector", stateToStringList(state));
            stepResult.put("probabilities", state.getProbabilities());
            executionSteps.add(stepResult);
        }

        return executionSteps;
    }

    private List<Map<String, Object>> stateToStringList(QuantumState state) {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, ComplexNumber> amplitudes = state.getComplexAmplitudes();
        for (Map.Entry<String, ComplexNumber> entry : amplitudes.entrySet()) {
            Map<String, Object> amp = new LinkedHashMap<>();
            amp.put("state", entry.getKey());
            amp.put("real", entry.getValue().getReal());
            amp.put("imaginary", entry.getValue().getImaginary());
            amp.put("magnitude", entry.getValue().magnitude());
            amp.put("probability", entry.getValue().magnitudeSquared());
            list.add(amp);
        }
        return list;
    }

    public int getNumQubits() { return numQubits; }

    public List<CircuitStep> getSteps() { return Collections.unmodifiableList(steps); }

    public static class CircuitStep {
        private final String gateName;
        private final int[] qubits;
        private double theta;

        public CircuitStep(String gateName, int... qubits) {
            this.gateName = gateName;
            this.qubits = qubits;
        }

        public CircuitStep(String gateName, double theta, int... qubits) {
            this.gateName = gateName;
            this.qubits = qubits;
            this.theta = theta;
        }

        public String getGateName() { return gateName; }
        public int[] getQubits() { return qubits; }
        public double getTheta() { return theta; }
    }
}
