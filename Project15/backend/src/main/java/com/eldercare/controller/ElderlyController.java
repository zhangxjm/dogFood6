package com.eldercare.controller;

import com.eldercare.dto.ApiResponse;
import com.eldercare.dto.ElderlyDTO;
import com.eldercare.service.ElderlyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elderly")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ElderlyController {
    private final ElderlyService elderlyService;

    @GetMapping
    public ApiResponse<List<ElderlyDTO>> list() {
        return ApiResponse.success(elderlyService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<ElderlyDTO> getById(@PathVariable Long id) {
        ElderlyDTO dto = elderlyService.getById(id);
        if (dto == null) {
            return ApiResponse.error(404, "Not found");
        }
        return ApiResponse.success(dto);
    }

    @PostMapping
    public ApiResponse<ElderlyDTO> create(@RequestBody ElderlyDTO dto) {
        return ApiResponse.success("Created successfully", elderlyService.create(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<ElderlyDTO> update(@PathVariable Long id, @RequestBody ElderlyDTO dto) {
        ElderlyDTO result = elderlyService.update(id, dto);
        if (result == null) {
            return ApiResponse.error(404, "Not found");
        }
        return ApiResponse.success("Updated successfully", result);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        elderlyService.delete(id);
        return ApiResponse.success("Deleted successfully", null);
    }
}
