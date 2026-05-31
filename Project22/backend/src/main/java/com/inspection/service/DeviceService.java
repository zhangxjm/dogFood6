package com.inspection.service;

import com.inspection.entity.*;
import com.inspection.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeviceService {

    private static final Logger log = LoggerFactory.getLogger(DeviceService.class);

    private final CameraRepository cameraRepository;
    private final EdgeNodeRepository edgeNodeRepository;
    private final VisionModelRepository modelRepository;

    public DeviceService(CameraRepository cameraRepository, EdgeNodeRepository edgeNodeRepository, VisionModelRepository modelRepository) {
        this.cameraRepository = cameraRepository;
        this.edgeNodeRepository = edgeNodeRepository;
        this.modelRepository = modelRepository;
    }

    public List<Camera> getAllCameras() {
        return cameraRepository.findAll();
    }

    public Camera createCamera(Camera camera) {
        return cameraRepository.save(camera);
    }

    public Camera updateCamera(Long id, Camera camera) {
        camera.setId(id);
        return cameraRepository.save(camera);
    }

    public void deleteCamera(Long id) {
        cameraRepository.deleteById(id);
    }

    public List<EdgeNode> getAllEdgeNodes() {
        return edgeNodeRepository.findAll();
    }

    public List<VisionModel> getAllModels() {
        return modelRepository.findAll();
    }

    public VisionModel createModel(VisionModel model) {
        return modelRepository.save(model);
    }

    public void activateModel(Long id) {
        modelRepository.findAll().forEach(m -> {
            m.setActive(m.getId().equals(id));
            modelRepository.save(m);
        });
    }
}
