package com.ttc.command.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ttc.command.domain.Command;
import com.ttc.common.domain.Result;
import java.util.List;

public interface CommandService extends IService<Command> {
    Result<?> sendCommand(Command command);
    Result<?> executeCommand(Long id);
    Result<?> getCommandStatus(Long id);
    Result<?> listCommands(Integer page, Integer size, String commandType, Integer status);
    Result<?> updateCommandStatus(Long id, Integer status, String result);
    Result<?> batchSendCommands(List<Command> commands);
    Result<?> cancelCommand(Long id);
}
