package com.quantum.core;

import java.util.*;

public class QuantumState {
    private ComplexNumber[] stateVector;
    private final int numQubits;

    public QuantumState(int numQubits) {
        this.numQubits = numQubits;
        int size = 1 << numQubits;
        this.stateVector = new ComplexNumber[size];
        this.stateVector[0] = ComplexNumber.ONE;
        for (int i = 1; i < size; i++) {
            this.stateVector[i] = ComplexNumber.ZERO;
        }
    }

    public QuantumState(int numQubits, ComplexNumber[] stateVector) {
        this.numQubits = numQubits;
        this.stateVector = stateVector.clone();
    }

    public QuantumState applyGate(Matrix gate, int targetQubit) {
        int size = 1 << numQubits;
        ComplexNumber[] newState = new ComplexNumber[size];
        Arrays.fill(newState, ComplexNumber.ZERO);

        for (int i = 0; i < size; i++) {
            int targetBit = (i >> targetQubit) & 1;
            int otherState = i & ~(1 << targetQubit);

            for (int j = 0; j < 2; j++) {
                int newStateIndex = otherState | (j << targetQubit);
                newState[newStateIndex] = newState[newStateIndex].add(
                    stateVector[i].multiply(gate.get(j, targetBit))
                );
            }
        }

        return new QuantumState(numQubits, newState);
    }

    public QuantumState applyControlledGate(Matrix gate, int controlQubit, int targetQubit) {
        int size = 1 << numQubits;
        ComplexNumber[] newState = stateVector.clone();

        for (int i = 0; i < size; i++) {
            if (((i >> controlQubit) & 1) == 1) {
                int targetBit = (i >> targetQubit) & 1;
                int otherState = i & ~(1 << targetQubit);

                ComplexNumber newVal = ComplexNumber.ZERO;
                for (int j = 0; j < 2; j++) {
                    int newStateIndex = otherState | (j << targetQubit);
                    newVal = newVal.add(stateVector[newStateIndex].multiply(gate.get(j, targetBit)));
                }
                newState[i] = newVal;
            }
        }

        return new QuantumState(numQubits, newState);
    }

    public QuantumState applyToffoli(int control1, int control2, int target) {
        return applyControlledGate(QuantumGate.pauliX(), control1, target)
               .applyControlledGate(QuantumGate.pauliX(), control2, target);
    }

    public int measure(int qubit) {
        double probZero = 0;
        int size = 1 << numQubits;

        for (int i = 0; i < size; i++) {
            if (((i >> qubit) & 1) == 0) {
                probZero += stateVector[i].magnitudeSquared();
            }
        }

        Random random = new Random();
        int result = random.nextDouble() < probZero ? 0 : 1;

        ComplexNumber[] newState = new ComplexNumber[size];
        for (int i = 0; i < size; i++) {
            if (((i >> qubit) & 1) == result) {
                newState[i] = stateVector[i];
            } else {
                newState[i] = ComplexNumber.ZERO;
            }
        }

        normalizeState(newState);
        this.stateVector = newState;

        return result;
    }

    public Map<String, Double> getProbabilities() {
        Map<String, Double> probabilities = new LinkedHashMap<>();
        int size = 1 << numQubits;

        for (int i = 0; i < size; i++) {
            String stateLabel = toBinaryString(i, numQubits);
            double prob = stateVector[i].magnitudeSquared();
            if (prob > 1e-10) {
                probabilities.put("|" + stateLabel + "⟩", prob);
            }
        }

        return probabilities;
    }

    public Map<String, Double> getAmplitudes() {
        Map<String, Double> amplitudes = new LinkedHashMap<>();
        int size = 1 << numQubits;

        for (int i = 0; i < size; i++) {
            String stateLabel = toBinaryString(i, numQubits);
            double amp = stateVector[i].magnitude();
            if (amp > 1e-10) {
                amplitudes.put("|" + stateLabel + "⟩", amp);
            }
        }

        return amplitudes;
    }

    public Map<String, ComplexNumber> getComplexAmplitudes() {
        Map<String, ComplexNumber> amplitudes = new LinkedHashMap<>();
        int size = 1 << numQubits;

        for (int i = 0; i < size; i++) {
            String stateLabel = toBinaryString(i, numQubits);
            amplitudes.put("|" + stateLabel + "⟩", stateVector[i]);
        }

        return amplitudes;
    }

    public int measureAll() {
        double[] probabilities = new double[1 << numQubits];
        double total = 0;

        for (int i = 0; i < probabilities.length; i++) {
            probabilities[i] = stateVector[i].magnitudeSquared();
            total += probabilities[i];
        }

        Random random = new Random();
        double r = random.nextDouble() * total;
        double cumulative = 0;

        for (int i = 0; i < probabilities.length; i++) {
            cumulative += probabilities[i];
            if (r <= cumulative) {
                return i;
            }
        }

        return probabilities.length - 1;
    }

    public List<Integer> measureAllQubits() {
        List<Integer> results = new ArrayList<>();
        int measuredState = measureAll();
        for (int i = 0; i < numQubits; i++) {
            results.add((measuredState >> i) & 1);
        }
        return results;
    }

    private void normalizeState(ComplexNumber[] state) {
        double norm = 0;
        for (ComplexNumber c : state) {
            norm += c.magnitudeSquared();
        }
        norm = Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < state.length; i++) {
                state[i] = state[i].multiply(1.0 / norm);
            }
        }
    }

    private String toBinaryString(int value, int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = length - 1; i >= 0; i--) {
            sb.append((value >> i) & 1);
        }
        return sb.toString();
    }

    public int getNumQubits() { return numQubits; }

    public ComplexNumber[] getStateVector() {
        return stateVector.clone();
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        Map<String, ComplexNumber> amplitudes = getComplexAmplitudes();
        boolean first = true;

        for (Map.Entry<String, ComplexNumber> entry : amplitudes.entrySet()) {
            if (entry.getValue().magnitude() > 1e-10) {
                if (!first) {
                    if (entry.getValue().getReal() >= 0) {
                        sb.append(" + ");
                    } else {
                        sb.append(" - ");
                    }
                }
                ComplexNumber amp = entry.getValue();
                if (amp.getReal() < 0 && first) {
                    sb.append("-");
                }
                if (Math.abs(amp.getImaginary()) > 1e-10) {
                    sb.append("(").append(amp.toString()).append(")");
                } else {
                    sb.append(String.format("%.4f", Math.abs(amp.getReal())));
                }
                sb.append(entry.getKey());
                first = false;
            }
        }

        return sb.toString();
    }
}
