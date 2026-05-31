package com.silvercare.controller;

import com.silvercare.common.Result;
import com.silvercare.entity.ServicePackage;
import com.silvercare.service.ServicePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/package")
public class ServicePackageController {

    @Autowired
    private ServicePackageService packageService;

    @GetMapping("/list")
    public Result<List<ServicePackage>> list(@RequestParam(required = false) Integer status) {
        return packageService.list(status);
    }

    @GetMapping("/{id}")
    public Result<ServicePackage> getById(@PathVariable Long id) {
        return packageService.getById(id);
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ServicePackage> save(@RequestBody ServicePackage servicePackage) {
        return packageService.save(servicePackage);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ServicePackage> update(@RequestBody ServicePackage servicePackage) {
        return packageService.update(servicePackage);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        return packageService.delete(id);
    }
}
