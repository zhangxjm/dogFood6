package com.quantum.service;

import com.quantum.core.*;
import com.quantum.entity.Experiment;
import com.quantum.entity.ExperimentStep;
import com.quantum.repository.ExperimentRepository;
import com.quantum.repository.ExperimentStepRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class QuantumService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ExperimentRepository experimentRepository;

    @Autowired
    private ExperimentStepRepository experimentStepRepository;

    public Map<String, Object> simulateCircuit(Map<String, Object> request) {
        int numQubits = (Integer) request.getOrDefault("numQubits", 2);
        List<Map<String, Object>> gates = (List<Map<String, Object>>) request.getOrDefault("gates", new ArrayList<>());

        QuantumCircuit circuit = new QuantumCircuit(numQubits);

        for (Map<String, Object> gate : gates) {
            String gateName = (String) gate.get("name");
            List<Integer> qubits = (List<Integer>) gate.get("qubits");
            int[] qubitArray = qubits.stream().mapToInt(Integer::intValue).toArray();

            if (gate.containsKey("theta")) {
                double theta = ((Number) gate.get("theta")).doubleValue();
                circuit.addGateWithRotation(gateName, theta, qubitArray);
            } else {
                circuit.addGate(gateName, qubitArray);
            }
        }

        QuantumState finalState = circuit.execute();
        List<Map<String, Object>> executionSteps = circuit.executeWithSteps();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("numQubits", numQubits);
        result.put("finalState", finalState.toString());
        result.put("probabilities", finalState.getProbabilities());
        result.put("stateVector", finalState.getComplexAmplitudes());
        result.put("steps", executionSteps);
        result.put("measurement", finalState.measureAllQubits());

        return result;
    }

    public Map<String, Object> runAlgorithm(String algorithmName, int numQubits, int targetState) {
        QuantumCircuit circuit = QuantumAlgorithms.getAlgorithmCircuit(algorithmName, numQubits, targetState);
        QuantumState finalState = circuit.execute();
        List<Map<String, Object>> executionSteps = circuit.executeWithSteps();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("algorithm", QuantumAlgorithms.getAlgorithmInfo(algorithmName));
        result.put("numQubits", circuit.getNumQubits());
        result.put("finalState", finalState.toString());
        result.put("probabilities", finalState.getProbabilities());
        result.put("stateVector", finalState.getComplexAmplitudes());
        result.put("steps", executionSteps);
        result.put("measurement", finalState.measureAllQubits());

        return result;
    }

    @Transactional
    public Experiment saveExperiment(Map<String, Object> request) {
        Experiment experiment = new Experiment();
        experiment.setName((String) request.getOrDefault("name", "未命名实验"));
        experiment.setDescription((String) request.get("description"));
        experiment.setCircuitType((String) request.getOrDefault("circuitType", "custom"));
        experiment.setNumQubits((Integer) request.getOrDefault("numQubits", 2));

        try {
            experiment.setCircuitData(objectMapper.writeValueAsString(request.get("gates")));
            experiment.setResults(objectMapper.writeValueAsString(request.get("results")));
        } catch (JsonProcessingException e) {
            experiment.setCircuitData("[]");
            experiment.setResults("{}");
        }

        experiment = experimentRepository.save(experiment);

        if (request.containsKey("steps")) {
            List<Map<String, Object>> steps = (List<Map<String, Object>>) request.get("steps");
            for (Map<String, Object> step : steps) {
                ExperimentStep expStep = new ExperimentStep();
                expStep.setExperiment(experiment);
                expStep.setStepNumber((Integer) step.get("step"));
                expStep.setGateName((String) step.get("gate"));
                expStep.setQubits((String) step.get("qubits"));
                try {
                    expStep.setStateVector(objectMapper.writeValueAsString(step.get("stateVector")));
                    expStep.setProbabilities(objectMapper.writeValueAsString(step.get("probabilities")));
                } catch (JsonProcessingException e) {
                    expStep.setStateVector("[]");
                    expStep.setProbabilities("{}");
                }
                experimentStepRepository.save(expStep);
            }
        }

        return experiment;
    }

    public Map<String, Object> getGateInfo(String gateName) {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("name", gateName);
        info.put("symbol", QuantumGate.getGateSymbol(gateName));
        info.put("description", QuantumGate.getGateDescription(gateName));
        info.put("matrix", matrixToList(QuantumGate.getGate(gateName)));

        return info;
    }

    public Map<String, Object> getAllGates() {
        Map<String, Object> gates = new LinkedHashMap<>();

        String[] gateNames = {"X", "Y", "Z", "H", "S", "T", "CNOT", "CZ", "SWAP", "TOFFOLI", "I"};
        List<Map<String, Object>> gateList = new ArrayList<>();

        for (String gateName : gateNames) {
            gateList.add(getGateInfo(gateName));
        }

        gates.put("gates", gateList);
        return gates;
    }

    public Map<String, Object> getAllAlgorithms() {
        Map<String, Object> algorithms = new LinkedHashMap<>();
        List<String> algorithmNames = QuantumAlgorithms.getAvailableAlgorithms();
        List<Map<String, Object>> algorithmList = new ArrayList<>();

        for (String algorithmName : algorithmNames) {
            algorithmList.add(QuantumAlgorithms.getAlgorithmInfo(algorithmName));
        }

        algorithms.put("algorithms", algorithmList);
        return algorithms;
    }

    private List<List<Map<String, Object>>> matrixToList(Matrix matrix) {
        List<List<Map<String, Object>>> result = new ArrayList<>();
        for (int i = 0; i < matrix.getRows(); i++) {
            List<Map<String, Object>> row = new ArrayList<>();
            for (int j = 0; j < matrix.getCols(); j++) {
                Map<String, Object> element = new LinkedHashMap<>();
                element.put("real", matrix.get(i, j).getReal());
                element.put("imaginary", matrix.get(i, j).getImaginary());
                element.put("string", matrix.get(i, j).toString());
                row.add(element);
            }
            result.add(row);
        }
        return result;
    }

    public List<Experiment> getAllExperiments() {
        return experimentRepository.findAll();
    }

    public Optional<Experiment> getExperiment(Long id) {
        return experimentRepository.findById(id);
    }

    public List<ExperimentStep> getExperimentSteps(Long experimentId) {
        return experimentStepRepository.findByExperimentIdOrderByStepNumber(experimentId);
    }

    @Transactional
    public void deleteExperiment(Long id) {
        experimentStepRepository.deleteByExperimentId(id);
        experimentRepository.deleteById(id);
    }
}
