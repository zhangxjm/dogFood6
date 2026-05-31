package com.ttc.command.controller;

import com.ttc.command.domain.Command;
import com.ttc.command.service.CommandService;
import com.ttc.common.domain.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/command")
@CrossOrigin
public class CommandController {

    @Autowired
    private CommandService commandService;

    @PostMapping("/send")
    public Result<?> sendCommand(@RequestBody Command command) {
        return commandService.sendCommand(command);
    }

    @PostMapping("/execute/{id}")
    public Result<?> executeCommand(@PathVariable Long id) {
        return commandService.executeCommand(id);
    }

    @GetMapping("/status/{id}")
    public Result<?> getCommandStatus(@PathVariable Long id) {
        return commandService.getCommandStatus(id);
    }

    @GetMapping("/list")
    public Result<?> listCommands(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String commandType,
            @RequestParam(required = false) Integer status) {
        return commandService.listCommands(page, size, commandType, status);
    }

    @PostMapping("/update/{id}")
    public Result<?> updateCommandStatus(
            @PathVariable Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String result) {
        return commandService.updateCommandStatus(id, status, result);
    }

    @PostMapping("/batch")
    public Result<?> batchSendCommands(@RequestBody List<Command> commands) {
        return commandService.batchSendCommands(commands);
    }

    @PostMapping("/cancel/{id}")
    public Result<?> cancelCommand(@PathVariable Long id) {
        return commandService.cancelCommand(id);
    }
}
